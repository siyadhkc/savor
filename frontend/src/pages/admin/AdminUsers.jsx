import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const AdminUsers = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/all/')
            setUsers(response.data.results)
        } catch (error) {
            console.error('Failed to load users:', error)
            toast.error('Failed to load users.')
        } finally {
            setLoading(false)
        }
    }

    const handleBlockToggle = async (userId) => {
        try {
            const response = await api.post(`/users/${userId}/block/`)
            setUsers(users.map(u =>
                u.id === userId
                    ? { ...u, is_active: !u.is_active }
                    : u
            ))
            toast.success(response.data.message)
        } catch (error) {
            console.error('Failed to update user:', error)
            toast.error('Failed to update user.')
        }
    }

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={styles.layout}>
            <AdminSidebar />
            <div style={styles.main}>
                <h1 style={styles.title}>Users 👥</h1>

                <input
                    type="text"
                    placeholder="Search by email or username..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.search}
                />

                {loading ? <p>Loading users...</p> : (
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHead}>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Username</th>
                                    <th style={styles.th}>Phone</th>
                                    <th style={styles.th}>Role</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id} style={styles.tableRow}>
                                        <td style={styles.td}>#{user.id}</td>
                                        <td style={styles.td}>{user.email}</td>
                                        <td style={styles.td}>{user.username}</td>
                                        <td style={styles.td}>{user.phone || '—'}</td>
                                        <td style={styles.td}>
                                            <span style={styles.roleBadge}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={user.is_active
                                                ? styles.activeBadge
                                                : styles.inactiveBadge
                                            }>
                                                {user.is_active ? 'Active' : 'Blocked'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() =>
                                                    handleBlockToggle(user.id)
                                                }
                                                style={user.is_active
                                                    ? styles.blockBtn
                                                    : styles.unblockBtn
                                                }
                                            >
                                                {user.is_active
                                                    ? '🚫 Block'
                                                    : '✅ Unblock'
                                                }
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

const styles = {
    layout: { display: 'flex', minHeight: '100vh' },
    main: { flex: 1, padding: '30px', backgroundColor: '#f5f5f5' },
    title: { fontSize: '1.8rem', fontWeight: 'bold', color: '#333', marginBottom: '20px' },
    search: {
        width: '100%', maxWidth: '400px', padding: '10px 14px',
        border: '1px solid #ddd', borderRadius: '8px',
        fontSize: '0.95rem', marginBottom: '20px',
        outline: 'none', boxSizing: 'border-box',
    },
    tableCard: {
        backgroundColor: 'white', borderRadius: '12px',
        padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflowX: 'auto',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHead: { backgroundColor: '#f9f9f9' },
    th: {
        padding: '12px 16px', textAlign: 'left',
        color: '#666', fontSize: '0.85rem',
        fontWeight: '600', borderBottom: '1px solid #f0f0f0',
    },
    tableRow: { borderBottom: '1px solid #f9f9f9' },
    td: { padding: '12px 16px', color: '#333', fontSize: '0.9rem' },
    roleBadge: {
        backgroundColor: '#e3f2fd', color: '#1565c0',
        padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem',
    },
    activebadge: {
        backgroundColor: '#e8f5e9', color: '#2e7d32',
        padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem',
    },
    activeBadge: {
        backgroundColor: '#e8f5e9', color: '#2e7d32',
        padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem',
    },
    inactiveBadge: {
        backgroundColor: '#fce4ec', color: '#c62828',
        padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem',
    },
    blockBtn: {
        padding: '6px 12px', backgroundColor: '#fce4ec',
        color: '#c62828', border: 'none', borderRadius: '6px',
        cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
    },
    unblockBtn: {
        padding: '6px 12px', backgroundColor: '#e8f5e9',
        color: '#2e7d32', border: 'none', borderRadius: '6px',
        cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
    },
}

export default AdminUsers