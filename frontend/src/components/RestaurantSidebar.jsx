import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
    LayoutDashboard,
    Pizza,
    PackageSearch,
    LogOut,
    Store as StoreIcon,
    UserCog,
    X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const RestaurantSidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        toast.success('Logged out!')
        navigate('/login')
    }

    const navGroups = [
        {
            label: 'OVERVIEW',
            links: [
                { to: '/restaurant-admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
            ]
        },
        {
            label: 'MANAGE',
            links: [
                { to: '/restaurant-admin/menu', label: 'My Menu', icon: Pizza },
            ]
        },
        {
            label: 'OPERATIONS',
            links: [
                { to: '/restaurant-admin/orders', label: 'Store Orders', icon: PackageSearch },
            ]
        },
        {
            label: 'SETTINGS',
            links: [
                { to: '/restaurant-admin/profile', label: 'My Profile', icon: UserCog },
            ]
        },
    ]

    const sidebarContent = (
        <div className="w-72 h-full bg-slate-950 flex flex-col selection:bg-primary-500/30">
            {/* Brand Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="bg-primary-500 p-2 rounded-xl shadow-lg shadow-primary-500/20 text-white">
                        <StoreIcon size={24} strokeWidth={3} />
                    </div>
                    <div>
                        <p className="text-white font-black text-2xl m-0 tracking-tighter italic">Savor</p>
                        <p className="text-primary-400 font-bold text-[10px] tracking-[0.2em] uppercase m-0 mt-0.5 opacity-70">Partner Portal</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Restaurant User Info */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary-600 to-emerald-400 text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0 border-2 border-slate-800">
                    {user?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                    <p className="text-white font-bold text-sm m-0">{user?.username || 'Restaurant Owner'}</p>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Online
                    </p>
                </div>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
                {navGroups.map(group => (
                    <div key={group.label}>
                        <p className="text-slate-500 text-xs font-bold tracking-[0.2em] px-3 mb-3">{group.label}</p>
                        <div className="space-y-1">
                            {group.links.map(link => {
                                const Icon = link.icon;
                                return (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        end={link.end}
                                        onClick={() => setIsOpen(false)}
                                        className={({ isActive }) =>
                                            isActive
                                                ? "flex items-center gap-3 text-white px-3 py-2.5 rounded-xl text-sm bg-primary-500/10 text-primary-400 font-semibold transition-all duration-200 group relative overflow-hidden"
                                                : "flex items-center gap-3 text-slate-400 px-3 py-2.5 rounded-xl text-sm hover:text-white hover:bg-slate-800/50 font-medium transition-all duration-200 group relative"
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary-500 rounded-r-full" />}
                                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-primary-500" : "text-slate-500 group-hover:text-slate-300 transition-colors"} />
                                                <span>{link.label}</span>
                                            </>
                                        )}
                                    </NavLink>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/5 bg-slate-900/30">
                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-rose-400/80 px-3 py-3 w-full text-left rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-all text-sm font-medium"
                    >
                        <LogOut size={20} className="text-rose-500/70" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 h-screen sticky top-0 flex-shrink-0">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-72 bg-slate-950 z-[60] lg:hidden shadow-2xl"
                        >
                            {sidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default RestaurantSidebar
