import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const FloatingCart = () => {
    const [cartCount, setCartCount] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            fetchCartStatus()
            // Poll for cart updates or use an event listener if available
            const interval = setInterval(fetchCartStatus, 5000)
            return () => clearInterval(interval)
        } else {
            setIsVisible(false)
        }
    }, [user])

    const fetchCartStatus = async () => {
        try {
            const response = await api.get('/orders/cart/my_cart/')
            const count = response.data.total_items
            setCartCount(count)
            setTotalAmount(response.data.total_amount)
            setIsVisible(count > 0)
        } catch (error) {
            console.error('Failed to fetch cart status:', error)
        }
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-lg"
                >
                    <button
                        onClick={() => navigate('/cart')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(5,150,105,0.3)] flex items-center justify-between group transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <ShoppingBag size={20} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-xs font-black uppercase tracking-widest opacity-80 leading-none mb-1">
                                    {cartCount} Item{cartCount !== 1 ? 's' : ''} Added
                                </span>
                                <span className="text-lg font-black tracking-tight leading-none">
                                    ₹{totalAmount} <span className="text-xs font-bold opacity-60 ml-1">plus taxes</span>
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 font-black text-sm uppercase tracking-widest">
                            View Cart
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                        </div>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default FloatingCart
