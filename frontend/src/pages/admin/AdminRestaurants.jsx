import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { getImageUrl } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { Store, Plus, Pencil, Trash2, Utensils, X, Loader2, MapPin, Phone, Search, Filter, Activity, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const AdminRestaurants = () => {
    const [restaurants, setRestaurants] = useState([])
    const [totalCount, setTotalCount]   = useState(0)
    const [loading, setLoading]         = useState(true)
    const [showModal, setShowModal]     = useState(false)
    const [editingRestaurant, setEditingRestaurant] = useState(null)
    const [formData, setFormData]       = useState({ name: '', address: '', phone: '', is_active: true })
    const [logoFile, setLogoFile]       = useState(null)
    const [submitting, setSubmitting]   = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => { fetchRestaurants() }, [searchQuery]) // refetch when search changes

    const fetchRestaurants = async () => {
        setLoading(true)
        try {
            const params = {}
            if (searchQuery.trim()) params.search = searchQuery.trim()

            let nextUrl = '/restaurant/restaurants/'
            let isFirstPage = true
            let allRestaurants = []
            let count = 0

            while (nextUrl) {
                const response = await api.get(nextUrl, {
                    params: isFirstPage ? params : undefined,
                })
                const payload = response.data

                if (Array.isArray(payload)) {
                    allRestaurants = payload
                    count = payload.length
                    nextUrl = null
                    continue
                }

                allRestaurants = allRestaurants.concat(payload.results || [])
                count = payload.count || allRestaurants.length
                nextUrl = payload.next
                isFirstPage = false
            }

            setRestaurants(allRestaurants)
            setTotalCount(count)
        } catch {
            toast.error('Failed to load restaurants.')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingRestaurant(null)
        setFormData({ name: '', address: '', phone: '', is_active: true })
        setLogoFile(null)
        setShowModal(true)
    }

    const openEditModal = (restaurant) => {
        setEditingRestaurant(restaurant)
        setFormData({ name: restaurant.name, address: restaurant.address, phone: restaurant.phone || '', is_active: restaurant.is_active })
        setLogoFile(null)
        setShowModal(true)
    }

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setFormData({ ...formData, [e.target.name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const data = new FormData()
            data.append('name', formData.name)
            data.append('address', formData.address)
            data.append('phone', formData.phone)
            data.append('is_active', formData.is_active)
            if (logoFile) data.append('logo', logoFile)

            if (editingRestaurant) {
                await api.patch(`/restaurant/restaurants/${editingRestaurant.id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
                toast.success('Venue protocol updated.')
            } else {
                await api.post('/restaurant/restaurants/', data, { headers: { 'Content-Type': 'multipart/form-data' } })
                toast.success('New venue manifest established.')
            }
            setShowModal(false)
            fetchRestaurants()
        } catch (error) {
            toast.error('Protocol violation: Failed to save.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this restaurant? This cannot be undone.')) return
        try {
            await api.delete(`/restaurant/restaurants/${id}/`)
            toast.success('Restaurant deleted.')
            fetchRestaurants()
        } catch {
            toast.error('Failed to delete restaurant.')
        }
    }

    const handleToggleActive = async (restaurant) => {
        try {
            await api.patch(`/restaurant/restaurants/${restaurant.id}/`, { is_active: !restaurant.is_active }, { headers: { 'Content-Type': 'multipart/form-data' } })
            setRestaurants(restaurants.map(r => r.id === restaurant.id ? { ...r, is_active: !r.is_active } : r))
            toast.success('Accessibility status updated.')
        } catch {
            toast.error('status update failed.')
        }
    }

    // Search is server-side (triggered by useEffect above), so filteredRestaurants = restaurants
    const filteredRestaurants = restaurants

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing venue cluster...</p>
            </div>
        )
    }

    return (
        <div className="flex-1 px-5 md:px-10 py-10 bg-slate-50/50 min-h-screen relative overflow-y-auto">
            {/* Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/5 blur-[100px] rounded-full -mr-32 -mt-32" />
            </div>

            <div className="relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Global Venue Management</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Establishment <span className="text-primary-600 font-light italic">Registry</span></h1>
                        <p className="text-slate-500 font-medium mt-2">Oversee all restaurant partners and logistical end-points.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by name or location…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all w-full sm:w-[320px] shadow-sm"
                            />
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="bg-slate-900 text-white px-8 py-3.5 rounded-[20px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                        >
                            <Plus size={18} strokeWidth={3} />
                            Register Venue
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    {[
                        { label: 'Total Restaurants', value: totalCount, icon: Store, color: 'text-slate-900', bg: 'bg-slate-50' },
                        { label: 'Active Now', value: restaurants.filter(r => r.is_active).length, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm min-w-[240px] flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                                <stat.icon size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                                <p className={`text-3xl font-black ${stat.color} tracking-tighter leading-none`}>{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Registry Table */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-12">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1100px]">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">Identity</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">Establishment Name</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">Logistical Origin</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">Comms Link</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 text-right pr-12">Protocol controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRestaurants.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-24 text-center">
                                             <div className="flex flex-col items-center">
                                                <Store size={48} className="text-slate-100 mb-4" />
                                                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">Null Registry</h3>
                                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No matching venue entities found.</p>
                                             </div>
                                        </td>
                                    </tr>
                                ) : filteredRestaurants.map(r => (
                                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group tracking-tight">
                                        <td className="px-8 py-5">
                                            {r.logo ? (
                                                <img src={getImageUrl(r.logo)} alt={r.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner">
                                                    <Utensils size={18} className="text-slate-300" strokeWidth={2} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 leading-none mb-1.5">{r.name}</span>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Registered Cluster</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3 text-sm font-bold text-slate-600 max-w-[300px]">
                                                <MapPin size={14} className="text-slate-300 shrink-0" />
                                                <span className="truncate">{r.address}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {r.phone ? (
                                                <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700">
                                                    <Phone size={14} className="text-primary-400" />
                                                    {r.phone}
                                                </div>
                                            ) : <span className="text-slate-300 text-xs font-bold italic">No Link</span>}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => handleToggleActive(r)}
                                                    className={`group/btn flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                        r.is_active
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50 hover:bg-emerald-600 hover:text-white'
                                                            : 'bg-rose-50 text-rose-600 border-rose-100/50 hover:bg-rose-600 hover:text-white'
                                                    }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${r.is_active ? 'bg-emerald-400 group-hover/btn:bg-white animate-pulse' : 'bg-rose-400 group-hover/btn:bg-white'}`} />
                                                    {r.is_active ? 'Authorized' : 'Restricted'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 pr-12">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                                <button
                                                    onClick={() => openEditModal(r)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all shadow-sm"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(r.id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Premium Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-50 px-4"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden border border-white/20 pointer-events-auto flex flex-col">
                                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                                            {editingRestaurant ? 'Protocol Edit' : 'New Registry'}
                                        </h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Venue Identity formulation</p>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-90"
                                    >
                                        <X size={20} strokeWidth={3} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8">
                                    {/* Name Input */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Establishment Identity</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Venue Formal Name…"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-inner"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                         <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Comms Protocol</label>
                                            <input
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Link Reference…"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity Icon</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => setLogoFile(e.target.files[0])}
                                                    className="w-full px-4 py-3.5 bg-slate-50 border border-dotted border-slate-300 rounded-2xl text-xs font-bold text-slate-400 cursor-pointer file:hidden"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <Activity size={14} className="text-primary-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Input */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Logistical Endpoint</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Unified Physical Location…"
                                            rows={3}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all shadow-inner resize-none"
                                            required
                                        />
                                    </div>

                                    {/* Bottom Actions */}
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 bg-slate-900 text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                                        >
                                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} strokeWidth={3} />}
                                            {submitting ? 'Encrypting…' : 'Finalize Registry'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AdminRestaurants
