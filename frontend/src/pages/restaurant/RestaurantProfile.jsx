import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { 
    User, 
    Store, 
    Mail, 
    Phone, 
    MapPin, 
    Camera, 
    Save, 
    X, 
    Loader2,
    ShieldCheck,
    Briefcase,
    Activity,
    ArrowUpRight,
    Pencil
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const RestaurantProfile = () => {
    const { user, updateUser } = useAuth()
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    
    const [formData, setFormData] = useState({
        username: user?.username || '',
        phone: user?.phone || '',
        restaurant: {
            name: user?.restaurant?.name || '',
            address: user?.restaurant?.address || '',
            phone: user?.restaurant?.phone || ''
        }
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name.startsWith('restaurant.')) {
            const field = name.split('.')[1]
            setFormData(prev => ({
                ...prev,
                restaurant: {
                    ...prev.restaurant,
                    [field]: value
                }
            }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await api.patch('/users/profile/', formData)
            updateUser(response.data)
            toast.success('Identity protocols synchronized.')
            setEditing(false)
        } catch (error) {
            console.error('Failed to update profile:', error)
            toast.error('Sync failed: Check network latency.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 px-5 md:px-10 py-10 bg-slate-50/50 min-h-screen relative overflow-y-auto">
            {/* Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full -ml-24 -mb-24" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Partner Identity Management</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Business <span className="text-primary-600 font-light italic">Profile</span></h1>
                        <p className="text-slate-500 font-medium mt-2">Manage your professional credentials and storefront metadata.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {!editing ? (
                            <button 
                                onClick={() => setEditing(true)}
                                className="bg-slate-900 text-white px-8 py-3.5 rounded-[20px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                            >
                                <Pencil size={16} strokeWidth={3} />
                                Modify Profile
                            </button>
                        ) : (
                             <button 
                                onClick={() => setEditing(false)}
                                className="bg-white text-slate-400 px-8 py-3.5 rounded-[20px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 border border-slate-100 hover:bg-slate-50 transition-all"
                            >
                                <X size={16} strokeWidth={3} />
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Visual Brand Identity */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight className="text-slate-200" size={24} />
                            </div>

                            <div className="relative mb-8">
                                <div className="w-40 h-40 rounded-[48px] bg-slate-900 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-slate-900/20 border-8 border-white relative z-10 group-hover:rotate-3 transition-transform duration-500">
                                    {user?.restaurant?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
                                </div>
                                <div className="absolute -inset-4 bg-primary-500/10 rounded-[60px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all z-20 active:scale-90">
                                    <Camera size={20} strokeWidth={2.5} />
                                </button>
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2 tracking-tight">
                                {user?.restaurant?.name || 'Venue Identity'}
                            </h2>
                            <div className="flex items-center gap-2 mb-8">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verified Platform Partner</span>
                            </div>
                            
                            <div className="w-full grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                                    <div className="flex items-center justify-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Rank</p>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Elite</span>
                                </div>
                            </div>
                            
                            <div className="w-full space-y-4 mt-8 pt-8 border-t border-slate-50">
                                <div className="flex items-center gap-4 text-left p-3 rounded-2xl hover:bg-slate-50 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                                        <Mail size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Identifier Link</span>
                                         <span className="text-xs font-black text-slate-700 truncate max-w-[160px]">{user?.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-left p-3 rounded-2xl hover:bg-slate-50 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Phone size={16} />
                                    </div>
                                     <div className="flex flex-col">
                                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Operational Comms</span>
                                         <span className="text-xs font-black text-slate-700">{user?.phone || 'Awaiting Input'}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Operational Details Form */}
                    <div className="lg:col-span-8">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden"
                        >
                            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                        <Briefcase size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Operational Protocol</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Central business parameters</p>
                                    </div>
                                </div>
                                <Activity size={20} className="text-primary-500 animate-pulse" />
                            </div>

                            <form onSubmit={handleUpdate} className="p-10 space-y-12">
                                {/* Personal Info Section */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-px bg-slate-100" />
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Identity Matrix</h3>
                                        <span className="flex-1 h-px bg-slate-100" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username Identifier</label>
                                            <div className="relative group">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                                <input 
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    disabled={!editing}
                                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 tracking-tight focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personal Comms Link</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                                <input 
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    disabled={!editing}
                                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 tracking-tight focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Restaurant Info Section */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-px bg-slate-100" />
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Venue Parameters</h3>
                                        <span className="flex-1 h-px bg-slate-100" />
                                    </div>
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Formal Venue Title</label>
                                            <div className="relative group">
                                                <Store className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                                <input 
                                                    name="restaurant.name"
                                                    value={formData.restaurant.name}
                                                    onChange={handleChange}
                                                    disabled={!editing}
                                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-black text-slate-900 tracking-tight focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-inner"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unified Logistical originating Point</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-5 top-5 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                                                <textarea 
                                                    name="restaurant.address"
                                                    rows="3"
                                                    value={formData.restaurant.address}
                                                    onChange={handleChange}
                                                    disabled={!editing}
                                                    className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 leading-relaxed focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed resize-none shadow-inner"
                                                    placeholder="Specify the physical entry point for logistics…"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {editing && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-4 pt-6"
                                    >
                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-slate-900 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-slate-900/10 hover:bg-primary-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} strokeWidth={3} />}
                                            Synchronize Registry
                                        </button>
                                    </motion.div>
                                )}
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RestaurantProfile
