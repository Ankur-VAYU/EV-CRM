import React, { useState, useMemo } from 'react'
import { useStore } from '../../store'
import {
    TrendingUp,
    Users,
    Package,
    Clock,
    AlertCircle,
    Zap,
    Wrench,
    Calendar,
    ChevronDown,
    ShoppingCart,
    MapPin,
    CheckCircle,
    Activity
} from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

function AdminDashboard() {
    const [dateRange, setDateRange] = useState('this_month')
    const [customRange, setCustomRange] = useState({ start: '', end: '' })
    const [showRangePicker, setShowRangePicker] = useState(false)
    const [selectedShowroom, setSelectedShowroom] = useState('All Showrooms')
    const [showShowroomPicker, setShowShowroomPicker] = useState(false)
    const [selectedKPI, setSelectedKPI] = useState('salesVolume')

    const { leads, sales, getKPIs, getDailyTrend, showrooms } = useStore()

    const dateFilter = useMemo(() => {
        const now = new Date()
        const start = new Date()
        const end = new Date()

        switch (dateRange) {
            case 'today':
                start.setHours(0, 0, 0, 0)
                break
            case 'this_week': {
                const day = now.getDay()
                const diff = now.getDate() - day + (day === 0 ? -6 : 1)
                start.setDate(diff)
                start.setHours(0, 0, 0, 0)
                break
            }
            case 'this_month':
                start.setDate(1)
                start.setHours(0, 0, 0, 0)
                break
            case 'custom':
                if (customRange.start && customRange.end) {
                    return { start: customRange.start, end: customRange.end }
                }
                return { start: null, end: null }
            default:
                return { start: null, end: null }
        }
        return { start: start.toISOString(), end: end.toISOString() }
    }, [dateRange, customRange])

    const kpis = getKPIs(dateFilter.start, dateFilter.end, selectedShowroom)
    const trendData = useMemo(() => {
        return getDailyTrend(selectedKPI, dateFilter.start, dateFilter.end, selectedShowroom)
    }, [selectedKPI, dateFilter, getDailyTrend, selectedShowroom])

    const stats = [
        { id: 'salesVolume', label: 'Sales Volume', value: kpis.salesVolume, subtext: 'Units Sold', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'salesRevenue', label: 'Sales Revenue', value: `₹${(kpis.salesRevenue / 1000).toFixed(0)}k`, subtext: 'Gross Earnings', icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-100/50' },
        { id: 'serviceVolume', label: 'Service Volume', value: kpis.serviceVolume, subtext: 'Completed Jobs', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'serviceRevenue', label: 'Service Revenue', value: `₹${(kpis.serviceRevenue / 1000).toFixed(1)}k`, subtext: 'Maintenance Income', icon: Package, color: 'text-blue-700', bg: 'bg-blue-100/50' },
        { id: 'avgResponseTime', label: 'Avg Response Time', value: `${kpis.avgResponseTime}m`, subtext: kpis.avgResponseTime < 30 ? 'Within SLA' : 'Above Target', icon: Clock, color: kpis.avgResponseTime < 30 ? 'text-emerald-600' : 'text-orange-600', bg: kpis.avgResponseTime < 30 ? 'bg-emerald-50' : 'bg-orange-50' },
        { id: 'rsaVolume', label: 'RSA Volume', value: kpis.rsaVolume, subtext: 'Roadside Dispatches', icon: MapPin, color: 'text-rose-600', bg: 'bg-rose-50' },
        { id: 'leadsVolume', label: 'Total Leads', value: kpis.leadsVolume, subtext: 'Inquiry Pipeline', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'conversionRate', label: 'Lead Conversion', value: `${kpis.conversionRate}%`, subtext: 'Conversion Efficiency', icon: CheckCircle, color: 'text-indigo-700', bg: 'bg-indigo-100/50' },
    ]

    const ranges = [
        { id: 'today', name: 'Today' },
        { id: 'this_week', name: 'This Week' },
        { id: 'this_month', name: 'This Month' },
        { id: 'custom', name: 'Custom Range' },
    ]

    const currentKPI = stats.find(s => s.id === selectedKPI)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 font-sans tracking-tight">Showroom Intelligence</h2>
                    <p className="text-gray-600 font-bold">Monitoring VAYU EV operations across locations</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Showroom Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setShowShowroomPicker(!showShowroomPicker)}
                            className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-vayu-green transition-all"
                        >
                            <MapPin size={18} className="text-vayu-green" />
                            <span className="text-sm font-bold text-black">{selectedShowroom}</span>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showShowroomPicker ? 'rotate-180' : ''}`} />
                        </button>

                        {showShowroomPicker && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                                {['All Showrooms', ...showrooms].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => { setSelectedShowroom(s); setShowShowroomPicker(false); }}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${selectedShowroom === s ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Date Picker */}
                    <div className="relative">
                        <button
                            onClick={() => setShowRangePicker(!showRangePicker)}
                            className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-vayu-green transition-all"
                        >
                            <Calendar size={18} className="text-vayu-green" />
                            <span className="text-sm font-bold text-gray-700">{ranges.find(r => r.id === dateRange)?.name}</span>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showRangePicker ? 'rotate-180' : ''}`} />
                        </button>

                        {showRangePicker && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                                {ranges.map(range => (
                                    <button
                                        key={range.id}
                                        onClick={() => { setDateRange(range.id); if (range.id !== 'custom') setShowRangePicker(false); }}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${dateRange === range.id ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {range.name}
                                    </button>
                                ))}
                                {dateRange === 'custom' && (
                                    <div className="mt-2 p-2 space-y-2 border-t border-gray-50">
                                        <input type="date" className="w-full p-2 bg-gray-50 rounded-lg text-xs" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} />
                                        <input type="date" className="w-full p-2 bg-gray-50 rounded-lg text-xs" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} />
                                        <button onClick={() => setShowRangePicker(false)} className="w-full py-2.5 bg-gray-100 border-2 border-vayu-green text-black rounded-xl text-[10px] font-black uppercase hover:bg-white transition-all shadow-sm">Submit Range</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <button
                        key={stat.id}
                        onClick={() => setSelectedKPI(stat.id)}
                        className={`text-left p-8 rounded-[2rem] border transition-all relative overflow-hidden group outline-none ${selectedKPI === stat.id
                            ? 'bg-[#14452F] border-[#14452F] shadow-2xl scale-[1.02] -translate-y-1'
                            : 'bg-white border-gray-50 shadow-sm hover:shadow-md hover:border-gray-200'
                            }`}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} -mr-8 -mt-8 rounded-full blur-3xl ${selectedKPI === stat.id ? 'opacity-20' : 'opacity-40 group-hover:opacity-80'} transition-opacity`}></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedKPI === stat.id ? 'bg-white/10' : stat.bg}`}>
                                    <stat.icon className={selectedKPI === stat.id ? 'text-[#F4B400]' : stat.color} size={24} />
                                </div>
                                {selectedKPI === stat.id && <Activity size={16} className="text-[#F4B400] animate-pulse" />}
                            </div>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedKPI === stat.id ? 'text-[#F4B400]' : 'text-gray-600'}`}>{stat.label}</p>
                            <h3 className={`text-3xl font-black ${selectedKPI === stat.id ? 'text-white' : 'text-gray-900'}`}>{stat.value}</h3>
                            <p className={`text-[10px] font-bold mt-2 flex items-center gap-1 italic ${selectedKPI === stat.id ? 'text-white/60' : 'text-gray-600'}`}>{stat.subtext}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Analytics Trend Graph */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-vayu-green/10">
                    <div className="h-full bg-vayu-green transition-all duration-700 ease-out" style={{ width: '100%' }}></div>
                </div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                            <Activity className={currentKPI?.color} size={20} />
                            {currentKPI?.label} Trend Log
                        </h3>
                        <p className="text-xs font-black text-gray-600 uppercase tracking-widest mt-1">Daily breakdown for selected timeline</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-gray-900">{currentKPI?.value}</p>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Selected Total</p>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14452F" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#14452F" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }} itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }} labelStyle={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }} />
                            <Area type="monotone" dataKey="value" stroke="#14452F" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" animationDuration={1500} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><Users size={20} className="text-indigo-600" /> Recent Velocity (Leads)</h3>
                    <div className="space-y-4">
                        {leads.slice(0, 5).map(lead => (
                            <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-gray-400 group-hover:text-vayu-green">{lead.name[0]}</div>
                                    <div><p className="font-bold text-gray-900 text-sm">{lead.name}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{lead.source}</p></div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${lead.status === 'converted' ? 'bg-emerald-100 text-emerald-700' : lead.status === 'dismissed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{lead.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-emerald-600" /> Latest Sales Performance</h3>
                    <div className="space-y-4">
                        {sales.slice(0, 5).map(sale => (
                            <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><Zap size={18} fill="currentColor" /></div>
                                    <div><p className="font-bold text-gray-900 text-sm">{sale.customer_name}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{sale.vehicle_reg}</p></div>
                                </div>
                                <div className="text-right"><p className="font-black text-emerald-600">₹{(sale.selling_price / 1000).toFixed(0)}k</p><p className="text-[9px] text-gray-400 font-bold">{new Date(sale.sale_date).toLocaleDateString()}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
