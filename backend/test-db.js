import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('----------------------------------------');
console.log('Testing MongoDB Connection...');
console.log('URI:', process.env.MONGO_URI.replace(/:([^:@]{1,})@/, ':****@')); // Hide password
console.log('----------------------------------------');

if (!process.env.MONGO_URI) {
    console.error('❌ ERROR: MONGO_URI is missing from .env');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ SUCCESS! Connected to MongoDB.');
        console.log('You can now restart your backend server.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ FAILED:', err.message);
        if (err.message.includes('bad auth')) {
            console.log('\n💡 TIP: Check your Username and Password carefully.');
            console.log('   - Ensure special characters are URL encoded if needed.');
            console.log('   - Try creating a temporary user with a simple password (e.g., test1234).');
        }
        if (err.message.includes('IP')) {
            console.log('\n💡 TIP: Check Network Access in MongoDB Atlas.');
            console.log('   - Whitelist your IP or allow 0.0.0.0/0');
        }
        process.exit(1);
    });
