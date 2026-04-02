import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { 
    Mail, 
    User, 
    Phone, 
    Shield, 
    Pencil, 
    CheckCircle2, 
    X, 
    Loader2, 
    ArrowLeft,
    Activity,
    Lock,
    ShieldCheck
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const Profile = () => {
    const { user, updateUser } = useAuth()
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
            const response = await api.patch('/users/profile/', formData)
            updateUser(response.data)
            toast.success('Identity protocols synchronized.')
            setEditing(false)
        } catch {
            toast.error('Sync failed: Check network latency.')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData({ username: user?.username || '', phone: user?.phone || '' })
        setEditing(false)
    }

    const roleLabel = user?.role === 'admin' || user?.is_staff
        ? 'Administrative Core'
        : user?.role === 'restaurant'
        ? 'Platform Partner'
        : 'Authenticated Consumer'

    return (
        <div className="flex-1 px-5 md:px-10 py-10 bg-slate-50/50 min-h-screen relative overflow-y-auto pt-24 md:pt-32">
            {/* Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full -ml-24 -mb-24" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-slate-400 hover:text-primary-600 font-black text-[10px] uppercase tracking-widest mb-4 transition-all group"
                        >
                            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
                            Exit to Discovery
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Security Protocol Layer</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Personal <span className="text-primary-600 font-light italic">Identity</span></h1>
                        <p className="text-slate-500 font-medium mt-2">Manage your platform authorization and communication link.</p>
                    </div>

                    {!editing && (
                        <button 
                            onClick={() => setEditing(true)}
                            className="bg-slate-900 text-white px-8 py-3.5 rounded-[20px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                        >
                            <Pencil size={16} strokeWidth={3} />
                            Modify Node
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Identity Avatar Card */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-col items-center text-center group overflow-hidden"
                        >
                            <div className="relative mb-8">
                                <div className="w-32 h-32 rounded-[40px] bg-slate-900 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-slate-900/20 border-8 border-white relative z-10 group-hover:rotate-3 transition-transform duration-500">
                                    {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                                </div>
                                <div className="absolute -inset-4 bg-primary-500/10 rounded-[50px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">{user?.username}</h2>
                            <div className="flex items-center gap-2 mb-8">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{roleLabel}</span>
                            </div>

                            <div className="w-full space-y-4 pt-8 border-t border-slate-50">
                                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Authorization Sync</p>
                                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest leading-none">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        Encrypted Link Live
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Operational Details Form */}
                    <div className="lg:col-span-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden"
                        >
                            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                        <Lock size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Identity Matrix</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">User metadata controls</p>
                                    </div>
                                </div>
                                <Activity size={20} className="text-primary-500 animate-pulse" />
                            </div>

                            <form onSubmit={handleUpdate} className="p-10 space-y-10">
                                {/* Email Entry (Read Only) */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Reference (Immune)</label>
                                    <div className="relative group/field">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200" size={18} />
                                        <input 
                                            value={user?.email}
                                            readOnly
                                            className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-slate-50 border border-slate-100 text-sm font-bold text-slate-400 cursor-not-allowed italic"
                                        />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-1">Universal ID cannot be altered post-registration.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    {/* Username Field */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discovery Name</label>
                                        <div className="relative group/field">
                                            <User className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-300 ${editing ? 'text-primary-500' : 'text-slate-200'}`} size={18} />
                                            <input 
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                disabled={!editing}
                                                className={`w-full pl-16 pr-8 py-5 rounded-[24px] text-sm font-black tracking-tight focus:outline-none focus:ring-8 focus:ring-primary-500/5 transition-all border shadow-inner ${
                                                    editing ? 'bg-white border-primary-500/20 text-slate-900' : 'bg-slate-50 border-slate-100 text-slate-400'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Phone Field */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logistics Comms</label>
                                        <div className="relative group/field">
                                            <Phone className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-300 ${editing ? 'text-emerald-500' : 'text-slate-200'}`} size={18} />
                                            <input 
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                disabled={!editing}
                                                className={`w-full pl-16 pr-8 py-5 rounded-[24px] text-sm font-black tracking-tight focus:outline-none focus:ring-8 focus:ring-emerald-500/5 transition-all border shadow-inner ${
                                                    editing ? 'bg-white border-emerald-500/20 text-slate-900' : 'bg-slate-50 border-slate-100 text-slate-400'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {editing && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex gap-4 pt-10"
                                        >
                                            <button 
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 bg-slate-900 text-white font-black py-4 rounded-[20px] shadow-2xl shadow-slate-900/10 hover:bg-primary-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} strokeWidth={3} />}
                                                Sync Matrix
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={handleCancel}
                                                className="px-10 bg-white text-slate-400 font-black py-4 rounded-[20px] border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <X size={18} strokeWidth={3} />
                                                Revert
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile