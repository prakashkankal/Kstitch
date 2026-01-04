import React from 'react'

const HeroPage = () => {
  return (
    <div className='w-[95%] min-h-[200px] mt-4 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-xl shadow-indigo-500/5 relative group'>
      {/* Left Content */}
      <div className='w-full md:w-1/2 p-6 flex flex-col justify-center relative z-10'>
        <div className='w-12 h-1 bg-violet-500 mb-4 rounded-full'></div>
        <h1 className='text-3xl lg:text-4xl font-serif font-bold text-slate-900 mb-3 leading-tight'>
          The Art of <br />
          <span className='text-violet-600'>Perfect Fit</span>.
        </h1>
        <p className='text-slate-600 text-base mb-6 max-w-md leading-relaxed'>
          Connect with expert tailors for bespoke suits, intricate alterations, and custom ethnic wear.
        </p>

        <div className='flex gap-4'>
          <button className='px-6 py-2.5 bg-violet-600 text-white font-bold rounded-full hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/30 transform hover:-translate-y-1 cursor-pointer'>
            Find a Tailor
          </button>
        </div>
      </div>

      {/* Right Image */}
      <div className='w-full md:w-1/2 relative min-h-[250px] md:min-h-full'>
        <img
          className='w-full h-full object-cover'
          src="https://media.istockphoto.com/id/530422180/photo/focus-teilor-working-very-hard.webp?a=1&b=1&s=612x612&w=0&k=20&c=8Nn5XIQ7sFhVyHFxK9w8JS2fl_kI8dEjcPJSgSn8u54="
          alt="Tailor measuring suit"
        />
        <div className='absolute inset-0 bg-linear-to-b from-white/20 to-transparent md:bg-linear-to-r md:from-white/20 md:to-transparent'></div>
      </div>
    </div>
  )
}

export default HeroPage