import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../../Zustand/UseStore';
import { IoMdClose } from "react-icons/io";
import { IoCopyOutline } from "react-icons/io5";
import { Tooltip as ReactTooltip } from 'react-tooltip'


const AIShareModal: React.FC = () => {
    const [isExiting, setIsExiting] = useState(false);
    const { setShowShare }: any = useStore()

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setShowShare(null);
            setIsExiting(false);
        }, 300);
    };
    const [msgId, setMsgId] = useState<string>('')

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
                        className={`w-[550px] h-auto bg-[#181818] pb-3 z-[5000]  rounded-lg  overflow-auto border-[#535353] border-[1px]  flex flex-col justify-between`}
                        onClick={(e) => e.stopPropagation()}>

                        <div className='h-full w-full overflow-auto'>
                            <div className='font-bold flex gap-4 justify-between items-center text-lg border-b-[1px] border-b-[#535353] p-6'>
                                <div> Share your chat!</div>


                                <div
                                    onClick={handleOutsideClick}
                                    className='bg-[#111] p-2 rounded-lg border-[1px] border-[#535353] cursor-pointer hover:bg-[#191919]'>
                                    <IoMdClose />
                                </div>
                            </div>



                            <div className='p-6'>
                                <div className='text-[#888]'>
                                    Share this link with your friends to let them view the chat!
                                </div>

                                <div className='mt-5 bg-[#888] text-[#111] p-3 rounded-[2rem] relative overflow-hidden flex items-center'>
                                    {window.location.href}

                                    <div
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            setMsgId(window.location.href)
                                        }}
                                        data-tooltip-id={`copy}`}
                                        className='absolute top-[50%] right-[2rem] rounded-[2rem] text-white bg-[#111] p-3 translate-x-[50%] translate-y-[-50%]'>
                                        <IoCopyOutline />
                                        <ReactTooltip
                                            id={`copy}`}
                                            place="bottom"
                                            variant="dark"
                                            className='rounded-lg border-[#535353] border-[1px] text-sm z-40'
                                            content={`${msgId === window.location.href ? "Copied!" : "Copy"}`}
                                        />

                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </motion.div>

            }
        </AnimatePresence>
    )
}

export default AIShareModal
