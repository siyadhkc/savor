import { Link } from 'react-router-dom'
import { Utensils, MapPin, Phone, Mail, ArrowRight } from 'lucide-react'
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube } from 'react-icons/fa6'

const Footer = () => {
    const footerLinks = {
        explore: [
            { label: 'All Restaurants', to: '/restaurants' },
            { label: 'Trending Near You', to: '/restaurants' },
            { label: 'Popular Cuisines', to: '/restaurants' },
            { label: 'Our Story', to: '#' },
            { label: 'Careers', to: '#' },
        ],
        legal: [
            { label: 'Terms of Service', to: '#' },
            { label: 'Privacy Policy', to: '#' },
            { label: 'Cookie Policy', to: '#' },
            { label: 'Compliance', to: '#' },
        ],
        support: [
            { label: 'Help Center', to: '#' },
            { label: 'Partner with Us', to: '/register?mode=restaurant' },
            { label: 'Ride with Us', to: '#' },
            { label: 'Contact Support', to: '#' },
        ]
    }

    const socialLinks = [
        { name: 'Instagram', icon: FaInstagram, href: '#' },
        { name: 'Twitter', icon: FaTwitter, href: '#' },
        { name: 'Facebook', icon: FaFacebook, href: '#' },
        { name: 'Youtube', icon: FaYoutube, href: '#' },
    ]

    return (
        <footer className="bg-slate-950 text-white relative overflow-hidden border-t border-white/5">
            {/* Subtle Gradient Glows */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 blur-[120px] rounded-full -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-600/10 blur-[100px] rounded-full -ml-32 -mb-32" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Upper Section: Newsletter / Brand Bar */}
                <div className="py-16 border-b border-white/5 grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-10">
                    <div className="max-w-2xl">
                        <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                            <div className="bg-primary-600 text-white p-2.5 rounded-[14px] group-hover:rotate-12 transition-transform shadow-lg shadow-primary-600/30">
                                <Utensils size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-3xl font-black italic tracking-tighter">Savor</span>
                        </Link>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white/90 mb-4 leading-tight">
                            Bringing Kerala's finest culinary experiences <br className="hidden sm:block" /> 
                            straight to your doorstep.
                        </h3>
                        <p className="text-slate-500 font-medium max-w-lg mb-0 text-sm sm:text-base">
                            Discover the most loved local brands and premium dining experiences. 
                            Fresh ingredients, lightning fast delivery.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 p-2 rounded-[20px] border border-white/5 backdrop-blur-sm self-start">
                        <div className="pl-4 flex items-center gap-3 min-w-[200px]">
                            <Mail size={18} className="text-slate-400" />
                            <input 
                                type="email" 
                                placeholder="Subscribe for offers" 
                                className="bg-transparent border-none focus:outline-none text-sm font-bold text-white placeholder:text-slate-500 w-full"
                            />
                        </div>
                        <button className="px-6 py-3 bg-white text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-lg">
                            Stay Updated
                        </button>
                    </div>
                </div>

                {/* Middle Section: Links Grid */}
                <div className="py-16 sm:py-24 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
                    {/* Explore */}
                    <div>
                        <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8">Explore</h4>
                        <ul className="space-y-4">
                            {footerLinks.explore.map(link => (
                                <li key={link.label}>
                                    <Link to={link.to} className="text-slate-500 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 group">
                                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary-500" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8">Support</h4>
                        <ul className="space-y-4">
                            {footerLinks.support.map(link => (
                                <li key={link.label}>
                                    <Link to={link.to} className="text-slate-500 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 group">
                                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary-500" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8">Legal</h4>
                        <ul className="space-y-4">
                            {footerLinks.legal.map(link => (
                                <li key={link.label}>
                                    <Link to={link.to} className="text-slate-500 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 group">
                                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary-500" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Social */}
                    <div className="col-span-2 md:col-span-1">
                        <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-8">Contact</h4>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                                    <MapPin size={18} className="text-primary-500" />
                                </div>
                                <p className="text-slate-500 text-sm font-bold leading-relaxed">
                                    Savor HQ, Beach Road, Kozhikode<br />Kerala — 673001
                                </p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                                    <Mail size={18} className="text-primary-500" />
                                </div>
                                <p className="text-slate-500 text-sm font-bold">hello@savor.app</p>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                {socialLinks.map(social => (
                                    <a 
                                        key={social.name}
                                        href={social.href}
                                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary-600/20 hover:border-primary-500/30 transition-all shadow-sm active:scale-95"
                                    >
                                        <social.icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left text-xs font-black uppercase tracking-[0.2em]">
                    <div className="text-slate-600">
                        &copy; {new Date().getFullYear()} Savor Technologies. Built in Kerala for the world.
                    </div>
                    <div className="flex gap-8 text-slate-600">
                        <Link to="#" className="hover:text-white transition-colors">T&C</Link>
                        <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="#" className="hover:text-white transition-colors">Status</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
