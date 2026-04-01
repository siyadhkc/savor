import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'

/*
WHY no CustomerNavbar here?
Admin layout is completely separate from customer UI.
Admin only sees the sidebar — no top navbar, no cart,
no customer links of any kind.
This mirrors how real admin panels work:
Django Admin, WordPress Admin, Shopify Admin —
all have sidebar-only layouts completely separate
from the customer-facing site.
*/

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 overflow-y-auto min-w-0">
                <Outlet />
            </div>
        </div>
    )
}

export default AdminLayout
