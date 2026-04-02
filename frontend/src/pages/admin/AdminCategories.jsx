import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Plus, Image as ImageIcon, FolderOpen, Pencil, Trash2, X, AlertCircle, Search, Filter, Activity, CheckCircle2, Loader2, Grid3X3, ArrowUpRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const AdminCategories = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [name, setName] = useState('')
    const [imageFile, setImageFile] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => { fetchCategories() }, [])

    const fetchCategories = async () => {
        try {
            const response = await api.get('/menu/categories/')
            setCategories(response.data.results)
        } catch {
            toast.error('Failed to sync collection Registry.')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingCategory(null)
        setName('')
        setImageFile(null)
        setShowModal(true)
    }

    const openEditModal = (category) => {
        setEditingCategory(category)
        setName(category.name)
        setImageFile(null)
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const data = new FormData()
            data.append('name', name)
            if (imageFile) data.append('image', imageFile)

            if (editingCategory) {
                await api.patch(
                    `/menu/categories/${editingCategory.id}/`,
                    data,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
                toast.success('Collection updated.')
            } else {
                await api.post(
                    '/menu/categories/',
                    data,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
                toast.success('New Collection established.')
            }
            setShowModal(false)
            fetchCategories()
        } catch {
            toast.error('Protocol violation: Failed to save.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('CAUTION: This will expunge the culinary collection. Proceed?')) return
        try {
            await api.delete(`/menu/categories/${id}/`)
            setCategories(categories.filter(c => c.id !== id))
            toast.success('Collection expunged.')
        } catch {
            toast.error('Failed to expunge collection.')
        }
    }

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing collection Registry...</p>
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
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Global Taxonomy Management</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Collection <span className="text-primary-600 font-light italic">Registry</span></h1>
                        <p className="text-slate-500 font-medium mt-2">Organize culinary offerings into authoritative platform segments.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Search groupings…"
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
                            Establish Collection
                        </button>
                    </div>
                </div>

                {/* Registry Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence>
                        {filteredCategories.map(cat => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                key={cat.id} 
                                className="bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl border border-slate-100 transition-all duration-500 group relative flex flex-col"
                            >
                                <div className="h-48 bg-slate-50 flex items-center justify-center relative overflow-hidden">
                                    {cat.image ? (
                                        <>
                                            <img
                                                src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${cat.image}`}
                                                alt={cat.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary-50/30 text-primary-200 group-hover:scale-110 transition-transform duration-700">
                                            <Grid3X3 size={48} strokeWidth={1} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <button
                                            onClick={() => openEditModal(cat)}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary-600 transition-all shadow-lg active:scale-90"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-600 transition-all shadow-lg active:scale-90"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                         <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Node Identifier</span>
                                    </div>
                                    <h3 className="font-black text-slate-900 text-xl tracking-tight group-hover:text-primary-600 transition-colors leading-none mb-4">{cat.name}</h3>
                                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Active Segment</span>
                                        <div className="flex items-center gap-1 text-[10px] font-black text-primary-500 uppercase tracking-widest bg-primary-50/50 px-2.5 py-1 rounded-lg border border-primary-100/30">
                                            Registry Entry <ArrowUpRight size={10} className="ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {filteredCategories.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-slate-100 border-dashed">
                            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle size={40} strokeWidth={1} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">Null Registry</h3>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Establish a new collection node to begin population.</p>
                        </div>
                    )}
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
                            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-white/20 pointer-events-auto flex flex-col">
                                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                                            {editingCategory ? 'Protocol Edit' : 'New Collection'}
                                        </h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 italic font-light">Taxonomy segment specification</p>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-90"
                                    >
                                        <X size={20} strokeWidth={3} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Collection Identity</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Taxonomy Formal Name…"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-inner"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Archive Image</label>
                                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-200 border-dashed rounded-[32px] cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-primary-400 transition-all group overflow-hidden">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <ImageIcon size={32} className="text-slate-400 mb-3 group-hover:text-primary-500 group-hover:scale-110 transition-all" strokeWidth={1.5} />
                                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                                    {imageFile ? imageFile.name : 'Attach Visual Key'}
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
                                    
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 bg-slate-900 text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                                        >
                                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} strokeWidth={3} />}
                                            {submitting ? 'Encrypting…' : 'Finalize Registry Node'}
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

export default AdminCategories