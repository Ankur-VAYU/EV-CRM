import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import { Users, UserPlus, Trash2, MapPin, Phone, CreditCard, Tag, Search } from 'lucide-react'

function ReferralManagement() {
    const { referrals, addReferral, deleteReferral, user, fetchReferrals } = useStore()

    useEffect(() => {
        fetchReferrals()
    }, [fetchReferrals])

    const [showAddModal, setShowAddModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        pan_no: '',
        aadhar_no: '',
        referral_code: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        const success = await addReferral(formData)
        if (success) {
            setShowAddModal(false)
            setFormData({ name: '', phone: '', address: '', pan_no: '', aadhar_no: '', referral_code: '' })
        } else {
            alert('Failed to add referral. Code might already exist.')
        }
    }

    const filteredReferrals = referrals.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referral_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone.includes(searchTerm)
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-vayu-green" /> Referral Network
                    </h2>
                    <p className="text-gray-600">Manage partners and their unique referral codes</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-vayu-green text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                >
                    <UserPlus size={20} /> Add Partner
                </button>
            </div>

            {/* Stats & Search */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm md:col-span-3 flex items-center gap-4">
                    <Search className="text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, code, or phone..."
                        className="flex-1 outline-none text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Active Partners</p>
                    <p className="text-2xl font-black text-indigo-600 leading-none">{referrals.length}</p>
                </div>
                <div className="bg-vayu-green/10 p-6 rounded-3xl border border-vayu-green/20 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase text-vayu-green tracking-widest">Total Conversions</p>
                    <p className="text-2xl font-black text-vayu-green leading-none">
                        {referrals.reduce((sum, r) => sum + (r.conversion_count || 0), 0)}
                    </p>
                </div>
                <div className="bg-vayu-yellow/10 p-6 rounded-3xl border border-vayu-yellow/20 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase text-vayu-yellow-dark tracking-widest">Earnings Issued</p>
                    <p className="text-2xl font-black text-vayu-yellow-dark leading-none">
                        ₹{referrals.reduce((sum, r) => sum + (r.total_earned || 0), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner Details</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Referral Code</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Conversions</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Rewards/Sale</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Total Earned</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredReferrals.map(referral => (
                            <tr key={referral.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                                            {referral.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{referral.name}</p>
                                            <div className="flex flex-col gap-0.5 mt-1">
                                                <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Phone size={10} /> {referral.phone}</p>
                                                <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><MapPin size={10} /> {referral.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-vayu-yellow/10 text-vayu-yellow-dark rounded-xl border border-vayu-yellow/20">
                                        <Tag size={12} />
                                        <span className="text-xs font-black tracking-widest uppercase">{referral.referral_code}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-vayu-green/10 text-vayu-green font-black">
                                        {referral.conversion_count || 0}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1 group/amt">
                                        <span className="text-xs font-bold text-gray-400">₹</span>
                                        <input
                                            type="number"
                                            className="w-16 bg-transparent border-b border-dashed border-gray-200 text-center font-black text-sm focus:border-vayu-green outline-none"
                                            value={referral.referral_amount || 500}
                                            onChange={(e) => useStore.getState().updateReferral(referral.id, parseInt(e.target.value))}
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <p className="font-black text-gray-900">₹{(referral.total_earned || 0).toLocaleString()}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => window.confirm('Delete this partner?') && deleteReferral(referral.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredReferrals.length === 0 && (
                    <div className="p-12 text-center text-gray-400 italic text-sm">No referral partners found.</div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">New Referral Partner</h3>
                                <p className="text-sm text-gray-500 font-medium">Register a new partner in the VAYU network</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-400 text-2xl">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Partner Name</label>
                                    <input
                                        required
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-vayu-green focus:bg-white rounded-2xl px-4 py-3 outline-none transition-all font-bold text-sm"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-vayu-green focus:bg-white rounded-2xl px-4 py-3 outline-none transition-all font-bold text-sm"
                                        placeholder="10-digit Mobile"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Full Address</label>
                                    <input
                                        required
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-vayu-green focus:bg-white rounded-2xl px-4 py-3 outline-none transition-all font-bold text-sm"
                                        placeholder="Current Residential Address"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">PAN Number</label>
                                    <input
                                        required
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-vayu-green focus:bg-white rounded-2xl px-4 py-3 outline-none transition-all font-bold text-sm uppercase"
                                        placeholder="ABCDE1234F"
                                        value={formData.pan_no}
                                        onChange={e => setFormData({ ...formData, pan_no: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Aadhar Number</label>
                                    <input
                                        required
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-vayu-green focus:bg-white rounded-2xl px-4 py-3 outline-none transition-all font-bold text-sm"
                                        placeholder="1234 5678 9012"
                                        value={formData.aadhar_no}
                                        onChange={e => setFormData({ ...formData, aadhar_no: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-vayu-green tracking-widest ml-1">Referral Code (Must be Unique)</label>
                                    <input
                                        required
                                        className="w-full bg-vayu-green/5 border-2 border-vayu-green/20 focus:border-vayu-green focus:bg-white rounded-2xl px-4 py-3 outline-none transition-all font-black text-sm uppercase tracking-widest"
                                        placeholder="E.G. VAYU-PARTNER-001"
                                        value={formData.referral_code}
                                        onChange={e => setFormData({ ...formData, referral_code: e.target.value.toUpperCase().replace(/\s/g, '-') })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 rounded-2xl bg-vayu-green text-white font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                                >
                                    Register Partner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ReferralManagement
