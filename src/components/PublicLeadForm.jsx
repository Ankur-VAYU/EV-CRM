import React, { useState } from 'react'
import { CheckCircle2, ChevronDown, MapPin, Send, User } from 'lucide-react'

const API_URL = 'http://localhost:5001/api'; // Direct to backend

function PublicLeadForm() {
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        showroom: 'Main Showroom',
        filled_by: 'Customer',
        referral_code: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                ...formData,
                source: 'web-form', // Distinct source for these leads
                status: 'new',
                stage: 'Price discussion', // Default stage
                notes: 'Submitted via Public Link'
            }

            const res = await fetch(`${API_URL}/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setSubmitted(true)
            } else {
                alert('Something went wrong. Please try again.')
            }
        } catch (error) {
            console.error(error)
            alert('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">Thank You!</h2>
                    <p className="text-gray-600">
                        Your interest has been recorded.<br />
                        Our team from <b>{formData.showroom}</b> will contact you shortly.
                    </p>
                    <button
                        onClick={() => {
                            setSubmitted(false)
                            setFormData({
                                name: '',
                                phone: '',
                                showroom: 'Main Showroom',
                                filled_by: 'Customer',
                                referral_code: ''
                            })
                        }}
                        className="text-vayu-green font-bold text-sm hover:underline mt-4"
                    >
                        Submit another response
                    </button>
                    <div className="pt-8 border-t border-gray-100">
                        <p className="text-xs text-gray-400 font-black italic">VAYU EV</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-black p-6 text-center">
                    <h1 className="text-3xl font-black text-vayu-green italic mb-2">VAYU EV</h1>
                    <p className="text-white/80 text-sm font-medium">Interest Form</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">Your Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-vayu-green/20 focus:border-vayu-green transition-all"
                                    placeholder="e.g. Amit Singh"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">Phone Number</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">+91</span>
                                <input
                                    type="tel"
                                    required
                                    pattern="[0-9]{10}"
                                    maxLength="10"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-vayu-green/20 focus:border-vayu-green transition-all"
                                    placeholder="98765 43210"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider pl-1">Preferred Showroom</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} />
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-vayu-green/20 focus:border-vayu-green transition-all appearance-none cursor-pointer"
                                    value={formData.showroom}
                                    onChange={e => setFormData({ ...formData, showroom: e.target.value })}
                                >
                                    <option>Main Showroom</option>
                                    <option>VAYU North</option>
                                    <option>VAYU South</option>
                                    <option>VAYU West</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-vayu-green focus:ring-vayu-green"
                                    checked={formData.filled_by === 'Referral'}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        filled_by: e.target.checked ? 'Referral' : 'Customer',
                                        referral_code: ''
                                    })}
                                />
                                <span className="text-xs font-bold text-gray-500 group-hover:text-gray-700 transition-colors">I have a Referral Code</span>
                            </label>

                            {formData.filled_by === 'Referral' && (
                                <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                                    <input
                                        type="text"
                                        className="w-full bg-vayu-green/5 border border-vayu-green/30 rounded-xl py-2 px-4 text-sm font-bold text-vayu-green placeholder:text-vayu-green/40 outline-none focus:ring-2 focus:ring-vayu-green/20"
                                        placeholder="Enter Referral Code"
                                        value={formData.referral_code}
                                        onChange={e => setFormData({ ...formData, referral_code: e.target.value })}
                                        required={formData.filled_by === 'Referral'}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-vayu-green py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-gray-900 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-vayu-green/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : <><Send size={16} /> Submit Interest</>}
                    </button>

                    <p className="text-[10px] text-center text-gray-400 px-4">
                        By submitting this form, you agree to receive updates from VAYU EV via WhatsApp/SMS.
                    </p>
                </form>
            </div>
        </div>
    )
}

export default PublicLeadForm
