import { useNavigate } from 'react-router-dom'
import { getImageUrl } from '../utils/helpers'
import { MapPin, Utensils, ArrowRight, Star, Clock, Dot, BadgePercent } from 'lucide-react'
import { motion } from 'framer-motion'

const RestaurantCard = ({ restaurant }) => {
    const navigate = useNavigate()

    // Deterministic mock data based on restaurant ID for consistency
    const getMockData = (id) => {
        const seed = id * 12345
        const rating = (4 + (seed % 10) / 10).toFixed(1)
        const time = 20 + (seed % 25)
        const price = 200 + (seed % 400)
        const offer = seed % 3 === 0 ? '20% OFF up to Rs120' : seed % 5 === 0 ? 'Free delivery' : null
        return { rating, time, price, offer }
    }

    const { rating, time, price, offer } = getMockData(restaurant.id)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -6 }}
            className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-500 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-[0_24px_50px_rgba(15,23,42,0.12)]"
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
        >
            <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                {restaurant.logo ? (
                    <>
                        <img
                            src={getImageUrl(restaurant.logo)}
                            alt={restaurant.name}
                            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />
                    </>
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 text-slate-200">
                        <Utensils size={48} strokeWidth={1} />
                    </div>
                )}

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md ${
                        restaurant.is_active
                            ? 'border-emerald-300/40 bg-emerald-500/90 text-white'
                            : 'border-white/15 bg-slate-800/90 text-slate-300'
                    }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${restaurant.is_active ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
                        {restaurant.is_active ? 'Open now' : 'Closed'}
                    </div>
                    {offer && (
                        <div className="flex items-center gap-1.5 rounded-full border border-rose-200/40 bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-600 shadow-xl">
                            <BadgePercent size={12} />
                            {offer}
                        </div>
                    )}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <p className="line-clamp-1 text-xl font-black tracking-tight text-white drop-shadow-sm">
                                {restaurant.name}
                            </p>
                            <p className="mt-1 line-clamp-1 text-[12px] font-semibold text-white/80">
                                {restaurant.cuisine || 'Popular local favourites'}
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-md transition-all group-hover:bg-white/15">
                            View
                            <ArrowRight size={12} />
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-bold text-slate-500">
                            {restaurant.cuisine || 'Kerala, Indian, Fast Food'}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-white shadow-sm">
                        <span className="text-[11px] font-black leading-none">{rating}</span>
                        <Star size={10} fill="currentColor" stroke="none" />
                    </div>
                </div>

                <div className="mb-4 flex items-center text-[13px] font-bold tracking-tight text-slate-500">
                    <div className="flex items-center gap-1 text-slate-800">
                        <Clock size={13} className="text-primary-500" strokeWidth={3} />
                        <span>{time}-{time + 5} mins</span>
                    </div>
                    <Dot className="text-slate-300" strokeWidth={4} />
                    <span className="text-slate-500">Rs{price} for two</span>
                </div>

                <p className="mb-5 flex items-center gap-1.5 line-clamp-1 text-[13px] font-medium text-slate-400">
                    <MapPin size={13} className="shrink-0 text-slate-300" />
                    {restaurant.address}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Fast delivery
                        </span>
                        <span className="rounded-full bg-primary-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary-700">
                            Trending
                        </span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {restaurant.is_active ? 'Order now' : 'Check later'}
                    </span>
                </div>
            </div>
        </motion.div>
    )
}

export default RestaurantCard
