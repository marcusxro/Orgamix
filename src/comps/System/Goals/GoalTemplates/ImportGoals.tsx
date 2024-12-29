import React, { useEffect, useState } from 'react'
import useStore from '../Utils/Zustand/UseStore';
import IsLoggedIn from '../Utils/IsLoggedIn';
import { supabase } from '../Utils/supabase/supabaseClient';
import { BiCategory } from "react-icons/bi";
import { MdOutlineQueryStats } from "react-icons/md";
import { MdDateRange } from "react-icons/md";
import { motion, AnimatePresence } from 'framer-motion';

interface subtaskType {
    is_done: boolean;
    startedAt: string;
    subGoal: string
}
interface habitsType {
    repeat: string;
    habit: string;
}
interface dataType {
    userid: string;
    id: number;
    title: string;
    category: string;
    is_done: boolean;
    created_at: number;
    description: string;
    sub_tasks: subtaskType[];
    habits: habitsType[];
    deadline: string;
}


const ImportGoals: React.FC = () => {

    const { showCreate, setShowCreate, setCreatedAt }: any = useStore()
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [originalData, setoriginalData] = useState<dataType[] | null>(null);
    const [isEq, setIsEq] = useState<number | null>(null)
    const [searchVal, setSearchVal] = useState<string>("")
    const [user]:any = IsLoggedIn()


    function handleInput(params: string) {
        setSearchVal(params)
    }



    useEffect(() => {
        if (fetchedData && user) {
            // If searchVal is empty, reset to the full array
            if (!searchVal) {
                setFetchedData(originalData); // Assuming you have stored the original data in a state variable
            } else {
                // Filter goals by their title
                const filteredGoals = fetchedData.filter((goal) =>
                    goal.title.toLowerCase().includes(searchVal.toLowerCase())
                );

                setFetchedData(filteredGoals); // Set the filtered goals
            }
        }
    }, [searchVal, user, fetchedData]); // Include fetchedData as a dependency if needed




    useEffect(() => {
        if (user) {
            getGoalByIds()
          
        }
    }, [user])

    async function getGoalByIds() {
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('userid', user?.id)

            if (error) {
                console.log(error)
            } else {

                setFetchedData(data)
                setoriginalData(data)
            }
        }
        catch (err) {
            console.log(err)
        }
    }

    function determineDate(date: string): string {
        const deadline = new Date(date);
        const now = new Date();
        const timeDiff = deadline.getTime() - now.getTime();

        // Convert milliseconds to days
        const daysUntilDeadline = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysUntilDeadline < 0) {
            return '#cc0000'; // Medium red (deadline has passed)
        } else if (daysUntilDeadline === 0) {
            return '#cc0000'; // Medium red (today is the deadline)
        } else if (daysUntilDeadline === 1) {
            return '#cc0000'; // Medium red (1 day before the deadline)
        } else if (daysUntilDeadline <= 3) {
            return '#e67e22'; // Medium orange (3 days before the deadline)
        } else if (daysUntilDeadline <= 7) {
            return '#f1c40f'; // Medium yellow (7 days before the deadline)
        } else {
            return '#2ecc71'; // Medium green (more than 7 days until the deadline)
        }
    }


    function isFailed(deadlineString: string, boolVal: boolean) {
        const deadline = new Date(deadlineString);
        const now = new Date();
        deadline.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        // Calculate difference in time
        const timeDiff = deadline.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff > 0 && !boolVal) {
            // If the deadline is in the future
            return (
                <>In progress</>
            );
        } else if (daysDiff > 0 && boolVal) {
            return (
                <div className='text-sm text-[#2ecc71] flex gap-1 items-center'>
                    Completed
                </div>
            )
        }

        else {
            return (
                <div className='text-sm text-[#cc0000] flex gap-1 items-center'>
                    Failed
                </div>
            );
        }
    }


    function checkDeadlineMet(deadlineString: string): JSX.Element {
        const deadline = new Date(deadlineString);
        const now = new Date();
        deadline.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        // Calculate difference in time
        const timeDiff = deadline.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            // If deadline is today
            return (
                <div className='text-sm text-[#cc0000] flex gap-1 items-center'>
                    <MdDateRange />
                    Deadline Met
                </div>
            );
        } else if (daysDiff > 0) {
            // If the deadline is in the future
            return (
                <div className={`${daysDiff <= 3 && 'text-[#cc0000]'} text-[#888] text-sm flex gap-1 items-center`}>
                    <MdDateRange />
                    {`${deadlineString} / ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} left`}
                </div>
            );
        } else {
            // If the deadline has passed
            return (
                <div className='text-sm text-[#cc0000] flex gap-1 items-center'>
                    <MdDateRange />
                    {`${deadlineString} / ${Math.abs(daysDiff)} ${Math.abs(daysDiff) === 1 ? 'day' : 'days'} ago`}
                </div>
            );
        }
    }

    const handleToggle = (createdAt: number, boolVal: boolean) => {
        if (boolVal) {
            setIsEq(null)
        } else {
            setIsEq(createdAt)
        }
    };


    function handleGoEdit() {
        if (!isEq) return
        setCreatedAt(isEq)
        setShowCreate("Upload")

    }

    const [isExiting, setIsExiting] = useState(false);

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setShowCreate("");
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
                    className='ml-auto positioners flex items-center p-3 justify-center relative w-full h-full'
                    onClick={handleOutsideClick}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        onClick={(e) => { e.stopPropagation() }}
                        className='w-full max-w-[740px] bg-[#313131]  z-[5000] relative
                        rounded-lg p-3 h-full max-h-[800px] border-[#535353] border-[1px] 
                        justify-between flex flex-col '>

                        <div className='h-full flex flex-col justify-between gap-3'>
                            <div>
                                <div className='font-bold text-xl'>
                                    Share Your Goals
                                </div>
                                <p className='text-sm text-[#888]'>
                                    Publicly share your goals to inspire others and stay accountable!
                                </p>
                                <div className='flex items-start mt-3 justify-start'>
                                    <input
                                        value={searchVal}
                                        onChange={(e) => { handleInput(e.target.value) }}
                                        className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px]'
                                        placeholder='Search your goal title'
                                        type="text"
                                    />
                                </div>
                            </div>

                            <div className='h-full overflow-auto'>


                                <div
                                    className='w-full h-full  mt-5 grid grid-cols-1
                                     sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-auto'>
                                        {
                                            fetchedData?.length === 0 &&
                                            <div className='text-sm text-[#888]'>No result</div>
                                        }
                                    <AnimatePresence>
                                        {
                                            fetchedData != null && fetchedData.map((itm: dataType, idx) => (
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    transition={{ duration: 0.3 }}
                                                    onClick={() => { handleToggle(itm?.created_at, isEq === itm?.created_at ? true : false) }}
                                                    key={idx}
                                                    className={`${isEq && isEq === itm?.created_at ? 'bg-[#111010]' : 'bg-[#313131]'}  h-[200px] border-[#535353] border-[1px] cursor-pointer rounded-lg overflow-hidden hover:bg-[#222222] `}>
                                                    {!fetchedData && "No result"}

                                                    <div className='flex h-[135px] items-start justify-start border-b-[#535353] border-b-[1px]'>
                                                        <div
                                                            style={{ backgroundColor: determineDate(itm?.deadline) }}
                                                            className={`w-[2px] h-full`}>
                                                        </div>

                                                        <div className='flex flex-col p-3'>
                                                            <div className='font-bold mb-1'>
                                                                {itm?.title}
                                                            </div>
                                                            <div className='text-[#888] text-sm flex gap-1 items-center'>
                                                                <BiCategory />{itm?.category}
                                                            </div>
                                                            <div className='text-[#888] text-sm flex gap-1 items-center'>
                                                                <MdOutlineQueryStats />
                                                                {isFailed(itm?.deadline, itm?.is_done)}
                                                            </div>

                                                            {checkDeadlineMet(itm?.deadline)}
                                                        </div>
                                                    </div>
                                                    <div className='p-3'>
                                                        <div>
                                                            {itm?.sub_tasks.length > 1 ? "Tasks" : "Task"}: {itm?.sub_tasks.length}
                                                        </div>
                                                        <div>
                                                            {itm?.habits.length > 1 ? "Habits" : "Habit"}: {itm?.habits.length}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        }
                                    </AnimatePresence>
                                </div>

                            </div>
                            <div className='w-full max-h-[40px] h-full rounded-lg border-[#535353] border-[1px] flex overflow-hidden'>

                                <div
                                    onClick={() => { handleOutsideClick() }}
                                    className='p-2 bg-[#111111] border-r-[#535353] text-center border-r-[1px]  w-full cursor-pointer hover:bg-[#222222] '>
                                    Close</div>
                                <div
                                    onClick={() => { handleGoEdit() }}
                                    className={`${!isEq && 'bg-[#535353]'} p-2 bg-[#111111] text-center w-full cursor-pointer hover:bg-[#222222] `}>
                                    Continue
                                </div>
                            </div>
                        </div>


                    </motion.div>
                </motion.div>
            }
        </AnimatePresence >
    )
}

export default ImportGoals
