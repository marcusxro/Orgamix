import React from 'react'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import useStore from '../../../Zustand/UseStore'


const CongratsModal: React.FC = () => {
    const { setProgress }: any = useStore()
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="ml-auto positioners flex items-center p-3 justify-center w-full h-full"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                className="w-[550px] h-full max-h-[200px] bg-[#313131] z-[5000] p-3 rounded-lg overflow-auto border-[#535353] border-[1px] flex flex-col justify-between"
            >
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    numberOfPieces={100}
                />
                <div className='flex gap-2 flex-col h-full items-center justify-center text-center'>
                    <div className='text-2xl font-bold'>
                    Setup Complete!
                    </div>
                    <p className='text-sm text-[#888] w-full max-w-[300px]'>
                    You're ready to start working and collaborating with your team.
                    </p>
                    <div
                        onClick={() => {
                            setProgress("Working"); window.location.reload()
                        }}
                     className='mt-5 bg-[#111] z-[20] hover:bg-[#222] px-8 py-[5px] rounded-lg border-[#535353] border-[1px] cursor-pointer'>
                        Let's go!
                    </div>
                </div>

            </motion.div>

        </motion.div>
    )
}

export default CongratsModal
