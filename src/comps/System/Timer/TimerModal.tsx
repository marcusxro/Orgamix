import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import { supabaseTwo } from '../../../supabase/supabaseClient';
import { motion } from 'framer-motion';
import { IoIosArrowBack } from "react-icons/io";
import { GrPowerReset } from "react-icons/gr";
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { GiNextButton } from "react-icons/gi";
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import useStore from '../../../Zustand/UseStore';

interface WorksType {
    title: string;
    category: string;
    type: string;
    isTaskDone: boolean;
    workID: string;
}

interface PomodoroDataType {
    user_id: string;
    created_at: string;
    works: WorksType[];
    remaining_time: number;
    is_running: boolean;
    updated_at: string;
    type: string;
    work_timer: number;
    short_timer: number;
    long_timer: number;
    id: number;
    musicID: string;
    autoStart: boolean;
    autoChecked: boolean;
}

const TimerModal = () => {
    const location = useLocation();
    const [user]:any = IsLoggedIn();
    const [pomodoroData, setPomodoroData] = useState<PomodoroDataType[] | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const timerInterval = useRef<NodeJS.Timeout | null>(null);
    const [timerDB, setTimerDB] = useState(0);
    const [isExpand, setIsExpand] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { isPaused, setIsPaused }: any = useStore();
    const [isFirstUser, setIsFirstUser] = useState(false);

    // Helper to fetch pomodoro data
    const getPomodoroData = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabaseTwo
                .from('timer')
                .select('*')
                .eq('user_id', user?.id);

            if (error) {
                console.error('Error fetching timer data:', error);
                return;
            }

            if (data?.length) {
                setPomodoroData(data);
                const timer = data[0];
                const selectedType = timer.type || 'Work';

                const timerDuration =
                    selectedType === 'Work'
                        ? (timer.work_timer || 25) * 60
                        : selectedType === 'Short'
                            ? (timer.short_timer || 5) * 60
                            : (timer.long_timer || 15) * 60;

                const updatedAt = timer.updated_at ? new Date(timer.updated_at).getTime() : null;
                const now = Date.now();
                const elapsedTime = updatedAt ? Math.floor((now - updatedAt) / 1000) : 0;

                const adjustedRemainingTime = timer.is_running
                    ? Math.max(0, (timer.remaining_time || timerDuration) - elapsedTime)
                    : timer.remaining_time || timerDuration;

                setRemainingTime(adjustedRemainingTime);
                setTimerDB(adjustedRemainingTime);
                setIsFirstUser(true);
                setIsRunning(timer.is_running);
            }
        } catch (error) {
            console.error('Error fetching pomodoro data:', error);
        }
    };

    // Handle real-time updates
    const handleRealtimeEvent = (payload: any) => {
        if (!isFirstUser) return; // Only the first user should listen to the updates
        const isCurrentUserProject = payload.new?.user_id === user?.id || payload.old?.user_id === user?.id;
        if (!isCurrentUserProject) return;

        switch (payload.eventType) {
            case 'INSERT':
                setPomodoroData((prevData) =>
                    prevData ? [...prevData, payload.new] : [payload.new]
                );
                break;
            case 'UPDATE':
                setPomodoroData((prevData) =>
                    prevData
                        ? prevData.map((item) =>
                            item.id === payload.new.id ? payload.new : item
                        )
                        : [payload.new]
                );
                break;
            case 'DELETE':
                setPomodoroData((prevData) =>
                    prevData ? prevData.filter((item) => item.id !== payload.old.id) : null
                );
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        if (user) {
            getPomodoroData();
            const subscription = supabaseTwo
                .channel('public:timer')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'timer' }, (payload) => {
                    handleRealtimeEvent(payload);
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user, isRunning]);

    // Update timer state
    const updateTimerState = async (time: number, running: boolean, type: string) => {
        if (!user) return;
        try {
            await supabaseTwo
                .from('timer')
                .update({
                    remaining_time: time,
                    is_running: running,
                    type: type,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id);
        } catch (error) {
            console.error('Error updating timer state:', error);
        }
    };

    // Start the timer
    async function startTimer() {
        if (pomodoroData && !isPaused) {
            const timer = pomodoroData[0];
            const running = true;
            const type = timer.type;
            const initialRemainingTime = remainingTime || 0;

            setRemainingTime(initialRemainingTime);
            await updateTimerState(initialRemainingTime, true, type);

            if (timerInterval.current) {
                clearInterval(timerInterval.current);
            }
            setIsPaused(false);

            timerInterval.current = setInterval(() => {
                setTimerDB((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerInterval.current!);
                        updateTimerState(0, false, type);
                        setIsRunning(false);
                        return 0;
                    }
                    updateTimerState(prev - 1, running, type);
                    return prev - 1;
                });
            }, 1000);
        }
    }

    useEffect(() => {
        return () => {
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
            }
        };
    }, []);

    useEffect(() => {
        if (user && remainingTime > 0 && isRunning && !isPaused) {
            const intervalId = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalId);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Cleanup the interval on unmount
            return () => clearInterval(intervalId);
        }
    }, [user, isRunning, isPaused]);

    useEffect(() => {
        if (isRunning && location.pathname.includes('/user') && location.pathname !== '/user/pomodoro' && !isPaused) {
            startTimer();
        }

        const handleBeforeUnload = () => {
            if (isRunning) {
                updateTimerState(remainingTime, true, pomodoroData![0].type);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };

    }, [isRunning, location.pathname, isPaused]);

    if (!(isRunning && location.pathname.includes('/user') && location.pathname !== '/user/pomodoro')) {
        return null;
    }

    // Format time for display
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}m ${seconds}s`;
    };

    async function workDone(workID: string) {
        if (!user) return;
        try {
            const { data, error } = await supabaseTwo
                .from('timer')
                .select('works')
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching works:', error);
                return;
            }

            if (data && data.length > 0) {
                const updatedWorks = data[0].works.map((work: WorksType) =>
                    work.workID === workID ? { ...work, isTaskDone: !work.isTaskDone } : work
                );

                await supabaseTwo
                    .from('timer')
                    .update({ works: updatedWorks })
                    .eq('user_id', user.id);
            }
        } catch (error) {
            console.error('Error updating work state:', error);
        }
    }

    async function pauseTimer() {
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
        }

        setIsPaused(true);
        setIsRunning(false);
        console.log('pause');
    }

    return (
        <>
            {
                isExpand ? (
                    <motion.div
                        className={`${pomodoroData && pomodoroData[0]?.type === "Work" ? 'border-[#42b3f5] text-[#42b3f5]' :
                            pomodoroData && pomodoroData[0]?.type === "Short" ? 'border-[#03fc88] text-[#03fc88]' :
                                pomodoroData && pomodoroData[0]?.type === "Long" ? 'border-[#fc9d03] text-[#fc9d03]' : ''} 
                            border-[1px] fixed right-[-3px] max-h-[100vh] top-1/2 transform translate-x-1/2  -translate-y-1/2 rotate-90 bg-[#090909] p-2 z-[50000000] rounded-md`}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={{ hidden: { x: '100%' }, visible: { x: '0%' } }}
                        transition={{ duration: 0.5 }}
                    >
                        <div
                            ref={containerRef}
                            className='flex gap-2 items-center text-center p-5 justify-center'>
                            <CountdownCircleTimer
                                colors={`${pomodoroData && pomodoroData[0]?.type === "Work" ? '#42b3f5' : pomodoroData && pomodoroData[0]?.type === "Short" ? '#03fc88' : '#fc9d03'}`}
                                duration={remainingTime}
                                size={100}
                                strokeLinecap="round"
                                isSmoothColorTransition
                                strokeWidth={5}
                                isPlaying={!!(isRunning && pomodoroData && pomodoroData[0]?.type === 'Work')}
                                key={`timer-${pomodoroData?.[0]?.type}-${pomodoroData?.[0]?.work_timer ? pomodoroData[0].work_timer * 60 : 0}`}
                                onUpdate={(_) => {
                                    const timerElement = document.getElementById('timer-text');
                                    if (timerElement) {
                                        timerElement.classList.add('slide-down');
                                        setTimeout(() => {
                                            timerElement.classList.remove('slide-down');
                                        }, 500);
                                    }
                                }}
                            >
                                {({ remainingTime }) => (
                                    <div id="timer-text" className="timer-text text-sm font-bold bg-transparent">
                                        {formatTime(remainingTime)}
                                    </div>
                                )}
                            </CountdownCircleTimer>
                        </div>

                        <div className='w-full flex gap-5 justify-center items-center text-sm px-4'>
                            {
                                isPaused ?
                                    <div
                                        onClick={startTimer}
                                        className='hover:text-[#444] cursor-pointer'>
                                        <FaPlay />
                                    </div>
                                    :
                                    <div
                                        onClick={pauseTimer}
                                        className='hover:text-[#444] cursor-pointer'>
                                        <FaPause />
                                    </div>
                            }

                            <div className='hover:text-[#444] cursor-pointer'>
                                <GrPowerReset />
                            </div>

                            <div className='hover:text-[#444] cursor-pointer'>
                                <GiNextButton />
                            </div>
                        </div>

                        <div className='text-sm font-normal text-[#888] my-3 flex flex-col gap-2 mt-5'>
                            {
                                pomodoroData && pomodoroData[0]?.works != null && pomodoroData[0]?.works.map((work, idx) => (
                                    <div key={idx} className={`${work?.isTaskDone && "text-green-500 line-through"} flex gap-2 items-center`}>
                                        <div className='mt-1'>
                                            <input
                                                onClick={() => workDone(work.workID)}
                                                className='hover:text-[#444] cursor-pointer'
                                                type='checkbox' checked={work.isTaskDone} />
                                        </div>
                                        <p className='font-bold'>{work.title}</p>
                                    </div>
                                ))
                            }
                        </div>
                        <div
                            onClick={() => setIsExpand(false)}
                            className='w-full bg-[#222] cursor-pointer text-center justify-center items-center flex mt-5 rounded-md text-white border-[1px] border-[#535353]'>
                            Close
                        </div>
                    </motion.div>
                )
                    :
                    <motion.div
                        onClick={() => setIsExpand(true)}
                        className={`${pomodoroData && pomodoroData[0]?.type === "Work" ? 'border-[#42b3f5] text-[#42b3f5]' :
                            pomodoroData && pomodoroData[0]?.type === "Short" ? 'border-[#03fc88] text-[#03fc88]' :
                                pomodoroData && pomodoroData[0]?.type === "Long" ? 'border-[#fc9d03] text-[#fc9d03]' : ''} 
                            border-[1px] fixed right-[-5px] cursor-pointer top-1/2 transform translate-x-1/2  -translate-y-1/2 rotate-90 bg-[#090909] p-1 z-[50000000] rounded-md`}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={{ hidden: { x: '100%' }, visible: { x: '0%' } }}
                        transition={{ duration: 0.5 }}
                    >
                        <IoIosArrowBack />
                    </motion.div>
            }
        </>
    );
};

export default TimerModal;