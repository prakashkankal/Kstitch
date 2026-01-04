import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const TailorRegistration = () => {
    const navigate = useNavigate();
    const [isExistingUser, setIsExistingUser] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        shopName: '',
        specialization: '',
        experience: '',
        street: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [error, setError] = useState('');

    // Check if user is already logged in
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const user = JSON.parse(userInfo);

                // Only pre-fill if it's a regular user (not already a tailor)
                if (user.userType !== 'tailor' && user.email) {
                    setIsExistingUser(true);
                    setFormData(prev => ({
                        ...prev,
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        // Note: We can't retrieve the plain password since it's hashed
                        // User will use same password, we'll note this in the form
                    }));
                }
            } catch (err) {
                console.error('Error parsing user info:', err);
            }
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // For existing users, they can skip password (will use existing password)
        // For new users, password is required
        if (!isExistingUser) {
            // Validation for new users
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match!');
                return;
            }

            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                return;
            }
        } else {
            // For existing users, if they didn't enter password, we need to get it from their user account
            if (!formData.password || formData.password.trim() === '') {
                setError('Please enter your current password to verify your identity');
                return;
            }
        }

        // Construct payload to match backend schema
        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            shopName: formData.shopName,
            specialization: formData.specialization,
            experience: Number(formData.experience),
            address: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode
            }
        };

        try {
            const response = await fetch('http://localhost:5000/api/tailors/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                // Store user data and token in localStorage (auto-login)
                localStorage.setItem('userInfo', JSON.stringify(data));

                // Registration successful - auto-login and redirect to dashboard
                alert(`Welcome to StyleEase, ${data.name}! Redirecting to your dashboard...`);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className='w-full min-h-screen py-20 flex justify-center items-center px-4'>
            <div className='w-full max-w-4xl bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-xl shadow-indigo-500/5 overflow-hidden p-8 md:p-12'>

                <div className='text-center mb-10'>
                    <h2 className='text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4'>
                        {isExistingUser ? (
                            <>Upgrade to <span className='text-violet-600'>Tailor Partner</span></>
                        ) : (
                            <>Join as a <span className='text-violet-600'>Partner</span></>
                        )}
                    </h2>
                    <p className='text-slate-600 max-w-lg mx-auto'>
                        {isExistingUser
                            ? 'Complete your tailor profile to start offering your services'
                            : 'Register your shop on StyleEase and connect with thousands of customers looking for the perfect fit.'
                        }
                    </p>
                </div>

                {isExistingUser && (
                    <div className='mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-sm'>
                        <div className='flex items-start gap-2'>
                            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className='font-semibold mb-1'>Welcome back, {formData.name}!</p>
                                <p>Your account details are pre-filled. Just complete the shop information below and enter your current password to verify.</p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className='mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm'>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    {/* Personal Details */}
                    <div className='flex flex-col gap-5'>
                        <h4 className='text-lg font-semibold text-slate-800 border-b border-white/40 pb-2'>Personal Details</h4>
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm font-medium text-slate-700'>Full Name</label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                type="text"
                                placeholder="John Doe"
                                disabled={isExistingUser}
                                className={`w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400 ${isExistingUser ? 'opacity-75 cursor-not-allowed' : ''}`}
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm font-medium text-slate-700'>Email Address</label>
                            <input
                                required
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                placeholder="john@example.com"
                                disabled={isExistingUser}
                                className={`w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400 ${isExistingUser ? 'opacity-75 cursor-not-allowed' : ''}`}
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm font-medium text-slate-700'>
                                {isExistingUser ? 'Your Current Password' : 'Password'}
                            </label>
                            <input
                                required
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                type="password"
                                placeholder={isExistingUser ? "Enter your current password" : "••••••••"}
                                className='w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400'
                            />
                            {isExistingUser && (
                                <p className='text-xs text-slate-500'>Enter your existing account password to verify</p>
                            )}
                        </div>
                        {!isExistingUser && (
                            <div className='flex flex-col gap-2'>
                                <label className='text-sm font-medium text-slate-700'>Confirm Password</label>
                                <input
                                    required
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    type="password"
                                    placeholder="••••••••"
                                    className='w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400'
                                />
                            </div>
                        )}
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm font-medium text-slate-700'>Phone Number</label>
                            <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="+91 98765 43210" className='w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400' />
                        </div>
                    </div>

                    {/* Shop Details */}
                    <div className='flex flex-col gap-5'>
                        <h4 className='text-lg font-semibold text-slate-800 border-b border-white/40 pb-2'>Shop Details</h4>
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm font-medium text-slate-700'>Shop Name</label>
                            <input required name="shopName" value={formData.shopName} onChange={handleChange} type="text" placeholder="Elegant Styles" className='w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400' />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm font-medium text-slate-700'>Specialization</label>
                            <select required name="specialization" value={formData.specialization} onChange={handleChange} className='w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 cursor-pointer'>
                                <option value="">Select Specialization</option>
                                <option value="men">Men's Wear</option>
                                <option value="women">Women's Wear</option>
                                <option value="kids">All (Unisex)</option>
                            </select>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='text-sm font-medium text-slate-700'>Experience (Years)</label>
                            <input required name="experience" value={formData.experience} onChange={handleChange} type="number" placeholder="5" className='w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400' />
                        </div>
                    </div>

                    {/* Address - Full Width */}
                    <div className='md:col-span-2 flex flex-col gap-5'>
                        <h4 className='text-lg font-semibold text-slate-800 border-b border-white/40 pb-2'>Address</h4>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <input required name="street" value={formData.street} onChange={handleChange} type="text" placeholder="Street Address / Area" className='w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400' />
                            <input required name="city" value={formData.city} onChange={handleChange} type="text" placeholder="City" className='w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400' />
                            <input required name="state" value={formData.state} onChange={handleChange} type="text" placeholder="State" className='w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400' />
                            <input required name="pincode" value={formData.pincode} onChange={handleChange} type="text" placeholder="Pincode" className='w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400' />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className='md:col-span-2 mt-4 flex justify-end'>
                        <button type="submit" className='px-10 py-4 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 transform hover:-translate-y-1 transition-all cursor-pointer w-full md:w-auto'>
                            Register Now
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TailorRegistration
