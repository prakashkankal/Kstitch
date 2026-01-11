import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        dateOfBirth: '',
        gender: '',
        city: '',
        country: '',
        alternatePhone: ''
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [settings, setSettings] = useState({
        emailNotifications: true,
        orderUpdates: true,
        promotionalEmails: false,
        twoFactorAuth: false,
        profileVisibility: 'public'
    });

    useEffect(() => {
        // Get user info from localStorage
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const userData = JSON.parse(userInfo);
            setUser(userData);
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                bio: userData.bio || '',
                dateOfBirth: userData.dateOfBirth || '',
                gender: userData.gender || '',
                city: userData.city || '',
                country: userData.country || '',
                alternatePhone: userData.alternatePhone || ''
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

    const updateProfileAPI = async (updateData) => {
        try {
            const response = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const handlePhotoChange = async (e) => {
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
            reader.onloadend = async () => {
                const photoData = reader.result;
                setProfilePhoto(photoData);

                try {
                    // Save to database via API
                    const updatedUser = await updateProfileAPI({ profilePhoto: photoData });

                    // Update localStorage
                    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                    setUser(updatedUser);

                    alert('Profile photo updated successfully!');
                } catch (error) {
                    alert('Failed to upload photo. Please try again.');
                    setProfilePhoto(user.profilePhoto || null);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = async () => {
        try {
            setProfilePhoto(null);

            // Save to database via API
            const updatedUser = await updateProfileAPI({ profilePhoto: null });

            // Update localStorage
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            setUser(updatedUser);

            alert('Profile photo removed successfully!');
        } catch (error) {
            alert('Failed to remove photo. Please try again.');
            setProfilePhoto(user.profilePhoto || null);
        }
    };

    const handleSave = async () => {
        try {
            // Update profile with all data
            const updatedUser = await updateProfileAPI({
                ...formData,
                profilePhoto
            });

            // Update localStorage
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleCancel = () => {
        // Reset form to original user data
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            bio: user.bio || '',
            dateOfBirth: user.dateOfBirth || '',
            gender: user.gender || '',
            city: user.city || '',
            country: user.country || '',
            alternatePhone: user.alternatePhone || ''
        });
        setProfilePhoto(user.profilePhoto || null);
        setIsEditing(false);
    };

    // Calculate profile completion
    const getProfileCompletion = () => {
        const fields = ['name', 'email', 'phone', 'bio', 'dateOfBirth', 'gender', 'city', 'country'];
        const filledFields = fields.filter(field => user?.[field] && user[field].trim() !== '');
        const percentage = Math.round((filledFields.length / fields.length) * 100);
        return { percentage, filledFields: filledFields.length, totalFields: fields.length };
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleChangePassword = () => {
        // Validate password fields
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            alert('Please fill in all password fields');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert('New password must be at least 6 characters long');
            return;
        }

        // In a real app, you would validate current password with backend
        // For now, we'll just update localStorage
        const updatedUser = { ...user, password: passwordData.newPassword };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUser(updatedUser);

        // Reset and close
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
        alert('Password changed successfully!');
    };

    const handleDeleteAccount = () => {
        // Confirm deletion
        const confirmDelete = window.confirm(
            'Are you absolutely sure you want to delete your account? This action cannot be undone.'
        );

        if (confirmDelete) {
            // Remove user data
            localStorage.removeItem('userInfo');
            alert('Your account has been deleted.');
            navigate('/');
        }
        setShowDeleteModal(false);
    };

    const handleSettingToggle = (setting) => {
        const newSettings = { ...settings, [setting]: !settings[setting] };
        setSettings(newSettings);
        // Save to localStorage
        const updatedUser = { ...user, settings: newSettings };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const handlePrivacyChange = (value) => {
        const newSettings = { ...settings, profileVisibility: value };
        setSettings(newSettings);
        const updatedUser = { ...user, settings: newSettings };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const handleDownloadData = () => {
        const userData = JSON.stringify(user, null, 2);
        const blob = new Blob([userData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        alert('Your data has been downloaded successfully!');
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

    // Sidebar menu items
    const menuItems = [
        { id: 'profile', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'orders', label: 'My Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
        { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ];

    if (!user) {
        return (
            <div className='w-full min-h-screen flex items-center justify-center'>
                <div className='text-slate-600'>Loading...</div>
            </div>
        );
    }

    return (
        <div className='w-full min-h-screen'>
            <div className='flex flex-col lg:flex-row gap-0 min-h-screen'>
                {/* Left Sidebar */}
                <div className='lg:w-64 flex-shrink-0 bg-white shadow-lg'>
                    <div className='p-4 lg:sticky lg:top-0 lg:h-screen overflow-y-auto'>
                        {/* Back Button */}
                        <button
                            onClick={() => navigate('/')}
                            className='flex items-center gap-2 text-slate-600 hover:text-[#8B7355] transition-colors mb-4 px-3 py-2 rounded-lg hover:bg-slate-50 w-full'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                            </svg>
                            <span className='font-medium text-sm'>Back to Home</span>
                        </button>

                        {/* User Info Card */}
                        <div className='text-center pb-4 mb-4 border-b border-slate-200'>
                            <div className='relative group inline-block mb-3'>
                                {profilePhoto ? (
                                    <img
                                        src={profilePhoto}
                                        alt="Profile"
                                        className='w-20 h-20 rounded-full object-cover border-4 border-[#8B7355]'
                                    />
                                ) : (
                                    <div className='w-20 h-20 rounded-full bg-gradient-to-br from-[#8B7355] to-[#6B5444] flex items-center justify-center text-white font-bold text-2xl'>
                                        {getInitials(user.name)}
                                    </div>
                                )}

                                {/* Upload Icon Overlay - Shows on Hover */}
                                <div className='absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'>
                                    <input
                                        type='file'
                                        accept='image/*'
                                        onChange={handlePhotoChange}
                                        className='hidden'
                                        id='sidebar-photo-upload'
                                    />
                                    <label htmlFor='sidebar-photo-upload' className='cursor-pointer flex flex-col items-center'>
                                        <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                        </svg>
                                        <span className='text-white text-xs mt-1'>Upload</span>
                                    </label>
                                </div>
                            </div>
                            <h3 className='font-bold text-slate-900 text-lg'>{user.name}</h3>
                            <p className='text-slate-500 text-sm truncate'>{user.email}</p>
                        </div>

                        {/* Navigation Menu */}
                        <nav className='space-y-1'>
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === item.id
                                        ? 'bg-gradient-to-r from-[#8B7355] to-[#6B5444] text-white shadow-md'
                                        : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={item.icon} />
                                    </svg>
                                    <span className='font-medium'>{item.label}</span>
                                </button>
                            ))}

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className='w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-600 hover:bg-red-50'
                            >
                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                                </svg>
                                <span className='font-medium'>Logout</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className='flex-1'>
                    {activeSection === 'profile' && (
                        <div className='overflow-hidden'>
                            {/* Profile Header */}
                            <div className='bg-gradient-to-r from-[#8B7355] to-[#6B5444] p-6 text-white'>
                                <h2 className='text-2xl font-bold'>Profile Information</h2>
                                <p className='text-white/80 mt-1'>Manage your personal details</p>
                            </div>

                            {/* Profile Form */}
                            <div className='p-6'>
                                {/* Profile Completion Indicator */}
                                <div className='mb-6 p-4 bg-gradient-to-r from-[#8B7355]/10 to-[#6B5444]/10 rounded-xl border border-[#8B7355]/20'>
                                    <div className='flex items-center justify-between mb-2'>
                                        <span className='text-sm font-semibold text-slate-700'>Profile Completion</span>
                                        <span className='text-sm font-bold text-[#8B7355]'>{getProfileCompletion().percentage}%</span>
                                    </div>
                                    <div className='w-full bg-slate-200 rounded-full h-2.5'>
                                        <div
                                            className='bg-gradient-to-r from-[#8B7355] to-[#6B5444] h-2.5 rounded-full transition-all duration-500'
                                            style={{ width: `${getProfileCompletion().percentage}%` }}
                                        ></div>
                                    </div>
                                    <p className='text-xs text-slate-500 mt-2'>
                                        {getProfileCompletion().filledFields} of {getProfileCompletion().totalFields} fields completed
                                    </p>
                                </div>

                                <div className='flex justify-between items-center mb-6'>
                                    <h3 className='text-lg font-bold text-slate-900'>Personal Details</h3>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className='px-6 py-2.5 bg-[#8B7355] text-white font-semibold rounded-lg hover:bg-[#6B5444] transition-all'
                                        >
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <div className='flex gap-3'>
                                            <button
                                                onClick={handleCancel}
                                                className='px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all'
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className='px-6 py-2.5 bg-[#8B7355] text-white font-semibold rounded-lg hover:bg-[#6B5444] transition-all'
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Bio Section */}
                                <div className='mb-6'>
                                    <label className='block text-sm font-medium text-slate-700 mb-2'>About / Bio</label>
                                    {isEditing ? (
                                        <textarea
                                            name='bio'
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows='3'
                                            className='w-full px-4 py-3 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-slate-900'
                                            placeholder='Tell us about yourself...'
                                        />
                                    ) : (
                                        <div className='px-4 py-3 bg-slate-50 rounded-lg text-slate-900 min-h-[80px]'>
                                            {user.bio || 'No bio added yet'}
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
                                                className='w-full px-4 py-3 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-slate-900'
                                            />
                                        ) : (
                                            <div className='px-4 py-3 bg-slate-50 rounded-lg text-slate-900'>{user.name}</div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className='block text-sm font-medium text-slate-700 mb-2'>Email Address</label>
                                        <div className='px-4 py-3 bg-slate-50 rounded-lg text-slate-900 flex items-center justify-between'>
                                            <span className='truncate'>{user.email}</span>
                                            <span className='text-xs text-slate-500 ml-2 flex-shrink-0'>(Locked)</span>
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
                                                className='w-full px-4 py-3 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-slate-900'
                                                placeholder='+91 98765 43210'
                                            />
                                        ) : (
                                            <div className='px-4 py-3 bg-slate-50 rounded-lg text-slate-900'>
                                                {user.phone || 'Not provided'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Date of Birth */}
                                    <div>
                                        <label className='block text-sm font-medium text-slate-700 mb-2'>Date of Birth</label>
                                        {isEditing ? (
                                            <input
                                                type='date'
                                                name='dateOfBirth'
                                                value={formData.dateOfBirth}
                                                onChange={handleChange}
                                                className='w-full px-4 py-3 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-slate-900'
                                            />
                                        ) : (
                                            <div className='px-4 py-3 bg-slate-50 rounded-lg text-slate-900'>
                                                {user.dateOfBirth || 'Not provided'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className='block text-sm font-medium text-slate-700 mb-2'>Gender</label>
                                        {isEditing ? (
                                            <select
                                                name='gender'
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className='w-full px-4 py-3 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-slate-900'
                                            >
                                                <option value=''>Select Gender</option>
                                                <option value='male'>Male</option>
                                                <option value='female'>Female</option>
                                                <option value='other'>Other</option>
                                                <option value='prefer-not-to-say'>Prefer not to say</option>
                                            </select>
                                        ) : (
                                            <div className='px-4 py-3 bg-slate-50 rounded-lg text-slate-900 capitalize'>
                                                {user.gender || 'Not provided'}
                                            </div>
                                        )}
                                    </div>

                                    {/* City */}
                                    <div>
                                        <label className='block text-sm font-medium text-slate-700 mb-2'>City</label>
                                        {isEditing ? (
                                            <input
                                                type='text'
                                                name='city'
                                                value={formData.city}
                                                onChange={handleChange}
                                                className='w-full px-4 py-3 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-slate-900'
                                                placeholder='Enter your city'
                                            />
                                        ) : (
                                            <div className='px-4 py-3 bg-slate-50 rounded-lg text-slate-900'>
                                                {user.city || 'Not provided'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className='block text-sm font-medium text-slate-700 mb-2'>Country</label>
                                        {isEditing ? (
                                            <input
                                                type='text'
                                                name='country'
                                                value={formData.country}
                                                onChange={handleChange}
                                                className='w-full px-4 py-3 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-slate-900'
                                                placeholder='Enter your country'
                                            />
                                        ) : (
                                            <div className='px-4 py-3 bg-slate-50 rounded-lg text-slate-900'>
                                                {user.country || 'Not provided'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Member Since */}
                                    <div>
                                        <label className='block text-sm font-medium text-slate-700 mb-2'>Member Since</label>
                                        <div className='px-4 py-3 bg-slate-50 rounded-lg text-slate-900'>
                                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>

                                    {/* Alternate Phone */}
                                    <div>
                                        <label className='block text-sm font-medium text-slate-700 mb-2'>Alternate Phone</label>
                                        {isEditing ? (
                                            <input
                                                type='tel'
                                                name='alternatePhone'
                                                value={formData.alternatePhone}
                                                onChange={handleChange}
                                                className='w-full px-4 py-3 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B7355] text-slate-900'
                                                placeholder='+91 98765 43210'
                                            />
                                        ) : (
                                            <div className='px-4 py-3 bg-slate-50 rounded-lg text-slate-900'>
                                                {user.alternatePhone || 'Not provided'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'orders' && (

                        <div className='text-center'>
                            <div className='bg-gradient-to-r from-[#8B7355] to-[#6B5444] p-6 text-white'>
                                <h2 className='text-2xl font-bold'>Profile Information</h2>
                                <p className='text-white/80 mt-1'>Manage your personal details</p>
                            </div>
                            <svg className='w-16 h-16 mx-auto text-slate-300 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
                            </svg>
                            <h3 className='text-xl font-bold text-slate-900 mb-2'>No Orders Yet</h3>
                            <p className='text-slate-600'>Your order history will appear here</p>
                        </div>
                    )}

                    {activeSection === 'settings' && (
                        <div className='overflow-hidden'>
                            <div className='bg-gradient-to-r from-[#8B7355] to-[#6B5444] p-6 text-white'>
                                <h2 className='text-2xl font-bold'>Account Settings</h2>
                                <p className='text-white/80 mt-1'>Manage your account preferences</p>
                            </div>
                            <div className='p-6 space-y-6'>
                                {/* Security Section */}
                                <div>
                                    <h3 className='text-lg font-bold text-slate-900 mb-3'>Security</h3>
                                    <div className='space-y-3'>
                                        <button
                                            onClick={() => setShowPasswordModal(true)}
                                            className='w-full px-6 py-4 text-left text-slate-700 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between border border-slate-200'
                                        >
                                            <div className='flex items-center gap-3'>
                                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' />
                                                </svg>
                                                <span className='font-medium'>Change Password</span>
                                            </div>
                                            <svg className='w-5 h-5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                                            </svg>
                                        </button>

                                        <div className='px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between'>
                                            <div className='flex items-center gap-3'>
                                                <svg className='w-5 h-5 text-slate-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                                                </svg>
                                                <span className='font-medium text-slate-700'>Two-Factor Authentication</span>
                                            </div>
                                            <button
                                                onClick={() => handleSettingToggle('twoFactorAuth')}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.twoFactorAuth ? 'bg-[#8B7355]' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Notifications Section */}
                                <div>
                                    <h3 className='text-lg font-bold text-slate-900 mb-3'>Notifications</h3>
                                    <div className='space-y-3'>
                                        <div className='px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between'>
                                            <div>
                                                <p className='font-medium text-slate-700'>Email Notifications</p>
                                                <p className='text-sm text-slate-500'>Receive notifications via email</p>
                                            </div>
                                            <button
                                                onClick={() => handleSettingToggle('emailNotifications')}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.emailNotifications ? 'bg-[#8B7355]' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>

                                        <div className='px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between'>
                                            <div>
                                                <p className='font-medium text-slate-700'>Order Updates</p>
                                                <p className='text-sm text-slate-500'>Get notified about order status</p>
                                            </div>
                                            <button
                                                onClick={() => handleSettingToggle('orderUpdates')}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.orderUpdates ? 'bg-[#8B7355]' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.orderUpdates ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>

                                        <div className='px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between'>
                                            <div>
                                                <p className='font-medium text-slate-700'>Promotional Emails</p>
                                                <p className='text-sm text-slate-500'>Receive offers and promotions</p>
                                            </div>
                                            <button
                                                onClick={() => handleSettingToggle('promotionalEmails')}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.promotionalEmails ? 'bg-[#8B7355]' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.promotionalEmails ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Privacy Section */}
                                <div>
                                    <h3 className='text-lg font-bold text-slate-900 mb-3'>Privacy</h3>
                                    <div className='px-6 py-4 bg-slate-50 rounded-xl border border-slate-200'>
                                        <p className='font-medium text-slate-700 mb-3'>Profile Visibility</p>
                                        <div className='space-y-2'>
                                            <label className='flex items-center gap-3 cursor-pointer'>
                                                <input
                                                    type='radio'
                                                    name='privacy'
                                                    value='public'
                                                    checked={settings.profileVisibility === 'public'}
                                                    onChange={(e) => handlePrivacyChange(e.target.value)}
                                                    className='w-4 h-4 text-[#8B7355]'
                                                />
                                                <div>
                                                    <p className='text-sm font-medium text-slate-700'>Public</p>
                                                    <p className='text-xs text-slate-500'>Anyone can view your profile</p>
                                                </div>
                                            </label>
                                            <label className='flex items-center gap-3 cursor-pointer'>
                                                <input
                                                    type='radio'
                                                    name='privacy'
                                                    value='private'
                                                    checked={settings.profileVisibility === 'private'}
                                                    onChange={(e) => handlePrivacyChange(e.target.value)}
                                                    className='w-4 h-4 text-[#8B7355]'
                                                />
                                                <div>
                                                    <p className='text-sm font-medium text-slate-700'>Private</p>
                                                    <p className='text-xs text-slate-500'>Only you can view your profile</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Data & Account Section */}
                                <div>
                                    <h3 className='text-lg font-bold text-slate-900 mb-3'>Data & Account</h3>
                                    <div className='space-y-3'>
                                        <button
                                            onClick={handleDownloadData}
                                            className='w-full px-6 py-4 text-left text-slate-700 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between border border-slate-200'
                                        >
                                            <div className='flex items-center gap-3'>
                                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
                                                </svg>
                                                <span className='font-medium'>Download My Data</span>
                                            </div>
                                            <svg className='w-5 h-5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className='w-full px-6 py-4 text-left text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center justify-between border border-red-200'
                                        >
                                            <div className='flex items-center gap-3'>
                                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                                </svg>
                                                <span className='font-medium'>Delete Account</span>
                                            </div>
                                            <svg className='w-5 h-5 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Change Password Modal */}
                            {showPasswordModal && (
                                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                                    <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6'>
                                        <h3 className='text-2xl font-bold text-slate-900 mb-4'>Change Password</h3>
                                        <div className='space-y-4'>
                                            <div>
                                                <label className='block text-sm font-medium text-slate-700 mb-2'>Current Password</label>
                                                <input
                                                    type='password'
                                                    name='currentPassword'
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    className='w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B7355]'
                                                    placeholder='Enter current password'
                                                />
                                            </div>
                                            <div>
                                                <label className='block text-sm font-medium text-slate-700 mb-2'>New Password</label>
                                                <input
                                                    type='password'
                                                    name='newPassword'
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className='w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B7355]'
                                                    placeholder='Enter new password'
                                                />
                                            </div>
                                            <div>
                                                <label className='block text-sm font-medium text-slate-700 mb-2'>Confirm New Password</label>
                                                <input
                                                    type='password'
                                                    name='confirmPassword'
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    className='w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#8B7355]'
                                                    placeholder='Confirm new password'
                                                />
                                            </div>
                                        </div>
                                        <div className='flex gap-3 mt-6'>
                                            <button
                                                onClick={() => {
                                                    setShowPasswordModal(false);
                                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                                }}
                                                className='flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all'
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleChangePassword}
                                                className='flex-1 px-4 py-3 bg-[#8B7355] text-white font-semibold rounded-lg hover:bg-[#6B5444] transition-all'
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Delete Account Modal */}
                            {showDeleteModal && (
                                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                                    <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6'>
                                        <div className='text-center'>
                                            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                                <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                                                </svg>
                                            </div>
                                            <h3 className='text-2xl font-bold text-slate-900 mb-2'>Delete Account</h3>
                                            <p className='text-slate-600 mb-6'>Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.</p>
                                        </div>
                                        <div className='flex gap-3'>
                                            <button
                                                onClick={() => setShowDeleteModal(false)}
                                                className='flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all'
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                className='flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all'
                                            >
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
