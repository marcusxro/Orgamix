import React, { useEffect, useState } from 'react'
import IsLoggedIn from '../Utils/IsLoggedIn'
import { FaPlus } from "react-icons/fa6";
import { RxUpdate } from "react-icons/rx";
import { supabase } from '../../supabase/supabaseClient';
import Loader from '../Loader';
import useStore from '../../Zustand/UseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { BiSolidError } from "react-icons/bi";

interface SubTasksType {
    is_done: boolean;
    startedAt: string;
    subGoal: string
}

interface HabitsType {
    repeat: string;
    habit: string
}

interface listenerType {
    listener: React.Dispatch<React.SetStateAction<boolean>>;
    purpose: string;
    closer: React.Dispatch<React.SetStateAction<boolean>>;
    location: string
}


const CreateGoals: React.FC<listenerType> = ({ listener, purpose, closer, location }) => {
    const [user]:any = IsLoggedIn()
    const [loading, setLoading] = useState<boolean>(false)
    const [title, setTitle] = useState<string>("")
    const [category, setCategory] = useState<string>("")
    const [deadline, setDeadline] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [subTasks, setSubTasks] = useState<SubTasksType[] | null>([])
    const [newSubTask, setNewSubTask] = useState<string>('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null); // Track which task is being edited
    const { setShowCreate }: any = useStore()
    const [isExiting, setIsExiting] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null)
    const [habits, setHabits] = useState<HabitsType[]>([]);
    const [newHabit, setNewHabit] = useState<string>('');
    const [editingIndexHabit, setEditingIndexHabit] = useState<number | null>(null);


    const [habitRep, setHabitRep] = useState<string>('');


    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            closer(false);
            setIsExiting(false);
        }, 100);
    };



    const addTask = () => {
        if (newSubTask.trim() === '') return;
        const newTask: SubTasksType = {
            is_done: false,
            startedAt: new Date().toISOString(),
            subGoal: newSubTask,
        };

        setSubTasks((prevTasks) => [...(prevTasks || []), newTask]);
        setNewSubTask('');
    };

    const removeTask = (index: number) => {
        setSubTasks((prevTasks) => {
            if (!prevTasks) return [];
            return prevTasks.filter((_, i) => i !== index);
        });
    };

    const editTask = (index: number) => {
        if (subTasks != null && subTasks[index]) {
            const taskToEdit = subTasks[index];
            setNewSubTask(taskToEdit.subGoal);
            setEditingIndex(index);
        }
    };

    const updateTask = () => {
        if (editingIndex === null || editingIndex === undefined) return;
        setSubTasks((prevTasks) => {
            if (!prevTasks) return [];
            const updatedTasks = [...prevTasks];
            updatedTasks[editingIndex] = {
                ...updatedTasks[editingIndex],
                subGoal: newSubTask,
            };
            return updatedTasks;
        });
        setNewSubTask('');
        setEditingIndex(null);

    };




    const addHabit = () => {
        if (newHabit.trim() === '' && habitRep.trim() === '') return; // Ensure both habit and repetition are provided
        const newHabitItem: HabitsType = {
            repeat: habitRep,
            habit: newHabit,
        };

        setHabits((prevTasks) => [...(prevTasks || []), newHabitItem]);
        setNewHabit('');
        setHabitRep('');
    };


    const removeHabit = (index: number) => {
        setHabits((prevTasks) => prevTasks.filter((_, i) => i !== index));
    };

    const editHabit = (index: number) => {
        if (habits[index]) {
            const habitToEdit = habits[index];
            setNewHabit(habitToEdit.habit);
            setEditingIndexHabit(index);
            setHabitRep(habitToEdit.repeat)
        }
    };

    const updateHabit = () => {
        if (editingIndexHabit === null || editingIndexHabit === undefined) return;

        setHabits((prevTasks) => {
            if (!prevTasks) return [];
            const updatedTasks = [...prevTasks];
            updatedTasks[editingIndexHabit] = {
                ...updatedTasks[editingIndexHabit],
                habit: newHabit,
                repeat: habitRep, // Update the repetition
            };
            return updatedTasks;
        });

        // Clear the input fields and reset editing state
        setNewHabit('');
        setHabitRep('');
        setEditingIndexHabit(null);
    };


    async function createNewGoal() {
        console.log("CLICKED")
        setLoading(true)

        if (loading) {
            return
        }

        if (!user) {
            return
        }
        if (!title.trim()) {
            setErrorText('Title is required');
            setLoading(false)
            return;
        }

        if (!category.trim()) {
            setErrorText('Category is required');
            setLoading(false)
            return;
        }

        // if (!description.trim()) {
        //     setErrorText('Description is required');
        //     setLoading(false)
        //     return;
        // }

        if (!subTasks) {

            setErrorText("Please add tasks")
            setLoading(false)
            return
        }

        const selectedDate = new Date(deadline);
        const currentDate = new Date();

        if (selectedDate < currentDate) {
            setErrorText("The selected date has already passed.");
            setLoading(false); // Reset loading state before returning
            return; // Exit the function if the date has passed
        }

        try {
            // Check for existing goals with the same title
            const { data: existingGoals, error: fetchError } = await supabase
                .from('goals')
                .select('title')
                .eq('userid', user?.id)
                .like('title', `${title}%`);

            if (fetchError) {
                setErrorText('Error fetching existing goals, try again later');
                setLoading(false);
                return;
            }

            // Determine the new title with an index if necessary
            let newTitle = title;

            if (existingGoals.length > 0) {
                const exactMatches = existingGoals.filter(itm =>
                    itm?.title === title || itm?.title.startsWith(`${title} (`));

                if (exactMatches.length > 0) {
                    const maxIndex = exactMatches.reduce((acc, itm) => {
                        const match = itm.title.match(/\((\d+)\)$/); // Check for pattern "renameGoal (index)"
                        const index = match ? parseInt(match[1], 10) : 0;
                        return Math.max(acc, index);
                    }, 0);

                    newTitle = `${title} (${maxIndex + 1})`;
                }


            }

            if (purpose === "Modal") {
                if (subTasks.length === 0) {
                    setErrorText("Please add at least one task")
                    setLoading(false)
                    return
                }
                const { error } = await supabase
                    .from("templates")
                    .insert({
                        title: title,
                        category: category,
                        is_done: false,
                        created_at: Date.now(),
                        authorUid: user?.id,
                        userid: "",
                        deadline: "",
                        description: description,
                        sub_tasks: subTasks,
                        habits: habits,
                        download_count: 0,
                    });

                if (error) {
                    setErrorText('Error creating new goal');
                    setLoading(false);
                    return;
                } else {
                    setTitle("");
                    setDeadline("");
                    setDescription("");
                    setHabits([]);
                    listener((Prevs) => !Prevs);
                    setSubTasks(null);
                    setCategory("");
                    setLoading(false);
                }

            } else {

                if (!deadline) {
                    setErrorText('Deadline is required');
                    setLoading(false);
                    return;
                }
                if (subTasks.length === 0) {
                    setErrorText("Please add at least one task")
                    setLoading(false)
                    return
                }
                const { error } = await supabase
                    .from("goals")
                    .insert({
                        title: newTitle,
                        category: category,
                        is_done: false,
                        created_at: Date.now(),
                        userid: user?.id,
                        deadline: deadline,
                        description: description,
                        sub_tasks: subTasks,
                        habits: habits,
                    });

                if (error) {
                    setErrorText('Error creating new goal, try again later');
                    setLoading(false);
                    return;
                } else {
                    setTitle("");
                    setDeadline("");
                    setDescription("");
                    setHabits([]);
                    listener((Prevs) => !Prevs);
                    setSubTasks(null);
                    setCategory("");
                    setLoading(false);
                    setErrorText(null)
                }
            }
        } catch (err) {
            setLoading(false);
            console.log(err);
            setErrorText('Error creating new goal, try again later');
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
                    className={`${purpose == "Modal" && location != "template" && "ml-auto positioners flex items-center p-3 justify-end lg:hidden h-full w-full"}
                                ${location === "template" && purpose === "Modal" && "ml-auto positioners flex bg-red-800 items-center p-3 justify-end h-full w-full"}
                                ${purpose === "Sidebar" && location != 'template' && "ml-auto stickyPostion hidden lg:block"}
                                `}
                    onClick={handleOutsideClick}>

                    <motion.div
                        initial={{ x: 50, scale: 0.95, opacity: 0 }} // Starts off-screen to the left
                        animate={{ x: 0, scale: 1, opacity: 1, transition: { duration: 0.2 } }} // Moves to default position
                        exit={{ x: 50, scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        onClick={(e) => { e.stopPropagation() }}
                        className='w-[350px] h-full bg-[#313131] z-[5000]
             rounded-lg p-3 border-[#535353] border-[1px] flex flex-col justify-between'>

                        <div className='pb-2'>
                            <div className='text-xl font-bold'>Create Goal</div>
                            <p className='text-[#888] text-sm'>
                                Set and track your goals to stay motivated.
                            </p>
                        </div>

                        <div className='h-full overflow-auto'>
                            <div className='mt-6 flex flex-col gap-3'>
                                <input
                                    maxLength={50}
                                    value={title}
                                    onChange={(e) => { setTitle(e.target.value) }}
                                    className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full'
                                    type="text" placeholder='Title' />

                                <textarea

                                    value={description}
                                    onChange={(e) => { setDescription(e.target.value) }}
                                    maxLength={300}
                                    placeholder='Description'
                                    className='resize-none w-full h-[150px] rounded-lg p-3 bg-[#111111] outline-none border-[#535353] border-[1px]'></textarea>

                                <select
                                    value={category}
                                    onChange={(e) => { setCategory(e.target.value) }}
                                    className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full text-[#888]'
                                    name="" id="">
                                    <option value="">Select a Category</option>
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

                                {
                                    location != "template" &&
                                    <div className='flex flex-col gap-1'>
                                        <label htmlFor="input">Deadline</label>
                                        <input
                                            value={deadline}
                                            onChange={(e) => { setDeadline(e.target.value) }}
                                            type="date" className='p-2 rounded-lg bg-[#111111] border-[#535353] border-[1px] text-[#888]' />
                                    </div>
                                }


                                <div>
                                    Tasks
                                </div>
                                <input
                                    type="text"
                                    value={newSubTask}
                                    className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full'
                                    onChange={(e) => setNewSubTask(e.target.value)} // Update input value
                                    placeholder="Add your subtask"
                                />


                                <button
                                    className={`${newSubTask === "" && 'text-[#888]'} p-3 rounded-lg bg-[#535353] text-green-500
                         cursor-pointer hover:text-[#888] outline-none w-full flex items-center justify-center gap-2`}
                                    onClick={editingIndex === null ? addTask : updateTask}>
                                    {editingIndex === null ? <><FaPlus />  <></>Add new task</> : <><RxUpdate /> Update subtask</>}
                                </button>


                                {subTasks != null && subTasks.map((task, index) => (
                                    <li
                                        className='p-2 rounded-lg  bg-green-500 text-[#111111] border-[#535353] border-[1px] flex flex-col'
                                        key={index}>
                                        <div className='font-bold'>
                                            {task.subGoal} - {task.is_done ? 'Done' : 'Pending'}
                                        </div>


                                        (Started at: {task.startedAt})

                                        <div className='flex rounded-lg overflow-hidden mt-2 border-[#535353] border-[1px] '>
                                            <button
                                                className='w-full text-center bg-[#111111] text-white p-2 border-r-[#535353] border-r-[1px] hover:bg-[#535353]'
                                                onClick={() => editTask(index)}>Edit</button>
                                            <button
                                                className='w-full text-center bg-[#111111] text-white p-2 hover:bg-[#535353]'
                                                onClick={() => removeTask(index)}>Remove</button>
                                        </div>
                                    </li>
                                ))}

                                <div className='w-full h-auto mt-4 flex flex-col gap-3'>
                                    <div>
                                        Habits
                                    </div>
                                    <div className='flex gap-3'>
                                        <input
                                            maxLength={40}
                                            className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full'
                                            type="text"
                                            value={newHabit}
                                            onChange={(e) => setNewHabit(e.target.value)} // Update input value
                                            placeholder="Add your habit"
                                        />
                                        <select
                                            value={habitRep}
                                            onChange={(e) => { setHabitRep(e.target.value) }}
                                            className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full text-[#888]'
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

                                    <button
                                        className={`${newHabit === "" && 'text-[#888]'} p-3 rounded-lg bg-[#535353] text-green-500
                         cursor-pointer hover:text-[#888] outline-none w-full flex items-center justify-center gap-2`}
                                        onClick={editingIndexHabit === null ? addHabit : updateHabit}>
                                        {editingIndexHabit === null ? <><FaPlus />  <></>Add new habit</> : <><RxUpdate /> Update habit</>}
                                    </button>
                                </div>

                                {habits != null && habits.map((task, index) => (
                                    <li
                                        className='p-2 rounded-lg  bg-blue-500 text-[#111111] border-[#535353] border-[1px] flex flex-col'
                                        key={index}>
                                        <div className='font-bold'>
                                            {task.habit} - {"(" + task.repeat + ")"}
                                        </div>

                                        <div className='flex rounded-lg overflow-hidden mt-2 border-[#535353] border-[1px] '>
                                            <button
                                                className='w-full text-center bg-[#111111] text-white p-2 border-r-[#535353] border-r-[1px] hover:bg-[#535353]'
                                                onClick={() => editHabit(index)}>Edit</button>
                                            <button
                                                className='w-full text-center bg-[#111111] text-white p-2 hover:bg-[#535353]'
                                                onClick={() => removeHabit(index)}>Remove</button>
                                        </div>
                                    </li>
                                ))}


                            </div>
                        </div>
                        {
                            errorText != null &&
                            <div className='text p-2 rounded-md flex gap-2 items-center mt-1 bg-red-500  text-left'>
                                <BiSolidError />  {errorText}
                            </div>
                        }
                        {
                            purpose === 'Modal' || purpose === 'Modals' ?
                                <div className='w-full  flex rounded-lg overflow-hidden mt-2 border-[#535353] border-[1px]'>
                                    <div
                                        onClick={() => {
                                            handleOutsideClick(); setShowCreate("")
                                        }}
                                        className='bg-[#583c3c] flex items-center justify-center w-full border-r-[#535353] border-r-[1px]  p-3 text-center cursor-pointer  hover:bg-[#535353] '>Cancel</div>
                                    <div
                                        onClick={() => { createNewGoal() }}
                                        className={`${loading && 'bg-[#535353]'} bg-[#111111] flex items-center justify-center w-full  p-3 text-center cursor-pointer  hover:bg-[#535353]`}>
                                        {
                                            loading ?
                                                <div className='w-[20px] h-[30px] flex items-center justify-center'>
                                                    <Loader />
                                                </div>
                                                :
                                                <>Create</>
                                        }
                                    </div>
                                </div>
                                :
                                <div className='w-full  flex rounded-lg overflow-hidden mt-2 border-[#535353] border-[1px]'>
                                    <div
                                        onClick={() => { createNewGoal() }}
                                        className={`${loading && 'bg-[#535353]'} bg-[#111111] flex items-center justify-center w-full  p-3 text-center cursor-pointer  hover:bg-[#535353]`}>
                                        {
                                            loading ?
                                                <div className='w-[20px] h-[30px] flex items-center justify-center'>
                                                    <Loader />
                                                </div>
                                                :
                                                <>
                                                    Create
                                                </>
                                        }
                                    </div>
                                </div>
                        }
                    </motion.div >
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default CreateGoals
