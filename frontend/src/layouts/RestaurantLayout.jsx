import { Outlet } from 'react-router-dom'
import RestaurantSidebar from '../components/RestaurantSidebar'

const RestaurantLayout = () => {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <RestaurantSidebar />
            <div className="flex-1 overflow-y-auto min-w-0">
                <Outlet />
            </div>
        </div>
    )
}

export default RestaurantLayout
