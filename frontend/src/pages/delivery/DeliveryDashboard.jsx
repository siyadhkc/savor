import React, { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { listOrders, updateDeliveryLocation } from '../../api/orders'
import { MapPin, Truck, CheckCircle2, Navigation, Package, Clock, ShieldCheck, Map, ArrowRight, DollarSign, Activity, ExternalLink, Power, LogOut, User, History } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDate, formatOrderId } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { getDeliveryAgentStatusLabel } from '../../utils/orderFlow'

const DeliveryDashboard = () => {
    const { user, fetchUser, logout } = useAuth()
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [trackingOrderId, setTrackingOrderId] = useState(null)
    const [isAvailable, setIsAvailable] = useState(user?.is_available ?? true)
    const watchId = useRef(null)
    const lastLocationSyncAt = useRef(0)

    useEffect(() => {
        fetchAssignedOrders()
        const interval = setInterval(fetchAssignedOrders, 15000)

        return () => {
            clearInterval(interval)
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current)
        }
    }, [])

    const fetchAssignedOrders = async () => {
        try {
            const orderList = await listOrders()
            setOrders(orderList.filter(order => order.delivery_status !== 'delivered' && order.status !== 'delivered'))
        } catch (error) {
            toast.error('Failed to load assigned deliveries.')
        } finally {
            setLoading(false)
        }
    }

    const startTracking = (orderId) => {
        if (trackingOrderId) {
            toast.error('You are already tracking another delivery.')
            return
        }

        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your device.')
            return
        }

        setTrackingOrderId(orderId)
        toast.success('Live delivery tracking started.')

        watchId.current = navigator.geolocation.watchPosition(
            async (position) => {
                const now = Date.now()
                if (now - lastLocationSyncAt.current < 5000) {
                    return
                }

                lastLocationSyncAt.current = now
                const { latitude, longitude } = position.coords
                try {
                    await updateDeliveryLocation(orderId, {
                        delivery_lat: latitude,
                        delivery_lng: longitude,
                        delivery_status: 'delivering'
                    })
                } catch (err) {
                    console.error('GPS Sync failed:', err)
                }
            },
            (err) => {
                console.error('Geolocation error:', err)
                if (watchId.current) {
                    navigator.geolocation.clearWatch(watchId.current)
                    watchId.current = null
                }
                toast.error('Location access was interrupted.')
                setTrackingOrderId(null)
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000
            }
        )
    }

    const stopTracking = (showToast = true) => {
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current)
            watchId.current = null
        }
        lastLocationSyncAt.current = 0
        setTrackingOrderId(null)
        if (showToast) {
            toast.success('Live tracking stopped.')
        }
    }

    const toggleAvailability = async () => {
        const nextState = !isAvailable
        setIsAvailable(nextState)
        try {
            await api.patch('/users/profile/', { is_available: nextState })
            toast.success(`Availability updated: ${nextState ? 'ONLINE' : 'OFFLINE'}`)
            fetchUser()
        } catch (err) {
            setIsAvailable(!nextState)
            toast.error('Failed to update availability status.')
        }
    }

    const updateStatus = async (orderId, status) => {
        try {
            await updateDeliveryLocation(orderId, {
                delivery_status: status
            })
            
            if (status === 'delivered') {
                stopTracking(false)
                setOrders(orders.filter(o => o.id !== orderId))
                toast.success('Delivery completed. Earnings updated.')
                fetchUser()
            } else {
                setOrders(orders.map(o => o.id === orderId ? { ...o, delivery_status: status } : o))
                toast.success(getDeliveryAgentStatusLabel(status))
            }
        } catch (error) {
            toast.error('Delivery update failed.')
        }
    }

    const handleSignOut = async () => {
        await logout()
        toast.success('Agent session terminated.')
        navigate('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
                <div className="w-12 h-12 border-4 border-white/5 border-t-primary-500 rounded-full animate-spin mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Loading your delivery queue...</p>
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
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-400 italic">Delivery partner app</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Your <span className="text-primary-500 font-light italic">Deliveries</span></h1>
                        <p className="text-white/40 font-medium mt-2 max-w-sm">Accept orders, confirm pickup, and share live location while you deliver.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleAvailability}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${isAvailable ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}
                        >
                            <Power size={14} />
                            {isAvailable ? 'Status: ONLINE' : 'Status: OFFLINE'}
                        </button>

                        <button 
                            onClick={() => navigate('/delivery/history')}
                            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-primary-400 hover:bg-primary-500/10 hover:border-primary-500/20 transition-all active:scale-95 group"
                            title="Fulfillment History"
                        >
                            <History size={18} className="group-hover:scale-110 transition-transform" />
                        </button>

                        <button 
                            onClick={() => navigate('/delivery/profile')}
                            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-primary-400 hover:bg-primary-500/10 hover:border-primary-500/20 transition-all active:scale-95 group"
                            title="Carrier Profile"
                        >
                            <User size={18} className="group-hover:scale-110 transition-transform" />
                        </button>

                        <button 
                            onClick={handleSignOut}
                            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all active:scale-95 group"
                            title="Sign Out"
                        >
                            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    {[
                        { label: 'Total earnings', value: `₹${parseFloat(user?.earnings || 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400' },
                        { label: 'Active deliveries', value: orders.length, icon: Package, color: 'text-blue-400' },
                        { label: 'Coverage area', value: 'Kerala', icon: Map, color: 'text-orange-400' }
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
                            <Package className="mx-auto text-white/10 mb-6" size={48} />
                            <h3 className="text-xl font-black text-white tracking-tight mb-1">No active deliveries</h3>
                            <p className="text-white/30 font-bold text-[10px] uppercase tracking-widest">New assigned orders will appear here.</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <motion.div 
                                layout
                                key={order.id}
                                className={`bg-white/5 border rounded-[40px] p-8 md:p-10 transition-all ${order.id === trackingOrderId ? 'border-primary-500/40 shadow-2xl shadow-primary-500/10' : 'border-white/10'}`}
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-8 lg:gap-12">
                                    <div className="flex-1 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span className="bg-white/10 text-white font-black px-4 py-1.5 rounded-2xl text-sm tracking-tight font-mono">#{formatOrderId(order.id)}</span>
                                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.delivery_status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {getDeliveryAgentStatusLabel(order.delivery_status)}
                                                </div>
                                            </div>
                                            <span className="text-primary-500 font-black text-[10px] uppercase tracking-widest italic">{order.restaurant_name}</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Pickup Node */}
                                            <div className="relative pl-6 border-l border-dashed border-white/10">
                                                <div className="absolute top-0 -left-[5px] w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                                                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Pickup restaurant</h4>
                                                <p className="text-white font-bold leading-tight line-clamp-2">{order.restaurant_address || 'Restaurant Address Terminal'}</p>
                                            </div>

                                            {/* Delivery Node */}
                                            <div className="relative pl-6 border-l border-dashed border-white/10">
                                                <div className="absolute top-0 -left-[5px] w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Customer address</h4>
                                                <p className="text-white font-bold leading-tight line-clamp-2">{order.address}</p>
                                            </div>
                                        </div>

                                        {/* Item Manifest */}
                                        <div className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-1 h-3 bg-primary-500 rounded-full" />
                                                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Order items</h4>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between group/item py-1">
                                                        <span className="text-sm font-bold text-white/70 group-hover/item:text-white transition-colors">
                                                            {item.menu_item_name}
                                                        </span>
                                                        <span className="bg-primary-500/10 text-primary-400 font-black px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-tighter">
                                                            x{item.quantity}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-4 flex flex-wrap gap-3">
                                            <a 
                                                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(order.address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-2 border border-white/5 transition-colors"
                                            >
                                                <Navigation size={14} className="text-primary-500" />
                                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Open route</span>
                                                <ExternalLink size={10} className="text-white/20" />
                                            </a>
                                            <div className="px-4 py-2 bg-white/5 rounded-2xl flex items-center gap-2 border border-white/5">
                                                <Clock size={14} className="text-primary-500" />
                                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{formatDate(order.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between items-stretch md:items-end w-full md:w-[240px] gap-6">
                                        <div className="flex flex-col items-stretch md:items-end gap-4 overflow-hidden">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Next action</span>
                                            
                                            {/* Step 1: Accept Job */}
                                            {order.delivery_status === 'assigned' && (
                                                <button 
                                                    onClick={() => updateStatus(order.id, 'accepted')}
                                                    className="w-full px-8 py-5 rounded-[24px] bg-primary-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-4 active:scale-95"
                                                >
                                                    Accept delivery <ArrowRight size={16} />
                                                </button>
                                            )}

                                            {/* Step 2: Pickup */}
                                            {order.delivery_status === 'accepted' && (
                                                        <button 
                                                            onClick={() => updateStatus(order.id, 'picked')}
                                                            className="w-full px-8 py-5 rounded-[24px] bg-orange-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-4 active:scale-95"
                                                        >
                                                            Confirm pickup <Package size={16} />
                                                        </button>
                                            )}

                                            {/* Phase 3: Transit & Delivery */}
                                            {(order.delivery_status === 'picked' || order.delivery_status === 'delivering') && (
                                                <div className="w-full space-y-3">
                                                    {trackingOrderId !== order.id ? (
                                                        <button 
                                                            onClick={() => startTracking(order.id)}
                                                            className="w-full px-8 py-5 rounded-[24px] bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-4 active:scale-95"
                                                        >
                                                            Start trip <Activity size={16} />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => updateStatus(order.id, 'delivered')}
                                                            className="w-full px-8 py-5 rounded-[24px] bg-white text-slate-900 font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-white/10 hover:bg-slate-100 transition-all flex items-center justify-center gap-4 active:scale-95"
                                                        >
                                                            Mark delivered <CheckCircle2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 text-white/20 text-[10px] font-black uppercase tracking-widest md:justify-end">
                                            <ShieldCheck size={14} /> Live GPS enabled
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

export default DeliveryDashboard
