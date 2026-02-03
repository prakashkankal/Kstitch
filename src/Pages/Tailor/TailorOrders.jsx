import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardSidebar from '../../components/Tailor/DashboardSidebar'
import API_URL from '../../config/api'

const TailorOrders = () => {
    const navigate = useNavigate();
    const [tailorData, setTailorData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [updatingOrder, setUpdatingOrder] = useState(null); // Track which order is being updated

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            navigate('/login');
            return;
        }
        try {
            const user = JSON.parse(userInfo);
            if (user.role !== 'tailor' && user.userType !== 'tailor') {
                navigate('/');
                return;
            }
            setTailorData(user);
        } catch (error) {
            navigate('/login');
        }
    }, [navigate]);

    // Fetch orders from backend
    useEffect(() => {
        const fetchOrders = async () => {
            if (!tailorData?._id) return;

            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_URL}/api/orders/${tailorData._id}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data.orders || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [tailorData]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleUpdateTailorData = (updatedData) => {
        setTailorData(updatedData);
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setUpdatingOrder(orderId);

            const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status');
            }

            // Refresh orders list
            const ordersResponse = await fetch(`${API_URL}/api/orders/${tailorData._id}`);
            if (ordersResponse.ok) {
                const data = await ordersResponse.json();
                setOrders(data.orders || []);
            }

            alert(`Order status updated to "${newStatus}"`);
        } catch (err) {
            console.error('Error updating status:', err);
            alert(err.message || 'Failed to update order status');
        } finally {
            setUpdatingOrder(null);
        }
    };

    // Calculate stats from orders
    const stats = {
        total: orders.length,
        orderCreated: orders.filter(o => o.status === 'Order Created').length,
        cuttingCompleted: orders.filter(o => o.status === 'Cutting Completed').length,
        orderCompleted: orders.filter(o => o.status === 'Order Completed').length,
        // Legacy statuses
        inProgress: orders.filter(o => o.status === 'In Progress').length,
        completed: orders.filter(o => o.status === 'Completed').length,
        pending: orders.filter(o => o.status === 'Pending').length,
    };

    // Filter orders by status
    const filteredOrders = selectedStatus === 'All'
        ? orders
        : orders.filter(order => order.status === selectedStatus);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format price
    const formatPrice = (price) => {
        return `₹${price.toLocaleString('en-IN')}`;
    };

    // Get shortened order ID
    const getShortenedId = (id) => {
        return `ORD-${id.slice(-6).toUpperCase()}`;
    };

    if (!tailorData) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-[#f5f5f0]">
                <div className="text-slate-600 text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen flex bg-[#f5f5f0] text-slate-900 overflow-x-hidden">
            {/* Sidebar with Profile Modal */}
            <DashboardSidebar
                tailorData={tailorData}
                onLogout={handleLogout}
                onUpdateTailorData={handleUpdateTailorData}
            />

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 p-3 pb-24 md:p-6 lg:p-8 dashboard-main-mobile min-w-0">
                <header className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 mb-1 md:mb-2">Orders</h1>
                    <p className="text-sm md:text-base text-slate-500">Manage all your customer orders</p>
                </header>

                {/* Stats Cards - Synced for Mobile & Desktop */}
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 md:gap-6 mb-6 md:mb-8">
                    <div className="bg-white border border-slate-200 p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm">
                        <p className="text-slate-500 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 uppercase tracking-wider md:normal-case">Total</p>
                        <p className="text-xl md:text-3xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm">
                        <p className="text-slate-500 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 uppercase tracking-wider md:normal-case">Drafts</p>
                        <p className="text-xl md:text-3xl font-bold text-amber-600">{stats.orderCreated + stats.inProgress}</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm">
                        <p className="text-slate-500 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 uppercase tracking-wider md:normal-case">Stitching</p>
                        <p className="text-xl md:text-3xl font-bold text-blue-600">{stats.cuttingCompleted}</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm">
                        <p className="text-slate-500 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 uppercase tracking-wider md:normal-case">Ready</p>
                        <p className="text-xl md:text-3xl font-bold text-emerald-600">{stats.orderCompleted + stats.completed}</p>
                    </div>
                </div>

                {/* Status Filters - Redesigned for Mobile (Horizontal Pills) */}
                <div className="mb-6 overflow-x-auto no-scrollbar pb-2">
                    <div className="flex gap-2 min-w-max md:flex-wrap md:min-w-0">
                        {['All', 'Order Created', 'Cutting Completed', 'Stitching', 'Order Completed', 'Delivered'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status === 'Stitching' ? 'Cutting Completed' : status)}
                                className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap ${(selectedStatus === status || (status === 'Stitching' && selectedStatus === 'Cutting Completed'))
                                    ? 'bg-[#6b4423] text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Section Title */}
                <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 px-1">Orders</h2>

                {/* Orders Display */}
                {/* Orders Display */}
                <div className="bg-white border border-slate-200 rounded-2xl md:overflow-hidden min-h-[300px] shadow-sm">
                    <div className="hidden md:block p-6 border-b border-white/50">
                        <h2 className="text-xl font-bold text-slate-800">
                            {selectedStatus === 'All' ? 'All Orders' : `${selectedStatus} Orders`}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b4423]"></div>
                            <p className="mt-4 text-slate-600">Loading orders...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <div className="text-red-600 text-lg mb-2 flex items-center justify-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Error
                            </div>
                            <p className="text-slate-600">{error}</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="flex justify-center mb-4">
                                <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <p className="text-slate-800 font-bold text-lg">No orders yet</p>
                            <p className="text-slate-500 text-sm">
                                {selectedStatus === 'All'
                                    ? 'Orders will appear here once customers place them.'
                                    : `No ${selectedStatus.toLowerCase()} orders found.`}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile View: Compact List Layout (Dashboard Style) */}
                            <div className="md:hidden flex flex-col divide-y divide-gray-100 bg-white">
                                {filteredOrders.map((order) => {
                                    // Inline due date logic for simplicity
                                    let dateText = '-';
                                    let dateClass = 'text-slate-500';

                                    if (order.dueDate) {
                                        const today = new Date(); today.setHours(0, 0, 0, 0);
                                        const due = new Date(order.dueDate); due.setHours(0, 0, 0, 0);
                                        const diffTime = due.getTime() - today.getTime();
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                        const dateStr = new Date(order.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                                        if (diffDays < 0) {
                                            dateText = `${dateStr} (${Math.abs(diffDays)}d overdue)`;
                                            dateClass = 'text-red-600 font-bold';
                                        } else if (diffDays === 0) {
                                            dateText = `${dateStr} (Today!)`;
                                            dateClass = 'text-orange-600 font-bold';
                                        } else if (diffDays <= 3) {
                                            dateText = `${dateStr} (${diffDays}d left)`;
                                            dateClass = 'text-amber-600 font-medium';
                                        } else {
                                            dateText = dateStr;
                                            dateClass = 'text-slate-600';
                                        }
                                    }

                                    return (
                                        <div
                                            key={order._id}
                                            onClick={() => navigate(`/orders/${order._id}`)}
                                            className="flex items-center justify-between p-3 active:bg-slate-50 transition-colors cursor-pointer min-h-[72px]"
                                        >
                                            {/* Left: Customer & ID */}
                                            <div className="flex flex-col min-w-0 flex-1 pr-3">
                                                <p className="text-base font-bold text-slate-800 truncate mb-0.5">
                                                    {order.customerName}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-slate-500">
                                                        #{order._id.slice(-6).toUpperCase()}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">•</span>
                                                    <span className="text-xs font-bold text-slate-700">
                                                        {formatPrice(order.price)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Center: Status & Due Date */}
                                            <div className="flex flex-col items-center min-w-[100px] px-2">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-1 whitespace-nowrap ${order.status === 'Order Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    order.status === 'Cutting Completed' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'Order Created' ? 'bg-amber-100 text-amber-700' :
                                                            order.status === 'Delivered' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                                                                'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {order.status === 'Cutting Completed' ? 'Stitching' : order.status}
                                                </span>
                                                <span className={`text-xs ${dateClass} text-center`}>
                                                    {dateText.replace(/ \(.*\)/, '')}
                                                    {dateText.includes('overdue') && <span className="block text-[10px] font-extrabold text-red-600">Overdue</span>}
                                                    {dateText.includes('Today') && <span className="block text-[10px] font-extrabold text-orange-600">Today</span>}
                                                    {dateText.includes('left') && <span className="block text-[10px] font-bold text-amber-600">{dateText.match(/\d+d left/)?.[0]}</span>}
                                                </span>
                                            </div>

                                            {/* Right: Quick Action Icon */}
                                            <div
                                                className="pl-3 shrink-0"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {order.status === 'Order Created' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order._id, 'Cutting Completed')}
                                                        disabled={updatingOrder === order._id}
                                                        className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-all outline-none"
                                                    >
                                                        {updatingOrder === order._id ? (
                                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                )}
                                                {order.status === 'Cutting Completed' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order._id, 'Order Completed')}
                                                        disabled={updatingOrder === order._id}
                                                        className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center hover:bg-green-100 active:scale-95 transition-all outline-none"
                                                    >
                                                        {updatingOrder === order._id ? (
                                                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                )}
                                                {order.status === 'Order Completed' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/orders/${order._id}`);
                                                        }}
                                                        className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all outline-none"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {order.status === 'Delivered' && (
                                                    <div className="w-10 h-10 text-slate-300 flex items-center justify-center">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop View: Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/40">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Order ID</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Customer</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Phone</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Item</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Due Date</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Amount</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => (
                                            <tr key={order._id} className="border-t border-white/30 hover:bg-white/20 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                    {getShortenedId(order._id)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700">{order.customerName}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{order.customerPhone}</td>
                                                <td className="px-6 py-4 text-sm text-slate-700">{order.orderType}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'Order Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        order.status === 'Cutting Completed' ? 'bg-blue-100 text-blue-700' :
                                                            order.status === 'Order Created' ? 'bg-amber-100 text-amber-700' :
                                                                order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                                    order.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                                                                        order.status === 'Delivered' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                                                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                                                'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {order.status === 'Cutting Completed' ? 'Stitching' : order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {order.dueDate ? formatDate(order.dueDate) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                                    {formatPrice(order.price)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {order.status === 'Order Created' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'Cutting Completed')}
                                                            disabled={updatingOrder === order._id}
                                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {updatingOrder === order._id ? 'Updating...' : 'Mark Cutting Complete'}
                                                        </button>
                                                    )}
                                                    {order.status === 'Cutting Completed' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'Order Completed')}
                                                            disabled={updatingOrder === order._id}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {updatingOrder === order._id ? 'Updating...' : 'Mark Order Complete'}
                                                        </button>
                                                    )}
                                                    {order.status === 'Order Completed' && (
                                                        <button
                                                            onClick={() => navigate(`/orders/${order._id}`)}
                                                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                            </svg>
                                                            Deliver
                                                        </button>
                                                    )}
                                                    {order.status === 'Delivered' && (
                                                        <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                            Delivered
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Mobile Bottom Spacer */}
                <div className="h-24 md:hidden"></div>
            </main>
        </div>
    )
}

export default TailorOrders
