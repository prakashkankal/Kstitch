import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
        setLoading(true);

        try {
            // First try to login as a tailor (tailor account has priority)
            try {
                const { data } = await axios.post('http://localhost:5000/api/tailors/login', {
                    email: formData.email,
                    password: formData.password
                });

                // Store tailor data and token in localStorage
                localStorage.setItem('userInfo', JSON.stringify(data));

                alert(`Welcome back, ${data.name}!`);
                navigate('/dashboard');
                return;
            } catch (tailorError) {
                // If tailor login fails, try user login
                try {
                    const { data } = await axios.post('http://localhost:5000/api/users/login', {
                        email: formData.email,
                        password: formData.password
                    });

                    // Store user data and token in localStorage
                    localStorage.setItem('userInfo', JSON.stringify(data));

                    alert(`Welcome back, ${data.name}!`);
                    navigate('/');
                    return;
                } catch (userError) {
                    // Both logins failed
                    throw new Error('Invalid email or password');
                }
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='w-full min-h-screen flex justify-center items-center px-4'>
            <div className='w-full max-w-md bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-xl shadow-indigo-500/5 overflow-hidden p-8 md:p-10'>

                <div className='text-center mb-8'>
                    <h2 className='text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2'>
                        Welcome Back
                    </h2>
                    <p className='text-slate-600'>
                        Login to your StyleEase account
                    </p>
                </div>

                {error && (
                    <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm'>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
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

                    <div className='flex justify-between items-center text-sm'>
                        <label className='flex items-center gap-2 cursor-pointer'>
                            <input type="checkbox" className='w-4 h-4 rounded accent-violet-600' />
                            <span className='text-slate-600'>Remember me</span>
                        </label>
                        <a href="#" className='text-violet-600 hover:text-violet-700 font-medium'>
                            Forgot Password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className='w-full px-6 py-3 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 transform hover:-translate-y-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className='mt-6 text-center'>
                    <p className='text-slate-600 text-sm'>
                        Don't have an account?{' '}
                        <Link to="/signup" className='text-violet-600 hover:text-violet-700 font-semibold'>
                            Sign Up
                        </Link>
                    </p>
                    <p className='text-slate-600 text-sm mt-2'>
                        <Link to="/register" className='text-violet-600 hover:text-violet-700 font-semibold'>
                            Register as Tailor
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
