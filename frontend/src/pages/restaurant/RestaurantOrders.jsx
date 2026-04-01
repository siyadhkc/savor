import React, { useState, useEffect, Fragment } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatDate, formatOrderId } from '../../utils/helpers'
import { CheckCircle2, AlertCircle, PackageSearch, ChevronDown, ChevronRight, Package, Calendar, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const STATUS_OPTIONS = [
    'pending', 'preparing',
    'out_for_delivery', 'delivered', 'cancelled'
]

const RestaurantOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')
    const [updatingOrder, setUpdatingOrder] = useState(null)
    const [expandedOrders, setExpandedOrders] = useState([])

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/orders/')
            setOrders(response.data.results)
        } catch (error) {
            console.error('Failed to load orders:', error)
            toast.error('Failed to load orders.')
        } finally {
            setLoading(false)
        }
    }

    const toggleExpand = (orderId) => {
        setExpandedOrders(prev => 
            prev.includes(orderId) 
                ? prev.filter(id => id !== orderId) 
                : [...prev, orderId]
        )
    }

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdatingOrder(orderId)
        try {
            await api.post(`/orders/orders/${orderId}/update_status/`, {
                status: newStatus,
            })
            setOrders(orders.map(order =>
                order.id === orderId
                    ? { ...order, status: newStatus }
                    : order
            ))
            toast.success('Order status updated!')
        } catch (error) {
            console.error('Failed to update status:', error)
            toast.error('Failed to update status.')
        } finally {
            setUpdatingOrder(null)
        }
    }

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus)

    return (
        <div className="flex-1 px-8 py-10 bg-slate-50 min-h-screen">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Store Orders</h1>
            <p className="text-slate-500 font-medium mb-8">Manage and fulfill your incoming requests.</p>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-8 flex-wrap">
                {['all', ...STATUS_OPTIONS].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-5 py-2.5 rounded-full font-bold capitalize transition-all duration-200 text-sm shadow-sm ${
                            filterStatus === status
                                ? 'bg-primary-600 text-white shadow-primary-600/30 ring-2 ring-primary-600 ring-offset-2'
                                : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-slate-200'
                        }`}
                    >
                        {status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-32">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Fetching active orders...</p>
                </div>
            ) : (
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 pl-8"></th>
                                    <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider pr-8">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <Fragment key={order.id}>
                                        <tr className={`border-b border-slate-50 hover:bg-slate-50/50 transition-all group ${expandedOrders.includes(order.id) ? 'bg-slate-50/30' : ''}`}>
                                            <td className="px-6 py-4 pl-8">
                                                <button 
                                                    onClick={() => toggleExpand(order.id)}
                                                    className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                                >
                                                    {expandedOrders.includes(order.id) ? <ChevronDown size={18} className="text-primary-600" /> : <ChevronRight size={18} className="text-slate-400" />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                                    {formatOrderId(order.id)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-slate-800">{order.user_email}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-base font-black text-slate-800">₹{order.total_amount}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                        order.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                        order.status === 'preparing' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                        order.status === 'out_for_delivery' ? 'bg-violet-100 text-violet-700 border border-violet-200' :
                                                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                        order.status === 'cancelled' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {order.status === 'delivered' ? <CheckCircle2 size={12} strokeWidth={3} /> : <AlertCircle size={12} strokeWidth={3} />}
                                                        <span className="capitalize">{order.status.replace(/_/g, ' ')}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 pr-8">
                                                <div className="relative">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                        disabled={updatingOrder === order.id}
                                                        className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 hover:bg-white transition-all capitalize"
                                                    >
                                                        {STATUS_OPTIONS.map(s => (
                                                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                        <ChevronDown size={14} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <AnimatePresence>
                                            {expandedOrders.includes(order.id) && (
                                                <tr>
                                                    <td colSpan="6" className="p-0 border-b border-white">
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden bg-slate-50/50"
                                                        >
                                                            <div className="px-12 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                {/* Order Content */}
                                                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                                                    <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold text-xs uppercase tracking-widest">
                                                                        <Package size={14} className="text-primary-600" />
                                                                        Incoming Order Items
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        {order.items.map((item, idx) => (
                                                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                                                <div className="flex gap-3 items-center">
                                                                                    <span className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-xl text-xs font-bold text-slate-600 border border-slate-100">
                                                                                        {item.quantity}x
                                                                                    </span>
                                                                                    <span className="font-bold text-slate-700">{item.menu_item_name}</span>
                                                                                </div>
                                                                                <span className="font-black text-slate-800">₹{item.total_price}</span>
                                                                            </div>
                                                                        ))}
                                                                        <div className="pt-6 mt-2 border-t border-slate-100 flex justify-between items-center">
                                                                            <span className="font-bold text-slate-400 text-xs uppercase tracking-widest text-[10px]">Total Revenue</span>
                                                                            <span className="text-2xl font-black text-primary-600">₹{order.total_amount}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Delivery Details */}
                                                                <div className="space-y-4">
                                                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                                                        <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold text-xs uppercase tracking-widest">
                                                                            <Calendar size={14} className="text-primary-600" />
                                                                            Logistics
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            <div className="flex justify-between items-start group">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Calendar size={14} className="text-slate-300" />
                                                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Placed At</span>
                                                                                </div>
                                                                                <span className="text-sm font-bold text-slate-700">{formatDate(order.created_at)}</span>
                                                                            </div>
                                                                            <div className="flex flex-col gap-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <MapPin size={14} className="text-slate-300" />
                                                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Delivery Address</span>
                                                                                </div>
                                                                                <span className="text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                                                                                    {order.address}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                        {filteredOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                                    <PackageSearch className="text-slate-300" size={32} />
                                </div>
                                <p className="text-slate-500 text-lg font-bold">No orders found</p>
                                <p className="text-slate-400 text-sm mt-1">Check back later for new incoming requests.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default RestaurantOrders
