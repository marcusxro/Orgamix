import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import { supabaseTwo } from '../../../supabase/supabaseClient';
import { motion } from 'framer-motion';

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
    const [user] = IsLoggedIn();
    const [pomodoroData, setPomodoroData] = useState<PomodoroDataType[] | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const timerInterval = useRef<NodeJS.Timeout | null>(null);
    const [timerDB, setTimerDB] = useState(0);
    // Helper to fetch pomodoro data


    const getPomodoroData = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabaseTwo
                .from('timer')
                .select('*')
                .eq('user_id', user?.uid);

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

    const [isFirstUser, setIsFirstUser] = useState(false);
    // Handle real-time updates
    const handleRealtimeEvent = (payload: any) => {
        if (!isFirstUser) return; // Only the first user should listen to the updates
        const isCurrentUserProject = payload.new?.user_id === user?.uid || payload.old?.user_id === user?.uid;
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
            getPomodoroData()
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
    }, [user, isRunning]); // Update on `sortVal` change as well



    // Update timer state
    const updateTimerState = async (time: number, running: boolean, type: string) => {
        if (!user) return;
        try {
            await supabaseTwo
                .from('timer')
                .update({
                    remaining_time: time,
                    is_running: running,
                    type,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.uid);
        } catch (error) {
            console.error('Error updating timer state:', error);
        }
    };

    // Start the timer
    async function startTimer() {
        if (pomodoroData) {
            const timer = pomodoroData[0];
            const running = true;
            const type = timer.type;
            const initialRemainingTime = remainingTime || 0;

            setRemainingTime(initialRemainingTime);
            await updateTimerState(initialRemainingTime, true, type);

            if (timerInterval.current) {
                clearInterval(timerInterval.current);
            }

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
        if (user && remainingTime <= 0 && isRunning) {
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
    }, [user, isRunning]);


    useEffect(() => {
        if (isRunning && location.pathname.includes('/user') && location.pathname !== '/user/pomodoro') {
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
        
    }, [isRunning, location.pathname]);

    if (!(isRunning && location.pathname.includes('/user') && location.pathname !== '/user/pomodoro')) {
        return null;
    }

    // Format time for display
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}m ${seconds}s`;
    };





    return (
        <motion.div
            className="fixed right-0 top-1/2 transform translate-x-1/2  -translate-y-1/2 rotate-90 bg-gray-800 p-2 z-[50000000] border border-gray-600 rounded-md"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{ hidden: { x: '100%' }, visible: { x: '0%' } }}
            transition={{ duration: 0.5 }}
        >
            {formatTime(timerDB)}
        </motion.div>
    );
};

export default TimerModal;
