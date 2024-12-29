import React, { useEffect, useState } from 'react';
import Sidebar from '../../comps/System/layouts/Sidebar';
import IsLoggedIn from '../../comps/Utils/IsLoggedIn';
import { supabase } from '../../comps/Utils/supabase/supabaseClient';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import moment from 'moment';
import { MdOutlineClass } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { motion } from 'framer-motion'

import Confetti from 'react-confetti'
import Loader from '../../comps/Svg/Loader';

const CalendarPage: React.FC = () => {
    const [user]:any = IsLoggedIn();
    const [events, setEvents] = useState<any>([]);
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date()));
    const endOfWeek = addDays(currentWeekStart, 6);
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        if (user) {
            fetchAllDatas();
        }
    }, [user, isLoaded]);

    async function fetchAllDatas() {
        const tasks = await fetchUserTasks();
        const goals = await fetchUserGoals();
        const projects = await fetchUserProjects();

        if (tasks && goals && projects) {
            setIsLoaded(true)
        }
        // Map combined data to event format required by the calendar
        const combinedData = [
            ...(tasks || []).map(item => {
                const deadline = new Date(item.deadline);
                if (!isNaN(deadline.getTime())) { // Check if the date is valid
                    return {
                        title: item.title,
                        start: deadline,
                        end: deadline,
                        category: item?.category,
                        type: "Task",
                        allDay: true,
                        startedAt: item?.createdAt
                            ? moment(parseInt(item?.createdAt.toString())).format('MMMM Do YYYY')
                            : 'No Creation date'
                    };
                }
                return null; // Return null if the date is invalid
            }).filter(event => event), // Filter out any null events
            ...(goals || []).map(item => {
                const deadline = new Date(item.deadline);
                if (!isNaN(deadline.getTime())) { // Check if the date is valid
                    return {
                        title: item.title,
                        start: deadline,
                        end: deadline,
                        category: item?.category,
                        allDay: true,
                        type: "Goal",
                        startedAt: item?.created_at
                            ? moment(parseInt(item?.created_at.toString())).format('MMMM Do YYYY')
                            : 'No Creation date'
                    };
                }
                return null; // Return null if the date is invalid
            }).filter(event => event), // Filter out any null events
            ...(projects || []).map(item => {
                const deadline = new Date(item.deadline);
                if (!isNaN(deadline.getTime())) { // Check if the date is valid
                    return {
                        title: item.name,
                        start: deadline,
                        end: deadline,
                        allDay: true,
                        type: "Project",
                        category: item?.category,
                        startedAt: item?.created_at
                            ? moment(parseInt(item?.created_at.toString())).format('MMMM Do YYYY')
                            : 'No Creation date'
                    };
                }
                return null; // Return null if the date is invalid
            }).filter(event => event), // Filter out any null events
        ];
        setEvents(combinedData);
    }


    async function fetchUserTasks() {
        if (!user) return null;
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('userid', user.id);
        if (error) console.error('Error fetching tasks:', error);
        return data;
    }

    async function fetchUserGoals() {
        if (!user) return null;
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('userid', user.id);
        if (error) console.error('Error fetching goals:', error);
        return data;
    }

    async function fetchUserProjects() {
        if (!user) return null;
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('created_by', user.id);
        if (error) console.error('Error fetching projects:', error);
        return data;
    }

    const nextWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, 7));
    };

    const prevWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, -7));
    };



    const renderDays = () => {
        const days = [];
        let hasEvents = false; // Flag to check if any events exist during the week

        const itemAnimation = {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
        };

        for (let i = 0; i < 7; i++) {
            const day = addDays(currentWeekStart, i);
            const dailyEvents = events.filter((event: any) =>
                format(event.start, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            );
            const today = new Date();
            const isToday = isSameDay(day, today);

            const dayLabel = isToday ? `${format(day, 'EEEE, MMMM do')} (today)` : format(day, 'EEEE, MMMM do');


            if (dailyEvents.length > 0) {
                hasEvents = true; // Set flag to true if any events exist

                days.push(
                    <motion.div
                        key={i}
                        className="border-[1px] rounded-lg my-1 bg-[#1f1f1f] border-[#535353] p-4 flex flex-col"
                        initial="hidden"
                        animate="visible"
                        layout
                        variants={itemAnimation}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <span className={`${isToday ? 'text-green-500' : 'text-white'} font-bold text-lg mb-3`}>{dayLabel} </span>
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2'>
                            {dailyEvents.map((event: any, index: number) => (
                                <motion.div
                                    key={index}
                                    className="my-1 p-3 border-[1px] border-[#535353] bg-[#313131] rounded"
                                    initial="hidden"
                                    animate="visible"
                                    layout

                                    variants={itemAnimation}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                >
                                    <div className='font-bold mb-2 text-white'>{event.title}</div>
                                    <div className='text-[#888] text-sm flex items-center gap-1'>
                                        <MdOutlineClass /> {event?.type}
                                    </div>
                                    <div className='text-[#888] text-sm flex items-center gap-1'>
                                        <BiCategory /> {event?.category}
                                    </div>
                                    <div className='text-[#888] text-sm flex items-center gap-1'>
                                        created: {event?.startedAt}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                );
            } else {
                days.push(
                    <motion.div
                        key={i}
                        className={`border-[1px] rounded-lg my-1 ${isToday ? 'text-green-500' : 'text-white'} bg-[#1f1f1f] border-[#535353] p-4 flex flex-col`}
                        initial="hidden"
                        animate="visible"
                        variants={itemAnimation}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <span className="font-bold text-lg mb-3">{dayLabel} </span>
                        <div className='my-1 text-gray-500'>No Deadlines</div>
                    </motion.div>
                );
            }
        }


        if (isLoaded) {
            if (!hasEvents && events != null) {
                return (
                    <motion.div
                        className="col-span-full p-5 my-1 bg-[#313131] overflow-hidden rounded-lg h-full flex items-center justify-center text-center text-lg"
                        initial="hidden"
                        animate="visible"
                        variants={itemAnimation}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        Yahoo! no deadlines for this week.

                        <Confetti
                            width={window.innerWidth}
                            height={window.innerHeight}
                            numberOfPieces={100}
                        />

                    </motion.div>
                );
            }
        } else {
            return (
                <div className='w-[20px] h-[20px]'>
                  <Loader />
                </div>
            )
        }

        // Check if there were no events for the entire week


        return days;
    };


    return (
        <div className='selectionNone'>
            <Sidebar location='Events' />
            <div className={`ml-[86px] p-3 flex gap-3 flex-col h-[100dvh]  mr-[0px]`}>
                <div className='h-auto w-full'>
                    <div className='text-2xl font-bold'>Deadlines</div>
                    <div className='text-sm text-[#888]'>
                    Track and manage deadlines for tasks, goals, and projects.
                    </div>
                </div>

                <div className='flex justify-start gap-2 flex-col-reverse items-start mt-2 sm:flex-row sm:justify-between'>
                    <div className="flex mb-4">
                        <button onClick={prevWeek} className="bg-[#111] hover:bg-[#222] border-[1px] border-[#535353] p-2 rounded-lg mr-2">Previous Week</button>
                        <button onClick={nextWeek} className="bg-[#111] hover:bg-[#222]  border-[1px] border-[#535353] p-2 rounded-lg ">Next Week</button>
                    </div>
                    <div className="text-sm font-bold text-[#888]">
                        ({format(currentWeekStart, 'MMM dd')} - {format(endOfWeek, 'MMM dd, yyyy')})
                    </div>
                </div>
                <div className="flex flex-col h-full overflow-auto text-[#888]">
                    {renderDays()}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
