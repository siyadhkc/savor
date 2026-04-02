import { useState, useEffect } from 'react'
import api from '../../api/axios'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie,
    Cell, Legend
} from 'recharts'
import { formatOrderId } from '../../utils/helpers'
import { Package, IndianRupee, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

const STATUS_COLORS = {
    pending: '#f59e0b',       // amber-500
    preparing: '#3b82f6',     // blue-500
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
            const [ordersRes] = await Promise.all([
                api.get('/orders/orders/')
            ])

            const orders = ordersRes.data.results

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
                totalOrders: ordersRes.data.count,
                totalRevenue: totalRevenue.toFixed(2),
                recentOrders: orders.slice(0, 7),
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
            label: 'Total Revenue',
            value: `₹${stats.totalRevenue}`,
            icon: IndianRupee,
            colorClass: 'text-primary-600',
            bgClass: 'bg-primary-50',
            trend: '+12.5%'
        },
        {
            label: 'Total Orders',
            value: stats.totalOrders,
            icon: Package,
            colorClass: 'text-blue-600',
            bgClass: 'bg-blue-50',
            trend: '+5.2%'
        }
    ]

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    }

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex-1 px-4 md:px-8 py-6 md:py-10 bg-slate-50 overflow-y-auto"
        >
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Store Overview</h1>
                    <p className="text-slate-500 font-medium mt-1">Monitor your restaurant performance in real-time.</p>
                </div>
                <div className="flex items-center self-start md:self-auto gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-semibold text-slate-600">Live Updating</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 md:p-32">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Crunching the numbers...</p>
                </div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
                        {statCards.map((card, idx) => {
                            const Icon = card.icon;
                            return (
                                <motion.div 
                                    key={idx} 
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                    className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center ${card.bgClass} ${card.colorClass} group-hover:rotate-6 transition-transform duration-300`}>
                                            <Icon size={24} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                            <TrendingUp size={14} />
                                            {card.trend}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-1">
                                            {card.value}
                                        </h3>
                                        <p className="text-slate-500 font-medium text-sm">
                                            {card.label}
                                        </p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
                        {/* Bar Chart — Orders by Status */}
                        <motion.div variants={itemVariants} className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm overflow-hidden">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Orders Pipeline</h2>
                            <div className="h-[250px] md:h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.ordersByStatus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                                        <Tooltip 
                                            cursor={{fill: '#f8fafc'}}
                                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                                        />
                                        <Bar
                                            dataKey="count"
                                            radius={[6, 6, 0, 0]}
                                        >
                                            {stats.ordersByStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Pie Chart — Status Distribution */}
                        <motion.div variants={itemVariants} className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm flex flex-col">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Distribution</h2>
                            <div className="flex-1 min-h-[250px] md:min-h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.ordersByStatus}
                                            dataKey="count"
                                            nameKey="status"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            stroke="none"
                                        >
                                            {stats.ordersByStatus.map((entry, index) => (
                                                <Cell key={index} fill={STATUS_COLORS[entry.status] || '#cbd5e1'} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    {/* Recent Orders Table */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden mb-10">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Recent Orders</h2>
                        </div>
                        <div className="table-responsive">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-slate-500 font-semibold text-sm border-b border-slate-100">Order ID</th>
                                        <th className="px-6 py-4 text-slate-500 font-semibold text-sm border-b border-slate-100">Customer</th>
                                        <th className="px-6 py-4 text-slate-500 font-semibold text-sm border-b border-slate-100 text-right">Amount</th>
                                        <th className="px-6 py-4 text-slate-500 font-semibold text-sm border-b border-slate-100 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 border-b border-slate-50">
                                                <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                                    {formatOrderId(order.id)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-50 text-slate-600 font-medium text-sm">
                                                {order.user_email}
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-50 text-slate-800 font-bold text-sm text-right">
                                                ₹{order.total_amount}
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-50">
                                                <div className="flex justify-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'out_for_delivery' ? 'bg-violet-100 text-violet-700' :
                                                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                        order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {order.status === 'delivered' ? <CheckCircle2 size={12} strokeWidth={3} /> : <AlertCircle size={12} strokeWidth={3} />}
                                                        <span className="capitalize">{order.status.replace(/_/g, ' ')}</span>
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </>
            )}
        </motion.div>
    )
}

export default RestaurantDashboard

