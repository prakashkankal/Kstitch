import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tailor from '../models/Tailor.js';
import { demoTailors } from './demoTailors.js';

dotenv.config();

const seedDemoTailors = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        // Optional: Clear existing demo tailors (emails match @example.com)
        const deleteResult = await Tailor.deleteMany({ email: { $regex: '@example.com$' } });
        console.log(`✓ Removed ${deleteResult.deletedCount} existing demo tailors`);

        // Insert demo tailors
        console.log('\n📝 Creating demo tailor profiles...\n');

        for (const tailorData of demoTailors) {
            try {
                const tailor = await Tailor.create({
                    ...tailorData,
                    isVerified: true, // Auto-verify demo accounts
                    verificationToken: undefined, // No verification needed
                    verificationTokenExpire: undefined
                });

                console.log(`✓ Created: ${tailor.shopName} (${tailor.name}) - ${tailor.area}`);
                console.log(`  Email: ${tailor.email} | Phone: ${tailor.phone}`);
                console.log(`  Specialization: ${tailor.specialization} | Rating: ${tailor.rating} ⭐`);
                console.log(`  Experience: ${tailor.experience} years\n`);
            } catch (error) {
                console.error(`✗ Error creating ${tailorData.shopName}:`, error.message);
            }
        }

        console.log('\n✅ Demo tailor seeding completed!');
        console.log('\n📊 Summary:');
        console.log(`   Total Tailors: ${demoTailors.length}`);
        console.log(`   Location: Latur, Maharashtra`);
        console.log(`   All accounts are verified and ready to use`);
        console.log('\n🔐 Login Credentials:');
        console.log('   Email: Any tailor email from above');
        console.log('   Password: Demo@123');
        console.log('\n💡 Tip: You can now view these tailors on the homepage!');

        // Disconnect
        await mongoose.disconnect();
        console.log('\n✓ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding demo tailors:', error);
        process.exit(1);
    }
};

// Run the seeder
seedDemoTailors();
