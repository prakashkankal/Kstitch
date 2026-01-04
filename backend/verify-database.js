// Verify tailors collection in MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tailor from './models/Tailor.js';

dotenv.config();

const verifyDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Count total tailors
        const count = await Tailor.countDocuments();
        console.log(`📊 Total tailors in database: ${count}\n`);

        // Get all tailors (limit to 5 for display)
        const tailors = await Tailor.find().limit(5).sort({ createdAt: -1 });

        if (tailors.length > 0) {
            console.log('📋 Recently registered tailors:\n');
            tailors.forEach((tailor, index) => {
                console.log(`${index + 1}. ${tailor.name}`);
                console.log(`   Email: ${tailor.email}`);
                console.log(`   Shop: ${tailor.shopName}`);
                console.log(`   Specialization: ${tailor.specialization}`);
                console.log(`   Experience: ${tailor.experience} years`);
                console.log(`   Registered: ${tailor.createdAt}\n`);
            });
        } else {
            console.log('⚠️  No tailors found in database yet.');
            console.log('👉 Register a tailor through the UI to test the functionality.\n');
        }

        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

verifyDatabase();
