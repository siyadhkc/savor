import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import {
    Utensils, ShoppingCart, Clock, User, LogOut,
    LogIn, UserPlus, Menu, X, ChevronRight,
    LayoutDashboard, Store, ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Get initials from username or email */
const getInitials = (user) => {
    const name = user?.username || user?.email || 'U'
    return name.charAt(0).toUpperCase()
}

/** Get first name or username for greeting */
const getDisplayName = (user) => {
    return user?.first_name || user?.username || 'there'
}

// ─── Component ────────────────────────────────────────────────────────────────
const CustomerNavbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [isDrawerOpen, setIsDrawerOpen] = useState(false) // mobile drawer
    const [isDropdownOpen, setIsDropdownOpen] = useState(false) // desktop user dropdown
    const [cartCount, setCartCount] = useState(0)

    const dropdownRef = useRef(null)

    // ── Fetch cart count when user is logged in ────────────────────────────────
    useEffect(() => {
        if (user) {
            fetchCartCount()
        } else {
            setCartCount(0)
        }
    }, [user, location.pathname]) // refresh count on route change too

    const fetchCartCount = async () => {
        try {
            const res = await api.get('/orders/cart/my_cart/')
            setCartCount(res.data.total_items)
        } catch {
            // Silent — cart badge is non-critical
        }
    }

    // ── Close drawer/dropdown on route change ──────────────────────────────────
    useEffect(() => {
        setIsDrawerOpen(false)
        setIsDropdownOpen(false)
    }, [location.pathname])

    // ── Close dropdown on outside click ───────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // ── Lock body scroll when drawer is open ──────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = isDrawerOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isDrawerOpen])

    const handleLogout = async () => {
        setIsDrawerOpen(false)
        setIsDropdownOpen(false)
        await logout()
        toast.success('Logged out successfully')
        navigate('/login')
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <nav className="sticky top-0 z-[1000] bg-slate-950 border-b border-white/[0.06] shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

                {/* ── Logo ──────────────────────────────────────── */}
                <Link
                    to="/"
                    className="flex items-center gap-2 text-white group shrink-0"
                    aria-label="Savor - Go to homepage"
                >
                    <div className="bg-primary-600 text-white p-1.5 rounded-xl">
                        <Utensils size={18} strokeWidth={2.5} />
                    </div>
                    <span className="text-lg font-black italic tracking-tighter">Savor</span>
                </Link>

                {/* ── Desktop: Main nav links ───────────────────────── */}
                <div className="hidden md:flex items-center gap-1 flex-1 ml-4">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-white/50 hover:text-white'
                            }`
                        }
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/restaurants"
                        className={({ isActive }) =>
                            `px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-white/50 hover:text-white'
                            }`
                        }
                    >
                        Restaurants
                    </NavLink>
                </div>

                {/* ── Desktop: Right-side actions ───────────────────────── */}
                <div className="hidden md:flex items-center gap-2">
                    {user ? (
                        /* ── LOGGED IN ─────────────────────────────────── */
                        <>
                            {/* Cart icon with badge */}
                            <Link
                                to="/cart"
                                className="relative p-2 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]"
                                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
                            >
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-primary-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm" style={{ width: 18, height: 18 }}>
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* User avatar dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen((v) => !v)}
                                    className="flex items-center gap-2 pl-2 pr-2 py-1.5 bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] text-white rounded-lg transition-all"
                                    aria-expanded={isDropdownOpen}
                                    aria-haspopup="true"
                                >
                                    <div className="w-6 h-6 rounded-md bg-primary-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                                        {getInitials(user)}
                                    </div>
                                    <span className="text-sm font-medium max-w-[100px] truncate hidden lg:block text-white/80">
                                        {getDisplayName(user)}
                                    </span>
                                    <ChevronDown
                                        size={14}
                                        className={`text-white/40 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Dropdown panel */}
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            key="user-dropdown"
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                                        >
                                            {/* User info header */}
                                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Signed in as</p>
                                                <p className="text-slate-800 font-bold text-sm truncate mt-0.5">{user.email || user.username}</p>
                                            </div>

                                            {/* Role-specific shortcuts */}
                                            {(user.role === 'admin' || user.is_staff) && (
                                                <Link
                                                    to="/admin"
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-amber-600 hover:bg-amber-50 text-sm font-semibold transition-colors border-b border-slate-100"
                                                >
                                                    <LayoutDashboard size={16} />
                                                    Admin Panel
                                                </Link>
                                            )}
                                            {user.role === 'restaurant' && (
                                                <Link
                                                    to="/restaurant-admin"
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-primary-600 hover:bg-primary-50 text-sm font-semibold transition-colors border-b border-slate-100"
                                                >
                                                    <Store size={16} />
                                                    My Store
                                                </Link>
                                            )}

                                            {/* Standard links */}
                                            <div className="py-1.5">
                                                <Link
                                                    to="/orders"
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
                                                >
                                                    <Clock size={16} className="text-slate-400" />
                                                    My Orders
                                                </Link>
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
                                                >
                                                    <User size={16} className="text-slate-400" />
                                                    Profile
                                                </Link>
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-slate-100 p-1.5">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 text-sm font-semibold rounded-xl transition-colors"
                                                >
                                                    <LogOut size={16} />
                                                    Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        /* ── GUEST ─────────────────────────────────────── */
                        <>
                            <Link
                                to="/login"
                                className="px-4 py-2 text-white/90 font-semibold text-sm rounded-full hover:bg-white/10 transition-colors"
                            >
                                <LogIn size={15} className="inline mr-1.5" />
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 bg-white text-primary-700 font-bold text-sm rounded-full hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                            >
                                <UserPlus size={15} className="inline mr-1.5" />
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* ── Mobile: Right-side ────────────────────────────────── */}
                <div className="flex md:hidden items-center gap-1">
                    {user ? (
                        /* Logged in mobile: cart badge + hamburger */
                        <>
                            <Link
                                to="/cart"
                                className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
                            >
                                <ShoppingCart size={22} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm w-[18px] h-[18px]">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </Link>
                            <button
                                onClick={() => setIsDrawerOpen((v) => !v)}
                                className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
                                aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={isDrawerOpen}
                            >
                                {isDrawerOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </>
                    ) : (
                        /* Guest mobile: Login + Sign Up inline */
                        <>
                            <Link
                                to="/login"
                                className="px-3.5 py-1.5 text-white/90 font-semibold text-sm rounded-full hover:bg-white/10 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-3.5 py-1.5 bg-white text-primary-700 font-bold text-sm rounded-full hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                MOBILE DRAWER (only for logged-in users)
            ───────────────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {isDrawerOpen && user && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="nav-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1001]"
                            onClick={() => setIsDrawerOpen(false)}
                            aria-hidden="true"
                        />

                        {/* Drawer */}
                        <motion.aside
                            key="nav-drawer"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
                            className="fixed top-0 right-0 bottom-0 w-[80%] max-w-[300px] bg-white z-[1002] shadow-2xl flex flex-col"
                        >
                            {/* Drawer header — user info */}
                            <div className="bg-slate-950 px-5 py-5 border-b border-white/[0.06]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-white">
                                        <div className="bg-primary-600 p-1.5 rounded-xl text-white">
                                            <Utensils size={16} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-base font-black italic tracking-tighter">Savor</span>
                                    </div>
                                    <button
                                        onClick={() => setIsDrawerOpen(false)}
                                        className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                                        aria-label="Close menu"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                {/* User greeting */}
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-black text-lg shrink-0">
                                        {getInitials(user)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-bold truncate">Hi, {getDisplayName(user)}!</p>
                                        <p className="text-white/50 text-xs truncate">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Nav links */}
                            <nav className="flex-1 overflow-y-auto py-3 px-3">
                                {/* Role shortcuts */}
                                {(user.role === 'admin' || user.is_staff) && (
                                    <div className="mb-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1">Admin</p>
                                        <NavLink
                                            to="/admin"
                                            onClick={() => setIsDrawerOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${isActive ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'
                                                }`
                                            }
                                        >
                                            <span className="flex items-center gap-3"><LayoutDashboard size={17} className="text-amber-500" />Admin Panel</span>
                                            <ChevronRight size={14} className="opacity-30" />
                                        </NavLink>
                                    </div>
                                )}
                                {user.role === 'restaurant' && (
                                    <div className="mb-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1">My Business</p>
                                        <NavLink
                                            to="/restaurant-admin"
                                            onClick={() => setIsDrawerOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
                                                }`
                                            }
                                        >
                                            <span className="flex items-center gap-3"><Store size={17} className="text-primary-500" />My Store</span>
                                            <ChevronRight size={14} className="opacity-30" />
                                        </NavLink>
                                    </div>
                                )}

                                {/* Browse */}
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1">Browse</p>
                                <ul className="space-y-1 mb-3">
                                    {[
                                        { to: '/', label: 'Home', icon: null, end: true },
                                        { to: '/restaurants', label: 'Restaurants', icon: null },
                                    ].map(({ to, label, icon, end }) => (
                                        <li key={to}>
                                            <NavLink
                                                to={to} end={end}
                                                onClick={() => setIsDrawerOpen(false)}
                                                className={({ isActive }) =>
                                                    `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${isActive ? 'bg-primary-50 text-primary-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                                                    }`
                                                }
                                            >
                                                <span>{label}</span>
                                                <ChevronRight size={14} className="opacity-30" />
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>

                                {/* Account */}
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1">Account</p>
                                <ul className="space-y-1">
                                    {[
                                        { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
                                        { to: '/orders', label: 'My Orders', icon: Clock },
                                        { to: '/profile', label: 'Profile', icon: User },
                                    ].map(({ to, label, icon: Icon, badge }) => (
                                        <li key={to}>
                                            <NavLink
                                                to={to}
                                                onClick={() => setIsDrawerOpen(false)}
                                                className={({ isActive }) =>
                                                    `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${isActive ? 'bg-primary-50 text-primary-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                                                    }`
                                                }
                                            >
                                                <span className="flex items-center gap-3">
                                                    {Icon && <Icon size={17} className="text-slate-400" />}
                                                    {label}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {badge > 0 && (
                                                        <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full">
                                                            {badge > 9 ? '9+' : badge}
                                                        </span>
                                                    )}
                                                    <ChevronRight size={14} className="opacity-30" />
                                                </div>
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            {/* Logout */}
                            <div className="p-4 border-t border-slate-100 shrink-0">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 font-bold text-sm rounded-2xl hover:bg-rose-100 active:scale-95 transition-all"
                                >
                                    <LogOut size={17} />
                                    Logout
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default CustomerNavbar
