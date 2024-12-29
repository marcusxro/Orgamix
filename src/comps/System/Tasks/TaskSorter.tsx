import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../Utils/Zustand/UseStore';

interface closerType {
    closer: React.Dispatch<React.SetStateAction<boolean>>
}

const TaskSorter: React.FC<closerType> = ({ closer }) => {
    const [isExiting, setIsExiting] = useState(false);
    const { isSort, setSort }: any = useStore();

    const [selectedSort, setSelectedSort] = useState<string>(localStorage.getItem('sortMethod') || '')

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setSort(null);
            setIsExiting(false);
        }, 300);
    };

    function saveSortMethod() {
        try {
            localStorage.setItem('sortMethod', selectedSort);
            closer(false);
            window.location.reload()
        } catch (error) {
            console.error('Failed to save the sort method', error);
        }
    }


    return (
        <AnimatePresence>
            {
                !isExiting && isSort &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    style={{zIndex: 55555555555555}}
                    className='ml-auto positioners flex items-center p-3 justify-center relative w-full h-full'
                    onClick={handleOutsideClick}>

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        onClick={(e) => { e.stopPropagation() }}
                        className='w-full max-w-[350px] bg-[#313131] h-full max-h-[500px]
                        rounded-lg p-5  border-[#535353] border-[1px] flex flex-col gap-3 overflow-auto'>
                        <div className='mb-3'>
                            <div className='font-bold'>
                                Sort by
                            </div>
                            <p className='text-[#888] text-sm'>
                                Select a sorting option from the available choices to organize the content.
                            </p>
                        </div>

                        <div className='flex gap-2 flex-wrap'>
                            <div
                                onClick={() => {
                                    setSelectedSort('Creation Date')
                                }}
                                className={`${selectedSort === 'Creation Date' && 'bg-blue-500'} px-5 py-1 border-[#535353] border-[1px] rounded-lg cursor-pointer`}>
                                Creation Date </div>

                            <div
                                onClick={() => {
                                    setSelectedSort('Alphabetically')
                                }}
                                className={`${selectedSort === 'Alphabetically' && 'bg-blue-500'} px-5 py-1 border-[#535353] border-[1px] rounded-lg cursor-pointer`}>
                                Alphabetically</div>


                            {/* <div
                    onClick={() => {
                        setSelectedSort('Priority')
                    }}
                    className={`${selectedSort === 'Priority' && 'bg-blue-500'} px-5 py-1 border-[#535353] border-[1px] rounded-lg cursor-pointer`}>
                    Priority</div>


                <div
                    onClick={() => {
                        setSelectedSort('Category')
                    }}
                    className={`${selectedSort === 'Category' && 'bg-blue-500'} px-5 py-1 border-[#535353] border-[1px] rounded-lg cursor-pointer`}>
                    Category</div>


                <div
                    onClick={() => {
                        setSelectedSort('Repeat')
                    }}
                    className={`${selectedSort === 'Repeat' && 'bg-blue-500'} px-5 py-1 border-[#535353] border-[1px] rounded-lg cursor-pointer`}>
                    Repeat</div> */}

                            <div
                                onClick={() => {
                                    setSelectedSort('')
                                }}
                                className={`${selectedSort === '' && 'bg-blue-500'} px-5 py-1 border-[#535353] border-[1px] rounded-lg cursor-pointer`}>
                                None</div>

                        </div>

                        <div className='flex gap-2 mt-auto'>
                        <div
                                onClick={() => { handleOutsideClick() }}
                                className='w-full p-2 bg-[#684444] text-center rounded-lg border-[#535353] border-[1px] hover:bg-[#535353] cursor-pointer'>
                                Close
                            </div>
                            <div
                                onClick={() => { saveSortMethod() }}
                                className={`w-full p-2 border-[#535353] border-[1px]  bg-[#43573e] text-center rounded-lg hover:bg-[#535353] cursor-pointer`}>
                                Save
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default TaskSorter
