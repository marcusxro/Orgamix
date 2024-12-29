import React, { useState } from 'react'
import useStore from '../../../Utils/Zustand/UseStore'
import { motion, AnimatePresence } from 'framer-motion';

interface myTypes {
    closer: React.Dispatch<React.SetStateAction<boolean>>
}

const ChooseMethod: React.FC<myTypes> = ({ closer }) => {
    const [methodChosen, setMethodChosen] = useState<string>("Import")
    const { setShowCreate }: any = useStore()
    const [isExiting, setIsExisting] = useState<boolean>(false)



    function saveMethonChosen() {
        if (!methodChosen) return
        if (methodChosen === "Create") {
            setShowCreate("Create")
            closer(prevs => !prevs)
        } else {
            setShowCreate("Import")
            closer(prevs => !prevs)
        }
    }


    const handleOutsideClick = () => {
        setIsExisting(true);
        setTimeout(() => {
            closer(false);
            setIsExisting(false);
        }, 300);
    };

    return (
        <AnimatePresence>
            {!isExiting &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className='ml-auto positioners flex items-center p-3 justify-center relative w-full h-full'
                    onClick={handleOutsideClick}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        onClick={(e) => { e.stopPropagation() }}
                        className='w-full max-w-[550px] bg-[#313131]  z-[5000] relative
                         rounded-lg p-3 h-full max-h-[300px] border-[#535353] border-[1px] justify-between flex flex-col overflow-auto'>

                        <div>
                            <div className='flex flex-col'>
                                <div className='text-xl font-bold'>Choose method</div>
                                <p className='text-[#888] text-sm'>Choose your desired method to publish your own goals in public.</p>
                            </div>

                            <div className='mt-3 flex flex-wrap gap-3'>
                                <div
                                    onClick={() => { setMethodChosen("Import") }}
                                    className={`${methodChosen === "Import" && 'bg-green-500'} p-3 rounded-lg cursor-pointer border-[#535353] border-[1px]`}>
                                    Share your existing goals
                                </div>
                                <div
                                    onClick={() => { setMethodChosen("Create") }}
                                    className={`${methodChosen === "Create" && 'bg-green-500'} p-3 rounded-lg cursor-pointer border-[#535353] border-[1px]`}>
                                    Create a new goal
                                </div>
                            </div>

                        </div>


                        <div className='w-full rounded-lg border-[#535353] border-[1px] flex overflow-hidden'>

                            <div
                                onClick={() => { handleOutsideClick() }}
                                className='p-2 bg-[#111111] border-r-[#535353] text-center border-r-[1px] hover:bg-[#222]  w-full cursor-pointer'>
                                Close</div>
                            <div
                                onClick={() => { saveMethonChosen() }}
                                className={`${methodChosen === '' && 'bg-[#535353]'} p-2 bg-[#111111] hover:bg-[#222]  text-center w-full cursor-pointer`}>
                                Continue
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

            }
        </AnimatePresence>
    )
}

export default ChooseMethod
