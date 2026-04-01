import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { getImageUrl } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { UtensilsCrossed, Plus, Search, Pencil, Trash2, X, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const RestaurantMenu = () => {
    const { user } = useAuth()
    const [menuItems, setMenuItems] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [imageFile, setImageFile] = useState(null)
    const [formData, setFormData] = useState({
        restaurant: user?.restaurant_id || '',
        category: '',
        name: '',
        description: '',
        price: '',
        is_available: true,
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // Because backend filter_backends includes DjangoFilterBackend with 'restaurant' field,
            // we can just fetch all menu items. The get_queryset will hopefully return only the items
            // the user is allowed to see, OR we can pass the filter explicitly just in case.
            // Wait, for restaurants, backend get_permissions allows view all. 
            // So we pass ?restaurant= restaurant_id
            const [menuRes, catRes] = await Promise.all([
                api.get(`/menu/items/?restaurant=${user?.restaurant_id || ''}`),
                api.get('/menu/categories/'),
            ])
            setMenuItems(menuRes.data.results)
            setCategories(catRes.data.results)
        } catch {
            toast.error('Failed to load menu data.')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingItem(null)
        setFormData({
            restaurant: user?.restaurant_id || '',
            category: '',
            name: '',
            description: '',
            price: '',
            is_available: true,
        })
        setImageFile(null)
        setShowModal(true)
    }

    const openEditModal = (item) => {
        setEditingItem(item)
        setFormData({
            restaurant: item.restaurant,
            category: item.category,
            name: item.name,
            description: item.description,
            price: item.price,
            is_available: item.is_available,
        })
        setImageFile(null)
        setShowModal(true)
    }

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox'
            ? e.target.checked
            : e.target.value
        setFormData({ ...formData, [e.target.name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const data = new FormData()
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value)
            })
            if (imageFile) data.append('image', imageFile)

            if (editingItem) {
                await api.patch(
                    `/menu/items/${editingItem.id}/`,
                    data,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
                toast.success('Menu item updated')
            } else {
                await api.post(
                    '/menu/items/',
                    data,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
                toast.success('Menu item created')
            }

            setShowModal(false)
            fetchData()
        } catch (error) {
            toast.error('Failed to save menu item.')
            console.error('Failed to save menu item:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Eradicate this menu item?')) return
        try {
            await api.delete(`/menu/items/${id}/`)
            setMenuItems(menuItems.filter(i => i.id !== id))
            toast.success('Item deleted')
        } catch {
            toast.error('Failed to delete item.')
        }
    }

    return (
        <div className="flex-1 px-8 py-10 bg-slate-50 overflow-y-auto min-h-screen selection:bg-primary-500/30">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Your Menu</h1>
                    <p className="text-slate-500 font-medium mt-1">Design and manage your available dishes.</p>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button 
                        onClick={openCreateModal} 
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-full font-bold shadow-md shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all whitespace-nowrap"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                        New Item
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Fetching the menu database...</p>
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50/80">
                                    <th className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pl-8">Dish</th>
                                    <th className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100">Category</th>
                                    <th className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100">Price</th>
                                    <th className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100 text-center">Status</th>
                                    <th className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100 text-right pr-8">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {menuItems.map((item) => (
                                        <motion.tr 
                                            key={item.id} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="hover:bg-slate-50/80 transition-colors group border-b border-slate-50 last:border-0"
                                        >
                                            <td className="px-6 py-4 pl-8 min-w-[300px]">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm relative">
                                                        {item.image ? (
                                                            <img
                                                                src={getImageUrl(item.image)}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <UtensilsCrossed size={20} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-base mb-1 truncate md:max-w-xs transition-colors group-hover:text-primary-600">{item.name}</p>
                                                        <p className="text-slate-500 text-xs font-medium truncate max-w-[200px] md:max-w-xs opacity-70">
                                                            {item.description || 'No description provided'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                                                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-md text-xs tracking-wide">
                                                    {item.category_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-800 text-base">
                                                ₹{item.price}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
                                                    item.is_available
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                }`}>
                                                    {item.is_available ? 'Available' : 'Hidden'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 pr-8 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-colors focus:outline-none"
                                                        title="Edit Item"
                                                    >
                                                        <Pencil size={18} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors focus:outline-none"
                                                        title="Delete Item"
                                                    >
                                                        <Trash2 size={18} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {menuItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                                <Search className="text-slate-300" size={32} />
                            </div>
                            <p className="text-slate-500 text-lg font-bold">No menu items found</p>
                            <p className="text-slate-400 text-sm mt-1">Create a new item to get started.</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Modal Drawer */}
            <AnimatePresence>
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
                        onClick={() => setShowModal(false)} 
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-[32px] shadow-2xl relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                {editingItem ? 'Edit Formulation' : 'New Dish Architecture'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Modal Form Scrollable Area */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <form id="menuForm" onSubmit={handleSubmit} className="space-y-6">
                                
                                {/* Removed Restaurant Selector. We implicitly use formData.restaurant */}
                                <input type="hidden" name="restaurant" value={formData.restaurant} />

                                <div className="space-y-2">
                                    <label className="block font-bold text-slate-700 text-sm uppercase tracking-wider">Category Tag</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none"
                                        required
                                    >
                                        <option value="" disabled>Select Category grouping</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                                    <div className="space-y-2">
                                        <label className="block font-bold text-slate-700 text-sm uppercase tracking-wider">Title Identity</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Truffle Infused Risotto"
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:font-medium placeholder:text-slate-400"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block font-bold text-slate-700 text-sm uppercase tracking-wider">Price (₹)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="Ex: 899"
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-black focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:font-medium placeholder:text-slate-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block font-bold text-slate-700 text-sm uppercase tracking-wider">Description Payload</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Give depth to the dish's flavor profile..."
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-y min-h-[100px] placeholder:text-slate-400"
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block font-bold text-slate-700 text-sm uppercase tracking-wider">Visual Asset Upload</label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-primary-400 transition-colors overflow-hidden group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImageIcon size={32} className="text-slate-400 mb-3 group-hover:text-primary-500 transition-colors" strokeWidth={1.5} />
                                            <p className="text-sm font-bold text-slate-500 group-hover:text-primary-600 transition-colors">
                                                {imageFile ? imageFile.name : 'Drag or click to attach media'}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files[0])}
                                        />
                                    </label>
                                </div>

                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            name="is_available"
                                            id="is_available"
                                            checked={formData.is_available}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-primary-600 bg-white border-slate-300 rounded focus:ring-primary-500/30 focus:ring-2 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="is_available" className="font-bold text-slate-800 cursor-pointer">
                                            Visible & Available to Customer App
                                        </label>
                                        <p className="text-xs font-semibold text-slate-400">Toggle this off to temporarily hide the item without deleting it.</p>
                                    </div>
                                </div>

                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex gap-4 justify-end rounded-b-[32px]">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-full font-bold hover:bg-slate-50 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="menuForm"
                                disabled={submitting}
                                className="px-8 py-3 bg-primary-600 text-white rounded-full font-bold shadow-lg shadow-primary-600/30 hover:bg-primary-700 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center min-w-[140px]"
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    editingItem ? 'Publish Updates' : 'Mint Menu Item'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            </AnimatePresence>
        </div>
    )
}

export default RestaurantMenu
