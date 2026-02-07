import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import { AlertCircle, Package, Plus, Search, RotateCcw, X, ShieldCheck, Tag, Calendar, Truck, Info, Zap } from 'lucide-react'

function InventoryManagement() {
    const { user, inventory, updateInventory, addInventoryItem, showrooms, fetchInventory } = useStore()
    const isAdmin = ['admin', 'super_admin'].includes(user?.role)
    const [showAddForm, setShowAddForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('All')

    const initialFormState = {
        item_type: 'Scooty',
        item_name: '',
        sku: '',
        quantity: 1,
        unit_cost: 0,
        reorder_level: 1,
        showroom: 'Main Showroom',
        po_no: '',
        purchase_date: new Date().toISOString().split('T')[0],
        warranty: 'Yes',
        warranty_duration: '1 year',
        warranty_parts: 'Battery',
        unique_no: '',
        // Scooty specific
        chasis_no: '',
        motor_no: '',
        controller_no: '',
        model: '',
        colour: '',
        // Battery specific
        battery_no: '',
        volt: '',
        amp: '',
        // Charger specific
        charger_no: '',
        breakdown_volt: '',
        // Motor specific
        size: '',
        watt: '',
        // Controller specific
        controller_type: 'Smart'
    }

    const [newItem, setNewItem] = useState(initialFormState)

    useEffect(() => {
        fetchInventory()
    }, [fetchInventory])

    const filteredInventory = inventory.filter(i => {
        const matchesSearch = (i.item_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.unique_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === 'All' || i.item_type === filterType
        return matchesSearch && matchesType
    })

    const lowStockItems = inventory.filter(i => i.quantity < i.reorder_level)
    const totalValue = inventory.reduce((sum, i) => sum + (i.quantity * i.unit_cost), 0)

    const handleAdd = async (e) => {
        e.preventDefault()
        // Use unique_no as SKU if specific unit
        const itemToSave = { ...newItem }
        if (['Scooty', 'Battery', 'Charger', 'Motor', 'Controller'].includes(newItem.item_type)) {
            // Map the specific unique field to the unique_no field
            if (newItem.item_type === 'Scooty') itemToSave.unique_no = newItem.chasis_no;
            else if (newItem.item_type === 'Battery') itemToSave.unique_no = newItem.battery_no;
            else if (newItem.item_type === 'Charger') itemToSave.unique_no = newItem.charger_no;
            else if (newItem.item_type === 'Motor') itemToSave.unique_no = newItem.motor_no;
            else if (newItem.item_type === 'Controller') itemToSave.unique_no = newItem.controller_no;

            // For unit tracking, SKU is often the unique number too for primary lookup
            itemToSave.sku = itemToSave.unique_no;
        }

        const success = await addInventoryItem(itemToSave)
        if (success) {
            setNewItem(initialFormState)
            setShowAddForm(false)
        }
    }

    const handleQuickUpdate = (id, delta) => {
        const item = inventory.find(i => i.id === id)
        if (item) {
            updateInventory(id, Math.max(0, item.quantity + delta))
        }
    }

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const rows = text.split('\n').filter(row => row.trim());
            const headers = rows[0].split(',').map(h => h.trim());
            const data = rows.slice(1).map(row => {
                const values = row.split(',').map(v => v.trim());
                return headers.reduce((obj, header, i) => {
                    obj[header] = values[i];
                    return obj;
                }, {});
            });

            try {
                const res = await fetch(`${useStore.getState().API_URL}/inventory/bulk`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (res.ok) {
                    alert('Bulk upload successful!');
                    fetchInventory();
                } else {
                    const err = await res.json();
                    alert('Upload failed: ' + err.error);
                }
            } catch (error) {
                console.error('Bulk upload error:', error);
                alert('Upload failed. Check console.');
            }
        };
        reader.readAsText(file);
    }

    const downloadSampleCSV = () => {
        const headers = [
            'item_type', 'item_name', 'sku', 'quantity', 'unit_cost', 'reorder_level', 'showroom',
            'po_no', 'purchase_date', 'warranty', 'warranty_duration', 'warranty_parts',
            'unique_no', 'model', 'colour', 'chasis_no', 'motor_no', 'controller_no',
            'volt', 'amp', 'breakdown_volt', 'size', 'watt', 'controller_type'
        ];

        const samples = [
            ['Scooty', 'VAYU G-Series', 'VAYU-G-001', '1', '65000', '1', 'Main Showroom', 'PO-101', '2024-01-20', 'Yes', '2 years', 'All Major', 'CH-998877', 'G-Series', 'Matte Blue', 'CH-998877', 'MOT-123', 'CON-456', '', '', '', '', '', ''],
            ['Battery', 'LFP-60V-30Ah', 'BAT-6030', '5', '22000', '2', 'Main Showroom', 'PO-102', '2024-01-21', 'Yes', '3 years', 'Battery', 'B-112233', '', '', '', '', '', '60V', '30Ah', '', '', '', ''],
            ['Charger', 'Fast Charger 10A', 'CHG-10A', '10', '4500', '5', 'Main Showroom', 'PO-103', '2024-01-22', 'No', '', '', 'C-556677', '', '', '', '', '', '', '10A', '72V', '', '', '']
        ];

        const csvContent = [headers, ...samples].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vayu_inventory_sample.csv';
        a.click();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Package className="text-vayu-green" /> Inventory Ledger
                    </h2>
                    <p className="text-sm text-gray-500 font-bold italic">Tracking {inventory.length} assets · Valuation: ₹{(totalValue).toLocaleString()}</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, unique no, SKU..."
                            className="pl-10 input-field w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-[#00d280] text-gray-900 border border-[#00ff9d] px-6 py-2 rounded-xl font-black text-sm hover:bg-[#00ff9d] transition-all shadow-[0_0_15px_rgba(0,210,128,0.3)] flex items-center gap-2"
                    >
                        <Plus size={18} /> New Entry
                    </button>
                    {isAdmin && (
                        <>
                            <label className="cursor-pointer bg-gray-900 text-white px-6 py-2 rounded-xl font-black text-sm hover:bg-black transition-all shadow-lg flex items-center gap-2">
                                <Truck size={18} /> Bulk Upload (CSV)
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleBulkUpload}
                                />
                            </label>
                            <button
                                onClick={downloadSampleCSV}
                                className="text-[10px] font-black text-vayu-green uppercase tracking-widest hover:text-black transition-colors underline"
                            >
                                Download Sample Format
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats & Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter by Type</p>
                    <select
                        className="w-full mt-1 bg-transparent font-bold text-sm outline-none"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="All">All Items</option>
                        <option value="Scooty">Scooty</option>
                        <option value="Battery">Battery</option>
                        <option value="Charger">Charger</option>
                        <option value="General Parts">General Parts</option>
                        <option value="Motor">Motor</option>
                        <option value="Controller">Controller</option>
                    </select>
                </div>
                {lowStockItems.length > 0 && (
                    <div className="md:col-span-3 bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={20} />
                        <p className="text-xs font-bold text-red-700">Low Stock Alert: {lowStockItems.length} items need replenishment.</p>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Detail</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unique / SKU</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Warranty</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Stock</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status / Location</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Purchase / PO</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {filteredInventory.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-bold italic">No inventory found matching criteria.</td>
                            </tr>
                        ) : (
                            filteredInventory.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-gray-900">{item.item_name}</span>
                                            {item.item_type === 'Scooty' && <span className="text-[10px] text-vayu-green font-bold">{item.model} · {item.colour}</span>}
                                            {item.item_type === 'Battery' && <span className="text-[10px] text-blue-500 font-bold">{item.volt}V {item.amp}Ah</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${item.item_type === 'Scooty' ? 'bg-purple-50 text-purple-600' :
                                            item.item_type === 'Battery' ? 'bg-blue-50 text-blue-600' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                            {item.item_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs font-black text-gray-700">{item.unique_no || item.sku}</span>
                                            {item.item_type === 'Scooty' && <span className="text-[9px] text-gray-400 font-bold">MOT: {item.motor_no}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.warranty === 'Yes' ? (
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase">
                                                    <ShieldCheck size={12} /> Covered
                                                </div>
                                                <span className="text-[9px] text-gray-400 font-bold">{item.warranty_duration} ({item.warranty_parts})</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black text-gray-400 uppercase">No Warranty</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center">
                                            <span className={`text-lg font-black ${item.quantity < item.reorder_level ? 'text-red-500' : 'text-vayu-green'}`}>
                                                {item.quantity}
                                            </span>
                                            <div className="flex gap-1 mt-1">
                                                <button onClick={() => handleQuickUpdate(item.id, -1)} className="w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-xs font-black">-</button>
                                                <button onClick={() => handleQuickUpdate(item.id, 1)} className="w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-xs font-black">+</button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase text-center ${item.status === 'available' || !item.status ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                {item.status || 'Available'}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-bold mt-1 text-center">{item.showroom}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-[10px] font-bold">
                                            <span className="text-gray-900">{item.purchase_date}</span>
                                            <span className="text-gray-400 uppercase tracking-tighter">PO: {item.po_no || 'MANUAL'}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modern Entry Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl relative border border-gray-100">
                        <button onClick={() => setShowAddForm(false)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={24} />
                        </button>

                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <Package className="text-vayu-green" size={28} />
                                <h3 className="text-2xl font-black text-gray-900">Inventory Procurement</h3>
                            </div>
                            <p className="text-gray-500 font-bold">Register a new asset or unit into the operational ecosystem.</p>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-10">
                            {/* Form Section 1: Core Identity */}
                            <section className="space-y-6">
                                <h4 className="text-xs font-black text-vayu-green uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Tag size={14} /> Basic Procurement Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Category</label>
                                        <select
                                            className="input-field w-full"
                                            value={newItem.item_type}
                                            onChange={(e) => setNewItem({ ...newItem, item_type: e.target.value })}
                                        >
                                            <option value="Scooty">Scooty (Entire Unit)</option>
                                            <option value="Battery">Battery (Unit)</option>
                                            <option value="Charger">Charger (Unit)</option>
                                            <option value="General Parts">General Parts (Bulk)</option>
                                            <option value="Motor">Motor (Part)</option>
                                            <option value="Controller">Controller (Part)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item / Model Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. VAYU G-series, LFP Battery 60V"
                                            className="input-field w-full"
                                            value={newItem.item_name}
                                            onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Procurement Date</label>
                                        <input
                                            required
                                            type="date"
                                            className="input-field w-full font-bold"
                                            value={newItem.purchase_date}
                                            onChange={(e) => setNewItem({ ...newItem, purchase_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PO Number</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="PO-XXXX"
                                            className="input-field w-full uppercase"
                                            value={newItem.po_no}
                                            onChange={(e) => setNewItem({ ...newItem, po_no: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit Cost (₹)</label>
                                        <input
                                            required
                                            type="number"
                                            className="input-field w-full font-black text-vayu-green"
                                            value={newItem.unit_cost}
                                            onChange={(e) => setNewItem({ ...newItem, unit_cost: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
                                        <input
                                            required
                                            type="number"
                                            className="input-field w-full font-black"
                                            value={newItem.quantity}
                                            onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-50" />

                            {/* Form Section 2: Specific Data */}
                            <section className="space-y-6">
                                <h4 className="text-xs font-black text-vayu-green uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Zap size={14} /> Type-Specific Specifications
                                </h4>

                                {newItem.item_type === 'Scooty' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Chasis Number (Unique)</label>
                                            <input required type="text" className="input-field w-full font-mono font-black" placeholder="C-XXXX" value={newItem.chasis_no} onChange={e => setNewItem({ ...newItem, chasis_no: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Motor Number</label>
                                            <input type="text" className="input-field w-full" value={newItem.motor_no} onChange={e => setNewItem({ ...newItem, motor_no: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Controller Number</label>
                                            <input type="text" className="input-field w-full" value={newItem.controller_no} onChange={e => setNewItem({ ...newItem, controller_no: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Model</label>
                                            <select
                                                className="input-field w-full font-bold"
                                                value={newItem.model}
                                                onChange={e => setNewItem({ ...newItem, model: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Model</option>
                                                <option value="VAYU G-Series">VAYU G-Series</option>
                                                <option value="VAYU Elite">VAYU Elite</option>
                                                <option value="VAYU Classic">VAYU Classic</option>
                                                <option value="VAYU Pro">VAYU Pro</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Colour</label>
                                            <input type="text" className="input-field w-full" placeholder="e.g. Matte Blue" value={newItem.colour} onChange={e => setNewItem({ ...newItem, colour: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location / Showroom</label>
                                            <select
                                                className="input-field w-full font-bold"
                                                value={newItem.showroom}
                                                onChange={e => setNewItem({ ...newItem, showroom: e.target.value })}
                                                required
                                            >
                                                {showrooms.filter(s => s !== 'All Showrooms').map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {newItem.item_type === 'Battery' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Battery No (Unique)</label>
                                            <input required type="text" className="input-field w-full font-mono font-black" placeholder="B-XXXX" value={newItem.battery_no} onChange={e => setNewItem({ ...newItem, battery_no: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Voltage (V)</label>
                                            <input type="text" className="input-field w-full font-bold" placeholder="e.g. 60V" value={newItem.volt} onChange={e => setNewItem({ ...newItem, volt: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Amperage (Ah)</label>
                                            <input type="text" className="input-field w-full font-bold" placeholder="e.g. 30Ah" value={newItem.amp} onChange={e => setNewItem({ ...newItem, amp: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                {newItem.item_type === 'Charger' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Charger No (Unique)</label>
                                            <input required type="text" className="input-field w-full font-mono font-black" placeholder="CH-XXXX" value={newItem.charger_no} onChange={e => setNewItem({ ...newItem, charger_no: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Breakdown Volt</label>
                                            <input type="text" className="input-field w-full" value={newItem.breakdown_volt} onChange={e => setNewItem({ ...newItem, breakdown_volt: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Amperage (A)</label>
                                            <input type="text" className="input-field w-full" value={newItem.amp} onChange={e => setNewItem({ ...newItem, amp: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                {newItem.item_type === 'Motor' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Motor No (Unique)</label>
                                            <input required type="text" className="input-field w-full font-mono font-black" placeholder="M-XXXX" value={newItem.motor_no} onChange={e => setNewItem({ ...newItem, motor_no: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Size</label>
                                            <input type="text" className="input-field w-full" value={newItem.size} onChange={e => setNewItem({ ...newItem, size: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Wattage (W)</label>
                                            <input type="text" className="input-field w-full" value={newItem.watt} onChange={e => setNewItem({ ...newItem, watt: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                {newItem.item_type === 'Controller' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Controller No (Unique)</label>
                                            <input required type="text" className="input-field w-full font-mono font-black" placeholder="CO-XXXX" value={newItem.controller_no} onChange={e => setNewItem({ ...newItem, controller_no: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Amperage</label>
                                            <input type="text" className="input-field w-full" value={newItem.amp} onChange={e => setNewItem({ ...newItem, amp: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Type</label>
                                            <select className="input-field w-full" value={newItem.controller_type} onChange={e => setNewItem({ ...newItem, controller_type: e.target.value })}>
                                                <option value="Smart">Smart</option>
                                                <option value="Manual">Manual</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {newItem.item_type === 'General Parts' && (
                                    <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase">SKU / Unique Identifier</label>
                                        <input required type="text" className="input-field w-full" placeholder="SKU-XXXX" value={newItem.sku} onChange={e => setNewItem({ ...newItem, sku: e.target.value })} />
                                    </div>
                                )}
                            </section>

                            <hr className="border-gray-50" />

                            {/* Form Section 3: Warranty */}
                            <section className="space-y-6">
                                <h4 className="text-xs font-black text-vayu-green uppercase tracking-[0.2em] flex items-center gap-2">
                                    <ShieldCheck size={14} /> Warranty Configuration
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Warranty Applicable?</label>
                                        <select
                                            className="input-field w-full font-bold"
                                            value={newItem.warranty}
                                            onChange={(e) => setNewItem({ ...newItem, warranty: e.target.value })}
                                        >
                                            <option value="Yes">Yes, Included</option>
                                            <option value="No">No Warranty</option>
                                        </select>
                                    </div>
                                    {newItem.warranty === 'Yes' && (
                                        <>
                                            <div className="space-y-1 animate-in fade-in slide-in-from-left-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</label>
                                                <select
                                                    className="input-field w-full font-bold"
                                                    value={newItem.warranty_duration}
                                                    onChange={(e) => setNewItem({ ...newItem, warranty_duration: e.target.value })}
                                                >
                                                    <option value="6 months">6 Months</option>
                                                    <option value="1 year">1 Year</option>
                                                    <option value="2 years">2 Years</option>
                                                    <option value="3 years">3 Years</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1 animate-in fade-in slide-in-from-left-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Covered Parts</label>
                                                <select
                                                    className="input-field w-full font-bold"
                                                    value={newItem.warranty_parts}
                                                    onChange={(e) => setNewItem({ ...newItem, warranty_parts: e.target.value })}
                                                >
                                                    <option value="Battery">Battery</option>
                                                    <option value="Motor">Motor</option>
                                                    <option value="Controller">Controller</option>
                                                    <option value="All Major">All Major Parts</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>

                            <button type="submit" className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-gray-900 transition-all shadow-xl hover:translate-y-[-2px]">
                                Register Inventory Asset
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default InventoryManagement
