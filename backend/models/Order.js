import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    tailorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tailor',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null for walk-in customers
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: false
    },
    customerPhone: {
        type: String,
        required: true
    },
    orderType: {
        type: String,
        required: true,
        enum: ['Suit Alteration', 'Custom Dress', 'Shirt Stitching', 'Blouse Design', 'Wedding Suit', 'Saree Blouse', 'Lehenga', 'Kurta', 'Other']
    },
    description: {
        type: String,
        required: false
    },
    measurements: {
        type: Map,
        of: String,
        required: false
    },
    price: {
        type: Number,
        required: true
    },
    advancePayment: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled', 'Delivered'],
        default: 'Pending'
    },
    dueDate: {
        type: Date,
        required: false
    },
    notes: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// Index for faster queries
orderSchema.index({ tailorId: 1, status: 1 });
orderSchema.index({ tailorId: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
