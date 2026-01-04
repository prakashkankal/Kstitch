import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import HeroPage from '../components/HeroPage'
import Cards from '../components/Cards'
import SubHero from '../components/SubHero'
import Footer1 from '../components/Footer1'


const Homepage = () => {


  return (
    <div className='w-full min-h-screen flex flex-col items-center gap-5 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 relative selection:bg-violet-500/30 text-slate-900'>
      <Navbar />
      <HeroPage />
      <Cards />
      <SubHero />
      <Footer1 />

    </div>
  )
}

export default Homepage