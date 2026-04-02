import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { getImageUrl } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { 
    MapPin, Phone, AlertCircle, Search, 
    UtensilsCrossed, ShoppingBag, Loader2, 
    ArrowLeft, Star, Clock, Dot, ChevronRight
} from 'lucide-react'
import FloatingCart from '../../components/FloatingCart'
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

    // Deterministic mock data for consistency
    const getMockData = (resId) => {
        const seed = resId * 12345
        const rating = (4 + (seed % 10) / 10).toFixed(1)
        const reviews = 100 + (seed % 900)
        const time = 20 + (seed % 25)
        const price = 200 + (seed % 400)
        return { rating, reviews, time, price }
    }

    useEffect(() => {
        window.scrollTo(0, 0)
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
            navigate('/restaurants')
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
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Crafting the menu…</p>
            </div>
        )
    }

    if (!restaurant) return null

    const { rating, reviews, time, price } = getMockData(restaurant.id)

    return (
        <div className="min-h-screen bg-white selection:bg-primary-500/30">
            
            {/* ── HEADER SECTION ────────────────────────────────────────────── */}
            <header className="bg-white pt-6 pb-12 border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-5">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                        <ChevronRight size={10} />
                        <Link to="/restaurants" className="hover:text-primary-600 transition-colors">Restaurants</Link>
                        <ChevronRight size={10} />
                        <span className="text-slate-800">{restaurant.name}</span>
                    </nav>

                    <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.03)] p-5 sm:p-8 relative overflow-hidden group">
                         {/* Subtle Background Pattern */}
                         <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" />
                         
                         <div className="relative flex flex-col md:flex-row justify-between gap-6 sm:gap-8">
                            <div className="flex-1">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-3 sm:mb-4 leading-tight sm:leading-none">
                                    {restaurant.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-slate-500 font-bold text-[13px] sm:text-sm tracking-tight mb-5 sm:mb-6">
                                    <span className="flex items-center gap-1.5 underline decoration-slate-200 underline-offset-4">
                                        Bakery, Desserts, Snacks
                                    </span>
                                    <Dot size={20} className="text-slate-300 hidden sm:block" />
                                    <span className="flex items-center gap-1.5 w-full sm:w-auto">
                                        <MapPin size={14} className="text-primary-500 shrink-0" />
                                        <span className="truncate">{restaurant.address}</span>
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide -mx-1 px-1">
                                    <div className="flex flex-col shrink-0">
                                        <div className="flex items-center gap-1 text-slate-900 font-black text-base sm:text-lg">
                                            <Star size={16} fill="#059669" className="text-emerald-600" />
                                            {rating}
                                        </div>
                                        <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
                                            {reviews}+ ratings
                                        </div>
                                    </div>
                                    <div className="w-px h-8 sm:h-10 bg-slate-100 shrink-0" />
                                    <div className="flex flex-col shrink-0">
                                        <div className="flex items-center gap-1 text-slate-900 font-black text-base sm:text-lg">
                                            <Clock size={16} className="text-primary-600" />
                                            {time}-{time+5} mins
                                        </div>
                                        <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
                                            Delivery Time
                                        </div>
                                    </div>
                                    <div className="w-px h-8 sm:h-10 bg-slate-100 shrink-0" />
                                    <div className="flex flex-col shrink-0">
                                        <div className="flex items-center gap-1 text-slate-900 font-black text-base sm:text-lg">
                                            ₹{price}
                                        </div>
                                        <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
                                            Cost for two
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 sm:gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-0 border-slate-100">
                                <div className={`px-4 py-2 rounded-[1rem] border flex items-center gap-2 shadow-sm ${
                                    restaurant.is_active 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${restaurant.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {restaurant.is_active ? 'Orders Open' : 'Closed Now'}
                                    </span>
                                </div>
                                {restaurant.logo && (
                                    <img 
                                        src={getImageUrl(restaurant.logo)} 
                                        alt="" 
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1rem] sm:rounded-2xl object-cover border border-slate-100 shadow-sm"
                                    />
                                )}
                            </div>
                         </div>
                    </div>
                </div>
            </header>

            {/* ── STICKY CATEGORY NAV ─────────────────────────────────────── */}
            <nav className="sticky top-[72px] z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 overflow-x-auto scrollbar-hide py-3">
                <div className="max-w-4xl mx-auto px-5 flex items-center gap-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-black tracking-tight transition-all shrink-0 border ${
                            selectedCategory === 'all'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10'
                                : 'bg-white text-slate-500 border-transparent hover:bg-slate-50'
                        }`}
                    >
                        Full Menu
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(String(cat.id))}
                            className={`px-5 py-2.5 rounded-xl text-sm font-black tracking-tight transition-all shrink-0 border ${
                                selectedCategory === String(cat.id)
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/10'
                                    : 'bg-white text-slate-500 border-transparent hover:bg-slate-50'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}

                    <div className="ml-auto hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-64 focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:border-primary-500 transition-all">
                        <Search size={14} className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search in menu..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none w-full"
                        />
                    </div>
                </div>
            </nav>

            {/* ── MENU LIST ────────────────────────────────────────────────── */}
            <main className="max-w-4xl mx-auto px-5 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                        Menu ({filteredItems.length})
                    </h2>
                </div>

                <div className="divide-y divide-slate-100">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, idx) => {
                            // Mock Veg/Non-Veg
                            const isVeg = (item.id + idx) % 2 === 0
                            
                            return (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={item.id}
                                    className="py-8 sm:py-10 flex gap-4 sm:gap-8 group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                                            <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 p-0.5 rounded-sm flex items-center justify-center ${isVeg ? 'border-emerald-500' : 'border-rose-500'}`}>
                                                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            </div>
                                            {(item.id + idx) % 5 === 0 && (
                                                <span className="text-[9px] sm:text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                                    Bestseller
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-0.5 sm:mb-1 group-hover:text-primary-600 transition-colors leading-tight sm:leading-snug">{item.name}</h3>
                                        <div className="text-slate-950 font-black text-base sm:text-lg mb-2 sm:mb-3">₹{item.price}</div>
                                        <p className="text-slate-400 text-[12px] sm:text-sm font-medium leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-none">
                                            {item.description || "Freshly prepared with handpicked ingredients and a secret blend of spices."}
                                        </p>
                                    </div>

                                    <div className="w-28 sm:w-40 flex flex-col items-center shrink-0">
                                        <div className="relative w-full h-24 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm mb-[-12px] sm:mb-[-20px] group-hover:scale-[1.02] transition-transform duration-500">
                                            {item.image ? (
                                                <img 
                                                    src={getImageUrl(item.image)} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                                                    <UtensilsCrossed size={24} sm:size={36} strokeWidth={1} />
                                                </div>
                                            )}
                                            {!item.is_available && (
                                                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    Out of Stock
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            disabled={!item.is_available || addingItem === item.id}
                                            className="relative z-10 w-24 sm:w-28 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] text-primary-600 font-black uppercase text-[10px] sm:text-[11px] tracking-widest hover:bg-slate-50 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {addingItem === item.id ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 size={10} className="animate-spin" />
                                                    <span>...</span>
                                                </div>
                                            ) : (
                                                "Add"
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-24 bg-slate-50 rounded-[3rem] border border-slate-100">
                        <div className="inline-flex w-24 h-24 bg-white rounded-full items-center justify-center shadow-inner mb-6">
                            <UtensilsCrossed size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">No menu items found</h3>
                        <p className="text-slate-400 font-medium">Try searching for something else or browse categories.</p>
                    </div>
                )}
            </main>
            <FloatingCart />
        </div>
    )
}

export default RestaurantDetail