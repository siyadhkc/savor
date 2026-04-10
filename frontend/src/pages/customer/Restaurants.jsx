import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import RestaurantCard from '../../components/RestaurantCard'
import Footer from '../../components/Footer'
import { Search, Compass, Loader2, ChevronLeft, ChevronRight, SlidersHorizontal, X, Utensils } from 'lucide-react'
import FloatingCart from '../../components/FloatingCart'
import { motion, AnimatePresence } from 'framer-motion'
import { getImageUrl } from '../../utils/helpers'

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 8

const getVisiblePages = (currentPage, totalPages) => {
    if (totalPages <= 1) return [1]

    const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1])

    if (currentPage <= 3) {
        pages.add(2)
        pages.add(3)
    }

    if (currentPage >= totalPages - 2) {
        pages.add(totalPages - 1)
        pages.add(totalPages - 2)
    }

    return [...pages]
        .filter((page) => page >= 1 && page <= totalPages)
        .sort((a, b) => a - b)
        .reduce((acc, page, index, arr) => {
            if (index > 0 && page - arr[index - 1] > 1) acc.push('…')
            acc.push(page)
            return acc
        }, [])
}

const Restaurants = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    // ── State ──────────────────────────────────────────────────────────────────
    const [restaurants, setRestaurants] = useState([])
    const [cuisines,    setCuisines]    = useState([])
    const [totalCount,  setTotalCount]  = useState(0)
    const [loading,     setLoading]     = useState(true)
    const [catLoading,  setCatLoading]  = useState(true)


    // Derived from URL params — single source of truth
    const search      = searchParams.get('search')   || ''
    const categoryId  = searchParams.get('category') || ''
    const currentPage = parseInt(searchParams.get('page') || '1', 10)

    const [inputValue, setInputValue] = useState(search)
    const topRef = useRef(null)
    const catScrollRef = useRef(null)

    const scrollCategories = (dir) => {
        if (catScrollRef.current) {
            const amount = dir === 'left' ? -400 : 400
            catScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
        }
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
    const startResult = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
    const endResult = totalCount === 0 ? 0 : Math.min(currentPage * ITEMS_PER_PAGE, totalCount)
    const visiblePages = getVisiblePages(currentPage, totalPages)

    // ── Sync input when URL changes externally ─────────────────────────────────
    useEffect(() => {
        setInputValue(search)
    }, [search])

    // ── Fetch categories once ──────────────────────────────────────────────────
    useEffect(() => {
        const fetchCuisines = async () => {
            try {
                const res = await api.get('/menu/cuisines/')
                setCuisines(res.data.results || [])
            } finally {
                setCatLoading(false)
            }
        }
        fetchCuisines()
    }, [])

    // ── Fetch restaurants whenever URL params change ────────────────────────────
    const fetchRestaurants = useCallback(async () => {
        setLoading(true)
        try {
            const params = {
                page:      currentPage,
                page_size: ITEMS_PER_PAGE,
                is_active: true,
            }
            if (search)     params.search   = search
            if (categoryId) params.cuisine_id = categoryId // Pass as cuisine_id


            const res = await api.get('/restaurant/restaurants/', { params })
            setRestaurants(res.data.results || [])
            setTotalCount(res.data.count   || 0)
        } catch {
            setRestaurants([])
            setTotalCount(0)
        } finally {
            setLoading(false)
        }
    }, [search, categoryId, currentPage])

    useEffect(() => {
        fetchRestaurants()
    }, [fetchRestaurants])

    useEffect(() => {
        if (currentPage < 1) {
            updateParams({ page: 1 })
            return
        }

        if (totalPages > 0 && currentPage > totalPages) {
            updateParams({ page: totalPages })
        }
    }, [currentPage, totalPages])

    // Scroll to top when results change
    useEffect(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [currentPage])

    // ── URL-based navigation helpers ───────────────────────────────────────────
    const updateParams = (updates) => {
        const next = new URLSearchParams(searchParams)
        Object.entries(updates).forEach(([k, v]) => {
            if (v === '' || v === null || v === undefined) next.delete(k)
            else next.set(k, String(v))
        })
        // Always reset to page 1 on a filter change (unless explicitly setting page)
        if (!('page' in updates)) next.delete('page')
        setSearchParams(next, { replace: true })
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        updateParams({ search: inputValue.trim() })
    }

    const handleCategorySelect = (id) => {
        updateParams({ category: id === categoryId ? '' : id })
    }

    const handlePageChange = (p) => {
        if (p < 1 || p > totalPages) return
        updateParams({ page: p })
    }

    const handleClearAll = () => {
        setInputValue('')

        setSearchParams({}, { replace: true })
    }

    const hasFilters = !!search || !!categoryId

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col" ref={topRef}>

            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-5 pt-8 pb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-3 sm:mb-4">
                                <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                                <span>/</span>
                                <span className="text-slate-800">Restaurants</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-2 sm:mb-3 leading-tight sm:leading-none">
                                {search
                                    ? <>Results for &ldquo;<span className="text-primary-600 italic font-light">{search}</span>&rdquo;</>
                                    : 'Our partner restaurants'
                                }
                            </h1>
                            <p className="text-slate-500 font-medium text-base sm:text-lg">
                                Discover the best food & drinks in your area.
                            </p>
                        </div>

                        {/* Modern Search */}
                        <form onSubmit={handleSearchSubmit} className="relative group w-full md:w-96">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search size={18} className="text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Search for restaurant, cuisine or a dish"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-11 py-3 sm:py-4 text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm text-sm sm:text-base"
                                style={{ fontSize: '16px' }}
                            />
                            {inputValue && (
                                <button
                                    type="button"
                                    onClick={() => { setInputValue(''); updateParams({ search: '' }) }}
                                    className="absolute inset-y-0 right-4 flex items-center"
                                >
                                    <X size={18} className="text-slate-400 hover:text-slate-600 transition-colors" />
                                </button>
                            )}
                        </form>
                    </div>

                    {/* What's on your mind? (Collections) */}
                    <div className="mt-16">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8">
                            What's on your mind?
                        </h2>
                        
                        <div className="relative group/carousel">
                            {/* Navigation Arrows */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden sm:block">
                                <button 
                                    onClick={() => scrollCategories('left')}
                                    className="w-12 h-12 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-800 hover:bg-slate-50 active:scale-90 transition-all"
                                >
                                    <ChevronLeft size={24} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden sm:block">
                                <button 
                                    onClick={() => scrollCategories('right')}
                                    className="w-12 h-12 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-800 hover:bg-slate-50 active:scale-90 transition-all"
                                >
                                    <ChevronRight size={24} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div 
                                ref={catScrollRef}
                                className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 mask-fade-right snap-x"
                            >
                                {catLoading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="flex flex-col items-center gap-3 shrink-0">
                                            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-slate-100 animate-pulse" />
                                            <div className="w-14 h-3 bg-slate-100 rounded-full animate-pulse" />
                                        </div>
                                    ))
                                ) : (
                                    cuisines.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategorySelect(String(cat.id))}
                                            className="flex flex-col items-center gap-2 sm:gap-3 group shrink-0 transition-transform active:scale-95 snap-start"
                                        >
                                            <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 p-1 transition-all duration-500 ${
                                                categoryId === String(cat.id)
                                                    ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-500/10'
                                                    : 'border-transparent bg-white shadow-sm group-hover:shadow-md'
                                            }`}>
                                                <div className="w-full h-full rounded-full bg-slate-50 overflow-hidden relative">
                                                    {cat.image ? (
                                                        <img
                                                            src={getImageUrl(cat.image)}
                                                            alt={cat.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <Utensils size={32} strokeWidth={1} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`text-[12px] sm:text-sm font-black tracking-tight transition-colors ${
                                                categoryId === String(cat.id) ? 'text-primary-600' : 'text-slate-600 group-hover:text-slate-900'
                                            }`}>
                                                {cat.name}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Filters bar ──────────────────────────────────────────────── */}
            <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[64px] z-50">
                <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-1.5 text-slate-500 font-black text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
                        <SlidersHorizontal size={14} className="text-slate-400" />
                        Filters
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-2 shrink-0" />

                    {catLoading ? (
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-20 h-9 bg-slate-50 rounded-full border border-slate-100" />)}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleCategorySelect('')}
                                className={`px-5 py-2 rounded-xl text-sm font-black tracking-tight transition-all shrink-0 border ${
                                    !categoryId
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                All
                            </button>
                            {cuisines.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(String(cat.id))}
                                    className={`px-5 py-2 rounded-xl text-sm font-black tracking-tight transition-all shrink-0 border ${
                                        categoryId === String(cat.id)
                                            ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/10'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="h-6 w-px bg-slate-200 mx-2 shrink-0 md:block hidden" />


                    {hasFilters && (
                        <button
                            onClick={handleClearAll}
                            className="ml-auto flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0 border border-rose-100"
                        >
                            <X size={14} /> Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* ── Main content ─────────────────────────────────────────────── */}
            <main className="flex-1 max-w-7xl mx-auto px-5 py-10 sm:py-14 w-full">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-5">
                        <Loader2 className="animate-spin text-primary-500" size={52} />
                        <p className="text-slate-400 font-semibold uppercase tracking-widest text-sm">
                            Finding the best for you…
                        </p>
                    </div>
                ) : restaurants.length === 0 ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 gap-5 text-center px-6"
                        >
                            <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center shadow-inner">
                                <Compass size={40} className="text-slate-300" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-2">No results found</h2>
                            <p className="text-slate-500 font-medium max-w-sm">
                                Try adjusting your search term or selecting a different category.
                            </p>
                            <button
                                onClick={handleClearAll}
                                className="px-6 py-2.5 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-700 transition-colors text-sm"
                            >
                                Browse All Restaurants
                            </button>
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <>
                        <motion.div
                            key={`${search}-${categoryId}-${currentPage}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        >
                            {restaurants.map((restaurant) => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </motion.div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-14 rounded-[32px] border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="text-center lg:text-left">
                                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                                            Page {currentPage} of {totalPages}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-600">
                                            Showing {startResult}-{endResult} of {totalCount} restaurants
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                                            aria-label="Previous page"
                                        >
                                            <ChevronLeft size={18} />
                                            Previous
                                        </button>

                                        <div className="flex max-w-full items-center justify-center gap-2 overflow-x-auto rounded-2xl bg-slate-50 px-2 py-2 scrollbar-hide">
                                            {visiblePages.map((page, index) =>
                                                page === '…' ? (
                                                    <span
                                                        key={`ellipsis-${index}`}
                                                        className="px-2 text-sm font-bold text-slate-400"
                                                    >
                                                        …
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`h-11 min-w-11 rounded-xl px-3 text-sm font-black transition-all ${
                                                            currentPage === page
                                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                                                                : 'bg-white text-slate-600 hover:bg-primary-50 hover:text-primary-700'
                                                        }`}
                                                        aria-current={currentPage === page ? 'page' : undefined}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-all hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                                            aria-label="Next page"
                                        >
                                            Next
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
            <FloatingCart />
        </div>
    )
}

export default Restaurants
