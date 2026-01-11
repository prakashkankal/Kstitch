import React, { useState } from 'react';

const SearchBar = ({ onSearch, compact = false }) => {
    const [service, setService] = useState('');
    const [location, setLocation] = useState('');

    const handleSearch = () => {
        if (onSearch) {
            onSearch({ service, location });
        }
    };

    return (
        <div
            className={`bg-white backdrop-blur-md rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.12)] ${compact ? 'p-1' : 'p-1.5'} flex items-center gap-0 transition-all duration-300 border border-gray-200`}
        >
            {/* Service Field */}
            <div className={`flex-1 ${compact ? 'px-4 py-2' : 'px-5 py-3'} border-r border-gray-200 hover:bg-gray-50 rounded-l-full transition-colors cursor-pointer`}>
                <label className='text-xs font-semibold text-gray-800 block mb-0.5'>Service</label>
                <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className='w-full text-sm bg-transparent border-none outline-none text-gray-600 cursor-pointer font-medium'
                >
                    <option value=''>Select service</option>
                    <option value='men-tailoring'>Men Tailoring</option>
                    <option value='women-tailoring'>Women Tailoring</option>
                    <option value='alterations'>Alterations</option>
                    <option value='custom-stitching'>Custom Stitching</option>
                    <option value='repairs'>Repairs</option>
                </select>
            </div>

            {/* Location Field */}
            <div className={`flex-1 ${compact ? 'px-4 py-2' : 'px-5 py-3'} hover:bg-gray-50 transition-colors`}>
                <label className='text-xs font-semibold text-gray-800 block mb-0.5'>Location</label>
                <input
                    type='text'
                    placeholder='Enter location'
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className='w-full text-sm bg-transparent border-none outline-none placeholder-gray-400 text-gray-600 font-medium focus:placeholder-gray-500'
                />
            </div>

            {/* Circular Search Button */}
            <button
                onClick={handleSearch}
                className={`${compact ? 'w-10 h-10 ml-1' : 'w-12 h-12 ml-2'} bg-gradient-to-r from-[#8B7355] to-[#6B5444] text-white rounded-full hover:from-[#6B5444] hover:to-[#5A4535] hover:scale-105 active:scale-95 transition-all duration-200 shadow-md flex items-center justify-center flex-shrink-0`}
                aria-label="Search"
            >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
            </button>
        </div>
    );
};

export default SearchBar;