import React, { useState, useEffect } from 'react'
import Card from './Card'
import axios from 'axios'

const Cards = () => {
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTailors = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/tailors');
        setTailors(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load tailors. Please try again later.');
        setLoading(false);
      }
    };

    fetchTailors();
  }, []);

  if (loading) {
    return (
      <div className='w-[95%] h-auto bg-transparent mt-5 rounded-2xl py-10 flex justify-center items-center'>
        <div className='text-slate-600 text-lg'>Loading tailors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-[95%] h-auto bg-transparent mt-5 rounded-2xl py-10 flex justify-center items-center'>
        <div className='text-red-600 text-lg'>{error}</div>
      </div>
    );
  }

  if (tailors.length === 0) {
    return (
      <div className='w-[95%] h-auto bg-transparent mt-5 rounded-2xl py-10 flex flex-col items-center gap-4'>
        <div className='text-slate-600 text-lg font-medium'>No tailors registered yet</div>
        <p className='text-slate-500 text-sm'>Be the first to register your tailor shop!</p>
      </div>
    );
  }

  return (
    <div className='w-[95%] h-auto bg-transparent mt-5 rounded-2xl py-10'>
      <div className='mb-8 text-center'>
        <h3 className='text-3xl font-serif font-bold text-slate-900 mb-2'>
          Featured <span className='text-violet-600'>Tailors</span>
        </h3>
        <p className='text-slate-600'>Discover skilled professionals near you</p>
      </div>

      <div className='flex flex-wrap gap-6 justify-center'>
        {tailors.map((tailor) => (
          <Card key={tailor._id} tailor={tailor} />
        ))}
      </div>
    </div>
  )
}

export default Cards
