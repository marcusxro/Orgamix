import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../supabase/supabaseClient';
import IsLoggedIn from '../../../Utils/IsLoggedIn';
import { CiCalendarDate } from "react-icons/ci";
import { CiRepeat } from "react-icons/ci";
import { AnimatePresence, motion } from 'framer-motion';
interface TaskDataType {
    title: string;
    deadline: string; // Assuming this is in ISO format
    description: string;
    id: number;
    isdone: boolean;
    priority: string;
    userid: string;
    repeat: string;
    createdAt: string;
    link: string[];
    category: string;
}

const TaskData: React.FC = () => {
    const [user]:any = IsLoggedIn();
    const [groupedTasks, setGroupedTasks] = useState<{ today: TaskDataType[]; tomorrow: TaskDataType[] }>({ today: [], tomorrow: [] });

    useEffect(() => {
        if (user) {
            getUserTask();
        }
    }, [user]);

    async function getUserTask() {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('userid', user?.id)
                .eq('isdone', false); // Filter out completed tasks 

            if (error) {
                console.error("Error fetching tasks:", error);
                return;
            }

            if (data) {
                // Filter and group tasks based on deadlines
                const today = new Date();
                const tomorrow = new Date();
                tomorrow.setDate(today.getDate() + 1);

                const formattedToday = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
                const formattedTomorrow = tomorrow.toISOString().split('T')[0]; // Format YYYY-MM-DD

                const todayTasks = data.filter(task => task.deadline.startsWith(formattedToday));
                const tomorrowTasks = data.filter(task => task.deadline.startsWith(formattedTomorrow));

                setGroupedTasks({ today: todayTasks, tomorrow: tomorrowTasks });
            }
        } catch (err) {
            console.error("Error fetching tasks:", err);
        }
    }

    return (
        <div className='flex  flex-col gap-4'>

            <div className='flex gap-2 flex-col border-l-[2px] border-l-[#1d9e44] pl-2'>
                <h2 className='font-bold mb-2'>Tasks for Today</h2>
                <AnimatePresence>
                    {groupedTasks.today.length > 0 ? (
                        <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                            {groupedTasks.today.map((task: TaskDataType, idx: number) => (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }} // Initial position and opacity
                                    animate={{ y: 0, opacity: 1 }} // End position and opacity
                                    transition={{
                                        duration: 0.4,
                                        delay: idx * 0.1 // Staggered animation
                                    }}
                                    className='bg-[#222] w-full overflow-hidden flex items-start flex-col p-3 rounded-lg cursor-pointer border-[#535353] border-[1px]'
                                    key={idx}
                                >
                                    <div className='font-bold'>
                                        {task?.title}
                                    </div>
                                    <p className='text-[#888] break-all'>{task?.description !== '' ? task?.description : 'No Description'}</p>
                                    {task?.repeat !== '' &&
                                        <p className='text-[#888] flex gap-1 items-center my-2 break-all text-sm'>
                                            <CiRepeat /> {task?.repeat}
                                        </p>
                                    }

                                    <div className='mt-auto pt-2 flex gap-4 text-[10px] md:text-sm'>
                                        {task.deadline !== '' &&
                                            <div className='flex gap-1 items-center justify-start'>
                                                <div>
                                                    <CiCalendarDate />
                                                </div>
                                                <p className='text-[#888]'>{task?.deadline}</p>
                                            </div>
                                        }
                                        {task?.category !== '' &&
                                            <div className='flex items-center gap-1 justify-start'>
                                                <div className='w-[10px] h-[10px] bg-red-500'></div>
                                                <p className='text-[#888]'>{task?.category}</p>
                                            </div>
                                        }
                                        {task?.priority !== '' &&
                                            <div className='flex items-center gap-1 justify-start'>
                                                <div className='w-[10px] h-[10px] bg-yellow-500'></div>
                                                <p className='text-[#888]'>{task?.priority}</p>
                                            </div>
                                        }
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className='text-sm text-[#888] bg-[#222] p-2 rounded-lg'>No tasks for today.</p>
                    )}


                </AnimatePresence>
            </div>
            <div className='flex gap-2 flex-col border-l-[2px] border-l-[#1d559e] pl-2'>
                <h2 className='font-bold mb-2'>Tasks for Tomorrow</h2>
                {groupedTasks.tomorrow.length > 0 ? (
                    <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                        {groupedTasks.tomorrow.map((task, idx: number) => (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }} // Initial position and opacity
                                animate={{ y: 0, opacity: 1 }} // End position and opacity
                                transition={{
                                    duration: 0.4,
                                    delay: idx * 0.1 // Staggered animation
                                }}
                                className='bg-[#222] w-full  overflow-hidden flex items-start flex-col p-3 rounded-lg cursor-pointer border-[#535353] border-[1px] '
                                key={idx}>
                                <div className='font-bold'>
                                    {task?.title}
                                </div>
                                <p className='text-[#888] break-all'>{task?.description != '' ? task?.description : 'No Description'}</p>
                                {task?.repeat != '' &&
                                    <p className='text-[#888] flex gap-1  items-center my-2 break-all text-sm'>
                                        <CiRepeat /> {task?.repeat != '' && task?.repeat}
                                    </p>
                                }

                                <div className='mt-auto pt-2 flex gap-4 text-[10px] md:text-sm'>
                                    {
                                        task.deadline != '' &&
                                        <div className='flex gap-1 items-center justify-start'>
                                            <div>
                                                < CiCalendarDate />
                                            </div>
                                            <p className='text-[#888] '>{task?.deadline != '' && task?.deadline}</p>
                                        </div>
                                    }
                                    {
                                        task?.category != '' &&
                                        <div className='flex items-center gap-1 justify-start'>
                                            <div className='w-[10px] h-[10px] bg-red-500'>

                                            </div>
                                            <p className='text-[#888] '>{task?.category != '' && task?.category}</p>
                                        </div>
                                    }
                                    {
                                        task?.priority != '' &&
                                        <div className='flex items-center gap-1 justify-start'>
                                            <div className='w-[10px] h-[10px] bg-yellow-500'>

                                            </div>
                                            <p className='text-[#888] '>{task?.priority != '' && task?.priority}</p>
                                        </div>
                                    }
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className='text-sm text-[#888] bg-[#222] p-2 rounded-lg'>No tasks for today.</p>
                )}
            </div>
        </div>
    );
};

export default TaskData;
