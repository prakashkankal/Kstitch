import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Searchbar from './Searchbar';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Check if current page is an authentication page
    const isAuthPage = ['/register', '/login', '/signup'].includes(location.pathname);

    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    // Check if user is logged in
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
    }, [location.pathname]); // Re-check when route changes

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.profile-dropdown')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showDropdown]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        setShowDropdown(false);
        navigate('/');
    };

    // Get user initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <nav className="sticky top-0 z-50 w-full h-16 flex items-center justify-between px-6 py-3 bg-white/60 shadow-lg shadow-violet-500/5 backdrop-blur-3xl border-b border-white/50 transition-all duration-300">
            <div className="shrink-0">
                <Link to="/">
                    <h4 className="text-2xl font-bold tracking-tight cursor-pointer bg-linear-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent font-serif hover:opacity-80 transition-opacity">StyleEase</h4>
                </Link>
            </div>

            {/* Hide searchbar on auth pages */}
            {!isAuthPage && (
                <div className="flex-1 max-w-xl mx-6">
                    <Searchbar />
                </div>
            )}

            <div className="flex items-center gap-6 shrink-0">
                {!isAuthPage && location.pathname !== '/register' && (
                    <Link to="/register" className="text-sm font-medium text-slate-700 hover:text-violet-600 transition-colors tracking-wide">Become a Tailor</Link>
                )}

                {/* Show Login button if not logged in, Profile Avatar if logged in */}
                {user ? (
                    <div className="relative profile-dropdown">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-full hover:bg-white/80 transition-all shadow-lg border border-white/50 backdrop-blur-md cursor-pointer"
                        >
                            {user.profilePhoto ? (
                                <img
                                    src={user.profilePhoto}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm">
                                    {getInitials(user.name)}
                                </div>
                            )}
                            <span className="text-sm font-semibold text-slate-900 hidden md:block">{user.name.split(' ')[0]}</span>
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-linear-to-br from-violet-50 to-fuchsia-50">
                                    <p className="font-semibold text-slate-900">{user.name}</p>
                                    <p className="text-sm text-slate-600 truncate">{user.email}</p>
                                </div>
                                <div className="p-2">
                                    <Link
                                        to="/profile"
                                        onClick={() => setShowDropdown(false)}
                                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-violet-50 rounded-lg transition-colors"
                                    >
                                        My Profile
                                    </Link>
                                    <Link
                                        to="/orders"
                                        onClick={() => setShowDropdown(false)}
                                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-violet-50 rounded-lg transition-colors"
                                    >
                                        My Orders
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Only show login button if NOT on auth pages
                    !isAuthPage && (
                        <Link to="/login" className="px-6 py-2.5 text-sm font-semibold bg-white/60 text-slate-900 rounded-full hover:bg-violet-600 hover:text-white transition-all shadow-lg hover:shadow-violet-500/20 border border-white/50 backdrop-blur-md cursor-pointer">
                            Login
                        </Link>
                    )
                )}
            </div>
        </nav>
    )
}

export default Navbar