import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RestaurantDetail from './pages/RestaurantDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderHistory from './pages/OrderHistory'
import Profile from './pages/Profile'


import AdminDashboard from './pages/admin/AdminDashboard'
import AdminRestaurants from './pages/admin/AdminRestaurants'
import AdminMenu from './pages/admin/AdminMenu'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'

/*
WHY wrap everything in AuthProvider?
AuthProvider must be the outermost wrapper so that
every component inside the app can access auth state.
If you put it inside, some components won't have access.
*/

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Toaster position="top-right" />
                {/*
                WHY Toaster here?
                react-hot-toast shows notifications anywhere in the app.
                Placing it here once means any component can trigger
                a toast notification without extra setup.
                */}
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/restaurant/:id" element={<RestaurantDetail />} />

                    {/* Protected routes — login required */}
                    <Route path="/cart" element={
                        <ProtectedRoute><Cart /></ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                        <ProtectedRoute><Checkout /></ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                        <ProtectedRoute><OrderHistory /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute><Profile /></ProtectedRoute>
                    } />

                         {/* Admin Protected */}
                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
                    } />
                    <Route path="/admin/restaurants" element={
                        <ProtectedRoute adminOnly><AdminRestaurants /></ProtectedRoute>
                    } />
                    <Route path="/admin/menu" element={
                        <ProtectedRoute adminOnly><AdminMenu /></ProtectedRoute>
                    } />
                    <Route path="/admin/orders" element={
                        <ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                        <ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>
                    } />

                    {/* Catch all — redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App