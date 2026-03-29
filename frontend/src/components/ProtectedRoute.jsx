import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/*
WHY ProtectedRoute?
The PDF requires "protected routes — JWT permission".
Some pages like Cart, Profile, Orders should only be
accessible to logged in users.
ProtectedRoute wraps those pages — if user is not logged in,
it automatically redirects to /login.
BEGINNER MISTAKE: only hiding the navigation link to a page.
Users can still type the URL directly and access it.
ProtectedRoute blocks access at the route level — proper security.
*/

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <p>Loading...</p>
            </div>
        )
    }

    if (!user) return  <Navigate to="/login" replace />
    /*
    WHY replace?
    replace=true means the login page REPLACES the current
    history entry instead of adding to it.
    So after login, pressing back doesn't go to the
    protected page again — it goes to the page before that.
    Better navigation experience.
      WHY adminOnly check?
    Admin pages must be double protected:
    1. Must be logged in (user exists)
    2. Must have admin role (is_staff)
    A regular customer should NEVER access admin pages
    even if they somehow know the URL.
    */
   if (adminOnly && !user.is_staff && user.role !== 'admin') {
    return <Navigate to="/" replace />
}
//    if (adminOnly && user.role !== 'admin' && !user.is_staff){
//     return <Navigate to="/" replace/>
//    }
   return children
}

export default ProtectedRoute