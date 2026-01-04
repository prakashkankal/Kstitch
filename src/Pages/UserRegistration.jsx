import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const UserRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const { data } = await axios.post('http://localhost:5000/api/users/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            });

            // Store user data and token
            localStorage.setItem('userInfo', JSON.stringify(data));

            alert('Registration successful! Welcome to StyleEase.');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='w-full min-h-screen py-20 flex justify-center items-center px-4'>
            <div className='w-full max-w-md bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-xl shadow-indigo-500/5 overflow-hidden p-8 md:p-10'>

                <div className='text-center mb-8'>
                    <h2 className='text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2'>
                        Create Account
                    </h2>
                    <p className='text-slate-600'>
                        Join StyleEase to find your perfect tailor
                    </p>
                </div>

                {error && (
                    <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm'>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
                    <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium text-slate-700'>Full Name</label>
                        <input
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            type="text"
                            placeholder="John Doe"
                            className='w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400'
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
                            className='w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400'
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium text-slate-700'>Phone Number</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            type="tel"
                            placeholder="+91 98765 43210"
                            className='w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400'
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium text-slate-700'>Password</label>
                        <input
                            required
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            type="password"
                            placeholder="••••••••"
                            className='w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 placeholder:text-slate-400'
                        />
                    </div>

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

                    <button
                        type="submit"
                        disabled={loading}
                        className='w-full px-6 py-3 mt-2 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 transform hover:-translate-y-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className='mt-6 text-center'>
                    <p className='text-slate-600 text-sm'>
                        Already have an account?{' '}
                        <Link to="/login" className='text-violet-600 hover:text-violet-700 font-semibold'>
                            Login
                        </Link>
                    </p>
                    <p className='text-slate-600 text-sm mt-2'>
                        <Link to="/register" className='text-violet-600 hover:text-violet-700 font-semibold'>
                            Register as a Tailor
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default UserRegistration
