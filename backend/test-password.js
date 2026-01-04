import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tailor from './models/Tailor.js';

dotenv.config();

const testPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find a tailor
        const tailor = await Tailor.findOne({});

        if (!tailor) {
            console.log('No tailor found in database');
            process.exit(0);
        }

        console.log('Found tailor:', tailor.email);
        console.log('Hashed password in DB:', tailor.password);
        console.log('Password length:', tailor.password.length);

        // Test password comparison
        const testPasswords = ['password123', 'Password123', '123456'];

        for (const pwd of testPasswords) {
            const isMatch = await tailor.matchPassword(pwd);
            console.log(`Testing password "${pwd}": ${isMatch ? 'MATCH' : 'NO MATCH'}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testPassword();
