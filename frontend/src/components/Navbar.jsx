import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Navbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        toast.success('Logged out successfully!')
        navigate('/login')
    }

    /*
    WHY completely separate navbars?
    Admin and customer have completely different
    navigation needs. One navbar trying to handle
    both becomes messy with too many conditions.
    Separate renders keep code clean and maintainable.
    This is how real production apps work.
    */
    const isAdmin = user?.is_staff || user?.role === 'admin'

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>

                {/* Logo */}
                <Link
                    to={isAdmin ? '/admin' : '/'}
                    style={styles.logo}
                >
                    🍕 FoodDelivery
                    {isAdmin && (
                        <span style={styles.adminBadge}>ADMIN</span>
                    )}
                </Link>

                {/* Admin Navbar */}
                {user && isAdmin && (
                    <div style={styles.links}>
                        <Link to="/admin" style={styles.link}>
                            📊 Dashboard
                        </Link>
                        <Link to="/admin/restaurants" style={styles.link}>
                            🍽️ Restaurants
                        </Link>
                        <Link to="/admin/menu" style={styles.link}>
                            🍕 Menu
                        </Link>
                        <Link to="/admin/categories" style={styles.link}>
                            📂 Categories
                        </Link>
                        <Link to="/admin/orders" style={styles.link}>
                            📦 Orders
                        </Link>
                        <Link to="/admin/users" style={styles.link}>
                            👥 Users
                        </Link>
                        <Link to="/admin/payments" style={styles.link}>
                            💳 Payments
                        </Link>
                        <button
                            onClick={handleLogout}
                            style={styles.logoutBtn}
                        >
                            🚪 Logout
                        </button>
                    </div>
                )}

                {/* Customer Navbar */}
                {user && !isAdmin && (
                    <div style={styles.links}>
                        <Link to="/" style={styles.link}>Home</Link>
                        <Link to="/cart" style={styles.link}>🛒 Cart</Link>
                        <Link to="/orders" style={styles.link}>My Orders</Link>
                        <Link to="/profile" style={styles.link}>
                            👤 {user.username}
                        </Link>
                        <button
                            onClick={handleLogout}
                            style={styles.logoutBtn}
                        >
                            Logout
                        </button>
                    </div>
                )}

                {/* Not logged in */}
                {!user && (
                    <div style={styles.links}>
                        <Link to="/" style={styles.link}>Home</Link>
                        <Link to="/login" style={styles.link}>Login</Link>
                        <Link to="/register" style={styles.registerBtn}>
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    )
}

const styles = {
    nav: {
        backgroundColor: '#ff4500',
        padding: '0 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px',
    },
    logo: {
        color: 'white',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    adminBadge: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        color: 'white',
        fontSize: '0.65rem',
        padding: '2px 8px',
        borderRadius: '4px',
        fontWeight: 'bold',
        letterSpacing: '1px',
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    link: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '500',
        opacity: 0.9,
    },
    logoutBtn: {
        backgroundColor: 'white',
        color: '#ff4500',
        border: 'none',
        padding: '7px 14px',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '0.85rem',
    },
    registerBtn: {
        backgroundColor: 'white',
        color: '#ff4500',
        padding: '7px 14px',
        borderRadius: '6px',
        fontWeight: 'bold',
        textDecoration: 'none',
        fontSize: '0.85rem',
    },
}

export default Navbar