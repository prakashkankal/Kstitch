import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tailor from '../models/Tailor.js';

dotenv.config();

// Placeholder images (you can replace these with actual images later)
const placeholderImages = {
    'Royal Stitches': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop', // Professional men's suits
    'Elegance Designer Boutique': 'https://images.unsplash.com/photo-1558769132-cb1aea3c89e3?w=400&h=400&fit=crop', // Women's boutique
    'Classic Tailors': 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400&h=400&fit=crop', // Traditional tailoring
    'Little Angels Kids Wear': 'https://images.unsplash.com/photo-1503919436774-6d34f26f93b7?w=400&h=400&fit=crop', // Kids clothing
    'Perfect Fit Alterations': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=400&fit=crop', // Tailor at work
    'Bridal Dreams Couture': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop', // Bridal wear
    'Urban Style Studio': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop', // Modern fashion store
    'Heritage Tailoring House': 'https://images.unsplash.com/photo-1605902711834-8b11c3e3ef2f?w=400&h=400&fit=crop' // Traditional tailor shop
};

const addShopImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        for (const [shopName, imageUrl] of Object.entries(placeholderImages)) {
            const result = await Tailor.updateOne(
                { shopName: shopName },
                { $set: { shopImage: imageUrl } }
            );

            if (result.modifiedCount > 0) {
                console.log(`✓ Added shop image for: ${shopName}`);
            }
        }

        console.log('\n✅ All shop images added!\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addShopImages();
