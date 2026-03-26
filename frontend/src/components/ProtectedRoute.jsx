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

const ProtectedRoute = ({ children }) => {
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

    return user ? children : <Navigate to="/login" replace />
    /*
    WHY replace?
    replace=true means the login page REPLACES the current
    history entry instead of adding to it.
    So after login, pressing back doesn't go to the
    protected page again — it goes to the page before that.
    Better navigation experience.
    */
}

export default ProtectedRoute