import React, { useEffect, useState } from 'react'
import IsLoggedIn from '../../Utils/IsLoggedIn';
import { supabase } from '../../../supabase/supabaseClient';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../../Zustand/UseStore';

interface dataType {
    id: number;
    content: string;
    created_at: any; // Assuming this is a timestamp in milliseconds
    uid: string;
    linkofpage: string;
}

const NotifShow: React.FC = () => {
    const [user]:any = IsLoggedIn();
    const [notification, setNotifications] = useState<dataType[] | null>(null);


    useEffect(() => {
        if (user) {
            getNotifs();
            const subscription = supabase
                .channel('public:notification')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'notification' }, (payload) => {
          
                    handleRealtimeEvent(payload);
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };

        }
    }, [user]);

    const handleRealtimeEvent = (payload: any) => {
        if (!notification) return
        switch (payload.eventType) {
            case 'INSERT':
                setNotifications((prevData) =>
                    prevData ? [...prevData, payload.new] : [payload.new]
                );
                break;
            case 'UPDATE':
                setNotifications((prevData) =>
                    prevData
                        ? prevData.map((item) =>
                            item.id === payload.new.id ? payload.new : item
                        )
                        : [payload.new]
                );
                break;
            case 'DELETE':
                console.log("DELETED")
                setNotifications((prevData) =>
                    prevData ? prevData.filter((item) => item.id !== payload.old.id) : null
                );
                break;
            default:
                break;

        };
    }

    async function getNotifs() {
        try {
            const { data, error } = await supabase
                .from('notification')
                .select('*')
                .eq('uid', user?.id)
                .order('created_at', { ascending: false }) // Sort by latest notifications
                .range(0, 20) // Limit to 20 notifications


            if (data) {
                setNotifications(data); // Set initial notifications

            }

            if (error) {
                console.log(error);
            }
        } catch (err) {
            console.log(err);
        }
    }
    const nav = useNavigate()

    const { setViewNotifs }: any = useStore()


    return (
        <div>
            <div className='font-bold mb-2'>
                Recent Notifications
            </div>
            {
                notification != null && notification.length === 0 &&
                <div className='bg-[#191919] p-2 gap-2 flex flex-col rounded-lg'>
                    <div className='text-gray-400 text-center'>No notifications yet</div>
                </div>
            }
            {
                notification === null &&
                <AnimatePresence>
                    <div className='bg-[#191919] p-2 gap-2 flex flex-col rounded-lg'>
                        <motion.div
                            className="min-h-[60px] w-full bg-[#888] rounded-md"
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5], scaleY: 1 }}
                            exit={{ opacity: 0, scaleY: 0 }}
                            transition={{
                                scaleY: { duration: 0.3 }, // Adjust the speed of initial scale-up here
                                opacity: { repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0 },
                            }}
                            style={{ transformOrigin: 'bottom' }}
                        ></motion.div>
                        <motion.div
                            className="min-h-[60px] w-full bg-[#888] rounded-md"
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5], scaleY: 1 }}
                            exit={{ opacity: 0, scaleY: 0 }}
                            transition={{
                                scaleY: { duration: 0.3 }, // Adjust the speed of initial scale-up here
                                opacity: { repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0 },
                            }}
                            style={{ transformOrigin: 'bottom' }}
                        ></motion.div>
                        <motion.div
                            className="min-h-[60px] w-full bg-[#888] rounded-md"
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5], scaleY: 1 }}
                            exit={{ opacity: 0, scaleY: 0 }}
                            transition={{
                                scaleY: { duration: 0.3 }, // Adjust the speed of initial scale-up here
                                opacity: { repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0 },
                            }}
                            style={{ transformOrigin: 'bottom' }}
                        ></motion.div>
                        <motion.div
                            className="min-h-[60px] w-full bg-[#888] rounded-md"
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5], scaleY: 1 }}
                            exit={{ opacity: 0, scaleY: 0 }}
                            transition={{
                                scaleY: { duration: 0.3 }, // Adjust the speed of initial scale-up here
                                opacity: { repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0 },
                            }}
                            style={{ transformOrigin: 'bottom' }}
                        ></motion.div>
                        <motion.div
                            className="min-h-[60px] w-full bg-[#888] rounded-md"
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5], scaleY: 1 }}
                            exit={{ opacity: 0, scaleY: 0 }}
                            transition={{
                                scaleY: { duration: 0.3 }, // Adjust the speed of initial scale-up here
                                opacity: { repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0 },
                            }}
                            style={{ transformOrigin: 'bottom' }}
                        ></motion.div>
                    </div>
                </AnimatePresence>
            }
            {
                notification != null && notification.length > 0 &&
                <div className='bg-[#191919] p-2 gap-2 flex flex-col rounded-lg'>
                    {notification && notification.map((notif, index) => (
                        <motion.div
                            onClick={() => { nav('/' + notif?.linkofpage) }}
                            className='bg-[#222] border-[1px] border-[#535353] hover:bg-[#333] cursor-pointer rounded-lg flex justify-between items-start flex-col'
                            key={`${notif.id}-${index}`}
                            initial={{ y: 20, opacity: 0 }} // Initial position and opacity
                            animate={{ y: 0, opacity: 1 }} // End position and opacity
                            transition={{
                                duration: 0.4,
                                delay: index * 0.1 // Staggered animation
                            }}
                        >
                            <div className='p-3 rounded-lg flex justify-between gap-2 items-start w-full'>
                                <span className='w-full max-w-[300px]'>{notif.content}</span>
                                <span className="text-gray-400 text-sm whitespace-nowrap">
                                    {notif.created_at ? moment(notif.created_at).format('h:mm A') : 'No Creation date'}
                                </span>
                            </div>

                            {moment().diff(moment(notif?.created_at), 'seconds') < 5 && (
                                <div className='mx-3 my-2 border-[1px] border-[#535353] p-1 px-2 text-sm text-green-500 rounded-md'>new</div>
                            )}
                        </motion.div>
                    ))}
                    <motion.div
                        onClick={() => { setViewNotifs(true) }}
                        className='bg-[#111] p-2 text-green-500 rounded-lg border-[1px] border-[#535353] cursor-pointer'
                        whileHover={{ scale: 1.05 }} // Hover effect for extra interactivity
                    >
                        View all your notifications
                    </motion.div>
                </div>
            }
        </div>
    )
}

export default NotifShow
