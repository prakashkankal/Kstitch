import React from 'react'

const Card = ({ tailor }) => {
  // Map specialization to readable format
  const specializationMap = {
    men: "Men's Wear",
    women: "Women's Wear",
    kids: "Kids' Wear",
    all: "All (Unisex)"
  };

  // Get city and state from address
  const location = `${tailor.address.city}, ${tailor.address.state}`;

  return (
    <div className='w-72 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg shadow-indigo-500/5 hover:shadow-xl hover:shadow-indigo-500/10 hover:bg-white/90 transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col'>
      {/* Image Section */}
      <div className='w-full h-48 overflow-hidden relative bg-linear-to-br from-violet-100 to-fuchsia-100'>
        {tailor.shopImage ? (
          <img
            src={tailor.shopImage}
            alt={tailor.shopName}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
            onError={(e) => {
              // If image fails to load, hide it and show fallback
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className='w-full h-full flex items-center justify-center'
          style={{ display: tailor.shopImage ? 'none' : 'flex' }}
        >
          <div className='text-6xl font-serif font-bold text-violet-300'>
            {tailor.shopName.charAt(0)}
          </div>
        </div>
        <div className='absolute top-3 left-3 bg-white/95 backdrop-blur-md shadow-sm px-2 py-1 rounded-md text-xs font-semibold text-violet-900 uppercase tracking-wider'>
          {specializationMap[tailor.specialization] || tailor.specialization}
        </div>
      </div>

      {/* Content Section */}
      <div className='p-5 flex flex-col gap-2'>
        <div className='flex justify-between items-start'>
          <h4 className='text-lg font-serif font-bold text-slate-800 leading-tight group-hover:text-violet-600 transition-colors'>
            {tailor.shopName}
          </h4>
          <div className='flex items-center gap-1 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded text-violet-600 text-xs font-bold'>
            <span>{tailor.experience}y</span>
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          </div>
        </div>

        <p className='text-sm text-slate-600 font-medium'>{tailor.name}</p>

        <p className='text-sm text-slate-500 flex items-center gap-1.5'>
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          {location}
        </p>

        <div className='mt-2 flex items-center justify-between pt-3 border-t border-slate-100'>
          <span className='text-xs font-medium text-slate-500'>Starting from</span>
          <span className='text-lg font-bold text-slate-900'>₹999</span>
        </div>
      </div>
    </div>
  )
}

export default Card
