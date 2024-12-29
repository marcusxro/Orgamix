import React, {useEffect, useState } from 'react';
import useStore from '../../../Utils/Zustand/UseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../Utils/supabase/supabaseClient';
import { IoIosContact } from "react-icons/io";
import { FaLinesLeaning } from "react-icons/fa6";
import { BsCalendarDate } from "react-icons/bs";
import Input from '../Input';
import { Button } from '../Button';
import Loader from '../../../Svg/Loader';
import moment from 'moment'
import { IoMdAdd } from "react-icons/io";
import IsLoggedIn from '../../../Utils/IsLoggedIn';

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




interface Subtask {
    id: number;
    description: string;
    completed: boolean;
}

interface tasksType {
    title: string;
    created_at: number;
    created_by: string;
    priority: string;
    type: string;
    start_work: string;
    deadline: string;
    assigned_to: string; //uid basis
    subTasks: Subtask[]
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

const EditTaskProject: React.FC<isAllowedType> = ({ isAllowed }) => {
    const { settingsTask, setSettingsTask }: any = useStore();
    const [isExiting, setIsExiting] = useState(false);
    const params = useParams()
    const [fetchedData, setFetchedData] = useState<tasksType[] | null>(null);
    const [defaultData, setDefaultData] = useState<dataType[] | null>(null);

    const [userData, setUserData] = useState<userType[] | null>(null)
    const [user]:any = IsLoggedIn()

    const [itemName, setItemName] = useState('');
    const [assignee, setAssigne] = useState<string>(user?.email || "")
    const [priority, setPriority] = useState<string>("")
    const [workStart, setWorkStart] = useState<string>("")
    const [workEnd, setWorkEnd] = useState<string>("")
    const [workType, setWorkType] = useState<string>("")

    const [isDelete, setIsDelete] = useState<boolean>(false)
    const { loading, setLoading }: any = useStore()




    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtask, setNewSubtask] = useState<string>("");
    const [isEditing, setIsEditing] = useState<number | null>(null); // Track the ID of the subtask being edited
    const [editedTask, setEditedTask] = useState<string>("");


    const addSubtask = () => {
        if (newSubtask.trim()) {
            const newTask: Subtask = {
                id: Date.now(), // Unique ID based on timestamp
                description: newSubtask,
                completed: false,
            };
            setSubtasks([...subtasks, newTask]);
            setNewSubtask(""); // Clear input after adding
        }
    };

    const deleteSubtask = (id: number) => {
        const updatedSubtasks = subtasks.filter(subtask => subtask.id !== id);
        setSubtasks(updatedSubtasks);
    };

    const toggleCompletion = (id: number) => {
        const updatedSubtasks = subtasks.map(subtask =>
            subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
        );
        setSubtasks(updatedSubtasks);
    };


    const startEditing = (id: number, description: string) => {
        setIsEditing(id);
        setEditedTask(description);
    };

    const saveEditedTask = (id: number) => {
        if (!editedTask) return

        const updatedSubtasks = subtasks.map(subtask =>
            subtask.id === id ? { ...subtask, description: editedTask } : subtask
        );
        setSubtasks(updatedSubtasks);
        setIsEditing(null); // Exit editing mode
        setEditedTask("");
    };


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
            setSubtasks(fetchedData[0]?.subTasks)
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
    }, [defaultData])

    async function editTask() {
        setLoading(true);
    
        if (loading) {
            return;
        }
    
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('created_at', params?.time);
    
            if (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
                return;
            }
    
            if (data && data.length > 0) {
                let matchedTask: tasksType | null = null;
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
                    // Fetch all task titles to check for duplicates
                    const allTaskTitles = data[0].boards.flatMap((board: boardsType) => 
                        board.tasks.map((task: tasksType) => task.title)
                    );
    
                    // Check for duplicates only if it's not the task being edited
                    const isEditingSameTask = matchedTask.title === itemName;
                    let finalTitle;
    
                    if (isEditingSameTask) {
                        // If editing the same task, use the original title
                        finalTitle = itemName; 
                    } else {
                        // Otherwise, count how many tasks start with itemName
                        const filteredTitles = allTaskTitles.filter((title: string) => title !== matchedTask.title);
                        const matchingTasks = filteredTitles.filter((title: string) => title.startsWith(itemName));
                        const taskIndexSuffix = matchingTasks.length > 0 ? `(${matchingTasks.length + 1})` : "";
    
                        // Create the final title with index
                        finalTitle = `${itemName}${taskIndexSuffix}`;
                    }
    
                    const updatedTaskData: any = {
                        assigned_to: assignee,
                        deadline: workEnd,
                        priority: priority,
                        start_work: workStart,
                        title: finalTitle, // Use the title without the new index if it's the same task
                        type: workType,
                        created_at: matchedTask.created_at,
                        subTasks: subtasks
                    };
    
                    // Update the task in the local array
                    const updatedBoards = [...data[0].boards];
                    const updatedTasks = [...updatedBoards[boardIndex].tasks];
    
                    // Update the specific task with new data
                    updatedTasks[taskIndex] = { ...matchedTask, ...updatedTaskData };
    
                    // Update the boards with the modified tasks array
                    updatedBoards[boardIndex].tasks = updatedTasks;
    
                    // Update the project in Supabase
                    await updateTaskInSupabase(updatedBoards);
                    setLoading(false);
                    console.log('Task updated successfully!');
                } else {
                    console.log('No matching task found.');
                    setLoading(false);
                }
            }
        } catch (err) {
            console.log('Error in fetching task:', err);
            setLoading(false);
        }
    }
    
    
    async function deleteTask() {
        setLoading(true)

        if (loading) {
            return
        }

        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('created_at', params?.time);

            if (error) {
                console.error('Error fetching data:', error);
                setLoading(false)
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
                    setLoading(false)
                } else {
                    console.log('No matching task found.');
                    setLoading(false)
                }
            }
        } catch (err) {
            console.log('Error in fetching task:', err);
            setLoading(false)
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
                        className='w-[450px] h-full bg-[#313131] z-[5000] rounded-lg p-3 overflow-auto border-[#535353] border-[1px] max-h-[700px] flex flex-col justify-between'
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
                                        fetchedData.map((task: tasksType) => (
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

                                                <div className='flex flex-col gap-2  py-3 mb-2 border-t-[#888] border-t-[1px]'>
                                                        <div className='flex flex-col'>
                                                            <div>Subtasks</div>
                                                            <div className='text-sm text-[#888]'>Break down tasks into smaller steps. Track progress by checking off completed items.</div>
                                                        </div>

                                                        {
                                                            isAllowed && user &&
                                                            fetchedData && (fetchedData[0]?.assigned_to === user?.email || "Everyone" || "") &&
                                                            <div className="flex gap-2 mt-2">
                                                                <input
                                                                    type="text"
                                                                    value={newSubtask}
                                                                    onChange={(e) => setNewSubtask(e.target.value)}
                                                                    placeholder="Enter subtask"
                                                                    className='p-2 w-full bg-[#111111] border-[#535353] border-[1px] rounded-lg flex outline-none '

                                                                />
                                                                <button onClick={addSubtask}
                                                                    className='p-2 px-4 text-[#888]  gap-2 text-sm items-center hover:bg-[#222] flex bg-[#111111] border-[#535353] border-[1px] rounded-lg   cursor-pointer'>
                                                                    <span>Add</span> <IoMdAdd />
                                                                </button>
                                                            </div>
                                                        }


                                                        <div className="mt-4 flex flex-col gap-2">
                                                            {task?.subTasks.length > 0 || subtasks.length > 0 ? (
                                                                subtasks.map((subtask) => (
                                                                    <div key={subtask.id} className="flex items-center bg-[#222] rounded-md justify-between py-1">
                                                                        <div className='flex gap-2 p-2 items-center'>
                                                                            {
                                                                                isAllowed &&
                                                                                fetchedData && (fetchedData[0]?.assigned_to === user?.email || "Everyone" || "") &&
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={subtask.completed}
                                                                                    onChange={() => toggleCompletion(subtask.id)}
                                                                                />
                                                                            }

                                                                            <div className='flex flex-col items-start justify-start'>
                                                                                <div className="flex items-center gap-2">
                                                                                    <div>
                                                                                    </div>
                                                                                    {isEditing === subtask.id ? (
                                                                                        isAllowed &&
                                                                                        fetchedData && (fetchedData[0]?.assigned_to === user?.email || "Everyone" || "") &&

                                                                                        <input
                                                                                            type="text"
                                                                                            value={editedTask}
                                                                                            onChange={(e) => setEditedTask(e.target.value)}
                                                                                            className="border p-1 rounded-md px-2 outline-none"
                                                                                        />
                                                                                    ) : (
                                                                                        <span
                                                                                            className={subtask.completed ? 'line-through text-gray-400 cursor-pointer' : 'cursor-pointer'}
                                                                                            onClick={() => isAllowed &&
                                                                                                fetchedData && (fetchedData[0]?.assigned_to === user?.email || "Everyone" || "") && startEditing(subtask.id, subtask.description)}
                                                                                        >
                                                                                            {subtask.description}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className='text-sm text-[#888] px-2'>
                                                                                    {subtask.id ? moment(subtask.id).format('MM/DD/YY, h:mm A') : 'No Creation date'}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {
                                                                            isAllowed &&
                                                                            fetchedData && (fetchedData[0]?.assigned_to === user?.email || "Everyone" || "") &&
                                                                            <div className="flex gap-2 m-2">
                                                                                {isEditing === subtask.id ? (
                                                                                    <button
                                                                                        onClick={() => saveEditedTask(subtask.id)}
                                                                                        className="text-green-500 hover:text-green-700"
                                                                                    >
                                                                                        Save
                                                                                    </button>
                                                                                ) : (
                                                                                    <button
                                                                                        onClick={() => deleteSubtask(subtask.id)}
                                                                                        className="text-red-500 hover:text-red-700"
                                                                                    >
                                                                                        Delete
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="text-sm text-[#888]">No subtasks available</div>
                                                            )}
                                                        </div>

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
                                            Delete Task
                                        </Button>

                                        <div className='w-full h-[50px] flex rounded-lg overflow-hidden border-[#535353] border-[1px] mt-2'>

                                            <Button
                                                variant={"withBorderRight"}
                                                onClick={() => { !loading && handleOutsideClick() }}
                                            >
                                                Close</Button>
                                            <Button
                                                variant={"withCancel"}
                                                onClick={() => { !loading && editTask() }}
                                            >
                                                {
                                                    loading ?
                                                        <div className='w-[20px] h-[20px]'>
                                                            <Loader />
                                                        </div>
                                                        :
                                                        'Edit'
                                                }
                                            </Button>
                                        </div>
                                    </>
                                ) :
                                (<>

                                    {
                                        isAllowed &&
                                        <div className='w-full h-[45px] flex rounded-lg overflow-hidden border-[#535353] border-[1px] mt-2'>

                                            <Button
                                                variant={"withBorderRight"}
                                                onClick={() => { !loading && setIsDelete(false) }}
                                            >
                                                Cancel</Button>
                                            <Button
                                                variant={"withCancel"}
                                                onClick={deleteTask}
                                            >
                                                {
                                                    loading ?
                                                        <div className='w-[20px] h-[20px]'>
                                                            <Loader />
                                                        </div>
                                                        :
                                                        'Delete'
                                                }
                                            </Button>
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
