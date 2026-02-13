import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Shared/Navbar';
import API_URL from '../../config/api';

const CustomerOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
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
            const parsedUser = JSON.parse(userInfo);
            setUser(parsedUser);
            fetchOrders(parsedUser._id);
        } catch (parseError) {
            console.error('Error parsing user info', parseError);
            navigate('/login');
        }
    }, [navigate]);

    const fetchOrders = async (userId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/orders/my-orders/${userId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
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

    const formatPrice = (price) => {
        return `\u20B9${(Number(price) || 0).toLocaleString('en-IN')}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Order Completed':
            case 'Completed':
            case 'Delivered':
            case 'Payment Completed':
                return 'bg-emerald-100 text-emerald-700';
            case 'Cutting Completed':
            case 'Stitching':
                return 'bg-blue-100 text-blue-700';
            case 'Order Created':
            case 'Pending':
            case 'In Progress':
                return 'bg-amber-100 text-amber-700';
            case 'Cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

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

    return (
        <div className="w-full min-h-screen bg-[#faf8f5] pb-24">
            <Navbar showSearchBar={false} />

            <div className="pt-24 px-4 max-w-2xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 font-serif">My Orders</h1>
                    <p className="text-sm text-slate-500">Track your current and past orders</p>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B7355]"></div>
                        <p className="mt-4 text-slate-500 text-sm">Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 bg-red-50 text-red-600 rounded-xl text-center">
                        <p>{error}</p>
                        <button
                            onClick={() => user && fetchOrders(user._id)}
                            className="mt-2 text-sm underline font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No orders yet</h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                            Start exploring tailors near you to place your first order.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 px-6 py-3 bg-[#8B7355] text-white rounded-full text-sm font-semibold shadow-lg shadow-[#8B7355]/20 active:scale-95 transition-transform"
                        >
                            Explore Tailors
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <button
                                key={order._id}
                                type="button"
                                onClick={() => fetchOrderDetails(order._id)}
                                className="w-full text-left bg-white rounded-2xl p-5 shadow-sm border border-gray-100 active:scale-[0.99] transition-transform"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-slate-900 leading-tight">
                                            {order.tailorId?.shopName || 'Unknown Shop'}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                        {order.status === 'Cutting Completed' ? 'Stitching' : order.status}
                                    </span>
                                </div>

                                <div className="border-t border-dashed border-gray-200 my-3"></div>

                                <div className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Total Amount</p>
                                        <p className="font-bold text-slate-800 text-lg">{formatPrice(order.price)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Items</p>
                                        <p className="font-medium text-slate-700">
                                            {order.orderItems?.length > 0
                                                ? `${order.orderItems.length} Items`
                                                : order.orderType || 'Custom Order'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs text-slate-400 font-mono">ID: {order._id.slice(-6).toUpperCase()}</span>
                                    <span className="text-[#8B7355] text-sm font-semibold flex items-center gap-1">
                                        View Details
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {(detailsLoading || showOrderDetails) && (
                <div className="fixed inset-0 z-[120]">
                    {detailsLoading && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                            <div className="bg-white rounded-xl px-5 py-4 shadow-xl border border-slate-200 flex items-center gap-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#8B7355]"></div>
                                <p className="text-sm font-medium text-slate-700">Loading order details...</p>
                            </div>
                        </div>
                    )}

                    {showOrderDetails && selectedOrder && (
                        <div className="absolute inset-0 bg-black/45 backdrop-blur-sm p-3 sm:p-6 flex items-end sm:items-center justify-center">
                            <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
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
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(selectedOrder.status)}`}>
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

export default CustomerOrders;
