import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfileModal = ({ isOpen, onClose, tailorData, onUpdate }) => {
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [profileForm, setProfileForm] = useState({
        name: '',
        shopName: '',
        phone: '',
        specialization: 'all',
        street: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [profileMessage, setProfileMessage] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
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
            setProfileForm({
                name: tailorData.name || '',
                shopName: tailorData.shopName || '',
                phone: tailorData.phone || '',
                specialization: tailorData.specialization || 'all',
                street: tailorData.address?.street || '',
                city: tailorData.address?.city || '',
                state: tailorData.address?.state || '',
                pincode: tailorData.address?.pincode || ''
            });

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
            setUploadMessage('');
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = async () => {
        if (!imagePreview) {
            setUploadMessage('Please select an image first');
            return;
        }

        setUploading(true);
        setUploadMessage('');

        try {
            const { data } = await axios.put('http://localhost:5000/api/tailors/upload-image', {
                email: tailorData.email,
                shopImage: imagePreview
            });

            const updatedUser = {
                ...tailorData,
                shopImage: data.shopImage
            };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            onUpdate(updatedUser);

            setUploadMessage('✅ Shop image updated successfully!');
            setTimeout(() => setUploadMessage(''), 3000);
        } catch (error) {
            setUploadMessage('❌ Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setUploadMessage('');
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setProfileMessage('');

        try {
            const { data } = await axios.put('http://localhost:5000/api/tailors/update-profile', {
                email: tailorData.email,
                name: profileForm.name,
                shopName: profileForm.shopName,
                phone: profileForm.phone,
                specialization: profileForm.specialization,
                address: {
                    street: profileForm.street,
                    city: profileForm.city,
                    state: profileForm.state,
                    pincode: profileForm.pincode
                },
                businessHours: businessHours
            });

            const updatedUser = {
                ...tailorData,
                name: data.name,
                shopName: data.shopName,
                phone: data.phone,
                specialization: data.specialization,
                address: data.address,
                businessHours: data.businessHours,
                shopImage: tailorData.shopImage
            };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            onUpdate(updatedUser);

            setProfileMessage('✅ Profile updated successfully!');
            setTimeout(() => setProfileMessage(''), 3000);
        } catch (error) {
            setProfileMessage('❌ Failed to update profile. Please try again.');
        } finally {
            setSavingProfile(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-white/60 p-6 flex justify-between items-center z-10">
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
                    {/* Shop Image */}
                    <div className="bg-white/60 rounded-2xl border border-white/50 p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Shop Image</h3>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="shrink-0">
                                <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-white/50 bg-linear-to-br from-violet-100 to-fuchsia-100">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Shop Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl">🏪</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1">
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Upload Shop Image</label>
                                <div className="mb-4">
                                    <label className="flex items-center justify-center w-full px-4 py-3 bg-white/60 border-2 border-dashed border-violet-300 rounded-xl hover:border-violet-500 hover:bg-violet-50 transition-all cursor-pointer">
                                        <div className="flex items-center gap-2 text-violet-600">
                                            <span className="font-medium">Choose Image</span>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                    <p className="text-xs text-slate-500 mt-2">JPG, PNG, WEBP (Max 2MB)</p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleImageUpload}
                                        disabled={uploading || !imagePreview}
                                        className="flex-1 px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? 'Uploading...' : 'Save Image'}
                                    </button>
                                    {imagePreview && (
                                        <button
                                            onClick={handleRemoveImage}
                                            disabled={uploading}
                                            className="px-6 py-3 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-all"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                {uploadMessage && (
                                    <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${uploadMessage.includes('✅') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {uploadMessage}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Shop Profile */}
                    <div className="bg-white/60 rounded-2xl border border-white/50 p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Shop Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Shop Name</label>
                                <input
                                    type="text"
                                    name="shopName"
                                    value={profileForm.shopName}
                                    onChange={handleProfileChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Owner Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profileForm.name}
                                    onChange={handleProfileChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileForm.phone}
                                    onChange={handleProfileChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Specialization</label>
                                <select
                                    name="specialization"
                                    value={profileForm.specialization}
                                    onChange={handleProfileChange}
                                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                >
                                    <option value="all">All (Unisex)</option>
                                    <option value="men">Men's Wear</option>
                                    <option value="women">Women's Wear</option>
                                    <option value="kids">Kids' Wear</option>
                                </select>
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
                                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                />
                                <div className="grid grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        name="city"
                                        value={profileForm.city}
                                        onChange={handleProfileChange}
                                        placeholder="City"
                                        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                    <input
                                        type="text"
                                        name="state"
                                        value={profileForm.state}
                                        onChange={handleProfileChange}
                                        placeholder="State"
                                        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={profileForm.pincode}
                                        onChange={handleProfileChange}
                                        placeholder="Pincode"
                                        maxLength="6"
                                        className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {profileMessage && (
                            <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${profileMessage.includes('✅') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {profileMessage}
                            </div>
                        )}

                        <button
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            className="mt-6 px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
