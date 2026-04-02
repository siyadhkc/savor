import { useNavigate } from 'react-router-dom'
import { getImageUrl } from '../utils/helpers'
import { MapPin, Utensils, ArrowRight, Star, Clock, Dot } from 'lucide-react'
import { motion } from 'framer-motion'

const RestaurantCard = ({ restaurant }) => {
    const navigate = useNavigate()

    // Deterministic mock data based on restaurant ID for consistency
    const getMockData = (id) => {
        const seed = id * 12345
        const rating = (4 + (seed % 10) / 10).toFixed(1)
        const time = 20 + (seed % 25)
        const price = 200 + (seed % 400)
        return { rating, time, price }
    }

    const { rating, time, price } = getMockData(restaurant.id)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -6 }}
            className="group cursor-pointer flex flex-col h-full bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] border border-slate-100 hover:border-primary-100 transition-all duration-500"
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
        >
            {/* Image Container */}
            <div className="w-full h-56 overflow-hidden bg-slate-100 relative">
                {restaurant.logo ? (
                    <>
                        <img
                            src={getImageUrl(restaurant.logo)}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-200">
                        <Utensils size={48} strokeWidth={1} />
                    </div>
                )}

                {/* Top Overlay: Status */}
                <div className="absolute top-4 left-4 flex gap-2">
                    <div className={`px-3 py-1 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-xl ${
                        restaurant.is_active ? 'bg-emerald-500/90 text-white' : 'bg-slate-800/90 text-slate-300'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${restaurant.is_active ? 'bg-white' : 'bg-slate-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {restaurant.is_active ? 'Accepting Orders' : 'Closed'}
                        </span>
                    </div>
                </div>

                {/* Bottom Overlay: Rating (Swiggy Style) */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                     <span className="text-white text-xs font-black uppercase tracking-tighter flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                         View Details <ArrowRight size={12} />
                     </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-5 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors line-clamp-1">
                        {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-emerald-600 text-white px-1.5 py-0.5 rounded-md shrink-0">
                        <span className="text-[11px] font-black leading-none">{rating}</span>
                        <Star size={10} fill="currentColor" stroke="none" />
                    </div>
                </div>

                <div className="flex items-center text-slate-500 text-[13px] font-bold tracking-tight mb-4">
                    <div className="flex items-center gap-1 text-slate-800">
                        <Clock size={13} className="text-primary-500" strokeWidth={3} />
                        <span>{time}-{time + 5} mins</span>
                    </div>
                    <Dot className="text-slate-300" strokeWidth={4} />
                    <span className="text-slate-400">₹{price} for two</span>
                </div>

                <p className="flex items-center text-slate-400 text-[13px] font-medium gap-1.5 line-clamp-1 mb-5">
                    <MapPin size={13} className="text-slate-300 shrink-0" />
                    {restaurant.address}
                </p>

                <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-100">
                    <div className="flex -space-x-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full bg-primary-100 text-primary-600 flex items-center justify-center">
                                    <Utensils size={8} />
                                </div>
                            </div>
                        ))}
                        <div className="pl-3 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                            Fast Delivery
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default RestaurantCard