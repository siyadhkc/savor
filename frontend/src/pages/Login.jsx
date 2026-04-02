import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    /*
    WHY single handleChange for all fields?
    Instead of writing a separate onChange for email
    and another for password, we use the input's name
    attribute to dynamically update the right field.
    [e.target.name] is computed property syntax —
    it uses the variable value as the key.
    This scales to any number of form fields cleanly.
    */
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
  /*
        WHY e.preventDefault()?
        By default, form submission reloads the page.
        preventDefault() stops that so React handles it.
        BEGINNER MISTAKE: forgetting this and wondering
        why the page keeps refreshing on form submit.
        */
    const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
        const response = await login(formData.email, formData.password)
        toast.success('Welcome back! 🎉')

        // Fetch fresh user to check role
        const userRes = await api.get('/users/profile/')
        const loggedInUser = userRes.data

        /*
        WHY check role after login?
        After login we immediately check if user is
        admin or customer and redirect accordingly.
        Admin → goes to /admin dashboard
        Customer → goes to / home page
        This is how real apps work — each role
        lands on their own interface automatically.
        */
        if (loggedInUser.is_staff || loggedInUser.role === 'admin') {
            navigate('/admin')
        } else {
            navigate('/')
        }
    } catch (error) {
        const message = error.response?.data?.detail || 'Login failed.'
        toast.error(message)
    } finally {
        setLoading(false)
    }
}
    /*
            WHY optional chaining ?.?
            If error.response doesn't exist (network error),
            accessing .data would crash. ?. safely returns
            undefined instead of throwing an error.
            Always use ?. when accessing nested error properties.
            */
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Welcome Back 🍕</h2>
                <p style={styles.subtitle}>Login to order your favourite food</p>

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            style={styles.input}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={loading ? styles.btnDisabled : styles.btn}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Don't have an account?{' '}
                    <Link to="/register" style={styles.footerLink}>Register here</Link>
                </p>
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '420px',
    },
    title: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#333',
    },
    subtitle: {
        color: '#666',
        marginBottom: '24px',
    },
    field: {
        marginBottom: '16px',
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        fontWeight: '500',
        color: '#444',
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '1rem',
        outline: 'none',
        boxSizing: 'border-box',
    },
    btn: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#ff4500',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '8px',
    },
    btnDisabled: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#ccc',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'not-allowed',
        marginTop: '8px',
    },
    footer: {
        textAlign: 'center',
        marginTop: '20px',
        color: '#666',
    },
    footerLink: {
        color: '#ff4500',
        fontWeight: 'bold',
    },
}

export default Login