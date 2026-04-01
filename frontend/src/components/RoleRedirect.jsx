import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/*
WHY RoleRedirect?
If an already logged-in user visits /login or /register,
they should be redirected to the right place.
Admin → /admin
Customer → /

Without this, a logged-in admin can visit /login
and see the customer login page — wrong behavior.
*/

const RoleRedirect = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-500">
                <p>Loading...</p>
            </div>
        )
    }

    if (user) {
        if (user.is_staff === true || user.role === 'admin') {
            return <Navigate to="/admin" replace />
        }
        if (user.role === 'restaurant') {
            return <Navigate to="/restaurant-admin" replace />
        }
        // If it's a regular customer, just let them through!
        // Don't redirect to "/" because that creates a loop if they are already there.
        return children
    }

    return children
}

export default RoleRedirect
