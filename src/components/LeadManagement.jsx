import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import { Plus, Phone, User, ShoppingCart, X, Pencil, Clock, Filter, Trash2, Upload, Users, CheckSquare, Square, Download, Search } from 'lucide-react'

function DuplicateWarningModal({ data, onClose }) {
    if (!data) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-amber-50 p-6 border-b border-amber-100 flex items-start gap-4">
                    <div className="bg-amber-100 p-3 rounded-full">
                        <Users className="text-amber-600" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-amber-900">Duplicate Lead Detected</h3>
                        <p className="text-amber-700 text-sm mt-1">
                            This phone number is already registered in the system.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-auto text-amber-400 hover:text-amber-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-gray-500 text-sm font-medium">Phone Number</span>
                            <span className="font-mono font-bold text-gray-900 text-lg">{data.phone}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-black tracking-wider">Customer Name</span>
                                <p className="font-bold text-gray-900">{data.name}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-black tracking-wider">Frequency</span>
                                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg mt-1">
                                    {data.frequency} times
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-black tracking-wider">Source</span>
                                <p className="font-medium text-gray-700">{data.source}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-black tracking-wider">Showroom</span>
                                <p className="font-medium text-gray-700">{data.showroom}</p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                            <span className="text-xs text-gray-400 uppercase font-black tracking-wider">Assigned To</span>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                    {data.assigned_to ? data.assigned_to[0].toUpperCase() : '?'}
                                </div>
                                <p className="font-medium text-gray-700 text-sm">
                                    {data.assigned_to || 'Unassigned'}
                                </p>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                            <span className="text-xs text-gray-400 uppercase font-black tracking-wider">Original Creator (Filled By)</span>
                            <p className="font-medium text-gray-700 text-sm mt-1">
                                {data.filled_by || 'Unknown'}
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-400">
                            First added on {new Date(data.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-green-600 mt-2 font-bold">
                            ✔ The lead has been updated with your recent notes.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-amber-200"
                    >
                        Acknowledge
                    </button>
                </div>
            </div>
        </div>
    );
}

function LeadManagement() {
    const { user, leads, addLead, updateLeadStatus, convertLeadToSale, showrooms, accounts, updateLeadDetails, leadNotes, fetchLeadNotes, bulkAssignLeads, bulkDeleteLeads, inventory, fetchLeads } = useStore()
    const isAdmin = ['admin', 'super_admin'].includes(user?.role)
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState(null)
    const [showConvertModal, setShowConvertModal] = useState(null)
    const [selectedLeads, setSelectedLeads] = useState([])
    const [isBulkAssigning, setIsBulkAssigning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        source: 'walk-in',
        notes: '',
        showroom: 'Main Showroom',
        assigned_to: '',
        stage: 'Price discussion',
        next_call_date: '',
        current_call_date: '',
        filled_by: 'Customer',
        referral_code: ''
    })
    const [duplicateData, setDuplicateData] = useState(null)
    const [vehicleSearch, setVehicleSearch] = useState('')
    const [saleData, setSaleData] = useState({
        vehicle_reg: '',
        selling_price: 38000,
        payment_mode: 'cash',
        uptime_pass: true,
        vehicle_inventory_sku: '',
        sale_date: new Date().toISOString().split('T')[0], // Today's date
        // Cash Fields
        cash_upi_amount: 0,
        cash_upi_account: 'Main',
        cash_cash_amount: 0,
        cash_collected_by: '',
        // Finance Fields
        finance_down_payment: 0,
        finance_dp_cash: 0,
        finance_dp_cash_by: '',
        finance_dp_upi: 0,
        finance_dp_upi_account: 'Main',
        finance_loan_number: '',
        finance_emi: 0,
        finance_tenure: 12,
        finance_schedule: 'Monthly',
        finance_start_date: '',
        finance_bank: '',
        // Customer Extras
        aadhar_number: '',
        address: '',
        alt_phone: '',
        // Battery
        battery_type: 'Fixed battery',
        battery_id: '',
        battery_inventory_sku: '', // If fixed
        battery_driver_id: ''
    })
    const [filters, setFilters] = useState({
        assigned_to: '',
        stage: '',
        source: '',
        date_from: '',
        date_to: '',
        showroom: ''
    })

    const filteredLeads = leads.filter(lead => {
        let dateMatch = true;
        if (lead.next_call_date) {
            const nextCall = lead.next_call_date.split('T')[0];
            if (filters.date_from && nextCall < filters.date_from) dateMatch = false;
            if (filters.date_to && nextCall > filters.date_to) dateMatch = false;
        } else if (filters.date_from || filters.date_to) {
            dateMatch = false;
        }

        return (
            (!filters.assigned_to || lead.assigned_to === filters.assigned_to) &&
            (!filters.stage || lead.stage === filters.stage) &&
            (!filters.source || (lead.source && lead.source.toLowerCase() === filters.source.toLowerCase())) &&
            dateMatch &&
            (!filters.showroom || lead.showroom === filters.showroom)
        )
    })

    const downloadCSV = () => {
        const headers = ['Name', 'Phone', 'Stage', 'Source', 'Assignee', 'Last Call', 'Next Call', 'Showroom', 'Filled By', 'Referral Code', 'Notes']
        const rows = filteredLeads.map(l => [
            l.name,
            l.phone,
            l.stage,
            l.source || 'walk-in',
            l.assigned_to || 'Unassigned',
            l.current_call_date ? new Date(l.current_call_date).toLocaleDateString() : '-',
            l.next_call_date ? new Date(l.next_call_date).toLocaleDateString() : '-',
            l.showroom || 'Main Showroom',
            l.filled_by || 'Customer',
            l.referral_code || '-',
            `"${(l.notes || '').replace(/"/g, '""')}"`
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `leads_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            source: 'walk-in',
            notes: '',
            showroom: 'Main Showroom',
            assigned_to: '',
            stage: 'Price discussion',
            next_call_date: '',
            current_call_date: '',
            filled_by: 'Customer',
            referral_code: ''
        })
        setEditId(null)
    }

    // Fetch leads on component mount
    useEffect(() => {
        fetchLeads()
    }, [])

    const handleEdit = (lead) => {
        setFormData({
            name: lead.name,
            phone: lead.phone,
            source: lead.source || 'walk-in',
            notes: lead.notes || '',
            showroom: lead.showroom || 'Main Showroom',
            assigned_to: lead.assigned_to || '',
            stage: lead.stage || 'Price discussion',
            next_call_date: lead.next_call_date ? lead.next_call_date.split('T')[0] : '', // Handle ISO strings
            current_call_date: lead.current_call_date ? lead.current_call_date.split('T')[0] : '',
            filled_by: lead.filled_by || 'Customer',
            referral_code: lead.referral_code || ''
        })
        setEditId(lead.id)
        setShowForm(true)
        fetchLeadNotes(lead.id)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation: 10 digit phone number
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            alert("Phone number must be exactly 10 digits.");
            return;
        }

        if (editId) {
            updateLeadDetails(editId, formData)
            resetForm()
            setShowForm(false)
        } else {
            const result = await addLead({ ...formData, status: 'new', filled_by: user.name || user.email })

            if (result.success && result.data?.isDuplicate) {
                setDuplicateData(result.data.existingLeadData);
            }

            resetForm()
            setShowForm(false)
        }
    }

    const handleConvert = async (e) => {
        e.preventDefault()
        if (isSubmitting) return
        setIsSubmitting(true)

        try {

            // Strict Validation for Registration Number/Inventory
            if (!saleData.vehicle_inventory_sku) {
                alert("Please select a Vehicle from Inventory.");
                return;
            }

            // Strict Validation for Alt Phone
            if (saleData.alt_phone && !/^\d{10}$/.test(saleData.alt_phone)) {
                alert("Alternate Phone number must be exactly 10 digits.");
                return;
            }

            // Payment Validation: Selling Price must match sum of payments
            let totalPaymentReceived = 0;
            let paymentBreakdown = '';

            if (saleData.payment_mode === 'cash') {
                totalPaymentReceived = (parseFloat(saleData.cash_upi_amount) || 0) + (parseFloat(saleData.cash_cash_amount) || 0);
                paymentBreakdown = `UPI: ₹${saleData.cash_upi_amount || 0} + Cash: ₹${saleData.cash_cash_amount || 0} = ₹${totalPaymentReceived}`;
            } else if (saleData.payment_mode === 'finance') {
                const downPayment = (parseFloat(saleData.finance_down_payment) || 0);
                const loanAmount = (parseFloat(saleData.selling_price) || 0) - downPayment;
                totalPaymentReceived = parseFloat(saleData.selling_price) || 0; // Finance means full price is covered

                // Validate down payment breakdown if provided
                const dpCash = (parseFloat(saleData.finance_dp_cash) || 0);
                const dpUpi = (parseFloat(saleData.finance_dp_upi) || 0);
                if (dpCash + dpUpi > 0 && Math.abs((dpCash + dpUpi) - downPayment) > 0.01) {
                    alert(`Down Payment breakdown mismatch!\n\nDown Payment: ₹${downPayment}\nCash: ₹${dpCash} + UPI: ₹${dpUpi} = ₹${dpCash + dpUpi}\n\nPlease ensure the breakdown matches the down payment amount.`);
                    return;
                }

                paymentBreakdown = `Down Payment: ₹${downPayment} + Loan: ₹${loanAmount} = ₹${totalPaymentReceived}`;
            } else if (saleData.payment_mode === 'upi') {
                totalPaymentReceived = parseFloat(saleData.selling_price) || 0;
                paymentBreakdown = `UPI: ₹${totalPaymentReceived}`;
            }

            const sellingPrice = parseFloat(saleData.selling_price) || 0;

            // Allow small rounding differences (0.01)
            if (saleData.payment_mode === 'cash' && Math.abs(totalPaymentReceived - sellingPrice) > 0.01) {
                alert(`Payment amount mismatch!\n\nSelling Price: ₹${sellingPrice}\nTotal Payment Received: ₹${totalPaymentReceived}\n\n${paymentBreakdown}\n\nPlease ensure the payment amounts add up to the selling price.`);
                return;
            }

            let referralValue = 'none';
            if (showConvertModal.source === 'employee') {
                referralValue = showConvertModal.assigned_to || 'unassigned';
            } else if (showConvertModal.source === 'referral') {
                referralValue = showConvertModal.referral_code || 'none';
            }

            const success = await convertLeadToSale(showConvertModal.id, {
                ...saleData,
                customer_name: showConvertModal.name,
                phone: showConvertModal.phone,
                showroom: showConvertModal.showroom,
                salesperson: user.name, // Ops guy filling the form
                referral: referralValue
            })

            if (success) {
                setShowConvertModal(null)
                // Reset complex state
                setSaleData({
                    vehicle_reg: '',
                    selling_price: 38000,
                    payment_mode: 'cash',
                    uptime_pass: true,
                    vehicle_inventory_sku: '',
                    sale_date: new Date().toISOString().split('T')[0],
                    cash_upi_amount: 0, cash_cash_amount: 0, cash_collected_by: '',
                    finance_down_payment: 0, finance_dp_cash: 0, finance_dp_cash_by: '', finance_dp_upi: 0,
                    finance_loan_number: '', finance_emi: 0, finance_tenure: 12, finance_schedule: 'Monthly', finance_start_date: '', finance_bank: '',
                    aadhar_number: '', address: '', alt_phone: '',
                    battery_type: 'Fixed battery', battery_id: '', battery_inventory_sku: '', battery_driver_id: ''
                })
            }
        } catch (error) {
            console.error('Conversion failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStageChange = (lead, newStage) => {
        // LOCK: If lead is ALREADY sold, prevent non-admins from changing it OUT of sold
        if (lead.stage === 'Sold' && !['admin', 'super_admin'].includes(user?.role)) {
            alert("This lead is already SOLD. Only Admins can modify it further.");
            return;
        }

        if (newStage === 'Sold') {
            // Trigger Modal (Anyone can do this now)
            setSaleData(prev => ({ ...prev, vehicle_reg: '' }))
            setShowConvertModal(lead);
        } else {
            updateLeadDetails(lead.id, { stage: newStage });
        }
    }

    const handleStatusChange = (lead, newStatus) => {
        // LOCK: If lead is ALREADY converted, prevent non-admins from changing it
        if (lead.status === 'converted' && !['admin', 'super_admin'].includes(user?.role)) {
            alert("This lead is locked as CONVERTED. Only Admins can modify it further.");
            return;
        }

        if (newStatus === 'converted') {
            // Trigger Modal (Anyone can do this now)
            setSaleData(prev => ({ ...prev, vehicle_reg: '' }))
            setShowConvertModal(lead);
        } else {
            updateLeadStatus(lead.id, newStatus);
        }
    }

    const toggleSelect = (id) => {
        setSelectedLeads(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])
    }

    const toggleSelectAll = () => {
        if (selectedLeads.length === leads.length) {
            setSelectedLeads([])
        } else {
            setSelectedLeads(leads.map(l => l.id))
        }
    }

    const handleBulkAssign = async (email) => {
        if (!email) return
        await bulkAssignLeads(selectedLeads, email)
        setIsBulkAssigning(false)
        setSelectedLeads([])
    }

    const handleBulkDelete = async () => {
        if (confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
            await bulkDeleteLeads(selectedLeads)
            setSelectedLeads([])
        }
    }

    const handleBulkUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            const newLeads = lines.slice(1).map(line => {
                const [name, phone, source] = line.split(',');
                return {
                    name: name?.trim(),
                    phone: phone?.trim(),
                    source: source?.trim() || 'walk-in',
                    status: 'new',
                    stage: 'Price discussion',
                    showroom: user?.showroom || 'Main Showroom'
                };
            }).filter(l => l.name && l.phone);

            newLeads.forEach(lead => addLead(lead));
            alert(`Uploaded ${newLeads.length} leads successfully.`);
        };
        reader.readAsText(file);
    };

    const downloadSampleCSV = () => {
        const csvContent = "Name,Phone,Source\nJohn Doe,9876543210,walk-in\nJane Smith,9123456780,referral";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "lead_upload_sample.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
                    <p className="text-gray-600">Track and convert potential customers</p>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={downloadCSV}
                                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors"
                            >
                                <Download size={16} /> Export CSV
                            </button>
                            <button
                                onClick={downloadSampleCSV}
                                className="text-gray-500 hover:text-vayu-green text-xs font-bold underline"
                            >
                                Sample CSV
                            </button>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".csv, .txt"
                                    onChange={handleBulkUpload}
                                    className="hidden"
                                    id="bulk-upload-input"
                                />
                                <label
                                    htmlFor="bulk-upload-input"
                                    className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl font-bold transition-all shadow-sm text-sm"
                                >
                                    <Upload size={18} /> Bulk Upload
                                </label>
                            </div>
                        </div>
                    )}
                    {!isAdmin && ['manager'].includes(user?.role) && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={downloadSampleCSV}
                                className="text-gray-500 hover:text-vayu-green text-xs font-bold underline"
                            >
                                Sample CSV
                            </button>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".csv, .txt"
                                    onChange={handleBulkUpload}
                                    className="hidden"
                                    id="bulk-upload-input"
                                />
                                <label
                                    htmlFor="bulk-upload-input"
                                    className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl font-bold transition-all shadow-sm text-sm"
                                >
                                    <Upload size={18} /> Bulk Upload
                                </label>
                            </div>
                        </div>
                    )}
                    <button onClick={() => { setShowForm(!showForm); resetForm(); }} className="btn-primary flex items-center gap-2">
                        <Plus size={20} /> Add Lead
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">{editId ? 'Update Lead Details' : 'New Lead Entry'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Customer Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Amit Singh"
                                className="w-full bg-transparent border-none p-0 text-sm font-bold placeholder:text-gray-300 focus:ring-0"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="e.g. 9876543210"
                                className="w-full bg-transparent border-none p-0 text-sm font-bold placeholder:text-gray-300 focus:ring-0"
                                value={formData.phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setFormData({ ...formData, phone: val });
                                }}
                                required
                            />
                            {formData.phone && formData.phone.length !== 10 && (
                                <p className="text-[10px] text-red-500 font-bold mt-1">Must be exactly 10 digits</p>
                            )}
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Lead Source</label>
                            <select
                                className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            >
                                <option value="walk-in">Walk-in</option>
                                <option value="delivery-hub">Delivery Hub</option>
                                <option value="referral">Referral</option>
                                <option value="campaign">Campaign</option>
                            </select>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Assign Showroom</label>
                            <select
                                className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0"
                                value={formData.showroom}
                                onChange={(e) => setFormData({ ...formData, showroom: e.target.value })}
                            >
                                {Array.isArray(showrooms) && showrooms.filter(s => s !== 'All Showrooms').map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Lead filled by</label>
                            <select
                                className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0"
                                value={formData.filled_by}
                                onChange={(e) => setFormData({ ...formData, filled_by: e.target.value })}
                            >
                                <option value="Customer">Customer</option>
                                <option value="Employee">Employee</option>
                                <option value="Referral">Referral</option>
                            </select>
                        </div>

                        {formData.filled_by === 'Employee' && (
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Assign To (Email)</label>
                                <select
                                    className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0"
                                    value={formData.assigned_to}
                                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                >
                                    <option value="">Select Employee</option>
                                    {Array.isArray(accounts) && accounts.map(acc => (
                                        <option key={acc.id} value={acc.email}>{acc.name} ({acc.email})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {formData.filled_by === 'Referral' && (
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Referral Code</label>
                                <input
                                    type="text"
                                    placeholder="Enter Code"
                                    className="w-full bg-transparent border-none p-0 text-sm font-bold placeholder:text-gray-300 focus:ring-0"
                                    value={formData.referral_code}
                                    onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                                />
                            </div>
                        )}



                        <div className="col-span-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                                {editId ? 'Add New Interaction Note' : 'Initial Note'}
                            </label>
                            <input
                                type="text"
                                placeholder="Enter details about this interaction..."
                                className="w-full bg-transparent border-none p-0 text-sm font-bold placeholder:text-gray-300 focus:ring-0"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        {/* Interaction History Log */}
                        {editId && leadNotes[editId] && (
                            <div className="col-span-2 bg-gray-50 border border-gray-100 rounded-xl p-4 max-h-40 overflow-y-auto">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-3 flex items-center gap-1">
                                    <Clock size={12} /> Interaction History
                                </label>
                                <div className="space-y-3">
                                    {leadNotes[editId].map((note) => (
                                        <div key={note.id} className="relative pl-3 border-l-2 border-gray-200">
                                            <p className="text-xs font-bold text-gray-800">{note.note}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                {new Date(note.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                    {leadNotes[editId].length === 0 && (
                                        <p className="text-xs text-gray-400 italic">No previous notes logged.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="col-span-2 flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-black text-white rounded-xl font-bold shadow-lg hover:bg-gray-900 transition-all active:scale-95"
                            >
                                {editId ? 'Update Lead' : 'Add Lead'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Convert Modal */}
            {showConvertModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowConvertModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-3 mb-6 bg-vayu-green/10 p-4 rounded-xl">
                            <div className="w-12 h-12 bg-vayu-green text-vayu-yellow rounded-xl flex items-center justify-center">
                                <ShoppingCart size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">New Sale Entry</h3>
                                <p className="text-xs text-gray-600 font-medium">Converting Lead: <span className="font-bold text-black">{showConvertModal.name}</span> ({showConvertModal.phone})</p>
                            </div>
                        </div>

                        <form onSubmit={handleConvert} className="space-y-8">

                            {/* Section 1: Vehicle & Pricing */}
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">1. Vehicle & Price</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Select Vehicle (Inventory)</label>

                                        <div className="relative mb-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search by Name, SKU, Chasis..."
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-bold focus:ring-1 focus:ring-vayu-green outline-none"
                                                value={vehicleSearch}
                                                onChange={(e) => setVehicleSearch(e.target.value)}
                                            />
                                        </div>

                                        <select
                                            className="input-field"
                                            value={saleData.vehicle_inventory_sku}
                                            onChange={(e) => {
                                                const sku = e.target.value;
                                                const item = inventory.find(i => i.sku === sku);
                                                setSaleData({
                                                    ...saleData,
                                                    vehicle_inventory_sku: sku,
                                                    vehicle_sku: sku,
                                                    vehicle_model: item ? item.item_name : '',
                                                    vehicle_reg: item ? (item.unique_no || item.chasis_no || item.item_name) : '' // Auto-fill with Unique No/Chasis if available
                                                })
                                            }}
                                            required
                                        >
                                            <option value="">-- Select Vehicle --</option>
                                            {Array.isArray(inventory) && inventory.filter(i => {
                                                const matchesSearch = !vehicleSearch ||
                                                    (i.item_name?.toLowerCase().includes(vehicleSearch.toLowerCase())) ||
                                                    (i.sku?.toLowerCase().includes(vehicleSearch.toLowerCase())) ||
                                                    (i.unique_no?.toLowerCase().includes(vehicleSearch.toLowerCase())) ||
                                                    (i.chasis_no?.toLowerCase().includes(vehicleSearch.toLowerCase()));

                                                const isVehicle = i.item_type?.toLowerCase().includes('vehicle') || i.item_type?.toLowerCase().includes('scooty') || i.item_type?.toLowerCase().includes('ev') || i.item_name?.toLowerCase().includes('vehicle') || i.item_name?.toLowerCase().includes('ev');

                                                return matchesSearch && i.quantity > 0 && isVehicle;
                                            }).map(item => (
                                                <option
                                                    key={item.sku}
                                                    value={item.sku}
                                                    disabled={item.status && item.status !== 'available'}
                                                    className={item.status && item.status !== 'available' ? 'text-red-500 bg-gray-50' : ''}
                                                >
                                                    {item.item_name} [{item.unique_no || item.chasis_no || 'N/A'}] (Qty: {item.quantity}) {item.status && item.status !== 'available' ? `[SOLD: ${item.status}]` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[9px] text-red-500 font-medium">Selecting will deduct 1 from inventory.</p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Selling Price (₹)</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={saleData.selling_price}
                                            onChange={(e) => setSaleData({ ...saleData, selling_price: Number(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Sale Date</label>
                                        <input
                                            type="date"
                                            className="input-field"
                                            value={saleData.sale_date}
                                            onChange={(e) => setSaleData({ ...saleData, sale_date: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pt-6">
                                        <input
                                            type="checkbox"
                                            id="up"
                                            className="w-4 h-4 text-vayu-green rounded focus:ring-vayu-green"
                                            checked={saleData.uptime_pass}
                                            onChange={(e) => setSaleData({ ...saleData, uptime_pass: e.target.checked })}
                                        />
                                        <label htmlFor="up" className="text-xs font-bold text-gray-700">Add Uptime Pass (₹499/mo)</label>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Customer Extras */}
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">2. Customer Details</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Aadhar Number</label>
                                        <input
                                            type="text"
                                            placeholder="XXXX XXXX XXXX"
                                            className="input-field"
                                            value={saleData.aadhar_number}
                                            onChange={(e) => setSaleData({ ...saleData, aadhar_number: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Alternate Phone</label>
                                        <input
                                            type="tel"
                                            placeholder="10 Digits"
                                            maxLength="10"
                                            className="input-field"
                                            value={saleData.alt_phone}
                                            onChange={(e) => setSaleData({ ...saleData, alt_phone: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Full Address</label>
                                        <textarea
                                            rows="2"
                                            className="input-field"
                                            placeholder="House No, Street, City..."
                                            value={saleData.address}
                                            onChange={(e) => setSaleData({ ...saleData, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Battery Details */}
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">3. Battery Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Battery Type</label>
                                        <select
                                            className="input-field"
                                            value={saleData.battery_type}
                                            onChange={(e) => setSaleData({ ...saleData, battery_type: e.target.value })}
                                        >
                                            <option value="Fixed battery">Fixed Battery</option>
                                            <option value="Battery Smart">Battery Smart</option>
                                            <option value="Indofast">Indofast</option>
                                        </select>
                                    </div>

                                    {saleData.battery_type === 'Fixed battery' ? (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Select Battery (Inventory)</label>
                                            <select
                                                className="input-field"
                                                value={saleData.battery_inventory_sku}
                                                onChange={(e) => {
                                                    const sku = e.target.value;
                                                    const item = inventory.find(i => i.sku === sku);
                                                    setSaleData({
                                                        ...saleData,
                                                        battery_inventory_sku: sku,
                                                        battery_sku: sku,
                                                        battery_id: item ? item.item_name : ''
                                                    })
                                                }}
                                            >
                                                <option value="">-- Select Battery --</option>
                                                {Array.isArray(inventory) && inventory.filter(i => i.quantity > 0 && (i.item_type?.toLowerCase().includes('battery') || i.item_name?.toLowerCase().includes('battery'))).map(item => (
                                                    <option key={item.sku} value={item.sku}>
                                                        {item.item_name} [{item.unique_no || item.battery_no || 'N/A'}] (Qty: {item.quantity})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Driver ID</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="Enter Driver ID"
                                                value={saleData.battery_driver_id}
                                                onChange={(e) => setSaleData({ ...saleData, battery_driver_id: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 4: Payment Details */}
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">4. Payment & Finance</h4>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Mode of Sale</label>
                                        <select
                                            className="input-field bg-white"
                                            value={saleData.payment_mode}
                                            onChange={(e) => setSaleData({ ...saleData, payment_mode: e.target.value })}
                                        >
                                            <option value="cash">Cash / Full Payment</option>
                                            <option value="finance">Finance / Loan</option>
                                        </select>
                                    </div>

                                    {saleData.payment_mode === 'cash' && (
                                        <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">UPI Amount</label>
                                                <input type="number" className="input-field bg-white" placeholder="0" value={saleData.cash_upi_amount} onChange={e => setSaleData({ ...saleData, cash_upi_amount: Number(e.target.value) })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">UPI Account</label>
                                                <select className="input-field bg-white text-xs" value={saleData.cash_upi_account} onChange={e => setSaleData({ ...saleData, cash_upi_account: e.target.value })}>
                                                    <option value="Main">Main Account</option>
                                                    <option value="Showroom">Showroom Account</option>
                                                    <option value="HDFC">HDFC</option>
                                                    <option value="ICICI">ICICI</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Cash Amount</label>
                                                <input type="number" className="input-field bg-white" placeholder="0" value={saleData.cash_cash_amount} onChange={e => setSaleData({ ...saleData, cash_cash_amount: Number(e.target.value) })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Cash By Whom</label>
                                                <select className="input-field bg-white" value={saleData.cash_collected_by || ''} onChange={e => setSaleData({ ...saleData, cash_collected_by: e.target.value })}>
                                                    <option value="">Select Employee</option>
                                                    {accounts && accounts.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {saleData.payment_mode === 'finance' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="grid grid-cols-4 gap-4 pb-4 border-b border-gray-200">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Down Payment</label>
                                                    <input type="number" className="input-field bg-white" placeholder="Total" value={saleData.finance_down_payment} onChange={e => setSaleData({ ...saleData, finance_down_payment: Number(e.target.value) })} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">DP Cash</label>
                                                    <input type="number" className="input-field bg-white" placeholder="0" value={saleData.finance_dp_cash} onChange={e => setSaleData({ ...saleData, finance_dp_cash: Number(e.target.value) })} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">DP Cash To</label>
                                                    <select className="input-field bg-white" value={saleData.finance_dp_cash_by || ''} onChange={e => setSaleData({ ...saleData, finance_dp_cash_by: e.target.value })}>
                                                        <option value="">Select Emp</option>
                                                        {accounts && accounts.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">DP UPI</label>
                                                    <input type="number" className="input-field bg-white" placeholder="0" value={saleData.finance_dp_upi} onChange={e => setSaleData({ ...saleData, finance_dp_upi: Number(e.target.value) })} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">UPI Account</label>
                                                    <select className="input-field bg-white text-xs" value={saleData.finance_dp_upi_account} onChange={e => setSaleData({ ...saleData, finance_dp_upi_account: e.target.value })}>
                                                        <option value="Main">Main Account</option>
                                                        <option value="Showroom">Showroom Account</option>
                                                        <option value="HDFC">HDFC</option>
                                                        <option value="ICICI">ICICI</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Finance By</label>
                                                    <select className="input-field bg-white" value={saleData.finance_bank || ''} onChange={e => setSaleData({ ...saleData, finance_bank: e.target.value })}>
                                                        <option value="">Select Bank</option>
                                                        <option value="Akasha">Akasha</option>
                                                        <option value="Kotak">Kotak</option>
                                                        <option value="Revfin">Revfin</option>
                                                        <option value="Self">Self</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Loan Number</label>
                                                    <input type="text" className="input-field bg-white" value={saleData.finance_loan_number} onChange={e => setSaleData({ ...saleData, finance_loan_number: e.target.value })} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">EMI Amount</label>
                                                    <input type="number" className="input-field bg-white" value={saleData.finance_emi} onChange={e => setSaleData({ ...saleData, finance_emi: Number(e.target.value) })} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Tenure (Months)</label>
                                                    <input type="number" className="input-field bg-white" value={saleData.finance_tenure} onChange={e => setSaleData({ ...saleData, finance_tenure: Number(e.target.value) })} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Schedule</label>
                                                    <select className="input-field bg-white" value={saleData.finance_schedule} onChange={e => setSaleData({ ...saleData, finance_schedule: e.target.value })}>
                                                        <option value="Weekly">Weekly</option>
                                                        <option value="Monthly">Monthly</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">EMI Start Date</label>
                                                    <input type="date" className="input-field bg-white" value={saleData.finance_start_date} onChange={e => setSaleData({ ...saleData, finance_start_date: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>



                            {/* Live Payment Validation Summary */}
                            <div className={`p-4 rounded-xl border-2 ${(() => {
                                let total = 0;
                                const price = saleData.selling_price || 0;
                                if (saleData.payment_mode === 'cash') total = (saleData.cash_upi_amount || 0) + (saleData.cash_cash_amount || 0);
                                else if (saleData.payment_mode === 'finance') total = (saleData.finance_down_payment || 0) + ((price - (saleData.finance_down_payment || 0))); // Loan covers rest? No, finance means DP + LOAN usually = Price. Wait, logic in handleConvert was: Loan = Price - DP. So Total = DP + Loan = Price.
                                // Actually for Finance, the validation is usually: does DP breakdown match DP? And does Loan + DP = Price?
                                // Let's stick to simple total check:
                                // For Finance: We assume Loan Amount is auto-calculated as (Price - DP). 
                                // So validation is mainly for Cash mode or DP breakdown.
                                // Let's focus on Cash Mode validation which is most common for errors.

                                if (saleData.payment_mode === 'finance') {
                                    // Validate DP breakdown
                                    const dp = saleData.finance_down_payment || 0;
                                    const dp_collected = (saleData.finance_dp_cash || 0) + (saleData.finance_dp_upi || 0);
                                    if (Math.abs(dp - dp_collected) > 1) return 'border-red-100 bg-red-50 text-red-600';
                                    return 'border-green-100 bg-green-50 text-green-700';
                                }

                                // Cash Mode
                                if (Math.abs(total - price) > 1) return 'border-red-100 bg-red-50 text-red-600';
                                return 'border-green-100 bg-green-50 text-green-700';
                            })()
                                }`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">Payment Balance</span>
                                    <span className="text-lg font-black font-mono">
                                        {(() => {
                                            const price = saleData.selling_price || 0;
                                            if (saleData.payment_mode === 'finance') {
                                                const dp = saleData.finance_down_payment || 0;
                                                const dp_collected = (saleData.finance_dp_cash || 0) + (saleData.finance_dp_upi || 0);
                                                const diff = dp - dp_collected;
                                                if (Math.abs(diff) < 1) return <span className="text-green-600 flex items-center gap-1">✓ MATCHED</span>;
                                                return <span className="text-red-600">MISMATCH: {diff > 0 ? `Short by ₹${diff}` : `Excess by ₹${Math.abs(diff)}`} (in Down Payment)</span>
                                            }

                                            // Cash Mode
                                            const total = (saleData.cash_upi_amount || 0) + (saleData.cash_cash_amount || 0);
                                            const diff = price - total;
                                            if (Math.abs(diff) < 1) return <span className="text-green-600 flex items-center gap-1">✓ MATCHED</span>;
                                            return <span className="text-red-600">MISMATCH: {diff > 0 ? `Short by ₹${diff}` : `Excess by ₹${Math.abs(diff)}`}</span>
                                        })()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4 border-t pt-6 mt-6">
                                <button type="button" onClick={() => setShowConvertModal(null)} className="flex-1 py-4 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-4 rounded-xl bg-green-600 text-white font-black shadow-xl hover:bg-green-700 hover:scale-[1.01] active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                                    <ShoppingCart size={18} /> Confirm Sale & Generate Invoice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}



            {/* Bulk Actions Toolbar */}
            <div className="flex justify-between items-center gap-4">
                {selectedLeads.length > 0 ? (
                    <div className="flex-1 bg-gray-900 text-white rounded-xl p-4 shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-3 font-bold">
                            <CheckSquare size={20} className="text-vayu-green" />
                            <span>{selectedLeads.length} Selected</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {['admin', 'manager', 'super_admin'].includes(user?.role) && (
                                <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                                    {isBulkAssigning ? (
                                        <select
                                            autoFocus
                                            className="bg-transparent text-xs font-bold text-white border-none outline-none focus:ring-0 min-w-[150px]"
                                            onChange={(e) => handleBulkAssign(e.target.value)}
                                            onBlur={() => setIsBulkAssigning(false)}
                                            defaultValue=""
                                        >
                                            <option value="" disabled className="text-gray-500">Select Assignee...</option>
                                            {accounts.map(acc => (
                                                <option key={acc.id} value={acc.email} className="text-gray-900">{acc.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <button
                                            onClick={() => setIsBulkAssigning(true)}
                                            className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                                        >
                                            <User size={14} /> Assign
                                        </button>
                                    )}
                                </div>
                            )}

                            {['admin', 'super_admin'].includes(user?.role) && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            )}

                            <button
                                onClick={() => setSelectedLeads([])}
                                className="text-gray-400 hover:text-white px-3 py-1.5 text-xs font-bold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-wider">
                    <Filter size={16} /> Filters
                </div>

                <select
                    className="text-xs font-bold border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-vayu-green text-gray-600"
                    value={filters.assigned_to}
                    onChange={(e) => setFilters(prev => ({ ...prev, assigned_to: e.target.value }))}
                >
                    <option value="">All Assignees</option>
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.email}>{acc.name}</option>
                    ))}
                </select>

                <select
                    className="text-xs font-bold border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-vayu-green text-gray-600"
                    value={filters.stage}
                    onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
                >
                    <option value="">All Stages</option>
                    <option value="Price discussion">Price discussion</option>
                    <option value="Product is not good.">Product is not good.</option>
                    <option value="High Price">High Price</option>
                    <option value="Down payment issue">Down payment issue</option>
                    <option value="Not interested">Not interested</option>
                    <option value="will plan after few days.">will plan after few days.</option>
                    <option value="Document issue.">Document issue.</option>
                    <option value="Sold">Sold</option>
                </select>

                <select
                    className="text-xs font-bold border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-vayu-green text-gray-600"
                    value={filters.source}
                    onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                >
                    <option value="">All Sources</option>
                    <option value="walk-in">Walk-in</option>
                    <option value="delivery-hub">Delivery Hub</option>
                    <option value="referral">Referral</option>
                    <option value="campaign">Campaign</option>
                </select>

                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 border border-gray-200">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Next Call:</span>
                    <input
                        type="date"
                        className="text-xs font-bold bg-transparent border-none outline-none focus:ring-0 text-gray-600 p-1"
                        value={filters.date_from}
                        onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                        placeholder="From"
                    />
                    <span className="text-gray-300">-</span>
                    <input
                        type="date"
                        className="text-xs font-bold bg-transparent border-none outline-none focus:ring-0 text-gray-600 p-1"
                        value={filters.date_to}
                        onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                        placeholder="To"
                    />
                </div>

                <select
                    className="text-xs font-bold border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-vayu-green text-gray-600"
                    value={filters.showroom}
                    onChange={(e) => setFilters(prev => ({ ...prev, showroom: e.target.value }))}
                >
                    <option value="">All Showrooms</option>
                    {Array.isArray(showrooms) && showrooms.filter(s => s !== 'All Showrooms').map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>

                {(filters.assigned_to || filters.stage || filters.source || filters.date_from || filters.date_to || filters.showroom) && (
                    <button
                        onClick={() => setFilters({ assigned_to: '', stage: '', source: '', date_from: '', date_to: '', showroom: '' })}
                        className="text-xs text-red-500 font-bold hover:underline ml-auto"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
                <div className="overflow-auto max-h-[calc(100vh-240px)]">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                                        {selectedLeads.length === leads.length && leads.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stage</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assignee</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Call</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next Call</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Notes</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLeads.map(lead => {
                                const getStageColor = (stage) => {
                                    switch (stage) {
                                        case 'Price discussion': return 'bg-blue-50 text-blue-700 border-blue-100';
                                        case 'Product is not good.': return 'bg-red-50 text-red-700 border-red-100';
                                        case 'High Price': return 'bg-orange-50 text-orange-700 border-orange-100';
                                        case 'Down payment issue': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
                                        case 'Not interested': return 'bg-gray-100 text-gray-600 border-gray-200';
                                        case 'will plan after few days.': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
                                        case 'Document issue.': return 'bg-purple-50 text-purple-700 border-purple-100';
                                        case 'Sold': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
                                        default: return 'bg-gray-50 text-gray-600 border-gray-100';
                                    }
                                };

                                return (
                                    <tr key={lead.id} className={`table-row ${selectedLeads.includes(lead.id) ? 'bg-green-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <button onClick={() => toggleSelect(lead.id)} className={`${selectedLeads.includes(lead.id) ? 'text-vayu-green' : 'text-gray-300 hover:text-gray-500'}`}>
                                                {selectedLeads.includes(lead.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                                            </button>
                                        </td>
                                        <td
                                            className="px-6 py-4 text-sm font-bold text-gray-800 cursor-pointer hover:text-vayu-green hover:underline"
                                            onClick={() => handleEdit(lead)}
                                        >
                                            {lead.name}
                                            {lead.frequency > 1 && (
                                                <span className="ml-2 px-2 py-0.5 text-[10px] bg-red-100 text-red-600 rounded-full">
                                                    x{lead.frequency}
                                                </span>
                                            )}
                                        </td>
                                        <td
                                            className="px-6 py-4 text-sm text-gray-600 cursor-pointer hover:text-vayu-green hover:underline"
                                            onClick={() => handleEdit(lead)}
                                        >
                                            {lead.phone}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${getStageColor(lead.stage)} outline-none focus:ring-1 focus:ring-vayu-green cursor-pointer appearance-none`}
                                                value={lead.stage}
                                                onChange={(e) => handleStageChange(lead, e.target.value)}
                                            >
                                                <option value="Price discussion">Price discussion</option>
                                                <option value="Product is not good.">Product is not good.</option>
                                                <option value="High Price">High Price</option>
                                                <option value="Down payment issue">Down payment issue</option>
                                                <option value="Not interested">Not interested</option>
                                                <option value="will plan after few days.">will plan after few days.</option>
                                                <option value="Document issue.">Document issue.</option>
                                                <option value="Sold">Sold</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <User size={12} />
                                                <select
                                                    className="text-xs bg-transparent border-none outline-none font-bold text-gray-600 focus:ring-0 cursor-pointer p-0"
                                                    value={lead.assigned_to || ''}
                                                    onChange={(e) => updateLeadDetails(lead.id, { assigned_to: e.target.value })}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {accounts.map(acc => (
                                                        <option key={acc.id} value={acc.email}>{acc.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                            <input
                                                type="date"
                                                className="bg-transparent border-none outline-none font-mono text-xs text-gray-500 focus:ring-0 cursor-pointer p-0 w-full"
                                                value={lead.current_call_date ? lead.current_call_date.split('T')[0] : ''}
                                                onChange={(e) => updateLeadDetails(lead.id, { current_call_date: e.target.value })}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                            <input
                                                type="date"
                                                className="bg-transparent border-none outline-none font-mono text-xs text-gray-500 focus:ring-0 cursor-pointer p-0 w-full"
                                                value={lead.next_call_date ? lead.next_call_date.split('T')[0] : ''}
                                                onChange={(e) => updateLeadDetails(lead.id, { next_call_date: e.target.value })}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 min-w-[200px]">
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    className="w-full bg-transparent border-none outline-none text-xs text-gray-600 focus:ring-1 focus:ring-vayu-green rounded px-2 py-1 placeholder:text-gray-300 transition-all hover:bg-gray-50"
                                                    placeholder="Add a note..."
                                                    defaultValue={lead.notes || ''}
                                                    onBlur={(e) => {
                                                        if (e.target.value !== lead.notes) {
                                                            updateLeadDetails(lead.id, { notes: e.target.value })
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.target.blur();
                                                        }
                                                    }}
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <Pencil size={10} className="text-gray-400" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(lead)}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                                                    title="Edit Lead"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <select
                                                    className="text-[10px] font-bold border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-vayu-green"
                                                    value={lead.status}
                                                    onChange={(e) => handleStatusChange(lead, e.target.value)}
                                                >
                                                    <option value="new">New</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="test-ride">Test Ride</option>
                                                    <option value="converted">Converted</option>
                                                    <option value="lost">Lost</option>
                                                </select>
                                                {lead.status !== 'converted' && (
                                                    <button
                                                        onClick={() => setShowConvertModal(lead)}
                                                        className="text-vayu-green font-bold text-[10px] hover:underline flex items-center gap-1"
                                                    >
                                                        <ShoppingCart size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <DuplicateWarningModal
                data={duplicateData}
                onClose={() => setDuplicateData(null)}
            />
        </div>
    )
}

export default LeadManagement
