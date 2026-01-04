// Test script for user authentication
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/users';

async function testRegistration() {
    console.log('\n=== Testing User Registration ===');
    try {
        const response = await axios.post(`${BASE_URL}/register`, {
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'password123',
            phone: '+91 1234567890'
        });
        console.log('✅ Registration successful!');
        console.log('User:', response.data);
        return response.data;
    } catch (error) {
        console.log('❌ Registration failed:', error.response?.data?.message || error.message);
        return null;
    }
}

async function testLogin() {
    console.log('\n=== Testing User Login ===');
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: 'testuser@example.com',
            password: 'password123'
        });
        console.log('✅ Login successful!');
        console.log('User:', response.data);
        return response.data;
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data?.message || error.message);
        return null;
    }
}

async function testDuplicateEmail() {
    console.log('\n=== Testing Duplicate Email Registration ===');
    try {
        await axios.post(`${BASE_URL}/register`, {
            name: 'Another User',
            email: 'testuser@example.com',
            password: 'password456',
            phone: '+91 9876543210'
        });
        console.log('❌ Should have failed with duplicate email error');
    } catch (error) {
        console.log('✅ Correctly rejected duplicate email:', error.response?.data?.message);
    }
}

async function testWrongPassword() {
    console.log('\n=== Testing Wrong Password Login ===');
    try {
        await axios.post(`${BASE_URL}/login`, {
            email: 'testuser@example.com',
            password: 'wrongpassword'
        });
        console.log('❌ Should have failed with wrong password');
    } catch (error) {
        console.log('✅ Correctly rejected wrong password:', error.response?.data?.message);
    }
}

async function runAllTests() {
    console.log('🚀 Starting Authentication Tests...\n');

    // Test registration
    await testRegistration();

    // Test login
    await testLogin();

    // Test duplicate email
    await testDuplicateEmail();

    // Test wrong password
    await testWrongPassword();

    console.log('\n✨ All tests completed!\n');
}

runAllTests();
