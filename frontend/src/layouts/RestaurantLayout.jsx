import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import RestaurantSidebar from '../components/RestaurantSidebar'
import { Menu, Utensils } from 'lucide-react'

const RestaurantLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar with mobile visibility control */}
            <RestaurantSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-slate-900 flex items-center justify-between px-5 flex-shrink-0 z-40 shadow-md">
                    <div className="flex items-center gap-2 text-white font-black">
                        <div className="bg-primary-500 p-1 rounded-lg">
                            <Utensils size={18} />
                        </div>
                        <span>Partner</span>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-slate-300 hover:text-white transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default RestaurantLayout

