import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { Truck, Navigation, Clock3 } from 'lucide-react'
import { getOrderLocation } from '../../api/orders'
import { getDeliveryAgentStatusLabel } from '../../utils/orderFlow'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
})

const deliveryIcon = new L.Icon.Default()

// Component to dynamically recenter map
function ChangeView({ center }) {
    const map = useMap()
    useEffect(() => {
        if (center) map.setView(center, map.getZoom())
    }, [center, map])
    return null
}

const LiveTracking = ({ orderId, isPolling = true }) => {
    const [location, setLocation] = useState(null)
    const [status, setStatus] = useState('assigned')
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let interval

        const fetchLocation = async () => {
            try {
                const data = await getOrderLocation(orderId)
                if (data.delivery_lat !== null && data.delivery_lng !== null) {
                    setLocation([data.delivery_lat, data.delivery_lng])
                }
                setStatus(data.delivery_status || 'assigned')
                setLastUpdatedAt(data.last_updated_at)
                setError(null)
            } catch (err) {
                console.error('Tracking failed:', err)
                setError('Unable to refresh live location right now.')
            } finally {
                setLoading(false)
            }
        }

        fetchLocation()
        if (isPolling) {
            interval = setInterval(fetchLocation, 5000)
        }

        return () => clearInterval(interval)
    }, [orderId, isPolling])

    if (loading) {
        return (
            <div className="h-[400px] bg-slate-50 rounded-[32px] flex flex-col items-center justify-center border border-slate-100 italic font-black text-slate-400 p-8 text-center uppercase tracking-widest text-[10px]">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4" />
                Connecting to your rider's live location...
            </div>
        )
    }

    if (!location) {
        return (
            <div className="h-[400px] bg-slate-50 rounded-[32px] flex flex-col items-center justify-center border border-slate-100 p-8 text-center">
                <Navigation className="text-slate-200 mb-4 animate-pulse" size={48} />
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1 italic">Waiting for location</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose max-w-[200px]">
                    {error || 'Your rider will appear here once delivery tracking starts.'}
                </p>
            </div>
        )
    }

    return (
        <div className="relative group">
            <div className="h-[450px] w-full rounded-[40px] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-900/5 z-0 ring-1 ring-slate-100 translate-z-0">
                <MapContainer 
                    center={location} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%', minHeight: '450px' }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={location} icon={deliveryIcon}>
                        <Popup>
                            <div className="flex flex-col gap-1 py-1">
                                <span className="text-[10px] font-black uppercase text-slate-400">Status</span>
                                <span className="text-xs font-bold text-slate-900">{getDeliveryAgentStatusLabel(status)}</span>
                            </div>
                        </Popup>
                    </Marker>
                    <ChangeView center={location} />
                </MapContainer>
            </div>

            {/* Overlays */}
            <div className="absolute top-6 left-6 z-[1000] space-y-3">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white shadow-lg flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">Live tracking active</span>
                </div>
                
                {status === 'delivering' && (
                    <div className="bg-slate-900 px-4 py-2 rounded-2xl shadow-lg border border-white/10 flex items-center gap-3">
                        <Truck size={14} className="text-primary-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Rider is on the way</span>
                    </div>
                )}

                {lastUpdatedAt && (
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white shadow-lg flex items-center gap-3">
                        <Clock3 size={14} className="text-slate-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">
                            Last updated: {new Date(lastUpdatedAt).toLocaleTimeString()}
                        </span>
                    </div>
                )}
            </div>

            {error && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-rose-600 text-white px-6 py-2 rounded-full shadow-2xl text-[10px] font-black uppercase tracking-[0.2em] italic border border-white/20">
                    {error}
                </div>
            )}
        </div>
    )
}

export default LiveTracking
