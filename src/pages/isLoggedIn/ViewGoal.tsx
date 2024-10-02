import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IoChevronBackOutline } from "react-icons/io5";
import NoUserProfile from '../../assets/UserNoProfile.jpg'
import { LuLayoutDashboard } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { supabase } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import { MdDateRange } from "react-icons/md";
import Loader from '../../comps/Loader';
import { GoTasklist } from "react-icons/go";
import { FaPlus } from "react-icons/fa6";
import { GiDna2 } from "react-icons/gi";
import { MdDelete } from "react-icons/md";
import moment from 'moment';
import RetryGoal from '../../comps/System/RetryGoal';

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
    deadline: any;
}



const ViewGoal: React.FC = () => {
    const nav = useNavigate()
    const [user] = IsLoggedIn()
    const params = useParams()
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [newSubTask, setNewSubTask] = useState('');

    const [newHabit, setNewHabit] = useState('');
    const [repHabit, setRepHabit] = useState('');


    const handleInputChange = (e: any) => {
        setNewSubTask(e.target.value);
    };



    const handleHabitInputChange = (e: any) => {
        setNewHabit(e.target.value);
    };


    const addNewSubTask = async (params: string) => {
        console.log("Parameters received:", params); // Log params



        const newSubTaskObj = {
            is_done: false,
            startedAt: new Date().toISOString(),
            subGoal: newSubTask,
        };


        const newHabitObject = {
            repeat: repHabit,
            habit: newHabit,
        };


        console.log(newHabitObject)



        if (fetchedData != null && fetchedData.length > 0 && params != '') {
            const goalId = fetchedData[0]?.id; // Get the goal ID


            if (params === "task") {
                if (!newSubTask) return;
                // Add a new sub-task
                const updatedSubTasks = [...fetchedData[0]?.sub_tasks, newSubTaskObj];

                const { error } = await supabase
                    .from('goals')
                    .update({ sub_tasks: updatedSubTasks })
                    .eq('id', goalId);

                if (error) {
                    console.error("Error adding sub-task:", error);
                } else {
                    console.log("Sub-task added successfully");
                    setNewSubTask(''); // Reset new sub-task input
                }
            } else if (params === "habit") {

                if (!repHabit || !newHabit) return

                console.log("I AM AT HABIT")
                // Add a new habit
                const updatedHabits = [...fetchedData[0]?.habits, newHabitObject];

                const { error } = await supabase
                    .from('goals')
                    .update({ habits: updatedHabits })
                    .eq('id', fetchedData[0]?.id);

                if (error) {
                    console.error("Error adding habit:", error);
                } else {
                    console.log("Habit added successfully");
                    setRepHabit(''); // Reset repeat habit input
                    setNewHabit(''); // Reset new habit input
                }
            }
        } else {
            console.error("No fetched data available to update.");
        }

    };



    useEffect(() => {
        if (user && params) {
            getGoalByIds()
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
    }, [user])




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



    async function getGoalByIds() {
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('userid', params?.uid)
                .eq('created_at', params?.time)

            if (error) {
                console.log(error)
            } else {
                console.log(data)
                setFetchedData(data)
            }

        }
        catch (err) {
            console.log(err)
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


    const [isOpenDate, setIsOpenDate] = useState<boolean>(false)
    const [openDateVal, setOpenDateVal] = useState<string>("")

    function isRenew(deadlineString: string) {
        const deadline = new Date(deadlineString);
        const now = new Date();
        deadline.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        // Calculate difference in time
        const timeDiff = deadline.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff <= 0) {
            return (
                <div
                    onClick={() => { setIsOpenDate(prevs => !prevs) }}
                    className='flex items-start mt-2'>
                    <div
                        className='flex gap-1 items-center bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#535353]'>
                        Retry Goal
                    </div>
                </div>
            )
        }
    }




    async function markSubTasksAsDone(idx: number, boolVal: boolean) {
        try {
            // Fetch the task using the `created_at` identifier
            const { data: task, error } = await supabase
                .from('goals')  // Assuming your table is called 'goals'
                .select('sub_tasks')
                .eq('id', fetchedData && fetchedData[0]?.id)
                .eq('userid', user?.uid)
                .single();


            if (error) throw error;

            if (task) {
                console.log('Fetched task:', task);

                // Ensure the idx is within the bounds of the sub_tasks array
                if (idx < 0 || idx >= task.sub_tasks.length) {
                    console.error("Index out of bounds for sub_tasks array.");
                    return null;
                }

                // Update the specific sub-task's is_done field
                task.sub_tasks[idx].is_done = boolVal;

                console.log(boolVal)

                // Create a new array with the updated sub-task
                const updatedSubTasks = task.sub_tasks.map((subTask: subtaskType, index: number) => {
                    if (index === idx) {
                        return { ...subTask, is_done: boolVal }; // Update the desired sub-task
                    }
                    return subTask; // Return other sub-tasks unchanged
                });


                const allSubTasksDone = updatedSubTasks.every((subTask: subtaskType) => subTask.is_done);
                console.log('Are all sub-tasks done?', allSubTasksDone);

                // Step 3: Update the task in the database
                const { data: updatedTask, error: updateError } = await supabase
                    .from('goals')
                    .update({
                        sub_tasks: updatedSubTasks, // Use the updated array
                        is_done: allSubTasksDone // Update is_done based on sub-tasks
                    })
                    .eq('id', fetchedData && fetchedData[0]?.id)
                    .eq('userid', user?.uid);



                // Log any error from the update operation
                if (updateError) {
                    console.error('Update error:', updateError.message || updateError);
                } else {
                    console.log('Updated task data:', updatedTask);
                }

                return updatedTask;
            } else {
                console.error('No task found with the given created_at ID.');
                return null;
            }
        } catch (error: any) {
            console.error('Error updating sub_task:', error.message || error);
            return null;
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
            return "In progress"
        } else if (daysDiff > 0 && boolVal) {
            return "Completed"
        }

        else {
            return "Failed"
        }
    }


    const [subTaskEdit, setSubTaskEdit] = useState<string>('')
    const [subTaskIdx, setSubTaskIdx] = useState<number | null>(null)


    function getValue(params: string, idx: number) {
        setSubTaskEdit(params || '')
        setSubTaskIdx(idx)
    }


    async function renameTask(idx: number) {

        if (!subTaskEdit) return


        try {
            // Fetch the task using the `created_at` identifier
            const { data: task, error } = await supabase
                .from('goals')  // Assuming your table is called 'goals'
                .select('sub_tasks')
                .eq('id', fetchedData && fetchedData[0]?.id)
                .eq('userid', user?.uid)
                .single();


            if (error) throw error;

            if (task) {
                if (idx < 0 || idx >= task.sub_tasks.length) {
                    console.error("Index out of bounds for sub_tasks array.");
                    return null;
                }

                task.sub_tasks[idx].subGoal = subTaskEdit;

                const updatedSubTasks = task.sub_tasks.map((subTask: subtaskType, index: number) => {
                    if (index === idx) {
                        return { ...subTask, subGoal: subTaskEdit };
                    }
                    return subTask;
                });

                const { data: updatedTask, error: updateError } = await supabase
                    .from('goals')
                    .update({
                        sub_tasks: updatedSubTasks,
                    })
                    .eq('id', fetchedData && fetchedData[0]?.id)
                    .eq('userid', user?.uid);

                if (updateError) {
                    console.error('Update error:', updateError.message || updateError);
                } else {
                    console.log('Updated task data:', updatedTask);
                    setSubTaskIdx(null)
                }

                return updatedTask;
            } else {
                console.error('No task found with the given created_at ID.');
                return null;
            }
        } catch (error: any) {
            console.error('Error updating sub_task:', error.message || error);
            return null;
        }
    }

    const [isDeleteTask, setIsDeleteTask] = useState<number | null>(null)

    async function deleteTask(idx: number) {

        try {
            // Fetch the task using the `created_at` identifier
            const { data: task, error } = await supabase
                .from('goals')  // Assuming your table is called 'goals'
                .select('sub_tasks')
                .eq('id', fetchedData && fetchedData[0]?.id)
                .eq('userid', user?.uid)
                .single();


            if (error) throw error;

            if (task) {
                if (idx < 0 || idx >= task.sub_tasks.length) {
                    console.error("Index out of bounds for sub_tasks array.");
                    return null;
                }

                const updatedSubTasks = task.sub_tasks.filter((_: any, index: number) => index !== idx);

                const { data: updatedTask, error: updateError } = await supabase
                    .from('goals')
                    .update({
                        sub_tasks: updatedSubTasks, // Update with the filtered array
                    })
                    .eq('id', fetchedData && fetchedData[0]?.id)
                    .eq('userid', user?.uid);

                if (updateError) {
                    console.error('Update error:', updateError.message || updateError);
                } else {
                    console.log('Updated task data:', updatedTask);
                    setIsDeleteTask(null); // Reset sub-task index if needed
                }

                return updatedTask;

            } else {
                console.error('No task found with the given created_at ID.');
                return null;
            }
        } catch (error: any) {
            console.error('Error updating sub_task:', error.message || error);
            return null;
        }
    }
    return (
        <div className='w-full h-full'>
            <header className='p-3 flex items-center h-auto pb-2 justify-between border-b-[#535353] border-b-[1px] overflow-auto'>
                <div className='flex items-center h-auto pb-2 justify-between w-full max-w-[1200px] mx-auto'>
                    <div className='flex gap-3 items-center'>
                        <div className='w-[35px] h-[35px] rounded-full overflow-hidden'>
                            <img
                                className='w-full h-full'
                                src={NoUserProfile} alt="" />
                        </div>
                        <div
                            onClick={() => { nav(-1) }}
                            className='flex gap-1 hover:bg-[#535353] items-center bg-[#313131] 
                        border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3'><IoChevronBackOutline /> Back</div>
                    </div>
                    <div className='flex gap-3 items-center'>
                        <div
                            className='flex gap-1 items-center bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#535353]'>
                            Dashboard <LuLayoutDashboard />
                        </div>
                        <div
                            className='flex gap-1 items-center bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-3 md:p-2 px-3 hover:bg-[#535353]'>
                            <span className='hidden md:block'>Settings</span> <IoSettingsOutline />
                        </div>
                    </div>
                </div>
            </header>

            {
                user && fetchedData != null ?
                    (isFailed(fetchedData[0]?.deadline, fetchedData[0]?.is_done) === "Failed") ?
                        <div className='mt-3 mx-auto max-w-[1200px] p-3'>
                            <div className='flex flex-col gap-2'>
                                <div className='text-xl font-bold'>
                                    {fetchedData && fetchedData[0]?.title}
                                </div>
                                <p className='text-sm text-[#888] w-full max-w-[500px]'>
                                    {fetchedData && fetchedData[0]?.description}
                                </p>
                                <p className='text-sm text-[#888] w-full max-w-[500px]'>
                                    {checkDeadlineMet(fetchedData != null && fetchedData[0]?.deadline)}
                                </p>
                                {
                                    isOpenDate &&
                                    <div
                                        onClick={() => { setIsOpenDate(prevDate => !prevDate) }}
                                        className='ml-auto positioners w-full h-full flex justify-center items-center z-30 p-3'>
                                        <RetryGoal closer={setIsOpenDate} />
                                    </div>
                                }
                                <div className='flex gap-3 justify-between'>
                                    {isRenew(fetchedData != null && fetchedData[0]?.deadline)}
                                </div>
                            </div>

                            <div className='w-full h-[20vh] bg-red-700 mt-4 rounded-lg p-3 text-center items-center justify-center flex'>
                                You failed {fetchedData && fetchedData[0]?.title}, you might wanna retry your goal.
                            </div>
                        </div>
                        :
                        <>
                            <>
                                <div className='mt-3 mx-auto max-w-[1200px] p-3'>
                                    <div className='flex flex-col gap-2'>
                                        <div className='text-xl font-bold'>
                                            {fetchedData && fetchedData[0]?.title}
                                        </div>
                                        <p className='text-sm text-[#888] w-full max-w-[500px]'>
                                            {fetchedData && fetchedData[0]?.description}
                                        </p>
                                        <p className='text-sm text-[#888] w-full max-w-[500px]'>
                                            {checkDeadlineMet(fetchedData != null && fetchedData[0]?.deadline)}
                                        </p>
                                        <div className='flex gap-3 justify-between'>
                                            {isRenew(fetchedData != null && fetchedData[0]?.deadline)}
                                        </div>
                                    </div>

                                    <div className='flex flex-col gap-3 h-auto mt-8'>
                                        <div className='text-xl font-bold flex items-center gap-2'>
                                            <GoTasklist />  Tasks
                                        </div>

                                        {
                                            fetchedData != null && fetchedData[0]?.sub_tasks?.map((itm: subtaskType, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className={`${itm?.is_done && 'bg-[#535353]'} flex flex-col gap-2  items-start justify-start bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#535353]`}>
                                                    <div>
                                                        {
                                                            subTaskIdx === idx ?
                                                                <input
                                                                    value={subTaskEdit}
                                                                    maxLength={50}
                                                                    onChange={(e) => { setSubTaskEdit(e.target.value) }}
                                                                    placeholder='Rename your task'
                                                                    className='p-2 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] '
                                                                    type="text" />
                                                                :
                                                                <div className={`${itm?.is_done && 'line-through'} text-md font-bold break-all`}>
                                                                    {itm?.subGoal}
                                                                </div>
                                                        }

                                                        <p className={`${itm?.is_done && 'line-through'}  text-sm text-[#888]`}>
                                                            {itm?.startedAt}
                                                        </p>
                                                        <p className={`${itm?.is_done ? "text-green-500" : "text-orange-500"} text-sm text-[#888]`}>
                                                            {itm?.is_done ? "Completed" : "In progress"}
                                                        </p>
                                                    </div>
                                                    <div className='flex gap-2'>
                                                        {
                                                            idx === subTaskIdx ?
                                                                (<>
                                                                    <div
                                                                        onClick={() => { setSubTaskIdx(null) }}
                                                                        className='flex gap-1 items-center text-red-500 text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>

                                                                        Cancel
                                                                    </div>

                                                                    <div
                                                                        onClick={() => {
                                                                            renameTask(idx)
                                                                        }}
                                                                        className='flex gap-1 items-center text-green-500 text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>

                                                                        Save
                                                                    </div>
                                                                </>)

                                                                : idx === isDeleteTask ?
                                                                    (
                                                                    <>
                                                                     <div
                                                                        onClick={() => { setIsDeleteTask(null) }}
                                                                        className='flex gap-1 items-center text-red-500 text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>

                                                                        Cancel
                                                                    </div>

                                                                    <div
                                                                        onClick={() => {
                                                                            deleteTask(idx)
                                                                        }}
                                                                        className='flex gap-1 items-center text-green-500 text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>

                                                                        Delete
                                                                    </div>
                                                                    </>
                                                                    )
                                                                    :
                                                                    <>
                                                                        <div
                                                                            onClick={() => {
                                                                                markSubTasksAsDone(idx, itm?.is_done ? false : true)
                                                                            }}
                                                                            className='flex gap-1 items-center text-green-500 text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
                                                                            {
                                                                                itm?.is_done ?
                                                                                    <div className='text-[#cc0000]'>
                                                                                        UNDO
                                                                                    </div>
                                                                                    :
                                                                                    "DONE"
                                                                            }
                                                                        </div>
                                                                        <div
                                                                            onClick={() => { getValue(itm?.subGoal, idx) }}
                                                                            className='flex gap-1 items-center  text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
                                                                            EDIT
                                                                        </div>
                                                                        <div
                                                                            onClick={() => { setIsDeleteTask(idx) }}
                                                                            className='flex gap-1 items-center text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
                                                                            DELETE
                                                                        </div>
                                                                    </>
                                                        }
                                                    </div>
                                                </div>
                                            ))
                                        }
                                        <div className='flex items-start'>
                                            <input
                                                type='text'
                                                value={newSubTask}
                                                onChange={handleInputChange} // Call the input change handler
                                                maxLength={50}
                                                placeholder='Enter new task...'
                                                className='flex-grow bg-[#313131] border-[#535353] border-[1px] rounded-lg p-2 text-white'
                                            />
                                            <div
                                                onClick={() => { addNewSubTask("task") }} // Call the function to add the new task
                                                className='flex gap-1 items-center justify-between bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#535353] ml-2'>
                                                <FaPlus /> Add New Task
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex flex-col gap-3 h-auto mt-8'>
                                        <div className='text-xl font-bold flex items-center gap-2'>
                                            <GiDna2 />  Habits
                                        </div>

                                        {
                                            fetchedData != null && fetchedData[0]?.habits?.map((itm: habitsType, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className='flex gap-1  items-center justify-between bg-[#203296] text-[#fff] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#535353]'>
                                                    <div>
                                                        <div className={`text-md font-bold break-all`}>
                                                            {itm?.habit}
                                                        </div>
                                                        <p className={`  text-sm text-[#888]`}>
                                                            {itm?.repeat}
                                                        </p>
                                                    </div>

                                                </div>
                                            ))
                                        }
                                    </div>
                                    <div className='flex items-start mt-3 gap-3'>
                                        <input
                                            type='text'
                                            value={newHabit}
                                            onChange={handleHabitInputChange} // Call the input change handler
                                            placeholder='Enter new habit...'
                                            maxLength={50}
                                            className='flex-grow bg-[#313131] border-[#535353] border-[1px] rounded-lg p-2.5 text-white'
                                        />
                                        <div>
                                            <select
                                                value={repHabit}
                                                onChange={(e) => { setRepHabit(e.target.value) }}
                                                className='p-2.5 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full text-[#888]'
                                                name="" id="">
                                                <option value="">Repetition</option>
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                                <option value="weekday">Every Weekday (Mon-Fri)</option>
                                                <option value="weekend">Every Weekend</option>
                                                <option value="bi-weekly">Bi-weekly</option>
                                                <option value="quarterly">Quarterly</option>
                                                <option value="never">Never</option>
                                            </select>
                                        </div>
                                        <div
                                            onClick={() => { addNewSubTask("habit") }} // Call the function to add the new task
                                            className='flex gap-1 items-center justify-between bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#535353] ml-2'>
                                            <FaPlus /> Add New Habit
                                        </div>
                                    </div>

                                    <div className='mt-7 flex gap-3 justify-between'>
                                        <div>
                                            <div className='font-bold'>Date created</div>
                                            <div className='mt-1 text-[#888] text-sm'>{fetchedData &&
                                                fetchedData[0]?.created_at
                                                ? moment(parseInt(fetchedData[0]?.created_at.toString())).format('MMMM Do YYYY')
                                                : 'No Creation date'
                                            }</div>
                                        </div>

                                        <div className='flex items-start mt-3'>
                                            <div
                                                className='flex gap-1  items-center justify-between bg-[#5e1414]  border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#535353]'>
                                                <MdDelete />  Delete habit
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            </>
                        </>
                    :
                    <div className='p-3 flex items- h-full justify-center'>
                        <div className='w-[30px] h-[30px]'>
                            <Loader />
                        </div>
                    </div>
            }

        </div>
    )
}

export default ViewGoal
