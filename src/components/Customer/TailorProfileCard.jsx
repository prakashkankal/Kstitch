import React from 'react';
import { useNavigate } from 'react-router-dom';

const TailorProfileCard = ({ tailor }) => {
    const navigate = useNavigate();

    // Generate initials from shop name
    const getInitials = (name) => {
        if (!name) return 'TL';
        const words = name.split(' ');
        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Format specialization for display
    const formatSpecialization = (spec) => {
        if (!spec) return 'All';
        return spec.charAt(0).toUpperCase() + spec.slice(1);
    };

    // Render rating stars
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <svg key={i} className="w-4 h-4 fill-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <svg key={i} className="w-4 h-4 fill-amber-400" viewBox="0 0 20 20">
                        <defs>
                            <linearGradient id={`half-${tailor._id}`}>
                                <stop offset="50%" stopColor="rgb(251, 191, 36)" />
                                <stop offset="50%" stopColor="rgb(226, 232, 240)" />
                            </linearGradient>
                        </defs>
                        <path fill={`url(#half-${tailor._id})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            } else {
                stars.push(
                    <svg key={i} className="w-4 h-4 fill-slate-300" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            }
        }
        return stars;
    };

    return (
        <div
            onClick={() => navigate(`/tailor/${tailor._id}`)}
            className="group bg-white/50 backdrop-blur-md rounded-2xl overflow-hidden border border-white/60 shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
        >
            {/* Shop Image */}
            <div className="relative h-48 bg-linear-to-br from-orange-100 to-amber-100 overflow-hidden">
                {tailor.shopImage ? (
                    <img
                        src={tailor.shopImage}
                        alt={tailor.shopName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                            {getInitials(tailor.shopName)}
                        </div>
                    </div>
                )}
                {/* Specialization Badge */}
                <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-orange-600 border border-orange-200">
                        {formatSpecialization(tailor.specialization)}
                    </span>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-5">
                {/* Shop Name */}
                <h3 className="text-xl font-bold text-slate-900 mb-1 truncate group-hover:text-orange-600 transition-colors">
                    {tailor.shopName}
                </h3>

                {/* Tailor Name */}
                <p className="text-sm text-slate-600 mb-3 truncate">by {tailor.name}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-0.5">{renderStars(tailor.rating || 0)}</div>
                    <span className="text-sm text-slate-600">
                        {tailor.rating ? tailor.rating.toFixed(1) : '0.0'}
                    </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">
                        {tailor.address?.city}, {tailor.address?.state}
                    </span>
                </div>

                {/* Experience */}
                {tailor.experience && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                            {tailor.experience} {tailor.experience === 1 ? 'year' : 'years'} experience
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TailorProfileCard;
