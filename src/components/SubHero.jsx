import React from 'react'

const SubHero = () => {
  return (
    <div className='w-[95%] h-[500px] mt-10 rounded-3xl relative overflow-hidden group shadow-2xl border border-white/20'>
      <img
        className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
        alt="Fashion Collection"
      />
      <div className='absolute inset-0 bg-linear-to-r from-violet-900/90 via-violet-900/40 to-transparent flex flex-col justify-center px-16'>
        <h2 className='text-5xl font-serif font-bold text-white mb-4 leading-tight'>
          Redefine Your <span className='text-fuchsia-400'>Style</span>
        </h2>
        <p className='text-indigo-100 text-lg mb-8 max-w-xl'>
          Explore our curated collection of premium fashion designed to elevate your everyday look with elegance and comfort.
        </p>
        <button className='w-fit px-8 py-3 bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-fuchsia-500/30 transform hover:-translate-y-1 cursor-pointer'>
          Shop the Collection
        </button>
      </div>
    </div>
  )
}

export default SubHero