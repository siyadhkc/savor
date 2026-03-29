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

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>

                {/* Logo */}
                <Link to="/" style={styles.logo}>
                    🍕 FoodDelivery
                </Link>

                {/* Nav Links */}
                <div style={styles.links}>
                    <Link to="/" style={styles.link}>Home</Link>

                    {user ? (
                        <>
                            <Link to="/cart" style={styles.link}>🛒 Cart</Link>
                            <Link to="/orders" style={styles.link}>My Orders</Link>
                            <Link to="/profile" style={styles.link}>
                                👤 {user.username}
                                  {/* Add this after the Profile link */}
                                {/* {(user?.role === 'admin' || user?.is_staff) && (
                                    <Link to="/admin" style={styles.adminLink}>
                                        👑 Admin
                                    </Link>
                                )} */}
 
                            </Link>
                                                           {(user?.is_staff === true || user?.role === 'admin') && (
    <Link to="/admin" style={styles.adminLink}>
        👑 Admin
    </Link>
)}
                          
                            <button onClick={handleLogout} style={styles.logoutBtn}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.link}>Login</Link>
                            <Link to="/register" style={styles.registerBtn}>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

/*
WHY inline styles here?
For a beginner project, inline styles keep everything
in one file — no separate CSS files to manage.
In production you'd use Tailwind or CSS modules.
For now, focus on functionality first.
*/
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
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px',
    },
    logo: {
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textDecoration: 'none',
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    link: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '1rem',
        fontWeight: '500',
    },
    logoutBtn: {
        backgroundColor: 'white',
        color: '#ff4500',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    registerBtn: {
        backgroundColor: 'white',
        color: '#ff4500',
        padding: '8px 16px',
        borderRadius: '6px',
        fontWeight: 'bold',
        textDecoration: 'none',
    },
    adminLink: {
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '6px 14px',
    borderRadius: '6px',
    fontWeight: 'bold',
    textDecoration: 'none',
},
}

export default Navbar