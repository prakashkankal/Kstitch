import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tailor from './models/Tailor.js';
import User from './models/User.js';

dotenv.config();

const cleanupDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        // Delete all tailors (they will need to re-register)
        const tailorResult = await Tailor.deleteMany({});
        console.log(`✓ Deleted ${tailorResult.deletedCount} tailor records`);

        // Optional: Also delete all users if you want a fresh start
        // const userResult = await User.deleteMany({});
        // console.log(`✓ Deleted ${userResult.deletedCount} user records`);

        console.log('\n✓ Database cleanup complete!');
        console.log('Users can now register as tailors again with proper password hashing.\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanupDatabase();
