import { useState, useEffect } from 'react'
import api from '../../api/axios'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie,
    Cell, Legend
} from 'recharts'
import { formatOrderId } from '../../utils/helpers'
import { Package, IndianRupee, TrendingUp, Activity, CheckCircle2, ArrowUpRight, Store, Clock, UtensilsCrossed } from 'lucide-react'
import { motion } from 'framer-motion'

const STATUS_COLORS = {
    pending: '#f59e0b',       // amber-500
    preparing: '#0ea5e9',     // sky-500
    out_for_delivery: '#8b5cf6', // violet-500
    delivered: '#10b981',     // emerald-500
    cancelled: '#ef4444',     // red-500
}

const RestaurantDashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
        ordersByStatus: [],
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const response = await api.get('/orders/orders/')
            const orders = response.data.results

            const totalRevenue = orders
                .filter(o => o.status === 'delivered')
                .reduce((sum, o) => sum + parseFloat(o.total_amount), 0)

            const statusCounts = orders.reduce((acc, order) => {
                acc[order.status] = (acc[order.status] || 0) + 1
                return acc
            }, {})

            const ordersByStatus = Object.entries(statusCounts).map(
                ([status, count]) => ({ status, count })
            )

            setStats({
                totalOrders: response.data.count,
                totalRevenue: totalRevenue.toFixed(2),
                recentOrders: orders.slice(0, 8),
                ordersByStatus,
            })
        } catch (error) {
            console.error('Failed to load stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        {
            label: 'Store Revenue',
            value: `₹${parseFloat(stats.totalRevenue).toLocaleString()}`,
            icon: IndianRupee,
            colorClass: 'text-primary-600',
            bgClass: 'bg-primary-50/50',
            borderColor: 'border-primary-100/50',
            trend: '+12.5%'
        },
        {
            label: 'Total Fulfillments',
            value: stats.totalOrders.toLocaleString(),
            icon: Package,
            colorClass: 'text-sky-600',
            bgClass: 'bg-sky-50/50',
            borderColor: 'border-sky-100/50',
            trend: '+5.2%'
        }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing store metrics...</p>
            </div>
        )
    }

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex-1 px-5 md:px-10 py-10 bg-slate-50/50 overflow-y-auto relative"
        >
            {/* Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/5 blur-[120px] rounded-full -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[100px] rounded-full -ml-32 -mb-32" />
            </div>

            <div className="relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-600">Partner Core Active</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Kitchen <span className="text-primary-600 font-light italic">Intelligence</span></h1>
                        <p className="text-slate-500 font-medium mt-2 max-w-md">Optimize your culinary operations with real-time performance tracking.</p>
                    </div>
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <Clock size={16} className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Shift Started: 08:30 AM</span>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {statCards.map((card, idx) => (
                        <motion.div 
                            key={idx} 
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className={`bg-white rounded-[32px] p-8 border ${card.borderColor} shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight size={24} className="text-slate-200" />
                            </div>
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${card.bgClass} ${card.colorClass} shadow-inner`}>
                                    <card.icon size={32} strokeWidth={2.5} />
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100/50">
                                        <TrendingUp size={12} strokeWidth={3} />
                                        {card.trend}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 leading-none">{card.label}</p>
                                <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                                    {card.value}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Analytical Rows */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 mb-10">
                    {/* Performance Chart */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Velocity</h2>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 italic">Real-time throughput baseline</p>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                                <Activity size={16} className="text-primary-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Intake</span>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.ordersByStatus} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <defs>
                                        {Object.entries(STATUS_COLORS).map(([status, color]) => (
                                            <linearGradient key={status} id={`rest-grad-${status}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
                                                <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="status" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900, textTransform: 'uppercase'}} 
                                        dy={15}
                                        tickFormatter={v => v.replace(/_/g, ' ')}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px'}}
                                        itemStyle={{fontWeight: 900, fontSize: '12px', textTransform: 'uppercase'}}
                                    />
                                    <Bar
                                        dataKey="count"
                                        radius={[12, 12, 4, 4]}
                                        barSize={50}
                                    >
                                        {stats.ordersByStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`url(#rest-grad-${entry.status})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Status Distribution */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 shadow-sm flex flex-col items-center">
                        <div className="w-full mb-8">
                             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Status Saturation</h2>
                             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 italic">Lifecycle distribution</p>
                        </div>
                        <div className="flex-1 w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.ordersByStatus}
                                        dataKey="count"
                                        nameKey="status"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        stroke="none"
                                    >
                                        {stats.ordersByStatus.map((entry, index) => (
                                            <Cell key={index} fill={STATUS_COLORS[entry.status] || '#cbd5e1'} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px'}}
                                    />
                                    <Legend 
                                        iconType="circle" 
                                        wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em'}} 
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Store Log Table */}
                <motion.div variants={itemVariants} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-12">
                    <div className="px-8 py-8 border-b border-slate-50 flex justify-between items-center bg-white">
                        <div>
                             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Intake Sequence</h2>
                             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1 italic">Active production queue</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {stats.recentOrders.length} Entries in Queue
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">Identity Tag</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">Consumer</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 text-right">Gross Amount</th>
                                    <th className="px-8 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 text-center">Lifecycle Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-8 py-6 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-500 flex items-center justify-center">
                                                    <UtensilsCrossed size={14} strokeWidth={3} />
                                                </div>
                                                <span className="font-mono text-sm font-black text-slate-900 bg-slate-900/5 px-2.5 py-1 rounded-lg">
                                                    #{formatOrderId(order.id)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 border-b border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1.5">{order.user_email}</span>
                                                <p className="text-[10px] font-bold text-slate-400 italic">Confirmed Protocol</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 border-b border-slate-50 text-right">
                                            <span className="text-lg font-black text-slate-900 tracking-tighter">₹{order.total_amount}</span>
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5 leading-none">INR Valuation</p>
                                        </td>
                                        <td className="px-8 py-6 border-b border-slate-50">
                                            <div className="flex justify-center">
                                                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100/50' :
                                                    order.status === 'preparing' ? 'bg-sky-50 text-sky-600 border-sky-100/50' :
                                                    order.status === 'out_for_delivery' ? 'bg-violet-50 text-violet-600 border-violet-100/50' :
                                                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                                                    order.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100/50' :
                                                    'bg-slate-50 text-slate-600 border-slate-100'
                                                }`}>
                                                    {order.status === 'delivered' ? <CheckCircle2 size={12} strokeWidth={3} /> : <Activity size={12} strokeWidth={3} />}
                                                    {order.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}

export default RestaurantDashboard
