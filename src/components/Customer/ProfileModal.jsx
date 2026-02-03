import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config/api';
import LocationPicker from '../Shared/LocationPicker';

const ProfileModal = ({ isOpen, onClose, tailorData, onUpdate }) => {
    const [imagePreview, setImagePreview] = useState(null);
    const [imageChanged, setImageChanged] = useState(false);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [bannerChanged, setBannerChanged] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [profileForm, setProfileForm] = useState({
        name: '',
        shopName: '',
        phone: '',
        specialization: 'all',
        experience: '',
        bio: '',
        street: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [profileMessage, setProfileMessage] = useState('');
    const [saving, setSaving] = useState(false);
    const [shopLocation, setShopLocation] = useState({
        latitude: null,
        longitude: null,
        address: '',
        locationSet: false
    });
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    const [businessHours, setBusinessHours] = useState({
        Monday: { open: '09:00', close: '18:00', closed: false },
        Tuesday: { open: '09:00', close: '18:00', closed: false },
        Wednesday: { open: '09:00', close: '18:00', closed: false },
        Thursday: { open: '09:00', close: '18:00', closed: false },
        Friday: { open: '09:00', close: '18:00', closed: false },
        Saturday: { open: '09:00', close: '18:00', closed: false },
        Sunday: { open: '09:00', close: '18:00', closed: true }
    });

    // Initialize data when modal opens
    useEffect(() => {
        if (tailorData && isOpen) {
            setImagePreview(tailorData.shopImage || null);
            setImageChanged(false);
            setBannerPreview(tailorData.bannerImage || null);
            setBannerChanged(false);
            setProfileForm({
                name: tailorData.name || '',
                shopName: tailorData.shopName || '',
                phone: tailorData.phone || '',
                specialization: tailorData.specialization || 'all',
                experience: tailorData.experience || '',
                bio: tailorData.bio || '',
                street: tailorData.address?.street || '',
                city: tailorData.address?.city || '',
                state: tailorData.address?.state || '',
                pincode: tailorData.address?.pincode || ''
            });

            if (tailorData.location) {
                setShopLocation(tailorData.location);
            }

            if (tailorData.businessHours) {
                const hours = {};
                if (tailorData.businessHours instanceof Map) {
                    tailorData.businessHours.forEach((value, key) => {
                        hours[key] = value;
                    });
                } else {
                    Object.assign(hours, tailorData.businessHours);
                }
                setBusinessHours(hours);
            }
        }
    }, [tailorData, isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setUploadMessage('Please select an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setUploadMessage('Image size should be less than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setImageChanged(true);
            setUploadMessage('');
        };
        reader.readAsDataURL(file);
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setUploadMessage('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadMessage('Banner image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setBannerPreview(reader.result);
            setBannerChanged(true);
            setUploadMessage('');
        };
        reader.readAsDataURL(file);
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setProfileMessage('Geolocation is not supported by your browser.');
            return;
        }

        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setShopLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    address: 'Current Location', // We could reverse geocode here if we had an API
                    locationSet: true
                });
                setFetchingLocation(false);
                setProfileMessage('Location fetched successfully!');
                setTimeout(() => setProfileMessage(''), 2000);
            },
            (error) => {
                setFetchingLocation(false);
                setProfileMessage('Error fetching location: ' + error.message);
            }
        );
    };

    // Combined save function for both image and profile
    const handleSaveAll = async () => {
        setSaving(true);
        setProfileMessage('');
        setUploadMessage('');

        try {
            // First, upload shop image if changed
            if (imageChanged && imagePreview) {
                await axios.put(`${API_URL}/api/tailors/upload-image`, {
                    email: tailorData.email,
                    shopImage: imagePreview
                });
            }

            // Upload banner image if changed
            if (bannerChanged && bannerPreview) {
                await axios.put(`${API_URL}/api/tailors/upload-banner-image`, {
                    email: tailorData.email,
                    bannerImage: bannerPreview
                });
            }

            // Then, update profile
            const { data } = await axios.put(`${API_URL}/api/tailors/update-profile`, {
                email: tailorData.email,
                name: profileForm.name,
                shopName: profileForm.shopName,
                phone: profileForm.phone,
                specialization: profileForm.specialization,
                experience: profileForm.experience,
                bio: profileForm.bio,
                address: {
                    street: profileForm.street,
                    city: profileForm.city,
                    state: profileForm.state,
                    pincode: profileForm.pincode
                },
                location: shopLocation,
                businessHours: businessHours
            });

            const updatedUser = {
                ...tailorData,
                name: data.name,
                shopName: data.shopName,
                phone: data.phone,
                specialization: data.specialization,
                experience: data.experience,
                bio: data.bio,
                address: data.address,
                location: data.location,
                businessHours: data.businessHours,
                shopImage: imageChanged ? imagePreview : tailorData.shopImage,
                bannerImage: bannerChanged ? bannerPreview : tailorData.bannerImage
            };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            onUpdate(updatedUser);

            setProfileMessage('Profile updated successfully!');
            setImageChanged(false);
            setBannerChanged(false);
            setTimeout(() => {
                setProfileMessage('');
                onClose();
            }, 1500);
        } catch (error) {
            setProfileMessage('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    // Mobile-first full-screen layout
    return (
        <>
            {/* Mobile Layout - Full Screen */}
            <div className="lg:hidden fixed inset-0 bg-[#f5f5f0] z-50 flex flex-col overflow-hidden">
                {/* Sticky App Bar */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
                    <button
                        onClick={onClose}
                        className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-lg active:bg-slate-200 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">My Profile</h1>
                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="px-4 py-2 text-[#6b4423] font-bold rounded-lg hover:bg-amber-50 active:bg-amber-100 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pb-6">
                    {/* Success/Error Messages */}
                    {(profileMessage || uploadMessage) && (
                        <div className={`mx-4 mt-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${(profileMessage.includes('successfully') || uploadMessage.includes('successfully'))
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {(profileMessage.includes('successfully') || uploadMessage.includes('successfully')) ? (
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                            {profileMessage || uploadMessage}
                        </div>
                    )}

                    {/* Banner Image Section - Compact */}
                    <div className="bg-white mx-4 mt-4 p-6 rounded-2xl border border-gray-200">
                        <h3 className="text-base font-bold text-slate-800 mb-4">Cover Photo</h3>
                        <div className="flex flex-col items-center">
                            {/* Banner Preview */}
                            <div className="w-full aspect-[16/9] md:aspect-[3/1] rounded-xl overflow-hidden border-2 border-amber-100 bg-gradient-to-br from-slate-200 to-slate-300 mb-4">
                                {bannerPreview ? (
                                    <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            {/* Change Banner Button */}
                            <label className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm active:bg-slate-200 transition-colors cursor-pointer">
                                Change Cover Photo
                                <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                            </label>
                            <p className="text-xs text-slate-500 mt-2">JPG, PNG, WEBP (Max 5MB)</p>
                        </div>
                    </div>

                    {/* Shop Image Section - Compact */}
                    <div className="bg-white mx-4 mt-4 p-6 rounded-2xl border border-gray-200">
                        <h3 className="text-base font-bold text-slate-800 mb-4">Shop Photo</h3>
                        <div className="flex flex-col items-center">
                            {/* Square Image Preview */}
                            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-amber-100 bg-gradient-to-br from-violet-100 to-fuchsia-100 mb-4">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Shop Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m3-4h1m-1 4h1m-1 4h1m-1 4h1" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            {/* Change Photo Button */}
                            <label className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm active:bg-slate-200 transition-colors cursor-pointer">
                                Change Photo
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                            <p className="text-xs text-slate-500 mt-2">JPG, PNG, WEBP (Max 2MB)</p>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="bg-white mx-4 mt-4 p-6 rounded-2xl border border-gray-200">
                        <h3 className="text-base font-bold text-slate-800 mb-4">Shop Details</h3>
                        <div className="space-y-4">
                            {/* Shop Name */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Shop Name</label>
                                <input
                                    type="text"
                                    name="shopName"
                                    value={profileForm.shopName}
                                    onChange={handleProfileChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6b4423] focus:bg-white transition-all"
                                    placeholder="Enter shop name"
                                />
                            </div>

                            {/* Owner Name */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Owner Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profileForm.name}
                                    onChange={handleProfileChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6b4423] focus:bg-white transition-all"
                                    placeholder="Enter owner name"
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileForm.phone}
                                    onChange={handleProfileChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6b4423] focus:bg-white transition-all"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            {/* Specialization */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Specialization</label>
                                <select
                                    name="specialization"
                                    value={profileForm.specialization}
                                    onChange={handleProfileChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6b4423] focus:bg-white transition-all"
                                >
                                    <option value="all">All (Unisex)</option>
                                    <option value="men">Men's Wear</option>
                                    <option value="women">Women's Wear</option>
                                    <option value="kids">Kids' Wear</option>
                                </select>
                            </div>

                            {/* Experience */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Experience (in years)</label>
                                <input
                                    type="number"
                                    name="experience"
                                    value={profileForm.experience}
                                    onChange={handleProfileChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6b4423] focus:bg-white transition-all"
                                    placeholder="e.g. 5"
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">About Shop (Bio)</label>
                                <textarea
                                    name="bio"
                                    value={profileForm.bio}
                                    onChange={handleProfileChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6b4423] focus:bg-white transition-all min-h-[100px]"
                                    placeholder="Tell customers about your shop..."
                                />
                            </div>

                            {/* Address Section */}
                            <div className="pt-2">
                                <h4 className="text-sm font-bold text-slate-800 mb-3">Shop Address</h4>

                                {/* Street */}
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        name="street"
                                        value={profileForm.street}
                                        onChange={handleProfileChange}
                                        placeholder="Street Address"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6b4423] focus:bg-white transition-all"
                                    />
                                </div>

                                {/* City */}
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        name="city"
                                        value={profileForm.city}
                                        onChange={handleProfileChange}
                                        placeholder="City"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6b4423] focus:bg-white transition-all"
                                    />
                                </div>

                                {/* State and Pincode */}
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        name="state"
                                        value={profileForm.state}
                                        onChange={handleProfileChange}
                                        placeholder="State"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6b4423] focus:bg-white transition-all"
                                    />
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={profileForm.pincode}
                                        onChange={handleProfileChange}
                                        placeholder="Pincode"
                                        maxLength="6"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#6b4423] focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            {/* Location Selection */}
                            <div className="pt-4 border-t border-gray-100 mt-4">
                                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    Shop Location (Required)
                                    {shopLocation.locationSet ? (
                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">Set</span>
                                    ) : (
                                        <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">Not Set</span>
                                    )}
                                </h4>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <p className="text-xs text-slate-500 mb-3">
                                        Pin your exact shop location so customers can find you on the map.
                                    </p>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => setShowLocationPicker(true)}
                                            className="w-full py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {shopLocation.locationSet ? 'Change Pinned Location' : 'Pin on Map'}
                                        </button>

                                        {shopLocation.locationSet && (
                                            <div className="text-xs text-slate-500 bg-white border border-slate-200 rounded-lg p-3">
                                                <div className="flex justify-between">
                                                    <span>Latitude: {shopLocation.latitude?.toFixed(6)}</span>
                                                    <span>Longitude: {shopLocation.longitude?.toFixed(6)}</span>
                                                </div>
                                                <div className="mt-2 text-green-600 font-medium flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    Location Pinned Successfully
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Layout - Modal (Unchanged or minimally updated if needed) */}
            <div className="hidden lg:block">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-dashed border-gray-300 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 bg-[#f5f5f0] backdrop-blur-xl border-b-2 border-dashed border-gray-300 p-6 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
                                <p className="text-slate-500 text-sm">Manage your shop image and profile information</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl flex items-center justify-center transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Banner Image */}
                            <div className="bg-amber-50 border-2 border-dashed border-gray-300 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">Cover Photo</h3>
                                <div className="flex flex-col gap-6">
                                    <div className="w-full aspect-video rounded-2xl overflow-hidden border-2 border-white/50 bg-linear-to-br from-slate-200 to-slate-300">
                                        {bannerPreview ? (
                                            <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Upload Cover Photo</label>
                                        <div className="mb-4">
                                            <label className="flex items-center justify-center w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-[#6b4423] hover:bg-amber-50 transition-all cursor-pointer">
                                                <div className="flex items-center gap-2 text-[#6b4423]">
                                                    <span className="font-medium">Choose Cover Photo</span>
                                                </div>
                                                <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                                            </label>
                                            <p className="text-xs text-slate-500 mt-2">JPG, PNG, WEBP (Max 5MB)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shop Image */}
                            <div className="bg-amber-50 border-2 border-dashed border-gray-300 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">Shop Image</h3>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="shrink-0">
                                        <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-white/50 bg-linear-to-br from-violet-100 to-fuchsia-100">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Shop Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m3-4h1m-1 4h1m-1 4h1m-1 4h1" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Upload Shop Image</label>
                                        <div className="mb-4">
                                            <label className="flex items-center justify-center w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-[#6b4423] hover:bg-amber-50 transition-all cursor-pointer">
                                                <div className="flex items-center gap-2 text-[#6b4423]">
                                                    <span className="font-medium">Choose Image</span>
                                                </div>
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                            </label>
                                            <p className="text-xs text-slate-500 mt-2">JPG, PNG, WEBP (Max 2MB)</p>
                                        </div>

                                        {uploadMessage && (
                                            <div className={`mt-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${uploadMessage.includes('successfully') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {uploadMessage.includes('successfully') ? (
                                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                                {uploadMessage}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Shop Profile */}
                            <div className="bg-amber-50 border-2 border-dashed border-gray-300 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">Shop Profile</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Shop Name</label>
                                        <input
                                            type="text"
                                            name="shopName"
                                            value={profileForm.shopName}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Owner Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileForm.name}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileForm.phone}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Specialization</label>
                                        <select
                                            name="specialization"
                                            value={profileForm.specialization}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="all">All (Unisex)</option>
                                            <option value="men">Men's Wear</option>
                                            <option value="women">Women's Wear</option>
                                            <option value="kids">Kids' Wear</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Experience (in years)</label>
                                        <input
                                            type="number"
                                            name="experience"
                                            value={profileForm.experience}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="e.g. 5"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">About Shop (Bio)</label>
                                        <textarea
                                            name="bio"
                                            value={profileForm.bio}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                                            placeholder="Tell customers about your shop..."
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="mt-6">
                                    <h4 className="text-lg font-bold text-slate-800 mb-4">Shop Address</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <input
                                            type="text"
                                            name="street"
                                            value={profileForm.street}
                                            onChange={handleProfileChange}
                                            placeholder="Street Address"
                                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                        <div className="grid grid-cols-3 gap-4">
                                            <input
                                                type="text"
                                                name="city"
                                                value={profileForm.city}
                                                onChange={handleProfileChange}
                                                placeholder="City"
                                                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                            <input
                                                type="text"
                                                name="state"
                                                value={profileForm.state}
                                                onChange={handleProfileChange}
                                                placeholder="State"
                                                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={profileForm.pincode}
                                                onChange={handleProfileChange}
                                                placeholder="Pincode"
                                                maxLength="6"
                                                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Location Selection Desktop */}
                                <div className="mt-6 border-t border-gray-200 pt-6">
                                    <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-3">
                                        Shop Location
                                        {shopLocation.locationSet ? (
                                            <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-bold">Location Set</span>
                                        ) : (
                                            <span className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded-full font-bold">Required</span>
                                        )}
                                    </h4>

                                    <div className="bg-white/60 border border-white/40 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-slate-600">
                                                Update your exact coordinate location for customers.
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <button
                                                onClick={() => setShowLocationPicker(true)}
                                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-slate-700 font-medium text-sm flex items-center gap-2 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                                            >
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {shopLocation.locationSet ? 'Change Pinned Location' : 'Pin on Map'}
                                            </button>

                                            {shopLocation.locationSet && (
                                                <div className="flex flex-col text-xs text-slate-500">
                                                    <span className="font-mono">Lat: {shopLocation.latitude?.toFixed(6)}</span>
                                                    <span className="font-mono">Lng: {shopLocation.longitude?.toFixed(6)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>



                                {profileMessage && (
                                    <div className={`mt-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${profileMessage.includes('successfully') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {profileMessage.includes('successfully') ? (
                                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                        {profileMessage}
                                    </div>
                                )}

                                <button
                                    onClick={handleSaveAll}
                                    disabled={saving}
                                    className="mt-6 px-6 py-3 bg-[#6b4423] text-white rounded-xl font-medium hover:bg-[#573619] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showLocationPicker && (
                <LocationPicker
                    initialLocation={shopLocation}
                    onLocationSelect={(newLocation) => {
                        setShopLocation(prev => ({
                            ...prev,
                            latitude: newLocation.latitude,
                            longitude: newLocation.longitude,
                            locationSet: true
                        }));
                        setProfileMessage('Location flagged on map!');
                        setTimeout(() => setProfileMessage(''), 2000);
                    }}
                    onClose={() => setShowLocationPicker(false)}
                />
            )}
        </>
    );
};

export default ProfileModal;
