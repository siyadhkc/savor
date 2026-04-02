import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { 
    Home, 
    ShoppingBag, 
    History, 
    User as UserIcon, 
    LogOut, 
    LayoutDashboard, 
    Store, 
    Utensils, 
    Folder, 
    Package, 
    Users, 
    CreditCard,
    Menu,
    X,
    ChevronDown
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [scrolled, setScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [cartCount, setCartCount] = useState(0)

    const isAdmin = user?.is_staff || user?.role === 'admin'
    const isDelivery = user?.role === 'delivery'
    const isActive = (path) => location.pathname === path

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        
        if (user && !isAdmin) {
            fetchCartStatus()
            const interval = setInterval(fetchCartStatus, 5000)
            return () => {
                window.removeEventListener('scroll', handleScroll)
                clearInterval(interval)
            }
        }
        
        return () => window.removeEventListener('scroll', handleScroll)
    }, [user, isAdmin])

    const fetchCartStatus = async () => {
        try {
            const response = await api.get('/orders/cart/my_cart/')
            setCartCount(response.data.total_items)
        } catch (error) {
            console.error('Failed to fetch cart status:', error)
        }
    }

    const handleLogout = async () => {
        await logout()
        toast.success('Logged out successfully!')
        navigate('/login')
    }

    const NavLink = ({ to, icon: Icon, label }) => (
        <Link 
            to={to} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all relative group ${
                isActive(to) 
                    ? 'text-primary-600 bg-primary-50/50' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
        >
            <Icon size={18} className={isActive(to) ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'} />
            {label}
            {isActive(to) && (
                <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute -bottom-[21px] left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-500 rounded-full shadow-[0_-4px_10px_rgba(22,163,74,0.3)] hidden md:block"
                />
            )}
        </Link>
    )

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
            scrolled 
                ? 'bg-white/80 backdrop-blur-xl border-b border-white/20 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)]' 
                : 'bg-transparent py-5'
        }`}>
            <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
                
                {/* Logo */}
                <Link 
                    to={isAdmin ? '/admin' : (isDelivery ? '/delivery/dashboard' : '/')} 
                    className="flex items-center gap-3 group"
                >
                    <div className="bg-primary-600 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary-600/20">
                        <Utensils size={22} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col -gap-1">
                        <span className="text-xl font-black italic tracking-tighter text-slate-900">Savor</span>
                        {isAdmin && (
                            <span className="text-[8px] bg-slate-900 text-white px-1.5 py-0.5 rounded-full font-black tracking-widest uppercase">Admin</span>
                        )}
                    </div>
                </Link>

                {/* Menu & Actions Container */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Desktop Menu Items (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* Admin Links */}
                        {user && isAdmin && (
                            <>
                                <NavLink to="/admin" icon={LayoutDashboard} label="Dashboard" />
                                <NavLink to="/admin/restaurants" icon={Store} label="Restaurants" />
                                <NavLink to="/admin/menu" icon={Utensils} label="Menu" />
                                <NavLink to="/admin/categories" icon={Folder} label="Categories" />
                                <NavLink to="/admin/orders" icon={Package} label="Orders" />
                            </>
                        )}

                        {/* Delivery Links - Removed for minimalism (links available in dashboard) */}


                        {/* Guest / General Links */}
                        <NavLink to="/" icon={Home} label="Home" />
                        {!user && (
                            <Link to="/login" className="px-5 py-2 text-sm font-black text-slate-600 hover:text-slate-900 transition-colors">
                                Sign In
                            </Link>
                        )}
                        {user && !isAdmin && !isDelivery && (
                            <NavLink to="/restaurants" icon={Store} label="Restaurants" />
                        )}
                    </div>

                    {/* Persistent Actions (Visible on Mobile & Desktop) */}
                    {user && !isAdmin && !isDelivery && (
                        <div className="flex items-center gap-1 md:gap-2 mr-2 md:mr-0">
                            <Link 
                                to="/cart" 
                                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-sm font-bold transition-all relative group ${
                                    isActive('/cart') 
                                        ? 'text-primary-600 bg-primary-50/50' 
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                <div className="relative">
                                    <ShoppingBag size={18} className={isActive('/cart') ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                    {cartCount > 0 && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-primary-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-bounce-subtle">
                                            {cartCount}
                                        </div>
                                    )}
                                </div>
                                <span className="hidden sm:block">Cart</span>
                            </Link>
                            <NavLink to="/orders" icon={History} label="Orders" />
                        </div>
                    )}

                    {!user && (
                        <div className="hidden md:block">
                            <Link 
                                to="/register" 
                                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                            >
                                Register
                            </Link>
                        </div>
                    )}

                    {/* Auth Profile Section (Desktop Only) */}
                    {user && (
                        <div className="hidden md:flex items-center gap-4 ml-2 pl-4 border-l border-slate-200">
                             {isDelivery && (
                                 <div className="hidden lg:flex flex-col items-end mr-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                                     <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Earnings</span>
                                     <span className="text-sm font-black text-emerald-700">₹{parseFloat(user.earnings || 0).toFixed(2)}</span>
                                 </div>
                             )}
                             <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Welcome</span>
                                <span className="text-sm font-black text-slate-800 leading-none">{user.username}</span>
                             </div>
                             <button
                                onClick={handleLogout}
                                className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 flex items-center justify-center transition-all group shadow-sm active:scale-95"
                                title="Sign out"
                             >
                                <LogOut size={18} />
                             </button>
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm transition-all active:scale-95"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-white shadow-[0_15px_30px_rgba(0,0,0,0.1)] border-t border-slate-100 p-5 md:hidden"
                    >
                        <div className="flex flex-col gap-2">
                             {/* Mobile Links */}
                             {user && isAdmin && (
                                <>
                                    <NavLink to="/admin" icon={LayoutDashboard} label="Dashboard" />
                                    <NavLink to="/admin/restaurants" icon={Store} label="Restaurants" />
                                    <NavLink to="/admin/menu" icon={Utensils} label="Menu" />
                                    <NavLink to="/admin/categories" icon={Folder} label="Categories" />
                                    <NavLink to="/admin/orders" icon={Package} label="Orders" />
                                </>
                             )}
                             {/* Delivery Links - Removed for minimalism */}

                             {user && !isAdmin && !isDelivery && (
                                <>
                                    <NavLink to="/" icon={Home} label="Home" />
                                    <NavLink to="/restaurants" icon={Store} label="Restaurants" />
                                    <NavLink to="/profile" icon={UserIcon} label="Profile" />
                                </>
                             )}
                             {!user && (
                                <>
                                    <NavLink to="/" icon={Home} label="Home" />
                                    <NavLink to="/login" icon={UserIcon} label="Login" />
                                    <Link 
                                        to="/register" 
                                        className="mt-2 w-full py-3 bg-primary-600 text-white text-center font-black rounded-xl"
                                    >
                                        Register
                                    </Link>
                                </>
                             )}
                             {user && (
                                <button
                                    onClick={handleLogout}
                                    className="mt-4 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 font-black rounded-xl border border-rose-100"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                             )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar
