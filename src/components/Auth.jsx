import React, { useState } from 'react'
import { useStore } from '../store'
import { Zap, Shield, User, Wrench, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, Globe } from 'lucide-react'

const translations = {
    en: {
        title: 'VAYU EV',
        subtitle: '',
        emailLabel: 'Email Address',
        passwordLabel: 'Log-in Key',
        fullNameLabel: 'Full Name',
        roleLabel: 'Application Role',
        terms: 'I agree to the VAYU Independent Partner Terms & Code of Conduct.',
        loginBtn: 'Log-in',
        submitBtn: 'Submit Application',
        needAccount: 'Need a New Account? Apply Here',
        haveAccount: 'Already have access? Log in',
        adminHint: 'Global Admin Bypass:',
        roles: { admin: 'Admin', employee: 'Staff', customer: 'Rider' },
        errors: {
            email: 'Please enter a valid email address.',
            password: 'Log-in key must be at least 4 characters.',
            terms: 'You must agree to the Terms of Service.'
        },
        messages: {
            success: 'Registration successful! Please wait for Admin approval.'
        }
    },
    hi: {
        title: 'वायु EV',
        subtitle: '',
        emailLabel: 'ईमेल एड्रेस',
        passwordLabel: 'लॉग-इन की (Key)',
        fullNameLabel: 'पूरा नाम',
        roleLabel: 'आवेदन भूमिका (Role)',
        terms: 'मैं वायु स्वतंत्र भागीदार शर्तों और आचार संहिता से सहमत हूँ।',
        loginBtn: 'लॉग-इन करें',
        submitBtn: 'आवेदन जमा करें',
        needAccount: 'नया अकाउंट चाहिए? यहाँ आवेदन करें',
        haveAccount: 'पहले से एक्सेस है? लॉग इन करें',
        adminHint: 'ग्लोबल एडमिन बाईपास:',
        roles: { admin: 'एडमिन', employee: 'स्टाफ', customer: 'राइडर' },
        errors: {
            email: 'कृपया एक वैध ईमेल पता दर्ज करें।',
            password: 'लॉग-इन की कम से कम 4 अक्षरों की होनी चाहिए।',
            terms: 'आपको सेवा की शर्तों से सहमत होना होगा।'
        },
        messages: {
            success: 'पंजीकरण सफल! कृपया एडमिन की मंजूरी का इंतज़ार करें।'
        }
    }
}

function Auth() {
    const { login, register, riderLogin } = useStore()
    const [lang, setLang] = useState('en')
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loginRole, setLoginRole] = useState('employee') // 'employee' or 'rider'

    const t = translations[lang]

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phone: '',
        name: '',
        role: 'customer'
    })

    const [agreed, setAgreed] = useState(false)

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        if (isLogin) {
            if (loginRole === 'rider') {
                if (!/^\d{10}$/.test(formData.phone)) {
                    setError('Please enter a valid 10-digit mobile number.')
                    setLoading(false)
                    return
                }
                const res = await riderLogin(formData.phone)
                if (!res.success) setError(res.error)
            } else {
                if (!validateEmail(formData.email)) {
                    setError(t.errors.email)
                    setLoading(false)
                    return
                }
                const res = await login(formData.email, formData.password)
                if (!res.success) setError(res.error)
            }
        } else {
            if (!validateEmail(formData.email)) {
                setError(t.errors.email)
                setLoading(false)
                return
            }
            if (formData.password.length < 4) {
                setError(t.errors.password)
                setLoading(false)
                return
            }
            if (!agreed) {
                setError(t.errors.terms)
                setLoading(false)
                return
            }
            const res = await register(formData)
            if (res.success) {
                setMessage(t.messages.success)
                setIsLogin(true)
            } else {
                setError(res.error)
            }
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 border border-gray-100 relative overflow-hidden">
                {/* Language Switcher */}
                <div className="absolute top-6 left-6 z-20">
                    <button
                        onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-[10px] font-bold text-gray-500 hover:text-[#00008B] hover:bg-white transition-all shadow-sm border border-gray-100"
                    >
                        <Globe size={14} />
                        {lang === 'en' ? 'English' : 'हिंदी'}
                    </button>
                </div>

                {/* Subtle Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-vayu-green/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                <div className="flex flex-col items-center mb-10 relative z-10 text-center">
                    <div className="w-24 h-24 mb-4 transform hover:scale-105 transition-transform duration-300">
                        <img src="/assets/vayu-logo.png" alt="VAYU Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-4xl font-black text-vayu-green tracking-tighter italic">
                        {t.title}
                    </h1>
                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.2em] mt-1 italic">
                        Powerful & Reliable
                    </p>
                </div>

                {/* Login Role Toggle */}
                {isLogin && (
                    <div className="flex bg-gray-50 p-1 rounded-2xl mb-8 relative z-10 border border-gray-100">
                        <button
                            onClick={() => { setLoginRole('employee'); setError(''); }}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${loginRole === 'employee' ? 'bg-white text-[#00008B] shadow-sm font-black' : 'text-gray-400 font-bold'}`}
                        >
                            Staff Entry
                        </button>
                        <button
                            onClick={() => { setLoginRole('rider'); setError(''); }}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${loginRole === 'rider' ? 'bg-vayu-green text-gray-900 shadow-sm font-black' : 'text-gray-400 font-bold'}`}
                        >
                            Rider Entry
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-6 px-4 py-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl text-emerald-700 text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    {!isLogin && (
                        <div className="space-y-1 group">
                            <label className="text-[10px] font-black text-black uppercase ml-1 block">{t.fullNameLabel}</label>
                            <input
                                type="text"
                                className="w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-xl hover:border-vayu-green/30 text-gray-900 font-semibold outline-none focus:ring-2 focus:ring-vayu-green/20 focus:border-vayu-green transition-all"
                                placeholder="e.g. Abnish Sharma"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    {isLogin && loginRole === 'rider' ? (
                        <div className="space-y-1 group">
                            <label className="text-[10px] font-black text-black uppercase ml-1 block">Registered Mobile Number</label>
                            <input
                                type="tel"
                                maxLength="10"
                                className="w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-xl hover:border-vayu-green/30 text-gray-900 font-semibold shadow-inner outline-none focus:ring-2 focus:ring-vayu-green/20 focus:border-vayu-green transition-all"
                                placeholder="Enter 10-digit number"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                required
                            />
                            <p className="text-[9px] text-gray-400 font-bold mt-2 ml-1">Use the number registered during vehicle purchase.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-1 group">
                                <label className="text-[10px] font-black text-black uppercase ml-1 block">{t.emailLabel}</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-xl hover:border-vayu-green/30 text-gray-900 font-semibold shadow-inner outline-none focus:ring-2 focus:ring-vayu-green/20 focus:border-vayu-green transition-all"
                                    placeholder="id@vayu.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-1 group">
                                <label className="text-[10px] font-black text-black uppercase ml-1 block">{t.passwordLabel}</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full px-4 py-4 bg-gray-50/50 border border-gray-100 rounded-xl hover:border-vayu-green/30 text-gray-900 font-semibold shadow-inner outline-none focus:ring-2 focus:ring-vayu-green/20 focus:border-vayu-green transition-all pr-12"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-vayu-green transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {!isLogin && (
                        <div>
                            <label className="text-[10px] font-bold text-gray-900 uppercase ml-1 mb-3 block">{t.roleLabel}</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'admin', icon: Shield, label: t.roles.admin },
                                    { id: 'employee', icon: Wrench, label: t.roles.employee }
                                ].map(r => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: r.id })}
                                        className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 ${formData.role === r.id
                                            ? 'border-vayu-green bg-vayu-green/5 text-vayu-green shadow-sm'
                                            : 'border-gray-50 text-gray-300 hover:border-gray-200'
                                            }`}
                                    >
                                        <r.icon size={22} className={formData.role === r.id ? 'animate-bounce' : ''} />
                                        <span className="text-[9px] font-black mt-2 uppercase tracking-tight">{r.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isLogin && (
                        <div className="flex items-start gap-2 py-2 px-1">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 rounded text-vayu-green focus:ring-vayu-green"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <label htmlFor="terms" className="text-[10px] font-bold text-gray-600 leading-tight">
                                {t.terms}
                            </label>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-50 border-2 border-vayu-green text-black py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] hover:bg-white transition-all relative overflow-hidden group"
                    >
                        {loading ? <Loader2 className="animate-spin text-vayu-green" /> : (
                            <>
                                <span className="font-black uppercase tracking-widest text-sm text-black">
                                    {isLogin ? t.loginBtn : t.submitBtn}
                                </span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-black" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setMessage('');
                        }}
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-vayu-green transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        <span className="w-10 h-px bg-gray-100"></span>
                        {isLogin ? t.needAccount : t.haveAccount}
                        <span className="w-10 h-px bg-gray-100"></span>
                    </button>
                </div>

                {isLogin && (
                    <div className="mt-8 bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3 opacity-60 hover:opacity-100 transition-opacity">
                        <Shield size={16} className="text-vayu-green mt-1" />
                        <div>
                            <p className="text-[9px] font-black text-gray-800 uppercase italic leading-none">{t.adminHint}</p>
                            <code className="text-[10px] text-gray-600 font-bold block mt-1">admin@vayu.com / admin</code>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Auth
