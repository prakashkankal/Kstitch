import React, { useState, useEffect } from 'react'
import axios from 'axios'

const RecentOrders = ({ tailorId }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentOrders = async () => {
            if (!tailorId) return;

            try {
                setLoading(true);
                const { data } = await axios.get(`http://localhost:5000/api/orders/recent/${tailorId}?limit=5`);
                setOrders(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching recent orders:', err);
                setError('Failed to load recent orders');
            } finally {
                setLoading(false);
            }
        };

        fetchRecentOrders();
    }, [tailorId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'short' };
        return date.toLocaleDateString('en-US', options);
    };

    if (error) {
        return (
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg shadow-violet-500/5 p-6">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg shadow-violet-500/5 overflow-hidden flex flex-col flex-1">
            <div className="p-6 border-b border-white/40 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Recent Orders</h3>
                <button className="text-sm font-semibold text-violet-600 hover:text-violet-700">View All</button>
            </div>

            {loading ? (
                <div className="p-8 text-center text-slate-500">
                    <div className="animate-pulse">Loading orders...</div>
                </div>
            ) : orders.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-lg font-medium">No orders yet</p>
                    <p className="text-sm mt-2">Your recent orders will appear here</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/30 text-slate-500 text-sm">
                            <tr>
                                <th className="px-6 py-4 font-medium">Order ID</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/40">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-white/30 transition-colors">
                                    <td className="px-6 py-4 text-slate-800 font-medium">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{order.customerName}</td>
                                    <td className="px-6 py-4 text-slate-600">{order.orderType}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                                order.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                                                    order.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-slate-100 text-slate-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-800 font-bold">
                                        ₹{order.price.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">
                                        {formatDate(order.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default RecentOrders
