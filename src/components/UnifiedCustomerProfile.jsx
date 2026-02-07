import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import {
    User,
    MapPin,
    Wrench,
    ShoppingCart,
    Clock,
    ChevronRight,
    Search,
    ArrowLeft,
    Calendar,
    Phone,
    Hash,
    Activity,
    UserCheck,
    ShieldCheck,
    Tag,
    Zap,
    CreditCard,
    Wallet,
    Info,
    Truck
} from 'lucide-react'

function UnifiedCustomerProfile() {
    const {
        user,
        customers = [],
        serviceRecords = [],
        sales = [],
        rsaTracking = [],
        inventory = [],
        fetchCustomers,
        fetchSales,
        fetchServiceRecords,
        fetchInventory,
        fetchRSATracking
    } = useStore()
    const [selectedCustomerId, setSelectedCustomerId] = useState(user?.role === 'customer' ? user.customer_id : null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchCustomers()
        fetchSales()
        fetchServiceRecords()
        fetchInventory()
        fetchRSATracking()
    }, [])

    const filteredCustomers = customers.filter(c =>
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.vehicle_registration || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(c.phone || '').includes(searchQuery)
    )

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

    const customerSales = selectedCustomer
        ? sales.filter(s =>
            s.vehicle_reg === selectedCustomer.vehicle_registration &&
            s.customer_name === selectedCustomer.name
        )
        : []

    const customerServices = selectedCustomer
        ? serviceRecords.filter(s => s.vehicle_registration === selectedCustomer.vehicle_registration)
        : []

    const getRSAForService = (serviceId) => {
        return rsaTracking.find(r => r.service_record_id === serviceId)
    }

    if (selectedCustomer) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {user?.role !== 'customer' && (
                    <button
                        onClick={() => setSelectedCustomerId(null)}
                        className="flex items-center gap-2 text-gray-500 hover:text-vayu-green font-bold text-sm transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Directory
                    </button>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Profile Card */}
                    <div className="w-full md:w-1/3 space-y-6">
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6 border border-gray-100">
                                    <User size={48} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900">{selectedCustomer.name}</h2>
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-vayu-green/5 text-vayu-green rounded-full text-[10px] font-black uppercase tracking-widest">
                                    <UserCheck size={12} /> {selectedCustomer.uptime_pass_status === 'active' ? 'Uptime Pass Active' : 'Standard Member'}
                                </div>
                            </div>

                            <div className="mt-8 space-y-4 pt-8 border-t border-gray-50">
                                <div className="flex items-center gap-4 text-gray-600">
                                    <Phone size={18} className="text-gray-300" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Mobile</p>
                                        <p className="font-bold text-gray-900">{selectedCustomer.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <Hash size={18} className="text-gray-300" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Registration</p>
                                        <p className="font-bold text-gray-900">{selectedCustomer.vehicle_registration}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <Phone size={18} className="text-gray-300" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Alt Mobile</p>
                                        <p className="font-bold text-gray-900">{selectedCustomer.alt_phone || 'Not Provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <MapPin size={18} className="text-gray-300" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Address</p>
                                        <p className="font-bold text-sm text-gray-900 line-clamp-2">{selectedCustomer.address || 'Not Provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <Calendar size={18} className="text-gray-300" />
                                    <div>
                                        <p className="text-[10px] font-black text-gray-600 uppercase leading-none mb-1">Member Since</p>
                                        <p className="font-bold text-gray-900">{new Date(selectedCustomer.purchase_date).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
                                    <div className="bg-vayu-green/10 rounded-2xl p-4 border border-vayu-green/20">
                                        <p className="text-[10px] font-black text-vayu-green uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Tag size={12} /> Personal Referral ID
                                        </p>
                                        <p className="text-xl font-black text-gray-900 tracking-tight">{selectedCustomer.referral_code || '---'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Identity Section */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                            <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Zap size={14} className="text-vayu-green" /> Linked Vehicle
                            </h3>
                            {(() => {
                                const vehicle = inventory.find(i => i.unique_no === selectedCustomer.vehicle_registration || i.chasis_no === selectedCustomer.vehicle_registration) ||
                                    inventory.find(i => i.item_name === selectedCustomer.vehicle_registration);

                                if (!vehicle) return <p className="text-xs text-gray-400 italic">No detailed asset technical data linked.</p>

                                return (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 font-black uppercase text-[10px]">Model</span>
                                            <span className="font-black text-gray-900">{vehicle.item_name}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 font-bold">Chasis No</span>
                                            <span className="font-black text-gray-900">{vehicle.chasis_no || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 font-bold">Motor No</span>
                                            <span className="font-black text-gray-900">{vehicle.motor_no || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 font-bold">Colour</span>
                                            <span className="font-black text-gray-900">{vehicle.colour || 'N/A'}</span>
                                        </div>
                                        <div className="pt-4 mt-4 border-t border-gray-50 flex items-center gap-2">
                                            <ShieldCheck size={16} className="text-vayu-green" />
                                            <p className="text-[10px] font-black text-gray-600 uppercase">Verification Passed</p>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-black text-gray-600 uppercase mb-2">Total Service</p>
                                <p className="text-2xl font-black text-gray-900">{customerServices.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-black text-gray-600 uppercase mb-2">Total LTV</p>
                                <p className="text-2xl font-black text-gray-900">₹{(customerSales.reduce((a, b) => a + b.selling_price, 0) / 1000).toFixed(0)}k</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / History */}
                    <div className="flex-1 space-y-6">
                        {/* Sales Info */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                                <ShoppingCart className="text-vayu-green" size={20} />
                                <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Purchase Records</h3>
                            </div>
                            <div className="p-6">
                                {customerSales.length > 0 ? (
                                    customerSales.map(sale => (
                                        <div key={sale.id} className="p-6 bg-gray-50/30 rounded-3xl border border-gray-100 mb-4 last:mb-0">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                        <Tag size={12} className="text-vayu-green" /> Invoice #{sale.sale_no || 'Pending'}
                                                    </p>
                                                    <h4 className="font-black text-gray-900 text-lg">{sale.vehicle_model || 'VAYU EV Delivery'}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-2xl text-vayu-green tracking-tighter">₹{sale.selling_price.toLocaleString()}</p>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase">{new Date(sale.sale_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-white p-3 rounded-xl border border-gray-50">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Financed By</p>
                                                    <p className="text-xs font-black text-gray-700 flex items-center gap-1">
                                                        {sale.payment_mode === 'finance' ? <Wallet size={12} className="text-blue-500" /> : <CreditCard size={12} className="text-green-500" />}
                                                        {sale.payment_mode === 'finance' ? (sale.finance_bank || 'Akasha') : 'Cash/UPI'}
                                                    </p>
                                                </div>
                                                {sale.payment_mode === 'finance' && (
                                                    <>
                                                        <div className="bg-white p-3 rounded-xl border border-gray-50">
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">EMI Amount</p>
                                                            <p className="text-xs font-black text-gray-700">₹{sale.finance_emi || 0} / {sale.finance_schedule}</p>
                                                        </div>
                                                        <div className="bg-white p-3 rounded-xl border border-gray-50">
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Tenure</p>
                                                            <p className="text-xs font-black text-gray-700">{sale.finance_tenure} Months</p>
                                                        </div>
                                                    </>
                                                )}
                                                <div className="bg-white p-3 rounded-xl border border-gray-50">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Down Payment</p>
                                                    <p className="text-xs font-black text-gray-700">₹{sale.payment_mode === 'finance' ? (sale.finance_down_payment || 0) : sale.selling_price}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-400 italic py-4">No direct sales record found for this VIN.</p>
                                )}
                            </div>
                        </div>

                        {/* Service & RSA History */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm uppercase">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                                <Activity className="text-orange-500" size={20} />
                                <h3 className="font-black text-gray-900 text-xs tracking-widest">Service & Roadside History</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {customerServices.length > 0 ? (
                                    customerServices.map(service => {
                                        const rsa = getRSAForService(service.id)
                                        return (
                                            <div key={service.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="p-1 bg-orange-100 text-orange-600 rounded">
                                                                {service.service_type === 'rsa' ? <MapPin size={14} /> : <Wrench size={14} />}
                                                            </span>
                                                            <p className="font-black text-gray-900">{(service.service_type || 'General Service').toUpperCase()}</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500 font-medium">{service.issue_description}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-gray-900">₹{service.total_charge}</p>
                                                        <p className="text-[9px] text-gray-400 font-bold">{new Date(service.service_date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>

                                                {rsa && (
                                                    <div className="ml-8 mt-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Clock size={12} className="text-blue-500" />
                                                            <p className="text-[9px] font-black text-blue-700">RSA DISPATCH LOG</p>
                                                        </div>
                                                        <p className="text-[10px] text-blue-600 font-bold">
                                                            Serviceman: {rsa.serviceman_name} • Location: {rsa.customer_location}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="p-10 text-center">
                                        <Wrench className="mx-auto text-gray-200 mb-4" size={48} />
                                        <p className="text-gray-400 italic">No service history recorded for this vehicle.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Customer Command Center</h2>
                    <p className="text-gray-700 font-bold">Full lifecycle history for all VAYU Riders</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Name, VIN or Mobile..."
                        className="pl-11 pr-6 py-3 bg-white border border-gray-100 rounded-2xl w-80 shadow-sm focus:ring-2 focus:ring-vayu-green/20 outline-none transition-all font-bold text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map(customer => (
                    <button
                        key={customer.id}
                        onClick={() => setSelectedCustomerId(customer.id)}
                        className="bg-white p-6 rounded-[2rem] border border-gray-100 text-left hover:border-vayu-green hover:shadow-xl hover:-translate-y-1 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-vayu-green/5 group-hover:text-vayu-green transition-colors">
                                <User size={28} />
                            </div>
                            <ChevronRight className="text-gray-200 group-hover:text-vayu-green group-hover:translate-x-1 transition-all" size={20} />
                        </div>
                        <h3 className="font-black text-gray-900 text-lg">{customer.name}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tight mt-1">{customer.vehicle_registration}</p>

                        <div className="mt-6 flex gap-2">
                            <div className="px-3 py-1 bg-gray-50 rounded-lg text-[9px] font-black text-gray-500 uppercase">
                                {serviceRecords.filter(s => s.vehicle_registration === customer.vehicle_registration).length} Services
                            </div>
                            {customer.uptime_pass_status === 'active' && (
                                <div className="px-3 py-1 bg-vayu-green text-[9px] font-black text-vayu-yellow rounded-lg uppercase">
                                    Uptime Pass
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default UnifiedCustomerProfile
