import React, { useEffect, useState } from 'react'
import Sidebar from '../../comps/Sidebar'
import { FaPlus } from "react-icons/fa6";
import CreateGoals from '../../comps/System/CreateGoals';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import { supabase } from '../../supabase/supabaseClient';
import moment from 'moment';
import { BiCategory } from "react-icons/bi";
import { MdOutlineQueryStats } from "react-icons/md";
import { MdDateRange } from "react-icons/md";
import { LuLayoutTemplate } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import Loader from '../../comps/Loader';
import {motion, AnimatePresence} from 'framer-motion'


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
    habit: habitsType[];
    deadline: string;
}


const Goals: React.FC = () => {
    const [GoalListener, setGoalListener] = useState<boolean>(false)
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [isOpenSidebar, setIsOpenSidebar] = useState<boolean>(true)
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false)
    const [searchVal, setSearchVal] = useState<string>("")
    const [originalData, setOriginalData] = useState<dataType[] | null>(null); // To store unfiltered data
    const nav = useNavigate()
    const [user] = IsLoggedIn()

    useEffect(() => {
        if (user && searchVal && originalData) {
            // Perform search on the original data
            const searchResults = originalData.filter(
                (item) =>
                    item.title.toLowerCase().includes(searchVal.toLowerCase()) ||
                    item.description.toLowerCase().includes(searchVal.toLowerCase())
            );
            setFetchedData(searchResults);
        } else if (!searchVal && originalData) {
            // If searchVal is empty, reset to original data
            setFetchedData(originalData);
        }
    }, [searchVal, originalData]);



    useEffect(() => {
        if (user) {
            fetchGoalsByID()
            const subscription = supabase
                .channel('public:goals')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, (payload) => {
                    console.log('Realtime event:', payload);
                    handleRealtimeEvent(payload);
                })
                .subscribe();
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [GoalListener, user])

    const handleRealtimeEvent = (payload: any) => {
        switch (payload.eventType) {
            case 'INSERT':
                setFetchedData((prevData) =>
                    prevData ? [...prevData, payload.new] : [payload.new]
                );
                break;
            case 'UPDATE':
                setFetchedData((prevData) =>
                    prevData
                        ? prevData.map((item) =>
                            item.id === payload.new.id ? payload.new : item
                        )
                        : [payload.new]
                );
                break;
            case 'DELETE':
                console.log("DELETED")
                setFetchedData((prevData) =>
                    prevData ? prevData.filter((item) => item.id !== payload.old.id) : null
                );
                break;
            default:
                break;
        }
    };


    async function fetchGoalsByID() {
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('userid', user?.uid);

            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setFetchedData(data);
                setOriginalData(data)
            }
        } catch (err) {
            console.log(err);
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



    return (
        <div>
            <Sidebar location='Goals' />


            <div className={`ml-[86px] p-3 flex gap-3 h-[100dvh] mr-[0px] pb-9  ${isOpenSidebar && "lg:mr-[370px]"}`}>
                <div className='w-full h-full'>
                    <div>
                        <div
                            className='text-2xl font-bold'>
                            Goals
                        </div>
                        <div className='text-sm text-[#888]'>
                            Easily create, edit, and organize your notes in this section for a streamlined experience.
                        </div>
                    </div>

                    <div className='mt-4 flex flex-col md:flex-row items-start gap-2'>
                        <div className='flex gap-2'>
                            <div
                                onClick={() => {
                                    setIsOpenSidebar(prevClick => !prevClick); setIsOpenModal(prevClick => !prevClick)
                                }}
                                className='bg-[#313131] p-3 hover:bg-[#535353] border-[#535353] border-[1px] cursor-pointer rounded-lg flex gap-2 items-center'>
                                Create Goal <span className='text-md'><FaPlus /></span>
                            </div>
                            <div
                                onClick={() => {
                                    nav('/user/goals/templates')
                                }}
                                className='bg-[#313131] p-4 hover:bg-[#535353] border-[#535353] border-[1px] cursor-pointer rounded-lg flex gap-2 items-center'>
                                <LuLayoutTemplate />
                            </div>
                        </div>

                        <input
                            value={searchVal}
                            onChange={(e) => { setSearchVal(e.target.value) }}
                            className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px]'
                            placeholder='Search your goal title'
                            type="text"
                        />
                    </div>
                    <div className='flex flex-wrap gap-3 mt-2 pb-5'>
                        {fetchedData?.length === 0 && "No result :("}
                        {
                            fetchedData === null ?
                                <div className='w-[20px] h-[20px]'>
                                    <Loader />
                                </div>
                                :
                                <AnimatePresence>
                                    {
                                        fetchedData && fetchedData?.map((itm: dataType, idx: number) => (
                                            <motion.div
                                            layout

                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.3 }}
                                                onClick={() => {
                                                    nav(`/user/goals/templates/${user?.uid}/${itm?.created_at}`)
                                                }}
                                                key={idx}
                                                className='w-full max-w-[300px] bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg overflow-hidden hover:bg-[#222222]'>

                                                <div className='flex h-[110px] items-start  justify-start   border-b-[#535353] border-b-[1px]  '>
                                                    <div
                                                        style={{ backgroundColor: determineDate(itm?.deadline) }}
                                                        className={`w-[2px] h-full`}>
                                                    </div>

                                                    <div className='flex flex-col p-3'>
                                                        <div className='font-bold mb-1'>
                                                            {itm?.title.length >= 20 ? itm?.title.slice(0, 20) + "..." : itm?.title}
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

                                                <div className='flex justify-between items-center p-3 text-[#888] gap-2'>
                                                    <div>
                                                        {itm?.sub_tasks.filter((itmz) => itmz.is_done).length}
                                                        /
                                                        {itm?.sub_tasks.length}
                                                    </div>


                                                    <div>
                                                        {itm?.created_at
                                                            ? moment(parseInt(itm?.created_at.toString())).format('MMMM Do YYYY')
                                                            : 'No Creation date'}
                                                    </div>
                                                </div>


                                            </motion.div>
                                        ))
                                    }
                                </AnimatePresence>
                        }
                    </div>
                </div>
                {
                    isOpenSidebar &&
                    <div className='ml-auto stickyPostion hidden lg:block'>
                        <CreateGoals listener={setGoalListener} purpose="Sidebar" closer={setIsOpenModal} location="goals" />
                    </div>
                }

                {
                    isOpenModal &&
                    <div
                        onClick={() => {
                            setIsOpenModal(prevClick => !prevClick)
                        }}
                        className='ml-auto positioners flex items-end justify-end w-full h-full lg:hidden'>
                        <CreateGoals listener={setGoalListener} purpose="Modal" closer={setIsOpenModal} location='goals' />
                    </div>
                }

            </div>
        </div >
    )
}

export default Goals
