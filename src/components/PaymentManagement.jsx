import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import { Wallet, Search, Filter, Calendar, User, ArrowUpDown, Download, CheckCircle2 } from 'lucide-react'

function PaymentManagement() {
    const { user, payments = [], fetchPayments } = useStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        mode: 'All',
        collectedBy: ''
    })
    const [sortConfig, setSortConfig] = useState({ key: 'payment_date', direction: 'desc' })

    useEffect(() => {
        fetchPayments()
    }, [fetchPayments])

    const isAdmin = ['admin', 'super_admin'].includes(user?.role)

    // Derived lists for filters
    const collectors = [...new Set(payments.map(p => p.collected_by).filter(Boolean))]

    const filteredPayments = payments.filter(p => {
        const matchesSearch = (p.sale_no || '').toLowerCase().includes(searchTerm.toLowerCase())

        const payDate = new Date(p.payment_date).getTime()
        const start = filters.startDate ? new Date(filters.startDate).getTime() : 0
        const end = filters.endDate ? new Date(filters.endDate).getTime() : Infinity

        const matchesDate = payDate >= start && payDate <= end
        const matchesMode = filters.mode === 'All' || p.payment_mode === filters.mode
        const matchesCollector = !filters.collectedBy || p.collected_by === filters.collectedBy

        return matchesSearch && matchesDate && matchesMode && matchesCollector
    })

    const sortedPayments = [...filteredPayments].sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        if (sortConfig.key === 'payment_date') {
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

    const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    const downloadCSV = () => {
        const headers = ['Payment Date', 'Sale No', 'Amount', 'Mode', 'Account/ByWhom', 'Collected By']
        const rows = sortedPayments.map(p => [
            new Date(p.payment_date).toLocaleDateString(),
            p.sale_no,
            p.amount,
            p.payment_mode,
            p.payment_mode === 'UPI' ? p.upi_account : p.cash_by_whom,
            p.collected_by
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `payments_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Wallet className="text-vayu-green" /> Payment Ledger
                    </h2>
                    <p className="text-gray-500 font-bold">Total Collected: <span className="text-vayu-green">₹{totalAmount.toLocaleString()}</span> from {filteredPayments.length} transactions</p>
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
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search Sale No..."
                            className="pl-10 input-field max-w-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Calendar size={14} className="text-gray-400" />
                    <input
                        type="date"
                        className="bg-transparent text-xs font-bold outline-none"
                        value={filters.startDate}
                        onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                    />
                    <span className="text-gray-300">→</span>
                    <input
                        type="date"
                        className="bg-transparent text-xs font-bold outline-none"
                        value={filters.endDate}
                        onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                    />
                </div>

                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Filter size={14} className="text-gray-400" />
                    <select
                        className="bg-transparent text-xs font-bold outline-none"
                        value={filters.mode}
                        onChange={e => setFilters({ ...filters, mode: e.target.value })}
                    >
                        <option value="All">All Modes</option>
                        <option value="UPI">UPI</option>
                        <option value="Cash">Cash</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <User size={14} className="text-gray-400" />
                    <select
                        className="bg-transparent text-xs font-bold outline-none"
                        value={filters.collectedBy}
                        onChange={e => setFilters({ ...filters, collectedBy: e.target.value })}
                    >
                        <option value="">All Collectors</option>
                        {collectors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {(filters.startDate || filters.endDate || filters.mode !== 'All' || filters.collectedBy) && (
                    <button
                        onClick={() => setFilters({ startDate: '', endDate: '', mode: 'All', collectedBy: '' })}
                        className="text-xs font-bold text-red-500 hover:underline"
                    >
                        Reset Filters
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <button onClick={() => requestSort('payment_date')} className="flex items-center gap-1">
                                    Date <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <button onClick={() => requestSort('sale_no')} className="flex items-center gap-1">
                                    Sale No <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <button onClick={() => requestSort('amount')} className="flex items-center gap-1">
                                    Amount <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Account / By Whom</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Collected By</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sortedPayments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-bold italic">No payment records found.</td>
                            </tr>
                        ) : (
                            sortedPayments.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                                        {new Date(p.payment_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-vayu-green">
                                        {p.sale_no}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-gray-900">
                                        ₹{p.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase border ${p.payment_mode === 'UPI' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                            }`}>
                                            {p.payment_mode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-600">
                                        {p.payment_mode === 'UPI' ? (
                                            <span className="text-blue-600 font-black">{p.upi_account || 'Main'}</span>
                                        ) : (
                                            <span className="text-orange-600 font-black">{p.cash_by_whom || '-'}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-600">
                                        {p.collected_by}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase">
                                            <CheckCircle2 size={12} /> Verified
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PaymentManagement
