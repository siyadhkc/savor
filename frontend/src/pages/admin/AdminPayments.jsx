import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatOrderId, formatDate } from '../../utils/helpers'

const STATUS_COLORS = {
    pending: { bg: '#fff3e0', color: '#e65100' },
    success: { bg: '#e8f5e9', color: '#2e7d32' },
    failed: { bg: '#fce4ec', color: '#c62828' },
}

const AdminPayments = () => {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')
    const [search, setSearch] = useState('')

    useEffect(() => { fetchPayments() }, [])

    const fetchPayments = async () => {
        try {
            const response = await api.get('/payments/payments/')
            setPayments(response.data.results)
        } catch {
            toast.error('Failed to load payments.')
        } finally {
            setLoading(false)
        }
    }

    const filtered = payments
        .filter(p => filterStatus === 'all' || p.status === filterStatus)
        .filter(p => search === '' ||
            String(p.order_id).includes(search) ||
            p.razorpay_order_id?.includes(search)
        )

    return (
        <div className="flex min-h-screen">
            {/* <AdminSidebar /> */}
            <div className="flex-1 p-7.5 bg-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Payments 💳</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        {
                            label: 'Total Payments',
                            value: payments.length,
                            color: 'text-blue-600',
                            icon: '💳'
                        },
                        {
                            label: 'Successful',
                            value: payments.filter(p =>
                                p.status === 'success'
                            ).length,
                            color: 'text-green-600',
                            icon: '✅'
                        },
                        {
                            label: 'Pending',
                            value: payments.filter(p =>
                                p.status === 'pending'
                            ).length,
                            color: 'text-orange-600',
                            icon: '⏳'
                        },
                        {
                            label: 'Failed',
                            value: payments.filter(p =>
                                p.status === 'failed'
                            ).length,
                            color: 'text-red-600',
                            icon: '❌'
                        },
                    ].map(card => (
                        <div key={card.label} className="bg-white rounded-2xl p-4.5 shadow-sm flex items-center gap-3.5">
                            <span className="text-2xl">{card.icon}</span>
                            <div>
                                <p className="text-gray-600 text-sm mb-1">{card.label}</p>
                                <p className={`text-2xl font-bold ${card.color}`}>
                                    {card.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-center mb-5 flex-wrap">
                    <input
                        type="text"
                        placeholder="Search by order ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none min-w-64"
                    />
                    <div className="flex gap-2">
                        {['all', 'pending', 'success', 'failed'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-4 py-2 border-2 rounded-full cursor-pointer font-medium ${
                                    filterStatus === s
                                        ? 'border-primary-600 bg-primary-600 text-white'
                                        : 'border-gray-300 bg-white text-gray-600'
                                }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? <p>Loading payments...</p> : (
                    <div className="bg-white rounded-2xl shadow-sm p-5 overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Payment ID</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Order</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Method</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Razorpay ID</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Status</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(payment => {
                                    return (
                                        <tr
                                            key={payment.id}
                                            className="border-b border-gray-50"
                                        >
                                            <td className="px-4 py-3 text-sm">
                                                #{payment.id}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-800">
                                                {formatOrderId(payment.order_id)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs">
                                                    {payment.method === 'razorpay'
                                                        ? '💳 Razorpay'
                                                        : '💵 COD'
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="text-gray-500 text-xs font-mono">
                                                    {payment.razorpay_order_id
                                                        || '—'
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    payment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                    payment.status === 'success' ? 'bg-green-100 text-green-700' :
                                                    payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-800">
                                                {formatDate(payment.created_at)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <p className="text-center py-10 text-gray-500">No payments found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminPayments