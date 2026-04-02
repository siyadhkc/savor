import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatOrderId, formatDate } from '../../utils/helpers'
import { CreditCard, Banknote, CheckCircle2, Clock, XCircle, Search, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const STATUS_CONFIG = {
    pending: { icon: Clock, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-400', label: 'Pending' },
    success: { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-400', label: 'Success' },
    failed:  { icon: XCircle, bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-400', label: 'Failed' },
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

    const stats = [
        { label: 'Total', value: payments.length, color: 'text-slate-800', icon: CreditCard },
        { label: 'Successful', value: payments.filter(p => p.status === 'success').length, color: 'text-emerald-600', icon: CheckCircle2 },
        { label: 'Pending', value: payments.filter(p => p.status === 'pending').length, color: 'text-amber-600', icon: Clock },
        { label: 'Failed', value: payments.filter(p => p.status === 'failed').length, color: 'text-rose-600', icon: XCircle },
    ]

    return (
        <div className="flex-1 min-h-screen bg-[#FCFCFD]">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">

                {/* Page Header */}
                <div className="mb-8">
                    <p className="text-primary-600 text-xs font-bold uppercase tracking-[0.2em] mb-1">Administration</p>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <CreditCard size={28} className="text-slate-300" strokeWidth={1.5} />
                        Payments
                    </h1>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map(({ label, value, color, icon: Icon }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                                <Icon size={17} className="text-slate-400" strokeWidth={1.8} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                                <p className={`text-2xl font-black ${color} tracking-tight leading-none`}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                    {/* Search */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex-1 max-w-xs shadow-sm focus-within:border-primary-400 transition-colors">
                        <Search size={15} className="text-slate-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by order or Razorpay ID…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm font-medium outline-none min-w-0"
                            style={{ fontSize: '16px' }}
                        />
                    </div>

                    {/* Status filter pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {['all', 'pending', 'success', 'failed'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                                    filterStatus === s
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 size={36} className="animate-spin text-primary-400" />
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/60">
                                        {['Payment ID', 'Order', 'Method', 'Razorpay ID', 'Status', 'Date'].map(col => (
                                            <th key={col} className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium text-sm">
                                                No payments found.
                                            </td>
                                        </tr>
                                    ) : filtered.map(payment => {
                                        const status = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending
                                        const StatusIcon = status.icon
                                        return (
                                            <tr key={payment.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-bold text-slate-400">#{payment.id}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                                                    {formatOrderId(payment.order_id)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                        {payment.method === 'razorpay' ? (
                                                            <><CreditCard size={13} className="text-primary-500" /> Razorpay</>
                                                        ) : (
                                                            <><Banknote size={13} className="text-emerald-500" /> Cash on Delivery</>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-slate-400 text-xs font-mono">
                                                        {payment.razorpay_order_id || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.bg} ${status.text} ${status.border}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                                                    {formatDate(payment.created_at)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default AdminPayments