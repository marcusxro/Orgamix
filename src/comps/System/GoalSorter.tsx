import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../Zustand/UseStore';

interface closerType {
    closer: React.Dispatch<React.SetStateAction<boolean>>
}

const GoalSorter: React.FC<closerType> = ({ closer }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [CaterSelect, setCater] = useState<string>("")
    
    const [selectedSort, setSelectedSort] = useState<string>(localStorage.getItem('sortMethodGoals') || '')

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            closer(false);
            setIsExiting(false);
        }, 300);
    };
    function parseCategory(categoryString: string) {
        const match = categoryString.match(/(.*) \((.*)\)/);
        if (match) {
            return {
                type: match[1].trim(),
                value: match[2].trim(),
            };
        }
        return { type: '', value: '' };
    }
    useEffect(() => {
        if (selectedSort && selectedSort.includes("Category (")) {
            const data = parseCategory(selectedSort);
            setCater(data.value);
            setSelectedSort(data.type || "");
        }
    }, [selectedSort]);


    function saveSortMethod() {
        try {

            if(selectedSort === "Category") {
                if(CaterSelect === "") return
                const newVal = `Category (${CaterSelect})`
                console.log(newVal)
                localStorage.setItem('sortMethodGoals', newVal);
                closer(false);
                window.location.reload()
            } else {
                localStorage.setItem('sortMethodGoals', selectedSort);
                closer(false);
                window.location.reload()
            }
        } catch (error) {
            console.error('Failed to save the sort method', error);
        }
    }


    return (
        <AnimatePresence>
            {
                !isExiting &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    style={{ zIndex: 55555555555555 }}
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

                            <div
                                onClick={() => {
                                    setSelectedSort('In progress')
                                }}
                                className={`${selectedSort === 'In progress' && 'bg-blue-500'} px-5 py-1 border-[#535353] border-[1px] rounded-lg cursor-pointer`}>
                                In progress</div>

                            <div
                                onClick={() => {
                                    setSelectedSort('Completed')
                                }}
                                className={`${selectedSort === 'Completed' && 'bg-blue-500'} px-5 py-1 border-[#535353] border-[1px] rounded-lg cursor-pointer`}>
                                Completed</div>


                            <div
                                onClick={() => {
                                    setSelectedSort('Failed')
                                }}
                                className={`${selectedSort === 'Failed' && 'bg-blue-500'} px-5 py-1 border-[#535353] border-[1px] rounded-lg cursor-pointer`}>
                                Failed</div>

                            <div
                                onClick={() => {
                                    setSelectedSort('Category')
                                }}
                                className={`${selectedSort === 'Category' && 'bg-blue-500'} px-5 py-1 border-[#535353] border-[1px] rounded-lg cursor-pointer`}>
                                Category</div>

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
                        {
                            selectedSort === 'Category' &&
                            <select
                                value={CaterSelect}
                                onChange={(e) => { setCater(e.target.value) }}
                                className='p-2 rounded-lg border-[#535353] border-[1px] outline-none'>
                                <option value="">Select Category</option>
                                <option value="Work">Work</option>
                                <option value="Personal">Personal</option>
                                <option value="Fitness">Fitness</option>
                                <option value="Education">Education</option>
                                <option value="Health">Health</option>
                                <option value="Finance">Finance</option>
                                <option value="Travel">Travel</option>
                                <option value="Hobbies">Hobbies</option>
                                <option value="Relationships">Relationships</option>
                                <option value="Spiritual">Spiritual</option>
                                <option value="Career">Career</option>
                                <option value="Self-Development">Self-Development</option>
                                <option value="Home">Home</option>
                                <option value="Community">Community</option>
                                <option value="Creativity">Creativity</option>
                                <option value="Environment">Environment</option>
                                <option value="Volunteering">Volunteering</option>
                                <option value="Family">Family</option>
                            </select>
                        }
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

export default GoalSorter
