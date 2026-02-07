import React from 'react'
import { useStore } from '../../store'
import {
    Bike,
    Calendar,
    Wrench,
    MapPin,
    Phone,
    Battery,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react'

function CustomerDashboard() {
    const { user, customers, rsaTracking, requestRSA } = useStore()

    // Attempt to link logged-in user to a customer record
    const myProfile = customers?.find(c => c.name?.toLowerCase() === user.name?.toLowerCase()) || customers[0]

    // RSA Status
    const myActiveRSA = (rsaTracking || []).find(r => r.customer_name === user.name && r.status !== 'completed')

    if (!myProfile) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="bg-gray-100 p-6 rounded-full">
                    <Bike size={48} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">No Vehicle Linked</h2>
                <p className="text-gray-500 max-w-md">
                    We couldn't automaticially find a vehicle registered to <b>{user.name}</b>.
                    Please contact support to link your account.
                </p>
            </div>
        )
    }

    const isUptimeActive = myProfile.uptime_pass_status === 'active' || myProfile.uptime_pass_status === 'Active'

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 font-sans tracking-tight">My VAYU</h2>
                    <p className="text-gray-500 font-medium">Welcome back, {user.name}</p>
                </div>
                <div className="bg-black/5 px-4 py-2 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-gray-400">Support ID</p>
                    <p className="font-bold text-gray-900 flex items-center gap-2">#{myProfile.id.toString().padStart(4, '0')}</p>
                </div>
            </div>

            {/* Vehicle Card */}
            <div className="relative bg-black rounded-[2.5rem] p-8 text-white overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-vayu-green/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <span className="w-2 h-2 rounded-full bg-vayu-green animate-pulse"></span>
                            {isUptimeActive ? 'Uptime Pass Active' : 'Warranty Standard'}
                        </div>
                        <h3 className="text-4xl font-black italic tracking-tighter mb-2">VAYU {myProfile.vehicle_registration || 'SCOOTER'}</h3>
                        <p className="text-white/60 font-medium mb-8">Registered: {myProfile.purchase_date ? new Date(myProfile.purchase_date).toLocaleDateString() : 'New Vehicle'}</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Battery Health</p>
                                <p className="text-xl font-black flex items-center gap-2">98% <Battery size={16} className="text-vayu-green" /></p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Next Service</p>
                                <p className="text-xl font-black flex items-center gap-2">Oct 24 <Calendar size={16} className="text-vayu-yellow" /></p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex justify-center">
                        {/* Placeholder for scooter image */}
                        <img src="/assets/vayu-logo.png" className="w-64 h-64 object-contain opacity-20 grayscale brightness-200" alt="Scooter" />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group text-left">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-vayu-green text-gray-900 group-hover:text-white transition-colors">
                        <Wrench size={24} />
                    </div>
                    <p className="font-bold text-gray-900">Book Service</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Schedule Maintenance</p>
                </button>

                <button
                    onClick={() => {
                        const location = prompt("Enter your current location for RSA:");
                        if (location) requestRSA(myProfile.id, location, 'Emergency Breakdown');
                    }}
                    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group text-left relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-full blur-xl -mr-8 -mt-8"></div>
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4 text-red-600 transition-colors relative z-10">
                        <AlertTriangle size={24} />
                    </div>
                    <p className="font-bold text-gray-900 relative z-10">Request RSA</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 relative z-10">Emergency Help</p>
                </button>

                <button className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group text-left">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 text-gray-900 group-hover:text-white transition-colors">
                        <ShieldCheck size={24} />
                    </div>
                    <p className="font-bold text-gray-900">Warranty Info</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Uptime Pass</p>
                </button>

                <button className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group text-left">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-black text-gray-900 group-hover:text-white transition-colors">
                        <Phone size={24} />
                    </div>
                    <p className="font-bold text-gray-900">Contact Support</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Get Help 24/7</p>
                </button>
            </div>

            {myActiveRSA && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-3xl animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-full">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-red-900">RSA Team Dispatched</h3>
                            <p className="text-sm text-red-700 font-medium">Help is on the way to: <b>{myActiveRSA.location}</b></p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomerDashboard
