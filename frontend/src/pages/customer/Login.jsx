import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { UtensilsCrossed, Mail, Lock, LogIn, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await login(formData.email, formData.password)
            const userRes = await api.get('/users/profile/')
            const loggedInUser = userRes.data

            toast.success('Authentication successful! 🎉')

            if (loggedInUser.role === 'admin' || loggedInUser.is_staff) {
                navigate('/admin')
            } else if (loggedInUser.role === 'restaurant') {
                navigate('/restaurant-admin')
            } else {
                navigate('/')
            }
        } catch (error) {
            const message = error.response?.data?.detail || 'Invalid credentials.'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex selection:bg-primary-500/30">
            {/* Left Side — Branding & Visuals */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-600/30 blur-[120px] rounded-full mix-blend-screen" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-600/20 blur-[130px] rounded-full mix-blend-screen" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-white mb-16">
                        <div className="p-2.5 bg-primary-600 rounded-xl shadow-lg shadow-primary-600/30">
                            <UtensilsCrossed size={28} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black tracking-tight">FoodDelivery Pro</span>
                    </div>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
                            Your favorite flavors, <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-400">
                                delivered fast.
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-md">
                            Access your account to manage orders, explore premium menus, and track deliveries in real-time.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side — Login Form */}
            <div className="w-full lg:w-1/2 bg-slate-50 flex items-center justify-center p-8 relative">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-white relative z-10"
                >
                    <div className="lg:hidden flex items-center gap-3 text-slate-800 mb-10">
                        <div className="p-2.5 bg-primary-100 text-primary-600 rounded-xl">
                            <UtensilsCrossed size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-black tracking-tight">FoodDelivery</span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Welcome Back</h2>
                        <p className="text-slate-500 font-medium">Enter your credentials to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={20} className="text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={20} className="text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-full font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl mt-4 ${
                                loading
                                    ? 'bg-slate-200 text-slate-500 cursor-wait shadow-none'
                                    : 'bg-primary-600 text-white shadow-primary-600/30 hover:bg-primary-700 active:scale-95'
                            }`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-slate-500/30 border-t-slate-500 rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Sign In securely <LogIn size={20} strokeWidth={2.5} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center flex flex-col gap-2">
                        <p className="text-slate-500 font-medium text-sm">
                            New to FoodDelivery?
                        </p>
                        <Link to="/register" className="inline-flex items-center justify-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors group">
                            Create an account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/40 via-transparent to-transparent -z-10" />
            </div>
        </div>
    )
}

export default Login
