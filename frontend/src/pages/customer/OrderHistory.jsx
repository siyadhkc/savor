import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatOrderId, formatDate } from '../../utils/helpers'

/*
WHY status colors as a config object?
Instead of writing if/else for every status,
we map status strings to colors.
Clean, scalable — adding a new status means
adding one line to this object, nothing else.
*/
const STATUS_COLORS = {
    pending: { bg: 'bg-amber-50', color: 'text-amber-700', label: '⏳ Pending' },
    preparing: { bg: 'bg-blue-50', color: 'text-blue-700', label: '👨‍🍳 Preparing' },
    out_for_delivery: { bg: 'bg-purple-50', color: 'text-purple-700', label: '🚗 Out for Delivery' },
    delivered: { bg: 'bg-green-50', color: 'text-green-700', label: '✅ Delivered' },
    cancelled: { bg: 'bg-red-50', color: 'text-red-700', label: '❌ Cancelled' },
}

const OrderHistory = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedOrder, setExpandedOrder] = useState(null)
    const location = useLocation()
    /*
    WHY useLocation()?
    After placing an order, we navigate to this page
    with state: { newOrderId: 5 }
    useLocation() lets us read that state to highlight
    the newly placed order — great UX detail.
    */

    useEffect(() => {
        fetchOrders()
        /*
        WHY auto-expand new order?
        If user just placed an order, automatically
        expand it so they can see the details immediately.
        Small UX detail that makes the app feel polished.
        */
        if (location.state?.newOrderId) {
            setExpandedOrder(location.state.newOrderId)
        }
    }, [location.state?.newOrderId])
    const handleDownloadInvoice = async (orderId) => {
        try {
            const response = await api.get(
                `/orders/orders/${orderId}/invoice/`,
                { responseType: 'blob' }
                /*
                WHY responseType: 'blob'?
                PDF is binary data, not JSON text.
                blob tells Axios to treat the response as
                raw binary data — required for file downloads.
                Without this, the PDF will be corrupted.
                */
            )
            const url = window.URL.createObjectURL(
                new Blob([response.data])
            )
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `invoice_order_${orderId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            /*
            WHY revokeObjectURL?
            createObjectURL creates a temporary URL in memory.
            revokeObjectURL releases that memory after download.
            Always clean up — BEGINNER MISTAKE: memory leaks
            from not revoking object URLs.
            */
            toast.success('Invoice downloaded! 📄')
        } catch {
            toast.error('Failed to download invoice.')
        }
    }
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
        setExpandedOrder(
            expandedOrder === orderId ? null : orderId
        )
        /*
        WHY toggle logic?
        If same order clicked again → collapse it (null)
        If different order clicked → expand that one
        This is accordion pattern — common in order history UIs.
        */
    }

    if (loading) {
        return (
            <div className="text-center p-20 text-gray-600">
                <p>Loading your orders... 📦</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-10">
            <div className="max-w-3xl mx-auto px-5 py-7">
                <h1 className="text-4xl font-bold mb-6 text-gray-800">My Orders 📦</h1>

                {orders.length === 0 ? (
                    <div className="text-center p-20 bg-white rounded-lg text-gray-600">
                        <p className="text-5xl mb-4">📦</p>
                        <h2>No orders yet!</h2>
                        <p>Place your first order to see it here.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {orders.map(order => {
                            const statusInfo = STATUS_COLORS[order.status] || {}
                            const isExpanded = expandedOrder === order.id

                            return (
                                <div
                                    key={order.id}
                                    className={`bg-white rounded-lg p-5 shadow-sm transition ${
                                        location.state?.newOrderId === order.id
                                            ? 'border-2 border-primary-600'
                                            : 'border-2 border-transparent'
                                    }`}
                                    /*
                                    WHY dynamic border?
                                    Highlights the newly placed order
                                    with an orange border — visual confirmation.
                                    */
                                >
                                    {/* Order Header */}
                                    <div
                                        className="flex justify-between items-center cursor-pointer"
                                        onClick={() => toggleExpand(order.id)}
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-800">
                                                {formatOrderId(order.id)}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3.5 py-1.5 rounded-full text-sm font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                            <p className="font-bold text-primary-600">
                                                ₹{order.total_amount}
                                            </p>
                                            <span className="text-gray-600 text-xs">
                                                {isExpanded ? '▲' : '▼'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items — Expandable */}
                                    {isExpanded && (
                                        <div className="mt-4">
                                            <div className="h-px bg-gray-100 mb-3" />
                                            <h4 className="font-bold text-gray-800 mb-3">
                                                Items Ordered
                                            </h4>
                                            {order.items.map(item => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between mb-2 text-gray-700"
                                                >
                                                    <span>
                                                        {item.menu_item_name}
                                                        <span className="text-gray-600 ml-1.5 text-xs">
                                                            x{item.quantity}
                                                        </span>
                                                    </span>
                                                    <span className="font-semibold">
                                                        ₹{item.total_price}
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="h-px bg-gray-100 my-3" />
                                            <div className="text-gray-700 text-sm leading-6">
                                                <strong>📍 Delivered to:</strong>
                                                <p>{order.address}</p>
                                                <button
                                                    onClick={() => handleDownloadInvoice(order.id)}
                                                    className="mt-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                                                >
                                                    📄 Download Invoice
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrderHistory