import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { getImageUrl } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { MapPin, Phone, CheckCircle2, AlertCircle, Search, UtensilsCrossed, ShoppingBag, Loader2, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const RestaurantDetail = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [restaurant, setRestaurant] = useState(null)
    const [menuItems, setMenuItems] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [addingItem, setAddingItem] = useState(null)

    useEffect(() => {
        fetchRestaurantData()
    }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

    const fetchRestaurantData = async () => {
        setLoading(true)
        try {
            const [restaurantRes, menuRes, categoriesRes] = await Promise.all([
                api.get(`/restaurant/restaurants/${id}/`),
                api.get('/menu/items/', {
                    params: { restaurant: id }
                }),
                api.get('/menu/categories/'),
            ])

            setRestaurant(restaurantRes.data)
            setMenuItems(menuRes.data.results)
            setCategories(categoriesRes.data.results)
        } catch (error) {
            console.error('Failed to load restaurant:', error)
            toast.error('Failed to load restaurant.')
            navigate('/')
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = async (menuItem) => {
        if (!user) {
            toast.error('Please login to add items to cart')
            navigate('/login')
            return
        }

        setAddingItem(menuItem.id)
        try {
            await api.post('/orders/cart/add_item/', {
                menu_item_id: menuItem.id,
                quantity: 1,
            })
            toast.success(`${menuItem.name} added to cart!`)
        } catch (error) {
            console.error('Failed to add item to cart:', error)
            toast.error('Failed to add item to cart.')
        } finally {
            setAddingItem(null)
        }
    }

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' ||
            item.category === parseInt(selectedCategory)
        const matchesSearch = item.name.toLowerCase()
            .includes(search.toLowerCase())
        return matchesCategory && matchesSearch
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-primary-600">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="text-lg font-semibold text-slate-600">Loading menu...</p>
            </div>
        )
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-60 text-slate-500">
                <AlertCircle size={64} className="mb-4 text-slate-300" />
                <p className="text-xl font-bold text-slate-700">Restaurant not found</p>
                <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-white rounded-full shadow-sm text-slate-800 font-bold hover:shadow-md transition-shadow">Go Back</button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-primary-500/30">

            {/* Restaurant Hero Header */}
            <div className="relative bg-slate-900 border-b border-white/10">
                <div className="absolute inset-0 overflow-hidden">
                    {restaurant.logo ? (
                        <>
                            <img src={getImageUrl(restaurant.logo)} alt={restaurant.name} className="w-full h-full object-cover blur-md opacity-40 scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-primary-900" />
                    )}
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-end md:items-center gap-8">
                    {restaurant.logo ? (
                        <motion.img
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            src={getImageUrl(restaurant.logo)}
                            alt={restaurant.name}
                            className="w-32 h-32 md:w-48 md:h-48 rounded-3xl object-cover border-4 border-white/10 shadow-2xl flex-shrink-0 bg-slate-800"
                        />
                    ) : (
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-primary-600/50 border-4 border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
                            <UtensilsCrossed size={64} className="text-white/80" />
                        </div>
                    )}
                    
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex-1 text-white"
                    >
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/50 hover:text-white mb-4 transition-colors font-medium text-sm group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Restaurants
                        </button>
                        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight mix-blend-plus-lighter">{restaurant.name}</h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 opacity-90 font-medium mb-6">
                            <p className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                                <MapPin size={16} className="text-primary-400" /> {restaurant.address}
                            </p>
                            <p className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                                <Phone size={16} className="text-primary-400" /> {restaurant.phone}
                            </p>
                        </div>
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                            restaurant.is_active
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 backdrop-blur-md'
                        }`}>
                            {restaurant.is_active ? <CheckCircle2 size={16} strokeWidth={3} /> : <AlertCircle size={16} strokeWidth={3} />}
                            {restaurant.is_active ? 'Currently Open' : 'Closed Currently'}
                        </span>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 -mt-10 relative z-20">
                {/* Search + Filter Bar */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[24px] shadow-xl shadow-slate-200/50 border border-white p-6 mb-12">
                    <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-1 mb-6 border border-slate-100 focus-within:ring-4 focus-within:ring-primary-500/20 transition-all">
                        <Search size={20} className="text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search the menu..."
                            className="w-full px-4 py-3 bg-transparent text-slate-800 font-medium placeholder:text-slate-400 outline-none"
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap items-center">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mr-2">Categories</span>
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all focus:outline-none ${
                                selectedCategory === 'all'
                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/50'
                            }`}
                        >
                            All Discoveries
                        </button>
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(String(category.id))}
                                className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all focus:outline-none ${
                                    selectedCategory === String(category.id)
                                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/50'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex items-baseline justify-between mb-8">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                        The Menu
                    </h2>
                    <span className="text-slate-400 font-semibold">{filteredItems.length} items available</span>
                </div>

                {filteredItems.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed"
                    >
                        <Search size={48} className="text-slate-300 mb-4" />
                        <p className="text-xl font-bold text-slate-700">Nothing caught our eye.</p>
                        <p className="text-slate-500 font-medium mt-1">Try another category or adjust your search.</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-8"
                    >
                        <AnimatePresence>
                            {filteredItems.map(item => (
                                <motion.div 
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                                    }}
                                    layout
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={item.id} 
                                    className="bg-white rounded-[24px] shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 overflow-hidden group flex flex-col"
                                >
                                    {/* Item Image */}
                                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                                        {item.image ? (
                                            <>
                                                <img
                                                    src={getImageUrl(item.image)}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-primary-200 bg-primary-50">
                                                <UtensilsCrossed size={48} strokeWidth={1.5} />
                                            </div>
                                        )}
                                        {!item.is_available && (
                                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-white font-black tracking-widest uppercase text-xl z-10">
                                                Sold Out
                                            </div>
                                        )}
                                    </div>

                                    {/* Item Info */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="text-xl font-black mb-2 text-slate-800 tracking-tight group-hover:text-primary-600 transition-colors">{item.name}</h3>
                                        <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-1 font-medium">
                                            {item.description}
                                        </p>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                            <span className="text-2xl font-black text-slate-800">
                                                ₹{item.price}
                                            </span>
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={!item.is_available || addingItem === item.id}
                                                className={`relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/30 ${
                                                    !item.is_available
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                        : addingItem === item.id
                                                            ? 'bg-amber-400 text-white cursor-wait shadow-md'
                                                            : 'bg-primary-600 text-white shadow-md shadow-primary-600/20 hover:bg-primary-700 active:scale-95'
                                                }`}
                                            >
                                                {addingItem === item.id ? (
                                                    <>
                                                        <Loader2 size={16} className="animate-spin" />
                                                        <span>Adding...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingBag size={16} strokeWidth={2.5} />
                                                        <span>Add to Cart</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default RestaurantDetail