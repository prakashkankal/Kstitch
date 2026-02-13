import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DashboardSidebar from '../../components/Tailor/DashboardSidebar';
import API_URL from '../../config/api';

const TailorCustomerDetails = () => {
    const { phone } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { customerData } = location.state || {};

    const [tailorData, setTailorData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

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
        } catch (parseError) {
            console.error('Failed to parse user info', parseError);
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!tailorData?._id || !phone) return;

            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/orders/${tailorData._id}?customerPhone=${encodeURIComponent(phone)}&limit=100`);

                if (!response.ok) {
                    throw new Error('Failed to fetch customer orders');
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
    }, [tailorData, phone]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleUpdateTailorData = (updatedData) => {
        setTailorData(updatedData);
    };

    const getInitials = (name) => {
        if (!name) return 'C';
        const names = name.split(' ');
        return names.length >= 2 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Order Created':
                return 'bg-blue-100 text-blue-800';
            case 'Cutting Completed':
                return 'bg-purple-100 text-purple-800';
            case 'Order Completed':
            case 'Payment Completed':
                return 'bg-green-100 text-green-800';
            case 'Delivered':
                return 'bg-gray-100 text-gray-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => `\u20B9${(Number(price) || 0).toLocaleString('en-IN')}`;

    const getDisplayRemaining = (order) => {
        if (typeof order?.remainingAmount === 'number') return Math.max(order.remainingAmount, 0);
        const total = Number(order?.price || 0);
        const paid = Number(order?.advancePayment || 0) + Number(order?.finalPaymentAmount || 0);
        return Math.max(total - paid, 0);
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            setDetailsLoading(true);
            const response = await fetch(`${API_URL}/api/orders/details/${orderId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }
            const data = await response.json();
            setSelectedOrder(data?.order || null);
            setShowOrderDetails(true);
        } catch (err) {
            alert(err.message || 'Unable to open order details');
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeOrderDetails = () => {
        setShowOrderDetails(false);
        setSelectedOrder(null);
    };

    const renderMeasurements = (measurements) => {
        if (!measurements || Object.keys(measurements).length === 0) {
            return <p className="text-xs text-slate-500">No measurements recorded.</p>;
        }

        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(measurements).map(([key, value]) => (
                    <div key={key} className="bg-white border border-slate-200 rounded-lg p-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-xs font-semibold text-slate-800">{String(value)}</p>
                    </div>
                ))}
            </div>
        );
    };

    const calculatedStats = {
        totalSpent: orders.reduce((sum, order) => sum + (order.price || 0), 0),
        totalOrders: orders.length,
        lastOrderDate: orders.length > 0 ? orders[0].createdAt : null
    };

    const displayData = {
        name: customerData?.name || (orders[0]?.customerName || 'Customer'),
        email: customerData?.email || (orders[0]?.customerEmail || '-'),
        phone: decodeURIComponent(phone),
        spent: customerData?.totalSpent || calculatedStats.totalSpent,
        orderCount: customerData?.orders || calculatedStats.totalOrders
    };

    if (!tailorData) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <div className="w-full min-h-screen flex bg-[#f5f5f0] text-slate-900 overflow-x-hidden">
            <DashboardSidebar
                tailorData={tailorData}
                onLogout={handleLogout}
                onUpdateTailorData={handleUpdateTailorData}
            />

            <main className="flex-1 lg:ml-72 p-4 pb-24 md:p-8 min-w-0">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-slate-500 hover:text-[#6b4423] mb-6 transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Customers
                </button>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                    <div className="w-20 h-20 bg-linear-to-br from-[#6b4423] to-[#8b5a3c] rounded-full flex items-center justify-center text-white font-bold text-3xl shrink-0 shadow-md">
                        {getInitials(displayData.name)}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 mb-2">{displayData.name}</h1>
                        <div className="flex flex-col md:flex-row gap-3 md:gap-6 text-slate-600 justify-center md:justify-start">
                            <span className="flex items-center gap-1.5 justify-center md:justify-start">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {displayData.phone}
                            </span>
                            <span className="flex items-center gap-1.5 justify-center md:justify-start">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {displayData.email}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-4 md:gap-8 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 pl-0 md:pl-8 mt-2 md:mt-0 w-full md:w-auto justify-center md:justify-start">
                        <div className="text-center md:text-left">
                            <p className="text-xs text-slate-400 uppercase tracking-wide">Orders</p>
                            <p className="text-xl font-bold text-slate-800">{displayData.orderCount}</p>
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-xs text-slate-400 uppercase tracking-wide">Total Spent</p>
                            <p className="text-xl font-bold text-[#6b4423]">{formatPrice(displayData.spent)}</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6b4423]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
                        {error}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl text-center border border-dashed border-slate-300">
                        <p className="text-slate-500">No orders found for this customer.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg md:text-xl font-bold text-slate-800">Order History</h2>
                            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{orders.length} Orders</span>
                        </div>

                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 font-semibold">
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Garment Type</th>
                                        <th className="px-6 py-4">Stitching Date</th>
                                        <th className="px-6 py-4">Completed Date</th>
                                        <th className="px-6 py-4">Delivery Date</th>
                                        <th className="px-6 py-4 text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map((order) => (
                                        <tr
                                            key={order._id}
                                            onClick={() => fetchOrderDetails(order._id)}
                                            className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-[#6b4423] text-sm">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                </span>
                                                <div className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusBadge(order.status)}`}>
                                                    {order.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                                                {order.orderItems && order.orderItems.length > 0
                                                    ? order.orderItems.map((i) => i.garmentType).join(', ')
                                                    : order.orderType || 'Custom'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {order.cuttingCompletedAt ? formatDate(order.cuttingCompletedAt) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {order.completedAt ? formatDate(order.completedAt) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {order.deliveredAt ? formatDate(order.deliveredAt) : (
                                                    order.status === 'Delivered' ? 'Delivered' : '-'
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">
                                                {formatPrice(order.price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden divide-y divide-slate-100">
                            {orders.map((order) => (
                                <button
                                    key={order._id}
                                    type="button"
                                    onClick={() => fetchOrderDetails(order._id)}
                                    className="w-full text-left p-4 space-y-3"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-bold text-[#6b4423] text-sm">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </span>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {order.orderItems && order.orderItems.length > 0
                                                    ? order.orderItems.map((i) => i.garmentType).join(', ')
                                                    : order.orderType || 'Custom'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800 text-sm">{formatPrice(order.price)}</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-1 ${getStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50">
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Stitching</p>
                                            <p className="text-xs text-slate-700 font-medium">
                                                {order.cuttingCompletedAt ? formatDate(order.cuttingCompletedAt) : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Completed</p>
                                            <p className="text-xs text-slate-700 font-medium">
                                                {order.completedAt ? formatDate(order.completedAt) : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Delivery</p>
                                            <p className="text-xs text-slate-700 font-medium">
                                                {order.deliveredAt ? formatDate(order.deliveredAt) : (
                                                    order.status === 'Delivered' ? 'Delivered' : '-'
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {(detailsLoading || showOrderDetails) && (
                <div className="fixed inset-0 z-[140]">
                    {detailsLoading && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                            <div className="bg-white rounded-xl px-5 py-4 shadow-xl border border-slate-200 flex items-center gap-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#6b4423]"></div>
                                <p className="text-sm font-medium text-slate-700">Loading order details...</p>
                            </div>
                        </div>
                    )}

                    {showOrderDetails && selectedOrder && (
                        <div className="absolute inset-0 bg-black/45 backdrop-blur-sm p-3 sm:p-6 flex items-end sm:items-center justify-center">
                            <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
                                <div className="bg-linear-to-r from-[#6b4423] to-[#8b5a3c] text-white p-4 sm:p-6 flex items-start justify-between">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold">Order Details</h2>
                                        <p className="text-white/85 text-xs sm:text-sm mt-1">ID: #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <button
                                        onClick={closeOrderDetails}
                                        className="h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-82px)] space-y-4 sm:space-y-5">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusBadge(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                        <p className="text-xs text-slate-500">Due: {formatDate(selectedOrder.dueDate)}</p>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <h3 className="text-sm font-bold text-slate-800 mb-3">Order Timeline</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                                            <p className="text-slate-700"><span className="font-semibold">Order Created:</span> {formatDateTime(selectedOrder.createdAt)}</p>
                                            <p className="text-slate-700"><span className="font-semibold">Cutting Completed:</span> {formatDateTime(selectedOrder.cuttingCompletedAt)}</p>
                                            <p className="text-slate-700"><span className="font-semibold">Order Completed:</span> {formatDateTime(selectedOrder.completedAt)}</p>
                                            <p className="text-slate-700"><span className="font-semibold">Payment Completed:</span> {formatDateTime(selectedOrder.paymentCompletedAt)}</p>
                                            <p className="text-slate-700"><span className="font-semibold">Delivered:</span> {formatDateTime(selectedOrder.deliveredAt)}</p>
                                            <p className="text-slate-700"><span className="font-semibold">Due Date:</span> {formatDate(selectedOrder.dueDate)}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <h3 className="text-sm font-bold text-slate-800 mb-3">Payment Summary</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Amount</p>
                                                <p className="text-sm font-bold text-slate-800">{formatPrice(selectedOrder.price)}</p>
                                            </div>
                                            <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Advance</p>
                                                <p className="text-sm font-bold text-emerald-700">{formatPrice(selectedOrder.advancePayment)}</p>
                                            </div>
                                            <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Final Payment</p>
                                                <p className="text-sm font-bold text-emerald-700">{formatPrice(selectedOrder.finalPaymentAmount)}</p>
                                            </div>
                                            <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Discount</p>
                                                <p className="text-sm font-bold text-amber-700">{formatPrice(selectedOrder.discount || selectedOrder.discountAmount)}</p>
                                            </div>
                                            <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Remaining</p>
                                                <p className="text-sm font-bold text-red-600">{formatPrice(getDisplayRemaining(selectedOrder))}</p>
                                            </div>
                                            <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Payment Status</p>
                                                <p className="text-sm font-bold text-slate-800 capitalize">{selectedOrder.paymentStatus || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <h3 className="text-sm font-bold text-slate-800 mb-3">Items and Measurements</h3>
                                        {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedOrder.orderItems.map((item, index) => (
                                                    <div key={item._id || `${item.garmentType}-${index}`} className="bg-white border border-slate-200 rounded-lg p-3">
                                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                                            <h4 className="text-sm font-semibold text-slate-900">{item.garmentType || 'Custom Item'}</h4>
                                                            <p className="text-xs text-slate-500">Qty {item.quantity || 1}</p>
                                                        </div>
                                                        {renderMeasurements(item.measurements || item.extraMeasurements)}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                                                <p className="text-sm font-semibold text-slate-900 mb-2">{selectedOrder.orderType || 'Custom Order'}</p>
                                                {renderMeasurements(selectedOrder.measurements)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TailorCustomerDetails;
