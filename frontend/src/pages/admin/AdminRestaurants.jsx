import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import api from '../../api/axios'
import { getImageUrl } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminRestaurants = () => {
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingRestaurant, setEditingRestaurant] = useState(null)
    const [formData, setFormData] = useState({
        name: '', address: '', phone: '', is_active: true
    })
    const [logoFile, setLogoFile] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchRestaurants()
    }, [])

    const fetchRestaurants = async () => {
        try {
            const response = await api.get('/restaurant/restaurants/')
            setRestaurants(response.data.results)
        } catch {
            toast.error('Failed to load restaurants.')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingRestaurant(null)
        setFormData({ name: '', address: '', phone: '', is_active: true })
        setLogoFile(null)
        setShowModal(true)
    }

    const openEditModal = (restaurant) => {
        setEditingRestaurant(restaurant)
        setFormData({
            name: restaurant.name,
            address: restaurant.address,
            phone: restaurant.phone || '',
            is_active: restaurant.is_active,
        })
        setLogoFile(null)
        setShowModal(true)
    }

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox'
            ? e.target.checked
            : e.target.value
        setFormData({ ...formData, [e.target.name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            /*
            WHY FormData instead of JSON?
            When uploading files (images), you MUST use
            FormData — JSON cannot carry binary file data.
            FormData sends data as multipart/form-data
            which Django's ImageField understands.
            BEGINNER MISTAKE: sending image as JSON and
            wondering why Django says no file was uploaded.
            */
            const data = new FormData()
            data.append('name', formData.name)
            data.append('address', formData.address)
            data.append('phone', formData.phone)
            data.append('is_active', formData.is_active)
            if (logoFile) {
                data.append('logo', logoFile)
            }

            if (editingRestaurant) {
                await api.patch(
                    `/restaurant/restaurants/${editingRestaurant.id}/`,
                    data,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
                toast.success('Restaurant updated! ✅')
            } else {
                await api.post(
                    '/restaurant/restaurants/',
                    data,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
                toast.success('Restaurant created! 🎉')
            }

            setShowModal(false)
            fetchRestaurants()
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Failed to save restaurant.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this restaurant?')) return
        /*
        WHY window.confirm?
        Simple confirmation before destructive actions.
        In production use a custom modal.
        For a student project this is perfectly acceptable.
        Always confirm before delete — never delete silently.
        */
        try {
            await api.delete(`/restaurant/restaurants/${id}/`)
            setRestaurants(restaurants.filter(r => r.id !== id))
            toast.success('Restaurant deleted.')
        } catch {
            toast.error('Failed to delete restaurant.')
        }
    }

    const handleToggleActive = async (restaurant) => {
        try {
            await api.patch(
                `/restaurant/restaurants/${restaurant.id}/`,
                { is_active: !restaurant.is_active },
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            setRestaurants(restaurants.map(r =>
                r.id === restaurant.id
                    ? { ...r, is_active: !r.is_active }
                    : r
            ))
            toast.success('Status updated!')
        } catch {
            toast.error('Failed to update status.')
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* <AdminSidebar /> */}
            <div className="flex-1 p-7.5 bg-gray-100">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Restaurants 🍽️</h1>
                    <button onClick={openCreateModal} className="px-5 py-2.5 bg-primary-600 text-white border-0 rounded-lg font-bold cursor-pointer hover:opacity-90">
                        + Add Restaurant
                    </button>
                </div>

                {loading ? <p>Loading...</p> : (
                    <div className="bg-white rounded-2xl shadow-sm p-5 overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Logo</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Name</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Address</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Phone</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Status</th>
                                    <th className="px-4 py-3 text-left text-gray-600 text-sm font-semibold border-b border-gray-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restaurants.map(r => (
                                    <tr key={r.id} className="border-b border-gray-50">
                                        <td className="px-4 py-3 text-sm">
                                            {r.logo ? (
                                                <img
                                                    src={getImageUrl(r.logo)}
                                                    alt={r.name}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-xl">
                                                    🍽️
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <strong className="text-gray-800">{r.name}</strong>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800">{r.address}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">{r.phone || '—'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <button
                                                onClick={() => handleToggleActive(r)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                                                    r.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {r.is_active ? '🟢 Active' : '🔴 Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(r)}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 border-0 rounded-lg cursor-pointer font-semibold text-xs hover:bg-blue-100"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(r.id)}
                                                    className="px-3 py-1.5 bg-pink-50 text-red-700 border-0 rounded-lg cursor-pointer font-semibold text-xs hover:bg-pink-100"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {restaurants.length === 0 && (
                            <p className="text-center py-10 text-gray-500">
                                No restaurants yet. Add one!
                            </p>
                        )}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-7.5 w-11/12 max-w-lg max-h-11/12 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingRestaurant
                                        ? 'Edit Restaurant'
                                        : 'Add Restaurant'
                                    }
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 text-xl bg-transparent border-0 cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {[
                                    {
                                        label: 'Restaurant Name',
                                        name: 'name',
                                        type: 'text',
                                        placeholder: 'e.g. Pizza Palace'
                                    },
                                    {
                                        label: 'Phone',
                                        name: 'phone',
                                        type: 'tel',
                                        placeholder: 'e.g. 9876543210'
                                    },
                                ].map(field => (
                                    <div key={field.name} className="mb-4">
                                        <label className="block mb-1.5 font-medium text-gray-700">
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none box-border"
                                            required={field.name === 'name'}
                                        />
                                    </div>
                                ))}

                                <div className="mb-4">
                                    <label className="block mb-1.5 font-medium text-gray-700">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Full address..."
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none box-border resize-vertical font-inherit"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-1.5 font-medium text-gray-700">
                                        Logo Image
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setLogoFile(e.target.files[0])
                                        }
                                        className="w-full text-sm"
                                    />
                                </div>

                                <div className="flex items-center gap-2.5 mb-5 text-gray-700">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        id="is_active"
                                    />
                                    <label htmlFor="is_active">
                                        Active (visible to customers)
                                    </label>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-2.5 bg-transparent text-gray-400 border-2 border-gray-300 rounded-lg font-bold cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={`px-6 py-2.5 text-white border-0 rounded-lg font-bold cursor-pointer ${
                                            submitting
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-primary-600 hover:opacity-90'
                                        }`}
                                    >
                                        {submitting
                                            ? 'Saving...'
                                            : editingRestaurant
                                                ? 'Update'
                                                : 'Create'
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminRestaurants