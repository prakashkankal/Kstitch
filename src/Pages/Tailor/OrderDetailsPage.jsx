import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardSidebar from '../../components/Tailor/DashboardSidebar';
import API_URL from '../../config/api';

const OrderDetailsPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const dateInputRef = useRef(null);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [editingNotes, setEditingNotes] = useState(false);
    const [notes, setNotes] = useState('');
    const [tailorData, setTailorData] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [discount, setDiscount] = useState(0);
    const [finalPaymentAmount, setFinalPaymentAmount] = useState(0);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [deliveryData, setDeliveryData] = useState(null);
    const [editingMeasurements, setEditingMeasurements] = useState(false);
    const [tempOrderItems, setTempOrderItems] = useState([]);
    const [tempLegacyMeasurements, setTempLegacyMeasurements] = useState({});
    const [expandedItemIndex, setExpandedItemIndex] = useState(null);
    const [editingItemIndex, setEditingItemIndex] = useState(null);

    // New Payment Flow State
    const [showPaymentSection, setShowPaymentSection] = useState(false);
    const [paymentData, setPaymentData] = useState({
        discountAmount: 0,
        payNowAmount: 0,
        paymentMode: '', // 'Pay Now' | 'Pay Later' | 'Partial' | '' (Select Mode)
        payLaterAmount: 0,
        payLaterDate: '',
        cashPaymentMode: 'Cash' // Actual payment method (Cash, UPI, Card, Online)
    });
    const [paymentSummary, setPaymentSummary] = useState({
        grossAmount: 0,
        advancePayment: 0,
        discount: 0,
        finalPayable: 0,
        currentPayment: 0,
        remaining: 0
    });
    const [paymentErrors, setPaymentErrors] = useState({});
    const [showAllSectionsInPayment, setShowAllSectionsInPayment] = useState(false);

    // Post-Delivery Payment State
    const [postDeliveryPayment, setPostDeliveryPayment] = useState({
        amount: '',
        method: 'Cash',
        notes: ''
    });
    const [postDeliveryError, setPostDeliveryError] = useState('');

    // Completion Confirmation Modal State
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    const handleShareInvoice = async () => {
        if (!deliveryData || !order) return;

        try {
            // Fetch the invoice image as a blob
            const invoiceUrl = deliveryData.invoiceImageLink || `${API_URL}/api/orders/${order._id}/invoice-jpg`;
            const response = await fetch(invoiceUrl);
            const blob = await response.blob();

            // Create a file from the blob
            const fileName = `Invoice_${order._id.slice(-6).toUpperCase()}_${order.customerName.replace(/\s+/g, '_')}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });

            // Format phone number with country code
            let phoneNumber = order.customerPhone;
            phoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
            if (!phoneNumber.startsWith('+')) {
                if (phoneNumber.startsWith('91')) {
                    phoneNumber = '+' + phoneNumber;
                } else {
                    phoneNumber = '+91' + phoneNumber;
                }
            }

            // Copy phone number to clipboard for easy pasting in WhatsApp
            try {
                await navigator.clipboard.writeText(phoneNumber);
                // Show brief notification
                const toast = document.createElement('div');
                toast.textContent = `📋 Phone copied: ${phoneNumber}`;
                toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-[9999] animate-fade-in';
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.classList.add('opacity-0', 'transition-opacity');
                    setTimeout(() => document.body.removeChild(toast), 300);
                }, 2000);
            } catch (err) {
                console.log('Clipboard copy failed:', err);
            }

            // Check if Web Share API is available (mobile devices)
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                // Try Web Share API first for automatic attachment
                try {
                    await navigator.share({
                        files: [file]
                    });
                    // If user successfully shares, we're done!
                    setShowDeliveryModal(false);
                    return;
                } catch (shareError) {
                    // If user cancels share sheet, fall through to direct WhatsApp opening
                    if (shareError.name === 'AbortError') {
                        console.log('User cancelled share, opening WhatsApp directly...');
                    } else {
                        throw shareError;
                    }
                }
            }

            // Fallback OR after share cancellation: Download and open WhatsApp directly with customer contact
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Short delay to ensure download starts
            await new Promise(resolve => setTimeout(resolve, 500));

            // Open WhatsApp directly with customer contact (no pre-filled message)
            const whatsappUrl = `https://wa.me/${phoneNumber}`;
            window.open(whatsappUrl, '_blank');

        } catch (error) {
            console.error('Error sharing invoice:', error);
            alert('Failed to share invoice. Please try again.');
        }
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        let cleaned = String(phone).replace(/[\s\-\(\)]/g, '');
        if (!cleaned.startsWith('+')) {
            cleaned = cleaned.startsWith('91') ? `+${cleaned}` : `+91${cleaned}`;
        }
        return cleaned;
    };

    const sendOrderCompletedInvoiceText = (orderData) => {
        if (!orderData?.customerPhone) return;

        const phone = formatPhoneNumber(orderData.customerPhone);
        const orderCode = orderData._id?.toString().slice(-6).toUpperCase() || '';
        const totalAmount = Number(orderData.price || 0).toFixed(2);
        const advance = Number(orderData.advancePayment || 0).toFixed(2);
        const discountValue = Number(orderData.discountAmount ?? orderData.discount ?? 0).toFixed(2);
        const balance = Math.max(0, Number(orderData.price || 0) - Number(orderData.advancePayment || 0) - Number(orderData.discountAmount ?? orderData.discount ?? 0)).toFixed(2);

        // Tailor contact info
        const tailorName = tailorData?.name || 'KStitch';

        const message =
            `*ORDER IS READY FOR DELIVERY*\n\n` +
            `Dear ${orderData.customerName || 'Customer'},\n\n` +
            `We are pleased to inform you that your order has been successfully completed and is now ready for pickup or delivery.\n\n` +
            `Order Details:\n` +
            `Order ID: ${orderCode}\n` +
            `Status: Completed\n\n` +
            `Payment Summary:\n` +
            `Total Amount: ₹${totalAmount}\n` +
            `Advance Paid: ₹${advance}\n` +
            `Discount: ₹${discountValue}\n` +
            `Balance Amount: ₹${balance}\n\n` +
            `Kindly contact us at your earliest convenience to schedule the pickup or arrange delivery. We recommend collecting the order on or before the due date to avoid any inconvenience.\n\n` +
            `Thank you for choosing our tailoring services. We appreciate your trust and look forward to serving you again.\n\n` +
            `Regards,\n${tailorName}\n\n` +
            `Powered by KStitch`;

        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    // Get logged-in tailor data
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
            console.error('Error parsing user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    // Fetch order details
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${API_URL}/api/orders/details/${orderId}`);
                setOrder(data.order);
                setNotes(data.order.notes || '');
                setError(null);
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError(err.response?.data?.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    useEffect(() => {
        if (order) {
            const initialDiscount = order.discount || 0;
            setDiscount(initialDiscount);
            setFinalPaymentAmount(Math.max(0, order.price - (order.advancePayment || 0) - initialDiscount));
        }
    }, [order]);

    useEffect(() => {
        if (!order) return;
        const shouldAutoShowPayment =
            order.status === 'Order Completed' &&
            !order.deliveredAt &&
            order.paymentStatus !== 'paid';
        setShowPaymentSection(shouldAutoShowPayment);
    }, [order?.status, order?.deliveredAt, order?.paymentStatus]);

    // Recalculate final payment when discount changes
    useEffect(() => {
        if (order) {
            const due = Math.max(0, order.price - (order.advancePayment || 0) - (parseFloat(discount) || 0));
            setFinalPaymentAmount(due);
        }
    }, [discount, order]);

    // Payment Calculation Engine
    useEffect(() => {
        if (order && showPaymentSection) {
            calculatePaymentSummary();
        }
    }, [paymentData.discountAmount, paymentData.payNowAmount, paymentData.paymentMode, order, showPaymentSection]);

    const calculatePaymentSummary = () => {
        if (!order) return;

        const gross = order.price;
        const advance = order.advancePayment || 0;
        const discount = parseFloat(paymentData.discountAmount) || 0;
        const finalPayable = Math.max(0, gross - discount - advance);
        const payNow = parseFloat(paymentData.payNowAmount) || 0;
        const remaining = Math.max(0, finalPayable - payNow);

        setPaymentSummary({
            grossAmount: gross,
            advancePayment: advance,
            discount: discount,
            finalPayable: finalPayable,
            currentPayment: payNow,
            remaining: remaining
        });

        // Auto-update payLaterAmount based on mode
        if (paymentData.paymentMode === 'Pay Later') {
            // For Pay Later, pay later amount = full final payable
            if (paymentData.payLaterAmount !== finalPayable) {
                setPaymentData(prev => ({
                    ...prev,
                    payLaterAmount: finalPayable,
                    payNowAmount: 0
                }));
            }
        } else if (paymentData.paymentMode === 'Partial') {
            // For Partial, pay later amount = remaining after pay now
            if (paymentData.payLaterAmount !== remaining) {
                setPaymentData(prev => ({
                    ...prev,
                    payLaterAmount: remaining
                }));
            }
        }
    };

    // Payment Validation
    const validatePayment = () => {
        const errors = {};

        // Payment mode validation
        if (!paymentData.paymentMode || paymentData.paymentMode === '') {
            errors.paymentMode = 'Please select a payment mode';
        }

        // Discount validation
        if (paymentData.discountAmount < 0) {
            errors.discount = 'Discount cannot be negative';
        }
        if (paymentData.discountAmount > order.price) {
            errors.discount = 'Discount cannot exceed order amount';
        }

        // Mode-specific validation
        if (paymentData.paymentMode === 'Pay Now') {
            // Pay Now: Must have payNowAmount > 0 and <= finalPayable
            if (!paymentData.payNowAmount || paymentData.payNowAmount <= 0) {
                errors.payNowAmount = 'Pay Now amount is required and must be greater than 0';
            }
            if (paymentData.payNowAmount > paymentSummary.finalPayable) {
                errors.payNowAmount = 'Pay Now amount cannot exceed final payable amount';
            }
        } else if (paymentData.paymentMode === 'Pay Later') {
            // Pay Later: Must have payLaterDate and payLaterAmount = finalPayable
            if (!paymentData.payLaterDate) {
                errors.payLaterDate = 'Due date is required for Pay Later';
            } else {
                let dueDate;
                if (paymentData.payLaterDate.includes('/')) {
                    const [d, m, y] = paymentData.payLaterDate.split('/');
                    dueDate = new Date(`${y}-${m}-${d}`);
                } else {
                    dueDate = new Date(paymentData.payLaterDate);
                }

                // Compare with start of today to allow setting due date as today
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (dueDate < today) {
                    errors.payLaterDate = 'Due date cannot be in the past';
                }
                if (isNaN(dueDate.getTime())) {
                    errors.payLaterDate = 'Invalid date format';
                }
            }
            if (!paymentData.payLaterAmount || paymentData.payLaterAmount <= 0) {
                errors.payLaterAmount = 'Pay Later amount must be greater than 0';
            }
        } else if (paymentData.paymentMode === 'Partial') {
            // Partial: Must have payNowAmount > 0 and < finalPayable, and payLaterDate for remaining
            if (!paymentData.payNowAmount || paymentData.payNowAmount <= 0) {
                errors.payNowAmount = 'Pay Now amount is required for partial payment';
            }
            if (paymentData.payNowAmount >= paymentSummary.finalPayable) {
                errors.payNowAmount = 'For partial payment, Pay Now amount must be less than final payable';
            }
            if (paymentSummary.remaining > 0) {
                if (!paymentData.payLaterDate) {
                    errors.payLaterDate = 'Due date is required for remaining amount';
                } else {
                    let dueDate;
                    if (paymentData.payLaterDate.includes('/')) {
                        const [d, m, y] = paymentData.payLaterDate.split('/');
                        dueDate = new Date(`${y}-${m}-${d}`);
                    } else {
                        dueDate = new Date(paymentData.payLaterDate);
                    }

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (dueDate < today) {
                        errors.payLaterDate = 'Due date cannot be in the past';
                    }
                    if (isNaN(dueDate.getTime())) {
                        errors.payLaterDate = 'Invalid date format';
                    }
                }
            }
        }

        setPaymentErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Helper: Check if non-payment sections should be visible
    const shouldShowSection = () => {
        // During payment collection steps, only show details if toggle is enabled
        if ((order?.status === 'Order Completed' && showPaymentSection) || shouldShowPayLaterCollectionSection) {
            return showAllSectionsInPayment;
        }
        // Outside payment step, always show
        return true;
    };

    const getPreviousStatus = (currentStatus) => {
        switch (currentStatus) {
            case 'Cutting Completed': return 'Order Created';
            case 'Order Completed': return 'Cutting Completed';
            case 'Payment Completed': return 'Order Completed';
            case 'Delivered': return 'Payment Completed';
            default: return null;
        }
    };

    const hasPostDeliveryPendingAmount = Number(order?.remainingAmount || 0) > 0;
    const isPostDeliveryPaymentMode =
        Boolean(order?.payLaterEnabled) ||
        ['partial', 'scheduled', 'unpaid'].includes(order?.paymentStatus);
    const shouldShowPayLaterCollectionSection =
        ['Payment Completed', 'Delivered'].includes(order?.status) &&
        hasPostDeliveryPendingAmount &&
        isPostDeliveryPaymentMode &&
        !(order?.status === 'Delivered' && Number(order?.remainingAmount || 0) === 0 && order?.paymentStatus === 'paid');

    useEffect(() => {
        if (!shouldShowPayLaterCollectionSection) return;
        const remaining = Number(order?.remainingAmount || 0);
        setPostDeliveryPayment(prev => ({
            ...prev,
            amount: remaining > 0 ? String(remaining) : ''
        }));
    }, [shouldShowPayLaterCollectionSection, order?.remainingAmount]);

    const handleStatusUpdate = async (newStatus, shouldSendInvoice = false) => {
        if (!order) return;

        try {
            setUpdatingStatus(true);
            const payload = { status: newStatus };

            // Handle Order Completed -> Show Payment Section
            if (newStatus === 'Order Completed') {
                const { data } = await axios.put(`${API_URL}/api/orders/${order._id}/status`, payload);

                const updatedOrder = data.order || order;
                if (data.order) {
                    setOrder(data.order);
                } else {
                    const refreshRes = await axios.get(`${API_URL}/api/orders/details/${orderId}`);
                    setOrder(refreshRes.data.order);
                }

                // Send professional text invoice/update to customer on completion ONLY if requested.
                if (shouldSendInvoice) {
                    sendOrderCompletedInvoiceText(updatedOrder);
                }

                // Show payment section for user to complete payment
                setShowPaymentSection(true);
                setUpdatingStatus(false);
                return;
            }

            // Add payment details if marking as Delivered (backward compatibility)
            // COMMENTED OUT to allow Post-Delivery Payment Collection for partial/due orders
            if (newStatus === 'Delivered') {
                payload.paymentMode = paymentMode;
                payload.finalPaymentAmount = parseFloat(finalPaymentAmount);
                payload.discount = parseFloat(discount) || 0;
            }

            const { data } = await axios.put(`${API_URL}/api/orders/${order._id}/status`, payload);

            // Handle WhatsApp Bill / Image Share (via Modal)
            if (newStatus === 'Delivered') {
                setDeliveryData({
                    invoiceImageLink: data.invoiceImageLink || `${API_URL}/api/orders/${order._id}/invoice-jpg`
                });
                setShowDeliveryModal(true);
            }

            // Refresh order data (using the returned order if valid, or refetching)
            if (data.order) {
                setOrder(data.order);
            } else {
                const refreshRes = await axios.get(`${API_URL}/api/orders/details/${orderId}`);
                setOrder(refreshRes.data.order);
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert(err.response?.data?.message || 'Failed to update order status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    // New handler for Payment Complete step
    const handlePaymentComplete = async () => {
        if (!order) return;

        // Validate payment data
        if (!validatePayment()) {
            // Scroll to first error
            const firstErrorField = Object.keys(paymentErrors)[0];
            console.log('Validation errors:', paymentErrors, 'First error:', firstErrorField);
            return;
        }

        try {
            setUpdatingStatus(true);

            // Determine payment status based on mode
            let paymentStatus = 'unpaid';
            if (paymentData.paymentMode === 'Pay Now') {
                paymentStatus = paymentSummary.remaining === 0 ? 'paid' : 'partial';
            } else if (paymentData.paymentMode === 'Pay Later') {
                paymentStatus = 'scheduled';
            } else if (paymentData.paymentMode === 'Partial') {
                paymentStatus = 'partial';
            }

            const payload = {
                status: 'Payment Completed',
                paymentStatus,
                discountAmount: paymentData.discountAmount,
                currentPaymentAmount: parseFloat(paymentData.payNowAmount) || 0,
                remainingAmount: paymentSummary.remaining,
                paymentMode: paymentData.cashPaymentMode // Actual payment method (Cash, UPI, etc.)
            };

            // Add pay later fields if applicable
            if (paymentData.paymentMode === 'Pay Later' || paymentData.paymentMode === 'Partial') {
                payload.payLaterEnabled = true;
                payload.payLaterAmount = parseFloat(paymentData.payLaterAmount) || 0;

                let dateToSend = paymentData.payLaterDate;
                if (dateToSend && dateToSend.includes('/')) {
                    const [d, m, y] = dateToSend.split('/');
                    dateToSend = `${y}-${m}-${d}`;
                }
                payload.payLaterDate = dateToSend;
            } else {
                // Pay Now mode
                payload.payLaterEnabled = false;
                payload.payLaterAmount = 0;
                payload.payLaterDate = null;
            }

            const { data } = await axios.put(`${API_URL}/api/orders/${order._id}/status`, payload);

            if (data.order) {
                setOrder(data.order);
            } else {
                const refreshRes = await axios.get(`${API_URL}/api/orders/details/${orderId}`);
                setOrder(refreshRes.data.order);
            }

            // Hide payment section
            setShowPaymentSection(false);

        } catch (err) {
            console.error('Error completing payment:', err);
            alert(err.response?.data?.message || 'Failed to complete payment');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleRecordPostDeliveryPayment = async () => {
        if (!order) return;

        const amount = parseFloat(postDeliveryPayment.amount);
        const remaining = order.remainingAmount || 0;

        // Validation
        if (!amount || amount <= 0) {
            setPostDeliveryError('Please enter a valid amount greater than 0');
            return;
        }
        if (amount > remaining) {
            setPostDeliveryError(`Amount cannot exceed remaining balance of ₹${remaining}`);
            return;
        }

        try {
            setUpdatingStatus(true);
            setPostDeliveryError('');

            const newRemaining = Math.max(0, remaining - amount);
            const newPaymentStatus = newRemaining === 0 ? 'paid' : 'partial';

            const payload = {
                status: order.status === 'Payment Completed' ? 'Payment Completed' : 'Delivered',
                paymentStatus: newPaymentStatus,
                currentPaymentAmount: amount, // Amount paying NOW
                remainingAmount: newRemaining,
                paymentMode: postDeliveryPayment.method
            };

            // Assuming there's a way to send notes, we'll try to update order notes separately if provided
            if (postDeliveryPayment.notes && postDeliveryPayment.notes.trim()) {
                const updatedNotes = order.notes
                    ? `${order.notes}\n[Payment Note]: ${postDeliveryPayment.notes}`
                    : `[Payment Note]: ${postDeliveryPayment.notes}`;

                // Fire and forget notes update or await it? Safer to await.
                await axios.put(`${API_URL}/api/orders/${order._id}/notes`, { notes: updatedNotes });
            }

            const { data } = await axios.put(`${API_URL}/api/orders/${order._id}/status`, payload);
            let updatedOrder = data.order;

            if (updatedOrder) {
                setOrder(updatedOrder);
            } else {
                const refreshRes = await axios.get(`${API_URL}/api/orders/details/${orderId}`);
                setOrder(refreshRes.data.order);
            }

            // Generate updated invoice with new payment information
            const invoiceImageLink = `${API_URL}/api/orders/${order._id}/invoice-jpg?t=${Date.now()}`;

            // Reset form
            setPostDeliveryPayment({ amount: '', method: 'Cash', notes: '' });

            // Show delivery/share modal with updated invoice
            setDeliveryData({
                invoiceImageLink: invoiceImageLink
            });
            setShowDeliveryModal(true);

        } catch (err) {
            console.error('Error recording post-delivery payment:', err);
            setPostDeliveryError(err.response?.data?.message || 'Failed to record payment');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleNotesUpdate = async () => {
        if (!order) return;

        try {
            await axios.put(`${API_URL}/api/orders/${order._id}/notes`, {
                notes: notes
            });

            // Refresh order data
            const { data } = await axios.get(`${API_URL}/api/orders/details/${orderId}`);
            setOrder(data.order);
            setEditingNotes(false);
        } catch (err) {
            console.error('Error updating notes:', err);
            alert(err.response?.data?.message || 'Failed to update notes');
        }
    };

    const handleStartEditingMeasurements = (index = null) => {
        if (order.orderItems && order.orderItems.length > 0) {
            setTempOrderItems(JSON.parse(JSON.stringify(order.orderItems)));
            if (index !== null) {
                setEditingItemIndex(index);
                setExpandedItemIndex(index);
            }
        } else if (order.measurements) {
            setTempLegacyMeasurements({ ...order.measurements });
            setEditingMeasurements(true);
        }
        setActiveSection('measurements');
    };

    const handleSaveMeasurements = async (index = null) => {
        try {
            const payload = {};
            if (order.orderItems && order.orderItems.length > 0) {
                payload.orderItems = tempOrderItems;
            } else {
                payload.measurements = tempLegacyMeasurements;
            }

            const { data } = await axios.put(`${API_URL}/api/orders/${order._id}/measurements`, payload);

            if (data.order) {
                setOrder(prev => ({
                    ...prev,
                    orderItems: data.order.orderItems,
                    measurements: data.order.measurements
                }));
            }
            if (index !== null) {
                setEditingItemIndex(null);
            } else {
                setEditingMeasurements(false);
            }
        } catch (err) {
            console.error('Error updating measurements:', err);
            alert('Failed to update measurements');
        }
    };

    const handleCancelEditingMeasurements = () => {
        setEditingMeasurements(false);
        setEditingItemIndex(null);
        setTempOrderItems([]);
        setTempLegacyMeasurements({});
    };

    const handleLegacyMeasurementChange = (key, value) => {
        setTempLegacyMeasurements(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleOrderItemMeasurementChange = (itemIndex, type, key, value) => {
        setTempOrderItems(prev => {
            const newItems = [...prev];
            if (!newItems[itemIndex][type]) newItems[itemIndex][type] = {};
            newItems[itemIndex][type] = {
                ...newItems[itemIndex][type],
                [key]: value
            };
            return newItems;
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleUpdateTailorData = (updatedData) => {
        setTailorData(updatedData);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            'Order Created': 'bg-yellow-100 text-yellow-700 border border-yellow-300',
            'Cutting Completed': 'bg-blue-100 text-blue-700 border border-blue-300',
            'Order Completed': 'bg-green-100 text-green-700 border border-green-300',
            'Payment Completed': 'bg-emerald-100 text-emerald-700 border border-emerald-300',
            'Delivered': 'bg-slate-100 text-slate-700 border border-slate-300',
            'Pending': 'bg-amber-100 text-amber-700 border border-amber-300',
            'In Progress': 'bg-blue-100 text-blue-700 border border-blue-300',
            'Completed': 'bg-emerald-100 text-emerald-700 border border-emerald-300',
            'Draft': 'bg-purple-100 text-purple-700 border border-purple-300'
        };
        return badges[status] || 'bg-slate-100 text-slate-700 border border-slate-300';
    };

    const preventAccidentalNumberChange = (e) => {
        if (e.type === 'wheel') {
            e.currentTarget.blur();
            return;
        }
        if (e.type === 'keydown' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            e.preventDefault();
        }
    };

    // Convert measurements Map to array for display
    const measurementsArray = order?.measurements
        ? Object.entries(order.measurements)
        : [];

    // Wait for tailor data to load first
    if (!tailorData) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-[#f5f5f0]">
                <div className="text-slate-600 text-lg">Loading...</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex h-screen">
                <DashboardSidebar
                    tailorData={tailorData}
                    onLogout={handleLogout}
                    onUpdateTailorData={handleUpdateTailorData}
                />
                <div className="flex-1 lg:ml-72 p-8 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg p-8">
                            <div className="animate-pulse text-center text-slate-500">
                                Loading order details...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex h-screen">
                <DashboardSidebar
                    tailorData={tailorData}
                    onLogout={handleLogout}
                    onUpdateTailorData={handleUpdateTailorData}
                />
                <div className="flex-1 lg:ml-72 p-8 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg p-8">
                            <div className="text-center">
                                <svg className="w-16 h-16 mb-4 text-amber-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Not Found</h2>
                                <p className="text-slate-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-6 py-3 bg-[#6b4423] hover:bg-[#573619] text-white font-semibold rounded-lg transition-colors"
                                >
                                    ← Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <DashboardSidebar
                tailorData={tailorData}
                onLogout={handleLogout}
                onUpdateTailorData={handleUpdateTailorData}
            />
            <div className="flex-1 lg:ml-72 overflow-y-auto bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="max-w-6xl mx-auto p-4 pt-16 pb-24 md:p-8">
                    {/* Header with Back Button */}
                    <div className="mb-4 md:mb-6">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/60 hover:bg-white/80 border border-white/60 rounded-lg transition-all text-slate-700 hover:text-slate-900 font-medium text-xs md:text-base"
                            >
                                <span>←</span>
                                <span className="md:hidden">Back</span>
                                <span className="hidden md:inline">Back to Dashboard</span>
                            </button>
                            <div className="text-right md:hidden">
                                <h1 className="text-xl font-bold text-slate-800">Order Details</h1>
                                <p className="text-xs text-slate-500 mt-0.5">#{order._id.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-3">
                            <div className="text-right hidden md:block mr-auto">
                                <h1 className="text-3xl font-bold text-slate-800">Order Details</h1>
                                <p className="text-sm text-slate-500 mt-1">#{order._id.slice(-8).toUpperCase()}</p>
                            </div>

                            {/* Toggle button - shows during payment collection steps */}
                            {((order.status === 'Order Completed' && showPaymentSection) || shouldShowPayLaterCollectionSection) && (
                                <button
                                    onClick={() => setShowAllSectionsInPayment(!showAllSectionsInPayment)}
                                    className={`inline-flex items-center justify-center gap-2 min-w-[112px] h-10 px-4 rounded-xl transition-all text-sm font-semibold shadow-sm border ${showAllSectionsInPayment
                                        ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                        : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                        }`}
                                    aria-expanded={showAllSectionsInPayment}
                                    aria-label={showAllSectionsInPayment ? "Hide order details" : "Show order details"}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {showAllSectionsInPayment ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        )}
                                    </svg>
                                    <span>{showAllSectionsInPayment ? 'Hide' : 'Show'}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* SECTION 1: ORDER SUMMARY (Mobile Accordion / Desktop Grid) */}

                    {/* Desktop View (Unchanged) */}
                    {shouldShowSection() && (
                        <div className="hidden md:block bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                Order Summary
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Order ID</p>
                                    <p className="text-base font-semibold text-slate-800">#{order._id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</p>
                                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Garment Type</p>
                                    <p className="text-base font-semibold text-slate-800">
                                        {order.orderItems && order.orderItems.length > 0
                                            ? order.orderItems.map(item => item.garmentType).join(', ')
                                            : order.orderType}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Due Date</p>
                                    <p className="text-base font-semibold text-slate-800">{formatDate(order.dueDate)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Order Created</p>
                                    <p className="text-base font-semibold text-slate-800">{formatDate(order.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Amount</p>
                                    <p className="text-base font-semibold text-green-600">₹{order.price.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Advance Payment</p>
                                    <p className="text-base font-semibold text-slate-800">₹{order.advancePayment.toLocaleString('en-IN')}</p>
                                </div>
                                {order.discount > 0 && (
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Discount</p>
                                        <p className="text-base font-semibold text-blue-600">-₹{order.discount.toLocaleString('en-IN')}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Balance Due</p>
                                    <p className="text-base font-semibold text-red-600">₹{Math.max(0, order.price - order.advancePayment - (order.discount || 0)).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mobile View (Accordion) */}
                    {shouldShowSection() && (
                        <div className="md:hidden bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg mb-3 overflow-hidden transition-all duration-300">
                            {/* Header */}
                            <div
                                onClick={() => setActiveSection(activeSection === 'summary' ? null : 'summary')}
                                className="p-4 flex items-center justify-between cursor-pointer"
                            >
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Order Summary
                                </h2>
                                <svg
                                    className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${activeSection === 'summary' ? 'rotate-180' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* Collapsed Preview (Visible when CLOSED) */}
                            <div className={`px-4 pb-4 ${activeSection === 'summary' ? 'hidden' : 'block'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Order ID</p>
                                        <p className="text-sm font-semibold text-slate-800">#{order._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="bg-red-50 rounded-lg p-2 border border-red-100 flex items-center justify-between">
                                    <p className="text-[10px] text-red-500 uppercase tracking-wide font-bold">Balance Due</p>
                                    <p className="text-sm font-bold text-red-600">₹{Math.max(0, order.price - order.advancePayment - (order.discount || 0)).toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            {/* Expanded Content (Visible when OPEN) */}
                            <div className={`px-4 pb-4 transition-all duration-300 ${activeSection === 'summary' ? 'block opacity-100' : 'hidden opacity-0'}`}>
                                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                                    <div className="col-span-2">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Garment Type</p>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {order.orderItems && order.orderItems.length > 0
                                                ? order.orderItems.map(item => item.garmentType).join(', ')
                                                : order.orderType}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Due Date</p>
                                        <p className="text-sm font-semibold text-slate-800">{formatDate(order.dueDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Created</p>
                                        <p className="text-sm font-semibold text-slate-800">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Amount</p>
                                        <p className="text-sm font-semibold text-green-600">₹{order.price.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Advance</p>
                                        <p className="text-sm font-semibold text-slate-600">₹{order.advancePayment.toLocaleString('en-IN')}</p>
                                    </div>
                                    {order.discount > 0 && (
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Discount</p>
                                            <p className="text-sm font-semibold text-blue-600">-₹{order.discount.toLocaleString('en-IN')}</p>
                                        </div>
                                    )}
                                    <div className="col-span-2 bg-red-50 rounded-lg p-2 border border-red-100 mt-1">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] text-red-500 uppercase tracking-wide font-bold">Balance Due</p>
                                            <p className="text-base font-bold text-red-600">₹{Math.max(0, order.price - order.advancePayment - (order.discount || 0)).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION 2: CUSTOMER DETAILS (Mobile Accordion / Desktop Grid) */}

                    {/* Desktop View (Unchanged) */}
                    {shouldShowSection() && (
                        <div className="hidden md:block bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Customer Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Customer Name</p>
                                    <p className="text-base font-semibold text-slate-800">{order.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Mobile Number</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-base font-semibold text-slate-800">{order.customerPhone}</p>
                                        <a
                                            href={`tel:${order.customerPhone}`}
                                            className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors flex items-center justify-center"
                                            title="Call Customer"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                                {order.customerEmail && (
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Email</p>
                                        <p className="text-base font-semibold text-slate-800">{order.customerEmail}</p>
                                    </div>
                                )}
                                {order.customerId && (
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Customer Username</p>
                                        <p className="text-base font-semibold text-slate-800">Linked Account</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mobile View (Accordion) */}
                    {shouldShowSection() && (
                        <div className="md:hidden bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg mb-3 overflow-hidden transition-all duration-300">
                            {/* Header */}
                            <div
                                onClick={() => setActiveSection(activeSection === 'customer' ? null : 'customer')}
                                className="p-4 flex items-center justify-between cursor-pointer"
                            >
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Customer Details
                                </h2>
                                <svg
                                    className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${activeSection === 'customer' ? 'rotate-180' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* Collapsed Preview (Visible when CLOSED) */}
                            <div className={`px-4 pb-4 ${activeSection === 'customer' ? 'hidden' : 'block'}`}>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Name</p>
                                        <p className="text-sm font-semibold text-slate-800 truncate">{order.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Mobile</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-800">{order.customerPhone}</p>
                                            <a
                                                href={`tel:${order.customerPhone}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors flex items-center justify-center shrink-0"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content (Visible when OPEN) */}
                            <div className={`px-4 pb-4 transition-all duration-300 ${activeSection === 'customer' ? 'block opacity-100' : 'hidden opacity-0'}`}>
                                <div className="space-y-3 border-t border-slate-100 pt-3">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Customer Name</p>
                                        <p className="text-sm font-semibold text-slate-800">{order.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Mobile Number</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-800">{order.customerPhone}</p>
                                            <a
                                                href={`tel:${order.customerPhone}`}
                                                className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors flex items-center justify-center shrink-0"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                    {order.customerEmail && (
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Email</p>
                                            <p className="text-sm font-semibold text-slate-800 break-all">{order.customerEmail}</p>
                                        </div>
                                    )}
                                    {order.customerId && (
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Customer Username</p>
                                            <p className="text-sm font-semibold text-slate-800">Linked Account</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION 3: MEASUREMENTS */}
                    {shouldShowSection() && (
                        <div className={`bg-amber-50/80 backdrop-blur-xl border-2 border-dashed ${editingMeasurements ? 'border-amber-500 ring-2 ring-amber-200' : 'border-amber-300'} rounded-3xl shadow-lg mb-3 md:mb-6 overflow-hidden transition-all duration-300 md:p-6`}>
                            {/* Header */}
                            <div className="p-4 md:p-0 flex items-center justify-between">
                                <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 12h20" /><path d="M6 12v-2" /><path d="M10 12v-4" /><path d="M14 12v-2" /><path d="M18 12v-4" />
                                    </svg>
                                    Measurements
                                </h2>
                                <div className="flex items-center gap-2">
                                    {/* Only show global edit button for Legacy measurements */}
                                    {(!order.orderItems || order.orderItems.length === 0) && (
                                        editingMeasurements ? (
                                            <>
                                                <button
                                                    onClick={() => handleSaveMeasurements()}
                                                    className="z-10 px-3 py-1.5 md:px-4 md:py-2 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors relative"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEditingMeasurements}
                                                    className="z-10 px-3 py-1.5 md:px-4 md:py-2 bg-slate-400 hover:bg-slate-500 text-white text-xs md:text-sm font-medium rounded-lg transition-colors relative"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className="z-10 px-3 py-1.5 md:px-4 md:py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors relative"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartEditingMeasurements();
                                                }}
                                            >
                                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-4 pb-4 md:p-0 border-t border-amber-200/50 pt-4 md:border-none md:pt-0 block">
                                {/* NEW: Multi-item Order Structure */}
                                {order.orderItems && order.orderItems.length > 0 ? (
                                    <div className="space-y-3">
                                        {(editingItemIndex !== null ? tempOrderItems : order.orderItems).map((item, index) => (
                                            <div key={index} className="bg-white/50 rounded-xl border border-amber-100 overflow-hidden">
                                                {/* Item Header - Accordion Toggle */}
                                                <div
                                                    className="p-3 md:p-4 flex items-center justify-between cursor-pointer hover:bg-amber-50/50 transition-colors"
                                                    onClick={() => setExpandedItemIndex(expandedItemIndex === index ? null : index)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">Item {index + 1}</span>
                                                        <h3 className="font-bold text-slate-800 text-sm md:text-base">{item.garmentType}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {expandedItemIndex === index && editingItemIndex !== index && (
                                                            <button
                                                                className="p-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStartEditingMeasurements(index);
                                                                }}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        <svg
                                                            className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${expandedItemIndex === index ? 'rotate-180' : ''}`}
                                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* Expanded Content */}
                                                {expandedItemIndex === index && (
                                                    <div className="p-3 md:p-4 border-t border-amber-100 bg-white/30">

                                                        {/* Header for Edit Mode inside Item */}
                                                        {editingItemIndex === index && (
                                                            <div className="flex justify-end gap-2 mb-3">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleSaveMeasurements(index); }}
                                                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleCancelEditingMeasurements(); }}
                                                                    className="px-3 py-1 bg-slate-400 hover:bg-slate-500 text-white text-xs font-medium rounded-lg transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Standard Measurements */}
                                                        {item.measurements && Object.keys(item.measurements).length > 0 && (
                                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-3">
                                                                {Object.entries(item.measurements).map(([key, value]) => (
                                                                    <div key={key} className={`bg-white rounded-lg p-2 border ${editingItemIndex === index ? 'border-amber-300 ring-2 ring-amber-100' : 'border-amber-200'} shadow-sm`}>
                                                                        <p className="text-[10px] md:text-xs text-amber-700 uppercase tracking-wide mb-1 font-medium truncate">
                                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                                        </p>
                                                                        {editingItemIndex === index ? (
                                                                            <input
                                                                                type="text"
                                                                                value={value}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                onChange={(e) => handleOrderItemMeasurementChange(index, 'measurements', key, e.target.value)}
                                                                                className="w-full text-base font-bold text-slate-800 bg-transparent border-b border-amber-200 focus:border-amber-500 focus:outline-none"
                                                                            />
                                                                        ) : (
                                                                            <p className="text-lg md:text-xl font-bold text-slate-800">{value}</p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Extra Measurements */}
                                                        {item.extraMeasurements && Object.keys(item.extraMeasurements).length > 0 && (
                                                            <div className="mt-3">
                                                                <p className="text-xs font-semibold text-slate-500 mb-2">Extra Measurements</p>
                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                                    {Object.entries(item.extraMeasurements).map(([key, value]) => (
                                                                        <div key={key} className={`bg-slate-50 rounded-lg p-2 border ${editingItemIndex === index ? 'border-amber-300' : 'border-slate-200'}`}>
                                                                            <p className="text-[10px] text-slate-500 uppercase font-medium">{key}</p>
                                                                            {editingItemIndex === index ? (
                                                                                <input
                                                                                    type="text"
                                                                                    value={value}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    onChange={(e) => handleOrderItemMeasurementChange(index, 'extraMeasurements', key, e.target.value)}
                                                                                    className="w-full text-sm font-bold text-slate-800 bg-transparent border-b border-slate-300 focus:border-blue-500 focus:outline-none"
                                                                                />
                                                                            ) : (
                                                                                <p className="text-sm font-bold text-slate-800">{value}</p>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {item.notes && (
                                                            <div className="mt-3 text-xs md:text-sm text-slate-600 bg-amber-50 p-2 rounded border border-amber-100 italic">
                                                                Note: {item.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : order.measurements && Object.keys(order.measurements).length > 0 ? (
                                    // Legacy Measurements Support (Keep using global editingMeasurements for simplicity for now as fallback)
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                        {Object.entries(editingMeasurements ? tempLegacyMeasurements : order.measurements).map(([key, value]) => (
                                            <div key={key} className={`bg-white rounded-lg p-2 border ${editingMeasurements ? 'border-amber-300 ring-2 ring-amber-100' : 'border-amber-200'} shadow-sm`}>
                                                <p className="text-[10px] md:text-xs text-amber-700 uppercase tracking-wide mb-1 font-medium truncate">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </p>
                                                {editingMeasurements ? (
                                                    <input
                                                        type="text"
                                                        value={value}
                                                        onChange={(e) => handleLegacyMeasurementChange(key, e.target.value)}
                                                        className="w-full text-base font-bold text-slate-800 bg-transparent border-b border-amber-200 focus:border-amber-500 focus:outline-none"
                                                    />
                                                ) : (
                                                    <p className="text-lg md:text-xl font-bold text-slate-800">{value}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 md:py-12 text-slate-500">
                                        <div className="mb-2 md:mb-3 flex justify-center text-slate-300">
                                            <svg className="w-12 h-12 md:w-16 md:h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M2 12h20" /><path d="M6 12v-2" /><path d="M10 12v-4" /><path d="M14 12v-2" /><path d="M18 12v-4" />
                                            </svg>
                                        </div>
                                        <p className="text-base md:text-lg font-medium">No measurements</p>
                                        <p className="text-xs md:text-sm mt-1">Measurements were not captured for this order</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SECTION 4: ORDER NOTES */}
                    {shouldShowSection() && (
                        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg p-4 mb-3 md:p-6 md:mb-6">
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Notes
                                </h2>
                                {!editingNotes && (
                                    <button
                                        onClick={() => setEditingNotes(true)}
                                        className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {editingNotes ? (
                                <div>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full p-3 md:p-4 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px] md:min-h-[120px] mb-3 text-sm md:text-base"
                                        placeholder="Add notes about this order..."
                                    />
                                    <div className="flex gap-2 md:gap-3">
                                        <button
                                            onClick={handleNotesUpdate}
                                            className="flex-1 px-3 py-2 md:px-4 bg-green-600 hover:bg-green-700 text-white text-sm md:text-base font-medium rounded-lg transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingNotes(false);
                                                setNotes(order.notes || '');
                                            }}
                                            className="flex-1 px-3 py-2 md:px-4 bg-slate-400 hover:bg-slate-500 text-white text-sm md:text-base font-medium rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-slate-700">
                                    {order.notes ? (
                                        <p className="text-sm md:text-base leading-relaxed">{order.notes}</p>
                                    ) : (
                                        <p className="text-xs md:text-base text-slate-400 italic">No notes added yet</p>
                                    )}
                                </div>
                            )}
                            {order.description && (
                                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-200">
                                    <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide mb-0.5 md:mb-1">Order Description</p>
                                    <p className="text-sm md:text-base text-slate-700">{order.description}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 5: ORDER ACTIONS */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg p-4 md:p-6 mb-24 md:mb-0">
                        <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-3 md:mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Actions
                        </h2>
                        <div className="flex flex-col md:flex-row flex-wrap gap-3 md:gap-4">
                            {order.status === 'Order Created' && (
                                <button
                                    onClick={() => handleStatusUpdate('Cutting Completed')}
                                    disabled={updatingStatus}
                                    className="w-full md:flex-1 md:min-w-[200px] px-4 py-3 md:px-6 md:py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {updatingStatus ? (
                                        <span>Updating...</span>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                                            </svg>
                                            <span>Mark Cutting Done</span>
                                        </>
                                    )}
                                </button>
                            )}
                            {order.status === 'Cutting Completed' && (
                                <button
                                    onClick={() => setShowCompletionModal(true)}
                                    disabled={updatingStatus}
                                    className="w-full md:flex-1 md:min-w-[200px] px-4 py-3 md:px-6 md:py-4 bg-green-600 hover:bg-green-700 text-white text-sm md:text-base font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {updatingStatus ? (
                                        <span>Updating...</span>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Mark Order Completed</span>
                                        </>
                                    )}
                                </button>
                            )}
                            {/* PAYMENT SECTION - Shows after Order Completed */}
                            {order.status === 'Order Completed' && showPaymentSection && (
                                <div className="w-full bg-emerald-50/80 backdrop-blur-sm border-2 border-emerald-300 rounded-2xl p-4 md:p-6 shadow-lg">
                                    <h3 className="text-lg md:text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Complete Payment
                                    </h3>

                                    {/* Payment Summary */}
                                    <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                                        <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Payment Summary</p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Gross Amount:</span>
                                                <span className="font-semibold">₹{paymentSummary.grossAmount.toFixed(2)}</span>
                                            </div>
                                            {paymentSummary.advancePayment > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Advance Paid:</span>
                                                    <span className="font-semibold">- ₹{paymentSummary.advancePayment.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {paymentSummary.discount > 0 && (
                                                <div className="flex justify-between text-blue-600">
                                                    <span>Discount:</span>
                                                    <span className="font-semibold">- ₹{paymentSummary.discount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-2 mt-2 flex justify-between">
                                                <span className="font-bold text-slate-800">Final Payable:</span>
                                                <span className="text-lg font-bold text-emerald-700">₹{paymentSummary.finalPayable.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Discount Input */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Discount Amount</label>
                                        <input
                                            type="number"
                                            value={paymentData.discountAmount === 0 ? '' : paymentData.discountAmount}
                                            onChange={(e) => {
                                                const rawValue = e.target.value;
                                                setPaymentData({
                                                    ...paymentData,
                                                    discountAmount: rawValue === '' ? '' : parseFloat(rawValue)
                                                });
                                            }}
                                            onWheel={preventAccidentalNumberChange}
                                            onKeyDown={preventAccidentalNumberChange}
                                            onFocus={(e) => { e.target.placeholder = ''; }}
                                            onBlur={(e) => { e.target.placeholder = '₹0.00'; }}
                                            min="0"
                                            className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                                            placeholder="₹0.00"
                                        />
                                        {paymentErrors.discount && <p className="text-red-500 text-xs mt-1">{paymentErrors.discount}</p>}
                                    </div>

                                    {/* Payment Mode Selection */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Mode *</label>
                                        <select
                                            value={paymentData.paymentMode}
                                            onChange={(e) => {
                                                const newMode = e.target.value;
                                                const gross = Number(order?.price || 0);
                                                const advance = Number(order?.advancePayment || 0);
                                                const discountVal = parseFloat(paymentData.discountAmount) || 0;
                                                const currentFinalPayable = Math.max(0, gross - advance - discountVal);
                                                setPaymentData(prev => ({
                                                    ...prev,
                                                    paymentMode: newMode,
                                                    // Reset relevant fields on mode change
                                                    payNowAmount: newMode === 'Pay Later'
                                                        ? 0
                                                        : newMode === 'Pay Now'
                                                            ? currentFinalPayable
                                                            : prev.payNowAmount,
                                                    payLaterDate: newMode === 'Pay Now' ? '' : prev.payLaterDate,
                                                    payLaterAmount: newMode === 'Pay Now' ? 0 : prev.payLaterAmount
                                                }));
                                            }}
                                            className={`w-full p-2.5 border-2 rounded-lg focus:outline-none focus:border-emerald-500 ${paymentErrors.paymentMode ? 'border-red-400' : 'border-slate-200'}`}
                                        >
                                            <option value="">Select Mode</option>
                                            <option value="Pay Now">Pay Now</option>
                                            <option value="Pay Later">Pay Later</option>
                                            <option value="Partial">Partial</option>
                                        </select>
                                        {paymentErrors.paymentMode && <p className="text-red-500 text-xs mt-1">{paymentErrors.paymentMode}</p>}
                                    </div>

                                    {/* Cash Payment Method */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                                        <select
                                            value={paymentData.cashPaymentMode}
                                            onChange={(e) => setPaymentData({ ...paymentData, cashPaymentMode: e.target.value })}
                                            className="w-full p-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                        >
                                            <option value="Cash">Cash</option>
                                            <option value="UPI">UPI</option>
                                            <option value="Card">Card</option>
                                            <option value="Online">Online</option>
                                        </select>
                                    </div>

                                    {/* Pay Now Amount - Shown for Pay Now and Partial modes */}
                                    {(paymentData.paymentMode === 'Pay Now' || paymentData.paymentMode === 'Partial') && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Pay Now Amount *</label>
                                            <input
                                                type="number"
                                                value={paymentData.payNowAmount === 0 ? '' : paymentData.payNowAmount}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value;
                                                    setPaymentData({
                                                        ...paymentData,
                                                        payNowAmount: rawValue === '' ? '' : parseFloat(rawValue)
                                                    });
                                                }}
                                                onWheel={preventAccidentalNumberChange}
                                                onKeyDown={preventAccidentalNumberChange}
                                                onFocus={(e) => { e.target.placeholder = ''; }}
                                                onBlur={(e) => { e.target.placeholder = '₹0.00'; }}
                                                min="0"
                                                max={paymentData.paymentMode === 'Pay Now' ? paymentSummary.finalPayable : undefined}
                                                className={`w-full px-3 py-2.5 border-2 rounded-lg focus:outline-none focus:border-emerald-500 ${paymentErrors.payNowAmount ? 'border-red-400' : 'border-slate-200'}`}
                                                placeholder="₹0.00"
                                            />
                                            {paymentErrors.payNowAmount && <p className="text-red-500 text-xs mt-1">{paymentErrors.payNowAmount}</p>}
                                            {paymentData.paymentMode === 'Partial' && (
                                                <p className="text-xs text-slate-500 mt-1">Enter amount less than ₹{paymentSummary.finalPayable.toFixed(2)}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Pay Now Amount - Disabled for Pay Later mode */}
                                    {paymentData.paymentMode === 'Pay Later' && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Pay Now Amount</label>
                                            <input
                                                type="number"
                                                value={0}
                                                disabled
                                                className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed"
                                                placeholder="₹0.00"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">No payment now - full amount scheduled for later</p>
                                        </div>
                                    )}

                                    {/* Pay Later Fields - Shown for Pay Later and Partial modes */}
                                    {(paymentData.paymentMode === 'Pay Later' || paymentData.paymentMode === 'Partial') && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                            <p className="text-sm font-semibold text-amber-800 mb-3">
                                                {paymentData.paymentMode === 'Pay Later' ? 'Pay Later Details' : 'Remaining Amount Details'}
                                            </p>

                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Pay Later Amount</label>
                                                <input
                                                    type="number"
                                                    value={paymentData.payLaterAmount}
                                                    disabled
                                                    className="w-full px-3 py-2.5 border-2 border-amber-200 rounded-lg bg-amber-50 text-slate-600 font-semibold cursor-not-allowed"
                                                    placeholder="₹0.00"
                                                />
                                                {paymentErrors.payLaterAmount && <p className="text-red-500 text-xs mt-1">{paymentErrors.payLaterAmount}</p>}
                                                {paymentData.paymentMode === 'Pay Later' && (
                                                    <p className="text-xs text-amber-700 mt-1">Auto-filled with full final payable amount</p>
                                                )}
                                                {paymentData.paymentMode === 'Partial' && (
                                                    <p className="text-xs text-amber-700 mt-1">Auto-calculated: ₹{paymentSummary.finalPayable.toFixed(2)} - ₹{paymentData.payNowAmount} = ₹{paymentData.payLaterAmount.toFixed(2)}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Due Date *</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={paymentData.payLaterDate}
                                                        onChange={(e) => {
                                                            let value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
                                                            if (value.length > 2) {
                                                                value = value.slice(0, 2) + '/' + value.slice(2);
                                                            }
                                                            if (value.length > 5) {
                                                                value = value.slice(0, 5) + '/' + value.slice(5);
                                                            }
                                                            // Ensure we respect the max length for a date (10 chars: DD/MM/YYYY)
                                                            if (value.length > 10) value = value.slice(0, 10);

                                                            setPaymentData({ ...paymentData, payLaterDate: value });
                                                        }}
                                                        maxLength="10"
                                                        placeholder="DD/MM/YYYY"
                                                        className={`w-full pl-4 pr-12 py-2.5 border-2 rounded-lg focus:outline-none focus:border-amber-500 bg-white ${paymentErrors.payLaterDate ? 'border-red-400' : 'border-amber-200'}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => dateInputRef.current && dateInputRef.current.showPicker()}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600 transition-colors p-1"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>
                                                    <input
                                                        type="date"
                                                        ref={dateInputRef}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        onChange={(e) => {
                                                            const dateVal = e.target.value; // YYYY-MM-DD
                                                            if (dateVal) {
                                                                const [year, month, day] = dateVal.split('-');
                                                                const formatted = `${day}/${month}/${year}`;
                                                                setPaymentData({ ...paymentData, payLaterDate: formatted });
                                                            }
                                                        }}
                                                        className="absolute opacity-0 pointer-events-none w-0 h-0"
                                                        tabIndex={-1}
                                                    />
                                                </div>
                                                {paymentErrors.payLaterDate && <p className="text-red-500 text-xs mt-1">{paymentErrors.payLaterDate}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Remaining Balance Display */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-slate-700">Remaining Balance:</span>
                                            <span className="text-xl font-bold text-blue-700">₹{paymentSummary.remaining.toFixed(2)}</span>
                                        </div>
                                        {paymentData.paymentMode === 'Partial' && paymentSummary.remaining > 0 && (
                                            <p className="text-xs text-blue-600 mt-1">This will be scheduled for later payment</p>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={handlePaymentComplete}
                                        disabled={updatingStatus}
                                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {updatingStatus ? (
                                            <span>Processing...</span>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>
                                                    {paymentData.paymentMode === 'Pay Now'
                                                        ? (paymentSummary.remaining === 0 ? 'Mark Payment Complete' : 'Complete Payment')
                                                        : paymentData.paymentMode === 'Pay Later'
                                                            ? 'Schedule Payment & Complete'
                                                            : paymentData.paymentMode === 'Partial'
                                                                ? 'Complete Partial Payment'
                                                                : 'Complete Payment'}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* PAYMENT COMPLETED - Ready for Delivery */}
                            {order.status === 'Payment Completed' && (
                                <button
                                    onClick={() => handleStatusUpdate('Delivered')}
                                    disabled={updatingStatus}
                                    className="w-full md:flex-1 md:min-w-[200px] px-4 py-3 md:px-6 md:py-4 bg-slate-800 hover:bg-slate-900 text-white text-sm md:text-base font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {updatingStatus ? (
                                        <span>Updating...</span>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                            </svg>
                                            <span>Mark as Delivered</span>
                                        </>
                                    )}
                                </button>
                            )}

                            {order.status === 'Order Completed' && !showPaymentSection && order.deliveredAt && order.paymentStatus === 'paid' && (
                                <div className="w-full md:flex-1 md:min-w-[200px] px-4 py-3 md:px-6 md:py-4 bg-emerald-100 border-2 border-emerald-300 text-emerald-800 text-sm md:text-base font-semibold rounded-lg flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Order Fully Completed</span>
                                </div>
                            )}

                            {/* Delivered/Pay-Later Collection Status */}
                            {(order.status === 'Delivered' || shouldShowPayLaterCollectionSection) && (
                                <>
                                    {order.status === 'Delivered' && (
                                        <div className="w-full md:flex-1 md:min-w-[200px] px-4 py-3 md:px-6 md:py-4 bg-slate-100 border-2 border-slate-300 text-slate-700 text-sm md:text-base font-semibold rounded-lg flex items-center justify-center gap-2 mb-4 md:mb-0">
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Order Delivered</span>
                                        </div>
                                    )}

                                    {/* Post-Delivery Payment Collection Section */}
                                    {/* DEBUG: Remove this after verifying */}
                                    {/* <div className="text-xs text-slate-400 mt-1 mb-2">
                                        Debug: Status={order.status}, Remaining={order.remainingAmount}, PayStatus={order.paymentStatus}
                                    </div> */}

                                    {shouldShowPayLaterCollectionSection && (
                                        <div className="w-full bg-orange-50/80 backdrop-blur-sm border-2 border-orange-200 rounded-2xl p-4 md:p-6 shadow-lg mt-4 md:mt-0 md:col-span-2 lg:col-span-3">
                                            <h3 className="text-lg md:text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Collect Remaining Payment (After Delivery)
                                            </h3>

                                            {/* Summary Cards */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                                                <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                                                    <p className="text-xs text-slate-500 uppercase font-bold">Total</p>
                                                    <p className="text-slate-800 font-semibold">₹{order.price?.toLocaleString('en-IN')}</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                                                    <p className="text-xs text-slate-500 uppercase font-bold">Collected</p>
                                                    <p className="text-green-600 font-semibold">
                                                        ₹{((order.price || 0) - (order.remainingAmount || 0) - (order.discount || 0)).toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                                {order.payLaterDate && (
                                                    <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                                                        <p className="text-xs text-slate-500 uppercase font-bold">Due Date</p>
                                                        <p className="text-orange-600 font-semibold">
                                                            {new Date(order.payLaterDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="bg-red-50 p-3 rounded-xl border border-red-200 shadow-sm">
                                                    <p className="text-xs text-red-600 uppercase font-bold">Remaining</p>
                                                    <p className="text-red-700 font-bold text-lg">₹{order.remainingAmount?.toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Amount Input */}
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Amount Received Now *</label>
                                                        <input
                                                            type="number"
                                                            value={postDeliveryPayment.amount}
                                                            onChange={(e) => {
                                                                setPostDeliveryPayment({ ...postDeliveryPayment, amount: e.target.value });
                                                                setPostDeliveryError('');
                                                            }}
                                                            onWheel={preventAccidentalNumberChange}
                                                            onKeyDown={preventAccidentalNumberChange}
                                                            onFocus={(e) => { e.target.placeholder = ''; }}
                                                            onBlur={(e) => { e.target.placeholder = `₹${order.remainingAmount || 0}`; }}
                                                            className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                                                            placeholder={`₹${order.remainingAmount || 0}`}
                                                            max={order.remainingAmount}
                                                        />
                                                    </div>

                                                    {/* Payment Method */}
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                                                        <select
                                                            value={postDeliveryPayment.method}
                                                            onChange={(e) => setPostDeliveryPayment({ ...postDeliveryPayment, method: e.target.value })}
                                                            className="w-full p-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 bg-white"
                                                        >
                                                            <option value="Cash">Cash</option>
                                                            <option value="UPI">UPI</option>
                                                            <option value="Card">Card</option>
                                                            <option value="Online">Online</option>
                                                        </select>
                                                    </div>

                                                    {/* Notes */}
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (Optional)</label>
                                                        <input
                                                            type="text"
                                                            value={postDeliveryPayment.notes}
                                                            onChange={(e) => setPostDeliveryPayment({ ...postDeliveryPayment, notes: e.target.value })}
                                                            className="w-full p-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                                                            placeholder="Add payment verification details or comments"
                                                        />
                                                    </div>
                                                </div>

                                                {postDeliveryError && (
                                                    <p className="text-red-500 text-sm mt-3 font-medium flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {postDeliveryError}
                                                    </p>
                                                )}

                                                <button
                                                    onClick={handleRecordPostDeliveryPayment}
                                                    disabled={updatingStatus}
                                                    className="w-full mt-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {updatingStatus ? 'Processing...' : 'Record Payment'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex flex-row justify-between md:flex-col md:justify-start gap-2 w-full md:w-auto mt-4 md:mt-0">
                                {order.cuttingCompletedAt && (
                                    <div className="text-xs md:text-sm text-slate-600">
                                        <p className="font-medium inline md:block mr-1">Cutting:</p>
                                        <p className="inline md:block">{formatDate(order.cuttingCompletedAt)}</p>
                                    </div>
                                )}
                                {order.completedAt && (
                                    <div className="text-xs md:text-sm text-slate-600">
                                        <p className="font-medium inline md:block mr-1">Completed:</p>
                                        <p className="inline md:block">{formatDate(order.completedAt)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cancel Order Option */}
                        {order.status !== 'Order Completed' && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                            <div className="mt-4 pt-4 border-t border-slate-200/60 flex justify-end">
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
                                            handleStatusUpdate('Cancelled');
                                        }
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors opacity-80 hover:opacity-100"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Cancel Order
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Completion Confirmation Modal */}
            {showCompletionModal && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-green-600 p-6 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Order Completed!</h3>
                            <p className="text-green-50">Ready to proceed to payment collection</p>
                        </div>

                        <div className="p-6">
                            <p className="text-slate-600 text-center mb-6">
                                Would you like to send an invoice notification to the customer?
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={async () => {
                                        setShowCompletionModal(false);
                                        await handleStatusUpdate('Order Completed', true);
                                    }}
                                    disabled={updatingStatus}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>Send Invoice & Continue</span>
                                </button>

                                <button
                                    onClick={async () => {
                                        setShowCompletionModal(false);
                                        await handleStatusUpdate('Order Completed', false);
                                    }}
                                    disabled={updatingStatus}
                                    className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span>Continue Without Sending</span>
                                </button>

                                <button
                                    onClick={() => setShowCompletionModal(false)}
                                    className="w-full py-2.5 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Success / Share Modal */}
            {showDeliveryModal && deliveryData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-green-600 p-6 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">
                                {order?.status === 'Delivered' ? 'Payment Recorded!' : 'Order Delivered!'}
                            </h3>
                            <p className="text-green-100 text-sm">Invoice generated successfully</p>
                        </div>

                        <div className="p-6">
                            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center">
                                {/* Preview Image or Icon */}
                                <img
                                    src={`${API_URL}/api/orders/${order._id}/invoice-jpg`}
                                    alt="Invoice Preview"
                                    className="max-h-64 object-contain shadow-md rounded-lg border border-slate-200 bg-white"
                                />
                            </div>

                            <p className="text-center text-slate-600 mb-6 text-sm">
                                Share the invoice directly with the customer on WhatsApp.
                            </p>

                            <button
                                onClick={handleShareInvoice}
                                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 mb-3"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Share Invoice on WhatsApp
                            </button>

                            <button
                                onClick={() => setShowDeliveryModal(false)}
                                className="w-full py-3 text-slate-500 font-medium hover:text-slate-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetailsPage;
