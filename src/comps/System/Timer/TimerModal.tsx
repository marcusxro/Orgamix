import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import { supabaseTwo } from '../../../supabase/supabaseClient';
import { motion } from 'framer-motion';

interface worksType {
    title: string;
    category: string;
    type: string;
    isTaskDone: boolean;
    workID: string;
}

interface pomodoroDataType {
    user_id: string;
    created_at: string;
    works: worksType[];
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
    const [pomodoroData, setPomodoroData] = useState<pomodoroDataType[] | null>(null);
    const [isRunning, setIsRunning] = useState(false);

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
    }, [user, location]);

    const [isFirstUser] = useState(false);

    const handleRealtimeEvent = (payload: any) => {
        if (!isFirstUser) return;
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

    async function getPomodoroData() {
        try {
            const { data, error } = await supabaseTwo
                .from('timer')
                .select('*')
                .eq('user_id', user?.uid);

            if (error) {
                console.error('Error fetching timer data:', error);
                return;
            } else {
                if (data) {
                    setPomodoroData(data);
                    if (data[0].is_running) {
                        console.log(data[0].is_running)
                        setIsRunning(true);
                    } else {
                        setIsRunning(false);
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if (user && pomodoroData) {
            if ((location.pathname.includes('/user') && location.pathname !== '/user/pomodoro') && isRunning) {
                console.log("TimerModal mounted");
                return
            }
        }
    }, [location, user, isRunning, pomodoroData]);

    if (!((location.pathname.includes('/user') && location.pathname !== '/user/pomodoro') && isRunning)) {
        return null;
    }

  
    

    const variants = {
        hidden: { x: '100%' },
        visible: { x: '0%' },
    };
    

    return (
        <motion.div
            className='fixed right-[10px] rounded-r-md rounded-l-md top-[50%] transform translate-x-[50%] translate-y-[-50%] rotate-90 bg-[#111] p-2 z-[5000] border-[1px] border-[#535353]'
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ duration: 0.5 }}
        >
            Timer is running
        </motion.div>
    );
    
}

export default TimerModal
