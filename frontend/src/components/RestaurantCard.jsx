import { useNavigate } from 'react-router-dom'
import { getImageUrl } from '../utils/helpers'
import { MapPin, Utensils, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const RestaurantCard = ({ restaurant }) => {
    const navigate = useNavigate()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            whileHover={{ y: -4 }}
            className="group cursor-pointer flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.09)] border border-slate-200/70 hover:border-primary-200 transition-all duration-400"
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
        >
            {/* Image */}
            <div className="w-full h-52 overflow-hidden bg-slate-100 relative">
                {restaurant.logo ? (
                    <>
                        <img
                            src={getImageUrl(restaurant.logo)}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                        <Utensils size={40} strokeWidth={1.5} />
                    </div>
                )}

                {/* Status badge */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-white/60">
                    <div className={`w-1.5 h-1.5 rounded-full ${restaurant.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        {restaurant.is_active ? 'Open' : 'Closed'}
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-black text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors line-clamp-1 mb-2">
                    {restaurant.name}
                </h3>

                <p className="flex items-center text-slate-400 text-xs font-medium gap-1.5 mb-4">
                    <MapPin size={13} className="text-slate-300 shrink-0" />
                    <span className="truncate">{restaurant.address}</span>
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-primary-600 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-300">
                        View Menu
                        <ArrowRight size={13} strokeWidth={2.5} />
                    </span>
                </div>
            </div>
        </motion.div>
    )
}

export default RestaurantCard