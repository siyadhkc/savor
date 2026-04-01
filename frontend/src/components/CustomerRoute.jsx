import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/*
WHY a dedicated CustomerRoute?
CustomerRoute checks: is this a regular customer?
If yes → render the page
If admin tries to access → redirect to /admin
If not logged in → redirect to /login

This prevents admins from accidentally landing
on cart, orders, profile etc.
Each role stays strictly in their own space.
*/

const CustomerRoute = ({ children }) => {
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

    // Admin trying to access customer page → back to admin
    if (user.is_staff === true || user.role === 'admin') {
        return <Navigate to="/admin" replace />
    }

    // Restaurant owner trying to access customer page → back to restaurant admin
    if (user.role === 'restaurant') {
        return <Navigate to="/restaurant-admin" replace />
    }

    return children
}

export default CustomerRoute
