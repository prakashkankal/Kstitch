import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import Tailor from './models/Tailor.js';
import connectDB from './config/db.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const seedOrders = async () => {
    try {
        // Get the first tailor from the database
        const tailor = await Tailor.findOne();

        if (!tailor) {
            console.log('No tailor found in database. Please create a tailor first.');
            process.exit(1);
        }

        console.log(`Found tailor: ${tailor.shopName} (${tailor.email})`);

        // Sample orders
        const sampleOrders = [
            {
                tailorId: tailor._id,
                customerName: 'Rahul Sharma',
                customerEmail: 'rahul@example.com',
                customerPhone: '+91 98765 43210',
                orderType: 'Wedding Suit',
                description: 'Custom wedding suit with embroidery',
                price: 25000,
                advancePayment: 10000,
                status: 'In Progress',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            },
            {
                tailorId: tailor._id,
                customerName: 'Priya Patel',
                customerEmail: 'priya@example.com',
                customerPhone: '+91 98765 43211',
                orderType: 'Saree Blouse',
                description: 'Designer blouse with mirror work',
                price: 3500,
                advancePayment: 1500,
                status: 'Completed',
                dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
                tailorId: tailor._id,
                customerName: 'Amit Kumar',
                customerEmail: 'amit@example.com',
                customerPhone: '+91 98765 43212',
                orderType: 'Shirt Stitching',
                description: 'Regular fit shirt',
                price: 1200,
                advancePayment: 500,
                status: 'Pending',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            },
            {
                tailorId: tailor._id,
                customerName: 'Sneha Reddy',
                customerEmail: 'sneha@example.com',
                customerPhone: '+91 98765 43213',
                orderType: 'Lehenga',
                description: 'Bridal lehenga with heavy work',
                price: 45000,
                advancePayment: 20000,
                status: 'In Progress',
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            },
            {
                tailorId: tailor._id,
                customerName: 'Vikram Singh',
                customerEmail: 'vikram@example.com',
                customerPhone: '+91 98765 43214',
                orderType: 'Suit Alteration',
                description: 'Alter sleeve length and waist',
                price: 800,
                advancePayment: 0,
                status: 'Completed',
                dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            },
            {
                tailorId: tailor._id,
                customerName: 'Anjali Mehta',
                customerEmail: 'anjali@example.com',
                customerPhone: '+91 98765 43215',
                orderType: 'Custom Dress',
                description: 'Party wear dress',
                price: 4500,
                advancePayment: 2000,
                status: 'Pending',
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
            },
            {
                tailorId: tailor._id,
                customerName: 'Rajesh Gupta',
                customerEmail: 'rajesh@example.com',
                customerPhone: '+91 98765 43216',
                orderType: 'Kurta',
                description: 'Cotton kurta for daily wear',
                price: 1800,
                advancePayment: 800,
                status: 'Completed',
                dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            }
        ];

        // Delete existing orders for this tailor
        await Order.deleteMany({ tailorId: tailor._id });
        console.log('Deleted existing orders');

        // Insert sample orders
        const createdOrders = await Order.insertMany(sampleOrders);
        console.log(`✅ Created ${createdOrders.length} sample orders successfully!`);

        // Update tailor rating
        await Tailor.findByIdAndUpdate(tailor._id, { rating: 4.8 });
        console.log('✅ Updated tailor rating to 4.8');

        console.log('\nOrders created:');
        createdOrders.forEach(order => {
            console.log(`- ${order.customerName}: ${order.orderType} (${order.status}) - ₹${order.price}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding orders:', error);
        process.exit(1);
    }
};

seedOrders();
