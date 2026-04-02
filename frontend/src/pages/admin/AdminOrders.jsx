import React, { useState, useEffect, Fragment } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatDate, formatOrderId } from '../../utils/helpers'
import { ChevronDown, Package, Store, Calendar, CreditCard, Activity, Search, Filter, ArrowUpRight, CheckCircle2, Clock, Truck, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const STATUS_OPTIONS = [
    'pending', 'preparing',
    'out_for_delivery', 'delivered', 'cancelled'
]

const STATUS_METADATA = {
    pending: { color: 'amber', icon: Clock },
    preparing: { color: 'sky', icon: Activity },
    out_for_delivery: { color: 'violet', icon: Truck },
    delivered: { color: 'emerald', icon: CheckCircle2 },
    cancelled: { color: 'rose', icon: XCircle },
}

const AdminOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')
    const [updatingOrder, setUpdatingOrder] = useState(null)
    const [expandedOrders, setExpandedOrders] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

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
            toast.success('Protocol updated.')
        } catch (error) {
            console.error('Failed to update status:', error)
            toast.error('Update failed.')
        } finally {
            setUpdatingOrder(null)
        }
    }

    const filteredOrders = orders.filter(o => {
        const matchesStatus = filterStatus === 'all' || o.status === filterStatus
        const matchesSearch = o.user_email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              o.id.toString().includes(searchQuery) ||
                              o.restaurant_name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing logistical pipeline...</p>
            </div>
        )
    }

    return (
        <div className="flex-1 px-5 md:px-10 py-10 bg-slate-50/50 min-h-screen relative overflow-y-auto">
            {/* Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/5 blur-[100px] rounded-full -mr-32 -mt-32" />
            </div>

            <div className="relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Global Logistics Management</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Order <span className="text-primary-600 font-light italic">Manifest</span></h1>
                        <p className="text-slate-500 font-medium mt-2">Oversee all platform transactions and real-time fulfillments.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by ID, User, or Venue..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-[20px] text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all w-full sm:w-[320px] shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs / Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                    <div className="flex gap-2.5 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
                        {['all', ...STATUS_OPTIONS].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-5 py-2.5 rounded-full font-black capitalize transition-all duration-300 text-[10px] uppercase tracking-widest border whitespace-nowrap ${
                                    filterStatus === status
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20'
                                        : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
                                }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest bg-white/50 px-4 py-2 rounded-xl border border-slate-100">
                        <Filter size={14} /> 
                        <span>Displaying {filteredOrders.length} Entries</span>
                    </div>
                </div>

                {/* The Manifest Table */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-12">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 w-10"></th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">Identity Tag</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">Establishment</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">Consumer</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 text-center">Lifecycle Status</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 text-right">Investment</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 text-right pr-12">Authorization</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => {
                                    const meta = STATUS_METADATA[order.status] || { color: 'slate', icon: Activity }
                                    const StatusIcon = meta.icon;
                                    
                                    return (
                                    <Fragment key={order.id}>
                                        <tr className={`hover:bg-slate-50/80 transition-colors border-b border-slate-50 group tracking-tight ${expandedOrders.includes(order.id) ? 'bg-slate-50/50' : ''}`}>
                                            <td className="px-8 py-4">
                                                <button 
                                                    onClick={() => toggleExpand(order.id)}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${expandedOrders.includes(order.id) ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 rotate-180' : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                                >
                                                    <ChevronDown size={18} />
                                                </button>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm font-black text-slate-900 bg-slate-900/5 px-2.5 py-1 rounded-lg">
                                                        #{formatOrderId(order.id)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-500 flex items-center justify-center">
                                                        <Store size={14} strokeWidth={3} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{order.restaurant_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{order.user_email.split('@')[0]}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 italic">{order.user_email}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex justify-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                        order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100/50' :
                                                        order.status === 'preparing' ? 'bg-sky-50 text-sky-600 border-sky-100/50' :
                                                        order.status === 'out_for_delivery' ? 'bg-violet-50 text-violet-600 border-violet-100/50' :
                                                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                                                        order.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100/50' :
                                                        'bg-slate-50 text-slate-600 border-slate-100'
                                                    }`}>
                                                        <StatusIcon size={12} strokeWidth={3} />
                                                        {order.status.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <span className="text-lg font-black text-slate-900 tracking-tighter leading-none">₹{order.total_amount}</span>
                                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">INR Value</p>
                                            </td>
                                            <td className="px-8 py-4 pr-12 text-right">
                                                <div className="relative inline-flex items-center">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                        disabled={updatingOrder === order.id}
                                                        className="pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest text-slate-800 cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none shadow-sm hover:shadow-md"
                                                    >
                                                        {STATUS_OPTIONS.map(s => (
                                                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-3 pointer-events-none text-slate-400" strokeWidth={3} />
                                                </div>
                                            </td>
                                        </tr>
                                        <AnimatePresence>
                                            {expandedOrders.includes(order.id) && (
                                                <tr>
                                                    <td colSpan="7" className="p-0 border-b border-transparent">
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden bg-slate-50/80 backdrop-blur-sm"
                                                        >
                                                            <div className="px-16 py-12 grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-12">
                                                                {/* Order Specifics */}
                                                                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col">
                                                                    <div className="flex items-center justify-between mb-8">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                                                                                <Package size={20} />
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Manifest Details</h4>
                                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Formulation</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="px-4 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                            {order.items.length} Distinct Items
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-4 mb-8">
                                                                        {order.items.map((item, idx) => (
                                                                            <div key={idx} className="flex justify-between items-center group/item hover:translate-x-1 transition-transform duration-300">
                                                                                <div className="flex gap-4 items-center">
                                                                                    <div className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-xs font-black text-slate-400 border border-slate-100/50">
                                                                                        {item.quantity}×
                                                                                    </div>
                                                                                    <div className="flex flex-col">
                                                                                        <span className="text-sm font-black text-slate-800 leading-none mb-1">{item.menu_item_name}</span>
                                                                                        <span className="text-[10px] font-bold text-primary-500/60 uppercase tracking-widest italic">Unit Content</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <span className="text-sm font-black text-slate-900">₹{item.total_price}</span>
                                                                                    <p className="text-[9px] font-bold text-slate-300 leading-none mt-1">Item Yield</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-end">
                                                                        <div>
                                                                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Secured Investment</p>
                                                                             <div className="flex items-center gap-3">
                                                                                <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">₹{order.total_amount}</span>
                                                                                <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase tracking-widest">Gross</div>
                                                                             </div>
                                                                        </div>
                                                                        <button className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:gap-3 transition-all underline underline-offset-8">
                                                                            Generate Invoice <ArrowUpRight size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Logistics Intelligence */}
                                                                <div className="space-y-6 flex flex-col justify-between">
                                                                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                                                                        <div className="flex items-center gap-3 mb-8">
                                                                            <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                                                                                <Calendar size={20} />
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Temporal Data</h4>
                                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Encryption Timestamp</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-6">
                                                                            <div className="flex justify-between items-start">
                                                                                <div className="flex flex-col">
                                                                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Clock size={12} className="text-primary-500" /> Authorized On</span>
                                                                                    <span className="text-sm font-bold text-slate-700">{formatDate(order.created_at)}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-col pt-4 border-t border-slate-50">
                                                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={12} className="text-primary-500" /> Payment Linkage</span>
                                                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                                                                    <CreditCard size={18} className="text-slate-400" />
                                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Encrypted Gateway Token</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-slate-900 rounded-[32px] p-8 shadow-xl shadow-slate-900/10 text-white flex flex-col">
                                                                        <div className="flex items-center gap-3 mb-4">
                                                                            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-primary-400">
                                                                                <Truck size={16} />
                                                                            </div>
                                                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Delivery Protocol</span>
                                                                        </div>
                                                                        <h4 className="text-lg font-black tracking-tight mb-2">Primary Destination</h4>
                                                                        <p className="text-sm font-medium text-white/70 leading-relaxed italic border-l-2 border-primary-500/50 pl-4">
                                                                             {order.address}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </Fragment>
                                )})}
                            </tbody>
                        </table>
                        {filteredOrders.length === 0 && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-32 bg-white"
                            >
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                                     <XCircle size={48} strokeWidth={1} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">Null Resolution</h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No order entities found matching criteria.</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminOrders