import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatOrderId, formatDate } from '../../utils/helpers'
import {
    Clock, ChefHat, Truck, CheckCircle2, XCircle,
    ShoppingBag, ChevronDown, MapPin, Download,
    ReceiptText, Package, ArrowLeft, Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Status config — icon replaces emoji, semantic colors preserved
const STATUS_CONFIG = {
    pending: {
        icon: Clock,
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        text: 'text-amber-700',
        dot: 'bg-amber-400',
        label: 'Pending',
    },
    preparing: {
        icon: ChefHat,
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        text: 'text-blue-700',
        dot: 'bg-blue-400',
        label: 'Preparing',
    },
    out_for_delivery: {
        icon: Truck,
        bg: 'bg-violet-50',
        border: 'border-violet-100',
        text: 'text-violet-700',
        dot: 'bg-violet-400',
        label: 'Out for Delivery',
    },
    delivered: {
        icon: CheckCircle2,
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        text: 'text-emerald-700',
        dot: 'bg-emerald-400',
        label: 'Delivered',
    },
    cancelled: {
        icon: XCircle,
        bg: 'bg-rose-50',
        border: 'border-rose-100',
        text: 'text-rose-700',
        dot: 'bg-rose-400',
        label: 'Cancelled',
    },
}

// Skeleton card for loading state
const SkeletonCard = () => (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
                <div className="h-4 w-28 bg-slate-100 rounded-full" />
                <div className="h-3 w-20 bg-slate-100 rounded-full" />
            </div>
            <div className="h-7 w-24 bg-slate-100 rounded-full" />
        </div>
        <div className="h-px bg-slate-100 mb-4" />
        <div className="flex justify-between items-center">
            <div className="h-3 w-16 bg-slate-100 rounded-full" />
            <div className="h-5 w-20 bg-slate-100 rounded-full" />
        </div>
    </div>
)

const OrderHistory = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedOrder, setExpandedOrder] = useState(null)
    const [downloading, setDownloading] = useState(null)
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        fetchOrders()
        if (location.state?.newOrderId) {
            setExpandedOrder(location.state.newOrderId)
        }
    }, [location.state?.newOrderId]) // eslint-disable-line react-hooks/exhaustive-deps

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/orders/')
            setOrders(response.data.results)
        } catch {
            toast.error('Failed to load orders.')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadInvoice = async (orderId) => {
        setDownloading(orderId)
        try {
            const response = await api.get(
                `/orders/orders/${orderId}/invoice/`,
                { responseType: 'blob' }
            )
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `invoice_order_${orderId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            toast.success('Invoice downloaded.')
        } catch {
            toast.error('Failed to download invoice.')
        } finally {
            setDownloading(null)
        }
    }

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId)
    }

    return (
        <div className="min-h-screen bg-[#FCFCFD] flex flex-col">

            {/* ── Dark Hero Header ──────────────────────────────────────── */}
            <div className="relative bg-slate-950 overflow-hidden pt-10 pb-20 px-6">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest mb-8 transition-colors group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>

                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-primary-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Account</p>
                            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-tight">
                                My Orders
                            </h1>
                            {!loading && (
                                <p className="text-white/40 font-medium mt-2">
                                    {orders.length} order{orders.length !== 1 ? 's' : ''} placed
                                </p>
                            )}
                        </div>
                        <div className="hidden sm:flex w-14 h-14 bg-white/[0.04] border border-white/[0.08] rounded-2xl items-center justify-center">
                            <Package size={24} className="text-white/30" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ───────────────────────────────────────────────── */}
            <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 -mt-10 pb-20 relative z-10">

                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : orders.length === 0 ? (
                    /* Empty state */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 sm:p-24 text-center"
                    >
                        <div className="w-20 h-20 mx-auto bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-6">
                            <ShoppingBag size={36} className="text-slate-300" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-3">No orders yet</h2>
                        <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto leading-relaxed">
                            Your order history will appear here once you place your first order.
                        </p>
                        <button
                            onClick={() => navigate('/restaurants')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-full hover:bg-primary-700 active:scale-95 transition-all text-sm shadow-lg shadow-primary-600/20"
                        >
                            Browse Restaurants
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-4"
                    >
                        {orders.map((order, idx) => {
                            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                            const StatusIcon = status.icon
                            const isExpanded = expandedOrder === order.id
                            const isNew = location.state?.newOrderId === order.id

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className={`bg-white rounded-3xl border shadow-sm transition-all duration-300 overflow-hidden ${
                                        isNew
                                            ? 'border-primary-300 shadow-primary-100'
                                            : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
                                    }`}
                                >
                                    {/* Order header — clickable to expand */}
                                    <button
                                        onClick={() => toggleExpand(order.id)}
                                        className="w-full flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 text-left group"
                                        aria-expanded={isExpanded}
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl ${status.bg} ${status.border} border flex items-center justify-center shrink-0`}>
                                                <StatusIcon size={18} className={status.text} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-slate-800 font-black text-sm sm:text-base tracking-tight leading-tight">
                                                    {formatOrderId(order.id)}
                                                </p>
                                                <p className="text-slate-400 text-xs font-medium mt-0.5">
                                                    {formatDate(order.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 sm:gap-5 shrink-0 ml-4">
                                            {/* Status pill */}
                                            <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${status.bg} ${status.text} ${status.border}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                {status.label}
                                            </span>

                                            {/* Amount */}
                                            <span className="text-slate-800 font-black text-base sm:text-lg">
                                                ₹{order.total_amount}
                                            </span>

                                            {/* Chevron */}
                                            <ChevronDown
                                                size={18}
                                                className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                    </button>

                                    {/* Mobile status pill */}
                                    <div className="sm:hidden px-6 pb-4 -mt-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${status.bg} ${status.text} ${status.border}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                            {status.label}
                                        </span>
                                    </div>

                                    {/* Expandable order details */}
                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.div
                                                key="order-detail"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 sm:px-8 pb-6 sm:pb-8 border-t border-slate-100">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-5 mb-4">
                                                        Items Ordered
                                                    </p>

                                                    {/* Items list */}
                                                    <div className="flex flex-col gap-2 mb-6">
                                                        {order.items.map(item => (
                                                            <div
                                                                key={item.id}
                                                                className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                                                    <span className="text-slate-700 font-semibold text-sm truncate">
                                                                        {item.menu_item_name}
                                                                    </span>
                                                                    <span className="text-slate-400 text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                                                                        x{item.quantity}
                                                                    </span>
                                                                </div>
                                                                <span className="text-slate-800 font-black text-sm shrink-0 ml-4">
                                                                    ₹{item.total_price}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Total row */}
                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mb-5">
                                                        <span className="text-slate-500 font-bold text-sm">Order Total</span>
                                                        <span className="text-slate-900 font-black text-lg">₹{order.total_amount}</span>
                                                    </div>

                                                    {/* Delivery address */}
                                                    <div className="flex items-start gap-3 bg-slate-50 rounded-2xl px-4 py-3 mb-5 border border-slate-100">
                                                        <MapPin size={15} className="text-primary-500 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delivered to</p>
                                                            <p className="text-slate-700 font-medium text-sm leading-relaxed">{order.address}</p>
                                                        </div>
                                                    </div>

                                                    {/* Download invoice */}
                                                    <button
                                                        onClick={() => handleDownloadInvoice(order.id)}
                                                        disabled={downloading === order.id}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-wait shadow-sm"
                                                    >
                                                        {downloading === order.id ? (
                                                            <Loader2 size={15} className="animate-spin" />
                                                        ) : (
                                                            <Download size={15} />
                                                        )}
                                                        {downloading === order.id ? 'Downloading…' : 'Download Invoice'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default OrderHistory