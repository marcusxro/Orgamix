import React, { useEffect, useState } from 'react'
import Sidebar from '../../comps/Sidebar'
import AddNewTask from '../../comps/System/AddNewTask'
import IsLoggedIn from '../../firebase/IsLoggedIn'
import { supabase } from '../../supabase/supabaseClient'
import { CiCalendarDate } from "react-icons/ci";
import { GoSortAsc } from "react-icons/go";
import EditTask from '../../comps/System/EditTask'
import 'react-toastify/dist/ReactToastify.css';
import useStoreBoolean from '../../Zustand/UseStore'
import { IoMdAdd } from "react-icons/io";
import ViewTask from '../../comps/System/ViewTask'
import TaskSorter from '../../comps/System/TaskSorter'
import Loader from '../../comps/Loader'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../Zustand/UseStore'
import { CiRepeat } from "react-icons/ci";
import MetaEditor from '../../comps/MetaHeader/MetaEditor'


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
    link: string[];
    category: string;
}



const Tasks: React.FC = () => {
    const [user] = IsLoggedIn()
    const { showNotif, setShowNotif } = useStoreBoolean()
    const [taskData, setTasksData] = useState<taskDataType[] | null>(null)
    const [taskDataCompleted, setTasksDataCompleted] = useState<taskDataType[] | null>(null)
    const [tabItem, setTabination] = useState<string>("Pending")
    const [actions, setActions] = useState<number | null>(null)
    const [isNotifying, setIsNotifying] = useState(false);
    const [isComplete, setIsComplete] = useState<string | number | null>(null)
    const [sortVal, setSortVal] = useState<string | null>(null);
    const [sortMethodLoaded, setSortMethodLoaded] = useState<boolean>(false);
    const { isSort, setSort }: any = useStore();
    const sortMethod = localStorage.getItem('sortMethod');
    const { viewEditTask, setViewEditTask } = useStore();
    const [searchVal, setSearchVal] = useState<string>("")
    const [filteredObj, setFilteredObj] = useState<taskDataType[] | null | undefined>(null)

    const [filteredComp, setFilteredComp] = useState<taskDataType[] | null | undefined>(null)

    useEffect(() => {
 

        if (user && sortMethod && !sortMethodLoaded) {
            setSortVal(sortMethod);
            setSortMethodLoaded(true); // Mark that the sort method has been loaded
        }
    }, [user, sortMethod, sortMethodLoaded]);


    useEffect(() => {
        if (searchVal != '') {
            const filteredData: taskDataType[] | undefined = filteredObj?.filter((itm) => {
                return itm?.title.toLowerCase().includes(searchVal.toLowerCase())
            })

            setFilteredObj(filteredData)

            const filteredDataCompleted: taskDataType[] | undefined = taskDataCompleted?.filter((itm) => {
                return itm?.title.toLowerCase().includes(searchVal.toLowerCase())
            })

            setFilteredComp(filteredDataCompleted)

        } else {
            setFilteredObj(taskData)
            setFilteredComp(taskDataCompleted)
        }
    }, [searchVal])

    useEffect(() => {
        if (sortVal) {
            getUserTask(); // Fetch sorted tasks
            getUserTaskCompleted();
        }
    }, [sortVal]);



    useEffect(() => {
        if (user) {
            getUserTask();
            getUserTaskCompleted();

            const subscription = supabase
                .channel('public:tasks')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                    handleRealtimeEvent(payload);
                    getUserTask();
                    getUserTaskCompleted();
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user, sortVal, isSort]); // Update on `sortVal` change as well


    const handleRealtimeEvent = (payload: any) => {
        const isCurrentUserProject = payload.new?.created_by === user?.uid || payload.old?.created_by === user?.uid;

        if (!isCurrentUserProject) return;


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


    useEffect(() => {
        if (showNotif && !isNotifying) {
            setIsNotifying(true);
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
            if (!user) {
                console.error('User is not defined or uid is missing');
                return;
            }

            const columnName = returnSortTitle();
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('userid', user?.uid)
                .eq('isdone', false)
                .order(columnName || "createdAt", { ascending: true });

            if (data) {
                const sortedData = sortVal === 'Creation Date' ? data.reverse() : data;
                setTasksData(sortedData);
                setFilteredObj(sortedData)
            } else {
                console.log("Error:", error);
            }
        } catch (err) {
            console.error("Error fetching tasks:", err);
        }
    }


    async function getUserTaskCompleted() {
        try {
            if (!user) {
                console.error('User is not defined or uid is missing');
                return;
            }


            const columnName = returnSortTitle()

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('userid', user?.uid)
                .eq('isdone', true)
                .order(columnName || "createdAt", { ascending: true });


            if (data) {
                const isRev = sortVal === 'Creation Date' ? data.reverse() : data
                setTasksDataCompleted(isRev)
                setFilteredComp(isRev)
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
                console.log('Error encountered!')
            }
        }
        catch (err) {
            console.log(err)
            console.log('Error encountered!')
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
                .eq('userid', user?.uid)
                .order('createdAt', { ascending: true })
                
            if (error) {
                console.log('Error encountered!')
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
                .eq('userid', user?.uid)
                .order('createdAt', { ascending: true })

            if (error) {
                console.log('Error encountered!')
            } else {
                console.log("completed")
            }

        }
        catch (err) {
        }
    }

    const { isShowAdd, setIsShowAdd }: any = useStore();
    const { viewTask, setViewTask } = useStore();


    return (
        <div className='w-full h-full relative selectionNone'>
           {
            user &&
            <MetaEditor 
            title={`Tasks | ${user?.email}`}
                      description='Manage your daily to-do list.'
                      />
           }
            <Sidebar location='Tasks' />
            {
                isSort &&
                <TaskSorter closer={setSort} />
            }
            {
                viewTask != null &&
                <ViewTask objPass={viewTask} />
            }

            {
                isShowAdd &&

                <AddNewTask purpose='Modal' closer={setIsShowAdd} />

            }

            {
                viewEditTask != null && user &&

                <EditTask objPass={viewEditTask} />

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
                            className='p-2 block lg:hidden bg-[#111111] border-[#535353] border-[1px] rounded-lg cursor-pointer text-2xl hover:bg-[#222]'>
                            <IoMdAdd />
                        </div>
                    </div>

                    <div className='flex gap-3 justify-between items-center w-full'>
                        <div className='flex  border-[#535353] border-[1px] w-auto items-start overflow-hidden  rounded-l-lg  rounded-r-lg'>
                            <div
                                onClick={() => { setTabination("Pending") }}
                                className={`${tabItem === 'Pending' && 'text-green-500'} px-4 py-2 hover:bg-[#222] bg-[#111111] rounded-l-lg cursor-pointer `}> Pending</div>
                            <div className='w-[1px] bg-[#535353]'>

                            </div>
                            <div
                                onClick={() => { setTabination("Completed") }}
                                className={`${tabItem === 'Completed' && 'text-green-500'} px-4 py-2 bg-[#111111] hover:bg-[#222]  rounded-r-lg cursor-pointer`}> Completed</div>
                        </div>

                        <div className='flex lg:flex-row-reverse gap-4 items-end lg:items-center flex-col'>
                            <div
                                onClick={() => { setSort(true) }}
                                className='p-2  bg-[#111111] border-[#535353] border-[1px] rounded-lg cursor-pointer text-2xl hover:bg-[#222]'>
                                <GoSortAsc />
                            </div>
                            <input
                                value={searchVal}
                                onChange={(e) => { setSearchVal(e.target.value) }}
                                className='p-[8px] hidden lg:block bg-[#111111] px-3 outline-none border-[#535353] border-[1px] rounded-lg  '
                                placeholder='Search Tasks'
                                type="text" name="" id="" />
                        </div>
                    </div>
                    <input
                        value={searchVal}
                        onChange={(e) => { setSearchVal(e.target.value) }}
                        className='p-[8px] block w-full max-w-[250px] lg:hidden bg-[#111111] px-3 outline-none border-[#535353] border-[1px] rounded-lg  '
                        placeholder='Search Tasks'
                        type="text" name="" id="" />

                    <div className='mt-4 grid gap-3 grid-cols-1 w-full xs:hidden sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 pb-[10px]'>
                        {
                            tabItem === 'Pending' && filteredObj && filteredObj.length === 0 && searchVal != "" &&
                            <div className='text-sm text-[#888]'>No result</div>
                        }
                        {
                            tabItem === 'Pending' && filteredObj && filteredObj.length === 0 && searchVal === "" &&
                            <div className='text-sm text-[#888]'>Create your first task!</div>
                        }

                        {
                            tabItem !== 'Pending' && filteredComp && filteredComp.length === 0 && searchVal === "" &&
                            <div className='text-sm text-[#888]'>No completed tasks yet</div>
                        }
                          {
                            tabItem !== 'Pending' && filteredComp && filteredComp.length === 0 && searchVal != "" &&
                            <div className='text-sm text-[#888]'>No result</div>
                        }
                        {
                            taskData === null ?
                                <div className='w-[20px] h-[20px]'>
                                    <Loader />
                                </div>

                                :
                                tabItem === 'Pending' ?
                                    <>
                                        <AnimatePresence>
                                            {

                                                filteredObj && filteredObj.length > 0 && filteredObj && (
                                                    filteredObj.map((itm: taskDataType, idx: number) => (

                                                        <motion.div
                                                            layout
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 10 }}
                                                            transition={{ duration: 0.3 }}
                                                            className='bg-[#313131] hover:bg-[#222]  overflow-hidden flex items-start flex-col p-3 rounded-lg cursor-pointer border-[#535353] border-[1px] '
                                                            key={idx}>
                                                            <div className='font-bold break-all'>
                                                                {itm?.title}
                                                            </div>
                                                            <p className='text-[#888] break-all text-sm'>{itm?.description != '' ? itm?.description : 'No Description'}</p>

                                                            {itm?.repeat != '' &&
                                                                <p className='text-[#888] flex gap-1  items-center my-2 break-all text-sm'> 
                                                                <CiRepeat /> {itm?.repeat != '' && itm?.repeat}
                                                                </p>
                                                            }

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
                                                                                onClick={() => { deleteTask(itm?.id); }}
                                                                                className='bg-[#111111] px-3 p-1 text-red-500  hover:bg-[#222] border-r-[1px] border-[#535353] text-center w-full'>Delete</div>
                                                                            <div
                                                                                onClick={() => { setViewEditTask(itm) }}
                                                                                className='bg-[#111111] px-3 p-1 text-blue-500 
                                                                        hover:bg-[#2222] border-r-[1px] border-[#535353] text-center w-full'>Edit</div>

                                                                            <div
                                                                                onClick={() => { setActions(null) }}
                                                                                className='bg-[#111111] px-3 p-1 w-full text-center hover:bg-[#222]'>Cancel</div>
                                                                        </>
                                                                        :
                                                                        <>
                                                                            <div
                                                                                onClick={() => { setViewTask(itm) }}
                                                                                className='bg-[#111111] px-3 p-1  hover:bg-[#222] border-r-[1px] border-[#535353] text-center w-full'>View</div>

                                                                            <div
                                                                                onClick={() => { setActions(itm?.id) }}
                                                                                className='bg-[#111111] px-3 p-1 w-full text-center hover:bg-[#222]'>Actions</div>
                                                                        </>
                                                                }
                                                            </div>
                                                            <div className='w-full mt-2 flex rounded-l-lg rounded-r-lg overflow-hidden border-[#535353] border-[1px]'>
                                                                {
                                                                    itm?.id === isComplete ?

                                                                        <>
                                                                            <div
                                                                                onClick={() => { taskCompleted(itm?.id) }}
                                                                                className='bg-[#111111] px-3 p-1 text-green-500  hover:bg-[#222] border-r-[1px] border-[#535353] text-center w-full'>Complete</div>
                                                                            <div
                                                                                onClick={() => { setIsComplete(null) }}
                                                                                className='bg-[#111111] px-3 p-1 text-red-500 
                                                                        hover:bg-[#222] border-r-[1px] border-[#535353] text-center w-full'>Cancel</div>

                                                                        </>
                                                                        :
                                                                        <div
                                                                            onClick={() => {
                                                                                setIsComplete(itm?.id)
                                                                            }}
                                                                            className=' bg-[#111111] hover:bg-[#222] p-1 rounded-lg text-center text-green-500 w-full'>
                                                                            Complete
                                                                        </div>
                                                                }
                                                            </div>
                                                        </motion.div>

                                                    ))
                                                )
                                            }
                                        </AnimatePresence>
                                    </>
                                    :
                                    <>
                                        <AnimatePresence>
                                            {
                                                filteredComp && filteredComp.length > 0 && filteredComp && (
                                                    filteredComp.map((itm: taskDataType, idx: number) => (
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

                                                            {itm?.repeat != '' &&
                                                                <p className='text-[#888] flex gap-1  items-center my-2 break-all text-sm'> 
                                                                <CiRepeat /> {itm?.repeat != '' && itm?.repeat}
                                                                </p>
                                                            }
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
                                                                                className='bg-[#111111] px-3 p-1 text-red-500  hover:bg-[#222] border-r-[1px] border-[#535353] text-center w-full'>Delete</div>
                                                                            <div
                                                                                onClick={() => { setViewEditTask(itm) }}
                                                                                className='bg-[#111111] px-3 p-1 text-blue-500 
                                                                        hover:bg-[#222] border-r-[1px] border-[#535353] text-center w-full'>Edit</div>

                                                                            <div
                                                                                onClick={() => { setActions(null) }}
                                                                                className='bg-[#111111] px-3 p-1 w-full text-center hover:bg-[#222]'>Cancel</div>
                                                                        </>
                                                                        :
                                                                        <>
                                                                            <div
                                                                                onClick={() => { setViewTask(itm) }}
                                                                                className='bg-[#111111] px-3 p-1  hover:bg-[#222] border-r-[1px] border-[#535353] text-center w-full'>View</div>

                                                                            <div
                                                                                onClick={() => { setActions(itm?.id) }}
                                                                                className='bg-[#111111] px-3 p-1 w-full text-center hover:bg-[#222]'>Actions</div>
                                                                        </>
                                                                }
                                                            </div>
                                                            <div className='w-full mt-2 flex rounded-l-lg rounded-r-lg overflow-hidden border-[#535353] border-[1px]'>
                                                                {
                                                                    itm?.id === isComplete ?

                                                                        <>
                                                                            <div
                                                                                onClick={() => { taskPending(itm?.id) }}
                                                                                className='bg-[#111111] px-3 p-1 text-green-500  hover:bg-[#222] border-r-[1px] border-[#535353] text-center w-full'>Complete</div>
                                                                            <div
                                                                                onClick={() => { setIsComplete(null) }}
                                                                                className='bg-[#111111] px-3 p-1 text-red-500 
                                                                        hover:bg-[#222] border-r-[1px] border-[#535353] text-center w-full'>Cancel</div>

                                                                        </>
                                                                        :
                                                                        <div
                                                                            onClick={() => {
                                                                                setIsComplete(itm?.id)
                                                                            }}
                                                                            className=' bg-[#111111]  p-1 rounded-lg text-center text-red-500 w-full'>
                                                                            Undo
                                                                        </div>
                                                                }
                                                            </div>
                                                        </motion.div>

                                                    ))
                                                )
                                            }
                                        </AnimatePresence>
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
