import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Mail, User, Phone, Shield, Edit2, Check, X, Loader2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Helper: initials from username or email
const getInitials = (user) => {
    const name = user?.username || user?.email || 'U'
    return name.charAt(0).toUpperCase()
}

const Profile = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: user?.username || '',
        phone: user?.phone || '',
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await api.patch('/users/profile/', formData)
            toast.success('Profile updated.')
            setEditing(false)
        } catch {
            toast.error('Failed to update profile.')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData({ username: user?.username || '', phone: user?.phone || '' })
        setEditing(false)
    }

    const roleLabel = user?.role === 'admin' || user?.is_staff
        ? 'Administrator'
        : user?.role === 'restaurant'
        ? 'Restaurant Owner'
        : 'Customer'

    const roleDot = user?.role === 'admin' || user?.is_staff
        ? 'bg-amber-400'
        : user?.role === 'restaurant'
        ? 'bg-primary-500'
        : 'bg-emerald-400'

    const infoFields = [
        { icon: Mail, label: 'Email Address', value: user?.email || '—' },
        { icon: User, label: 'Username', value: user?.username || '—' },
        { icon: Phone, label: 'Phone', value: user?.phone || 'Not provided' },
        { icon: Shield, label: 'Account Role', value: roleLabel },
    ]

    return (
        <div className="min-h-screen bg-[#FCFCFD] flex flex-col">

            {/* ── Dark Hero Header ──────────────────────────────────────── */}
            <div className="relative bg-slate-950 overflow-hidden pt-10 pb-28 px-6">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-3xl mx-auto">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest mb-8 transition-colors group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>

                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] bg-gradient-to-br from-primary-600 to-primary-400 text-white flex items-center justify-center font-black text-3xl sm:text-4xl shrink-0 shadow-2xl shadow-primary-600/30 border-4 border-white/10">
                            {getInitials(user)}
                        </div>

                        {/* Info */}
                        <div>
                            <p className="text-primary-400 text-xs font-bold uppercase tracking-[0.2em] mb-1.5">My Profile</p>
                            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                                {user?.username || 'User'}
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`w-2 h-2 rounded-full ${roleDot}`} />
                                <span className="text-white/50 text-sm font-medium">{roleLabel}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Card ─────────────────────────────────────────────────── */}
            <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 -mt-14 pb-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                >
                    {/* Card header */}
                    <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Details</p>
                        </div>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
                            >
                                <Edit2 size={14} />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="px-6 sm:px-8 py-6">
                        <AnimatePresence mode="wait">
                            {!editing ? (
                                /* ── View Mode ──────────────────────────────────── */
                                <motion.div
                                    key="view"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col gap-1.5"
                                >
                                    {infoFields.map(({ icon: Icon, label, value }) => (
                                        <div
                                            key={label}
                                            className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-50 transition-colors group"
                                        >
                                            <div className="w-9 h-9 bg-slate-100 group-hover:bg-slate-200 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                                                <Icon size={16} className="text-slate-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                                                <p className="text-slate-800 font-semibold text-sm truncate">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                /* ── Edit Mode ──────────────────────────────────── */
                                <motion.form
                                    key="edit"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleUpdate}
                                    className="flex flex-col gap-4"
                                >
                                    {/* Non-editable email */}
                                    <div className="px-4 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <Mail size={16} className="text-slate-400 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                                                <p className="text-slate-600 font-semibold text-sm">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Username */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="profile-username" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            <input
                                                id="profile-username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                placeholder="Your username"
                                                className="input-premium pl-10 pr-4 py-3.5"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="profile-phone" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                                            Phone <span className="text-slate-400 normal-case font-medium">(optional)</span>
                                        </label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            <input
                                                id="profile-phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+91 9876 543 210"
                                                className="input-premium pl-10 pr-4 py-3.5"
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                                                loading
                                                    ? 'bg-slate-100 text-slate-400 cursor-wait'
                                                    : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95 shadow-lg shadow-primary-600/20'
                                            }`}
                                        >
                                            {loading ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Check size={16} strokeWidth={2.5} />
                                            )}
                                            {loading ? 'Saving…' : 'Save Changes'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
                                        >
                                            <X size={16} />
                                            Cancel
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Profile