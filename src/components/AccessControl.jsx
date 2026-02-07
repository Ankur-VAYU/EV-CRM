import React, { useEffect, useState } from 'react'
import { useStore } from '../store'
import { UserCheck, UserX, Clock, ShieldCheck, Mail, ShieldAlert, Key, Zap, Trash2, Plus, Eye, Edit3, Trash, Save, Store } from 'lucide-react'

// Helper component for role assignment
function AssignRoleForm({ accounts, roles, onAssign }) {
    const [selectedUser, setSelectedUser] = useState('')
    const [selectedRole, setSelectedRole] = useState('')

    const handleAssign = () => {
        if (selectedUser && selectedRole) {
            onAssign(selectedUser, parseInt(selectedRole))
            setSelectedUser('')
            setSelectedRole('')
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#14452F] focus:border-transparent outline-none"
            >
                <option value="">Select User</option>
                {accounts.map(acc => (
                    <option key={acc.id} value={acc.email}>{acc.name} ({acc.email})</option>
                ))}
            </select>
            <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#14452F] focus:border-transparent outline-none"
            >
                <option value="">Select Role</option>
                {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.role_name}</option>
                ))}
            </select>
            <button
                onClick={handleAssign}
                disabled={!selectedUser || !selectedRole}
                className="bg-[#14452F] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0f3322] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Plus size={18} /> Assign Role
            </button>
        </div>
    )
}

function AccessControl() {
    const {
        accounts, fetchAccounts, updateAccountStatus,
        auditLogs, fetchAuditLogs, resetPassword,
        user, addShowroom, showrooms, deleteShowroom, fetchShowrooms,
        updateAccountManager,
        roles, fetchRoles, addRole, deleteRole,
        permissionMatrix, fetchPermissionMatrix, updatePermission,
        userRoles, fetchUserRoles, assignUserRole, removeUserRole
    } = useStore()

    const [newRole, setNewRole] = useState({ role_name: '', description: '' })
    const [selectedRole, setSelectedRole] = useState(null)
    const [newShowroom, setNewShowroom] = useState('')

    useEffect(() => {
        fetchAccounts()
        fetchAuditLogs()
        fetchRoles()
        fetchPermissionMatrix()
        fetchUserRoles()
        fetchShowrooms()
    }, [fetchAccounts, fetchAuditLogs, fetchRoles, fetchPermissionMatrix, fetchUserRoles, fetchShowrooms])

    const modules = [
        { id: 'dashboard', name: 'Dashboard' },
        { id: 'leads', name: 'Leads' },
        { id: 'raw_leads', name: 'Raw Leads' },
        { id: 'sales', name: 'Sales' },
        { id: 'payments', name: 'Payments' },
        { id: 'expenses', name: 'Expenses' },
        { id: 'inventory', name: 'Inventory' },
        { id: 'customers', name: 'Customers' },
        { id: 'service', name: 'Service' },
        { id: 'rsa', name: 'RSA Track' },
        { id: 'reports', name: 'Reports' },
        { id: 'referrals', name: 'Referrals' },
        { id: 'employees', name: 'Employees' },
        { id: 'access', name: 'Access Control' },
    ]

    const handleCreateRole = async () => {
        if (newRole.role_name.trim()) {
            await addRole(newRole)
            setNewRole({ role_name: '', description: '' })
        }
    }

    const handleAddShowroom = async () => {
        if (!newShowroom.trim()) return;
        const success = await addShowroom(newShowroom.trim());
        if (success) setNewShowroom('');
    }

    const handlePermissionToggle = async (roleId, module, permissionType) => {
        const existing = permissionMatrix.find(p => p.role_id === roleId && p.module === module)

        const newPerms = {
            role_id: roleId,
            module: module,
            can_view: existing?.can_view || 0,
            can_edit: existing?.can_edit || 0,
            can_delete: existing?.can_delete || 0
        }

        if (permissionType === 'view') newPerms.can_view = existing?.can_view === 1 ? 0 : 1
        if (permissionType === 'edit') newPerms.can_edit = existing?.can_edit === 1 ? 0 : 1
        if (permissionType === 'delete') newPerms.can_delete = existing?.can_delete === 1 ? 0 : 1

        await updatePermission(newPerms)
    }

    const getPermission = (roleId, module, type) => {
        const perm = permissionMatrix.find(p => p.role_id === roleId && p.module === module)
        if (!perm) return false
        if (type === 'view') return perm.can_view === 1
        if (type === 'edit') return perm.can_edit === 1
        if (type === 'delete') return perm.can_delete === 1
        return false
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black text-black mb-2">Team Access Control</h2>
                <p className="text-gray-500 text-sm">Manage user accounts, roles, and granular permissions</p>
            </div>

            {/* Account Approvals */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-sans">
                    <UserCheck className="text-[#14452F]" size={20} />
                    Pending Account Approvals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {accounts.filter(a => a.status === 'pending').map(account => (
                        <div key={account.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-bold text-gray-900">{account.name}</p>
                                    <p className="text-sm text-gray-500">{account.email}</p>
                                    <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                                        {account.role}
                                    </span>
                                </div>
                                <Clock className="text-gray-400" size={18} />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateAccountStatus(account.id, 'approved', user.name, user.role)}
                                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => updateAccountStatus(account.id, 'rejected', user.name, user.role)}
                                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                    {accounts.filter(a => a.status === 'pending').length === 0 && (
                        <div className="col-span-2 text-center py-8 text-gray-400">
                            <UserCheck size={48} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm font-bold">No pending approvals</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Role Management */}
            <div className="space-y-6 pb-8 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-sans">
                            <ShieldAlert className="text-[#14452F]" size={20} />
                            Custom Roles
                        </h3>
                        <p className="text-gray-500 text-sm">Create and manage custom access roles</p>
                    </div>
                </div>

                {/* Create New Role */}
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Create New Role</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Role Name (e.g., Sales Manager)"
                            value={newRole.role_name}
                            onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value })}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#14452F] focus:border-transparent outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            value={newRole.description}
                            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#14452F] focus:border-transparent outline-none"
                        />
                        <button
                            onClick={handleCreateRole}
                            className="bg-[#14452F] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0f3322] transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Create Role
                        </button>
                    </div>
                </div>

                {/* Roles List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {roles.map(role => (
                        <div key={role.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-gray-900">{role.role_name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                                </div>
                                <button
                                    onClick={() => deleteRole(role.id)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <button
                                onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                                className="w-full mt-3 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                            >
                                {selectedRole === role.id ? 'Hide Permissions' : 'Manage Permissions'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Permission Matrix */}
            {selectedRole && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-sans">
                        <Key className="text-[#14452F]" size={20} />
                        Permission Matrix: {roles.find(r => r.id === selectedRole)?.role_name}
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Module</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-gray-700 uppercase tracking-wider">View</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-gray-700 uppercase tracking-wider">Edit</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-gray-700 uppercase tracking-wider">Delete</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {modules.map(module => (
                                        <tr key={module.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900">{module.name}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handlePermissionToggle(selectedRole, module.id, 'view')}
                                                    className={`p-2 rounded-lg transition-all ${getPermission(selectedRole, module.id, 'view')
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-400'
                                                        }`}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handlePermissionToggle(selectedRole, module.id, 'edit')}
                                                    className={`p-2 rounded-lg transition-all ${getPermission(selectedRole, module.id, 'edit')
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-100 text-gray-400'
                                                        }`}
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handlePermissionToggle(selectedRole, module.id, 'delete')}
                                                    className={`p-2 rounded-lg transition-all ${getPermission(selectedRole, module.id, 'delete')
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-gray-100 text-gray-400'
                                                        }`}
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* User Role Assignments */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-sans">
                    <UserCheck className="text-[#14452F]" size={20} />
                    User Role Assignments
                </h3>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <AssignRoleForm
                        accounts={accounts.filter(a => a.status === 'approved')}
                        roles={roles}
                        onAssign={(email, roleId) => {
                            assignUserRole(email, roleId)
                        }}
                    />

                    <div className="space-y-2 mt-6">
                        {userRoles.map(ur => (
                            <div key={ur.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-bold text-gray-900">{ur.user_name}</p>
                                    <p className="text-sm text-gray-500">{ur.user_email} → {ur.role_name}</p>
                                </div>
                                <button
                                    onClick={() => removeUserRole(ur.id)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Showroom Management */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-sans">
                    <Store className="text-[#14452F]" size={20} />
                    Manage Showrooms
                </h3>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="New Showroom Name"
                            value={newShowroom}
                            onChange={(e) => setNewShowroom(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#14452F] focus:border-transparent outline-none"
                        />
                        <button
                            onClick={handleAddShowroom}
                            className="bg-[#14452F] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0f3322] transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} /> Add
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {showrooms.map(store => (
                            <div key={store} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="font-bold text-gray-700">{store}</span>
                                <button
                                    onClick={() => deleteShowroom(store)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete Showroom"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Audit Log */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-sans">
                    <Zap className="text-[#14452F]" size={20} />
                    Security Audit Log
                </h3>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Performed By</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Target</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {auditLogs.slice(0, 50).map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{log.action}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{log.performed_by}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{log.target_name || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccessControl
