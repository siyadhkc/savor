import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import RestaurantCard from '../../components/RestaurantCard'
import Footer from '../../components/Footer'
import { Search, Compass, Loader2, ChevronLeft, ChevronRight, SlidersHorizontal, X, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 9

const Restaurants = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    // ── State ──────────────────────────────────────────────────────────────────
    const [restaurants, setRestaurants] = useState([])
    const [categories,  setCategories]  = useState([])
    const [totalCount,  setTotalCount]  = useState(0)
    const [loading,     setLoading]     = useState(true)
    const [catLoading,  setCatLoading]  = useState(true)

    // Derived from URL params — single source of truth
    const search      = searchParams.get('search')   || ''
    const categoryId  = searchParams.get('category') || ''
    const currentPage = parseInt(searchParams.get('page') || '1', 10)

    const [inputValue, setInputValue] = useState(search)
    const topRef = useRef(null)

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    // ── Sync input when URL changes externally ─────────────────────────────────
    useEffect(() => {
        setInputValue(search)
    }, [search])

    // ── Fetch categories once ──────────────────────────────────────────────────
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/menu/categories/')
                setCategories(res.data.results || [])
            } finally {
                setCatLoading(false)
            }
        }
        fetchCategories()
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
            if (categoryId) params.category = categoryId

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
            <div className="relative bg-slate-950 text-white overflow-hidden py-10 sm:py-16">
                {/* Subtle grid texture */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-5">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 sm:mb-8 transition-colors group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                        <div>
                            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-3 leading-tight">
                                {search
                                    ? <>Results for &ldquo;<span className="text-primary-400 font-light italic">{search}</span>&rdquo;</>
                                    : 'All Restaurants'
                                }
                            </h1>
                            {!loading && (
                                <p className="text-white/50 font-medium text-base sm:text-lg">
                                    {totalCount} partner{totalCount !== 1 ? 's' : ''} found
                                </p>
                            )}
                        </div>

                        {/* Search form */}
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 focus-within:bg-white/10 focus-within:border-white/20 transition-all rounded-xl px-4 py-3 w-full sm:w-80 shadow-inner">
                            <Search size={18} className="text-white/40 shrink-0" />
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Search restaurants or cuisines…"
                                className="flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none text-sm font-medium min-w-0"
                                style={{ fontSize: '16px' }}
                            />
                            {inputValue && (
                                <button type="button" onClick={() => { setInputValue(''); updateParams({ search: '' }) }} aria-label="Clear search">
                                    <X size={16} className="text-white/40 hover:text-white transition-colors" />
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            {/* ── Filters bar ──────────────────────────────────────────────── */}
            <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[64px] z-50">
                <div className="max-w-7xl mx-auto px-5 py-3 flex items-center gap-3 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-1.5 text-slate-500 shrink-0">
                        <SlidersHorizontal size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Category</span>
                    </div>

                    {catLoading ? (
                        <div className="flex gap-2">
                            {[1,2,3,4].map(i => <div key={i} className="w-20 h-8 bg-slate-100 rounded-full animate-pulse" />)}
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => handleCategorySelect('')}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                                    !categoryId
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(String(cat.id))}
                                    className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                                        categoryId === String(cat.id)
                                            ? 'bg-primary-600 text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </>
                    )}

                    {hasFilters && (
                        <button
                            onClick={handleClearAll}
                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-full text-xs font-bold transition-colors shrink-0"
                        >
                            <X size={13} /> Clear
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
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                        >
                            {restaurants.map((restaurant) => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </motion.div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-14">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-primary-50 hover:border-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                        .reduce((acc, p, idx, arr) => {
                                            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                                            acc.push(p)
                                            return acc
                                        }, [])
                                        .map((p, idx) =>
                                            p === '…' ? (
                                                <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 font-bold">…</span>
                                            ) : (
                                                <button
                                                    key={p}
                                                    onClick={() => handlePageChange(p)}
                                                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                                                        currentPage === p
                                                            ? 'bg-primary-600 text-white shadow-md'
                                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-primary-50 hover:border-primary-300'
                                                    }`}
                                                    aria-current={currentPage === p ? 'page' : undefined}
                                                >
                                                    {p}
                                                </button>
                                            )
                                        )
                                    }
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-primary-50 hover:border-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    )
}

export default Restaurants
