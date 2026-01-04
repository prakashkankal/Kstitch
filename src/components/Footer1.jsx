import React from 'react'

const Footer1 = () => {
  return (
    <footer className='w-full bg-indigo-950 text-slate-300 py-16 rounded-t-[3rem] mt-10 border-t border-white/10 relative overflow-hidden'>
      <div className='absolute inset-0 bg-linear-to-b from-indigo-900/20 to-transparent pointer-events-none'></div>
      <div className='max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12'>

        {/* Brand Section */}
        <div className='flex flex-col gap-4'>
          <h4 className="text-3xl font-bold tracking-tight text-amber-500 font-serif">StyleEase</h4>
          <p className='text-sm leading-relaxed text-slate-400'>
            Connecting you with the finest tailors and bespoke fashion designers. Elevate your wardrobe with custom-fit perfection.
          </p>
          <div className='flex gap-4 mt-2'>
            {/* Social Icons Placeholder */}
            <div className='w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-all cursor-pointer'>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
            </div>
            <div className='w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-all cursor-pointer'>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h5 className='text-lg font-semibold text-white mb-4'>Quick Links</h5>
          <ul className='flex flex-col gap-3 text-sm'>
            <li><a href="#" className='hover:text-amber-400 transition-colors'>Home</a></li>
            <li><a href="#" className='hover:text-amber-400 transition-colors'>Collections</a></li>
            <li><a href="#" className='hover:text-amber-400 transition-colors'>Find a Tailor</a></li>
            <li><a href="#" className='hover:text-amber-400 transition-colors'>About Us</a></li>
          </ul>
        </div>

        {/* For Tailors */}
        <div>
          <h5 className='text-lg font-semibold text-white mb-4'>For Tailors</h5>
          <ul className='flex flex-col gap-3 text-sm'>
            <li><a href="#" className='hover:text-amber-400 transition-colors'>Join as a Partner</a></li>
            <li><a href="#" className='hover:text-amber-400 transition-colors'>Partner Dashboard</a></li>
            <li><a href="#" className='hover:text-amber-400 transition-colors'>Success Stories</a></li>
            <li><a href="#" className='hover:text-amber-400 transition-colors'>Support</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h5 className='text-lg font-semibold text-white mb-4'>Stay Updated</h5>
          <p className='text-xs text-slate-500 mb-4'>Subscribe to our newsletter for the latest trends and specific offers.</p>
          <div className='flex flex-col gap-3'>
            <input
              type="email"
              placeholder="Your email address"
              className='w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors'
            />
            <button className='w-full px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition-all shadow-lg shadow-amber-500/10 cursor-pointer'>
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500'>
        <p>&copy; {new Date().getFullYear()} StyleEase. All rights reserved.</p>
        <div className='flex gap-6'>
          <a href="#" className='hover:text-slate-300'>Privacy Policy</a>
          <a href="#" className='hover:text-slate-300'>Terms of Service</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer1