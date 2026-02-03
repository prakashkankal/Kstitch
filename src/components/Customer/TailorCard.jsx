import React from 'react';
import { Link } from 'react-router-dom';
import TailorImage from './TailorImage';
import TailorMeta from './TailorMeta';

const TailorCard = ({ tailor }) => {
    if (!tailor) return null;

    return (
        <Link
            to={`/tailor/${tailor._id}`}
            className="group flex flex-col h-full w-full cursor-pointer rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
        >
            <div className="w-full">
                <TailorImage
                    image={tailor.shopImage}
                    name={tailor.name}
                    availability={tailor.availability}
                    rating={tailor.rating}
                    reviewCount={tailor.reviews?.length || 0}
                />
            </div>
            <div className="flex-1">
                <TailorMeta
                    shopName={tailor.shopName || tailor.name}
                    specialization={tailor.specialization || 'General Tailor'}
                    location={`${tailor.address?.city || 'Location'}, ${tailor.address?.state || ''}`}
                    rating={tailor.rating}
                    reviewCount={tailor.reviews?.length || 0} // Assuming 'reviews' is an array on the tailor object
                />
            </div>
        </Link>
    );
};

export default TailorCard;
