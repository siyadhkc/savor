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
            toast.success('Cart flushed')
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
            <div className="bg-white border-b border-slate-200 pt-10 pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-primary-600 transition-colors group">
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Keep Browsing
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                        <ShoppingBag className="text-primary-600" size={40} strokeWidth={2.5} />
                        Your Cart
                    </h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
                {isEmpty ? (
                    /* Elegant Empty State */
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 p-16 md:p-32 text-center border border-white"
                    >
                        <div className="w-32 h-32 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-8 border-8 border-white shadow-inner">
                            <ShoppingBag size={64} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">It looks a little empty here!</h2>
                        <p className="text-slate-500 text-lg font-medium mb-10 max-w-sm mx-auto">
                            Add some delicious masterpieces from our curated restaurants to get started.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-700 active:scale-95 shadow-lg shadow-primary-600/30 transition-all text-lg"
                        >
                            Explore Restaurants <ArrowRight size={20} strokeWidth={3} />
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 xl:gap-12 items-start">
                        {/* Cart Items List */}
                        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-white">
                            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <ReceiptText className="text-slate-400" />
                                    Order Items <span className="text-slate-400 font-semibold text-xl">({cart.total_items})</span>
                                </h2>
                                <button
                                    onClick={handleClearCart}
                                    className="px-4 py-2 bg-rose-50 text-rose-600 rounded-full font-bold text-sm hover:bg-rose-100 transition-colors"
                                >
                                    Flush Cart
                                </button>
                            </div>

                            <div className="space-y-6">
                                <AnimatePresence>
                                    {cart.items.map(item => (
                                        <motion.div 
                                            key={item.id} 
                                            layout
                                            exit={{ opacity: 0, x: -50 }}
                                            className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 pb-6 border-b border-slate-100 last:border-0 last:pb-0 group"
                                        >
                                            {/* Beautiful Image Block */}
                                            <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-slate-50 rounded-2xl overflow-hidden relative shadow-inner">
                                                {item.menu_item_image ? (
                                                    <img
                                                        src={getImageUrl(item.menu_item_image)}
                                                        alt={item.menu_item_name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-primary-200 bg-primary-50">
                                                        <UtensilsCrossed size={32} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Item Info Matrix */}
                                            <div className="flex-1 w-full flex flex-col justify-center">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">
                                                        {item.menu_item_name}
                                                    </h3>
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        disabled={updatingItem === item.id}
                                                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors focus:outline-none"
                                                        title="Remove from cart"
                                                    >
                                                        <Trash2 size={20} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                                
                                                <p className="text-slate-500 font-medium mb-4">
                                                    Base price: <span className="font-bold text-slate-700">₹{item.menu_item_price}</span>
                                                </p>

                                                <div className="flex justify-between items-center mt-auto">
                                                    {/* Elite Quantity Toggle */}
                                                    <div className="flex items-center bg-slate-100 rounded-full border border-slate-200 shadow-sm p-1">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                            disabled={updatingItem === item.id || item.quantity <= 1}
                                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-700 font-bold hover:shadow-sm hover:text-primary-600 disabled:opacity-50 transition-all"
                                                        >
                                                            <Minus size={16} strokeWidth={3} />
                                                        </button>
                                                        <span className="w-10 text-center font-black text-slate-800 text-sm">
                                                            {updatingItem === item.id ? '...' : item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                            disabled={updatingItem === item.id}
                                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-700 font-bold hover:shadow-sm hover:text-primary-600 disabled:opacity-50 transition-all"
                                                        >
                                                            <Plus size={16} strokeWidth={3} />
                                                        </button>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-black text-2xl text-slate-800 flex items-center gap-1">
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
                            className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-slate-200/50 p-8 border border-white sticky top-24"
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
                                className="w-full py-4 bg-primary-600 text-white rounded-full font-black text-lg hover:bg-primary-700 active:scale-95 shadow-xl shadow-primary-600/30 transition-all flex items-center justify-center gap-3 mb-4"
                            >
                                Secure Checkout <ArrowRight size={20} strokeWidth={3} />
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-4 bg-slate-50 text-slate-600 rounded-full font-bold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center"
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