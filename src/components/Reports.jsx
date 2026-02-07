import React from 'react'
import { useStore } from '../store'
import { FileText, TrendingUp, DollarSign, Users, Download } from 'lucide-react'

function Reports() {
    const { sales, serviceRecords, leads, inventory, downloadBackup } = useStore()

    const thisMonth = new Date().getMonth()
    const monthlySales = sales.filter(s => new Date(s.sale_date).getMonth() === thisMonth)
    const monthlyServices = serviceRecords.filter(s => new Date(s.service_date).getMonth() === thisMonth && s.status === 'completed')

    const salesRevenue = monthlySales.reduce((sum, s) => sum + s.selling_price, 0)
    const serviceRevenue = monthlyServices.reduce((sum, s) => sum + s.total_charge, 0)
    const totalRevenue = salesRevenue + serviceRevenue

    const cogs = monthlySales.length * 26000 // ₹26k per unit
    const opex = 47000
    const netProfit = salesRevenue - cogs - opex + serviceRevenue

    const convertedLeads = leads.filter(l => l.status === 'converted').length
    const conversionRate = leads.length > 0 ? ((convertedLeads / leads.length) * 100).toFixed(1) : 0

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
                    <p className="text-gray-600">Monthly performance summary</p>
                </div>
                <button
                    onClick={downloadBackup}
                    className="btn-secondary flex items-center gap-2 border border-gray-200"
                >
                    <Download size={18} /> Export Data Backup
                </button>
            </div>

            {/* P&L Summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign size={20} className="text-green-600" />
                    Monthly P&L Statement
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-700">Sales Revenue ({monthlySales.length} units)</span>
                        <span className="font-bold text-green-600">₹{(salesRevenue / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-700">Service Revenue ({monthlyServices.length} services)</span>
                        <span className="font-bold text-green-600">₹{(serviceRevenue / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-semibold text-gray-900">Total Revenue</span>
                        <span className="font-bold text-green-600">₹{(totalRevenue / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-700">COGS (Cost of Goods Sold)</span>
                        <span className="font-bold text-red-600">-₹{(cogs / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-700">OPEX (Operating Expenses)</span>
                        <span className="font-bold text-red-600">-₹{(opex / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between py-3 bg-gray-50 px-4 rounded-lg">
                        <span className="font-bold text-gray-900 text-lg">Net Profit</span>
                        <span className={`font-bold text-lg ${netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{(netProfit / 1000).toFixed(0)}k
                        </span>
                    </div>
                </div>
            </div>

            {/* KPI Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="text-blue-600" size={24} />
                        <h4 className="font-bold text-gray-900">Lead Conversion</h4>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
                    <p className="text-sm text-gray-600 mt-1">{convertedLeads} of {leads.length} leads converted</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <Users className="text-purple-600" size={24} />
                        <h4 className="font-bold text-gray-900">Uptime Pass</h4>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {monthlySales.length > 0 ? ((monthlySales.filter(s => s.uptime_pass === 1 || s.uptime_pass === true).length / monthlySales.length) * 100).toFixed(0) : 0}%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Adoption rate this month</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <FileText className="text-green-600" size={24} />
                        <h4 className="font-bold text-gray-900">Avg Service Value</h4>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        ₹{monthlyServices.length > 0 ? (serviceRevenue / monthlyServices.length).toFixed(0) : 0}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Per service transaction</p>
                </div>
            </div>
        </div>
    )
}

export default Reports
