import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import useStore from '../../Utils/Zustand/UseStore';
import { IoMdClose } from "react-icons/io";

const AIInfo: React.FC = () => {
    const [isExiting, setIsExiting] = useState(false);
    const { showInfo, setShowInfo }: any = useStore()

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setShowInfo(!showInfo);
            setIsExiting(false);
        }, 300);
    };


    return (
        <AnimatePresence>
            {
                !isExiting &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className='ml-auto positioners  flex items-center p-3 justify-center relative w-full h-full'
                    onClick={handleOutsideClick}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        className={`w-[550px] h-full bg-[#181818] pb-3 z-[5000] max-h-[630px] rounded-lg  overflow-auto border-[#535353] border-[1px]  flex flex-col justify-between`}
                        onClick={(e) => e.stopPropagation()}>

                        <div className='h-full w-full overflow-auto'>
                            <div className='font-bold flex gap-4 justify-between items-center text-lg border-b-[1px] border-b-[#535353] p-6'>
                                <div> Info</div>


                                <div
                                    onClick={handleOutsideClick}
                                    className='bg-[#111] p-2 rounded-lg border-[1px] border-[#535353] cursor-pointer hover:bg-[#191919]'>
                                    <IoMdClose />
                                </div>
                            </div>

                            <div className='p-6'>
                                <div className='text-[#888]'>
                                    <p className='font-bold mb-2'>Orgamix AI Free Tier Limitations:</p>
                                    <ul className='list-disc pl-5'>
                                        <li>Limited number of API requests per month (e.g., 1,000 calls).</li>
                                        <li>Rate limit capped at a few requests per second.</li>
                                        <li>Advanced features are not available in the free tier.</li>
                                        <li>Slower data refresh rates compared to paid tiers.</li>
                                        <li>No dedicated customer support for free-tier users.</li>
                                        <li>Restrictions on commercial use or data redistribution.</li>
                                    </ul>

                                </div>

                                <div className='text-[#888] mt-3'>
                                    <p className='font-bold mb-2'>Your communication with the AI is secured:</p>
                                    <ul className='list-disc pl-4'>
                                        <li>All data is encrypted during transmission using HTTPS.</li>
                                        <li>We prioritize your privacy and ensure no unauthorized access to your information.</li>
                                        <li>Compliance with industry security standards for data protection.</li>
                                        <li>Conversations are processed in isolated environments to maintain confidentiality.</li>
                                    </ul>
                                    <p>Feel confident knowing your interactions are private and secure.</p>
                                </div>

                                <div className='text-[#888] mt-3'>
                                    <p className='font-bold mb-2'>For more questions, kindly</p>
                                    <p>
                                        reach out to us at <a href='mailto:orgamixteam@gmail.com' className='text-blue-500 hover:underline'>orgamixteam@gmail.com</a>.
                                        We’d be happy to assist you!
                                    </p>

                                </div>
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default AIInfo
