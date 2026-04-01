import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/*
WHY a dedicated AdminRoute?
Single responsibility principle.
AdminRoute ONLY checks: is this user an admin?
If yes → render the page
If no and logged in → send to home (customer)
If not logged in → send to login

This is cleaner than one ProtectedRoute
trying to handle all cases with flags.
*/

const AdminRoute = ({ children }) => {
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

    // Logged in but not admin → send to customer home
    const isAdmin = user.is_staff === true || user.role === 'admin'
    if (!isAdmin) {
        return <Navigate to="/" replace />
    }

    return children
}

export default AdminRoute
