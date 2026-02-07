import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import { Plus, X, Receipt, Filter, ArrowUpDown, Calendar, User, Tag, Wallet, Search, Download } from 'lucide-react'

function ExpenseManagement() {
    const { user, expenses = [], fetchExpenses, addExpense } = useStore()
    const [showForm, setShowForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState({ key: 'expense_date', direction: 'desc' })
    const [filters, setFilters] = useState({
        type: 'All',
        paidVia: 'All',
        dateFrom: '',
        dateTo: ''
    })

    const [formData, setFormData] = useState({
        voucher_no: '',
        associated_no: '',
        expense_type: 'Misc',
        expense_date: new Date().toISOString().split('T')[0],
        given_to: '',
        amount: '',
        paid_by: user?.name || '',
        paid_via: 'UPI',
        cash_by_whom: '',
        upi_account: 'Main'
    })

    useEffect(() => {
        fetchExpenses()
    }, [fetchExpenses])

    const isAdmin = ['admin', 'super_admin'].includes(user?.role)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const success = await addExpense({
            ...formData,
            amount: Number(formData.amount)
        })
        if (success) {
            setShowForm(false)
            setFormData({
                voucher_no: '',
                associated_no: '',
                expense_type: 'Misc',
                expense_date: new Date().toISOString().split('T')[0],
                given_to: '',
                amount: '',
                paid_by: user?.name || '',
                paid_via: 'UPI',
                cash_by_whom: '',
                upi_account: 'Main'
            })
        }
    }

    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = (exp.voucher_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (exp.given_to || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (exp.associated_no || '').toLowerCase().includes(searchTerm.toLowerCase())

        const expDate = new Date(exp.expense_date).getTime()
        const start = filters.dateFrom ? new Date(filters.dateFrom).getTime() : 0
        const end = filters.dateTo ? new Date(filters.dateTo).getTime() : Infinity

        const matchesDate = expDate >= start && expDate <= end
        const matchesType = filters.type === 'All' || exp.expense_type === filters.type
        const matchesPaidVia = filters.paidVia === 'All' || exp.paid_via === filters.paidVia

        return matchesSearch && matchesDate && matchesType && matchesPaidVia
    })

    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        if (sortConfig.key === 'expense_date') {
            aVal = new Date(aVal).getTime()
            bVal = new Date(bVal).getTime()
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
    })

    const requestSort = (key) => {
        let direction = 'desc'
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc'
        }
        setSortConfig({ key, direction })
    }

    const totalExpense = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    const downloadCSV = () => {
        const headers = ['Voucher No', 'Associated No', 'Type', 'Date', 'Given To', 'Amount', 'Paid By', 'Paid Via', 'Account/Handler']
        const rows = sortedExpenses.map(e => [
            e.voucher_no,
            e.associated_no || '-',
            e.expense_type,
            e.expense_date,
            e.given_to,
            e.amount,
            e.paid_by,
            e.paid_via,
            e.paid_via === 'UPI' ? e.upi_account : e.cash_by_whom
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `expenses_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Receipt className="text-red-500" /> Expense Management
                    </h2>
                    <p className="text-gray-500 font-bold">Total Spent: <span className="text-red-500">₹{totalExpense.toLocaleString()}</span> across {filteredExpenses.length} vouchers</p>
                </div>
                <div className="flex gap-3">
                    {isAdmin && (
                        <button
                            onClick={downloadCSV}
                            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors"
                        >
                            <Download size={16} /> Export CSV
                        </button>
                    )}
                    <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
                        <Plus size={20} /> Record Expense
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search voucher, person, association..."
                        className="pl-10 input-field w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Calendar size={14} className="text-gray-400" />
                    <input
                        type="date"
                        className="bg-transparent text-xs font-bold outline-none"
                        value={filters.dateFrom}
                        onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                    />
                    <span className="text-gray-300">→</span>
                    <input
                        type="date"
                        className="bg-transparent text-xs font-bold outline-none"
                        value={filters.dateTo}
                        onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                    />
                </div>

                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Tag size={14} className="text-gray-400" />
                    <select
                        className="bg-transparent text-xs font-bold outline-none"
                        value={filters.type}
                        onChange={e => setFilters({ ...filters, type: e.target.value })}
                    >
                        <option value="All">All Categories</option>
                        <option value="Referral">Referral</option>
                        <option value="Battery">Battery</option>
                        <option value="Food">Food</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Stationary">Stationary</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Rent">Rent</option>
                        <option value="Misc">Misc</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Wallet size={14} className="text-gray-400" />
                    <select
                        className="bg-transparent text-xs font-bold outline-none"
                        value={filters.paidVia}
                        onChange={e => setFilters({ ...filters, paidVia: e.target.value })}
                    >
                        <option value="All">All Modes</option>
                        <option value="UPI">UPI</option>
                        <option value="Cash">Cash</option>
                    </select>
                </div>
            </div>

            {/* Expense Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <button onClick={() => requestSort('voucher_no')} className="flex items-center gap-1">
                                    Voucher <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <button onClick={() => requestSort('expense_date')} className="flex items-center gap-1">
                                    Date <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Given To</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <button onClick={() => requestSort('amount')} className="flex items-center gap-1">
                                    Amount <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid Via</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Account / Handler</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Sales Ref</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sortedExpenses.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-bold italic">No expense records found.</td>
                            </tr>
                        ) : (
                            sortedExpenses.map(exp => (
                                <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-black text-gray-900 border-l-4 border-red-500">
                                        {exp.voucher_no}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                                        {exp.expense_date}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-md bg-gray-100 text-[10px] font-black uppercase text-gray-600">
                                            {exp.expense_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-700">
                                        {exp.given_to}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-red-600">
                                        ₹{exp.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">{exp.paid_via}</span>
                                            <span className="text-[9px] font-bold text-gray-500">by {exp.paid_by}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {exp.paid_via === 'UPI' ? (
                                            <span className="text-xs font-black text-blue-600">{exp.upi_account || 'Main'}</span>
                                        ) : (
                                            <span className="text-xs font-black text-orange-600">{exp.cash_by_whom || '-'}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-vayu-green font-bold">
                                        {exp.associated_no || '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Entry Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl p-8 shadow-2xl relative">
                        <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full">
                            <X size={24} />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-gray-900">Record New Expense</h3>
                            <p className="text-gray-500 font-bold">Ensure voucher and payment details are accurate.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Voucher Number</label>
                                    <input
                                        required
                                        type="text"
                                        className="input-field w-full uppercase"
                                        placeholder="e.g. V-001"
                                        value={formData.voucher_no}
                                        onChange={e => setFormData({ ...formData, voucher_no: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sales / Associated No</label>
                                    <input
                                        type="text"
                                        className="input-field w-full uppercase"
                                        placeholder="e.g. SALE-1234"
                                        value={formData.associated_no}
                                        onChange={e => setFormData({ ...formData, associated_no: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expense Category</label>
                                    <select
                                        className="input-field w-full"
                                        value={formData.expense_type}
                                        onChange={e => setFormData({ ...formData, expense_type: e.target.value })}
                                    >
                                        <option value="Referral">Referral</option>
                                        <option value="Battery">Battery</option>
                                        <option value="Food">Food</option>
                                        <option value="Cleaning">Cleaning</option>
                                        <option value="Stationary">Stationary</option>
                                        <option value="Electricity">Electricity</option>
                                        <option value="Rent">Rent</option>
                                        <option value="Misc">Misc</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expense Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="input-field w-full font-bold"
                                        value={formData.expense_date}
                                        onChange={e => setFormData({ ...formData, expense_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Given To / Paid For</label>
                                <input
                                    required
                                    type="text"
                                    className="input-field w-full"
                                    placeholder="e.g. Delivery Hub Manager, Cleaner Name..."
                                    value={formData.given_to}
                                    onChange={e => setFormData({ ...formData, given_to: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Paid (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        className="input-field w-full text-lg font-black text-red-600"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid Via</label>
                                    <select
                                        className="input-field w-full"
                                        value={formData.paid_via}
                                        onChange={e => setFormData({ ...formData, paid_via: e.target.value })}
                                    >
                                        <option value="UPI">UPI</option>
                                        <option value="Cash">Cash</option>
                                    </select>
                                </div>
                            </div>

                            {formData.paid_via === 'UPI' ? (
                                <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">UPI Source Account</label>
                                    <select
                                        className="input-field w-full font-bold"
                                        value={formData.upi_account}
                                        onChange={e => setFormData({ ...formData, upi_account: e.target.value })}
                                    >
                                        <option value="Main">Main Account</option>
                                        <option value="Showroom">Showroom Account</option>
                                        <option value="HDFC">HDFC</option>
                                        <option value="ICICI">ICICI</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cash Handed By</label>
                                    <input
                                        required
                                        type="text"
                                        className="input-field w-full"
                                        placeholder="Who is providing the cash?"
                                        value={formData.cash_by_whom}
                                        onChange={e => setFormData({ ...formData, cash_by_whom: e.target.value })}
                                    />
                                </div>
                            )}

                            <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl">
                                Submit Voucher
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ExpenseManagement
