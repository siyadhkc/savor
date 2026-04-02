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
    ShieldCheck,
    DollarSign,
    Package,
    TrendingUp,
    LogOut
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../components/Navbar'

const DeliveryProfile = () => {
    const { user, updateUser, logout } = useAuth()
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
            toast.success('Carrier profile synchronized.')
            setEditing(false)
        } catch {
            toast.error('Sync failed. Check network link.')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        toast.success('Agent session terminated.')
        navigate('/login')
    }

    const handleCancel = () => {
        setFormData({ username: user?.username || '', phone: user?.phone || '' })
        setEditing(false)
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />
            
            <div className="flex-1 px-5 md:px-10 py-10 relative overflow-y-auto pt-32 md:pt-40">
                {/* Background Glows */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 blur-[120px] rounded-full -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full -ml-24 -mb-24" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                        <div>
                            <button
                                onClick={() => navigate('/delivery/dashboard')}
                                className="flex items-center gap-2 text-white/40 hover:text-primary-400 font-black text-[10px] uppercase tracking-widest mb-4 transition-all group"
                            >
                                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
                                Back to Terminal
                            </button>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Carrier Authorization Node</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">Logistic <span className="text-primary-500 font-light not-italic">Identity</span></h1>
                            <p className="text-white/40 font-medium mt-2">Manage your high-security delivery credentials and track performance.</p>
                        </div>

                        {!editing && (
                            <button 
                                onClick={() => setEditing(true)}
                                className="bg-white text-slate-900 px-8 py-3.5 rounded-[20px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-500 hover:text-white active:scale-95 transition-all shadow-xl shadow-white/5"
                            >
                                <Pencil size={16} strokeWidth={3} />
                                Update Profile
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Stats & Identity Avatar Card */}
                        <div className="lg:col-span-4 space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/5 backdrop-blur-md rounded-[40px] p-10 border border-white/5 flex flex-col items-center text-center group overflow-hidden"
                            >
                                <div className="relative mb-8">
                                    <div className="w-32 h-32 rounded-[40px] bg-slate-800 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary-500/20 border-8 border-white/5 relative z-10 group-hover:rotate-3 transition-transform duration-500 uppercase">
                                        {user?.username?.[0] || user?.email?.[0]}
                                    </div>
                                    <div className="absolute -inset-4 bg-primary-500/20 rounded-[50px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>

                                <h2 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">{user?.username}</h2>
                                <div className="flex items-center gap-2 mb-8">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Verified Field Agent</span>
                                </div>

                                <div className="w-full space-y-4 pt-8 border-t border-white/5">
                                    <div className="p-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Carrier Status</p>
                                        <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest leading-none">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            Online & Secure
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Earnings & Stats */}
                            <div className="bg-emerald-600 rounded-[40px] p-8 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                    <TrendingUp size={120} />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                                        <DollarSign size={20} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Lifetime Earnings</p>
                                    <p className="text-4xl font-black tracking-tighter">₹{parseFloat(user?.earnings || 0).toFixed(2)}</p>
                                    
                                    <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Avg. / Delivery</p>
                                            <p className="font-black text-sm">₹50.00</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Success Rate</p>
                                            <p className="font-black text-sm">100%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Operational Details Form */}
                        <div className="lg:col-span-8">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 backdrop-blur-md rounded-[40px] border border-white/5 overflow-hidden"
                            >
                                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                                            <Lock size={18} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-lg font-black text-white tracking-tight leading-none mb-1">Identity Management</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Carrier database overrides</p>
                                        </div>
                                    </div>
                                    <Activity size={20} className="text-emerald-500 animate-pulse" />
                                </div>

                                <form onSubmit={handleUpdate} className="p-10 space-y-10">
                                    {/* Email Entry (Read Only) */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Authentication ID (Immune)</label>
                                        <div className="relative group/field">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10" size={18} />
                                            <input 
                                                value={user?.email}
                                                readOnly
                                                className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-white/5 border border-white/5 text-sm font-bold text-white/20 cursor-not-allowed italic"
                                            />
                                        </div>
                                        <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest ml-1">Static identifier used for logistical verification.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                        {/* Username Field */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Dispatcher Name</label>
                                            <div className="relative group/field">
                                                <User className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-300 ${editing ? 'text-primary-500' : 'text-white/10'}`} size={18} />
                                                <input 
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    disabled={!editing}
                                                    className={`w-full pl-16 pr-8 py-5 rounded-[24px] text-sm font-black tracking-tight focus:outline-none focus:ring-8 focus:ring-primary-500/10 transition-all border shadow-inner ${
                                                        editing ? 'bg-white text-slate-900 border-primary-500/20' : 'bg-white/5 border-white/5 text-white/40'
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Field */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Field Communication</label>
                                            <div className="relative group/field">
                                                <Phone className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-300 ${editing ? 'text-emerald-500' : 'text-white/10'}`} size={18} />
                                                <input 
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    disabled={!editing}
                                                    className={`w-full pl-16 pr-8 py-5 rounded-[24px] text-sm font-black tracking-tight focus:outline-none focus:ring-8 focus:ring-emerald-500/10 transition-all border shadow-inner ${
                                                        editing ? 'bg-white text-slate-900 border-emerald-500/20' : 'bg-white/5 border-white/5 text-white/40'
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
                                                    className="flex-1 bg-primary-600 text-white font-black py-4 rounded-[20px] shadow-2xl shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                                >
                                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} strokeWidth={3} />}
                                                    Sync Protocol
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={handleCancel}
                                                    className="px-10 bg-white/5 text-white/40 font-black py-4 rounded-[20px] border border-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <X size={18} strokeWidth={3} />
                                                    Abort
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </motion.div>
                        </div>
                    </div>

                    {/* Sign Out Section */}
                    <div className="mt-12 pt-12 border-t border-white/5 flex justify-center">
                        <button 
                            onClick={handleLogout}
                            className="px-10 py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-xs uppercase tracking-[0.2em] rounded-[24px] flex items-center gap-3 hover:bg-rose-500 hover:text-white transition-all active:scale-95 group shadow-2xl shadow-rose-500/5"
                        >
                            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                            Terminate Session
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeliveryProfile
