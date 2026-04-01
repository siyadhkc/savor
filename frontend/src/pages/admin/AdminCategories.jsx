import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Plus, Image as ImageIcon, FolderOpen, Pencil, Trash2, X, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const AdminCategories = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [name, setName] = useState('')
    const [imageFile, setImageFile] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => { fetchCategories() }, [])

    const fetchCategories = async () => {
        try {
            const response = await api.get('/menu/categories/')
            setCategories(response.data.results)
        } catch {
            toast.error('Failed to load categories.')
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
                toast.success('Category updated successfully')
            } else {
                await api.post(
                    '/menu/categories/',
                    data,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
                toast.success('Category created successfully')
            }
            setShowModal(false)
            fetchCategories()
        } catch {
            toast.error('Failed to save category.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return
        try {
            await api.delete(`/menu/categories/${id}/`)
            setCategories(categories.filter(c => c.id !== id))
            toast.success('Category deleted')
        } catch {
            toast.error('Failed to delete category.')
        }
    }

    return (
        <div className="flex-1 px-8 py-10 bg-slate-50 overflow-y-auto min-h-screen">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Categories</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage food groupings and collections.</p>
                </div>
                <button 
                    onClick={openCreateModal} 
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-full font-bold shadow-md shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all"
                >
                    <Plus size={20} strokeWidth={2.5} />
                    New Category
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading categories...</p>
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6"
                >
                    <AnimatePresence>
                        {categories.map(cat => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                key={cat.id} 
                                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 group"
                            >
                                <div className="h-40 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                                    {cat.image ? (
                                        <>
                                            <img
                                                src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${cat.image}`}
                                                alt={cat.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-200 group-hover:scale-105 transition-transform duration-500">
                                            <FolderOpen size={48} strokeWidth={1.5} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 relative">
                                    <h3 className="font-bold text-slate-800 mb-4 text-lg truncate group-hover:text-primary-600 transition-colors">{cat.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(cat)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                        >
                                            <Pencil size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="px-3 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 hover:text-rose-700 transition-colors"
                                            title="Delete Category"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {categories.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <p className="text-slate-500 text-lg font-medium">No categories found</p>
                            <p className="text-slate-400 text-sm mt-1">Create your first category to get started.</p>
                        </div>
                    )}
                </motion.div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-[24px] p-8 w-[90%] max-w-md shadow-2xl relative z-10"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                            >
                                <X size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block mb-2 font-semibold text-slate-700 text-sm">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Italian, Desserts"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold text-slate-700 text-sm">Cover Image</label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-primary-300 transition-colors overflow-hidden relative">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ImageIcon size={28} className="text-slate-400 mb-2" />
                                        <p className="text-sm font-medium text-slate-500">
                                            {imageFile ? imageFile.name : 'Click to upload image'}
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
                            <div className="flex gap-3 justify-end pt-4 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-2.5 bg-primary-600 text-white rounded-full font-bold shadow-md shadow-primary-600/20 hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center min-w-[120px]"
                                >
                                    {submitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        'Save Category'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}

export default AdminCategories