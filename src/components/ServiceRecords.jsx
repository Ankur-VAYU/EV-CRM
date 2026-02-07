import React, { useState, useMemo } from 'react'
import { useStore } from '../store'
import {
    Plus, Wrench, X, Phone, User, CheckCircle,
    Clock, MapPin, Search, Trash2, ChevronRight,
    FileText, ShoppingCart, DollarSign, Calendar
} from 'lucide-react'

function ServiceRecords() {
    const { serviceRecords, addServiceRecord, updateServiceRecord, inventory, showrooms, user, employees, accounts } = useStore()
    const [view, setView] = useState('list') // 'list' or 'form'
    const [activeTab, setActiveTab] = useState('active') // 'active' or 'history'
    const [searchTerm, setSearchTerm] = useState('')

    // Edit/Create State
    const [isEditing, setIsEditing] = useState(false)
    const [currentJob, setCurrentJob] = useState(null) // ID of job being edited

    // New Job Form State
    const [formData, setFormData] = useState({
        phone: '',
        customer_name: '',
        vehicle_registration: '',
        problem: '',
        showroom: 'Main Showroom',
        raised_by: user?.name || 'Employee'
    })

    // Close Job / Payment State
    const [showCloseModal, setShowCloseModal] = useState(false)
    const [closeJobData, setCloseJobData] = useState({
        payment_mode: 'cash',
        cash_upi_amount: 0,
        cash_upi_account: 'Main',
        cash_cash_amount: 0,
        cash_collected_by: ''
    })

    // Parts Selection State for Job Card
    const [partsSearch, setPartsSearch] = useState('')
    const [isPartsListOpen, setIsPartsListOpen] = useState(false)

    // Reset Form
    const resetForm = () => {
        setFormData({
            phone: '',
            customer_name: '',
            vehicle_registration: '',
            problem: '',
            showroom: showrooms[0] || 'Main Showroom',
            raised_by: user?.name || 'Employee'
        })
        setCurrentJob(null)
        setIsEditing(false)
        setView('list')
    }

    // Handlers
    const handleCreateJob = async (e) => {
        // e.preventDefault() - Not needed as we moved to distinct button click
        console.log("Creating Job with data:", formData);
        try {
            const res = await addServiceRecord(formData)
            if (res.success) {
                // Open the newly created job immediately
                const newRecord = { ...formData, id: res.data.id, ticket_no: res.data.ticket_no, status: 'OPEN', parts_used: [], date: new Date().toISOString() }
                openJobCard(newRecord)
            } else {
                alert("Failed to create job card. Please check console.");
                console.error("Job creation failed:", res);
            }
        } catch (err) {
            console.error("Critical error in handleCreateJob:", err);
            alert("Error creating job: " + err.message);
        }
    }

    const openJobCard = (record) => {
        // Parse parts_used if it's a string (from backend) or already array
        let parsedParts = []
        try {
            parsedParts = typeof record.parts_used === 'string' ? JSON.parse(record.parts_used) : (record.parts_used || [])
        } catch (e) { parsedParts = [] }

        setCurrentJob({
            ...record,
            parts_used: parsedParts,
            labor_charge: record.labor_charge || 0,
            status: record.status || 'OPEN'
        })
        setIsEditing(true)
        setView('form')
    }

    const handleUpdateJob = async (statusOverride = null) => {
        if (!currentJob) return

        // Calculate Totals
        const partsTotal = currentJob.parts_used.reduce((sum, p) => sum + (p.cost * p.qty), 0)
        const total = partsTotal + Number(currentJob.labor_charge)

        const updates = {
            exact_issue: currentJob.problem, // Sync description
            parts_used: currentJob.parts_used,
            labor_charge: Number(currentJob.labor_charge),
            parts_charge: partsTotal,
            total_charge: total,
            status: statusOverride || currentJob.status
        }

        // If closing, Open Modal for Payment Details
        if (statusOverride === 'CLOSED') {
            // Pre-fill amount
            setCloseJobData({
                payment_mode: 'cash',
                cash_upi_amount: total, // Default to full amount
                cash_upi_account: 'Main',
                cash_cash_amount: 0,
                cash_collected_by: user?.name || ''
            })
            setShowCloseModal(true)
            return
        }

        const success = await updateServiceRecord(currentJob.id, updates)
        if (success) {
            alert('Job Card Updated Successfully')
        }
    }

    const confirmCloseJob = async (e) => {
        e.preventDefault()

        // Calculate Totals
        const partsTotal = currentJob.parts_used.reduce((sum, p) => sum + (p.cost * p.qty), 0)
        const total = partsTotal + Number(currentJob.labor_charge)

        // Validate Totals
        const collected = (closeJobData.cash_upi_amount || 0) + (closeJobData.cash_cash_amount || 0)
        if (Math.abs(collected - total) > 1) {
            alert(`Payment mismatch! Total Bill: ₹${total}, but you entered ₹${collected}. Please verify.`)
            return
        }

        const updates = {
            exact_issue: currentJob.problem,
            parts_used: currentJob.parts_used,
            labor_charge: Number(currentJob.labor_charge),
            parts_charge: partsTotal,
            total_charge: total,
            status: 'CLOSED',
            payment_mode: closeJobData.payment_mode,
            closing_time: new Date().toISOString(),
            // Payment Details
            cash_upi_amount: closeJobData.cash_upi_amount,
            cash_upi_account: closeJobData.cash_upi_account,
            cash_cash_amount: closeJobData.cash_cash_amount,
            cash_collected_by: closeJobData.cash_collected_by
        }

        const success = await updateServiceRecord(currentJob.id, updates)
        if (success) {
            setShowCloseModal(false)
            resetForm()
            alert('Job Closed & Bill Generated!')
        }
    }

    const addPartToJob = (part) => {
        if (!currentJob) return
        const existing = currentJob.parts_used.find(p => p.sku === part.sku)
        let newParts = []
        if (existing) {
            newParts = currentJob.parts_used.map(p => p.sku === part.sku ? { ...p, qty: p.qty + 1 } : p)
        } else {
            newParts = [...currentJob.parts_used, { sku: part.sku, name: part.item_name, cost: part.unit_cost, qty: 1 }]
        }
        setCurrentJob({ ...currentJob, parts_used: newParts })
        setPartsSearch('') // Clear search
    }

    const removePart = (sku) => {
        setCurrentJob({ ...currentJob, parts_used: currentJob.parts_used.filter(p => p.sku !== sku) })
    }

    // Filtering
    const displayedRecords = serviceRecords.filter(r => {
        const matchesSearch = (r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (r.vehicle_registration?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (r.phone?.includes(searchTerm))

        const isHistory = r.status === 'CLOSED'
        return activeTab === 'active' ? (!isHistory && matchesSearch) : (isHistory && matchesSearch)
    }).sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Wrench className="text-vayu-green" /> Service Centre
                    </h2>
                    <p className="text-gray-500 font-bold text-sm">Manage repairs, job cards, and billing.</p>
                </div>

                {view === 'list' && (
                    <div className="flex gap-2">
                        <div className="bg-gray-100 p-1 rounded-xl flex font-bold text-xs">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'active' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Active Jobs
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                History
                            </button>
                        </div>
                        <button
                            onClick={() => setView('new')}
                            className="bg-black text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
                        >
                            <Plus size={16} /> New Job Card
                        </button>
                    </div>
                )}
                {view !== 'list' && (
                    <button
                        onClick={resetForm}
                        className="bg-white border border-gray-200 text-gray-600 px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                        <X size={16} /> Cancel
                    </button>
                )}
            </div>

            {/* VIEW: List */}
            {view === 'list' && (
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by customer, vehicle number, or phone..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none font-bold text-sm focus:ring-2 focus:ring-gray-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedRecords.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-400 font-bold italic">
                                No {activeTab} service records found.
                            </div>
                        ) : (
                            displayedRecords.map(record => (
                                <button
                                    key={record.id}
                                    onClick={() => openJobCard(record)}
                                    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-vayu-green/30 transition-all text-left group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 group-hover:bg-vayu-green/10 transition-colors"></div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                                {record.ticket_no}
                                            </span>
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${record.status === 'CLOSED' ? 'text-gray-400' : 'text-vayu-green'}`}>
                                                {record.status}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-gray-900 group-hover:text-vayu-green transition-colors mb-1">
                                            {record.vehicle_registration || 'No Reg #'}
                                        </h3>
                                        <p className="text-sm font-bold text-gray-600 mb-4">{record.customer_name}</p>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                                <Phone size={12} /> {record.phone}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                                <FileText size={12} /> <span className="truncate">{record.problem || record.exact_issue || 'No details'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-400 pt-2 border-t border-gray-50 mt-3">
                                                <Clock size={12} /> {new Date(record.created_at || Date.now()).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* VIEW: New Job Form */}
            {view === 'new' && (
                <div className="flex justify-center">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-black p-8 text-white">
                            <h3 className="text-2xl font-black italic">Create New Job Card</h3>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Enter basic intake details</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vehicle Reg Number</label>
                                    <input required placeholder="UP-16-XX-XXXX" className="input-field w-full font-black text-lg uppercase" value={formData.vehicle_registration} onChange={e => setFormData({ ...formData, vehicle_registration: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Phone</label>
                                    <input required placeholder="9876543210" maxLength={10} className="input-field w-full font-bold text-lg" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })} />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Name</label>
                                    <input required placeholder="Full Name" className="input-field w-full font-bold" value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assign Serviceman (Optional)</label>
                                    <select
                                        className="input-field w-full font-bold bg-gray-50"
                                        value={formData.assigned_serviceman_id || ''}
                                        onChange={e => {
                                            const selected = (employees || []).find(emp => emp.id === Number(e.target.value))
                                            setFormData({
                                                ...formData,
                                                assigned_serviceman_id: selected ? selected.id : null,
                                                assigned_serviceman_name: selected ? selected.name : null
                                            })
                                        }}
                                    >
                                        <option value="">Auto-Assign Best Available</option>
                                        {(employees || []).filter(e => e.designation === 'Serviceman' || e.designation === 'Technician').map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.name} {emp.availability_status ? `(${emp.availability_status})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Issue / Complaint</label>
                                    <textarea required rows={3} placeholder="Describe the problem..." className="input-field w-full font-medium" value={formData.problem} onChange={e => setFormData({ ...formData, problem: e.target.value })} />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    if (!formData.vehicle_registration || !formData.phone || !formData.customer_name || !formData.problem) {
                                        alert('Please fill all required fields');
                                        return;
                                    }
                                    handleCreateJob(e);
                                }}
                                className="w-full py-4 bg-[#F4B400] text-black font-black uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-xl hover:bg-black hover:text-white transition-all transform hover:scale-[1.01] cursor-pointer z-10 relative"
                            >
                                Generate Job Card
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW: Job Card Editor (The "One-Screen" Solution) */}
            {view === 'form' && currentJob && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col: Info & Notes */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-vayu-green font-black text-xs uppercase tracking-widest">Job Card #{currentJob.ticket_no}</span>
                                    <h2 className="text-3xl font-black text-gray-900 mt-1">{currentJob.vehicle_registration}</h2>
                                    <p className="font-bold text-gray-500">{currentJob.customer_name} • {currentJob.phone}</p>
                                </div>
                                <div className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest ${currentJob.status === 'CLOSED' ? 'bg-black text-white' : 'bg-green-100 text-green-800'}`}>
                                    {currentJob.status}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Technician Notes / Diagnosis</label>
                                <textarea
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-vayu-green/20 font-medium text-sm min-h-[120px]"
                                    value={currentJob.problem}
                                    onChange={(e) => setCurrentJob({ ...currentJob, problem: e.target.value })}
                                    placeholder="Enter detailed diagnosis steps or notes here..."
                                />
                            </div>
                        </div>

                        {/* Parts & Labor */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <ShoppingCart size={18} /> Parts & Labor
                                </h3>

                                {/* Parts Search */}
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Add Part (Click to Browse or Type to Search)..."
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-vayu-green cursor-pointer"
                                        value={partsSearch}
                                        onChange={(e) => setPartsSearch(e.target.value)}
                                        onFocus={() => setIsPartsListOpen(true)}
                                        onBlur={() => setTimeout(() => setIsPartsListOpen(false), 200)}
                                    />
                                    {/* Dropdown Results */}
                                    {isPartsListOpen && (
                                        <div className="absolute top-full left-0 w-full bg-white border border-gray-100 shadow-xl rounded-xl mt-2 max-h-64 overflow-y-auto z-50">
                                            {inventory.filter(i => {
                                                // Allow ANY item type, just check stock and name match logic
                                                // If search is empty, show all available. If search has text, filter by it.
                                                const matchesSearch = partsSearch === '' ||
                                                    (i.item_name.toLowerCase().includes(partsSearch.toLowerCase()) || i.sku.toLowerCase().includes(partsSearch.toLowerCase()));
                                                return i.quantity > 0 && matchesSearch;
                                            }).slice(0, 100).map(part => (
                                                <button
                                                    key={part.id}
                                                    onClick={() => addPartToJob(part)}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-xs font-bold border-b border-gray-50 last:border-0 transition-colors"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="text-gray-900">{part.item_name}</div>
                                                            <div className="text-[10px] text-gray-400 font-medium">{part.sku}</div>
                                                        </div>
                                                        <span className="text-vayu-green font-black">₹{part.unit_cost}</span>
                                                    </div>
                                                </button>
                                            ))}
                                            {inventory.filter(i => i.quantity > 0 && (partsSearch === '' || i.item_name.toLowerCase().includes(partsSearch.toLowerCase()))).length === 0 && (
                                                <div className="p-4 text-center text-gray-400 text-xs italic">No matching parts found.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Parts List */}
                                <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                                    {currentJob.parts_used.length === 0 ? (
                                        <div className="p-6 text-center text-gray-400 text-xs font-bold italic">No parts added yet.</div>
                                    ) : (
                                        currentJob.parts_used.map((part, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 bg-white">
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900">{part.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{part.sku}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-medium">₹{part.cost} x {part.qty}</span>
                                                    <span className="font-black text-sm">₹{part.cost * part.qty}</span>
                                                    <button onClick={() => removePart(part.sku)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Labor */}
                                <div className="flex justify-between items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <div className="flex items-center gap-2 text-blue-800 font-black text-xs uppercase tracking-widest">
                                        <Wrench size={14} /> Labor Charges
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            className="w-24 bg-white border border-gray-200 rounded-lg py-1 px-2 text-right font-black text-sm outline-none focus:border-blue-500"
                                            value={currentJob.labor_charge}
                                            onChange={(e) => setCurrentJob({ ...currentJob, labor_charge: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Summary & Actions */}
                    <div className="space-y-6">
                        <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>

                            <h3 className="text-xl font-black italic mb-6 relative z-10">Job Summary</h3>

                            <div className="space-y-3 relative z-10 mb-8">
                                <div className="flex justify-between text-sm text-gray-400 font-medium">
                                    <span>Total Parts</span>
                                    <span>₹{currentJob.parts_used.reduce((sum, p) => sum + (p.cost * p.qty), 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400 font-medium">
                                    <span>Labor Charges</span>
                                    <span>₹{currentJob.labor_charge}</span>
                                </div>
                                <div className="h-px bg-gray-800 my-4"></div>
                                <div className="flex justify-between text-2xl font-black text-white">
                                    <span>Total Due</span>
                                    <span>₹{currentJob.parts_used.reduce((sum, p) => sum + (p.cost * p.qty), 0) + Number(currentJob.labor_charge)}</span>
                                </div>
                            </div>

                            {currentJob.status !== 'CLOSED' && (
                                <div className="space-y-3 relative z-10">
                                    <button
                                        onClick={() => handleUpdateJob('OPEN')}
                                        className="w-full py-4 bg-gray-800 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-gray-700 transition-all"
                                    >
                                        Save Changes Only
                                    </button>
                                    <button
                                        onClick={() => handleUpdateJob('CLOSED')}
                                        className="w-full py-4 bg-[#F4B400] text-black font-black rounded-xl text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                                    >
                                        Settle & Close Job
                                    </button>
                                </div>
                            )}
                            {currentJob.status === 'CLOSED' && (
                                <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-xl text-center">
                                    <p className="text-green-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                        <CheckCircle size={14} /> Job Completed
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Collection Modal */}
            {showCloseModal && currentJob && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
                        <button onClick={() => setShowCloseModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6 bg-vayu-green/10 p-4 rounded-xl">
                            <div className="w-12 h-12 bg-vayu-green text-green-900 rounded-xl flex items-center justify-center">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Collect Payment</h3>
                                <p className="text-xs text-gray-600 font-medium">Job Card: {currentJob.ticket_no}</p>
                            </div>
                        </div>

                        <form onSubmit={confirmCloseJob} className="space-y-6">
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-500 uppercase">Total Bill Amount</span>
                                <span className="text-2xl font-black text-gray-900">
                                    ₹{currentJob.parts_used.reduce((sum, p) => sum + (p.cost * p.qty), 0) + Number(currentJob.labor_charge)}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Payment Breakdown</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">UPI Amount</label>
                                        <input
                                            type="number"
                                            className="input-field w-full font-bold"
                                            value={closeJobData.cash_upi_amount}
                                            onChange={e => setCloseJobData({ ...closeJobData, cash_upi_amount: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">UPI Account</label>
                                        <select
                                            className="input-field w-full font-bold text-xs"
                                            value={closeJobData.cash_upi_account}
                                            onChange={e => setCloseJobData({ ...closeJobData, cash_upi_account: e.target.value })}
                                        >
                                            <option value="Main">Main Account</option>
                                            <option value="Showroom">Showroom Account</option>
                                            <option value="HDFC">HDFC</option>
                                            <option value="ICICI">ICICI</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Cash Amount</label>
                                        <input
                                            type="number"
                                            className="input-field w-full font-bold"
                                            value={closeJobData.cash_cash_amount}
                                            onChange={e => setCloseJobData({ ...closeJobData, cash_cash_amount: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Collected By</label>
                                        <select
                                            className="input-field w-full font-bold text-xs"
                                            value={closeJobData.cash_collected_by}
                                            onChange={e => setCloseJobData({ ...closeJobData, cash_collected_by: e.target.value })}
                                        >
                                            <option value="">Select Employee</option>
                                            {accounts && accounts.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Validation Status */}
                            <div className={`p-3 rounded-lg border text-center text-sm font-bold ${Math.abs((closeJobData.cash_upi_amount + closeJobData.cash_cash_amount) - (currentJob.parts_used.reduce((sum, p) => sum + (p.cost * p.qty), 0) + Number(currentJob.labor_charge))) < 1
                                ? 'bg-green-50 border-green-100 text-green-700'
                                : 'bg-red-50 border-red-100 text-red-600'
                                }`}>
                                {(() => {
                                    const total = currentJob.parts_used.reduce((sum, p) => sum + (p.cost * p.qty), 0) + Number(currentJob.labor_charge)
                                    const collected = closeJobData.cash_upi_amount + closeJobData.cash_cash_amount
                                    const diff = total - collected

                                    if (Math.abs(diff) < 1) return "✓ Payment Matched"
                                    return diff > 0 ? `Short by ₹${diff}` : `Excess by ₹${Math.abs(diff)}`
                                })()}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all uppercase tracking-widest text-sm"
                            >
                                Confirm & Close Ticket
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
export default ServiceRecords
