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

    // Only allow delivery role
    if (user.role !== 'delivery' && !user.is_staff) {
        return <Navigate to="/" replace />
    }

    return children
}

export default DeliveryRoute
