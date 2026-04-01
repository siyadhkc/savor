import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const Profile = () => {
    const { user, } = useAuth()
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: user?.username || '',
        phone: user?.phone || '',
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await api.patch('/users/profile/', formData)
            /*
            WHY PATCH not PUT?
            PUT requires ALL fields to be sent.
            PATCH updates only the fields you send.
            For profile editing, user might only change
            their phone — PATCH is correct here.
            BEGINNER MISTAKE: using PUT and accidentally
            clearing fields you didn't include.
            */
            toast.success('Profile updated! ✅')
            setEditing(false)
        } catch (error) {
            console.error('Failed to update profile:', error)
            toast.error('Failed to update profile.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-10">
            <div className="max-w-2xl mx-auto px-5 py-7">
                <h1 className="text-4xl font-bold mb-6 text-gray-800">My Profile 👤</h1>

                <div className="bg-white rounded-lg p-7 shadow-sm">
                    {/* Avatar */}
                    <div className="flex items-center gap-5 mb-6">
                        <div className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center text-3xl font-bold flex-shrink-0">
                            {user?.username?.[0]?.toUpperCase()}
                            {/*
                            WHY first letter as avatar?
                            Simple, clean, no image upload needed.
                            Shows the user's initial in a colored circle.
                            Common pattern in Gmail, Slack, etc.
                            */}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-1.5">{user?.username}</h2>
                            <span className="inline-block bg-orange-50 text-primary-600 px-3 py-1 rounded-full text-xs font-semibold">
                                {user?.role === 'admin' ? '👑 Admin' : '🛒 Customer'}
                            </span>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 mb-6" />

                    {/* Profile Info */}
                    {!editing ? (
                        <div className="flex flex-col gap-4">
                            {[
                                { label: 'Email', value: user?.email, icon: '📧' },
                                { label: 'Username', value: user?.username, icon: '👤' },
                                { label: 'Phone', value: user?.phone || 'Not set', icon: '📞' },
                                { label: 'Role', value: user?.role, icon: '🎭' },
                            ].map(field => (
                                <div key={field.label} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-2xl">{field.icon}</span>
                                    <div>
                                        <p className="text-gray-600 text-xs mb-0.5">{field.label}</p>
                                        <p className="text-gray-800 font-medium">{field.value}</p>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => setEditing(true)}
                                className="w-full p-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors"
                            >
                                ✏️ Edit Profile
                            </button>
                        </div>
                    ) : (
                        /* Edit Form */
                        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="font-medium text-gray-700">Username</label>
                                <input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="font-medium text-gray-700">Phone</label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex-1 p-3 rounded-lg font-bold text-white transition-colors ${loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-primary-600 hover:bg-orange-600'
                                    }`}
                                >
                                    {loading ? 'Saving...' : '✅ Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="flex-1 p-3 bg-transparent text-gray-600 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile