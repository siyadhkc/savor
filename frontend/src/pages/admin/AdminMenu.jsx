import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import { getImageUrl } from '../../utils/helpers'
import toast from 'react-hot-toast'
import {
    UtensilsCrossed, Plus, Search, Filter,
    Pencil, Trash2, X, Image as ImageIcon, Loader2,
    CheckCircle2, ChefHat, Layers, ChevronLeft, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const PAGE_SIZE = 20

const AdminMenu = () => {
    const [menuItems, setMenuItems]       = useState([])
    const [totalCount, setTotalCount]     = useState(0)
    const [currentPage, setCurrentPage]   = useState(1)
    const [restaurants, setRestaurants]   = useState([])
    const [formCategories, setFormCategories] = useState([])  // for the modal form (filtered)
    const [loading, setLoading]           = useState(true)
    const [catLoading, setCatLoading]     = useState(false)
    const [showModal, setShowModal]       = useState(false)
    const [editingItem, setEditingItem]   = useState(null)
    const [imageFile, setImageFile]       = useState(null)
    const [filterRestaurant, setFilterRestaurant] = useState('all')
    const [searchQuery, setSearchQuery]   = useState('')
    const [submitting, setSubmitting]     = useState(false)
    const [formData, setFormData]         = useState({
        restaurant: '', category: '', name: '',
        description: '', price: '', is_available: true,
    })

    const totalPages = Math.ceil(totalCount / PAGE_SIZE)

    // ── Fetch restaurants once ────────────────────────────────────────────────
    useEffect(() => {
        api.get('/restaurant/restaurants/?page_size=100')
            .then(res => setRestaurants(res.data.results || []))
            .catch(() => toast.error('Failed to load restaurants.'))
    }, [])

    // ── Fetch menu items when page / filter changes ───────────────────────────
    const fetchItems = useCallback(async () => {
        setLoading(true)
        try {
            const params = { page: currentPage, page_size: PAGE_SIZE }
            if (filterRestaurant !== 'all') params.restaurant = filterRestaurant
            if (searchQuery.trim()) params.search = searchQuery.trim()
            const res = await api.get('/menu/items/', { params })
            setMenuItems(res.data.results || [])
            setTotalCount(res.data.count || 0)
        } catch {
            toast.error('Failed to load menu items.')
        } finally {
            setLoading(false)
        }
    }, [currentPage, filterRestaurant, searchQuery])

    useEffect(() => { fetchItems() }, [fetchItems])

    // ── When restaurant is selected in the FORM, load its categories ──────────
    const loadCategoriesForRestaurant = async (restaurantId) => {
        if (!restaurantId) { setFormCategories([]); return }
        setCatLoading(true)
        try {
            const res = await api.get(`/menu/categories/?restaurant=${restaurantId}&page_size=50`)
            setFormCategories(res.data.results || [])
        } catch {
            toast.error('Failed to load sections for this restaurant.')
        } finally {
            setCatLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingItem(null)
        setFormData({ restaurant: '', category: '', name: '', description: '', price: '', is_available: true })
        setFormCategories([])
        setImageFile(null)
        setShowModal(true)
    }

    const openEditModal = (item) => {
        setEditingItem(item)
        setFormData({
            restaurant: item.restaurant, category: item.category,
            name: item.name, description: item.description,
            price: item.price, is_available: item.is_available,
        })
        setImageFile(null)
        setShowModal(true)
        loadCategoriesForRestaurant(item.restaurant)
    }

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        const updated = { ...formData, [e.target.name]: value }

        // When restaurant changes → reset category and reload sections
        if (e.target.name === 'restaurant') {
            updated.category = ''
            loadCategoriesForRestaurant(value)
        }

        setFormData(updated)
    }

    const handleFilterChange = (e) => {
        setFilterRestaurant(e.target.value)
        setCurrentPage(1)
    }

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
        setCurrentPage(1)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const data = new FormData()
            Object.entries(formData).forEach(([k, v]) => data.append(k, v))
            if (imageFile) data.append('image', imageFile)
            const headers = { 'Content-Type': 'multipart/form-data' }

            if (editingItem) {
                await api.patch(`/menu/items/${editingItem.id}/`, data, { headers })
                toast.success('Item updated.')
            } else {
                await api.post('/menu/items/', data, { headers })
                toast.success('Menu item created.')
            }
            setShowModal(false)
            fetchItems()
        } catch (err) {
            toast.error('Failed to save item.')
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this menu item?')) return
        try {
            await api.delete(`/menu/items/${id}/`)
            toast.success('Item deleted.')
            fetchItems()
        } catch {
            toast.error('Failed to delete item.')
        }
    }

    return (
        <div className="flex-1 px-5 md:px-10 py-10 bg-slate-50/50 min-h-screen relative overflow-y-auto">
            <div className="relative z-10">
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Panel</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                            Menu <span className="text-primary-600 font-light italic">Items</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
                            {totalCount} items across all restaurants
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search items…"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all w-full sm:w-[260px] shadow-sm"
                            />
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="bg-slate-900 text-white px-8 py-3.5 rounded-[20px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                        >
                            <Plus size={18} strokeWidth={3} />
                            Add Item
                        </button>
                    </div>
                </div>

                {/* ── Filter by Restaurant ────────────────────────────────── */}
                <div className="flex items-center gap-3 bg-white border border-slate-100 px-5 py-2.5 rounded-full shadow-sm w-fit mb-10">
                    <Filter size={14} className="text-primary-500" />
                    <select
                        value={filterRestaurant}
                        onChange={handleFilterChange}
                        className="bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-600 focus:outline-none cursor-pointer"
                    >
                        <option value="all">All Restaurants</option>
                        {restaurants.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>

                {/* ── Table ──────────────────────────────────────────────── */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">Item</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">Restaurant</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">Section</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 text-right">Price</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 text-right pr-10">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-24 text-center">
                                            <Loader2 className="animate-spin text-primary-400 mx-auto" size={32} />
                                        </td>
                                    </tr>
                                ) : menuItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-24 text-center">
                                            <UtensilsCrossed size={48} className="text-slate-100 mx-auto mb-4" />
                                            <p className="text-slate-400 font-bold text-sm">No items found.</p>
                                        </td>
                                    </tr>
                                ) : menuItems.map(item => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                                                    {item.image ? (
                                                        <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <ChefHat size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-black text-slate-900 leading-none block mb-1">{item.name}</span>
                                                    <p className="text-[10px] font-bold text-slate-400 line-clamp-1 max-w-[200px]">{item.description || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-bold text-slate-700">{item.restaurant_name}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
                                                {item.category_name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-slate-900">
                                            ₹{item.price}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                    item.is_available
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : 'bg-rose-50 text-rose-500 border-rose-100'
                                                }`}>
                                                    {item.is_available ? <CheckCircle2 size={11} /> : <X size={11} />}
                                                    {item.is_available ? 'Active' : 'Hidden'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 pr-10">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Pagination ──────────────────────────────────────────── */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mb-12">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-black text-slate-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* ── Add / Edit Modal ─────────────────────────────────────────── */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[40px] shadow-2xl relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20"
                        >
                            {/* Modal Header */}
                            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                                        {editingItem ? 'Edit Item' : 'New Menu Item'}
                                    </h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                                        Restaurant → Section → Item
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                                >
                                    <X size={20} strokeWidth={3} />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <div className="p-10 overflow-y-auto">
                                <form id="menuForm" onSubmit={handleSubmit} className="space-y-7">

                                    {/* Step 1: Restaurant */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            1. Select Restaurant
                                        </label>
                                        <select
                                            name="restaurant"
                                            value={formData.restaurant}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                                            required
                                        >
                                            <option value="" disabled>Choose a restaurant…</option>
                                            {restaurants.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Step 2: Section (filtered by restaurant) */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            2. Select Menu Section
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                disabled={!formData.restaurant || catLoading}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                required
                                            >
                                                <option value="" disabled>
                                                    {!formData.restaurant
                                                        ? '← Select a restaurant first'
                                                        : catLoading
                                                            ? 'Loading sections…'
                                                            : 'Choose a section…'
                                                    }
                                                </option>
                                                {formCategories.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                            {catLoading && (
                                                <Loader2 size={16} className="animate-spin text-primary-400 absolute right-4 top-1/2 -translate-y-1/2" />
                                            )}
                                        </div>
                                        {formData.restaurant && !catLoading && formCategories.length === 0 && (
                                            <p className="text-[11px] text-amber-600 font-bold">
                                                ⚠ No sections found for this restaurant.
                                            </p>
                                        )}
                                    </div>

                                    {/* Step 3: Item details */}
                                    <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">3. Item Name</label>
                                            <input
                                                type="text" name="name" value={formData.name} onChange={handleChange}
                                                placeholder="e.g. Chicken Biryani"
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price (₹)</label>
                                            <input
                                                type="number" name="price" value={formData.price} onChange={handleChange}
                                                placeholder="e.g. 180"
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                                        <textarea
                                            name="description" value={formData.description} onChange={handleChange}
                                            placeholder="Short description of the dish…"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none min-h-[100px]"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Item Image</label>
                                        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-slate-200 border-dashed rounded-[28px] cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-primary-400 transition-all group">
                                            <div className="flex flex-col items-center justify-center">
                                                <ImageIcon size={28} className="text-slate-300 mb-2 group-hover:text-primary-400 transition-colors" strokeWidth={1.5} />
                                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                    {imageFile ? imageFile.name : 'Upload image'}
                                                </p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                                        </label>
                                    </div>

                                    <div className="p-5 bg-slate-900 rounded-2xl flex items-center gap-4">
                                        <input
                                            type="checkbox" name="is_available" id="is_available"
                                            checked={formData.is_available} onChange={handleChange}
                                            className="w-5 h-5 text-primary-500 bg-slate-800 border-slate-700 rounded cursor-pointer"
                                        />
                                        <div>
                                            <label htmlFor="is_available" className="font-black text-white text-sm cursor-pointer">
                                                Available for ordering
                                            </label>
                                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mt-0.5">Visible to customers</p>
                                        </div>
                                    </div>

                                </form>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex gap-4 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-3.5 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-100 rounded-[16px] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" form="menuForm" disabled={submitting}
                                    className="px-12 py-3.5 bg-slate-900 text-white rounded-[16px] font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} strokeWidth={3} />}
                                    {submitting ? 'Saving…' : (editingItem ? 'Update Item' : 'Create Item')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AdminMenu