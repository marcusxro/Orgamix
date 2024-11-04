import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnalyticsLoader: React.FC = () => {
    return (
        <AnimatePresence>
            <div className="w-full h-full flex gap-8 justify-between items-end">
                <motion.div
                    className="h-[50%] w-full bg-[#888] rounded-md"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5], scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    transition={{
                        scaleY: { duration: 0.3 }, // Adjust the speed of initial scale-up here
                        opacity: { repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0 },
                    }}
                    style={{ transformOrigin: 'bottom' }}
                ></motion.div>
                
                <motion.div
                    className="h-[85%] w-full bg-[#888] rounded-md"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5], scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    transition={{
                        scaleY: { duration: 0.3 }, // Adjust the speed of initial scale-up here
                        opacity: { repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.5 },
                    }}
                    style={{ transformOrigin: 'bottom' }}
                ></motion.div>
                
                <motion.div
                    className="h-[72%] w-full bg-[#888] rounded-md"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5], scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    transition={{
                        scaleY: { duration: 0.3 }, // Adjust the speed of initial scale-up here
                        opacity: { repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 1 },
                    }}
                    style={{ transformOrigin: 'bottom' }}
                ></motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AnalyticsLoader;
