import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { getImageUrl } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2, ReceiptText, ChevronLeft, UtensilsCrossed } from 'lucide-react'
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
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 text-primary-600">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                <p className="font-semibold text-slate-500">Retrieving your order...</p>
            </div>
        )
    }

    const isEmpty = !cart || cart.items.length === 0

    return (
        <div className="min-h-[90vh] bg-slate-50 pb-20 selection:bg-primary-500/30">
            {/* Header Area */}
            <div className="relative bg-slate-950 text-white border-b border-white/[0.06] pt-10 pb-20 px-6 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-6xl mx-auto">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/50 font-bold mb-6 hover:text-white transition-colors group">
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Keep Browsing
                    </button>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3 sm:gap-4">
                        <ShoppingBag className="text-primary-500 w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2.5} />
                        Your Cart
                    </h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
                {isEmpty ? (
                    /* Elegant Empty State */
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-lg border border-slate-100 p-16 md:p-32 text-center"
                    >
                        <div className="w-32 h-32 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-8 border-8 border-white shadow-inner">
                            <ShoppingBag size={64} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">Your cart is empty</h2>
                        <p className="text-slate-500 text-lg font-medium mb-10 max-w-sm mx-auto">
                            Browse our partner restaurants and add your favourite items to get started.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-700 active:scale-95 shadow-lg shadow-primary-600/30 transition-all text-base sm:text-lg"
                        >
                            Explore Restaurants <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 xl:gap-12 items-start">
                        {/* Cart Items List */}
                        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 md:p-10">
                            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                                <h2 className="text-lg sm:text-2xl font-black text-slate-800 flex items-center gap-2 sm:gap-3">
                                    <ReceiptText className="text-slate-400 w-5 h-5 sm:w-6 sm:h-6" />
                                    Order Items
                                    <span className="text-slate-400 font-semibold text-base sm:text-lg">({cart.total_items})</span>
                                </h2>
                                <button
                                    onClick={handleClearCart}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-rose-50 text-rose-600 rounded-full font-bold text-xs sm:text-sm hover:bg-rose-100 transition-colors border border-rose-100"
                                >
                                    Clear Cart
                                </button>
                            </div>

                            <div className="space-y-6">
                                <AnimatePresence>
                                    {cart.items.map(item => (
                                        <motion.div 
                                            key={item.id} 
                                            layout
                                            exit={{ opacity: 0, x: -50 }}
                                            className="flex flex-row items-start sm:items-stretch gap-4 sm:gap-6 pb-6 border-b border-slate-100 last:border-0 last:pb-0 group"
                                        >
                                            {/* Beautiful Image Block */}
                                            <div className="w-20 h-20 sm:w-32 sm:h-32 flex-shrink-0 bg-slate-50 rounded-[16px] sm:rounded-2xl overflow-hidden relative shadow-inner border border-slate-200/50">
                                                {item.menu_item_image ? (
                                                    <img
                                                        src={getImageUrl(item.menu_item_image)}
                                                        alt={item.menu_item_name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-primary-200 bg-primary-50">
                                                        <UtensilsCrossed size={24} className="sm:w-8 sm:h-8" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Item Info Matrix */}
                                            <div className="flex-1 w-full flex flex-col justify-between py-0.5 sm:py-0">
                                                <div className="flex justify-between items-start mb-1 sm:mb-2">
                                                    <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-tight line-clamp-2 pr-2">
                                                        {item.menu_item_name}
                                                    </h3>
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        disabled={updatingItem === item.id}
                                                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 sm:p-2 rounded-xl transition-colors focus:outline-none shrink-0 -mt-1 -mr-1"
                                                        title="Remove from cart"
                                                    >
                                                        <Trash2 size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                                
                                                <p className="text-slate-400 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                                                    Base: <span className="font-bold text-slate-600">₹{item.menu_item_price}</span>
                                                </p>

                                                <div className="flex justify-between items-center sm:items-end mt-auto pt-2">
                                                    {/* Elite Quantity Toggle */}
                                                    <div className="flex items-center bg-slate-50 rounded-full border border-slate-200/60 shadow-sm p-1">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                            disabled={updatingItem === item.id || item.quantity <= 1}
                                                            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-white border border-slate-100 rounded-full text-slate-700 font-bold shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-md hover:text-primary-600 disabled:opacity-50 transition-all"
                                                        >
                                                            <Minus size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
                                                        </button>
                                                        <span className="w-8 sm:w-10 text-center font-black text-slate-800 text-xs sm:text-sm">
                                                            {updatingItem === item.id ? '...' : item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                            disabled={updatingItem === item.id}
                                                            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-white border border-slate-100 rounded-full text-slate-700 font-bold shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-md hover:text-primary-600 disabled:opacity-50 transition-all"
                                                        >
                                                            <Plus size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />
                                                        </button>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-black text-lg sm:text-2xl text-slate-800 flex items-center gap-1 leading-none">
                                                            ₹{item.total_price}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Floating Order Summary */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-[24px] shadow-premium border border-slate-200/50 p-6 sm:p-8 sticky top-24"
                        >
                            <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight">Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between font-medium text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-slate-800">₹{cart.total_amount}</span>
                                </div>
                                <div className="flex justify-between font-medium text-slate-600">
                                    <span>Taxes & Fees</span>
                                    <span className="font-bold text-slate-800">Included</span>
                                </div>
                                <div className="flex justify-between font-medium text-slate-600">
                                    <span>Delivery Fee</span>
                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Complimentary</span>
                                </div>
                            </div>

                            <div className="h-px bg-slate-200 mb-6 w-full" />

                            <div className="flex items-end justify-between mb-8">
                                <span className="font-bold text-slate-500 uppercase tracking-widest text-sm mb-1">Total Pay</span>
                                <span className="text-4xl font-black text-primary-600 tracking-tight">
                                    ₹{cart.total_amount}
                                </span>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full py-3 sm:py-4 bg-primary-600 text-white rounded-2xl font-black text-base sm:text-lg hover:bg-primary-700 active:scale-95 shadow-premium transition-all flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4"
                            >
                                Secure Checkout <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-3 sm:py-4 bg-slate-50 text-slate-600 rounded-full font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors flex items-center justify-center"
                            >
                                Continue Shopping
                            </button>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Cart