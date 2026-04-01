import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'
import RestaurantCard from '../../components/RestaurantCard'
import toast from 'react-hot-toast'
import { Search, ChevronRight, ChevronLeft, MapPin, Loader2, Compass } from 'lucide-react'
import { motion, useInView } from 'framer-motion'

const Home = () => {
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    
    // For staggering animations
    const containerRef = useRef(null)
    const isInView = useInView(containerRef, { once: true, margin: "-50px" })

    useEffect(() => {
        fetchRestaurants()
    }, [currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

    const fetchRestaurants = async () => {
        setLoading(true)
        try {
            const response = await api.get('/restaurant/restaurants/', {
                params: {
                    page: currentPage,
                    search: search,
                    is_active: true,
                }
            })
            setRestaurants(response.data.results)
            setTotalPages(Math.ceil(response.data.count / 10))
        } catch (error) {
            console.error('Failed to load restaurants:', error)
            toast.error('Failed to load restaurants.')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setCurrentPage(1)
        fetchRestaurants()
    }

    // Animation variants
    const staggeredContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-primary-500 selection:text-white">

            {/* Premium Hero Section */}
            <div className="relative pt-32 pb-40 px-5 flex flex-col items-center overflow-hidden">
                {/* Background Decorators */}
                <div className="absolute top-0 left-0 w-full h-[120%] bg-gradient-to-b from-primary-50 via-white to-slate-50 -z-10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-400/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center max-w-3xl mx-auto z-10"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-600 font-bold text-sm mb-6 border border-primary-100/50 shadow-sm">
                        <MapPin size={16} /> Delivering to Your Location
                    </span>
                    <h1 className="text-slate-900 text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                        Craving something <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
                            extraordinary?
                        </span>
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl mb-12 max-w-xl mx-auto font-medium">
                        Discover the best culinary experiences around you. Fast delivery, curated tastes, and premium service.
                    </p>

                    {/* Premium Search Bar */}
                    <form onSubmit={handleSearch} className="flex w-full max-w-2xl mx-auto p-2 glass rounded-full focus-within:ring-4 focus-within:ring-primary-500/20 transition-all duration-300">
                        <div className="flex-1 flex items-center px-4 bg-transparent">
                            <Search className="text-slate-400 mr-3" size={20} strokeWidth={2.5} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search for your favorite restaurants..."
                                className="w-full py-3 bg-transparent border-none text-slate-800 placeholder:text-slate-400 focus:outline-none text-lg font-medium"
                            />
                        </div>
                        <button type="submit" className="px-8 py-4 bg-primary-600 text-white rounded-full font-bold text-lg hover:bg-primary-700 transition-all active:scale-95 shadow-md shadow-primary-600/30 flex items-center gap-2">
                            Explore
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-5 pb-24 -mt-16 z-20 relative">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <Compass className="text-primary-500" size={28} />
                        {search ? `Results for "${search}"` : 'Curated For You'}
                    </h2>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-primary-600">
                        <Loader2 className="animate-spin mb-4" size={48} />
                        <p className="text-lg font-semibold text-slate-600">Discovering tastes...</p>
                    </div>
                ) : restaurants.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 glass rounded-3xl"
                    >
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-rose-50 rounded-full text-rose-300 mb-6">
                            <Search size={40} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">No restaurants found</h3>
                        <p className="text-slate-500 text-lg">We couldn't find anything matching "{search}". <br/>Try adjusting your search criteria.</p>
                    </motion.div>
                ) : (
                    <div ref={containerRef}>
                        {/* Restaurant Cards Grid */}
                        <motion.div 
                            variants={staggeredContainer}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-8"
                        >
                            {restaurants.map((restaurant) => (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                />
                            ))}
                        </motion.div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex justify-center items-center gap-4 mt-16"
                            >
                                <button
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    disabled={currentPage === 1}
                                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${currentPage === 1
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-white text-slate-700 hover:text-primary-600 hover:shadow-md border border-slate-200 cursor-pointer active:scale-90'
                                    }`}
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                <span className="text-slate-600 font-semibold px-4 flex items-center gap-2">
                                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 text-white font-bold">{currentPage}</span> 
                                    <span className="text-slate-400">of</span> 
                                    <span className="text-slate-700">{totalPages}</span>
                                </span>

                                <button
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${currentPage === totalPages
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-white text-slate-700 hover:text-primary-600 hover:shadow-md border border-slate-200 cursor-pointer active:scale-90'
                                    }`}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home