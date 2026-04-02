import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { getImageUrl } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2, ReceiptText, ChevronLeft, UtensilsCrossed, ShieldCheck, Truck, Percent, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Cart = () => {
    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updatingItem, setUpdatingItem] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchCart()
    }, [])

    const fetchCart = async () => {
        setLoading(true)
        try {
            const response = await api.get('/orders/cart/my_cart/')
            setCart(response.data)
        } catch (error) {
            console.error('Failed to load cart:', error)
            toast.error('Failed to load cart.')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdatingItem(cartItemId)
        try {
            const response = await api.post('/orders/cart/update_quantity/', {
                cart_item_id: cartItemId,
                quantity: newQuantity,
            })
            setCart(response.data)
        } catch (error) {
            console.error('Failed to update quantity:', error)
            toast.error('Failed to update quantity.')
        } finally {
            setUpdatingItem(null)
        }
    }

    const handleRemoveItem = async (cartItemId) => {
        setUpdatingItem(cartItemId)
        try {
            const response = await api.post('/orders/cart/remove_item/', {
                cart_item_id: cartItemId,
            })
            setCart(response.data)
            toast.success('Item removed')
        } catch (error) {
            console.error('Failed to remove item from cart:', error)
            toast.error('Failed to remove item.')
        } finally {
            setUpdatingItem(null)
        }
    }

    const handleClearCart = async () => {
        if (!window.confirm("Empty your entire cart?")) return;
        try {
            await api.post('/orders/cart/clear/')
            setCart(prev => ({ ...prev, items: [] }))
            toast.success('Cart cleared.')
        } catch (error) {
            console.error('Failed to clear cart:', error)
            toast.error('Failed to clear cart.')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-6"></div>
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">Syncing your tastes...</p>
            </div>
        )
    }

    const isEmpty = !cart || cart.items.length === 0

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col pb-20">
            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="bg-white border-b border-slate-100 pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-5">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-slate-800">Your Cart</span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-3 flex items-center gap-4">
                                Bag <span className="text-primary-600 font-light italic">Insights</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-lg">
                                Review your selection before we start preparing.
                            </p>
                        </div>
                        
                        {!isEmpty && (
                            <button
                                onClick={handleClearCart}
                                className="flex items-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 self-start md:self-auto"
                            >
                                <Trash2 size={14} /> Empty Bag
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto px-5 py-12 w-full">
                {isEmpty ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-slate-100 gap-8 text-center px-6 shadow-sm"
                    >
                        <div className="w-28 h-28 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-center shadow-inner group">
                            <ShoppingBag size={48} className="text-slate-200 group-hover:text-primary-200 transition-colors duration-500" strokeWidth={1} />
                        </div>
                        <div className="space-y-2">
                             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your bag is empty</h2>
                             <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                Once you add items from a restaurant, they will appear here for checkout.
                             </p>
                        </div>
                        <button
                            onClick={() => navigate('/restaurants')}
                            className="px-10 py-4 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-95 text-sm uppercase tracking-widest"
                        >
                            Start Discovering <ArrowRight className="inline-block ml-2" size={16} strokeWidth={3} />
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 items-start">
                        
                        {/* Items List */}
                        <div className="space-y-6">
                            <AnimatePresence mode="popLayout">
                                {cart.items.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-white rounded-[32px] p-5 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            {/* Image */}
                                            <div className="w-full sm:w-40 h-48 sm:h-40 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 relative">
                                                {item.menu_item_image ? (
                                                    <img 
                                                        src={getImageUrl(item.menu_item_image)} 
                                                        alt={item.menu_item_name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                        <UtensilsCrossed size={48} strokeWidth={1} />
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm transition-all active:scale-90"
                                                >
                                                    <X size={16} strokeWidth={3} />
                                                </button>
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-1 block">Selected Choice</span>
                                                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                                            {item.menu_item_name}
                                                        </h3>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-2xl font-black text-slate-900 leading-none">₹{item.total_price}</span>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-slate-500 font-bold text-sm mb-6">
                                                    <ReceiptText size={14} className="text-slate-300" />
                                                    <span>Base: ₹{item.menu_item_price}</span>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200/60 p-1">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                            disabled={updatingItem === item.id || item.quantity <= 1}
                                                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-700 font-bold shadow-sm hover:text-primary-600 disabled:opacity-30 transition-all active:scale-95"
                                                        >
                                                            <Minus size={14} strokeWidth={3} />
                                                        </button>
                                                        <span className="w-12 text-center font-black text-slate-900 text-sm">
                                                            {updatingItem === item.id ? '...' : item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                            disabled={updatingItem === item.id}
                                                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-700 font-bold shadow-sm hover:text-primary-600 disabled:opacity-50 transition-all active:scale-95"
                                                        >
                                                            <Plus size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">In Stock</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Summary Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[40px] border border-slate-100 p-8 sm:p-10 shadow-xl shadow-slate-200/30 sticky top-32"
                        >
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Order Summary</h2>
                            
                            <div className="space-y-5 mb-10">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3 text-slate-500 font-bold">
                                        <ReceiptText size={18} className="text-slate-300" />
                                        Subtotal
                                    </div>
                                    <span className="font-black text-slate-900">₹{cart.total_amount}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3 text-slate-500 font-bold">
                                        <Truck size={18} className="text-slate-300" />
                                        Delivery Fee
                                    </div>
                                    <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest">Free</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3 text-slate-500 font-bold">
                                        <Percent size={18} className="text-slate-300" />
                                        Platform Fee
                                    </div>
                                    <span className="font-black text-slate-400 line-through">₹29</span>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 mb-8 w-full" />

                            <div className="flex flex-col gap-1 mb-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Investment</p>
                                <div className="flex items-end justify-between">
                                    <span className="text-5xl font-black tracking-tighter text-primary-600 leading-none">
                                        ₹{cart.total_amount}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 pb-1">Incl. all taxes</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-base uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group"
                            >
                                Secure Checkout
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                            </button>

                            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-3">
                                <ShieldCheck size={16} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">256-Bit SSL Secure Checkout</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Cart
