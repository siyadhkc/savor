import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { getImageUrl } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { 
    UtensilsCrossed, 
    Plus, 
    Search, 
    Pencil, 
    Trash2, 
    X, 
    Image as ImageIcon, 
    Loader2,
    Activity,
    CheckCircle2,
    ChefHat,
    ArrowUpRight,
    Filter
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const RestaurantMenu = () => {
    const { user } = useAuth()
    const [menuItems, setMenuItems] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [imageFile, setImageFile] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
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
            const [menuRes, catRes] = await Promise.all([
                api.get(`/menu/items/?restaurant=${user?.restaurant_id || ''}`),
                api.get('/menu/categories/'),
            ])
            setMenuItems(menuRes.data.results)
            setCategories(catRes.data.results)
        } catch {
            toast.error('Failed to sync menu cluster.')
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
                toast.success('Formulation updated.')
            } else {
                await api.post(
                    '/menu/items/',
                    data,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
                toast.success('Dish architecture established.')
            }

            setShowModal(false)
            fetchData()
        } catch (error) {
            toast.error('Protocol violation: Failed to save.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('CAUTION: This will expunge the dish formulation. Proceed?')) return
        try {
            await api.delete(`/menu/items/${id}/`)
            setMenuItems(menuItems.filter(i => i.id !== id))
            toast.success('Item deleted.')
        } catch {
            toast.error('Failed to delete item.')
        }
    }

    const filteredItems = menuItems.filter(i => 
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing culinary database...</p>
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
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Partner Menu Optimization</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Culinary <span className="text-primary-600 font-light italic">Catalog</span></h1>
                        <p className="text-slate-500 font-medium mt-2">Curate and refine your restaurant's digital storefront offerings.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Search dishes…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all w-full sm:w-[280px] shadow-sm"
                            />
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="bg-slate-900 text-white px-8 py-3.5 rounded-[20px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                        >
                            <Plus size={18} strokeWidth={3} />
                            Register Dish
                        </button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between mb-8 bg-white/50 px-6 py-4 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live: {menuItems.filter(i => i.is_available).length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hidden: {menuItems.filter(i => !i.is_available).length}</span>
                        </div>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                        Operational Sync Active
                    </div>
                </div>

                {/* Menu Manifest */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-12">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">Dish Formulation</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">Collection Segment</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 text-right">Yield Value</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 text-right pr-12">Controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center">
                                             <div className="flex flex-col items-center">
                                                <UtensilsCrossed size={48} className="text-slate-100 mb-4" />
                                                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">Null Content</h3>
                                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No matching dish formulations found.</p>
                                             </div>
                                        </td>
                                    </tr>
                                ) : filteredItems.map(item => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group tracking-tight">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-[24px] bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm relative group-hover:rotate-3 transition-all duration-500">
                                                    {item.image ? (
                                                        <img
                                                            src={getImageUrl(item.image)}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <ChefHat size={24} className="text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col max-w-sm">
                                                    <span className="text-base font-black text-slate-900 leading-none mb-1.5">{item.name}</span>
                                                    <p className="text-[10px] font-bold text-slate-400 line-clamp-1 italic">{item.description || 'No descriptive payload provided.'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary-500/60 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100/50">
                                                {item.category_name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-slate-900">
                                            <span className="text-base tracking-tighter leading-none">₹{item.price}</span>
                                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">INR Yield</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    item.is_available
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                                                        : 'bg-rose-50 text-rose-600 border-rose-100/50'
                                                }`}>
                                                    {item.is_available ? <CheckCircle2 size={12} strokeWidth={3} /> : <Activity size={12} strokeWidth={3} />}
                                                    {item.is_available ? 'Live' : 'Hidden'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 pr-12">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all shadow-sm"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
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
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" 
                        onClick={() => setShowModal(false)} 
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-[40px] shadow-2xl relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20"
                    >
                        {/* Modal Header */}
                        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                                    {editingItem ? 'Edit Formulation' : 'New Dish Architecture'}
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 italic font-light">Specify the details for the new menu offering.</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-90"
                            >
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <div className="p-10 overflow-y-auto custom-scrollbar">
                            <form id="menuForm" onSubmit={handleSubmit} className="space-y-8">
                                
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Collection Segment</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-inner appearance-none bg-no-repeat bg-[right_1.5rem_center]"
                                        required
                                    >
                                        <option value="" disabled>Select Collection Segment…</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dish Identity</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Unique Formulation Title…"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Yield Value (₹)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="Value in INR…"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descriptive Payload</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Outline the flavor profile and presentation guidelines…"
                                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none min-h-[140px]"
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Visual Asset</label>
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-200 border-dashed rounded-[32px] cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-primary-400 transition-all group overflow-hidden">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImageIcon size={32} className="text-slate-400 mb-3 group-hover:text-primary-500 group-hover:scale-110 transition-all" strokeWidth={1.5} />
                                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                                {imageFile ? imageFile.name : 'Attach Visual Evidence'}
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

                                <div className="p-6 bg-slate-900 rounded-[30px] flex items-center gap-5 border border-slate-800 shadow-xl shadow-slate-900/10">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            name="is_available"
                                            id="is_available"
                                            checked={formData.is_available}
                                            onChange={handleChange}
                                            className="w-6 h-6 text-primary-500 bg-slate-800 border-slate-700 rounded-lg focus:ring-offset-slate-900 focus:ring-primary-500/50 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="is_available" className="font-black text-white text-sm tracking-tight cursor-pointer">
                                            Operational Activation
                                        </label>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest italic leading-none mt-1">Live visibility on customer discovery layer</p>
                                    </div>
                                </div>

                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex gap-4 justify-end">
                            <button
                                type="submit"
                                form="menuForm"
                                disabled={submitting}
                                className="flex-1 bg-slate-900 text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <CheckCircle2 size={20} strokeWidth={3} />
                                )}
                                {submitting ? 'Encrypting…' : (editingItem ? 'Publish Updates' : 'Mint Dish Formulation')}
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
