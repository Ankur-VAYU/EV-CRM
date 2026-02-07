import { create } from 'zustand'

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

export const useStore = create((set, get) => ({
    // Configuration
    API_URL: API_URL,

    // User & Auth
    user: JSON.parse(localStorage.getItem('vayu_session')) || null,
    permissions: JSON.parse(localStorage.getItem('vayu_permissions')) || {},
    accounts: [],
    auditLogs: [],
    rawLeads: [],
    referrals: [],
    employees: [],
    permissionMatrix: [],
    attendance: [],
    leads: [],
    customers: [],
    sales: [],
    inventory: [],
    serviceRecords: [],
    rsaTracking: [],

    fetchAttendance: async (date) => {
        try {
            const query = date ? `?date=${date}` : '';
            const res = await fetch(`${API_URL}/attendance${query}`);
            const data = await res.json();
            set({ attendance: data });
        } catch (error) {
            console.error('Fetch attendance failed', error);
        }
    },

    clockIn: async (employeeId, photo, location) => {
        try {
            const res = await fetch(`${API_URL}/attendance/clock-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: employeeId, photo, location })
            });
            const data = await res.json();
            if (res.ok) {
                // Refresh attendance if viewing today's list
                get().fetchAttendance(new Date().toISOString().split('T')[0]);
                return { success: true, ...data };
            }
            return { success: false, error: data.error };
        } catch (error) {
            return { success: false, error: 'Network Error' };
        }
    },

    clockOut: async (employeeId, photo, location) => {
        try {
            const res = await fetch(`${API_URL}/attendance/clock-out`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: employeeId, photo, location })
            });
            const data = await res.json();
            if (res.ok) {
                get().fetchAttendance(new Date().toISOString().split('T')[0]);
                return { success: true, ...data };
            }
            return { success: false, error: data.error };
        } catch (error) {
            return { success: false, error: 'Network Error' };
        }
    },

    login: async (email, password) => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('vayu_session', JSON.stringify(data.user));
            localStorage.setItem('vayu_permissions', JSON.stringify(data.permissions));
            set({ user: data.user, permissions: data.permissions });

            // Log the login event for security tracking
            fetch(`${API_URL}/audit-logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'USER_LOGIN',
                    target_id: data.user.id,
                    performed_by: data.user.name
                })
            }).catch(err => console.error('Log failed', err));

            return { success: true };
        }
        return { success: false, error: data.error };
    },

    riderLogin: async (phone) => {
        try {
            const res = await fetch(`${API_URL}/rider-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Server error (404/500). Please restart backend.' }));
                return { success: false, error: errorData.error };
            }

            const data = await res.json();
            localStorage.setItem('vayu_session', JSON.stringify(data));
            set({ user: data });
            return { success: true };
        } catch (error) {
            console.error('Rider login failed:', error);
            return { success: false, error: 'Network Error: Cannot reach server. Ensure backend is running.' };
        }
    },

    fetchServiceRecords: async () => {
        try {
            const res = await fetch(`${API_URL}/service-records`);
            if (res.ok) {
                const data = await res.json();
                set({ serviceRecords: data });
            }
        } catch (error) {
            console.error('Failed to fetch service records:', error);
        }
    },

    addServiceRecord: async (recordData) => {
        try {
            const res = await fetch(`${API_URL}/service-records`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recordData)
            });
            if (res.ok) {
                const data = await res.json();
                get().fetchServiceRecords();
                return { success: true, data };
            }
            return { success: false };
        } catch (error) {
            console.error('Failed to add service record:', error);
            return { success: false };
        }
    },

    updateServiceRecord: async (id, updateData) => {
        try {
            const res = await fetch(`${API_URL}/service-records/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            if (res.ok) {
                get().fetchServiceRecords();
                // Refresh affected modules in case of CLOSED
                if (updateData.status === 'CLOSED') {
                    get().fetchSales();
                    get().fetchPayments();
                    get().fetchCustomers();
                    get().fetchInventory();
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update service record:', error);
            return false;
        }
    },

    register: async (userData) => {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (res.ok) return { success: true };
        return { success: false, error: data.error };
    },

    fetchAccounts: async () => {
        const res = await fetch(`${API_URL}/accounts`);
        const data = await res.json();
        set({ accounts: data });
    },

    fetchAuditLogs: async () => {
        const res = await fetch(`${API_URL}/audit-logs`);
        const data = await res.json();
        set({ auditLogs: data });
    },

    fetchRawLeads: async () => {
        try {
            const res = await fetch(`${API_URL}/raw-leads`);
            if (res.ok) {
                const data = await res.json();
                set({ rawLeads: data });
            }
        } catch (error) {
            console.error('Failed to fetch raw leads', error);
        }
    },

    updateAccountStatus: async (id, status) => {
        const { name: adminName, role: adminRole } = get().user || { name: 'Unknown', role: 'unknown' };
        await fetch(`${API_URL}/accounts/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, adminName, adminRole })
        });
        get().fetchAccounts();
        get().fetchAuditLogs();
    },

    updateAccountManager: async (id, managerEmail) => {
        const { name: adminName } = get().user || { name: 'Unknown' };
        await fetch(`${API_URL}/accounts/${id}/manager`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ managerEmail, adminName })
        });
        get().fetchAccounts();
    },

    resetPassword: async (id, newPassword) => {
        const { name: adminName, role: adminRole } = get().user || { name: 'Unknown', role: 'unknown' };
        await fetch(`${API_URL}/accounts/${id}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword, adminName, adminRole })
        });
        get().fetchAuditLogs();
    },

    init: async () => {
        const user = get().user;
        if (!user) return;

        try {
            // Check session and get fresh permissions
            const res = await fetch(`${API_URL}/profile?email=${user.email}`);
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('vayu_session', JSON.stringify(data.user));
                localStorage.setItem('vayu_permissions', JSON.stringify(data.permissions));
                set({ user: data.user, permissions: data.permissions });
            }
        } catch (err) {
            console.error('Init failed', err);
        }

        get().fetchLeads();
        get().fetchAccounts();
        get().fetchAuditLogs();
        get().fetchRawLeads();
        get().fetchReferrals();
        get().fetchEmployees();
        get().fetchPermissionMatrix();
        get().fetchInventory();
        get().fetchPayments();
        get().fetchShowrooms();
        get().fetchExpenses();
    },

    logout: () => {
        localStorage.removeItem('vayu_session');
        localStorage.removeItem('vayu_permissions');
        set({ user: null, permissions: {} });
    },

    // Roles Management
    roles: [],
    fetchRoles: async () => {
        try {
            const res = await fetch(`${API_URL}/roles`);
            if (res.ok) {
                const data = await res.json();
                set({ roles: data });
            }
        } catch (error) {
            console.error('Failed to fetch roles', error);
        }
    },

    addRole: async (roleData) => {
        try {
            const res = await fetch(`${API_URL}/roles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roleData)
            });
            if (res.ok) {
                get().fetchRoles();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add role', error);
            return false;
        }
    },

    deleteRole: async (roleId) => {
        try {
            const res = await fetch(`${API_URL}/roles/${roleId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                get().fetchRoles();
                get().fetchPermissionMatrix();
                get().fetchUserRoles();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to delete role', error);
            return false;
        }
    },

    // Permission Matrix Management
    fetchPermissionMatrix: async () => {
        try {
            const res = await fetch(`${API_URL}/permission-matrix`);
            if (res.ok) {
                const data = await res.json();
                set({ permissionMatrix: data });
            }
        } catch (error) {
            console.error('Failed to fetch permission matrix', error);
        }
    },

    updatePermission: async (permissionData) => {
        try {
            const res = await fetch(`${API_URL}/permission-matrix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(permissionData)
            });
            if (res.ok) {
                get().fetchPermissionMatrix();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update permission', error);
            return false;
        }
    },

    // User Role Assignments
    userRoles: [],
    fetchUserRoles: async () => {
        try {
            const res = await fetch(`${API_URL}/user-roles`);
            if (res.ok) {
                const data = await res.json();
                set({ userRoles: data });
            }
        } catch (error) {
            console.error('Failed to fetch user roles', error);
        }
    },

    assignUserRole: async (userEmail, roleId) => {
        try {
            const res = await fetch(`${API_URL}/user-roles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_email: userEmail, role_id: roleId })
            });
            if (res.ok) {
                get().fetchUserRoles();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to assign user role', error);
            return false;
        }
    },

    removeUserRole: async (userRoleId) => {
        try {
            const res = await fetch(`${API_URL}/user-roles/${userRoleId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                get().fetchUserRoles();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to remove user role', error);
            return false;
        }
    },

    // Data State
    leads: [],
    leadNotes: {},

    fetchLeads: async () => {
        try {
            const res = await fetch(`${API_URL}/leads`);
            if (res.ok) {
                const data = await res.json();
                set({ leads: data });
            }
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        }
    },

    addLead: async (leadData) => {
        try {
            const res = await fetch(`${API_URL}/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            });
            if (res.ok) {
                const resultLead = await res.json();
                set(state => {
                    const exists = state.leads.find(l => l.id === resultLead.id);
                    if (exists) {
                        return {
                            leads: state.leads.map(l => l.id === resultLead.id ? resultLead : l)
                        };
                    }
                    return { leads: [resultLead, ...state.leads] };
                });
                get().fetchAuditLogs();
                get().fetchRawLeads(); // Update raw leads timeline
                return { success: true, data: resultLead };
            }
            return { success: false };
        } catch (error) {
            console.error('Failed to add lead:', error);
            return { success: false, error: error.message };
        }
    },

    updateLeadStatus: async (id, status) => {
        try {
            await fetch(`${API_URL}/leads/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            set(state => ({
                leads: state.leads.map(l => l.id === id ? { ...l, status } : l)
            }));
            get().fetchAuditLogs();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    },

    updateLeadDetails: async (id, updates) => {
        try {
            const res = await fetch(`${API_URL}/leads/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                const updatedLead = await res.json();
                set(state => ({
                    leads: state.leads.map(l => l.id === id ? updatedLead : l)
                }));
                // Also fetch updated notes
                get().fetchLeadNotes(id);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update lead details:', error);
            return false;
        }
    },

    fetchLeadNotes: async (id) => {
        try {
            const res = await fetch(`${API_URL}/leads/${id}/notes`);
            if (res.ok) {
                const notes = await res.json();
                set(state => ({
                    leadNotes: {
                        ...state.leadNotes,
                        [id]: notes
                    }
                }));
            }
        } catch (error) {
            console.error('Failed to fetch lead notes:', error);
        }
    },

    bulkAssignLeads: async (leadIds, assignedTo) => {
        try {
            await Promise.all(leadIds.map(id =>
                fetch(`${API_URL}/leads/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ assigned_to: assignedTo })
                })
            ));

            set(state => ({
                leads: state.leads.map(l => leadIds.includes(l.id) ? { ...l, assigned_to: assignedTo } : l)
            }));
            get().fetchAuditLogs();
            return true;
        } catch (error) {
            console.error('Failed to bulk assign leads:', error);
            return false;
        }
    },

    bulkDeleteLeads: async (leadIds) => {
        try {
            await Promise.all(leadIds.map(id =>
                fetch(`${API_URL}/leads/${id}`, { method: 'DELETE' })
            ));

            set(state => ({
                leads: state.leads.filter(l => !leadIds.includes(l.id))
            }));
            get().fetchAuditLogs();
            return true;
        } catch (error) {
            console.error('Failed to bulk delete leads:', error);
            return false;
        }
    },

    convertLeadToSale: async (leadId, saleData) => {
        try {
            // 1. Create Sale
            const saleRes = await fetch(`${API_URL}/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleData)
            });

            // 2. Create Customer Profile
            const customerRes = await fetch(`${API_URL}/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: saleData.customer_name,
                    phone: saleData.phone,
                    vehicle_registration: saleData.vehicle_reg,
                    purchase_date: new Date().toISOString().split('T')[0],
                    uptime_pass_status: saleData.uptime_pass ? 'active' : 'inactive',
                    showroom: saleData.showroom || 'Main Showroom',
                    // New Fields
                    aadhar_number: saleData.aadhar_number,
                    address: saleData.address,
                    alt_phone: saleData.alt_phone
                })
            });

            if (saleRes.ok && customerRes.ok) {
                const newSale = await saleRes.json();
                const newCustomer = await customerRes.json();

                set(state => ({
                    sales: [newSale, ...state.sales],
                    customers: [newCustomer, ...state.customers]
                }));

                // 3. Update Lead Status to 'converted' & Stage to 'Sold'
                await fetch(`${API_URL}/leads/${leadId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'converted', stage: 'Sold' })
                });

                set(state => ({
                    leads: state.leads.map(l => l.id === leadId ? { ...l, status: 'converted', stage: 'Sold' } : l)
                }));

                // 4. Refresh all affected data to show updated inventory and complete details
                await Promise.all([
                    get().fetchSales(),
                    get().fetchCustomers(),
                    get().fetchInventory()
                ]);

                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to convert lead:', error);
            return false;
        }
    },
    fetchRSATracking: async () => {
        try {
            const res = await fetch(`${API_URL}/rsa`);
            if (res.ok) {
                const data = await res.json();
                set({ rsaTracking: data });
            }
        } catch (error) {
            console.error('Failed to fetch RSA tracking:', error);
        }
    },
    requestRSA: async (customerId, location, issue) => {
        try {
            const res = await fetch(`${API_URL}/rsa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: customerId,
                    location,
                    issue,
                    status: 'requested',
                    dispatch_time: new Date().toISOString()
                })
            });
            if (res.ok) {
                const data = await res.json();
                set(state => ({
                    rsaTracking: [data, ...state.rsaTracking]
                }));
                return { success: true, data };
            }
            return { success: false };
        } catch (error) {
            console.error('RSA request failed:', error);
            return { success: false };
        }
    },
    referrals: [],
    payments: [],
    expenses: [],

    // Fetch functions for individual data
    fetchSales: async () => {
        try {
            const res = await fetch(`${API_URL}/sales`);
            if (res.ok) {
                const data = await res.json();
                set({ sales: data });
            }
        } catch (error) {
            console.error('Failed to fetch sales:', error);
        }
    },

    fetchInventory: async () => {
        try {
            const res = await fetch(`${API_URL}/inventory`);
            if (res.ok) {
                const data = await res.json();
                set({ inventory: data });
            }
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
        }
    },

    addInventoryItem: async (itemData) => {
        try {
            const res = await fetch(`${API_URL}/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
            if (res.ok) {
                get().fetchInventory();
                get().fetchAuditLogs();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add inventory item:', error);
            return false;
        }
    },

    updateInventory: async (id, quantity) => {
        try {
            const res = await fetch(`${API_URL}/inventory/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });
            if (res.ok) {
                set(state => ({
                    inventory: state.inventory.map(i => i.id === id ? { ...i, quantity } : i)
                }));
                get().fetchAuditLogs();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update inventory:', error);
            return false;
        }
    },

    fetchCustomers: async () => {
        try {
            const res = await fetch(`${API_URL}/customers`);
            if (res.ok) {
                const data = await res.json();
                set({ customers: data });
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        }
    },

    fetchReferrals: async () => {
        try {
            const res = await fetch(`${API_URL}/referrals`);
            if (res.ok) {
                const data = await res.json();
                set({ referrals: data });
            }
        } catch (error) {
            console.error('Failed to fetch referrals:', error);
        }
    },

    addReferral: async (referralData) => {
        try {
            const res = await fetch(`${API_URL}/referrals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(referralData)
            });
            if (res.ok) {
                const newReferral = await res.json();
                set(state => ({ referrals: [newReferral, ...state.referrals] }));
                get().fetchAuditLogs();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add referral:', error);
            return false;
        }
    },

    deleteReferral: async (id) => {
        try {
            const res = await fetch(`${API_URL}/referrals/${id}`, { method: 'DELETE' });
            if (res.ok) {
                set(state => ({ referrals: state.referrals.filter(r => r.id !== id) }));
                get().fetchAuditLogs();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to delete referral:', error);
            return false;
        }
    },

    updateReferral: async (id, amount) => {
        try {
            const res = await fetch(`${API_URL}/referrals/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referral_amount: amount })
            });
            if (res.ok) {
                get().fetchReferrals();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update referral:', error);
            return false;
        }
    },

    fetchEmployees: async () => {
        try {
            const res = await fetch(`${API_URL}/employees`);
            if (res.ok) {
                const data = await res.json();
                set({ employees: data });
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    },

    addEmployee: async (employeeData) => {
        try {
            const res = await fetch(`${API_URL}/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(employeeData)
            });
            if (res.ok) {
                const newEmployee = await res.json();
                set(state => ({ employees: [newEmployee, ...state.employees] }));
                get().fetchAuditLogs();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add employee:', error);
            return false;
        }
    },

    deleteEmployee: async (id) => {
        try {
            const res = await fetch(`${API_URL}/employees/${id}`, { method: 'DELETE' });
            if (res.ok) {
                set(state => ({ employees: state.employees.filter(e => e.id !== id) }));
                get().fetchAuditLogs();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to delete employee:', error);
            return false;
        }
    },

    updateEmployeeStatus: async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/employees/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                const data = await res.json();
                set(state => ({
                    employees: state.employees.map(e =>
                        e.id === id ? { ...e, status, inactive_date: data.inactive_date } : e
                    )
                }));
                get().fetchAuditLogs();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update employee status:', error);
            return false;
        }
    },

    fetchPayments: async () => {
        try {
            const res = await fetch(`${API_URL}/payments`);
            if (res.ok) {
                const data = await res.json();
                set({ payments: data });
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        }
    },

    fetchExpenses: async () => {
        try {
            const res = await fetch(`${API_URL}/expenses`);
            const data = await res.json();
            set({ expenses: data });
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        }
    },

    addExpense: async (expenseData) => {
        try {
            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expenseData)
            });
            if (res.ok) {
                get().fetchExpenses();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add expense:', error);
            return false;
        }
    },

    // Initialization
    init: async () => {
        try {
            const user = get().user;
            const query = user ? `?email=${encodeURIComponent(user.email)}&role=${encodeURIComponent(user.role)}` : '';

            const [leads, sales, inventory, customers, serviceRecords, rsa, showroomList, accounts, payments, expenses, employees] = await Promise.all([
                fetch(`${API_URL}/leads${query}`).then(res => res.json()),
                fetch(`${API_URL}/sales`).then(res => res.json()),
                fetch(`${API_URL}/inventory`).then(res => res.json()),
                fetch(`${API_URL}/customers`).then(res => res.json()),
                fetch(`${API_URL}/service-records`).then(res => res.json()),
                fetch(`${API_URL}/rsa`).then(res => res.json()),
                fetch(`${API_URL}/showrooms`).then(res => res.json()),
                fetch(`${API_URL}/accounts`).then(res => res.json()),
                fetch(`${API_URL}/payments`).then(res => res.json()),
                fetch(`${API_URL}/expenses`).then(res => res.json()),
                fetch(`${API_URL}/employees`).then(res => res.json())
            ]);

            set({
                leads,
                sales,
                inventory,
                customers,
                serviceRecords,
                rsaTracking: rsa,
                showrooms: showroomList,
                accounts,
                payments,
                expenses,
                employees,
                referrals: await fetch(`${API_URL}/referrals`).then(res => res.json())
            });
        } catch (error) {
            console.error('Failed to initialize data:', error);
        }
    },



    downloadBackup: async () => {
        try {
            const res = await fetch(`${API_URL}/backup`);
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `VAYU_Backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Backup failed:', error);
        }
    },

    // Showrooms
    showrooms: [], // Initialized empty, populated via API

    fetchShowrooms: async () => {
        try {
            const res = await fetch(`${API_URL}/showrooms`);
            if (res.ok) {
                const data = await res.json();
                set({ showrooms: data });
            }
        } catch (error) {
            console.error('Failed to fetch showrooms:', error);
        }
    },

    addShowroom: async (name) => {
        try {
            const res = await fetch(`${API_URL}/showrooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (res.ok) {
                const { name: newName } = await res.json();
                set(state => ({ showrooms: [...state.showrooms, newName] }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add showroom:', error);
            return false;
        }
    },

    deleteShowroom: async (name) => {
        try {
            const res = await fetch(`${API_URL}/showrooms/${encodeURIComponent(name)}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                set(state => ({ showrooms: state.showrooms.filter(s => s !== name) }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to delete showroom:', error);
            return false;
        }
    },

    // KPIs (Computed locally based on persistent data)
    getKPIs: (startDate, endDate, showroom) => {
        const state = get()

        const filterByDateAndShowroom = (itemDate, itemShowroom) => {
            let pass = true;

            // Date Filter
            if (!itemDate) return false;
            if (startDate && endDate) {
                const d = new Date(itemDate);
                // Fix: Normalize item date to check strictly by date range boundaries
                const dTime = d.getTime();

                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const startTime = start.getTime();

                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                const endTime = end.getTime();

                pass = dTime >= startTime && dTime <= endTime;
            }

            // Showroom Filter
            if (pass && showroom && showroom !== 'All Showrooms') {
                pass = itemShowroom === showroom;
            }

            return pass;
        };

        const filteredSales = state.sales.filter(s => filterByDateAndShowroom(s.sale_date, s.showroom));
        const filteredRevenue = filteredSales.reduce((sum, s) => sum + s.selling_price, 0);

        const filteredServiceRecords = state.serviceRecords.filter(s => filterByDateAndShowroom(s.service_date, s.showroom) && s.status === 'CLOSED');
        const filteredServiceRevenue = filteredServiceRecords.reduce((sum, s) => sum + (Number(s.total_charge) || 0), 0);

        const filteredLeads = state.leads.filter(l => filterByDateAndShowroom(l.created_at, l.showroom));
        const convertedLeads = filteredLeads.filter(l => l.status === 'converted').length;
        const totalLeads = filteredLeads.length;
        const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

        const filteredRSA = state.rsaTracking.filter(r => filterByDateAndShowroom(r.dispatch_time, r.showroom) && r.status === 'completed');
        const avgResponseTime = filteredRSA.length > 0
            ? Math.round(filteredRSA.reduce((sum, r) => {
                if (!r.dispatch_time || !r.arrival_time) return sum;
                const dispatch = new Date(r.dispatch_time);
                const arrival = new Date(r.arrival_time);
                return sum + ((arrival - dispatch) / 60000);
            }, 0) / filteredRSA.length)
            : 0;

        const lowStockItems = state.inventory.filter(i => {
            if (showroom && showroom !== 'All Showrooms') {
                return i.showroom === showroom && i.quantity < i.reorder_level;
            }
            return i.quantity < i.reorder_level;
        }).length;

        return {
            salesVolume: filteredSales.length,
            salesRevenue: filteredRevenue,
            serviceVolume: filteredServiceRecords.length,
            serviceRevenue: filteredServiceRevenue,
            avgResponseTime,
            rsaVolume: filteredRSA.length,
            leadsVolume: totalLeads,
            conversionRate,
            lowStockItems
        };
    },

    getDailyTrend: (metricId, startDate, endDate, showroom) => {
        const state = get();
        if (!startDate || !endDate) return [];

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const days = [];
        let current = new Date(start);
        while (current <= end) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return days.map(d => {
            const dayStart = new Date(d);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(d);
            dayEnd.setHours(23, 59, 59, 999);

            const filter = (dateStr, itemShowroom) => {
                const date = new Date(dateStr);
                let pass = date >= dayStart && date <= dayEnd;
                if (pass && showroom && showroom !== 'All Showrooms') {
                    pass = itemShowroom === showroom;
                }
                return pass;
            };

            let value = 0;
            switch (metricId) {
                case 'salesVolume':
                    value = state.sales.filter(s => filter(s.sale_date, s.showroom)).length;
                    break;
                case 'salesRevenue':
                    value = state.sales.filter(s => filter(s.sale_date, s.showroom)).reduce((sum, s) => sum + s.selling_price, 0);
                    break;
                case 'serviceVolume':
                    value = state.serviceRecords.filter(s => filter(s.service_date, s.showroom) && s.status === 'CLOSED').length;
                    break;
                case 'serviceRevenue':
                    value = state.serviceRecords.filter(s => filter(s.service_date, s.showroom) && s.status === 'CLOSED').reduce((sum, s) => sum + (Number(s.total_charge) || 0), 0);
                    break;
                case 'avgResponseTime':
                    const rsa = state.rsaTracking.filter(r => filter(r.dispatch_time, r.showroom) && r.status === 'completed');
                    value = rsa.length > 0 ? Math.round(rsa.reduce((sum, r) => {
                        if (!r.dispatch_time || !r.arrival_time) return sum;
                        return sum + ((new Date(r.arrival_time) - new Date(r.dispatch_time)) / 60000);
                    }, 0) / rsa.length) : 0;
                    break;
                case 'rsaVolume':
                    value = state.rsaTracking.filter(r => filter(r.dispatch_time, r.showroom) && r.status === 'completed').length;
                    break;
                case 'leadsVolume':
                    value = state.leads.filter(l => filter(l.created_at, l.showroom)).length;
                    break;
                case 'conversionRate':
                    const dailyLeads = state.leads.filter(l => filter(l.created_at, l.showroom));
                    const converted = dailyLeads.filter(l => l.status === 'converted').length;
                    value = dailyLeads.length > 0 ? parseFloat(((converted / dailyLeads.length) * 100).toFixed(1)) : 0;
                    break;
            }

            return {
                date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                value
            };
        });
    }
}))
