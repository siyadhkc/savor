import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { User, Store, Mail, Phone, MapPin, Camera, Save, X } from 'lucide-react'

const RestaurantProfile = () => {
    const { user, updateUser } = useAuth()
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    
    // Initial state matching UserSerializer's structure
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
            // Update the local auth context with new user data reactively
            updateUser(response.data)
            toast.success('Profile & Store details updated.')
            setEditing(false)
        } catch (error) {
            console.error('Failed to update profile:', error)
            toast.error('Failed to update profile details.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 p-8 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Business Profile</h1>
                    <p className="text-slate-500 font-medium mt-2 text-lg">Manage your personal and restaurant identity.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Brand Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                            <div className="relative group mb-6">
                                <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-tr from-primary-600 to-emerald-400 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-primary-500/20 border-4 border-white">
                                    {user?.restaurant?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-2.5 bg-white rounded-2xl shadow-lg border border-slate-100 text-slate-500 hover:text-primary-600 transition-all group-hover:scale-110">
                                    <Camera size={18} />
                                </button>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 leading-tight mb-1">{user?.restaurant?.name || 'Your Restaurant'}</h2>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
                            
                            <div className="w-full h-px bg-slate-100 my-6" />
                            
                            <div className="w-full space-y-4">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                                        <Mail size={14} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 truncate">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-left">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Phone size={14} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600">{user?.phone || 'No phone set'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-widest">
                                    <User size={16} className="text-primary-600" />
                                    Account & Business Details
                                </div>
                                {!editing && (
                                    <button 
                                        onClick={() => setEditing(true)}
                                        className="text-primary-600 font-black text-xs uppercase tracking-widest hover:underline"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleUpdate} className="p-8 space-y-8">
                                {/* Personal Info Section */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-700 uppercase tracking-tighter ml-1">Username</label>
                                            <input 
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                disabled={!editing}
                                                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all disabled:opacity-60"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-700 uppercase tracking-tighter ml-1">Personal Phone</label>
                                            <input 
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                disabled={!editing}
                                                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all disabled:opacity-60"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Restaurant Info Section */}
                                <div className="space-y-6 pt-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Restaurant Information</h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-700 uppercase tracking-tighter ml-1">Store Name</label>
                                            <div className="relative">
                                                <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input 
                                                    name="restaurant.name"
                                                    value={formData.restaurant.name}
                                                    onChange={handleChange}
                                                    disabled={!editing}
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all disabled:opacity-60"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-700 uppercase tracking-tighter ml-1">Store Address</label>
                                            <div className="relative">
                                                <MapPin size={18} className="absolute left-4 top-4 text-slate-300" />
                                                <textarea 
                                                    name="restaurant.address"
                                                    rows="3"
                                                    value={formData.restaurant.address}
                                                    onChange={handleChange}
                                                    disabled={!editing}
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition-all disabled:opacity-60 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {editing && (
                                    <div className="flex gap-4 pt-6">
                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-primary-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                                            Save Changes
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setEditing(false)}
                                            className="px-8 bg-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <X size={18} />
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RestaurantProfile
