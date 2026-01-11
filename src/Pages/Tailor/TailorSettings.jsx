import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardSidebar from '../../components/Tailor/DashboardSidebar'

const TailorSettings = () => {
    const navigate = useNavigate();
    const [tailorData, setTailorData] = useState(null);

    // Business hours state
    const [businessHours, setBusinessHours] = useState({
        Monday: { open: '09:00', close: '18:00', closed: false },
        Tuesday: { open: '09:00', close: '18:00', closed: false },
        Wednesday: { open: '09:00', close: '18:00', closed: false },
        Thursday: { open: '09:00', close: '18:00', closed: false },
        Friday: { open: '09:00', close: '18:00', closed: false },
        Saturday: { open: '09:00', close: '18:00', closed: false },
        Sunday: { open: '09:00', close: '18:00', closed: true }
    });

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            navigate('/login');
            return;
        }
        try {
            const user = JSON.parse(userInfo);
            if (user.userType !== 'tailor') {
                navigate('/');
                return;
            }
            setTailorData(user);
        } catch (error) {
            navigate('/login');
        }
    }, [navigate]);

    // Initialize business hours when tailorData loads
    useEffect(() => {
        if (tailorData?.businessHours) {
            const hours = {};
            if (tailorData.businessHours instanceof Map) {
                tailorData.businessHours.forEach((value, key) => {
                    hours[key] = value;
                });
            } else {
                Object.assign(hours, tailorData.businessHours);
            }
            setBusinessHours(hours);
        }
    }, [tailorData]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleHoursChange = (day, field, value) => {
        setBusinessHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }));
    };

    const handleUpdateTailorData = (updatedData) => {
        setTailorData(updatedData);
    };

    if (!tailorData) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-[#f5f5f0]">
                <div className="text-slate-600 text-lg">Loading...</div>
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
                <header className="mb-8">
                    <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2">Settings ⚙️</h1>
                    <p className="text-slate-500">Manage your account and preferences</p>
                </header>

                <div className="space-y-6">
                    {/* Business Hours */}
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Business Hours</h2>
                        <div className="space-y-4">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                <div key={day} className="flex items-center justify-between">
                                    <span className="text-slate-700 font-medium w-32">{day}</span>
                                    <div className="flex gap-4 items-center">
                                        <input
                                            type="time"
                                            value={businessHours[day]?.open || '09:00'}
                                            onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                            disabled={businessHours[day]?.closed}
                                            className="px-4 py-2 rounded-lg bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <span className="text-slate-500">to</span>
                                        <input
                                            type="time"
                                            value={businessHours[day]?.close || '18:00'}
                                            onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                            disabled={businessHours[day]?.closed}
                                            className="px-4 py-2 rounded-lg bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={businessHours[day]?.closed || false}
                                                onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                                                className="w-4 h-4 rounded"
                                                style={{ accentColor: '#6b4423' }}
                                            />
                                            <span className="text-sm text-slate-600">Closed</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-xs text-slate-500">Business hours can be saved with your profile updates via the profile modal (click your shop name in the sidebar).</p>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Notification Preferences</h2>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span className="text-slate-700">Email Notifications</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" style={{ accentColor: '#6b4423' }} />
                            </label>
                            <label className="flex items-center justify-between">
                                <span className="text-slate-700">SMS Notifications</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" style={{ accentColor: '#6b4423' }} />
                            </label>
                            <label className="flex items-center justify-between">
                                <span className="text-slate-700">Order Updates</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" style={{ accentColor: '#6b4423' }} />
                            </label>
                            <label className="flex items-center justify-between">
                                <span className="text-slate-700">Customer Messages</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" style={{ accentColor: '#6b4423' }} />
                            </label>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default TailorSettings
