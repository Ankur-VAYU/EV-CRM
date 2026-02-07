import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import {
    Users,
    UserPlus,
    Trash2,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    ShieldCheck,
    Search,
    UserCircle2,
    Building2,
    Fingerprint,
    IdCard
} from 'lucide-react'

function EmployeeManagement() {
    const { employees, addEmployee, deleteEmployee, user, fetchEmployees } = useStore()

    useEffect(() => {
        fetchEmployees()
    }, [fetchEmployees])

    const [showAddModal, setShowAddModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [errors, setErrors] = useState({})
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        dob: '',
        aadhar_no: '',
        department: '',
        designation: '',
        manager_name: 'Abnish',
        date_of_joining: new Date().toISOString().split('T')[0]
    })

    const handleDesignationChange = (designation) => {
        setFormData(prev => ({
            ...prev,
            designation,
            manager_name: designation === 'Co-Founder' ? prev.name : prev.manager_name
        }))
    }

    const handleNameChange = (name) => {
        setFormData(prev => ({
            ...prev,
            name,
            manager_name: prev.designation === 'Co-Founder' ? name : prev.manager_name
        }))
    }

    const validate = () => {
        const newErrors = {}
        if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Mobile number must be 10 digits'
        if (!/^\d{12}$/.test(formData.aadhar_no)) newErrors.aadhar_no = 'Aadhar number must be 12 digits'

        const dob = new Date(formData.dob)
        const today = new Date()
        if (dob >= today) newErrors.dob = 'Date of birth must be in the past'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        const success = await addEmployee(formData)
        if (success) {
            setShowAddModal(false)
            setFormData({
                name: '',
                mobile: '',
                email: '',
                dob: '',
                aadhar_no: '',
                department: '',
                designation: '',
                manager_name: 'Abnish',
                date_of_joining: new Date().toISOString().split('T')[0]
            })
            setErrors({})
        }
    }

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <Users className="text-[#14452F]" size={28} /> Team Management
                    </h2>
                    <p className="text-gray-500 font-medium">Manage showroom employees and internal staff records</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-[#14452F] text-white px-6 py-3 rounded-[1.5rem] font-bold hover:bg-emerald-900 transition-all shadow-lg active:scale-95"
                >
                    <UserPlus size={20} /> Add Employee
                </button>
            </div>

            {/* Stats & Search */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm md:col-span-3 flex items-center gap-4">
                    <Search className="text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, ID, or department..."
                        className="flex-1 outline-none text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-[#14452F]/10 p-6 rounded-[2rem] border border-[#14452F]/20 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase text-[#14452F] tracking-widest leading-none mb-2">Total Staff</p>
                    <p className="text-2xl font-black text-[#14452F] leading-none">{employees.length}</p>
                </div>
            </div>

            {/* Employee Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map(emp => (
                    <div key={emp.id} className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500 ${emp.status === 'inactive' ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black text-xl transition-colors ${emp.status === 'inactive' ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                        {emp.name ? emp.name[0] : 'E'}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[#14452F] uppercase tracking-widest leading-none mb-1">{emp.employee_id}</p>
                                        <h4 className="text-lg font-black text-gray-900 leading-tight">{emp.name}</h4>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => useStore.getState().updateEmployeeStatus(emp.id, emp.status === 'active' ? 'inactive' : 'active')}
                                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${emp.status === 'active'
                                            ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                                            : 'bg-vayu-green/10 text-vayu-green hover:bg-vayu-green hover:text-white'
                                            }`}
                                    >
                                        {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => window.confirm('Delete employee record permanently?') && deleteEmployee(emp.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-transparent group-hover:border-gray-100 transition-all">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Department</p>
                                        <p className="text-xs font-black text-gray-800 flex items-center gap-1.5 line-clamp-1">
                                            <Building2 size={12} className="text-indigo-400" /> {emp.department}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-transparent group-hover:border-gray-100 transition-all">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Designation</p>
                                        <p className="text-xs font-black text-gray-800 flex items-center gap-1.5 line-clamp-1">
                                            <Briefcase size={12} className="text-orange-400" /> {emp.designation}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 bg-white border border-gray-100 rounded-[2rem] space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail size={14} className="text-gray-300" />
                                        <span className="text-xs font-bold text-gray-600 truncate">{emp.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone size={14} className="text-gray-300" />
                                        <span className="text-xs font-bold text-gray-600">{emp.mobile}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <IdCard size={14} className="text-gray-300" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Aadhar: {emp.aadhar_no}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between px-2">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-500">Joined: {new Date(emp.date_of_joining).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        {emp.status === 'inactive' && emp.inactive_date && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                                                <span className="text-[9px] font-black text-red-500 uppercase">Inactive: {new Date(emp.inactive_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <ShieldCheck size={12} className={emp.status === 'active' ? 'text-[#14452F]' : 'text-gray-300'} />
                                        <span className={`text-[10px] font-black uppercase ${emp.status === 'active' ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {emp.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredEmployees.length === 0 && (
                <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users size={40} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No team members yet</h3>
                    <p className="text-gray-500 font-medium max-w-xs mx-auto mb-8">Start by adding your first employee to build your showroom directory.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#14452F] text-white px-8 py-3 rounded-[1.5rem] font-black uppercase tracking-wider shadow-lg hover:bg-emerald-900 transition-all"
                    >
                        Register New Staff
                    </button>
                </div>
            )}

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">New Employee Entry</h3>
                                <p className="text-sm text-gray-500 font-medium">Record professional and personal data for staff</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-400 text-3xl"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Basic Info */}
                                <div className="space-y-4 md:col-span-2">
                                    <h5 className="text-[10px] font-black text-[#14452F] uppercase tracking-[0.2em] flex items-center gap-2">
                                        <UserCircle2 size={12} /> Personal Details
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Full Name</label>
                                            <input
                                                required
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#14452F] focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-bold text-sm"
                                                placeholder="Amit Kumar"
                                                value={formData.name}
                                                onChange={e => handleNameChange(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Mobile Number</label>
                                            <input
                                                required
                                                className={`w-full bg-gray-50 border-2 ${errors.mobile ? 'border-red-500' : 'border-transparent'} focus:border-[#14452F] focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-bold text-sm`}
                                                placeholder="10-digit Mobile"
                                                value={formData.mobile}
                                                onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').substring(0, 10) })}
                                            />
                                            {errors.mobile && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.mobile}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">E-mail Address</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#14452F] focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-bold text-sm"
                                                placeholder="amit@vayu.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Date of Birth</label>
                                            <input
                                                required
                                                type="date"
                                                className={`w-full bg-gray-50 border-2 ${errors.dob ? 'border-red-500' : 'border-transparent'} focus:border-[#14452F] focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-bold text-sm`}
                                                value={formData.dob}
                                                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                            />
                                            {errors.dob && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.dob}</p>}
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Aadhar Number</label>
                                            <input
                                                required
                                                className={`w-full bg-gray-50 border-2 ${errors.aadhar_no ? 'border-red-500' : 'border-transparent'} focus:border-[#14452F] focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-bold text-sm`}
                                                placeholder="12-digit Aadhar"
                                                value={formData.aadhar_no}
                                                onChange={e => setFormData({ ...formData, aadhar_no: e.target.value.replace(/\D/g, '').substring(0, 12) })}
                                            />
                                            {errors.aadhar_no && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.aadhar_no}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Info */}
                                <div className="space-y-4 md:col-span-2 pt-4">
                                    <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Briefcase size={12} /> Employment Record
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Department</label>
                                            <select
                                                required
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#14452F] focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-bold text-sm"
                                                value={formData.department}
                                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            >
                                                <option value="">Select Dept</option>
                                                <option value="Sales">Sales</option>
                                                <option value="Service">Service / Repairs</option>
                                                <option value="Accounts">Finance & Accounts</option>
                                                <option value="Operations">Operations</option>
                                                <option value="Admin">Administration</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Designation</label>
                                            <select
                                                required
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#14452F] focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-bold text-sm"
                                                value={formData.designation}
                                                onChange={e => handleDesignationChange(e.target.value)}
                                            >
                                                <option value="">Select Designation</option>
                                                <option value="Associate">Associate</option>
                                                <option value="Senior Associate">Senior Associate</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Co-Founder">Co-Founder</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Reporting Manager</label>
                                            <select
                                                required
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#14452F] focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-bold text-sm"
                                                value={formData.manager_name}
                                                onChange={e => setFormData({ ...formData, manager_name: e.target.value })}
                                            >
                                                <option value="Abnish">Abnish (Admin)</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={emp.name}>{emp.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Date of Joining</label>
                                            <input
                                                required
                                                type="date"
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#14452F] focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-bold text-sm"
                                                value={formData.date_of_joining}
                                                onChange={e => setFormData({ ...formData, date_of_joining: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-black uppercase tracking-widest hover:bg-gray-200 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 rounded-2xl bg-[#14452F] text-white font-black uppercase tracking-widest hover:bg-emerald-900 transition-all shadow-xl active:scale-95 text-sm"
                                >
                                    Confirm Registration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EmployeeManagement
