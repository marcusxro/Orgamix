import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IoChevronBackOutline } from "react-icons/io5";
import NoUserProfile from '../../assets/UserNoProfile.jpg'
import { LuLayoutDashboard } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { supabase } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../comps/Utils/IsLoggedIn';
import { MdDateRange } from "react-icons/md";
import Loader from '../../comps/Loader';
import { GoTasklist } from "react-icons/go";
import { FaPlus } from "react-icons/fa6";
import { GiDna2 } from "react-icons/gi";
import { MdDelete } from "react-icons/md";
import moment from 'moment';
import RetryGoal from '../../comps/System/RetryGoal';
import DeleteGoal from '../../comps/System/DeleteGoal';
import { motion, AnimatePresence } from 'framer-motion'


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
    const [user]:any = IsLoggedIn()
    const params = useParams()

    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [fetchedTasks, setFetchedTasks] = useState<subtaskType[] | null>(null);
    const [fetchedHabits, setFetchedHabits] = useState<habitsType[] | null>(null);
    const [searchVal, setSearchVal] = useState("")

    const [newSubTask, setNewSubTask] = useState('');
    const [isEdit, setIsEdit] = useState<number | null>(null)
    const [newHabit, setNewHabit] = useState('');
    const [repHabit, setRepHabit] = useState('');

    const [renameGoal, setRenameGoal] = useState<string>("")
    const [editDescription, setEditDesc] = useState<string>("")
    const [editDate, setEditDate] = useState<string>("")

    const [isDelete, setIsDelete] = useState<boolean>(false)

    function editVals(goal: string, desc: string, newDate: string) {
        setRenameGoal(goal || '')
        setEditDesc(desc || '')
        setEditDate(newDate || '')
    }

    useEffect(() => {
        const filteredTasks = fetchedData && fetchedData[0]?.sub_tasks.filter((itm: subtaskType) => {
            return itm?.subGoal.toLowerCase().includes(searchVal.toLowerCase())
        })
        const filteredHabits = fetchedData && fetchedData[0]?.habits.filter((itm: habitsType) => {
            return itm?.habit.toLowerCase().includes(searchVal.toLowerCase())
        })

        setFetchedTasks(filteredTasks)
        setFetchedHabits(filteredHabits)


    }, [searchVal, fetchedData])


    const handleInputChange = (e: any) => {
        setNewSubTask(e.target.value);
    };

    const handleHabitInputChange = (e: any) => {
        setNewHabit(e.target.value);
    };



    const addNewSubTask = async (params: string) => {
        const newSubTaskObj = {
            is_done: false,
            startedAt: new Date().toISOString(),
            subGoal: newSubTask,
        };


        const newHabitObject = {
            repeat: repHabit,
            habit: newHabit,
        };


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
                    setNewSubTask(''); // Reset new sub-task input
                }
            } else if (params === "habit") {

                if (!repHabit || !newHabit) return
                const updatedHabits = [...fetchedData[0]?.habits, newHabitObject];

                const { error } = await supabase
                    .from('goals')
                    .update({ habits: updatedHabits })
                    .eq('id', fetchedData[0]?.id);

                if (error) {
                    console.error("Error adding habit:", error);
                } else {
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
                .eq('userid', params?.id)
                .eq('created_at', params?.time)

            if (error) {
                console.log(error)
            } else {
                setFetchedData(data)
                setFetchedTasks(data[0]?.sub_tasks)
                setFetchedHabits(data[0]?.habits)
            }

        }
        catch (err) {
            console.log(err)
        }
    }



    function checkDeadlineMet(deadlineString: string, isDone: boolean): JSX.Element {
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
                <div className={`${isDone ? "text-green-500" : "text-[#cc0e00]"} flex gap-1 items-center text-sm`}>
                    <MdDateRange />
                    Deadline Met
                </div>
            );
        } else if (daysDiff > 0) {
            // If the deadline is in the future
            return (
                <div className={`${daysDiff <= 3 && !isDone ? 'text-[#cc8500]' : ''} ${isDone ? 'text-green-500' : ''} text-[#888] text-sm flex gap-1 items-center`}>
                    <MdDateRange />
                    {`${deadlineString} / ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} left`}
                </div>
            );
        } else {
            // If the deadline has passed
            return (
                <div className={`${isDone ? "text-green-500" : "text-[#cc0e00]"} flex gap-1 items-center text-[#888] text-sm`}>
                    <MdDateRange />
                    {`${deadlineString} / ${Math.abs(daysDiff)} ${Math.abs(daysDiff) === 1 ? 'day' : 'days'} ago`}
                </div>
            );
        }
    }


    const [isOpenDate, setIsOpenDate] = useState<boolean>(false)


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
                    className='selectionNone flex items-start mt-2'>
                    <div
                        className='flex gap-1 items-center bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#222222] '>
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
                .eq('userid', user?.id)
                .single();


            if (error) throw error;

            if (task) {

                // Ensure the idx is within the bounds of the sub_tasks array
                if (idx < 0 || idx >= task.sub_tasks.length) {
                    console.error("Index out of bounds for sub_tasks array.");
                    return null;
                }
                // Update the specific sub-task's is_done field
                task.sub_tasks[idx].is_done = boolVal;
                // Create a new array with the updated sub-task
                const updatedSubTasks = task.sub_tasks.map((subTask: subtaskType, index: number) => {
                    if (index === idx) {
                        return { ...subTask, is_done: boolVal }; // Update the desired sub-task
                    }
                    return subTask; // Return other sub-tasks unchanged
                });


                const allSubTasksDone = updatedSubTasks.every((subTask: subtaskType) => subTask.is_done);
                const { data: updatedTask, error: updateError } = await supabase
                    .from('goals')
                    .update({
                        sub_tasks: updatedSubTasks, // Use the updated array
                        is_done: allSubTasksDone // Update is_done based on sub-tasks
                    })
                    .eq('id', fetchedData && fetchedData[0]?.id)
                    .eq('userid', user?.id);



                // Log any error from the update operation
                if (updateError) {
                    console.error('Update error:', updateError.message || updateError);
                } else {
                   
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

        // Calculate difference in days
        const daysDiff = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (boolVal) {
            return "Completed";
        } else if (daysDiff >= 0 && !boolVal) {
            return "In progress";
        } else {
            return "Failed";
        }
    }


    const [subTaskEdit, setSubTaskEdit] = useState<string>('')
    const [subTaskIdx, setSubTaskIdx] = useState<number | null>(null)

    const [habitEdit, setHabitEdit] = useState<string>('')

    const [isHabitDel, setIsHabitDel] = useState<number | null>(null)
    const [isOpenEditOfHabit, setIsOpenHabit] = useState<number | null>(null)
    const [repHabitEdit, setHabitDate] = useState<string>("")

    function getValue(params: string, idx: number) {
        setSubTaskEdit(params || '')
        setSubTaskIdx(idx)
    }




    function getValueOfHabit(params: string, idx: number, dateOfHabit: string) {
        setHabitEdit(params || '')
        setIsOpenHabit(idx)
        setHabitDate(dateOfHabit || '')
    }



    async function renameTask(idx: number) {

        if (!subTaskEdit) return


        try {
            // Fetch the task using the `created_at` identifier
            const { data: task, error } = await supabase
                .from('goals')  // Assuming your table is called 'goals'
                .select('sub_tasks')
                .eq('id', fetchedData && fetchedData[0]?.id)
                .eq('userid', user?.id)
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
                    .eq('userid', user?.id);

                if (updateError) {
                    console.error('Update error:', updateError.message || updateError);
                } else {
                   
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


    async function renameHabit(idx: number) {
        if (!habitEdit || !repHabitEdit) return;

        try {
            const { data: habits, error } = await supabase
                .from('goals')
                .select('habits')
                .eq('id', fetchedData && fetchedData[0]?.id)
                .eq('userid', user?.id)
                .single();

            if (error) throw error;

            if (habits) {
                if (idx < 0 || idx >= habits.habits.length) {
                    console.error("Index out of bounds for habits array.");
                    return null;
                }

                // Update the habit at the specified index
                const updatedHabits = habits.habits.map((habitItem: habitsType, index: number) => {
                    if (index === idx) {
                        return { ...habitItem, habit: habitEdit, repeat: repHabitEdit }; // Correctly update the habit
                    }
                    return habitItem; //return unchanged
                });

                const { data: updatedTask, error: updateError } = await supabase
                    .from('goals')
                    .update({
                        habits: updatedHabits, //save the changes
                    })
                    .eq('id', fetchedData && fetchedData[0]?.id)
                    .eq('userid', user?.id);

                if (updateError) {
                    console.error('Update error:', updateError.message || updateError);
                } else {
                 
                    setIsOpenHabit(null);
                }

                return updatedTask;
            } else {
                console.error('No task found with the given ID.');
                return null;
            }
        } catch (error: any) {
            console.error('Error updating habit:', error.message || error);
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
                .eq('userid', user?.id)
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
                    .eq('userid', user?.id);

                if (updateError) {
                    console.error('Update error:', updateError.message || updateError);
                } else {
                  
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




    async function deleteHabit(idx: number) {

        try {
            const { data: habits, error } = await supabase
                .from('goals')
                .select('habits')
                .eq('id', fetchedData && fetchedData[0]?.id)
                .eq('userid', user?.id)
                .single();


            if (error) throw error;

            if (habits) {
                if (idx < 0 || idx >= habits.habits.length) {
                    console.error("Index out of bounds for sub_tasks array.");
                    return null;
                }

                const updatedHabits = habits.habits.filter((_: any, index: number) => index !== idx);


                const { data: updatedTask, error: updateError } = await supabase
                    .from('goals')
                    .update({
                        habits: updatedHabits,
                    })
                    .eq('id', fetchedData && fetchedData[0]?.id)
                    .eq('userid', user?.id);

                if (updateError) {
                    console.error('Update error:', updateError.message || updateError);
                } else {
                  
                    setIsHabitDel(null); // Reset sub-task index if needed
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
    const [errorText, setErrorText] = useState<null | string>("")

    async function editDocument() {
        if (renameGoal === "") {
            setErrorText("Please enter a title");
            return
        }
        if (editDate === "") {
            setErrorText("Please add deadline");
            return
        }

        const selectedDate = new Date(editDate);
        const currentDate = new Date();

        if (selectedDate < currentDate) {
            setErrorText("The selected date has already passed.");
            return; // Exit the function if the date has passed
        }

        try {
            // Fetch the original goal to check its title
            const { data: originalGoal, error: fetchOriginalError } = await supabase
                .from('goals')
                .select('title')
                .eq('created_at', params?.time)
                .single();

            if (fetchOriginalError) {
                console.error('Error fetching original goal:', fetchOriginalError.message);
                return;
            }

            // Check for existing goals with the same title (except for the original one)
            const { data: existingGoals, error: fetchError } = await supabase
                .from('goals')
                .select('title')
                .like('title', `${renameGoal}%`)
                .neq('created_at', params?.time); // Ensure the current goal is excluded

            if (fetchError) {
                console.error('Error fetching existing goals:', fetchError.message);
                return;
            }

            // Determine the new title with an index if necessary
            let newTitle = renameGoal;


            if (existingGoals.length > 0 && originalGoal.title !== renameGoal) {
                // Filter for titles that match `renameGoal` exactly or follow the "renameGoal (index)" pattern
                const exactMatches = existingGoals.filter(itm =>
                    itm?.title === renameGoal || itm?.title.startsWith(`${renameGoal} (`));

                if (exactMatches.length > 0) {
                    // Find the highest index in similar exact titles
                    const maxIndex = exactMatches.reduce((acc, itm) => {
                        const match = itm.title.match(/\((\d+)\)$/); // Check for pattern "renameGoal (index)"
                        const index = match ? parseInt(match[1], 10) : 0;
                        return Math.max(acc, index);
                    }, 0);

                    // Set `newTitle` with the incremented index
                    newTitle = `${renameGoal} (${maxIndex + 1})`;
                }
            }


            const { error } = await supabase
                .from('goals')
                .update({
                    title: newTitle,
                    description: editDescription,
                    deadline: editDate
                })
                .eq('userid', params?.id)
                .eq('created_at', params?.time);

            if (error) {
                console.log(error);
                setErrorText("Error occured, please try again later")
            } else {
                console.log("Goal successfully edited");
                setRenameGoal("");
                setEditDesc("");
                setEditDate("");
                setIsEdit(null);
                setErrorText(null)
            }
        } catch (err) {
            console.log(err);
            setErrorText("Error occured, please try again later")
        }
    }



    return (
        <div className='w-full h-full selectionNone'>

            {
                isDelete &&
                <DeleteGoal titleOfGoal={fetchedData && fetchedData[0]?.title} closer={setIsDelete} />

            }

            <header className='selectionNone p-3 flex items-center h-auto pb-2 justify-between border-b-[#535353] border-b-[1px] overflow-auto'>
                <div className='flex items-center h-auto pb-2 justify-between w-full max-w-[1200px] mx-auto'>
                    <div className='flex gap-3 items-center'>
                        <div className='w-[35px] h-[35px] rounded-full overflow-hidden'>
                            <img
                                className='w-full h-full'
                                src={NoUserProfile} alt="" />
                        </div>
                        <div
                            onClick={() => { nav(-1) }}
                            className='selectionNone flex gap-1 hover:bg-[#222222]  items-center bg-[#313131] 
                           border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3'><IoChevronBackOutline /> Back</div>
                    </div>
                    <div className='flex gap-3 items-center'>
                        <div
                            onClick={() => { nav('/user/dashboard') }}
                            className='flex gap-1 items-center bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#222222] '>
                            Dashboard <LuLayoutDashboard />
                        </div>
                        <div
                        onClick={() => { nav(`/user/settings`) }}
                            className='flex gap-1 items-center bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-3 md:p-2 px-3 hover:bg-[#222222] '>
                            <span className='hidden md:block'>Settings</span> <IoSettingsOutline />
                        </div>
                    </div>
                </div>
            </header>
       
            {
                user?.id === params.id && fetchedData != null ?
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
                                    {checkDeadlineMet(fetchedData != null && fetchedData[0]?.deadline, fetchedData[0]?.is_done)}
                                </p>

                                {
                                    isOpenDate &&
                                    <RetryGoal closer={setIsOpenDate} />
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
                                <div className='mt-3 mx-auto max-w-[1200px] flex min-h-[90dvh] flex-col  justify-between  p-3'>
                                    <div>
                                        <div className='flex h-auto flex-col gap-2'>
                                            {
                                                isEdit === fetchedData[0]?.created_at ?
                                                    <div className='w-full max-w-[400px]'>
                                                        <input
                                                            value={renameGoal}
                                                            maxLength={50}
                                                            onChange={(e) => { setRenameGoal(e.target.value) }}
                                                            placeholder='Rename your goal'
                                                            className='p-3 rounded-lg bg-[#111111] w-full outline-none border-[#535353] border-[1px]'
                                                            type="text" />
                                                    </div>
                                                    :
                                                    <div className='text-xl font-bold'>
                                                        {fetchedData && fetchedData[0]?.title}
                                                    </div>
                                            }
                                            {
                                                isEdit === fetchedData[0]?.created_at ?
                                                    <div className='w-full max-w-[400px] h-full min-h-[200px] flex'>
                                                        <textarea
                                                            value={editDescription}
                                                            maxLength={300}
                                                            onChange={(e) => { setEditDesc(e.target.value) }}
                                                            className='p-3 rounded-lg w-full h-100 resize-none bg-[#111111] outline-none border-[#535353] border-[1px]'
                                                            placeholder='Description'></textarea>
                                                    </div>
                                                    :
                                                    <p className='text-sm text-[#888] w-full max-w-[500px]'>
                                                        {fetchedData && fetchedData[0]?.description}
                                                    </p>
                                            }
                                            {
                                                isEdit === fetchedData[0]?.created_at ?
                                                    <div className='w-full max-w-[150px]'>
                                                        <input
                                                            value={editDate}
                                                            maxLength={50}
                                                            onChange={(e) => { setEditDate(e.target.value) }}
                                                            className='p-3 rounded-lg bg-[#111111] w-full outline-none border-[#535353] border-[1px]'
                                                            type="date" />
                                                    </div>
                                                    :

                                                    <p className='text-sm text-[#888] w-full max-w-[500px]'>
                                                        {checkDeadlineMet(fetchedData != null && fetchedData[0]?.deadline, fetchedData[0]?.is_done)}
                                                    </p>
                                            }
                                            {
                                                errorText != null &&
                                                <div className='text-red-500'>
                                                    {errorText}
                                                </div>
                                            }
                                            <div className='flex items-start gap-2'>

                                                {
                                                    (isEdit !== null && isEdit === fetchedData[0]?.created_at) ?
                                                        <>
                                                            <div
                                                                onClick={() => { setIsEdit(null) }}
                                                                className='selectionNone flex gap-1 items-center text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 hover:bg-[#535353] '>
                                                                Cancel
                                                            </div>
                                                            <div
                                                                onClick={() => { editDocument() }}
                                                                className='selectionNone flex text-green-500 gap-1 items-center text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 hover:bg-[#535353] '>
                                                                Save
                                                            </div>
                                                        </>
                                                        :
                                                        <div
                                                            onClick={() => { setIsEdit(fetchedData && fetchedData[0]?.created_at); editVals(fetchedData[0]?.title, fetchedData[0]?.description, fetchedData[0]?.deadline) }}
                                                            className='selectionNone flex gap-1 items-center text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 hover:bg-[#535353] '>
                                                            EDIT
                                                        </div>
                                                }


                                            </div>

                                            <div className='flex gap-3 justify-between'>
                                                {isRenew(fetchedData != null && fetchedData[0]?.deadline)}
                                            </div>
                                        </div>

                                        <div className='flex flex-col gap-3 h-auto mt-4'>
                                            <div className='flex gap-3 justify-between items-center'>
                                                <div className='text-xl font-bold flex items-center gap-2'>
                                                    <GoTasklist />  Tasks
                                                </div>

                                                <input
                                                    value={searchVal}
                                                    maxLength={50}
                                                    onChange={(e) => { setSearchVal(e.target.value) }}
                                                    placeholder='Search your task or habits'
                                                    className='p-2 rounded-lg bg-[#111111] w-full max-w-[300px] outline-none border-[#535353] border-[1px]'
                                                    type="text" />

                                            </div>
                                            <AnimatePresence>
                                                {
                                                    fetchedData != null &&
                                                    fetchedTasks != null &&
                                                    fetchedTasks.length === 0 &&
                                                    <div className='text-sm text-[#888]'>No result</div>
                                                }
                                                {
                                                    fetchedData != null &&
                                                    fetchedTasks != null &&
                                                    fetchedTasks?.map((itm: subtaskType, idx: number) => (
                                                        <motion.div
                                                            layout
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 10 }}
                                                            transition={{ duration: 0.3 }}
                                                            key={idx}
                                                            className={`${itm?.is_done && 'bg-[#535353]'} overflow-hidden flex flex-col gap-2  items-start justify-start bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#222222] `}>
                                                            <div>
                                                                {
                                                                    subTaskIdx === idx ?
                                                                        <input
                                                                            value={subTaskEdit}
                                                                            maxLength={50}
                                                                            onChange={(e) => { setSubTaskEdit(e.target.value) }}
                                                                            placeholder='Rename your task'
                                                                            className='p-2 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px]'
                                                                            type="text" />
                                                                        :
                                                                        <div className={`${itm?.is_done && 'line-through'} text-md font-bold break-all`}>
                                                                            {itm?.subGoal}
                                                                        </div>
                                                                }

                                                                <p className={`${itm?.is_done && 'line-through'}  text-sm text-[#888]`}>
                                                                {itm?.startedAt ? moment(itm.startedAt).format("YYYY-MM-DD hh:mm A") : ""}
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
                                                                                className='selectionNone flex gap-1 items-center text-red-500 text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 hover:bg-[#535353] '>

                                                                                Cancel
                                                                            </div>

                                                                            <div
                                                                                onClick={() => {
                                                                                    renameTask(idx)
                                                                                }}
                                                                                className='selectionNone flex gap-1 items-center text-green-500 text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 hover:bg-[#535353] '>

                                                                                Save
                                                                            </div>
                                                                        </>)

                                                                        : idx === isDeleteTask ?
                                                                            (
                                                                                <>
                                                                                    <div
                                                                                        onClick={() => { setIsDeleteTask(null) }}
                                                                                        className='selectionNone flex gap-1 items-center text-red-500 text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 hover:bg-[#535353]'>

                                                                                        Cancel
                                                                                    </div>

                                                                                    <div
                                                                                        onClick={() => {
                                                                                            deleteTask(idx)
                                                                                        }}
                                                                                        className='selectionNone flex gap-1 items-center text-green-500 text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 hover:bg-[#535353] '>

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
                                                                                    className='selectionNone flex gap-1 items-center text-green-500 text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 hover:bg-[#535353] '>
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
                                                                                    className='selectionNone flex gap-1 items-center  text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 hover:bg-[#535353]'>
                                                                                    EDIT
                                                                                </div>
                                                                                <div
                                                                                    onClick={() => { setIsDeleteTask(idx) }}
                                                                                    className='selectionNone flex gap-1 items-center text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 hover:bg-[#535353]'>
                                                                                    DELETE
                                                                                </div>
                                                                            </>
                                                                }
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                }
                                            </AnimatePresence>
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
                                                    className='selectionNone flex gap-1 items-center justify-between bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-3 px-3 hover:bg-[#222222]  ml-2'>
                                                    <FaPlus />
                                                </div>
                                            </div>
                                        </div>

                                        <div className='flex flex-col gap-3 h-auto mt-8'>
                                            <div className='text-xl font-bold flex items-center gap-2'>
                                                <GiDna2 />  Habits
                                            </div>

                                            <AnimatePresence>
                                                {
                                                    fetchedData != null &&
                                                    fetchedHabits != null &&
                                                    fetchedHabits.length === 0 &&
                                                    <div className='text-sm text-[#888]'>No result</div>
                                                }
                                                {
                                                    fetchedData != null &&
                                                    fetchedTasks != null &&
                                                    fetchedHabits?.map((itm: habitsType, idx: number) => (
                                                        <motion.div
                                                            layout
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 10 }}
                                                            transition={{ duration: 0.3 }}
                                                            key={idx}
                                                            className='flex gap-1 flex-col overflow-auto  items-start justify-between bg-[#1a1a1a] text-[#fff] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#222222] '>
                                                            <div>
                                                                <div className={`text-md font-bold break-all`}>
                                                                    {
                                                                        idx === isOpenEditOfHabit ?
                                                                            <input
                                                                                value={habitEdit}
                                                                                maxLength={50}
                                                                                onChange={(e) => { setHabitEdit(e.target.value) }}
                                                                                placeholder='Rename your task'
                                                                                className='p-2 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px]'
                                                                                type="text" />
                                                                            :
                                                                            itm?.habit
                                                                    }
                                                                </div>
                                                                <p className={`  text-sm text-[#888]`}>

                                                                    {
                                                                        idx === isOpenEditOfHabit
                                                                            ?
                                                                            <select
                                                                                value={repHabitEdit}
                                                                                onChange={(e) => { setHabitDate(e.target.value) }}
                                                                                className='p-3 rounded-lg bg-[#111111] outline-none mt-2 border-[#535353] border-[1px] w-full text-[#888]'
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
                                                                            :
                                                                            itm?.repeat
                                                                    }
                                                                </p>
                                                            </div>

                                                            <div className='mt-2 flex gap-2'>
                                                                {
                                                                    idx === isOpenEditOfHabit ?
                                                                        (
                                                                            <>
                                                                                <div
                                                                                    onClick={() => { setIsOpenHabit(null) }}
                                                                                    className='selectionNone hover:bg-[#535353] flex gap-1 items-center  text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
                                                                                    Cancel
                                                                                </div>
                                                                                <div
                                                                                    onClick={() => { renameHabit(idx) }}
                                                                                    className='selectionNone hover:bg-[#535353] flex gap-1 items-center text-center text-green-500 bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
                                                                                    Save
                                                                                </div>
                                                                            </>
                                                                        )
                                                                        :
                                                                        idx === isHabitDel ?
                                                                            (
                                                                                <>
                                                                                    <div
                                                                                        onClick={() => { setIsHabitDel(null) }}
                                                                                        className='selectionNone hover:bg-[#535353] flex gap-1 items-center  text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
                                                                                        Cancel
                                                                                    </div>
                                                                                    <div
                                                                                        onClick={() => { deleteHabit(idx) }}
                                                                                        className='selectionNone hover:bg-[#535353] flex gap-1 items-center text-center text-green-500 bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
                                                                                        Delete
                                                                                    </div>
                                                                                </>
                                                                            )
                                                                            :

                                                                            <>
                                                                                <div
                                                                                    onClick={() => { getValueOfHabit(itm?.habit, idx, itm?.repeat) }}
                                                                                    className='selectionNone hover:bg-[#535353] flex gap-1 items-center  text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
                                                                                    Edit
                                                                                </div>
                                                                                <div
                                                                                    onClick={() => { setIsHabitDel(idx) }}
                                                                                    className='selectionNone hover:bg-[#535353] flex gap-1 items-center text-center text-red-500 bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
                                                                                    Delete
                                                                                </div>
                                                                            </>
                                                                }
                                                            </div>

                                                        </motion.div>
                                                    ))
                                                }
                                            </AnimatePresence>
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
                                                className='flex gap-1 items-center justify-between bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-3  px-3 hover:bg-[#222222]  ml-2'>
                                                <FaPlus />
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

            {
                fetchedData &&
                <div className='mx-auto max-w-[1200px] flex flex-col  justify-between  p-3'>
                    <div className='mt-7 flex gap-3 justify-between bg-[#111111] p-3 rounded-lg items-center'>
                        <div>
                            <div className='font-bold'>Date created</div>
                            <div className='mt-1 text-[#888] text-sm'>{fetchedData &&
                                fetchedData[0]?.created_at
                                ? moment(parseInt(fetchedData[0]?.created_at.toString())).format('MMMM Do YYYY')
                                : 'No Creation date'
                            }</div>
                        </div>

                        <div className='flex items-start'>
                            <div
                                onClick={() => { setIsDelete(prev => !prev) }}
                                className='selectionNone flex gap-1  items-center justify-between bg-[#5e1414]  border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#222222] '>
                                <MdDelete />  Delete goal
                            </div>
                        </div>
                    </div>
                </div>
            }

        </div>
    )
}

export default ViewGoal
