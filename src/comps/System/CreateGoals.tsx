import React, { useEffect, useState } from 'react'
import IsLoggedIn from '../../firebase/IsLoggedIn'
import { FaPlus } from "react-icons/fa6";
import { RxUpdate } from "react-icons/rx";
import { supabase } from '../../supabase/supabaseClient';
import Loader from '../Loader';
import useStore from '../../Zustand/UseStore';


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


const CreateGoals: React.FC<listenerType> = ({ listener, purpose, closer, }) => {
    const [user] = IsLoggedIn()
    const [loading, setLoading] = useState<boolean>(false)
    const [title, setTitle] = useState<string>("")
    const [category, setCategory] = useState<string>("")
    const [deadline, setDeadline] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [subTasks, setSubTasks] = useState<SubTasksType[] | null>([])
    const [newSubTask, setNewSubTask] = useState<string>('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null); // Track which task is being edited
    const { setShowCreate }: any = useStore()


    const [habits, setHabits] = useState<HabitsType[]>([]);
    const [newHabit, setNewHabit] = useState<string>('');
    const [editingIndexHabit, setEditingIndexHabit] = useState<number | null>(null);


    const [habitRep, setHabitRep] = useState<string>('');





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
            repeat: habitRep, // Use the selected repetition
            habit: newHabit,
        };

        setHabits((prevTasks) => [...(prevTasks || []), newHabitItem]);

        // Clear the input fields
        setNewHabit('');
        setHabitRep(''); // Reset repetition selection
    };


    const removeHabit = (index: number) => {
        // Remove habit at the given index
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
            console.log('Title is required');
            setLoading(false)
            return;
        }

        if (!category.trim()) {
            console.log('Category is required');
            setLoading(false)
            return;
        }

        if (!deadline) {
            console.log('Deadline is required');
            setLoading(false)
            return;
        }

        if (!description.trim()) {
            console.log('Description is required');
            setLoading(false)
            return;
        }

        if (!subTasks) {
            setLoading(false)
            return
        }


        const selectedDate = new Date(deadline);
        const currentDate = new Date();

        if (selectedDate < currentDate) {
            alert("The selected date has already passed.");
            setLoading(false); // Reset loading state before returning
            return; // Exit the function if the date has passed
        }

        try {
            if (purpose === "Modals") {
                const { error } = await supabase
                    .from("templates")
                    .insert({
                        title: title,
                        category: category,
                        is_done: false,
                        created_at: Date.now(),
                        authorUid: user?.uid,
                        userid: "",
                        deadline: "",
                        description: description,
                        sub_tasks: subTasks,
                        habits: habits,
                        download_count: 0,
                    })

                if (error) {
                    console.error('Error creating new goal:', error.message);
                    setLoading(false)
                    return;
                } else {
                    setTitle("")
                    setDeadline("")
                    setDescription("")
                    setHabits([])
                    listener(Prevs => !Prevs)
                    setSubTasks(null)
                    setLoading(false)
                }

                console.log('Goal successfully created');
            } else {
                const { error } = await supabase
                    .from("goals")
                    .insert({
                        title: title,
                        category: category,
                        is_done: false,
                        created_at: Date.now(),
                        userid: user?.uid,
                        deadline: deadline,
                        description: description,
                        sub_tasks: subTasks,
                        habits: habits
                    })

                if (error) {
                    console.error('Error creating new goal:', error.message);
                    setLoading(false)
                    return;
                } else {
                    setTitle("")
                    setDeadline("")
                    setDescription("")
                    setHabits([])
                    listener(Prevs => !Prevs)
                    setSubTasks(null)
                    setLoading(false)
                }

                console.log('Goal successfully created');
            }

        }
        catch (err) {
            setLoading(false)
            console.log(err)
        }
    }

    useEffect(() => {
        console.log(habits)
    }, [habits])

    return (
        <div
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
                        maxLength={40}
                        value={title}
                        onChange={(e) => { setTitle(e.target.value) }}
                        className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full'
                        type="text" placeholder='Title' />

                    <textarea

                        value={description}
                        onChange={(e) => { setDescription(e.target.value) }}
                        maxLength={150}
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

                    <div className='flex flex-col gap-1'>
                        <label htmlFor="input">Deadline</label>
                        <input
                            value={deadline}
                            onChange={(e) => { setDeadline(e.target.value) }}
                            type="date" className='p-2 rounded-lg bg-[#111111] border-[#535353] border-[1px] text-[#888]' />
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
                purpose === 'Modal' || purpose === 'Modals' ?
                    <div className='w-full  flex rounded-lg overflow-hidden mt-2 border-[#535353] border-[1px]'>
                        <div
                            onClick={() => {
                                closer(prevs => !prevs); setShowCreate("")
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
                                    <>Create</>
                            }
                        </div>
                    </div>
            }
        </div >
    )
}

export default CreateGoals
