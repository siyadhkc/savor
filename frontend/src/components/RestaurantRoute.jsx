import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RestaurantRoute = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-500">
                <p>Loading...</p>
            </div>
        )
    }

    // Not logged in
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Must be restaurant
    if (user.role !== 'restaurant') {
        return <Navigate to="/" replace />
    }

    return children
}

export default RestaurantRoute
