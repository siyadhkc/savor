import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Utensils, ShoppingCart, Clock, User, LogOut, LogIn, UserPlus } from 'lucide-react'

const CustomerNavbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        toast.success('Logged out successfully')
        navigate('/login')
    }

    return (
        <nav className="sticky top-0 z-[1000] bg-primary-600/95 backdrop-blur-md shadow-lg border-b border-primary-500/50">
            <div className="max-w-6xl mx-auto px-5 flex justify-between items-center h-20">
                <Link to="/" className="flex items-center gap-2 text-white text-2xl font-black tracking-tight hover:scale-[1.02] transition-transform duration-300">
                    <div className="bg-white text-primary-600 p-1.5 rounded-xl shadow-sm">
                        <Utensils size={24} strokeWidth={2.5} />
                    </div>
                    FoodDelivery
                </Link>

                <div className="flex items-center gap-8">
                    <Link to="/" className="nav-link text-base">Home</Link>

                    {user ? (
                        <>
                            {user.role === 'restaurant' && (
                                <Link to="/restaurant-admin" className="px-4 py-2 bg-primary-700 text-white rounded-full font-bold text-sm hover:bg-primary-800 transition-colors">
                                    Store Management
                                </Link>
                            )}
                            {(user.role === 'admin' || user.is_staff) && (
                                <Link to="/admin" className="px-4 py-2 bg-primary-700 text-white rounded-full font-bold text-sm hover:bg-primary-800 transition-colors">
                                    Admin Panel
                                </Link>
                            )}
                            <Link to="/cart" className="nav-link flex items-center gap-2">
                                <ShoppingCart size={18} /> Cart
                            </Link>
                            <Link to="/orders" className="nav-link flex items-center gap-2">
                                <Clock size={18} /> Orders
                            </Link>
                            <Link to="/profile" className="nav-link flex items-center gap-2">
                                <User size={18} /> {user.username}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 font-bold rounded-full hover:bg-slate-50 hover:shadow-md transition-all duration-300 active:scale-95"
                            >
                                <LogOut size={18} strokeWidth={2.5} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link flex items-center gap-2">
                                <LogIn size={18} /> Login
                            </Link>
                            <Link to="/register" className="flex items-center gap-2 px-6 py-2.5 bg-white text-primary-600 font-bold rounded-full hover:bg-slate-50 hover:shadow-lg transition-all duration-300 active:scale-95">
                                <UserPlus size={18} strokeWidth={2.5} />
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default CustomerNavbar
