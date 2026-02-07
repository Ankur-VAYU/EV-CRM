import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import { Plus, X, Eye, Filter, ArrowUpDown, Calendar, User, Tag, MapPin, Wallet, Download } from 'lucide-react'

function SalesManagement() {
    const { user, sales = [], showrooms = [], fetchSales } = useStore()
    const isAdmin = ['admin', 'super_admin'].includes(user?.role)
    const [selectedSale, setSelectedSale] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Filters & Sorting State
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        salesperson: '',
        referral: '',
        showroom: 'All Showrooms',
        paymentType: 'All'
    })
    const [sortConfig, setSortConfig] = useState({ key: 'sale_date', direction: 'desc' })

    useEffect(() => {
        fetchSales()
    }, [fetchSales])

    const totalRevenue = (sales || []).reduce((sum, s) => sum + (s.selling_price || 0), 0)

    // Derived Data: Unique lists for filters
    const salespersons = [...new Set((sales || []).map(s => s.salesperson).filter(Boolean))]
    const referrals = [...new Set((sales || []).map(s => s.referral).filter(Boolean))]

    // Filter Logic
    const filteredSales = (sales || []).filter(sale => {
        const matchesSearch = (sale.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (sale.sale_no?.toLowerCase() || '').includes(searchTerm.toLowerCase())

        const saleDateStr = sale.sale_date ? new Date(sale.sale_date).getTime() : 0
        const startTimestamp = filters.startDate ? new Date(filters.startDate).getTime() : 0
        const endTimestamp = filters.endDate ? new Date(filters.endDate).getTime() : Infinity

        const matchesStartDate = !filters.startDate || saleDateStr >= startTimestamp
        const matchesEndDate = !filters.endDate || saleDateStr <= endTimestamp

        const matchesSalesperson = !filters.salesperson || sale.salesperson === filters.salesperson
        const matchesReferral = !filters.referral || sale.referral === filters.referral
        const matchesShowroom = filters.showroom === 'All Showrooms' || sale.showroom === filters.showroom
        const matchesPayment = filters.paymentType === 'All' || (sale.payment_mode || '').toLowerCase() === filters.paymentType.toLowerCase()

        return matchesSearch && matchesStartDate && matchesEndDate &&
            matchesSalesperson && matchesReferral && matchesShowroom && matchesPayment
    })

    // Sort Logic
    const sortedSales = [...filteredSales].sort((a, b) => {
        if (!sortConfig.key) return 0

        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        if (sortConfig.key === 'sale_date') {
            aValue = new Date(aValue || 0).getTime()
            bValue = new Date(bValue || 0).getTime()
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
    })

    const requestSort = (key) => {
        let direction = 'desc'
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc'
        }
        setSortConfig({ key, direction })
    }

    const downloadCSV = () => {
        const headers = [
            'Sale No', 'Customer Name', 'Phone', 'Vehicle Reg', 'Vehicle Model', 'Vehicle SKU',
            'Selling Price', 'Payment Mode', 'UPI Amount', 'Cash Amount', 'Collected By',
            'Down Payment', 'Finance Bank', 'Loan No', 'EMI', 'Tenure', 'Start Date',
            'Showroom', 'Salesperson', 'Referral', 'Aadhar', 'Address', 'Sale Date', 'Business Type'
        ]

        const rows = sortedSales.map(s => [
            s.sale_no || '-',
            s.customer_name,
            s.phone || '-',
            s.vehicle_reg,
            s.vehicle_model || '-',
            s.vehicle_sku || '-',
            s.selling_price,
            s.payment_mode,
            s.cash_upi_amount || 0,
            s.cash_cash_amount || 0,
            s.cash_collected_by || '-',
            s.finance_down_payment || 0,
            s.finance_bank || '-',
            s.finance_loan_number || '-',
            s.finance_emi || 0,
            s.finance_tenure || 0,
            s.finance_start_date || '-',
            s.showroom,
            s.salesperson || 'System',
            s.referral || 'none',
            s.aadhar_number || '-',
            `"${s.address || '-'}"`, // Wrap address in quotes to handle commas
            s.sale_date ? new Date(s.sale_date).toLocaleDateString() : '-',
            s.business_type || 'sale'
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Sales Management</h2>
                    <p className="text-gray-600">Total Revenue: ₹{(totalRevenue / 1000).toFixed(0)}k from {filteredSales.length} records</p>
                </div>
                <div className="flex gap-4">
                    {isAdmin && (
                        <button
                            onClick={downloadCSV}
                            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors"
                        >
                            <Download size={16} /> Export CSV
                        </button>
                    )}
                    <input
                        type="text"
                        placeholder="Search Sales..."
                        className="input-field max-w-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center gap-4">
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
                        <User size={14} className="text-gray-400" />
                        <select
                            className="bg-transparent text-xs font-bold outline-none"
                            value={filters.salesperson}
                            onChange={e => setFilters({ ...filters, salesperson: e.target.value })}
                        >
                            <option value="">All Salespersons</option>
                            {salespersons.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <Tag size={14} className="text-gray-400" />
                        <select
                            className="bg-transparent text-xs font-bold outline-none"
                            value={filters.referral}
                            onChange={e => setFilters({ ...filters, referral: e.target.value })}
                        >
                            <option value="">All Referrals</option>
                            {referrals.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <MapPin size={14} className="text-gray-400" />
                        <select
                            className="bg-transparent text-xs font-bold outline-none"
                            value={filters.showroom}
                            onChange={e => setFilters({ ...filters, showroom: e.target.value })}
                        >
                            <option value="All Showrooms">All Showrooms</option>
                            {showrooms.filter(s => s !== 'All Showrooms').map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <Wallet size={14} className="text-gray-400" />
                        <select
                            className="bg-transparent text-xs font-bold outline-none"
                            value={filters.paymentType}
                            onChange={e => setFilters({ ...filters, paymentType: e.target.value })}
                        >
                            <option value="All">All Payments</option>
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Finance">Finance</option>
                        </select>
                    </div>

                    {(filters.startDate || filters.endDate || filters.salesperson || filters.referral || filters.showroom !== 'All Showrooms' || filters.paymentType !== 'All') && (
                        <button
                            onClick={() => setFilters({ startDate: '', endDate: '', salesperson: '', referral: '', showroom: 'All Showrooms', paymentType: 'All' })}
                            className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                            <X size={12} /> Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Sale Detail Modal */}
            {selectedSale && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSale(null)}>
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">Sale Details</h3>
                                <p className="text-sm text-gray-500 font-bold">{selectedSale.sale_no}</p>
                            </div>
                            <button onClick={() => setSelectedSale(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer & Vehicle Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Customer Name</label>
                                    <p className="text-lg font-bold text-gray-900">{selectedSale.customer_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Vehicle Registration</label>
                                    <p className="text-lg font-bold text-gray-900">{selectedSale.vehicle_reg}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Sale Date</label>
                                    <p className="text-lg font-bold text-gray-900">{selectedSale.sale_date ? new Date(selectedSale.sale_date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Showroom</label>
                                    <p className="text-lg font-bold text-gray-900">{selectedSale.showroom}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Aadhar / ID</label>
                                    <p className="text-lg font-bold text-gray-900">{selectedSale.aadhar_number || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Alt Phone</label>
                                    <p className="text-lg font-bold text-gray-900">{selectedSale.alt_phone || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Vehicle Model / SKU</label>
                                    <p className="text-lg font-bold text-vayu-green">{selectedSale.vehicle_model || 'N/A'} <span className="text-xs text-gray-400">({selectedSale.vehicle_sku || 'no-sku'})</span></p>
                                </div>
                                <div className="col-span-2 space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Registered Address</label>
                                    <p className="text-sm font-semibold text-gray-700">{selectedSale.address || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h4 className="text-sm font-black text-gray-900 uppercase mb-4">Financial Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Selling Price</label>
                                        <p className="text-2xl font-black text-vayu-green">₹{selectedSale.selling_price?.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Payment Mode</label>
                                        <p className="text-lg font-bold text-gray-900 capitalize">{selectedSale.payment_mode}</p>
                                    </div>

                                    {selectedSale.payment_mode === 'cash' && (
                                        <>
                                            {selectedSale.cash_upi_amount > 0 && (
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-400 uppercase">UPI Amount</label>
                                                    <p className="text-lg font-bold text-gray-900">₹{selectedSale.cash_upi_amount?.toLocaleString()}</p>
                                                </div>
                                            )}
                                            {selectedSale.cash_cash_amount > 0 && (
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-400 uppercase">Cash Amount</label>
                                                    <p className="text-lg font-bold text-gray-900">₹{selectedSale.cash_cash_amount?.toLocaleString()}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-6 bg-gray-50/50 -mx-6 px-6 pb-6 shadow-inner">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 mt-2">Sale Attribution</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Salesperson (Ops)</label>
                                        <p className="text-lg font-black text-gray-900">{selectedSale.salesperson || 'System'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Referral / Source Info</label>
                                        <p className="text-lg font-bold text-gray-900">{selectedSale.referral || 'none'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h4 className="text-sm font-black text-gray-900 uppercase mb-4">Battery Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Battery Type</label>
                                        <p className="text-lg font-bold text-gray-900">{selectedSale.battery_type || 'N/A'}</p>
                                    </div>
                                    {selectedSale.battery_id && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Battery Name / SKU</label>
                                            <p className="text-lg font-bold text-gray-900">{selectedSale.battery_id} <span className="text-xs text-gray-400">({selectedSale.battery_sku || 'no-sku'})</span></p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                                <button onClick={() => requestSort('sale_no')} className="flex items-center gap-1 hover:text-vayu-green transition-colors uppercase">
                                    Sale No <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                                <button onClick={() => requestSort('customer_name')} className="flex items-center gap-1 hover:text-vayu-green transition-colors uppercase">
                                    Customer <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Vehicle Details</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                                <button onClick={() => requestSort('showroom')} className="flex items-center gap-1 hover:text-vayu-green transition-colors uppercase">
                                    Showroom <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                                <button onClick={() => requestSort('selling_price')} className="flex items-center gap-1 hover:text-vayu-green transition-colors uppercase">
                                    Price <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Attribution</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                                <button onClick={() => requestSort('sale_date')} className="flex items-center gap-1 hover:text-vayu-green transition-colors uppercase">
                                    Date <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSales.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-6 py-12 text-center text-gray-400 font-bold">No sales records found.</td>
                            </tr>
                        ) : (
                            sortedSales.map(sale => (
                                <tr key={sale.id} className="table-row hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedSale(sale)}>
                                    <td className="px-6 py-4 text-sm font-black text-vayu-green">{sale.sale_no || `SALE-${String(sale.id).padStart(4, '0')}`}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{sale.customer_name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-semibold text-gray-900">{sale.vehicle_reg}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{sale.vehicle_model || 'Unspecified'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400 font-bold">{sale.showroom}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-600">₹{(sale.selling_price / 1000).toFixed(0)}k</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{sale.payment_mode}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] font-bold text-gray-900">👤 {sale.salesperson || 'System'}</p>
                                            <p className="text-[9px] font-medium text-gray-400">Ref: {sale.referral || 'none'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${sale.business_type === 'service' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                            {sale.business_type || 'sale'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{sale.sale_date ? new Date(sale.sale_date).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedSale(sale); }} className="p-2 hover:bg-vayu-green/10 rounded-lg">
                                            <Eye size={16} className="text-vayu-green" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    )
}

export default SalesManagement
