import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [profilePhoto, setProfilePhoto] = useState(null);

    useEffect(() => {
        // Get user info from localStorage
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const userData = JSON.parse(userInfo);
            setUser(userData);
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || ''
            });
            setProfilePhoto(userData.profilePhoto || null);
        } else {
            // Redirect to login if not authenticated
            navigate('/login');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('File size should be less than 2MB');
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                return;
            }

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setProfilePhoto(null);
    };

    const handleSave = () => {
        // Update localStorage with new data including photo
        const updatedUser = { ...user, ...formData, profilePhoto };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    const handleCancel = () => {
        // Reset form to original user data
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || ''
        });
        setProfilePhoto(user.profilePhoto || null);
        setIsEditing(false);
    };

    // Get user initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (!user) {
        return (
            <div className='w-full min-h-screen flex items-center justify-center'>
                <div className='text-slate-600'>Loading...</div>
            </div>
        );
    }

    return (
        <div className='w-full min-h-screen py-20 px-4 md:px-8'>
            <div className='max-w-4xl mx-auto'>
                {/* Header */}
                <div className='mb-8'>
                    <button
                        onClick={() => navigate('/')}
                        className='flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors mb-4'
                    >
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                        </svg>
                        Back to Home
                    </button>
                    <h1 className='text-4xl font-serif font-bold text-slate-900'>My Profile</h1>
                    <p className='text-slate-600 mt-2'>Manage your account information</p>
                </div>

                <div className='bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-xl shadow-indigo-500/5 overflow-hidden'>
                    {/* Profile Header with Avatar */}
                    <div className='bg-linear-to-br from-violet-50 to-fuchsia-50 p-8 border-b border-slate-200'>
                        <div className='flex items-center gap-6'>
                            {/* Avatar with Photo Upload */}
                            <div className='relative group'>
                                {profilePhoto ? (
                                    <img
                                        src={profilePhoto}
                                        alt="Profile"
                                        className='w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white'
                                    />
                                ) : (
                                    <div className='w-24 h-24 rounded-full bg-linear-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg'>
                                        {getInitials(user.name)}
                                    </div>
                                )}

                                {/* Upload/Change Photo Overlay */}
                                {isEditing && (
                                    <div className='absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'>
                                        <input
                                            type='file'
                                            accept='image/*'
                                            onChange={handlePhotoChange}
                                            className='hidden'
                                            id='photo-upload'
                                        />
                                        <label htmlFor='photo-upload' className='cursor-pointer flex flex-col items-center'>
                                            <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' />
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' />
                                            </svg>
                                            <span className='text-white text-xs mt-1'>{profilePhoto ? 'Change' : 'Upload'}</span>
                                        </label>
                                    </div>
                                )}

                                {/* Remove Photo Button */}
                                {isEditing && profilePhoto && (
                                    <button
                                        onClick={handleRemovePhoto}
                                        className='absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg'
                                        title='Remove photo'
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <div>
                                <h2 className='text-2xl font-bold text-slate-900'>{user.name}</h2>
                                <p className='text-slate-600'>{user.email}</p>
                                <div className='mt-2 inline-block px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium'>
                                    Customer Account
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className='p-8'>
                        <div className='flex justify-between items-center mb-6'>
                            <h3 className='text-xl font-bold text-slate-900'>Personal Information</h3>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className='px-6 py-2.5 bg-violet-600 text-white font-semibold rounded-full hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/30 cursor-pointer'
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className='flex gap-3'>
                                    <button
                                        onClick={handleCancel}
                                        className='px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-full hover:bg-slate-50 transition-all cursor-pointer'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className='px-6 py-2.5 bg-violet-600 text-white font-semibold rounded-full hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/30 cursor-pointer'
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className='grid md:grid-cols-2 gap-6'>
                            {/* Full Name */}
                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-2'>Full Name</label>
                                {isEditing ? (
                                    <input
                                        type='text'
                                        name='name'
                                        value={formData.name}
                                        onChange={handleChange}
                                        className='w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900'
                                    />
                                ) : (
                                    <div className='px-4 py-3 bg-slate-50 rounded-xl text-slate-900'>{user.name}</div>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-2'>Email Address</label>
                                <div className='px-4 py-3 bg-slate-50 rounded-xl text-slate-900 flex items-center justify-between'>
                                    {user.email}
                                    <span className='text-xs text-slate-500 ml-2'>(Cannot be changed)</span>
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-2'>Phone Number</label>
                                {isEditing ? (
                                    <input
                                        type='tel'
                                        name='phone'
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className='w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900'
                                        placeholder='+91 98765 43210'
                                    />
                                ) : (
                                    <div className='px-4 py-3 bg-slate-50 rounded-xl text-slate-900'>
                                        {user.phone || 'Not provided'}
                                    </div>
                                )}
                            </div>

                            {/* Member Since */}
                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-2'>Member Since</label>
                                <div className='px-4 py-3 bg-slate-50 rounded-xl text-slate-900'>
                                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Actions */}
                    <div className='p-8 bg-slate-50/50 border-t border-slate-200'>
                        <h3 className='text-lg font-bold text-slate-900 mb-4'>Account Settings</h3>
                        <div className='space-y-3'>
                            <button className='w-full md:w-auto px-6 py-3 text-left text-slate-700 hover:text-violet-600 hover:bg-white rounded-xl transition-all cursor-pointer flex items-center gap-2'>
                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' />
                                </svg>
                                Change Password
                            </button>
                            <button className='w-full md:w-auto px-6 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer flex items-center gap-2'>
                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                </svg>
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
