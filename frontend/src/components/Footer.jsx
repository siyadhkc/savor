import { Link } from 'react-router-dom'
import { Utensils, MapPin, Phone, Mail, ArrowRight } from 'lucide-react'

const Footer = () => {
    const socialLinks = [
        {
            name: 'Instagram',
            href: '#',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
            )
        },
        {
            name: 'Twitter / X',
            href: '#',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
            )
        },
        {
            name: 'Facebook',
            href: '#',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
            )
        },
    ]

    return (
        <footer className="bg-slate-950 text-white overflow-hidden">

            {/* ── Main footer grid ─────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-16 mb-14 sm:mb-20">

                    {/* Brand */}
                    <div className="space-y-6">
                        <Link to="/" className="inline-flex items-center gap-2.5 text-white group">
                            <div className="bg-primary-600 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform">
                                <Utensils size={22} strokeWidth={2.5} />
                            </div>
                            <span className="text-2xl font-black italic tracking-tighter">Savor</span>
                        </Link>
                        <p className="text-slate-500 text-sm font-normal leading-relaxed max-w-[220px]">
                            Kerala&apos;s premier food delivery platform — bringing the finest tastes to your doorstep.
                        </p>
                        <div className="flex items-center gap-2.5">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                                    aria-label={link.name}
                                >
                                    {link.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Explore */}
                    <div className="space-y-5">
                        <h5 className="text-white text-xs font-bold uppercase tracking-[0.15em]">Explore</h5>
                        <ul className="space-y-3">
                            {[
                                { label: 'All Restaurants', to: '/restaurants' },
                                { label: 'Browse Cuisines', to: '/restaurants' },
                                { label: 'About Us', to: '#' },
                                { label: 'Our Story', to: '#' },
                                { label: 'Careers', to: '#' },
                            ].map(item => (
                                <li key={item.label}>
                                    <Link
                                        to={item.to}
                                        className="text-slate-500 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5 group"
                                    >
                                        <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-primary-500" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-5">
                        <h5 className="text-white text-xs font-bold uppercase tracking-[0.15em]">Contact</h5>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin size={15} className="text-primary-500 mt-0.5 shrink-0" />
                                <span className="text-slate-500 text-sm font-normal leading-relaxed">
                                    MG Road, Kochi,<br />Kerala — 682016
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={15} className="text-primary-500 shrink-0" />
                                <span className="text-slate-500 text-sm font-normal">+91 484 2345 678</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={15} className="text-primary-500 shrink-0" />
                                <span className="text-slate-500 text-sm font-normal">hello@savor.app</span>
                            </li>
                        </ul>
                    </div>

                    {/* App Download */}
                    <div className="space-y-5">
                        <h5 className="text-white text-xs font-bold uppercase tracking-[0.15em]">Get the App</h5>
                        <p className="text-slate-500 text-sm font-normal leading-relaxed">
                            Order faster with the Savor mobile app. Coming soon.
                        </p>
                        <div className="space-y-2.5">
                            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left group">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 shrink-0">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.31-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.36 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <div>
                                    <p className="text-slate-500 text-[10px] uppercase tracking-wider">Download on the</p>
                                    <p className="text-sm font-semibold text-white group-hover:text-white">App Store</p>
                                </div>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left group">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-primary-500 shrink-0">
                                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L18.66,16.21C19.2,16.53 19.45,17.15 19.24,17.72C19.16,17.96 19,18.17 18.8,18.31C18.1,18.84 17.1,18.69 16.57,17.98L13.69,12L16.81,15.12M20.16,13C20.16,13 20.16,13 20.16,13L16.81,8.88L20.16,13C20.7,13.53 20.7,14.41 20.16,14.94M13.69,12L16.81,8.88L13.69,12Z" />
                                </svg>
                                <div>
                                    <p className="text-slate-500 text-[10px] uppercase tracking-wider">Get it on</p>
                                    <p className="text-sm font-semibold text-white group-hover:text-white">Google Play</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Bottom bar ────────────────────────────────────────────── */}
                <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 text-center sm:text-left">
                    <p className="text-slate-600 text-xs font-normal">
                        &copy; {new Date().getFullYear()} Savor Technologies. All rights reserved.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                        {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map(item => (
                            <Link
                                key={item}
                                to="#"
                                className="text-slate-600 hover:text-slate-300 text-xs font-medium transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
