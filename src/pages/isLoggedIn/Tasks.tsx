import React, { useEffect, useState } from 'react'
import Sidebar from '../../comps/Sidebar'
import AddNewTask from '../../comps/System/AddNewTask'
import IsLoggedIn from '../../firebase/IsLoggedIn'
import { supabase } from '../../supabase/supabaseClient'
import { CiCalendarDate } from "react-icons/ci";
import { GoSortAsc } from "react-icons/go";
import EditTask from '../../comps/System/EditTask'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useStoreBoolean from '../../Zustand/UseStore'
import { IoMdAdd } from "react-icons/io";
import ViewTask from '../../comps/System/ViewTask'
import TaskSorter from '../../comps/System/TaskSorter'
import Loader from '../../comps/Loader'
import { motion, AnimatePresence } from 'framer-motion'


interface taskDataType {
    title: string;
    deadline: string;
    description: string;
    id: number;
    isdone: boolean;
    priority: string;
    userid: string;
    repeat: string
    createdAt: string;
    link: string;
    category: string;
}



const Tasks: React.FC = () => {
    const [user] = IsLoggedIn()
    const { showNotif, setShowNotif } = useStoreBoolean()


    const [taskData, setTasksData] = useState<taskDataType[] | null>(null)
    const [taskDataCompleted, setTasksDataCompleted] = useState<taskDataType[] | null>(null)

    const [tabItem, setTabination] = useState<string>("Pending")
    const [actions, setActions] = useState<number | null>(null)
    const [edit, setedit] = useState<taskDataType | null>(null)
    const [isNotifying, setIsNotifying] = useState(false);
    const [isComplete, setIsComplete] = useState<string | number | null>(null)
    const [sortVal, setSortVal] = useState<string | null>(null);


    const [isSort, setSort] = useState<boolean>(false)


    useEffect(() => {
        const sortMethod = localStorage.getItem('sortMethod')

        if (sortMethod) {
            getUserTask()

            setSortVal(sortMethod)
        }
    }, [isSort])



    const notif = (message: string) => {
        if (!isNotifying) {
            setIsNotifying(true);
            toast.success(message, {
                position: "top-left",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });

            // Reset notifying state after a timeout (3 seconds to match autoClose)
            setTimeout(() => {
                setIsNotifying(false);
            }, 3000);
        }
    };


    useEffect(() => {
        if (user) {
            getUserTask()
            getUserTaskCompleted()
            const subscription = supabase
                .channel('public:tasks')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                    console.log('Realtime event:', payload);
                    handleRealtimeEvent(payload);
                    getUserTask()
                    getUserTaskCompleted()
                })
                .subscribe()
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user, edit, isSort])


    const handleRealtimeEvent = (payload: any) => {
        switch (payload.eventType) {
            case 'INSERT':
                setTasksData((prevData) =>
                    prevData ? [...prevData, payload.new] : [payload.new]
                );
                break;
            case 'UPDATE':

                setTasksData((prevData) =>
                    prevData
                        ? prevData.map((item) =>
                            item.id === payload.new.id ? payload.new : item

                        )
                        : [payload.new]
                );


                break;
            case 'DELETE':
                setTasksData((prevData) =>
                    prevData ? prevData.filter((item) => item.id !== payload.old.id) : null
                );
                break;
            default:
                break;
        }
    };



    const errorNotif = (message: string) => {
        if (!isNotifying) {
            setIsNotifying(true);
            toast.error(message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });

            // Reset notifying state after a timeout (5 seconds to match autoClose)
            setTimeout(() => {
                setIsNotifying(false);
            }, 5000);
        }
    };

    useEffect(() => {
        if (showNotif && !isNotifying) {
            setIsNotifying(true);
            notif('Task edited!'); // Display notification
            console.log("Task edited!");
            setShowNotif(false);

            // Reset notifying state after a timeout (5 seconds to match autoClose)
            const timer = setTimeout(() => setIsNotifying(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showNotif, isNotifying]);


    function returnSortTitle() {
        switch (sortVal) {
            case "Alphabetically":
                return "title"
            case "Creation Date":
                return "createdAt"
            default:
                return "createdAt"

        }
    }


    async function getUserTask() {
        try {
            if (!user || !user.uid) {
                console.error('User is not defined or uid is missing');
                return;
            }


            const columnName = returnSortTitle()

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('userid', user?.uid)
                .eq('isdone', false)
                .order(columnName, { ascending: true }) // Sort by creation date in ascending order


            if (data) {
                const isRev = sortVal === 'Creation Date' ? data.reverse() : data
                setTasksData(isRev)
            } else {
                console.log(error)
            }
        }
        catch (err) {
            console.log(err)
        }
    }


    async function getUserTaskCompleted() {
        try {
            if (!user || !user.uid) {
                console.error('User is not defined or uid is missing');
                return;
            }


            const columnName = returnSortTitle()

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('userid', user?.uid)
                .eq('isdone', true)
                .order(columnName, { ascending: true }) // Sort by creation date in ascending order


            if (data) {
                const isRev = sortVal === 'Creation Date' ? data.reverse() : data
                setTasksDataCompleted(isRev)
            } else {
                console.log(error)
            }
        }
        catch (err) {
        }
    }

    async function deleteTask(idx: number) {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .match({
                    'userid': user?.uid,
                    'id': idx
                })

            if (error) {
                errorNotif('Error encountered!')
            }
        }
        catch (err) {
            console.log(err)
            errorNotif('Error encountered!')
        }
    }


    async function taskCompleted(idx: number) {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    isdone: true
                })
                .eq('id', idx)
                .eq('userid', user?.uid);
            if (error) {
                errorNotif('Error encountered!')
            } else {
                console.log("completed")
            }

        }
        catch (err) {
        }
    }

    async function taskPending(idx: number) {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    isdone: false
                })
                .eq('id', idx)
                .eq('userid', user?.uid);
            if (error) {
                errorNotif('Error encountered!')
            } else {
                console.log("completed")
            }

        }
        catch (err) {
        }
    }


    const [isShowAdd, setIsShowAdd] = useState<Boolean>(false)
    const [viewTask, setViewTask] = useState<taskDataType | null>(null)




    return (
        <div className='w-full h-full relative'>
            <Sidebar location='Tasks' />
            <ToastContainer />
            {
                isSort &&
                <div
                    onClick={() => { setSort(false) }}
                    className='positioners w-full h-full flex items-center justify-center p-3'>

                    <TaskSorter closer={setSort} />

                </div>
            }
            {
                viewTask != null &&
                <div
                    onClick={() => { setViewTask(null) }}
                    className='positioners w-full h-full flex items-center justify-center p-3'>

                    <ViewTask objPass={viewTask} closer={setViewTask} />

                </div>
            }

            {
                isShowAdd &&
                <div
                    onClick={() => { setIsShowAdd(false) }}
                    className='positioners w-full h-full flex items-center justify-end'>
                    <AddNewTask purpose='Modal' closer={setIsShowAdd} />
                </div>
            }
            {
                edit != null && user &&
                <div
                    onClick={() => { setedit(null) }}
                    className='positioners w-full h-full flex items-center justify-center p-3'>
                    <EditTask objPass={edit} closer={setedit} />
                </div>
            }
            <div className='ml-[86px] p-3 flex gap-3 h-[100dvh] mr-[0px] lg:mr-[370px] '>
                <div className='flex flex-col gap-3 items-start w-full'>
                    <div className='flex w-full justify-between items-center' >
                        <div>
                            <div className='text-2xl font-bold'>
                                Tasks
                            </div>
                            <p className='text-[#888] text-sm'>
                                Manage your daily to-do list.
                            </p>
                        </div>
                        <div
                            onClick={() => { setIsShowAdd(true) }}
                            className='p-2 block lg:hidden bg-[#111111] border-[#535353] border-[1px] rounded-lg cursor-pointer text-2xl hover:bg-[#535353]'>
                            <IoMdAdd />
                        </div>
                    </div>
                    <div className='flex gap-3 justify-between items-center w-full'>

                        <div className='flex my-3 border-[#535353] border-[1px] w-auto items-start overflow-hidden  rounded-l-lg  rounded-r-lg'>
                            <div
                                onClick={() => { setTabination("Pending") }}
                                className={`${tabItem === 'Pending' && 'text-green-500'} px-4 py-2 bg-[#111111] rounded-l-lg cursor-pointer `}> Pending</div>
                            <div className='w-[1px] bg-[#535353]'>

                            </div>
                            <div
                                onClick={() => { setTabination("Completed") }}
                                className={`${tabItem === 'Completed' && 'text-green-500'} px-4 py-2 bg-[#111111]  rounded-r-lg cursor-pointer`}> Completed</div>
                        </div>

                        <div
                            onClick={() => { setSort(true) }}
                            className='p-2  bg-[#111111] border-[#535353] border-[1px] rounded-lg cursor-pointer text-2xl hover:bg-[#535353]'>
                            <GoSortAsc />
                        </div>
                    </div>
                    <div className='mt-4 grid gap-3 grid-cols-1 w-full xs:hidden sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 pb-[10px]'>
                        {
                            taskData === null ?
                                <div className='w-[20px] h-[20px]'>
                                    <Loader />
                                </div>
                                :
                                tabItem === 'Pending' ?
                                    <>
                                        {
                                            taskData && taskData.length > 0 ? (
                                                taskData.map((itm: taskDataType, idx: number) => (
                                                    <AnimatePresence>
                                                        <motion.div
                                                            layout

                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 10 }}
                                                            transition={{ duration: 0.3 }}
                                                            className='bg-[#313131] hover:bg-[#222222]  overflow-hidden flex items-start flex-col p-3 rounded-lg cursor-pointer border-[#535353] border-[1px] '
                                                            key={idx}>
                                                            <div className='font-bold'>
                                                                {itm?.title}
                                                            </div>
                                                            <p className='text-[#888] break-all'>{itm?.description != '' ? itm?.description : 'No Description'}</p>

                                                            <div className='mt-auto pt-2 flex gap-4 text-[10px] md:text-sm'>
                                                                {
                                                                    itm.deadline != '' &&
                                                                    <div className='flex gap-1 items-center justify-start'>
                                                                        <div>
                                                                            < CiCalendarDate />
                                                                        </div>
                                                                        <p className='text-[#888]'>{itm?.deadline != '' && itm?.deadline}</p>
                                                                    </div>
                                                                }
                                                                {
                                                                    itm?.category != '' &&
                                                                    <div className='flex items-center gap-1 justify-start'>
                                                                        <div className='w-[10px] h-[10px] bg-red-500'>

                                                                        </div>
                                                                        <p className='text-[#888]'>{itm?.category != '' && itm?.category}</p>
                                                                    </div>
                                                                }
                                                                {
                                                                    itm?.priority != '' &&
                                                                    <div className='hidden items-center gap-1 justify-start  md:flex'>
                                                                        <div className='w-[10px] h-[10px] bg-yellow-500'>

                                                                        </div>
                                                                        <p className='text-[#888]'>{itm?.priority != '' && itm?.priority} priority</p>
                                                                    </div>
                                                                }
                                                            </div>

                                                            <div className='flex mt-2 w-full border-[#535353] border-[1px] overflow-hidden rounded-l-lg  rounded-r-lg'>


                                                                {
                                                                    actions === itm?.id ?
                                                                        <>
                                                                            <div
                                                                                onClick={() => { deleteTask(itm?.id) }}
                                                                                className='bg-[#111111] px-3 p-1 text-red-500  hover:bg-[#535353] border-r-[1px] border-[#535353] text-center w-full'>Delete</div>
                                                                            <div
                                                                                onClick={() => { setedit(itm) }}
                                                                                className='bg-[#111111] px-3 p-1 text-blue-500 
                                                                        hover:bg-[#535353] border-r-[1px] border-[#535353] text-center w-full'>Edit</div>

                                                                            <div
                                                                                onClick={() => { setActions(null) }}
                                                                                className='bg-[#111111] px-3 p-1 w-full text-center hover:bg-[#535353]'>Cancel</div>
                                                                        </>
                                                                        :
                                                                        <>
                                                                            <div
                                                                                onClick={() => { setViewTask(itm) }}
                                                                                className='bg-[#111111] px-3 p-1  hover:bg-[#535353] border-r-[1px] border-[#535353] text-center w-full'>View</div>

                                                                            <div
                                                                                onClick={() => { setActions(itm?.id) }}
                                                                                className='bg-[#111111] px-3 p-1 w-full text-center hover:bg-[#535353]'>Actions</div>
                                                                        </>
                                                                }
                                                            </div>
                                                            <div className='w-full mt-2 flex rounded-l-lg rounded-r-lg overflow-hidden border-[#535353] border-[1px]'>
                                                                {
                                                                    itm?.id === isComplete ?

                                                                        <>
                                                                            <div
                                                                                onClick={() => { taskCompleted(itm?.id) }}
                                                                                className='bg-[#111111] px-3 p-1 text-green-500  hover:bg-[#535353] border-r-[1px] border-[#535353] text-center w-full'>Complete</div>
                                                                            <div
                                                                                onClick={() => { setIsComplete(null) }}
                                                                                className='bg-[#111111] px-3 p-1 text-red-500 
                                                                        hover:bg-[#535353] border-r-[1px] border-[#535353] text-center w-full'>Cancel</div>

                                                                        </>
                                                                        :
                                                                        <div
                                                                            onClick={() => {
                                                                                setIsComplete(itm?.id)
                                                                            }}
                                                                            className=' bg-[#111111]  p-1 rounded-lg text-center text-green-500 w-full'>
                                                                            Complete
                                                                        </div>
                                                                }
                                                            </div>
                                                        </motion.div>
                                                    </AnimatePresence>
                                                ))
                                            ) : (
                                                <div>No tasks available</div>
                                            )
                                        }
                                    </>
                                    :
                                    <>
                                        {
                                            taskDataCompleted && taskDataCompleted.length > 0 ? (
                                                taskDataCompleted.map((itm: taskDataType, idx: number) => (
                                                    <AnimatePresence>
                                                        <motion.div
                                                            layout
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 10 }}
                                                            transition={{ duration: 0.3 }}
                                                            className='bg-[#313131] w-full  overflow-hidden flex items-start flex-col p-3 rounded-lg cursor-pointer border-[#535353] border-[1px] '
                                                            key={idx}>
                                                            <div className='font-bold'>
                                                                {itm?.title}
                                                            </div>
                                                            <p className='text-[#888] break-all'>{itm?.description != '' ? itm?.description : 'No Description'}</p>

                                                            <div className='mt-auto pt-2 flex gap-4 text-[10px] md:text-sm'>
                                                                {
                                                                    itm.deadline != '' &&
                                                                    <div className='flex gap-1 items-center justify-start'>
                                                                        <div>
                                                                            < CiCalendarDate />
                                                                        </div>
                                                                        <p className='text-[#888] '>{itm?.deadline != '' && itm?.deadline}</p>
                                                                    </div>
                                                                }
                                                                {
                                                                    itm?.category != '' &&
                                                                    <div className='flex items-center gap-1 justify-start'>
                                                                        <div className='w-[10px] h-[10px] bg-red-500'>

                                                                        </div>
                                                                        <p className='text-[#888] '>{itm?.category != '' && itm?.category}</p>
                                                                    </div>
                                                                }
                                                                {
                                                                    itm?.priority != '' &&
                                                                    <div className='flex items-center gap-1 justify-start'>
                                                                        <div className='w-[10px] h-[10px] bg-yellow-500'>

                                                                        </div>
                                                                        <p className='text-[#888] '>{itm?.priority != '' && itm?.priority} priority</p>
                                                                    </div>
                                                                }
                                                            </div>

                                                            <div className='flex mt-2 w-full border-[#535353] border-[1px] overflow-hidden rounded-l-lg  rounded-r-lg'>
                                                                {
                                                                    actions === itm?.id ?
                                                                        <>
                                                                            <div
                                                                                onClick={() => { deleteTask(itm?.id) }}
                                                                                className='bg-[#111111] px-3 p-1 text-red-500  hover:bg-[#535353] border-r-[1px] border-[#535353] text-center w-full'>Delete</div>
                                                                            <div
                                                                                onClick={() => { setedit(itm) }}
                                                                                className='bg-[#111111] px-3 p-1 text-blue-500 
                                                                        hover:bg-[#535353] border-r-[1px] border-[#535353] text-center w-full'>Edit</div>

                                                                            <div
                                                                                onClick={() => { setActions(null) }}
                                                                                className='bg-[#111111] px-3 p-1 w-full text-center hover:bg-[#535353]'>Cancel</div>
                                                                        </>
                                                                        :
                                                                        <>
                                                                            <div
                                                                                onClick={() => { setViewTask(itm) }}
                                                                                className='bg-[#111111] px-3 p-1  hover:bg-[#535353] border-r-[1px] border-[#535353] text-center w-full'>View</div>

                                                                            <div
                                                                                onClick={() => { setActions(itm?.id) }}
                                                                                className='bg-[#111111] px-3 p-1 w-full text-center hover:bg-[#535353]'>Actions</div>
                                                                        </>
                                                                }
                                                            </div>
                                                            <div className='w-full mt-2 flex rounded-l-lg rounded-r-lg overflow-hidden border-[#535353] border-[1px]'>
                                                                {
                                                                    itm?.id === isComplete ?

                                                                        <>
                                                                            <div
                                                                                onClick={() => { taskPending(itm?.id) }}
                                                                                className='bg-[#111111] px-3 p-1 text-green-500  hover:bg-[#535353] border-r-[1px] border-[#535353] text-center w-full'>Complete</div>
                                                                            <div
                                                                                onClick={() => { setIsComplete(null) }}
                                                                                className='bg-[#111111] px-3 p-1 text-red-500 
                                                                        hover:bg-[#535353] border-r-[1px] border-[#535353] text-center w-full'>Cancel</div>

                                                                        </>
                                                                        :
                                                                        <div
                                                                            onClick={() => {
                                                                                setIsComplete(itm?.id)
                                                                            }}
                                                                            className=' bg-[#111111]  p-1 rounded-lg text-center text-green-500 w-full'>
                                                                            Pending
                                                                        </div>
                                                                }
                                                            </div>
                                                        </motion.div>
                                                    </AnimatePresence>
                                                ))
                                            ) : (
                                                <div>No tasks available</div>
                                            )
                                        }
                                    </>


                        }
                    </div>
                </div>

                <div className='ml-auto stickyPostion hidden lg:block'>
                    <AddNewTask purpose='Sidebar' closer={setIsShowAdd} />
                </div>
            </div>
        </div>
    )
}

export default Tasks
