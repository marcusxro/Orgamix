import { useEffect, useState } from 'react'
import useStore from '../Utils/Zustand/UseStore'
import { supabase } from '../Utils/supabase/supabaseClient'
import IsLoggedIn from '../Utils/IsLoggedIn'
import { FaPlus } from "react-icons/fa6";
import { GoTasklist } from "react-icons/go";
import { GiDna2 } from "react-icons/gi";
import Loader from '../Loader';
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
    deadline: string;
}

const UploadImport = () => {
    const { createdAt, setCreatedAt, setShowCreate } = useStore()
    const [user]:any = IsLoggedIn()
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [title, setTitle] = useState<string>('');
    const [description, setDesc] = useState<string>('');
    const [category, setCat] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false)
    const [isExiting, setIsExiting] = useState(false);

    const handleOutsideClick = (params: string) => {
        setIsExiting(true);
        setTimeout(() => {
            setShowCreate(params);
            setIsExiting(false);
        }, 100);
    };

    const handleHabitInputChange = (e: any) => {
        setNewHabit(e.target.value);
    };


    useEffect(() => {
        if (fetchedData && fetchedData.length > 0 && !title && !description && !category) {
            setTitle(fetchedData[0].title || '');
            setDesc(fetchedData[0].description || '');
            setCat(fetchedData[0].category || '');
        }
    }, [fetchedData]);

    useEffect(() => {
        if (user) {
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
                .eq('userid', user?.id)
                .eq('created_at', createdAt)

            if (error) {
                console.log(error)
            } else {
                setFetchedData(data)
            }
        }
        catch (err) {
            console.log(err)
        }
    }


    useEffect(() => {
        console.log(title)
    }, [title])



    const [subTaskEdit, setSubTaskEdit] = useState<string>('')
    const [subTaskIdx, setSubTaskIdx] = useState<number | null>(null)
    const [newSubTask, setNewSubTask] = useState('');

    const [habitEdit, setHabitEdit] = useState<string>('')

    const [isHabitDel, setIsHabitDel] = useState<number | null>(null)
    const [isOpenEditOfHabit, setIsOpenHabit] = useState<number | null>(null)
    const [repHabitEdit, setHabitDate] = useState<string>("")


    const [repHabit, setRepHabit] = useState('');
    const [newHabit, setNewHabit] = useState('');



    function getValue(params: string, idx: number) {
        setSubTaskEdit(params || '')
        setSubTaskIdx(idx)
    }


    const handleInputChange = (e: any) => {
        setNewSubTask(e.target.value);
    };


    function getValueOfHabit(params: string, idx: number, dateOfHabit: string) {
        setHabitEdit(params || '')
        setIsOpenHabit(idx)
        setHabitDate(dateOfHabit || '')
    }


    function renameTask(idx: number) {
        if (!subTaskEdit) return;

        if (fetchedData != null && fetchedData.length > 0) {
            // Get the current sub-tasks from the first item in fetchedData
            const currentSubTasks = fetchedData[0]?.sub_tasks;

            // Check if the index is within bounds
            if (idx < 0 || idx >= currentSubTasks.length) {
                console.error("Index out of bounds for sub_tasks array.");
                return;
            }

            const isMatch = fetchedData[0].sub_tasks.some((itmz: subtaskType) => itmz.subGoal.toLowerCase() === subTaskEdit.toLowerCase());

            // Check if the subGoal is already equal to subTaskEdit
            if (isMatch) {
                console.log("NsubGoal is already equal to some title.");
                return;
            }

            // Update the sub-task at the specified index
            const updatedSubTasks = currentSubTasks.map((subTask: subtaskType, index: number) => {
                if (index === idx) {
                    return { ...subTask, subGoal: subTaskEdit }; // Correctly update the sub-task
                }
                return subTask; // Return unchanged sub-task
            });

            // Update the fetchedData state with the new sub-tasks
            const updatedData = fetchedData.map((goal) =>
                goal.id === fetchedData[0]?.id ? { ...goal, sub_tasks: updatedSubTasks } : goal
            );

            // Set the updated data in state
            setFetchedData(updatedData);

            // Optionally reset the edit state or any other UI-related state
            setSubTaskIdx(null); // Reset the task index or close the modal

            console.log('Sub-task renamed locally:', updatedSubTasks);
        } else {
            console.error('No fetched data available to update.');
        }
    }



    function renameHabit(idx: number) {
        if (!habitEdit || !repHabitEdit) return;

        if (fetchedData != null && fetchedData.length > 0) {
            // Fetch the current habits
            const currentHabits = fetchedData[0]?.habits;


            const isMatch = fetchedData[0].habits.some((itmz: habitsType) => itmz.habit.toLowerCase() === subTaskEdit.toLowerCase());

            if (isMatch) {
                console.log("NsubGoal is already equal to some title.");
                return;
            }


            // Check if the index is within bounds
            if (idx < 0 || idx >= currentHabits.length) {
                console.error("Index out of bounds for habits array.");
                return;
            }

            // Update the habit at the specified index
            const updatedHabits = currentHabits.map((habitItem: habitsType, index: number) => {
                if (index === idx) {
                    return { ...habitItem, habit: habitEdit, repeat: repHabitEdit }; // Correctly update the habit
                }
                return habitItem; // Return unchanged habit
            });

            // Update the fetchedData state with the new habits
            const updatedData = fetchedData.map((goal) =>
                goal.id === fetchedData[0]?.id ? { ...goal, habits: updatedHabits } : goal
            );

            // Set the updated data in state
            setFetchedData(updatedData);

            // Optionally reset the edit state or any other UI-related state
            setIsOpenHabit(null); // Close the habit edit modal or reset its state

            console.log('Habit renamed locally:', updatedHabits);
        } else {
            console.error('No fetched data available to update.');
        }
    }



    const [isDeleteTask, setIsDeleteTask] = useState<number | null>(null)

    function deleteTask(idx: number) {
        if (fetchedData != null && fetchedData.length > 0) {
            // Fetch the current sub-tasks
            const currentSubTasks = fetchedData[0]?.sub_tasks;

            // Check if the index is within bounds
            if (idx < 0 || idx >= currentSubTasks.length) {
                console.error("Index out of bounds for sub_tasks array.");
                return;
            }

            // Remove the sub-task from the array using the index
            const updatedSubTasks = currentSubTasks.filter((_, index) => index !== idx);

            // Update the fetchedData state with the new sub-tasks
            const updatedData = fetchedData.map((goal) =>
                goal.id === fetchedData[0]?.id ? { ...goal, sub_tasks: updatedSubTasks } : goal
            );

            // Set the updated data in state
            setFetchedData(updatedData);

            // Optionally reset the deletion state or any other UI-related state
            setIsDeleteTask(null); // Reset sub-task index if needed

            console.log('Task deleted locally:', updatedSubTasks);
        } else {
            console.error('No fetched data available to delete from.');
        }
    }


    function deleteHabit(idx: number) {
        if (fetchedData != null && fetchedData.length > 0) {
            // Fetch the current habits
            const currentHabits = fetchedData[0]?.habits;

            // Check if the index is within bounds
            if (idx < 0 || idx >= currentHabits.length) {
                console.error("Index out of bounds for habits array.");
                return;
            }

            // Remove the habit from the array using the index
            const updatedHabits = currentHabits.filter((_, index) => index !== idx);

            // Update the fetchedData state with the new habits
            const updatedData = fetchedData.map((goal) =>
                goal.id === fetchedData[0]?.id ? { ...goal, habits: updatedHabits } : goal
            );

            // Set the updated data in state
            setFetchedData(updatedData);

            // Optionally reset the deletion state or any other UI-related state
            setIsHabitDel(null); // Reset sub-task index if needed

            console.log('Habit deleted locally:', updatedHabits);
        } else {
            console.error('No fetched data available to delete from.');
        }
    }

    const addNewSubTask = (params: string) => {
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



        if (fetchedData != null && fetchedData.length > 0 && params !== '') {
            const goalId = fetchedData[0]?.id; // Get the goal ID

            // Check if you're adding a sub-task
            if (params === "task") {
                if (!newSubTask) return;
                // Add a new sub-task
                const updatedSubTasks = [...fetchedData[0]?.sub_tasks, newSubTaskObj];

                // Update the state with the new sub-task locally
                const updatedData = fetchedData.map((goal) =>
                    goal.id === goalId ? { ...goal, sub_tasks: updatedSubTasks } : goal
                );

                setFetchedData(updatedData);
                console.log("Sub-task added locally:", updatedSubTasks);
                setNewSubTask(''); // Reset new sub-task input
            }

            // Check if you're adding a habit
            else if (params === "habit") {
                if (!repHabit || !newHabit) return;

                console.log("I AM AT HABIT");
                // Add a new habit
                const updatedHabits = [...fetchedData[0]?.habits, newHabitObject];

                // Update the state with the new habit locally
                const updatedData = fetchedData.map((goal) =>
                    goal.id === goalId ? { ...goal, habits: updatedHabits } : goal
                );

                setFetchedData(updatedData);
                console.log("Habit added locally:", updatedHabits);
                setRepHabit(''); // Reset repeat habit input
                setNewHabit(''); // Reset new habit input
            }
        } else {
            console.error("No fetched data available to update.");
        }
    };


    async function passToTemplates() {
        setLoading(true)

        if (loading) return
        if (!fetchedData) return

        try {

            if (fetchedData) {



                const updatedTasks = fetchedData[0]?.sub_tasks.map((goals: subtaskType) => {
                    return { ...goals, is_done: false };

                });

                const { error } = await supabase
                    .from('templates')
                    .insert({
                        title: title,
                        description: description,
                        category: category,
                        is_done: false,
                        created_at: Date.now(),
                        sub_tasks: updatedTasks,
                        habits: fetchedData[0]?.habits,
                        authorUid: user?.id,
                        userid: "",
                        download_count: 0,
                        deadline: ""
                    })

                if (error) {
                    console.log(error)
                    setLoading(false)

                } else {
                    console.log("Data saved")
                    setLoading(false)

                    setIsExiting(true);

                    setTimeout(() => {
                        setShowCreate("")
                        setCreatedAt("")
                        setIsExiting(false);
                    }, 100);
                }
            }
        }
        catch (err) {
            console.log(err)
            setLoading(false)
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
                    className='ml-auto positioners flex items-center p-3 justify-center relative w-full h-full'
                    onClick={() => { handleOutsideClick("") }}>


                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        onClick={(e) => { e.stopPropagation() }}
                        className='w-full max-w-[550px] bg-[#313131]  z-[5000] relative
              rounded-lg p-3 h-full max-h-[800px] border-[#535353] border-[1px] justify-between flex flex-col overflow-auto'>

                        <div className='overflow-auto h-full flex flex-col justify-start'>
                            <div>
                                <div className='text-xl font-bold'>Finishing touches</div>
                                <p className='text-sm text-[#888] mt-1'>Before your upload you goal, make sure that everything is set!</p>

                                <p className='text-sm text-[#888] my-2'>
                                    Please note that once your template is published, all associated subtasks will be marked as "In progress" to ensure users begin with a clean slate.
                                </p>

                            </div>

                            <div className='mt-3 flex flex-col gap-2 h-auto'>
                                <input
                                    value={title}
                                    onChange={(e) => { setTitle(e.target.value) }}
                                    placeholder='Title'
                                    className='p-2 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full'
                                    type="text" />

                                <textarea
                                    value={description}
                                    onChange={(e) => { setDesc(e.target.value) }}
                                    className='p-2 rounded-lg resize-none h-full max-h-[300px] bg-[#111111] outline-none border-[#535353] border-[1px] w-full'
                                    placeholder='Description'
                                ></textarea>
                                <select
                                    value={category}
                                    onChange={(e) => { setCat(e.target.value) }}
                                    className='p-3 rounded-lg bg-[#111111] outline-none  border-[#535353] border-[1px]  text-[#888]'
                                    name="" id="">
                                    <option value="">Category:</option>
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
                            </div>

                            <div className='mt-4'>
                                <div className='font-bold px-2 flex items-center gap-1 mb-2'>
                                    <GoTasklist />  Tasks
                                </div>
                                <div className='flex flex-col gap-3 '>
                                    {
                                        fetchedData && fetchedData[0]?.sub_tasks.map((itm: subtaskType, idx: number) => (
                                            <div
                                                key={idx}
                                                className='overflow-hidden flex flex-col gap-2  items-start justify-start bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#222222] '>
                                                <div className='flex flex-col gap-1'>
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
                                                            <div className='font-bold'>
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
                                                        subTaskIdx === idx ?
                                                            (
                                                                <>
                                                                    <div
                                                                        className='hover:bg-[#535353] flex gap-1 items-center  text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '
                                                                        onClick={() => { setSubTaskIdx(null) }}>
                                                                        Cancel
                                                                    </div>
                                                                    <div
                                                                        className='hover:bg-[#535353] flex text-green-500 gap-1 items-center  text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '
                                                                        onClick={() => { renameTask(idx) }}>
                                                                        Save
                                                                    </div>
                                                                </>
                                                            )
                                                            : isDeleteTask === idx ?
                                                                (
                                                                    <>
                                                                        <div
                                                                            className='hover:bg-[#535353] flex gap-1 items-center  text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '

                                                                            onClick={() => { setIsDeleteTask(null) }}>
                                                                            Cancel
                                                                        </div>
                                                                        <div
                                                                            className='hover:bg-[#535353] flex gap-1 items-center  text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '

                                                                            onClick={() => { deleteTask(idx) }}>
                                                                            Delete
                                                                        </div>
                                                                    </>
                                                                )
                                                                :

                                                                <>
                                                                    <div
                                                                        className='hover:bg-[#535353] flex gap-1 items-center  text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '

                                                                        onClick={() => { getValue(itm?.subGoal, idx) }}
                                                                    >Edit</div>
                                                                    <div
                                                                        className='hover:bg-[#535353] text-red-500 flex gap-1 items-center  text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '
                                                                        onClick={() => { setIsDeleteTask(idx) }}>
                                                                        Delete
                                                                    </div>
                                                                </>
                                                    }
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                                <div className='flex items-start mt-2'>
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
                                        className='flex gap-1 items-center justify-between bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-3 px-3 hover:bg-[#222222]  ml-2'>
                                        <FaPlus />
                                    </div>
                                </div>

                                <div className='font-bold px-2 flex items-center gap-1 mt-5 mb-2'>
                                    <GiDna2 /> Habits
                                </div>
                                <div className='flex flex-col gap-3 '>
                                    {
                                        fetchedData && fetchedData[0]?.habits.map((itm: habitsType, idx: number) => (
                                            <div
                                                key={idx}
                                                className='overflow-hidden flex flex-col gap-1  items-start justify-start bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#222222] '>
                                                <div>
                                                    <div className='font-bold'>
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
                                                    <p className={`text-sm text-[#888]`}>
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
                                                <div className='flex gap-1 mt-2'>
                                                    {
                                                        idx === isOpenEditOfHabit ?
                                                            (
                                                                <>
                                                                    <div
                                                                        onClick={() => { setIsOpenHabit(null) }}
                                                                        className='hover:bg-[#535353] flex gap-1 items-center  text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
                                                                        Cancel
                                                                    </div>
                                                                    <div
                                                                        onClick={() => { renameHabit(idx) }}
                                                                        className='hover:bg-[#535353] flex gap-1 items-center text-center text-green-500 bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
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
                                                                            className='hover:bg-[#535353] flex gap-1 items-center  text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
                                                                            Cancel
                                                                        </div>
                                                                        <div
                                                                            onClick={() => { deleteHabit(idx) }}
                                                                            className='hover:bg-[#535353] flex gap-1 items-center text-center text-green-500 bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
                                                                            Delete
                                                                        </div>
                                                                    </>
                                                                )
                                                                :

                                                                <>
                                                                    <div
                                                                        onClick={() => { getValueOfHabit(itm?.habit, idx, itm?.repeat) }}
                                                                        className='hover:bg-[#535353] flex gap-1 items-center  text-center bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
                                                                        Edit
                                                                    </div>
                                                                    <div
                                                                        onClick={() => { setIsHabitDel(idx) }}
                                                                        className='hover:bg-[#535353] flex gap-1 items-center text-center text-red-500 bg-[#111111] border-[#535353] border-[1px] cursor-pointer rounded-lg p-1 px-3 '>
                                                                        Delete
                                                                    </div>
                                                                </>
                                                    }
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>

                                <div className='flex items-center mt-2 gap-2'>
                                    <input
                                        type='text'
                                        value={newHabit}
                                        onChange={handleHabitInputChange} // Call the input change handler
                                        maxLength={50}
                                        placeholder='Enter new habit...'
                                        className='flex-grow bg-[#313131] border-[#535353] border-[1px] rounded-lg p-2 text-white'
                                    />

                                    <div className='w-full max-w-[200px] items-center flex justify-center'>
                                        <select
                                            value={repHabit}
                                            onChange={(e) => { setRepHabit(e.target.value) }}
                                            className='rounded-lg bg-[#111111] h-full p-2.5 outline-none border-[#535353] border-[1px] w-full text-[#888]'
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
                                        className='flex gap-1 items-center justify-between bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-3 px-3 hover:bg-[#222222]  ml-2'>
                                        <FaPlus />
                                    </div>
                                </div>

                            </div>

                        </div>

                        <div className='w-full flex gap-3 mt-2'>
                            <div
                                onClick={() => { (!loading && handleOutsideClick("Import")) }}
                                className='p-3 rounded-lg bg-[#111111] outline-none  border-[#535353] border-[1px]  text-[#888] cursor-pointer hover:bg-[#222222]'>
                                Back
                            </div>

                            <div className='w-full flex border-[#535353] border-[1px] overflow-hidden rounded-lg'>
                                <div
                                    onClick={() => { (!loading && handleOutsideClick("")) }}
                                    className='p-3 bg-[#111111] outline-none  text-center border-r-[#535353] border-r-[1px] cursor-pointer text-[#888] w-full hover:bg-[#222222]'>
                                    Cancel
                                </div>
                                <div
                                    onClick={() => { passToTemplates() }}
                                    className={`${loading && 'bg-[#535353] flex items-center justify-center'} p-3 bg-[#111111] outline-none  text-center text-[#888] w-full cursor-pointer hover:bg-[#222222]`}>
                                    {
                                        loading ?
                                            <div className='w-[20px] h-[20px]'>
                                                <Loader />
                                            </div>
                                            :
                                            "Save"
                                    }
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default UploadImport