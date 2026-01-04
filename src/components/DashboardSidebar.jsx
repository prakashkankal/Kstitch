import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ProfileModal from './ProfileModal'

const DashboardSidebar = ({ tailorData, onLogout, onUpdateTailorData }) => {
    const location = useLocation();
    const [showProfileModal, setShowProfileModal] = useState(false);

    const getInitials = (name) => {
        if (!name) return 'T';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const navItems = [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/dashboard/orders', icon: '🧵', label: 'Orders' },
        { path: '/dashboard/customers', icon: '👥', label: 'Customers' },
        { path: '/dashboard/portfolio', icon: '🖼️', label: 'Portfolio' },
        { path: '/dashboard/settings', icon: '⚙️', label: 'Settings' }
    ];

    return (
        <>
            <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 bg-white/30 backdrop-blur-2xl border-r border-white/60 p-6 z-40">
                <div className="mb-10 pl-2">
                    <h4 className="text-2xl font-bold bg-linear-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent font-serif">StyleEase</h4>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Partner</span>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${location.pathname === item.path
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                : 'text-slate-600 hover:bg-white/40 hover:text-violet-600'
                                }`}
                        >
                            <span>{item.icon}</span> {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto space-y-3">
                    {/* Tailor Profile Card - Click to edit */}
                    <button
                        onClick={() => setShowProfileModal(true)}
                        className="w-full bg-white/40 hover:bg-white/60 p-4 rounded-2xl border border-white/50 hover:border-violet-300 flex items-center gap-3 transition-all cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white/50">
                            {tailorData.shopImage ? (
                                <img
                                    src={tailorData.shopImage}
                                    alt="Shop"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-linear-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm">
                                    {getInitials(tailorData.name)}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-bold text-slate-800 truncate">{tailorData.shopName}</p>
                            <p className="text-xs text-emerald-600 font-medium">Click to edit profile</p>
                        </div>
                        <span className="text-slate-400 group-hover:text-violet-600 transition-colors">⚙️</span>
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={onLogout}
                        className="w-full px-4 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                tailorData={tailorData}
                onUpdate={onUpdateTailorData}
            />
        </>
    );
};

export default DashboardSidebar;
