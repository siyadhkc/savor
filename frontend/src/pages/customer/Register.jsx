import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { UtensilsCrossed, Mail, Lock, User, Phone, ArrowRight, UserPlus, Store, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Register = () => {
    const [isRestaurantMode, setIsRestaurantMode] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        phone: '',
        password: '',
        password2: '',
        restaurant_name: '',
        restaurant_address: '',
    })
    const [loading, setLoading] = useState(false)
    const { register, registerRestaurant } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.password2) {
            toast.error('Passwords do not match!')
            return
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters long.')
            return
        }

        setLoading(true)
        try {
            if (isRestaurantMode) {
                await registerRestaurant(formData)
                toast.success('Restaurant registered! 🎉')
                navigate('/login') // Redirect to login, when they login they will go to restaurant dashboard
            } else {
                await register(formData)
                toast.success('Account successfully minted! 🎉')
                navigate('/login')
            }
        } catch (error) {
            const errors = error.response?.data
            if (errors) {
                const firstError = Object.values(errors)[0]
                toast.error(Array.isArray(firstError) ? firstError[0] : firstError)
            } else {
                toast.error('Registration pipeline failed.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex selection:bg-primary-500/30">
            {/* Left Side — Branding & Visuals */}
            <div className="hidden lg:flex w-[45%] bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
                <div className="absolute inset-0 z-0">
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-600/30 blur-[120px] rounded-full mix-blend-screen" />
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/20 blur-[130px] rounded-full mix-blend-screen" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                </div>
                
                <div className="relative z-10 w-full h-full flex flex-col justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2.5 bg-primary-600 rounded-xl shadow-lg shadow-primary-600/30">
                            <UtensilsCrossed size={28} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black tracking-tight">FoodDelivery Pro</span>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-10"
                    >
                        <h1 className="text-5xl font-black text-white leading-tight mb-6 tracking-tight">
                            Join the elite <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-400">
                                {isRestaurantMode ? 'culinary partners.' : 'dining network.'}
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium max-w-sm">
                            {isRestaurantMode 
                            ? 'Register your restaurant to reach premium customers and boost your sales.' 
                            : 'Create your account to unlock exclusive restaurants, lightning-fast delivery, and premium support.'}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side — Register Form */}
            <div className="w-full lg:w-[55%] bg-slate-50 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto custom-scrollbar">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg bg-white p-8 md:p-10 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-white relative z-10 my-auto"
                >
                    <div className="lg:hidden flex items-center gap-3 text-slate-800 mb-8">
                        <div className="p-2.5 bg-primary-100 text-primary-600 rounded-xl">
                            <UtensilsCrossed size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-black tracking-tight">FoodDelivery</span>
                    </div>

                    <div className="mb-8 flex justify-between items-end">
                        <div className="flex-1">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                                {isRestaurantMode ? 'Partner With Us' : 'Create Account'}
                            </h2>
                            <p className="text-slate-500 font-medium">
                                {isRestaurantMode ? 'Set up your restaurant account.' : 'Build your profile and start ordering.'}
                            </p>
                        </div>
                        
                        {/* Toggle Mode Button */}
                        <button
                            type="button"
                            onClick={() => setIsRestaurantMode(!isRestaurantMode)}
                            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors ml-4 shrink-0 shadow-inner"
                            title={isRestaurantMode ? "Switch to Customer" : "Register a Restaurant"}
                        >
                            {isRestaurantMode ? <User size={22} /> : <Store size={22} />}
                            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider hidden sm:block">
                                {isRestaurantMode ? 'Customer' : 'Partner'}
                            </span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        <AnimatePresence>
                            {isRestaurantMode && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Restaurant Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Store size={18} className="text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="restaurant_name"
                                                value={formData.restaurant_name}
                                                onChange={handleChange}
                                                placeholder="The Gourmet Kitchen"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
                                                required={isRestaurantMode}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Restaurant Address</label>
                                        <div className="relative">
                                            <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none">
                                                <MapPin size={18} className="text-slate-400" />
                                            </div>
                                            <textarea
                                                name="restaurant_address"
                                                value={formData.restaurant_address}
                                                onChange={handleChange}
                                                placeholder="123 Culinary Hub, Food Street..."
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400 resize-none min-h-[80px]"
                                                required={isRestaurantMode}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User size={18} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="johndoe"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Phone</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Phone size={18} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 234 567 8900"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min 8 chars"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password2"
                                        value={formData.password2}
                                        onChange={handleChange}
                                        placeholder="Repeat pass"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-full font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl mt-6 ${
                                loading
                                    ? 'bg-slate-200 text-slate-500 cursor-wait shadow-none'
                                    : 'bg-primary-600 text-white shadow-primary-600/30 hover:bg-primary-700 active:scale-95'
                            }`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-slate-500/30 border-t-slate-500 rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isRestaurantMode ? 'Create Restaurant' : 'Create Account'} <UserPlus size={20} strokeWidth={2.5} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center flex flex-col gap-2">
                        <p className="text-slate-500 font-medium text-sm">
                            Already a member?
                        </p>
                        <Link to="/login" className="inline-flex items-center justify-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors group">
                            Sign in to your account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
                
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/40 via-transparent to-transparent -z-10" />
            </div>
        </div>
    )
}

export default Register