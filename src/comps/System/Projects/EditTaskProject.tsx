import React, { ReactNode, useEffect, useState } from 'react';
import useStore from '../../../Zustand/UseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../supabase/supabaseClient';
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import { IoIosContact } from "react-icons/io";
import { FaLinesLeaning } from "react-icons/fa6";
import { BsCalendarDate } from "react-icons/bs";
import Input from './Input';
import { Button } from './Button';
import Loader from '../../Loader';
import moment from 'moment'


interface invitedEmails {
    username: string;
    email: string;
    uid: string;
}

interface updatedAt {
    date: string;
    username: string;
    email: string;
    uid: string;
    itemMoved: string
}


interface tasksType {
    title: string;
    created_at: number;
    created_by: string;
    priority: string;
    type: string;
    id: number;
    start_work: string;
    deadline: string;
    assigned_to: string; //uid basis
}

interface boardsType {
    title: string;
    titleColor: string; //hex
    created_at: number;
    board_uid: string;
    created_by: string;
    tasks: tasksType[]
}


interface dataType {
    description: string;
    id: number;
    created_at: number;
    name: string;
    created_by: string;
    deadline: number;
    is_shared: string;
    invited_emails: null | invitedEmails[];
    updated_at: null | updatedAt[];
    is_favorite: boolean;
    boards: boardsType[]
}


interface userType {
    userid: string;
    username: string;
    password: string;
    email: string;
    id: number;
    fullname: string;
}

interface isAllowedType {
    isAllowed: boolean
}

const EditTaskProject: React.FC<isAllowedType> = ({isAllowed}) => {
    const { settingsTask, setSettingsTask }: any = useStore();
    const [isExiting, setIsExiting] = useState(false);
    const params = useParams()
    const [fetchedData, setFetchedData] = useState<tasksType[] | null>(null);
    const [defaultData, setDefaultData] = useState<dataType[] | null>(null);

    const [userData, setUserData] = useState<userType[] | null>(null)
    const [user] = IsLoggedIn()

    const [itemName, setItemName] = useState('');
    const [assignee, setAssigne] = useState<string>(user?.email || "")
    const [priority, setPriority] = useState<string>("")
    const [workStart, setWorkStart] = useState<string>("")
    const [workEnd, setWorkEnd] = useState<string>("")
    const [workType, setWorkType] = useState<string>("")

    const [isDelete, setIsDelete] = useState<boolean>(false)

    useEffect(() => {
        if (user) {
            getTaskByID();
        }
    }, [user]);


    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setSettingsTask(null);
            setIsExiting(false);
        }, 300); // Match the animation duration
    };


    async function getTaskByID() {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('created_at', params?.time);

            if (error) {
                console.error('Error fetching data:', error);
                return;
            }

            if (data && data.length > 0) {
                setDefaultData(data)
                let matchedTask: tasksType[] = [];
                data.forEach((board: dataType) => {
                    const replaced = settingsTask.replace('task-', "");
                    const matchedTasks = board?.boards.flatMap((itm: boardsType) => {
                        const filteredTasks = itm?.tasks.filter((task: tasksType) => {
                            return String(task?.created_at) === String(replaced);
                        });
                        return filteredTasks || [];
                    });
                    if (matchedTasks.length > 0) {
                        matchedTask = [...matchedTask, ...matchedTasks];
                    }
                });
                if (matchedTask.length > 0) {

                    setFetchedData(matchedTask);
                } else {
                    console.log('No matching task found.');
                }
            }
        } catch (err) {
            console.log('Error in fetching task:', err);
        }
    }

    useEffect(() => {
        if (fetchedData && fetchedData[0]?.title && fetchedData != null && user) {
            setItemName(fetchedData[0]?.title || "")
            setWorkType(fetchedData[0]?.type || "")
            setPriority(fetchedData[0]?.priority || "")
            setWorkEnd(fetchedData[0]?.deadline || "")
            setWorkStart(fetchedData[0]?.start_work || "")
            setAssigne(fetchedData[0]?.assigned_to || user?.email || "")
        }
    }, [fetchedData, user])

    async function findUserByUID(paramsUID: string) {
        if (!paramsUID) return null;

        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('userid', paramsUID);

            if (error) {
                console.error('Error fetching user:', error);
                return <p>Error loading user data</p>;
            }
            if (data) setUserData(data)
        } catch (err) {
            console.error('An error occurred:', err);
            return <p>Error loading user data</p>;
        }
    }

    useEffect(() => {
        if (!fetchedData) return
        const isFound = fetchedData[0]?.created_by;
        findUserByUID(isFound)
    }, [fetchedData]);


    useEffect(() => {
        if (!defaultData) return
        console.log(defaultData[0]?.invited_emails)
    }, [defaultData])

    async function editTask() {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('created_at', params?.time);

            if (error) {
                console.error('Error fetching data:', error);
                return;
            }

            if (data && data.length > 0) {
                let matchedTask: tasksType | null = null; // Set to null initially
                let boardIndex = -1; // Default to -1 for not found
                let taskIndex = -1; // Default to -1 for not found

                // Iterate through the boards to find the matched task
                for (let i = 0; i < data[0].boards.length; i++) {
                    const board = data[0].boards[i];

                    // Check if this board contains the task we are looking for
                    for (let j = 0; j < board.tasks.length; j++) {
                        const task = board.tasks[j];

                        // Assuming `settingsTask` has the format 'task-TIMESTAMP' to match
                        const replaced = settingsTask.replace('task-', "");
                        if (String(task.created_at) === String(replaced)) {
                            matchedTask = task; // Found the matching task
                            boardIndex = i; // Save the board index
                            taskIndex = j; // Save the task index
                            break; // Exit the inner loop once found
                        }
                    }

                    if (matchedTask) {
                        break; // Exit the outer loop if the task is found
                    }
                }

                // Proceed only if we found a matched task
                if (matchedTask && boardIndex !== -1 && taskIndex !== -1) {
                    const updatedTaskData: any = {
                        assigned_to: assignee,
                        deadline: workEnd,
                        priority: priority,
                        start_work: workStart,
                        title: itemName,
                        type: workType,
                        created_at: matchedTask?.created_at
                    };

                    // Update the task in the local array
                    const updatedBoards = [...data[0].boards];
                    const updatedTasks = [...updatedBoards[boardIndex].tasks];

                    // Update the specific task with new data
                    updatedTasks[taskIndex] = { ...matchedTask, ...updatedTaskData };

                    // Update the boards with the modified tasks array
                    updatedBoards[boardIndex].tasks = updatedTasks;

                    // Update the project in Supabase
                    updateTaskInSupabase(updatedBoards);
                } else {
                    console.log('No matching task found.');
                }
            }
        } catch (err) {
            console.log('Error in fetching task:', err);
        }
    }

    async function deleteTask() {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('created_at', params?.time);

            if (error) {
                console.error('Error fetching data:', error);
                return;
            }

            if (data && data.length > 0) {
                let matchedTask: tasksType | null = null; // null initially
                let boardIndex = -1; // Default to -1 for not found
                let taskIndex = -1; // Default to -1 for not found

                // Iterate through the boards to find the matched task
                for (let i = 0; i < data[0].boards.length; i++) {
                    const board = data[0].boards[i];

                    // Check if this board contains the task we are looking for
                    for (let j = 0; j < board.tasks.length; j++) {
                        const task = board.tasks[j];

                        // Assuming `settingsTask` has the format 'task-TIMESTAMP' to match
                        const replaced = settingsTask.replace('task-', "");
                        if (String(task.created_at) === String(replaced)) {
                            matchedTask = task; // Found the matching task
                            boardIndex = i; // Save the board index
                            taskIndex = j; // Save the task index
                            break; // Exit the inner loop once found
                        }
                    }

                    if (matchedTask) {
                        break; // Exit the outer loop if the task is found
                    }
                }

                // Proceed only if we found a matched task
                if (matchedTask && boardIndex !== -1 && taskIndex !== -1) {
                    // Update the boards by removing the matched task
                    const updatedBoards = [...data[0].boards];
                    const updatedTasks = [...updatedBoards[boardIndex].tasks];

                    // Remove the task from the array
                    updatedTasks.splice(taskIndex, 1); // Remove the task at taskIndex

                    // Update the boards with the modified tasks array
                    updatedBoards[boardIndex].tasks = updatedTasks;

                    // Update the project in Supabase
                    updateTaskInSupabase(updatedBoards);
                } else {
                    console.log('No matching task found.');
                }
            }
        } catch (err) {
            console.log('Error in fetching task:', err);
        }
    }


    async function updateTaskInSupabase(updatedBoards: boardsType[]) {
        try {
            const { error } = await supabase
                .from('projects')
                .update({ boards: updatedBoards })
                .eq('created_at', params?.time);

            if (error) {
                console.error('Error updating task:', error);
            } else {
                console.log("edited!")
                setSettingsTask(null)
            }
        } catch (err) {
            console.error('Error updating task:', err);
        }
    }

    return (
        <AnimatePresence>
            {settingsTask && !isExiting && user && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className='ml-auto positioners flex items-center p-3 justify-center w-full h-full'
                    onClick={handleOutsideClick}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        className='w-[450px] h-full bg-[#313131] z-[5000] rounded-lg p-3 overflow-auto border-[#535353] border-[1px] max-h-[600px] flex flex-col justify-between'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='overflow-auto  h-full' >
                            <div className='mb-4'>
                                <div className='text-xl font-bold'>Manage Task</div>
                                <div className='text-sm text-[#888] mt-1'>
                                    Here you can edit, delete, and view other information related to the selected task.
                                </div>
                            </div>
                            <div>
                                {fetchedData && userData && user?.email && defaultData ?
                                    (fetchedData.length > 0) ? (
                                        fetchedData.map((task) => (
                                            <div
                                                className='flex gap-2 flex-col'
                                                key={task.created_at}>
                                                <Input
                                                    type="text"
                                                    placeholder="Board title"
                                                    name="containername"
                                                    value={itemName}
                                                    colorVal={"#fff"}
                                                    onChange={(e) => setItemName(e.target.value)}
                                                />
                                                <div className='w-full flex gap-3 items-center'>


                                                    <>

                                                        <div className='flex gap-1 items-center w-full max-w-[150px]'> <span className='text-xl'><IoIosContact /></span> Assignee</div>
                                                        <select
                                                            value={assignee}
                                                            onChange={(e) => { setAssigne(e.target.value) }}
                                                            name="" id=""
                                                            className='p-2 w-full outline-none bg-[#111111] border-[#535353] border-[1px] rounded-lg flex items-center justify-center cursor-pointer'>
                                                            <option
                                                                className='text-green-500 hover:text-green-500'
                                                                value={"Everyone"}>Everyone</option>
                                                            <option
                                                                className='text-green-500 hover:text-green-500'
                                                                value={user?.email?.toString()}>(me) {user?.email}</option>

                                                            {
                                                                defaultData && defaultData[0]?.invited_emails?.map((itm, idx: number) => (
                                                                    <option
                                                                        key={idx}
                                                                        value={itm?.email}>{itm?.email}</option>
                                                                ))
                                                            }

                                                        </select>
                                                    </>

                                                </div>
                                                <div className='w-full flex gap-3 items-center'>
                                                    <div className='flex gap-1 items-center w-full max-w-[150px]'> <span className='text-xl'><FaLinesLeaning /></span>Priority</div>
                                                    <select
                                                        value={priority}
                                                        onChange={(e) => { setPriority(e.target.value) }}
                                                        className='p-2 w-full bg-[#111111]  border-[#535353] border-[1px] rounded-lg outline-none flex items-center justify-center cursor-pointer'
                                                        name="" id="">
                                                        <option value="">Choose priority</option>
                                                        <option value="High">High</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="Low">Low</option>
                                                    </select>
                                                </div>
                                                <div className='w-full flex gap-3 items-center'>
                                                    <div className='flex gap-1 items-center w-full max-w-[150px]'> <span className='text-xl'><FaLinesLeaning /></span>Type</div>
                                                    <select
                                                        value={workType}
                                                        onChange={(e) => { setWorkType(e.target.value) }}
                                                        className='p-2 w-full bg-[#111111]  border-[#535353] border-[1px] rounded-lg outline-none flex items-center justify-center cursor-pointer'
                                                        name="" id="">
                                                        <option value="">Choose type</option>
                                                        <option value="Future Enhancement">Future Enhancement</option>
                                                        <option value="Bug">Bug</option>
                                                        <option value="Research">Research</option>
                                                        <option value="Maintenance">Maintenance</option>
                                                        <option value="Improvement">Improvement</option>
                                                        <option value="Urgent">Urgent</option>
                                                    </select>
                                                </div>
                                                <div className='w-full flex gap-3 items-center'>
                                                    <div className='flex gap-1 items-center w-full max-w-[150px]'> <span className='text-xl'><BsCalendarDate /></span> Work Start Date</div>
                                                    <input
                                                        value={workStart}
                                                        onChange={(e) => { setWorkStart(e.target.value) }}
                                                        className='p-2 w-full bg-[#111111] border-[#535353] border-[1px] rounded-lg flex  cursor-pointer'
                                                        type="date" />
                                                </div>

                                                <div className='w-full flex gap-3 items-center'>
                                                    <div className='flex gap-1 items-center w-full max-w-[150px]'> <span className='text-xl'><BsCalendarDate /></span> Due Date</div>
                                                    <input
                                                        value={workEnd}
                                                        onChange={(e) => { setWorkEnd(e.target.value) }}
                                                        className='p-2 w-full bg-[#111111] border-[#535353] border-[1px] rounded-lg flex  cursor-pointer'
                                                        type="date" />
                                                </div>
                                                <div className='gap-3 justify-between items-center flex mt-2'>
                                                    <p className='text-sm text-[#888]'>Added by: {userData && userData[0]?.username}</p>
                                                    <p className='text-sm text-[#888]'>
                                                        {task?.created_at
                                                            ? moment(task?.created_at).format('MMMM Do YYYY')
                                                            : 'No date'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No tasks found.</p>
                                    ) :
                                    <div className='w-[20px] h-[20px]'>
                                        <Loader />
                                    </div>
                                }
                            </div>
                        </div>

                        {
                            user &&
                            isAllowed &&
                                fetchedData && (fetchedData[0]?.assigned_to === user?.email || "Everyone" || "") &&
                                !isDelete ?
                                (
                                    <>
                                        <Button
                                            variant={"addBoard"}
                                            onClick={() => { setIsDelete(true) }}
                                        >
                                            Delete Task</Button>

                                        <div className='w-full h-[50px] flex rounded-lg overflow-hidden border-[#535353] border-[1px] mt-2'>

                                            <Button
                                                variant={"withBorderRight"}
                                                onClick={handleOutsideClick}
                                            >
                                                Close</Button>
                                            <Button
                                                variant={"withCancel"}
                                                onClick={editTask}
                                            >
                                                Edit</Button>
                                        </div>
                                    </>
                                ) :
                                (<>

                                    {
                                        isAllowed &&
                                        <div className='w-full h-[45px] flex rounded-lg overflow-hidden border-[#535353] border-[1px] mt-2'>

                                        <Button
                                            variant={"withBorderRight"}
                                            onClick={() => { setIsDelete(false) }}
                                        >
                                            Cancel</Button>
                                        <Button
                                            variant={"withCancel"}
                                            onClick={deleteTask}
                                        >
                                            Delete</Button>
                                    </div>
                                    }
        


                                </>)
                        }

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditTaskProject;
