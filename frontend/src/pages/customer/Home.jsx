import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Footer from '../../components/Footer'
import qrImg from '../../assets/images/qr.png'
import pizzaImg from '../../assets/images/pizza.png'
import { Search, MapPin, ArrowRight, Utensils, Loader2, ChevronRight, Star, Clock, Heart, TrendingUp, CheckCircle2, ChefHat, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { getImageUrl } from '../../utils/helpers'

const KERALA_CITIES = [
    { name: 'Kochi',       desc: 'Commercial Capital' },
    { name: 'Kannur',      desc: 'City of Looms & Lores' },
    { name: 'Kozhikode',   desc: 'City of Spices'     },
    { name: 'Trivandrum',  desc: 'State Capital'     },
    { name: 'Alappuzha',   desc: 'Venice of the East' },
    { name: 'Wayanad',     desc: 'Nature Boutique'    },
]

const Home = () => {
    const navigate = useNavigate()
    const [categories,  setCategories]  = useState([])
    const [catLoading,  setCatLoading]  = useState(true)
    const [searchInput, setSearchInput] = useState('')
    const scrollRef = useRef(null)

    const scrollCarousel = (dir) => {
        if (scrollRef.current) {
            const scrollAmount = dir === 'left' ? -400 : 400
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    useEffect(() => {
        api.get('/menu/cuisines/')
            .then(res => setCategories(res.data.results || []))
            .finally(() => setCatLoading(false))
    }, [])

    const goToRestaurants = ({ search = '', category = '' } = {}) => {
        const params = new URLSearchParams()
        if (search.trim()) params.set('search', search.trim())
        if (category) params.set('category', category)
        navigate(`/restaurants${params.toString() ? '?' + params.toString() : ''}`)
    }

    const handleSearchSubmit = (e) => { 
        e.preventDefault(); 
        goToRestaurants({ search: searchInput }) 
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <section className="relative bg-slate-50 pt-28 pb-20 lg:pt-36 lg:pb-32 overflow-hidden">
                {/* Subtle tech background pattern */}
                <div
                    className="absolute inset-0 opacity-[0.4]"
                    style={{
                        backgroundImage: 'radial-gradient(#16a34a 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
                        
                        {/* Left Content */}
                        <div className="flex-1 text-center lg:text-left pt-10 lg:pt-0 max-w-2xl mx-auto lg:mx-0">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                                <h1 className="text-slate-900 text-5xl sm:text-6xl lg:text-7xl font-display font-black tracking-tighter leading-[1.05] mb-6">
                                    Your favourite food,<br />
                                    <span className="text-primary-600 font-display">delivered fast.</span>
                                </h1>

                                <p className="text-slate-600 text-lg sm:text-xl font-medium mb-10 leading-relaxed">
                                    Order from the best local restaurants in Kerala with easy, on-demand delivery.
                                </p>

                                {/* Search Bar (Tech Giant Style) */}
                                <form
                                    onSubmit={handleSearchSubmit}
                                    className="flex flex-col sm:flex-row items-stretch bg-white border border-slate-200 rounded-2xl sm:rounded-full p-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-shadow duration-300 w-full"
                                >
                                    {/* Location Input Placeholder */}
                                    <div className="hidden sm:flex items-center gap-2.5 px-5 py-2 border-r border-slate-200 shrink-0">
                                        <MapPin size={20} className="text-slate-400" />
                                        <div className="text-slate-900 font-medium text-base whitespace-nowrap">
                                            Current Location
                                        </div>
                                    </div>
                                    
                                    {/* Search Input */}
                                    <div className="flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-2 flex-1 min-w-0">
                                        <Search size={20} className="text-slate-400 sm:hidden" />
                                        <input
                                            type="text"
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            placeholder="Search for restaurant, cuisine or a dish..."
                                            className="w-full bg-transparent text-slate-900 placeholder:text-slate-500 focus:outline-none font-medium text-base min-w-0"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="bg-primary-600 text-white px-8 py-3.5 sm:py-3 font-bold text-base hover:bg-primary-700 transition-colors shrink-0 flex items-center justify-center rounded-xl sm:rounded-full mt-2 sm:mt-0"
                                    >
                                        Find Food
                                    </button>
                                </form>

                                {/* Popular areas */}
                                <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-sm text-slate-500 font-medium">
                                    <span className="text-slate-400">Popular:</span>
                                    {['Biryani', 'Pizza', 'Seafood', 'Burger'].map((tag) => (
                                        <button key={tag} onClick={() => goToRestaurants(tag)} className="hover:text-primary-600 hover:underline transition-colors focus:outline-none">
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Graphic - Unique Premium Bento Aesthetic */}
                        <div className="flex-1 w-full max-w-[500px] lg:max-w-none relative hidden md:flex items-center justify-center lg:justify-end pr-4 lg:pr-12">
                            <div className="relative w-[340px] h-[440px] lg:w-[380px] lg:h-[480px]">
                                {/* Central App UI Card */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                                    className="absolute inset-0 bg-white rounded-[32px] border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col z-10"
                                >
                                    <div className="h-64 bg-slate-50 relative overflow-hidden flex items-center justify-center">
                                        {/* Abstract background elements */}
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#86efac_0%,transparent_60%)] opacity-40" />
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#10b981_0%,transparent_60%)] opacity-10" />
                                        
                                        {/* Icon Composition */}
                                        <motion.div 
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="relative flex items-center justify-center w-32 h-32"
                                        >
                                            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                                            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 rounded-[32px] shadow-[0_20px_50px_rgba(37,99,235,0.3)] relative z-10 group-hover:rotate-6 transition-transform duration-500">
                                                <ChefHat size={48} className="text-white" strokeWidth={2.5} />
                                            </div>
                                            
                                            {/* Floating mini-icons */}
                                            <motion.div 
                                                animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
                                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                                className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-blue-600 z-20"
                                            >
                                                <Star size={20} fill="currentColor" />
                                            </motion.div>
                                            <motion.div 
                                                animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                                                className="absolute -bottom-6 -left-6 w-14 h-14 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-blue-500 z-20"
                                            >
                                                <Clock size={24} strokeWidth={2.5} />
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                    <div className="flex-1 p-6 pb-7 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl lg:text-2xl font-display font-black text-slate-800 tracking-tight">Saudi Shawaya</h3>
                                                <p className="text-slate-500 text-sm font-medium mt-1">Arabic Gourmet • Trending</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                                                <Heart size={18} className="text-rose-500 fill-rose-500" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100">
                                                <Star size={14} className="text-blue-600 fill-blue-600" />
                                                <span className="text-blue-700 text-xs font-bold">4.9</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                                <Clock size={14} className="text-slate-300" />
                                                <span>Fast Delivery</span>
                                            </div>
                                        </div>
                                        <div 
                                            onClick={() => goToRestaurants()}
                                            className="mt-auto h-14 w-full bg-slate-900 rounded-[16px] flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-slate-800 transition-colors cursor-pointer group"
                                        >
                                            <span className="text-white font-bold text-sm tracking-wide group-hover:scale-105 transition-transform">Explore Menu</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Top Right Floating Stat */}
                                <motion.div 
                                    initial={{ opacity: 0, x: 20, y: -10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
                                    className="absolute top-12 -right-16 lg:-right-20 w-48 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-4 z-20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <TrendingUp size={20} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Trending</p>
                                            <p className="text-sm font-black text-slate-800">#1 in Kannur</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Bottom Left Floating Promo */}
                                <motion.div 
                                    initial={{ opacity: 0, x: -20, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
                                    className="absolute bottom-16 -left-16 lg:-left-20 w-56 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(37,99,235,0.15)] p-4 z-20 flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                                        <span className="text-white font-black text-xl">%</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">50% OFF</p>
                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">On your first 3 orders</p>
                                    </div>
                                </motion.div>
                                
                                {/* Background Decorative Circle */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-blue-100 rounded-full blur-[80px] opacity-70 -z-10 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── QUICK ACTION ──────────────────────────────────────────────── */}
            <section className="py-10 sm:py-16 bg-[#FCFCFD]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <button
                        onClick={() => goToRestaurants()}
                        className="w-full group flex items-center justify-between bg-white border border-slate-200/60 hover:border-primary-300 rounded-[28px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 text-left"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary-50/50 group-hover:border-primary-100 transition-all duration-500">
                                <Utensils size={32} className="text-slate-600 group-hover:text-primary-600 transition-colors" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
                                    Browse All Restaurants
                                </h2>
                                <p className="text-slate-500 text-sm sm:text-base font-medium">
                                    Explore our full selection of curated dining options
                                </p>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-primary-200 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all duration-500 mr-2">
                            <ArrowRight size={20} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </div>
            </section>

            {/* ── CATEGORIES ────────────────────────────────────────────────── */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
                        <div>
                            <p className="text-primary-600 text-xs font-bold uppercase tracking-[0.2em] mb-2">Categories</p>
                            <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
                                What are you craving?
                            </h2>
                        </div>
                        <button
                            onClick={() => goToRestaurants()}
                            className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 transition-colors group whitespace-nowrap"
                        >
                            View all
                            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {catLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="animate-spin text-primary-400" size={32} />
                        </div>
                    ) : categories.length === 0 ? (
                        <p className="text-center text-slate-400 py-12 font-medium">No categories available yet.</p>
                    ) : (
                        <div className="relative group/carousel">
                            {/* Navigation Arrows */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden sm:block">
                                <button 
                                    onClick={() => scrollCarousel('left')}
                                    className="w-12 h-12 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-800 hover:bg-slate-50 active:scale-90 transition-all"
                                >
                                    <ChevronLeft size={24} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden sm:block">
                                <button 
                                    onClick={() => scrollCarousel('right')}
                                    className="w-12 h-12 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-800 hover:bg-slate-50 active:scale-90 transition-all"
                                >
                                    <ChevronRight size={24} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div 
                                ref={scrollRef}
                                className="flex items-center gap-6 sm:gap-10 overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x transition-all duration-300"
                            >
                                {categories.map((cat, idx) => (
                                    <motion.button
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                                        onClick={() => goToRestaurants({ category: cat.id })}
                                        className="group/item flex flex-col items-center gap-3 focus:outline-none shrink-0 snap-start"
                                        style={{ minWidth: '90px' }}
                                    >
                                        <div className="w-[84px] h-[84px] sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-50 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] group-hover/item:border-blue-400 group-hover/item:shadow-[0_8px_30px_rgba(37,99,235,0.08)] group-hover/item:-translate-y-1 transition-all duration-500 shrink-0">
                                            {cat.image ? (
                                                <img
                                                    src={getImageUrl(cat.image)}
                                                    alt={cat.name}
                                                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Utensils size={32} strokeWidth={1.5} />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[11px] sm:text-xs font-bold text-slate-700 group-hover/item:text-blue-600 transition-colors text-center line-clamp-1 w-full tracking-tight font-display">
                                            {cat.name}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ── APP DOWNLOAD ──────────────────────────────────────────────── */}
            <section className="py-16 sm:py-32 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-950 rounded-[40px] p-8 sm:p-12 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 border border-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                        {/* Elegant glowing background element */}
                        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(22,163,74,0.15),transparent_60%)] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                        
                        {/* Left */}
                        <div className="flex-1 relative z-10 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tighter mb-6 leading-[1.1]">
                                Supercharge your<br/>
                                <span className="text-primary-500 font-display">food experience.</span>
                            </h2>
                            <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0 lg:border-l-2 lg:border-primary-500/30 lg:pl-5">
                                Personalised recommendations, exclusive offers, and live GPS tracking. Download the Savor app to discover what you've been missing.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                                {/* QR Code stylized representation */}
                                <div className="hidden sm:flex items-center gap-5 pr-6 border-r border-white/10">
                                    <div className="w-[96px] h-[96px] bg-white/10 backdrop-blur-md rounded-[24px] p-2.5 flex items-center justify-center shadow-[0_0_30px_rgba(22,163,74,0.3)] border border-white/20">
                                        <img src={qrImg} alt="Download QR Code" className="w-full h-full object-cover rounded-[14px]" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-white font-black text-base tracking-wide uppercase mb-0.5">Scan to</p>
                                        <p className="text-primary-400 font-bold text-sm tracking-widest uppercase">Install</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-3 w-full sm:w-auto">
                                    <button className="flex items-center justify-center sm:justify-start gap-4 px-6 py-3.5 bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-colors w-full sm:min-w-[180px]">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.31-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.36 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                        </svg>
                                        <div className="text-left">
                                            <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">App Store</div>
                                        </div>
                                    </button>
                                    <button className="flex items-center justify-center sm:justify-start gap-4 px-6 py-3.5 bg-white/5 text-white border border-white/10 rounded-xl hover:bg-white/10 transition-colors w-full sm:min-w-[180px]">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="opacity-90">
                                            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L18.66,16.21C19.2,16.53 19.45,17.15 19.24,17.72C19.16,17.96 19,18.17 18.8,18.31C18.1,18.84 17.1,18.69 16.57,17.98L13.69,12L16.81,15.12M20.16,13C20.16,13 20.16,13 20.16,13L16.81,8.88L20.16,13C20.7,13.53 20.7,14.41 20.16,14.94M13.69,12L16.81,8.88L13.69,12Z"/>
                                        </svg>
                                        <div className="text-left">
                                            <div className="text-[11px] font-black text-white uppercase tracking-widest leading-none">Google Play</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right — Precision minimalist device UI */}
                        <div className="hidden lg:block relative z-10 w-[300px] h-[380px] shrink-0 transform translate-y-16 translate-x-8">
                            {/* Device frame */}
                            <div className="absolute inset-x-0 top-0 bottom-[-60px] bg-slate-900 rounded-[44px] border-[10px] border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.6),inset_0_0_24px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
                                {/* Beautiful minimalist app interface representation */}
                                <div className="h-32 bg-slate-800/40 p-6 flex flex-col justify-end border-b border-primary-500/10">
                                    <div className="flex justify-between items-end mb-4">
                                        <div className="h-8 w-2/3 bg-gradient-to-r from-primary-500/80 to-primary-600 rounded-lg overflow-hidden relative">
                                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMykiPgotPC9yZWN0Pgo8L3N2Zz4=')] bg-repeat opacity-20" />
                                        </div>
                                        <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center border border-white/5">
                                            <Search size={16} className="text-white/40" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-1.5 w-12 bg-white/20 rounded-full" />
                                        <div className="h-1.5 w-6 bg-white/5 rounded-full" />
                                    </div>
                                </div>
                                <div className="flex-1 p-5 space-y-4 pt-6">
                                    <div className="h-[140px] w-full rounded-2xl bg-black border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                                        <img src={pizzaImg} alt="App Food Demo" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700" />
                                    </div>
                                    <div className="h-[72px] w-full rounded-2xl bg-white/5 border border-white/5 flex items-center px-4 gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary-500/20 flex flex-col items-center justify-center gap-1">
                                           <div className="w-4 h-0.5 bg-primary-500/50 rounded-full"/>
                                           <div className="w-2 h-0.5 bg-primary-500/50 rounded-full"/>
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <div className="h-2 w-1/2 bg-white/20 rounded-full" />
                                            <div className="h-1.5 w-1/3 bg-white/10 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Floating glossy button */}
                                <div className="absolute top-[300px] left-1/2 -translate-x-1/2 w-48 h-12 rounded-full bg-primary-600 shadow-[0_0_30px_rgba(22,163,74,0.4)] border border-primary-400/50 flex items-center justify-center text-white backdrop-blur-xl">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-primary-50">Order Now</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CITIES ────────────────────────────────────────────────────── */}
            <section className="py-16 sm:py-24 bg-slate-50/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="mb-10 sm:mb-14">
                        <p className="text-primary-600 text-xs font-bold uppercase tracking-[0.2em] mb-2">Coverage</p>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Serving across Kerala
                        </h2>
                    </div>

                    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                        {KERALA_CITIES.map((city, idx) => (
                            <motion.button
                                key={city.name}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.07 }}
                                onClick={() => goToRestaurants({ search: city.name })}
                                className="group relative bg-white border border-slate-200/60 rounded-2xl sm:rounded-[24px] p-4 sm:p-6 text-left shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-primary-200 transition-all duration-500 overflow-hidden focus:outline-none"
                            >
                                <div className="absolute inset-0 bg-primary-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative">
                                    <MapPin size={16} className="text-primary-500 mb-2 sm:mb-3" strokeWidth={2} />
                                    <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-primary-700 transition-colors truncate">
                                        {city.name}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium uppercase tracking-wider leading-tight">
                                        {city.desc}
                                    </p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── JOIN OUR FLEET (DELIVERY) ────────────────────────────────── */}
            <section className="py-16 sm:py-24 bg-slate-50/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/5 blur-[100px] rounded-full -mr-20 -mt-20" />
                
                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row-reverse gap-12 lg:gap-20 items-center">
                        
                        {/* Image/Graphic */}
                        <div className="flex-1 w-full max-w-md lg:max-w-none">
                            <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl group">
                                <img 
                                    src="https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?q=80&w=2015&auto=format&fit=crop" 
                                    alt="Delivery Agent" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                <div className="absolute bottom-8 left-8">
                                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
                                        <p className="text-primary-600 font-black text-lg leading-none">500+</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Active Riders</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center lg:text-left">
                            <p className="text-primary-600 text-xs font-bold uppercase tracking-[0.2em] mb-3">Work with Savor</p>
                            <h2 className="text-3xl sm:text-5xl font-display font-black text-slate-900 tracking-tight mb-5 leading-tight">
                                Join our fleet.<br />
                                <span className="text-primary-500 font-normal text-2xl sm:text-3xl italic font-display">Earn on your own schedule.</span>
                            </h2>
                            <p className="text-slate-500 text-base font-medium mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
                                Become a delivery partner and enjoy the freedom of being your own boss. Competitive earnings, flexible hours, and a supportive community wait for you.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-9 max-w-sm mx-auto lg:mx-0">
                                {[
                                    { title: 'Flexible Hours', desc: 'Work when you want' },
                                    { title: 'Fast Payouts', desc: 'Weekly earnings transit' },
                                    { title: 'Support Hub', desc: '24/7 dispatcher help' },
                                    { title: 'Growth', desc: 'Referral bonus tokens' },
                                ].map(item => (
                                    <div key={item.title} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 size={12} className="text-primary-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-black text-slate-800 leading-none">{item.title}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link
                                    to="/register?mode=delivery"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-primary-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary-700 active:scale-95 transition-all shadow-xl shadow-primary-600/20"
                                >
                                    Register as Agent
                                    <ArrowRight size={16} strokeWidth={3} />
                                </Link>
                                <Link
                                    to="/login"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white border border-slate-200 text-slate-900 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-50 active:scale-95 transition-all"
                                >
                                    Agent Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-32 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-4 shrink-0 w-full lg:w-auto lg:min-w-[300px]">
                            {[
                                { value: '50+',    label: 'Restaurant Partners' },
                                { value: '10k+',   label: 'Orders Delivered'   },
                                { value: '4.8',    label: 'Partner Rating'     },
                                { value: '24/7',   label: 'Support Available'  },
                            ].map(item => (
                                <div key={item.label} className="bg-slate-50/50 border border-slate-100 rounded-[20px] p-5 sm:p-7 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                                    <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{item.value}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center lg:text-left">
                            <p className="text-primary-600 text-xs font-bold uppercase tracking-[0.2em] mb-3">For Restaurant Owners</p>
                            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-5 leading-tight">
                                Partner with Savor.<br />
                                <span className="text-slate-400 font-normal text-2xl sm:text-3xl">Reach more customers.</span>
                            </h2>
                            <p className="text-slate-500 text-base font-normal mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
                                List your restaurant on Kerala&apos;s fastest-growing food platform. Manage your menu, track orders, and grow your revenue — all from one powerful dashboard.
                            </p>

                            <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm mx-auto lg:mx-0">
                                {['Zero setup fee', 'Real-time orders', 'Daily payouts', 'Dedicated support'].map(perk => (
                                    <div key={perk} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                        <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                                <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        {perk}
                                    </div>
                                ))}
                            </div>

                            <Link
                                to="/register?mode=restaurant"
                                className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 active:scale-95 transition-all"
                            >
                                Register Your Restaurant
                                <ArrowRight size={16} />
                            </Link>
                            <p className="text-slate-400 text-xs font-medium mt-4">
                                Already a partner?{' '}
                                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}

export default Home