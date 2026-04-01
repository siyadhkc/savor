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
        <div className="flex min-h-screen">
            {/* <AdminSidebar /> */}
            <div className="flex-1 p-7.5 bg-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-5">Users 👥</h1>

                <input
                    type="text"
                    placeholder="Search by email or username..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-100 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm mb-5 outline-none box-border"
                />

                {loading ? <p>Loading users...</p> : (
                    <div className="bg-white rounded-2xl shadow-sm p-5 overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">ID</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Email</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Username</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Phone</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Role</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Status</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="border-b border-gray-50">
                                        <td className="px-4 py-3 text-sm">#{user.id}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">{user.email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">{user.username}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">{user.phone || '—'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                user.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {user.is_active ? 'Active' : 'Blocked'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <button
                                                onClick={() =>
                                                    handleBlockToggle(user.id)
                                                }
                                                className={`px-3 py-1.5 border-0 rounded-lg cursor-pointer font-semibold text-xs ${
                                                    user.is_active
                                                        ? 'bg-pink-50 text-red-700 hover:bg-pink-100'
                                                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                }`}
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

export default AdminUsers