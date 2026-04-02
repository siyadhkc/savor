import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { MapPin, CreditCard, Banknote, ShieldCheck, Lock, ChevronLeft, ReceiptText, Loader2, Target } from 'lucide-react'
import { motion } from 'framer-motion'

const Checkout = () => {
    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(true)
    const [placing, setPlacing] = useState(false)
    const [formData, setFormData] = useState({
        address: '',
        payment_method: 'cod',
    })
    const navigate = useNavigate()

    useEffect(() => {
        fetchCart()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const fetchCart = async () => {
        try {
            const response = await api.get('/orders/cart/my_cart/')
            if (!response.data.items?.length) {
                toast.error('Your cart is empty!')
                navigate('/cart')
                return
            }
            setCart(response.data)
        } catch (error) {
            console.error('Failed to load cart:', error)
            toast.error('Failed to load cart.')
            navigate('/cart')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault()

        if (!formData.address.trim()) {
            toast.error('Please provide a delivery destination.')
            return
        }

        setPlacing(true)
        try {
            const orderRes = await api.post('/orders/orders/', formData)
            const order = orderRes.data

            if (formData.payment_method === 'cod') {
                toast.success('Order placed. We are preparing it now.')
                navigate('/orders', { state: { newOrderId: order.id } })
                return
            }

            const loaded = await loadRazorpayScript()
            if (!loaded) {
                toast.error('Razorpay failed to load. Try again.')
                return
            }

            const razorRes = await api.post('/payments/create-razorpay-order/', {
                order_id: order.id,
            })

            const options = {
                key: razorRes.data.key,
                amount: razorRes.data.amount,
                currency: razorRes.data.currency,
                name: 'FoodDelivery',
                description: `Order #${order.id}`,
                order_id: razorRes.data.razorpay_order_id,
                handler: async (paymentResponse) => {
                    try {
                        await api.post('/payments/verify-payment/', {
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature,
                        })
                        toast.success('Payment verified successfully.')
                        navigate('/orders', {
                            state: { newOrderId: order.id }
                        })
                    } catch {
                        toast.error('Payment verification failed.')
                    }
                },
                prefill: {
                    name: cart?.user || '',
                    email: '',
                },
                theme: { color: '#f97316' }, // matching primary-500
                modal: {
                    ondismiss: () => {
                        toast.error('Payment cancelled.')
                        setPlacing(false)
                    }
                }
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()

        } catch (error) {
            const message = error.response?.data?.error || 'Failed to process order.'
            toast.error(message)
        } finally {
            setPlacing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[80vh] bg-slate-50 flex flex-col items-center justify-center text-primary-600">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="text-lg font-semibold text-slate-600">Preparing checkout...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 selection:bg-primary-500/30">
            {/* Header Area */}
            <div className="relative bg-slate-950 overflow-hidden pt-10 pb-20 px-6">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="relative z-10 max-w-6xl mx-auto">
                    <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-white/40 hover:text-white font-bold mb-6 transition-colors group text-xs uppercase tracking-widest">
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Return to Cart
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-4">
                        <Target className="text-primary-400" size={36} strokeWidth={2.5} />
                        Checkout
                    </h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 xl:gap-12 items-start">

                    {/* Left Column — Delivery + Payment Forms */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-6"
                    >
                        {/* Delivery Address Card */}
                        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 p-8 md:p-10 border border-white">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-6 tracking-tight">
                                <MapPin className="text-primary-500" size={28} />
                                Delivery Destination
                            </h2>
                            <div className="relative">
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter your complete delivery address, including flat number, street, and landmarks..."
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-y min-h-[140px] shadow-inner"
                                    required
                                />
                                <div className="absolute top-4 right-4 text-slate-300">
                                    <MapPin size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Card */}
                        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 p-8 md:p-10 border border-white mb-6 lg:mb-0">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-6 tracking-tight">
                                <CreditCard className="text-primary-500" size={28} />
                                Payment Method
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* COD Option */}
                                <div
                                    onClick={() => setFormData({ ...formData, payment_method: 'cod' })}
                                    className={`relative p-6 rounded-[24px] cursor-pointer transition-all duration-300 border-2 overflow-hidden ${
                                        formData.payment_method === 'cod'
                                            ? 'border-primary-500 bg-primary-50/50 shadow-md shadow-primary-500/10'
                                            : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {formData.payment_method === 'cod' && (
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary-500 to-primary-400 rounded-bl-full flex items-start justify-end p-3">
                                            <ShieldCheck size={20} className="text-white" />
                                        </div>
                                    )}
                                    <Banknote size={32} className={`mb-4 ${formData.payment_method === 'cod' ? 'text-primary-600' : 'text-slate-400'}`} strokeWidth={1.5} />
                                    <h3 className={`text-lg font-bold mb-1 ${formData.payment_method === 'cod' ? 'text-primary-800' : 'text-slate-700'}`}>
                                        Cash on Delivery
                                    </h3>
                                    <p className={`text-sm font-medium ${formData.payment_method === 'cod' ? 'text-primary-600/80' : 'text-slate-500'}`}>
                                        Pay at your doorstep
                                    </p>
                                </div>

                                {/* Razorpay Option */}
                                <div
                                    onClick={() => setFormData({ ...formData, payment_method: 'razorpay' })}
                                    className={`relative p-6 rounded-[24px] cursor-pointer transition-all duration-300 border-2 overflow-hidden ${
                                        formData.payment_method === 'razorpay'
                                            ? 'border-primary-500 bg-primary-50/50 shadow-md shadow-primary-500/10'
                                            : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {formData.payment_method === 'razorpay' && (
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary-500 to-primary-400 rounded-bl-full flex items-start justify-end p-3">
                                            <ShieldCheck size={20} className="text-white" />
                                        </div>
                                    )}
                                    <CreditCard size={32} className={`mb-4 ${formData.payment_method === 'razorpay' ? 'text-primary-600' : 'text-slate-400'}`} strokeWidth={1.5} />
                                    <h3 className={`text-lg font-bold mb-1 ${formData.payment_method === 'razorpay' ? 'text-primary-800' : 'text-slate-700'}`}>
                                        Pay Online
                                    </h3>
                                    <p className={`text-sm font-medium ${formData.payment_method === 'razorpay' ? 'text-primary-600/80' : 'text-slate-500'}`}>
                                        UPI, Cards, Net Banking
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column — Deep Order Summary */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-slate-200/50 p-8 border border-white sticky top-24"
                    >
                        <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight flex items-center gap-3">
                            <ReceiptText className="text-slate-400" />
                            Final Review
                        </h2>

                        {/* Condensed Cart Items */}
                        <div className="max-h-[300px] overflow-y-auto pr-2 mb-6 space-y-4 custom-scrollbar">
                            {cart?.items.map(item => (
                                <div key={item.id} className="flex justify-between items-start text-sm py-2 border-b border-slate-50 last:border-0 last:pb-0">
                                    <span className="text-slate-700 font-bold flex-1 pr-4 leading-tight">
                                        {item.menu_item_name}
                                        <span className="text-slate-400 ml-2 font-medium bg-slate-100 px-1.5 py-0.5 rounded-md text-xs">
                                            x{item.quantity}
                                        </span>
                                    </span>
                                    <span className="font-black text-slate-800">
                                        ₹{item.total_price}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-slate-200 mb-6 w-full" />

                        {/* Calculations */}
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between font-medium text-slate-600 tracking-wide">
                                <span>Subtotal</span>
                                <span className="font-bold text-slate-800">₹{cart?.total_amount}</span>
                            </div>
                            <div className="flex justify-between font-medium text-slate-600 tracking-wide">
                                <span>Delivery Fee</span>
                                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">FREE</span>
                            </div>
                        </div>

                        <div className="h-px bg-slate-200 mb-6 w-full" />

                        {/* Big Total */}
                        <div className="flex items-end justify-between mb-8">
                            <span className="font-bold text-slate-500 uppercase tracking-widest text-sm mb-1">Total Due</span>
                            <span className="text-4xl font-black text-primary-600 tracking-tight">
                                ₹{cart?.total_amount}
                            </span>
                        </div>

                        {/* Place Order CTA */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={placing}
                            className={`w-full py-4 rounded-full font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${
                                placing
                                    ? 'bg-slate-200 text-slate-500 cursor-wait shadow-none'
                                    : 'bg-primary-600 text-white shadow-primary-600/30 hover:bg-primary-700 active:scale-95'
                            }`}
                        >
                            {placing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-slate-500/30 border-t-slate-500 rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Lock size={20} className="text-white/80" />
                                    <span>Authorize Payment</span>
                                </>
                            )}
                        </button>

                        <div className="mt-6 flex items-center gap-2 justify-center text-slate-400 text-xs font-medium">
                            <ShieldCheck size={14} />
                            <span>Payments are 256-bit encrypted and completely secure.</span>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    )
}

export default Checkout