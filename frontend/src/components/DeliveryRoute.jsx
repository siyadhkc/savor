import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DeliveryRoute = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-white/40 font-black uppercase tracking-widest text-[10px]">
                <div className="w-8 h-8 border-2 border-white/5 border-t-primary-500 rounded-full animate-spin mb-4" />
                Loading Security Session...
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (user.role !== 'delivery') {
        if (user.is_staff === true || user.role === 'admin') {
            return <Navigate to="/admin" replace />
        }
        if (user.role === 'restaurant') {
            return <Navigate to="/restaurant-admin" replace />
        }
        return <Navigate to="/" replace />
    }

    return children
}

export default DeliveryRoute
