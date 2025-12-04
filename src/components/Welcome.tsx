"use client";
import { motion } from 'motion/react';
import Header from '../../Header';
import { useRouter } from 'next/navigation';


const Welcome = () => {
    const router = useRouter()

    return (
        <div className='relative  min-h-screen overflow-hidden '>
            <Header />

            {/* Main content */}
            <div className='relative z-10 flex flex-col items-center justify-center text-center p-6 max-w-6xl mx-auto select-none'>
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className='text-5xl md:text-7xl max-w-5xl mx-auto text-gray-900 font-bold leading-tight mb-6'
                >
                    Raise funds for your{' '}
                    <span className='text-transparent bg-clip-text bg-linear-to-r from-pink-600 to-pink-900'>
                        startup
                    </span>
                    {' '}from{' '}
                    <span className='text-transparent bg-clip-text bg-linear-to-r from-pink-600 to-pink-900'>
                        10,000+
                    </span>
                    {' '}investors
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className='text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-10'
                >
                    Connect with a thriving community of investors ready to fuel your vision. Start your funding journey today.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className='flex flex-col sm:flex-row gap-4 items-center justify-center'
                >
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(136, 19, 55, 0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        className='bg-linear-to-r from-pink-600 to-pink-900 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300'
                        aria-label='Create new account'
                        onClick={() => router.push('/register')}

                    >
                        <span className='flex items-center gap-2'>
                            Join For Free
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                            </svg>
                        </span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className='bg-white text-pink-900 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-pink-200 hover:border-pink-400 transition-all duration-300'
                    >
                        Learn More
                    </motion.button>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className='mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-600'
                >
                    <div className='flex items-center gap-2'>
                        <svg className='w-5 h-5 text-pink-600' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                        </svg>
                        <span className='font-medium'>4.9/5 Rating</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <svg className='w-5 h-5 text-pink-600' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
                        </svg>
                        <span className='font-medium'>10K+ Investors</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <svg className='w-5 h-5 text-pink-600' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                        </svg>
                        <span className='font-medium'>Verified Platform</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Welcome;