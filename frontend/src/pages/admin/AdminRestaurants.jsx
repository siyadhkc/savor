import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { getImageUrl } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { Store, Plus, Pencil, Trash2, Utensils, X, Loader2, MapPin, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const AdminRestaurants = () => {
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingRestaurant, setEditingRestaurant] = useState(null)
    const [formData, setFormData] = useState({ name: '', address: '', phone: '', is_active: true })
    const [logoFile, setLogoFile] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => { fetchRestaurants() }, [])

    const fetchRestaurants = async () => {
        try {
            const response = await api.get('/restaurant/restaurants/')
            setRestaurants(response.data.results)
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
                toast.success('Restaurant updated.')
            } else {
                await api.post('/restaurant/restaurants/', data, { headers: { 'Content-Type': 'multipart/form-data' } })
                toast.success('Restaurant created.')
            }
            setShowModal(false)
            fetchRestaurants()
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to save restaurant.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this restaurant? This action cannot be undone.')) return
        try {
            await api.delete(`/restaurant/restaurants/${id}/`)
            setRestaurants(restaurants.filter(r => r.id !== id))
            toast.success('Restaurant deleted.')
        } catch {
            toast.error('Failed to delete restaurant.')
        }
    }

    const handleToggleActive = async (restaurant) => {
        try {
            await api.patch(`/restaurant/restaurants/${restaurant.id}/`, { is_active: !restaurant.is_active }, { headers: { 'Content-Type': 'multipart/form-data' } })
            setRestaurants(restaurants.map(r => r.id === restaurant.id ? { ...r, is_active: !r.is_active } : r))
            toast.success('Status updated.')
        } catch {
            toast.error('Failed to update status.')
        }
    }

    return (
        <div className="flex-1 min-h-screen bg-[#FCFCFD]">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">

                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-primary-600 text-xs font-bold uppercase tracking-[0.2em] mb-1">Administration</p>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Store size={28} className="text-slate-300" strokeWidth={1.5} />
                            Restaurants
                        </h1>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-bold text-sm rounded-xl hover:bg-primary-700 active:scale-95 transition-all shadow-lg shadow-primary-600/20"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        Add Restaurant
                    </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm">
                    <div className="bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total</p>
                        <p className="text-2xl font-black text-slate-800">{restaurants.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Active</p>
                        <p className="text-2xl font-black text-emerald-600">{restaurants.filter(r => r.is_active).length}</p>
                    </div>
                </div>

                {/* Table / Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 size={36} className="animate-spin text-primary-400" />
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/60">
                                        {['Logo', 'Name', 'Address', 'Phone', 'Status', 'Actions'].map(col => (
                                            <th key={col} className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {restaurants.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium text-sm">
                                                No restaurants yet. Add the first one.
                                            </td>
                                        </tr>
                                    ) : restaurants.map(r => (
                                        <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                {r.logo ? (
                                                    <img src={getImageUrl(r.logo)} alt={r.name} className="w-11 h-11 rounded-xl object-cover border border-slate-100" />
                                                ) : (
                                                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                                                        <Utensils size={18} className="text-slate-300" strokeWidth={1.5} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-800 font-bold text-sm">{r.name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-500 text-sm flex items-center gap-1.5 max-w-[220px]">
                                                    <MapPin size={13} className="text-slate-300 shrink-0" />
                                                    <span className="truncate">{r.address}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {r.phone ? (
                                                    <span className="text-slate-500 text-sm flex items-center gap-1.5">
                                                        <Phone size={13} className="text-slate-300" />
                                                        {r.phone}
                                                    </span>
                                                ) : <span className="text-slate-300 text-sm">—</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleActive(r)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                                                        r.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                                                            : 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
                                                    }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${r.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                                    {r.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(r)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                                                    >
                                                        <Pencil size={12} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(r.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
                                                    >
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-100">
                                {/* Modal Header */}
                                <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-slate-100">
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                        {editingRestaurant ? 'Edit Restaurant' : 'New Restaurant'}
                                    </h2>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-4">
                                    {/* Name */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                                            Restaurant Name <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Pizza Palace"
                                            className="input-premium py-3"
                                            required
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Phone</label>
                                        <input
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="e.g. 9876543210"
                                            className="input-premium py-3"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                                            Address <span className="text-rose-400">*</span>
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Full address…"
                                            rows={3}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-y"
                                        />
                                    </div>

                                    {/* Logo Upload */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Logo Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setLogoFile(e.target.files[0])}
                                            className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-all"
                                        />
                                    </div>

                                    {/* Active Toggle */}
                                    <div className="flex items-center gap-3 py-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                            className={`relative w-10 h-6 rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.is_active ? 'translate-x-4' : ''}`} />
                                        </button>
                                        <label className="text-sm font-semibold text-slate-700 cursor-pointer" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>
                                            <span className={formData.is_active ? 'text-emerald-700' : 'text-slate-500'}>
                                                {formData.is_active ? 'Active — visible to customers' : 'Inactive — hidden from customers'}
                                            </span>
                                        </label>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                                                submitting
                                                    ? 'bg-slate-100 text-slate-400 cursor-wait'
                                                    : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95 shadow-lg shadow-primary-600/20'
                                            }`}
                                        >
                                            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                                            {submitting ? 'Saving…' : editingRestaurant ? 'Update Restaurant' : 'Create Restaurant'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-5 py-3.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors"
                                        >
                                            Cancel
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