import { useNavigate } from 'react-router-dom'
import { getImageUrl } from '../utils/helpers'
import { MapPin, Phone, Utensils, ArrowRight, CircleCheck, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const RestaurantCard = ({ restaurant }) => {
    const navigate = useNavigate()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -5 }}
            className="card group cursor-pointer flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300"
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
        >
            {/* Restaurant Logo */}
            <div className="w-full h-48 overflow-hidden bg-slate-100 relative">
                {restaurant.logo ? (
                    <>
                        <img
                            src={getImageUrl(restaurant.logo)}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-primary-50 text-primary-200">
                        <Utensils size={48} strokeWidth={1.5} />
                    </div>
                )}
            </div>

            {/* Restaurant Info */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-3 text-slate-800 tracking-tight group-hover:text-primary-600 transition-colors">{restaurant.name}</h3>
                
                <div className="flex flex-col gap-2 mb-4 mt-auto">
                    <p className="flex items-center text-slate-500 text-sm gap-2">
                        <MapPin size={15} className="text-slate-400" />
                        <span className="truncate">{restaurant.address}</span>
                    </p>
                    <p className="flex items-center text-slate-500 text-sm gap-2">
                        <Phone size={15} className="text-slate-400" />
                        <span>{restaurant.phone}</span>
                    </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className={`badge flex items-center gap-1.5 ${
                        restaurant.is_active
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                    }`}>
                        {restaurant.is_active ? (
                            <><CircleCheck size={12} strokeWidth={3} /> Open</>
                        ) : (
                            <><XCircle size={12} strokeWidth={3} /> Closed</>
                        )}
                    </span>
                    <span className="flex items-center gap-1 text-primary-600 font-semibold text-sm group-hover:gap-2 transition-all">
                        View Menu <ArrowRight size={16} />
                    </span>
                </div>
            </div>
        </motion.div>
    )
}

export default RestaurantCard