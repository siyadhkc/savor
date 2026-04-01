import React, { useState, useEffect, Fragment } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatDate, formatOrderId } from '../../utils/helpers'
import { ChevronDown, ChevronRight, Package, User, Store, Calendar, CreditCard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const STATUS_OPTIONS = [
    'pending', 'preparing',
    'out_for_delivery', 'delivered', 'cancelled'
]

const AdminOrders = () => {
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
            console.error('Failed to load admin orders:', error)
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
        <div className="flex-1 p-8 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Order Management</h1>
                    <p className="text-slate-500 font-medium mt-1">Oversee all platform transactions and logistics.</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-8 flex-wrap overflow-x-auto pb-2 custom-scrollbar">
                {['all', ...STATUS_OPTIONS].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-6 py-2.5 rounded-full font-bold capitalize transition-all duration-300 text-sm whitespace-nowrap ${
                            filterStatus === status
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        {status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading orders...</p>
                </div>
            ) : (
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="px-6 py-5 pl-8"></th>
                                    <th className="px-6 py-5 text-slate-400 font-bold text-xs uppercase tracking-widest">Order ID</th>
                                    <th className="px-6 py-5 text-slate-400 font-bold text-xs uppercase tracking-widest">Customer</th>
                                    <th className="px-6 py-5 text-slate-400 font-bold text-xs uppercase tracking-widest">Restaurant</th>
                                    <th className="px-6 py-5 text-slate-400 font-bold text-xs uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-5 text-slate-400 font-bold text-xs uppercase tracking-widest">Total</th>
                                    <th className="px-6 py-5 text-slate-400 font-bold text-xs uppercase tracking-widest text-right pr-8">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <Fragment key={order.id}>
                                        <tr className={`hover:bg-slate-50/50 transition-colors border-b border-slate-50 relative ${expandedOrders.includes(order.id) ? 'bg-slate-50/30' : ''}`}>
                                            <td className="px-6 py-5 pl-8">
                                                <button 
                                                    onClick={() => toggleExpand(order.id)}
                                                    className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                                >
                                                    {expandedOrders.includes(order.id) ? <ChevronDown size={18} className="text-primary-600" /> : <ChevronRight size={18} className="text-slate-400" />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-mono text-sm font-bold text-slate-700">#{formatOrderId(order.id)}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800">{order.user_email.split('@')[0]}</span>
                                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{order.user_email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-semibold text-slate-600">{order.restaurant_name}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                                    order.status === 'preparing' ? 'bg-blue-100 text-blue-600' :
                                                    order.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-600' :
                                                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                                                    order.status === 'cancelled' ? 'bg-rose-100 text-rose-600' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 font-black text-slate-800">
                                                ₹{order.total_amount}
                                            </td>
                                            <td className="px-6 py-5 pr-8 text-right">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                    disabled={updatingOrder === order.id}
                                                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                                >
                                                    {STATUS_OPTIONS.map(s => (
                                                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                        <AnimatePresence>
                                            {expandedOrders.includes(order.id) && (
                                                <tr>
                                                    <td colSpan="7" className="p-0 border-b border-white">
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden bg-slate-50/50"
                                                        >
                                                            <div className="px-12 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                {/* Order Items */}
                                                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                                                    <div className="flex items-center gap-2 mb-4 text-slate-800 font-black text-xs uppercase tracking-widest">
                                                                        <Package size={14} className="text-primary-600" />
                                                                        Ordered Formulation
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        {order.items.map((item, idx) => (
                                                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                                                <div className="flex gap-3 items-center">
                                                                                    <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-md text-[10px] font-bold text-slate-500">
                                                                                        {item.quantity}x
                                                                                    </span>
                                                                                    <span className="font-bold text-slate-700">{item.menu_item_name}</span>
                                                                                </div>
                                                                                <span className="font-black text-slate-800">₹{item.total_price}</span>
                                                                            </div>
                                                                        ))}
                                                                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                                                            <span className="font-black text-slate-400 text-xs uppercase tracking-widest">Final Amount</span>
                                                                            <span className="text-xl font-black text-primary-600">₹{order.total_amount}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Logistical Details */}
                                                                <div className="space-y-4">
                                                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                                                        <div className="flex items-center gap-2 mb-4 text-slate-800 font-black text-xs uppercase tracking-widest">
                                                                            <Calendar size={14} className="text-primary-600" />
                                                                            Meta Details
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            <div className="flex justify-between items-start">
                                                                                <span className="text-xs font-bold text-slate-400">Timestamp</span>
                                                                                <span className="text-sm font-bold text-slate-700 text-right">{formatDate(order.created_at)}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-start">
                                                                                <span className="text-xs font-bold text-slate-400">Destination</span>
                                                                                <span className="text-sm font-bold text-slate-700 text-right max-w-[200px]">{order.address}</span>
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
                                <p className="text-slate-500 font-bold">No orders found.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminOrders