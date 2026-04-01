import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        /*
        WHY check token on mount?
        When user refreshes the page, React state resets.
        We check localStorage for an existing token and
        fetch the user profile to restore auth state.
        Without this, every page refresh logs the user out.
        */
        const token = localStorage.getItem('access_token')
        if (token) {
            fetchUser()
        } else {
            setLoading(false)
        }
    }, [])

    const fetchUser = async () => {
        try {
            const response = await api.get('/users/profile/')
            setUser(response.data)
            /*
            WHY setUser with full profile data?
            Profile endpoint returns ALL fields including
            is_staff and role — both needed for admin checks.
            This ensures Navbar and ProtectedRoute always
            have accurate, fresh user data.
            */
        } catch {
            // Token invalid or expired — clear everything
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        const response = await api.post('/users/login/', { email, password })
        localStorage.setItem('access_token', response.data.access)
        localStorage.setItem('refresh_token', response.data.refresh)
        /*
        WHY fetchUser after setting tokens?
        Tokens are stored first so the axios interceptor
        can attach them. Then fetchUser() calls /profile/
        with the new token to get full user data including
        is_staff and role fields.
        */
        await fetchUser()
        return response
    }

    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token')
            await api.post('/users/logout/', { refresh })
        } catch (error) {
            // Even if logout API fails, clear local state
            console.log('Logout error:', error)
        } finally {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            setUser(null)
        }
    }

    const register = async (data) => {
        const response = await api.post('/users/register/', data)
        return response
    }

    const registerRestaurant = async (data) => {
        const response = await api.post('/users/register/restaurant/', data)
        return response
    }

    const updateUser = (newData) => {
        /*
        WHY updateUser?
        Instead of window.location.reload(), this updates the 
        React state directly. The UI (sidebar, profile) will 
        reflect changes instantly and smoothly.
        */
        setUser(prev => ({ ...prev, ...newData }))
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            register,
            registerRestaurant,
            updateUser,
            loading,
            fetchUser,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext) // eslint-disable-line react-refresh/only-export-components
