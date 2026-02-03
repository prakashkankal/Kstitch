import React, { useState } from 'react';

const TailorImage = ({ image, alt, name, availability, rating, reviewCount }) => {
    const [imgError, setImgError] = useState(false);

    // Generate initials from name
    const getInitials = (name) => {
        return name
            ? name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : 'TL';
    };

    return (
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-t-xl bg-gray-100">
            {!imgError && image ? (
                <img
                    src={image}
                    alt={alt || name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                    <span className="text-2xl font-bold text-gray-400">
                        {getInitials(name)}
                    </span>
                </div>
            )}

            {/* Rating Badge - Top Right */}
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 shadow-sm backdrop-blur-sm">
                {!reviewCount || reviewCount === 0 ? (
                    <span className="text-xs font-bold text-gray-900">New</span>
                ) : (
                    <>
                        <svg className="h-3 w-3 fill-current text-gray-900" viewBox="0 0 32 32" aria-hidden="true">
                            <path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.54 1.74l7.32 6.87-1.992 9.492a1 1 0 0 0 1.48 1.05l8.625-4.852 8.626 4.853a1 1 0 0 0 1.48-1.05l-1.993-9.493 7.32-6.87a1 1 0 0 0-.54-1.74l-9.86-1.27-4.125-8.885a1 1 0 0 0-1.798 0z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-900">
                            {rating}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};

export default TailorImage;
