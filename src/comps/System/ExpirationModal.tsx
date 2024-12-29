import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';

const ExpirationModal: React.FC = () => {

    const [isExiting, setIsExiting] = useState(false);


    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsExiting(false);
        }, 300);
    };
    return (
        <AnimatePresence>
            {
                !isExiting && (
                    <motion.div
                        className="maxedIndex w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center p-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleOutsideClick}
                    >
                        <motion.div
                            className="bg-[#333] border-[1px] border-[#535353] p-8 rounded-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div>
                                <h2 className="text-xl font-bold">Your subscription is about to expire</h2>
                                <p className="text-sm text-[#888] mb-[2rem] mt-2">Your subscription will expire tomorrow. Please renew your subscription.</p>
                            </div>
                            <div className='flex w-full gap-4'>
                            <button className="bg-red-600 w-full text-white px-4 py-2 rounded-lg" onClick={handleOutsideClick}>Close</button>
                            <button className="bg-green-600 w-full text-white px-4 py-2 rounded-lg" onClick={handleOutsideClick}>Renew</button>

                            </div>
                        </motion.div>
                    </motion.div>
                )
            }
        </AnimatePresence>
    )

}

export default ExpirationModal
