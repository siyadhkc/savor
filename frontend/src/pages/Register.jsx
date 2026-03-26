import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        phone: '',
        password: '',
        password2: '',
    })
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Frontend validation — PDF requirement
        if (formData.password !== formData.password2) {
            toast.error('Passwords do not match!')
            return
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters!')
            return
        }

        setLoading(true)
        try {
            await register(formData)
            toast.success('Account created! Please login. 🎉')
            navigate('/login')
        } catch (error) {
            /*
            WHY this error handling?
            DRF returns validation errors as an object:
            { "email": ["This field is required."], "password": [...] }
            We extract the first error message and show it.
            */
            const errors = error.response?.data
            if (errors) {
                const firstError = Object.values(errors)[0]
                toast.error(Array.isArray(firstError) ? firstError[0] : firstError)
            } else {
                toast.error('Registration failed.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Account 🍔</h2>
                <p style={styles.subtitle}>Join us and order delicious food</p>

                <form onSubmit={handleSubmit}>
                    {[
                        { label: 'Email', name: 'email', type: 'email', placeholder: 'Enter your email' },
                        { label: 'Username', name: 'username', type: 'text', placeholder: 'Choose a username' },
                        { label: 'Phone', name: 'phone', type: 'tel', placeholder: 'Enter your phone number' },
                        { label: 'Password', name: 'password', type: 'password', placeholder: 'Min 8 characters' },
                        { label: 'Confirm Password', name: 'password2', type: 'password', placeholder: 'Repeat your password' },
                    ].map((field) => (
                        /*
                        WHY map over fields array?
                        All fields have identical structure — label + input.
                        Instead of copy-pasting the same JSX 5 times,
                        we map over a config array.
                        DRY principle — less code, easier to maintain.
                        */
                        <div key={field.name} style={styles.field}>
                            <label style={styles.label}>{field.label}</label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                style={styles.input}
                                required={field.name !== 'phone'}
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        style={loading ? styles.btnDisabled : styles.btn}
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.footerLink}>Login here</Link>
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
        padding: '20px',
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

export default Register