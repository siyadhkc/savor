import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

/*
WHY a shared sidebar?
All 5 admin pages share the same sidebar navigation.
Building it once as a component and reusing it
is the correct approach — change it once, updates everywhere.
*/

const AdminSidebar = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        toast.success('Logged out!')
        navigate('/login')
    }

    const links = [
        { to: '/admin', label: '📊 Dashboard', end: true },
        { to: '/admin/restaurants', label: '🍽️ Restaurants' },
        { to: '/admin/menu', label: '🍕 Menu Items' },
        { to: '/admin/orders', label: '📦 Orders' },
        { to: '/admin/users', label: '👥 Users' },
    ]

    return (
        <div style={styles.sidebar}>
            <div style={styles.logo}>
                🍕 Admin Panel
            </div>

            <nav style={styles.nav}>
                {links.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        style={({ isActive }) =>
                            isActive ? styles.linkActive : styles.link
                        }
                        /*
                        WHY NavLink instead of Link?
                        NavLink automatically adds an active state
                        when the current URL matches the link.
                        We use this to highlight the current page
                        in the sidebar — standard navigation pattern.
                        */
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div style={styles.bottom}>
                <NavLink to="/" style={styles.link}>
                    🏠 Back to Site
                </NavLink>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                    🚪 Logout
                </button>
            </div>
        </div>
    )
}

const styles = {
    sidebar: {
        width: '240px',
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        flexShrink: 0,
    },
    logo: {
        color: 'white',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        padding: '0 20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '16px',
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    link: {
        color: 'rgba(255,255,255,0.7)',
        padding: '12px 20px',
        textDecoration: 'none',
        fontSize: '0.95rem',
        transition: 'all 0.2s',
    },
    linkActive: {
        color: 'white',
        padding: '12px 20px',
        textDecoration: 'none',
        fontSize: '0.95rem',
        backgroundColor: '#ff4500',
        borderRight: '3px solid white',
    },
    bottom: {
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '16px',
        display: 'flex',
        flexDirection: 'column',
    },
    logoutBtn: {
        color: 'rgba(255,255,255,0.7)',
        backgroundColor: 'transparent',
        border: 'none',
        padding: '12px 20px',
        textAlign: 'left',
        fontSize: '0.95rem',
        cursor: 'pointer',
    },
}

export default AdminSidebar