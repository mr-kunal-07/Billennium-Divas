"use client";
import { motion } from 'motion/react';
import Header from './Header';
import { useRouter } from 'next/navigation';
import { ArrowRight, CircleCheckBig, Star, Users } from 'lucide-react';


const Welcome = () => {
    const router = useRouter()

    return (
        <div className="h-[800px] relative overflow-auto bg-center bg-repeat h- " style={{ backgroundImage: "url(https://www.openvc.app/images/hero_bg.png)" }}>
            <Header />

            {/* Main content */}
            <div className='relative mt-10 z-10 flex flex-col items-center justify-center text-center p-6 max-w-6xl mx-auto '>
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className='text-5xl md:text-7xl max-w-5xl mx-auto text-gray-900 font-semibold  leading-tight mb-6'
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
                            Join for Early Access
                            <ArrowRight className='w-5 h-5' />
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
                        <Star className='w-5 h-5 text-pink-600' />
                        <span className='font-medium'>4.9/5 Rating</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Users className='w-5 h-5 text-pink-600' />
                        <span className='font-medium'>10K+ Investors</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <CircleCheckBig className='w-5 h-5 text-pink-600' />
                        <span className='font-medium'>Verified Platform</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Welcome;