import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { MapPin, CreditCard, Banknote, ShieldCheck, Lock, ChevronLeft, ReceiptText, Loader2, Target, CheckCircle2 } from 'lucide-react'
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
                name: 'Savor',
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
                theme: { color: '#16a34a' }, // matching primary-600
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-6"></div>
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">Securing your session...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="bg-white border-b border-slate-100 pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-5">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <Link to="/cart" className="hover:text-primary-600 transition-colors flex items-center gap-1">
                            <ChevronLeft size={10} /> Back to Bag
                        </Link>
                        <span>/</span>
                        <span className="text-slate-800">Checkout</span>
                    </div>
                    
                    <div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-3 flex items-center gap-4">
                            Finalize <span className="text-primary-600 font-light italic">Order</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg">
                            Review and authorize your premium selection.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-5 py-12 relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 items-start">

                    {/* Left Column — Delivery + Payment Forms */}
                    <div className="space-y-8">
                        {/* Delivery Address Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 md:p-12"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 shadow-inner">
                                    <MapPin size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Delivery Logistics</h2>
                                    <p className="text-slate-400 font-medium text-sm">Where should we bring your feast?</p>
                                </div>
                            </div>

                            <div className="relative group">
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Complete delivery address including floor, landmark..."
                                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-slate-800 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none min-h-[160px] text-lg shadow-inner"
                                    required
                                />
                            </div>
                        </motion.div>

                        {/* Payment Method Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 md:p-12 mb-6 lg:mb-0"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 shadow-inner">
                                    <CreditCard size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Method of Payment</h2>
                                    <p className="text-slate-400 font-medium text-sm">Select your preferred gateway.</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* COD Option */}
                                <label
                                    className={`relative p-6 rounded-[32px] cursor-pointer transition-all duration-500 border-2 flex flex-col gap-4 group overflow-hidden ${
                                        formData.payment_method === 'cod'
                                            ? 'border-primary-600 bg-primary-50/30'
                                            : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                                    }`}
                                >
                                    <input 
                                        type="radio" 
                                        name="payment_method" 
                                        value="cod" 
                                        checked={formData.payment_method === 'cod'}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <div className="flex justify-between items-start">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                            formData.payment_method === 'cod' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-white text-slate-400'
                                        }`}>
                                            <Banknote size={24} strokeWidth={2.5} />
                                        </div>
                                        {formData.payment_method === 'cod' && (
                                            <CheckCircle2 size={24} className="text-primary-600" />
                                        ) }
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900">Cash on Delivery</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pay at Doorstep</p>
                                    </div>
                                </label>

                                {/* Razorpay Option */}
                                <label
                                    className={`relative p-6 rounded-[32px] cursor-pointer transition-all duration-500 border-2 flex flex-col gap-4 group overflow-hidden ${
                                        formData.payment_method === 'razorpay'
                                            ? 'border-primary-600 bg-primary-50/30'
                                            : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                                    }`}
                                >
                                    <input 
                                        type="radio" 
                                        name="payment_method" 
                                        value="razorpay" 
                                        checked={formData.payment_method === 'razorpay'}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <div className="flex justify-between items-start">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                            formData.payment_method === 'razorpay' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-white text-slate-400'
                                        }`}>
                                            <CreditCard size={24} strokeWidth={2.5} />
                                        </div>
                                        {formData.payment_method === 'razorpay' && (
                                            <CheckCircle2 size={24} className="text-primary-600" />
                                        ) }
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900">Pay Online</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">UPI, Cards, Net Banking</p>
                                    </div>
                                </label>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column — Deep Order Summary */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900 rounded-[40px] shadow-2xl shadow-slate-900/40 p-8 sm:p-10 border border-white/5 sticky top-32 text-white"
                    >
                        <h2 className="text-2xl font-black text-white tracking-tight mb-8">Review & Pay</h2>

                        {/* Condensed Cart Items */}
                        <div className="max-h-[280px] overflow-y-auto pr-2 mb-8 space-y-5 custom-scrollbar">
                            {cart?.items.map(item => (
                                <div key={item.id} className="flex justify-between items-start text-sm py-1">
                                    <div className="flex-1 pr-6 flex flex-col">
                                        <span className="text-white font-black leading-tight mb-1">
                                            {item.menu_item_name}
                                        </span>
                                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                                            Quantity: {item.quantity}
                                        </span>
                                    </div>
                                    <span className="font-black text-primary-400">
                                        ₹{item.total_price}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-white/5 mb-8 w-full" />

                        {/* Calculations */}
                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between font-bold text-white/50 text-sm italic">
                                <span>Subtotal</span>
                                <span className="text-white">₹{cart?.total_amount}</span>
                            </div>
                            <div className="flex justify-between font-bold text-white/50 text-sm italic">
                                <span>Delivery Fee</span>
                                <span className="text-emerald-400 uppercase tracking-widest text-[10px] font-black">Complimentary</span>
                            </div>
                        </div>

                        <div className="h-px bg-white/5 mb-10 w-full" />

                        {/* Big Total */}
                        <div className="flex flex-col gap-1 mb-10">
                             <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Authorized Transaction</p>
                             <div className="flex items-end justify-between">
                                 <span className="text-5xl font-black tracking-tighter text-white">
                                     ₹{cart?.total_amount}
                                 </span>
                                 <span className="text-[10px] font-black text-white/30 uppercase tracking-widest pb-1">INR Total</span>
                             </div>
                        </div>

                        {/* Place Order CTA */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={placing}
                            className={`w-full py-5 rounded-[24px] font-black text-base uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl ${
                                placing
                                    ? 'bg-white/10 text-white/30 cursor-wait shadow-none'
                                    : 'bg-primary-600 text-white shadow-primary-600/30 hover:bg-primary-700 active:scale-95'
                            }`}
                        >
                            {placing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <span>Authorizing...</span>
                                </>
                            ) : (
                                <>
                                    <Lock size={18} className="text-white/80" strokeWidth={3} />
                                    <span>Place Order</span>
                                </>
                            )}
                        </button>

                        <div className="mt-8 flex flex-col items-center gap-4 text-white/20 text-center">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <ShieldCheck size={14} />
                                256-Bit SSL Encryption
                            </div>
                            <p className="text-[9px] font-bold leading-relaxed max-w-[200px]">
                                Your payment is processed through encrypted secure gateways. Savor does not store credentials.
                            </p>
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    )
}

export default Checkout
