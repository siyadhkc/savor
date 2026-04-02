import React, { useState, useEffect } from 'react'
import { listOrders } from '../../api/orders'
import { History, Package, Clock, DollarSign, Activity, CheckCircle2, Navigation, UtensilsCrossed } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDate, formatOrderId } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'

const DeliveryHistory = () => {
    const { user } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const orderList = await listOrders()
            // Filter only finalized orders (delivered or cancelled)
            setOrders(orderList.filter(order => order.delivery_status === 'delivered' || order.status === 'cancelled'))
        } catch (error) {
            toast.error('Failed to load history log.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
                <div className="w-12 h-12 border-4 border-white/5 border-t-primary-500 rounded-full animate-spin mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Decrypting historical logs...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 pb-20">
            <Navbar />
            <div className="max-w-4xl mx-auto px-5 pt-32">
                
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-1 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(22,163,74,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-400 italic">Field Agent Log</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Fulfillment <span className="text-primary-500 font-light italic">History</span></h1>
                        <p className="text-white/40 font-medium mt-2 max-w-sm">Review your past logistical deployments and compensation metrics.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {[
                        { label: 'Lifetime Compensation', value: `₹${parseFloat(user?.earnings || 0).toFixed(2)}`, icon: DollarSign, color: 'text-primary-400' },
                        { label: 'Finalized Fulfillments', value: orders.filter(o => o.delivery_status === 'delivered').length, icon: CheckCircle2, color: 'text-emerald-400' }
                    ].map(stat => (
                        <div key={stat.label} className="bg-white/5 border border-white/5 rounded-[28px] p-6 flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                                <stat.icon size={22} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-wider text-white/30">{stat.label}</p>
                                <p className="text-xl font-black text-white">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {orders.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-[40px] p-16 text-center">
                            <History className="mx-auto text-white/10 mb-6" size={48} />
                            <h3 className="text-xl font-black text-white tracking-tight mb-1">Null Archive</h3>
                            <p className="text-white/30 font-bold text-[10px] uppercase tracking-widest">No finalized dispatch logs found.</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <motion.div 
                                layout
                                key={order.id}
                                className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-10 transition-all hover:bg-white/10 hover:border-white/20"
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-8 lg:gap-12">
                                    <div className="flex-1 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span className="bg-white/10 text-white font-black px-4 py-1.5 rounded-2xl text-sm tracking-tight font-mono">#{formatOrderId(order.id)}</span>
                                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'cancelled' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                    {order.status === 'cancelled' ? 'Aborted' : 'Finalized'}
                                                </div>
                                            </div>
                                            {order.delivery_status === 'delivered' && (
                                                <span className="text-primary-400 font-black text-lg tracking-tighter">
                                                    +₹50
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Pickup Node */}
                                            <div className="relative pl-6 border-l border-dashed border-white/10">
                                                <div className="absolute top-0 -left-[5px] w-2.5 h-2.5 rounded-full bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.4)]" />
                                                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Origin Node</h4>
                                                <p className="text-white/70 font-bold leading-tight line-clamp-2">{order.restaurant_name}</p>
                                                <p className="text-white/40 text-[10px] leading-tight line-clamp-2 mt-1">{order.restaurant_address || 'Restaurant Address Terminal'}</p>
                                            </div>

                                            {/* Delivery Node */}
                                            <div className="relative pl-6 border-l border-dashed border-white/10">
                                                <div className="absolute top-0 -left-[5px] w-2.5 h-2.5 rounded-full bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.4)]" />
                                                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Destination Node</h4>
                                                <p className="text-white/70 font-bold leading-tight line-clamp-2">Customer Address</p>
                                                <p className="text-white/40 text-[10px] leading-tight line-clamp-2 mt-1">{order.address}</p>
                                            </div>
                                        </div>

                                        {/* Meta Information */}
                                        <div className="pt-4 flex flex-wrap gap-3">
                                            <div className="px-4 py-2 bg-white/5 rounded-2xl flex items-center gap-2 border border-white/5">
                                                <Clock size={14} className="text-primary-500" />
                                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{formatDate(order.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default DeliveryHistory
