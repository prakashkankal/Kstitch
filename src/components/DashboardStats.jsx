import React, { useState, useEffect } from 'react'
import axios from 'axios'

const DashboardStats = ({ tailorId }) => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeOrders: 0,
        rating: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!tailorId) return;

            try {
                setLoading(true);
                const { data } = await axios.get(`http://localhost:5000/api/orders/dashboard-stats/${tailorId}`);
                setStats({
                    totalRevenue: data.totalRevenue || 0,
                    activeOrders: data.activeOrders || 0,
                    rating: data.rating || 0
                });
                setError(null);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                setError('Failed to load statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [tailorId]);

    const statsDisplay = [
        {
            title: 'Total Revenue',
            value: loading ? '...' : `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
            icon: '💰',
            change: '+12%'
        },
        {
            title: 'Active Orders',
            value: loading ? '...' : stats.activeOrders,
            icon: '📦',
            change: `+${stats.activeOrders}`
        },
        {
            title: 'Customer Rating',
            value: loading ? '...' : stats.rating.toFixed(1),
            icon: '⭐',
            change: '+0.1'
        },
    ];

    if (error) {
        return (
            <div className="mb-8 p-6 bg-red-100 border border-red-400 text-red-700 rounded-2xl">
                {error}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statsDisplay.map((stat, index) => (
                <div key={index} className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-lg shadow-violet-500/5 hover:shadow-violet-500/10 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-4xl">{stat.icon}</div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">{stat.change}</span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
            ))}
        </div>
    )
}

export default DashboardStats
