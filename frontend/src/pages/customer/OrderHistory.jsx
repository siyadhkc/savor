import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { downloadInvoice, listOrders } from '../../api/orders'
import { formatOrderId, formatDate } from '../../utils/helpers'
import { getCustomerStatusCopy, getCustomerTimeline } from '../../utils/orderFlow'
import {
    Clock, 
    ChefHat, 
    Truck, 
    CheckCircle2, 
    XCircle,
    ShoppingBag, 
    ChevronDown, 
    MapPin, 
    Download,
    ReceiptText, 
    Package, 
    ArrowLeft, 
    Loader2,
    Activity,
    ArrowUpRight,
    Search
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import LiveTracking from './LiveTracking'

const STATUS_CONFIG = {
    pending: {
        icon: Clock,
        bg: 'bg-amber-50',
        border: 'border-amber-100/50',
        text: 'text-amber-600',
        dot: 'bg-amber-500',
        label: 'Order placed',
    },
    preparing: {
        icon: ChefHat,
        bg: 'bg-blue-50',
        border: 'border-blue-100/50',
        text: 'text-blue-600',
        dot: 'bg-blue-500',
        label: 'Preparing',
    },
    out_for_delivery: {
        icon: Truck,
        bg: 'bg-violet-50',
        border: 'border-violet-100/50',
        text: 'text-violet-600',
        dot: 'bg-violet-500',
        label: 'On the way',
    },
    delivered: {
        icon: CheckCircle2,
        bg: 'bg-emerald-50',
        border: 'border-emerald-100/50',
        text: 'text-emerald-600',
        dot: 'bg-emerald-500',
        label: 'Delivered',
    },
    cancelled: {
        icon: XCircle,
        bg: 'bg-rose-50',
        border: 'border-rose-100/50',
        text: 'text-rose-600',
        dot: 'bg-rose-500',
        label: 'Cancelled',
    },
}

const OrderHistory = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedOrder, setExpandedOrder] = useState(null)
    const [downloading, setDownloading] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        fetchOrders()
        if (location.state?.newOrderId) {
            setExpandedOrder(location.state.newOrderId)
        }
    }, [location.state?.newOrderId])

    const fetchOrders = async () => {
        try {
            const orderList = await listOrders()
            setOrders(orderList)
        } catch {
            toast.error('Failed to sync transactional manifest.')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadInvoice = async (orderId) => {
        setDownloading(orderId)
        try {
            const response = await downloadInvoice(orderId)
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.body.appendChild(document.createElement('a'))
            link.href = url
            link.download = `SVR_INV_${orderId}.pdf`
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            toast.success('Document exported.')
        } catch {
            toast.error('Export failed.')
        } finally {
            setDownloading(null)
        }
    }

    const filteredOrders = orders.filter(o => 
        formatOrderId(o.id).toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white min-h-screen">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Transactional history...</p>
            </div>
        )
    }

    return (
        <div className="flex-1 px-5 md:px-10 py-10 bg-slate-50/50 min-h-screen relative overflow-y-auto pt-24 md:pt-32">
            {/* Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] rounded-full -ml-24" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-slate-400 hover:text-primary-600 font-black text-[10px] uppercase tracking-widest mb-4 transition-all group"
                        >
                            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
                            Exit to Discovery
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Financial Transaction Log</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Your <span className="text-primary-600 font-light italic">Orders</span></h1>
                        <p className="text-slate-500 font-medium mt-2">Track every order, rider update, and invoice from one place.</p>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                        <input 
                            type="text"
                            placeholder="Filter by Order ID…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all w-full sm:w-[280px] shadow-sm"
                        />
                    </div>
                </div>

                {/* Orders List */}
                <div className="flex flex-col gap-6">
                    {filteredOrders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-24 text-center"
                        >
                            <div className="w-24 h-24 mx-auto bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-center mb-8">
                                <ShoppingBag size={48} className="text-slate-100" strokeWidth={1} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No orders yet</h2>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-10">Place your first order to start tracking it here.</p>
                            <button
                                onClick={() => navigate('/restaurants')}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-[20px] hover:bg-primary-600 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                            >
                                Initiate Discovery
                                <ArrowUpRight size={16} strokeWidth={3} />
                            </button>
                        </motion.div>
                    ) : (
                        filteredOrders.map((order, idx) => {
                            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                            const StatusIcon = status.icon
                            const isExpanded = expandedOrder === order.id
                            const isNew = location.state?.newOrderId === order.id
                            const timeline = getCustomerTimeline(order)

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`bg-white rounded-[40px] border shadow-sm overflow-hidden group transition-all duration-500 ${
                                        isNew ? 'border-primary-400/30 bg-primary-50/20 shadow-primary-500/5' : 'border-slate-100 hover:border-primary-500/20 hover:shadow-xl hover:shadow-slate-200/50'
                                    }`}
                                >
                                    {/* Order Header */}
                                    <button
                                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                        className="w-full flex flex-col md:flex-row md:items-center justify-between p-8 text-left relative"
                                    >
                                        <div className="flex items-center gap-6 min-w-0">
                                            <div className={`w-14 h-14 rounded-2xl ${status.bg} ${status.border} border flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110`}>
                                                <StatusIcon size={24} className={status.text} strokeWidth={2.5} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID:</span>
                                                    <span className="text-base font-black text-slate-900 tracking-tighter">{formatOrderId(order.id)}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                    {formatDate(order.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-10 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-slate-50">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${status.bg} ${status.text} ${status.border}`}>
                                                    <div className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
                                                    {getCustomerStatusCopy(order)}
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Total paid</span>
                                                    <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">₹{order.total_amount}</span>
                                                </div>
                                            </div>
                                            <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 transition-all duration-300 ${isExpanded ? 'rotate-180 bg-slate-900 text-white shadow-lg' : ''}`}>
                                                <ChevronDown size={20} strokeWidth={3} />
                                            </div>
                                        </div>
                                    </button>

                                    {/* Expandable Content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-slate-50/50"
                                            >
                                                <div className="p-10 pt-0 border-t border-slate-50">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
                                                        {/* Items Section */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-6">
                                                                <Package size={14} className="text-primary-500" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items in this order</span>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {order.items.map(item => (
                                                                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200/50 flex justify-between items-center shadow-sm">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                                            <span className="text-sm font-black text-slate-800">{item.menu_item_name}</span>
                                                                            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">×{item.quantity}</span>
                                                                        </div>
                                                                        <span className="text-sm font-black text-slate-900 tracking-tight">₹{item.total_price}</span>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Tracking Section */}
                                                            {order.delivery_agent && !['delivered', 'cancelled'].includes(order.status) && (
                                                                <div className="mt-10">
                                                                    <div className="flex items-center gap-2 mb-6">
                                                                        <Activity size={14} className="text-emerald-500" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live tracking</span>
                                                                    </div>
                                                                    <LiveTracking orderId={order.id} />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Metadata Section */}
                                                        <div className="space-y-8">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-4">
                                                                    <MapPin size={14} className="text-rose-500" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Delivery address</span>
                                                                </div>
                                                                <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm italic text-sm font-bold text-slate-600 leading-relaxed">
                                                                    {order.address}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div className="flex items-center gap-2 mb-4">
                                                                    <Truck size={14} className="text-primary-500" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order progress</span>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    {timeline.map((step, index) => {
                                                                        const isComplete = step.state === 'complete'
                                                                        const isCurrent = step.state === 'current'

                                                                        return (
                                                                            <div
                                                                                key={step.key}
                                                                                className={`rounded-3xl border px-5 py-4 ${
                                                                                    isCurrent
                                                                                        ? 'border-primary-200 bg-primary-50'
                                                                                        : isComplete
                                                                                            ? 'border-emerald-200 bg-emerald-50'
                                                                                            : 'border-slate-200 bg-white'
                                                                                }`}
                                                                            >
                                                                                <div className="flex items-start gap-4">
                                                                                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                                                                                        isCurrent
                                                                                            ? 'bg-primary-600 text-white'
                                                                                            : isComplete
                                                                                                ? 'bg-emerald-600 text-white'
                                                                                                : 'bg-slate-100 text-slate-500'
                                                                                    }`}>
                                                                                        {index + 1}
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-sm font-black text-slate-900">{step.title}</p>
                                                                                        <p className="mt-1 text-xs font-medium text-slate-500">{step.description}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {order.delivery_agent_name && (
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-4">
                                                                        <Truck size={14} className="text-violet-500" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your delivery partner</span>
                                                                    </div>
                                                                    <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm">
                                                                        <p className="text-sm font-black text-slate-900">{order.delivery_agent_name}</p>
                                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                                                                            {getCustomerStatusCopy(order)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="flex gap-4">
                                                                <button
                                                                    onClick={() => handleDownloadInvoice(order.id)}
                                                                    disabled={downloading === order.id}
                                                                    className="flex-1 bg-slate-900 text-white py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                                                                >
                                                                    {downloading === order.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} strokeWidth={3} />}
                                                                    {downloading === order.id ? 'Exporting…' : 'Export Invoice'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

export default OrderHistory
