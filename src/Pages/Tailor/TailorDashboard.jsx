import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardStats from '../../components/Tailor/DashboardStats'
import RecentOrders from '../../components/Tailor/RecentOrders'
import DashboardSidebar from '../../components/Tailor/DashboardSidebar'

const TailorDashboard = () => {
    const navigate = useNavigate();
    const [tailorData, setTailorData] = useState(null);

    useEffect(() => {
        // Get logged-in tailor data from localStorage
        const userInfo = localStorage.getItem('userInfo');

        if (!userInfo) {
            // Not logged in, redirect to login
            navigate('/login');
            return;
        }

        try {
            const user = JSON.parse(userInfo);

            // Check if user is a tailor
            if (user.userType !== 'tailor') {
                // Not a tailor, redirect to home
                navigate('/');
                return;
            }

            setTailorData(user);
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleUpdateTailorData = (updatedData) => {
        setTailorData(updatedData);
    };

    // Get first name from full name
    const getFirstName = (name) => {
        if (!name) return 'Tailor';
        return name.split(' ')[0];
    };

    if (!tailorData) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-[#f5f5f0]">
                <div className="text-slate-600 text-lg">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen flex bg-[#f5f5f0] text-slate-900">
            {/* Sidebar with Profile Modal */}
            <DashboardSidebar
                tailorData={tailorData}
                onLogout={handleLogout}
                onUpdateTailorData={handleUpdateTailorData}
            />

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-slate-800">
                            Welcome back, {getFirstName(tailorData.name)}! 👋
                        </h1>
                        <p className="text-slate-500">Here's what's happening in your shop today.</p>
                    </div>

                    {/* Mobile: Show Shop Info */}
                    <div className="lg:hidden bg-white/60 p-3 rounded-xl border border-white/50">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-linear-to-br from-[#6b4423] to-[#8b5a3c] rounded-full flex items-center justify-center text-white font-bold text-xs">
                                {tailorData.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800">{tailorData.shopName}</p>
                                <p className="text-xs text-slate-500">{tailorData.email}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <DashboardStats tailorId={tailorData._id} />
                <RecentOrders tailorId={tailorData._id} />
            </main>
        </div>
    )
}

export default TailorDashboard


