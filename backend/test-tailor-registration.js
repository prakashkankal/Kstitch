// Test script to verify tailor registration saves to database
import axios from 'axios';

const testTailorRegistration = async () => {
    try {
        console.log('Testing Tailor Registration...\n');

        const testData = {
            name: 'Rajesh Kumar',
            email: `test.tailor.${Date.now()}@example.com`, // Unique email
            phone: '+91 9876543210',
            shopName: 'Elite Tailors',
            specialization: 'men',
            experience: 10,
            address: {
                street: '123 MG Road',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560001'
            }
        };

        console.log('Sending registration data:', JSON.stringify(testData, null, 2));
        console.log('\n-------------------\n');

        const response = await axios.post('http://localhost:5000/api/tailors/register', testData);

        console.log('✅ SUCCESS! Tailor registered and saved to database.');
        console.log('\nResponse from server:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('\n✨ Data has been saved to MongoDB database: StyleEase.tailors collection');

    } catch (error) {
        console.error('❌ ERROR:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('Server response:', error.response.data);
        }
    }
};

testTailorRegistration();
