import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

/*
WHY Context API?
The PDF says: "Context API or Redux for auth state".
Context API is perfect for beginner level — simpler than Redux.
Auth state (is the user logged in? who are they?) needs to be
accessible from ANY component — Navbar, protected routes, profile page.
Without Context, you'd have to pass user data as props through
every component — called "prop drilling" — messy and unscalable.
Context makes auth state globally available cleanly.
*/

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    /*
    WHY loading state?
    On page refresh, we check localStorage for tokens.
    During this check, we don't know if user is logged in yet.
    loading=true prevents the app from flashing the login page
    before we finish checking — better user experience.
    */

    useEffect(() => {
        /*
        WHY useEffect here?
        On every page load/refresh, we check if tokens exist
        and fetch the current user's profile to restore auth state.
        Without this, refreshing the page would log the user out.
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
        } catch (error) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        const response = await api.post('/users/login/', { email, password })
        localStorage.setItem('access_token', response.data.access)
        localStorage.setItem('refresh_token', response.data.refresh)
        await fetchUser()
        return response
    }

    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token')
            await api.post('/users/logout/', { refresh })
        } catch (error) {
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

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

/*
WHY custom hook useAuth()?
Instead of importing useContext + AuthContext in every component,
you just write: const { user, login } = useAuth()
Cleaner, shorter, more readable — professional React pattern.
*/
export const useAuth = () => useContext(AuthContext)