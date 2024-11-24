import React, { useEffect, useRef, useState } from 'react'
import { LuLayoutDashboard } from "react-icons/lu";
import { GoTasklist } from "react-icons/go";
import { FaRegNoteSticky } from "react-icons/fa6";
import { LuGoal } from "react-icons/lu";
import { GoProjectSymlink } from "react-icons/go";
import { MdDateRange } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { supabase } from '../supabase/supabaseClient';
import IsLoggedIn from '../firebase/IsLoggedIn';
import gsap from 'gsap'
import { useNavigate } from 'react-router-dom';
import { IoIosNotifications } from "react-icons/io";
import useStore from '../Zustand/UseStore';
import FetchPFP from './FetchPFP';
import { GiArtificialHive } from "react-icons/gi";
import { motion } from 'framer-motion'
import { IoTimer } from "react-icons/io5";

interface dataType {
    userid: string;
    username: string;
    password: string;
    email: string;
    id: number;
    fullname: string;
}

interface paramsType {
    location: string
}

interface NotificationType {
    id: number;
    content: string;
    created_at: any; // Assuming this is a timestamp in milliseconds
    uid: string;
    linkofpage: string;
}




const Sidebar: React.FC<paramsType> = ({ location }) => {

    const [user] = IsLoggedIn()
    const { inviteToProject }: any = useStore()
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const { isSidebarHover, setIsSidebarHover }: any = useStore()
    const { setViewNotifs }: any = useStore()
    const [notifications, setNotifications] = useState<NotificationType[]>([]);

    useEffect(() => {
        if (user) {
            getAccounts();
            getNotifs()
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
    }, [user, inviteToProject]);


    const handleRealtimeEvent = (payload: any) => {
        console.log(payload)
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
                setNotifications((prevData: any) =>
                    prevData ? prevData.filter((item: NotificationType) => item.id !== payload.old.id) : null
                );
                break;
            default:
                break;
        }
    };




    const midRef = useRef<HTMLDivElement | null>(null)


    useEffect(() => {

        const btnSidebar = document.querySelectorAll('.btnSidebar');


        // Expand the sidebar
        function expandWidth() {
            // Expand only if the sidebar is not already expanded
            if (!isSidebarHover) {
                gsap.to(midRef.current, {
                    maxWidth: '200px',
                    duration: 0.3,
                    onStart: () => setIsSidebarHover(true), // Set hover state at start
                    onComplete: () => {
                        // Use gsap.set to show elements without flickering
                        btnSidebar.forEach(btn => {
                            gsap.set(btn.querySelectorAll('span'), { display: 'block' });
                            gsap.to(btn.querySelectorAll('span'), {
                                scale: '1',
                                transformOrigin: 'left center',
                                duration: 0.2
                            });
                        });
                    }
                });
            }
        }

        // Collapse the sidebar
        function decWidth() {
            // Collapse only if the sidebar is currently expanded
            if (isSidebarHover) {
                gsap.to(midRef.current, {
                    maxWidth: '80px',
                    duration: 0.3,
                    onComplete: () => setIsSidebarHover(false) // Set hover state at end
                });

                btnSidebar.forEach(btn => {
                    // Delay the display to prevent flicker
                    gsap.to(btn.querySelectorAll('span'), {
                        scale: '0',
                        transformOrigin: 'left center',
                        duration: 0.3,
                        onComplete: () => {
                            gsap.set(btn.querySelectorAll('span'), { display: 'none' }); // Hide after animation
                        }
                    });
                });
            }
        }

        // Add event listeners for hover actions
        midRef.current?.addEventListener('mouseover', expandWidth);
        midRef.current?.addEventListener('mouseleave', decWidth);


        // Initialize button states (sidebar collapsed)
        for (let i = 0; i < btnSidebar.length; i++) {
            gsap.to(btnSidebar[i].querySelectorAll('span'), {
                display: 'none',
                duration: 0
            });
            gsap.to(btnSidebar[i].querySelectorAll('span'), {
                scale: '0',
                transformOrigin: 'left center',
                duration: 0
            });
        }

        return () => {
            // Cleanup listeners on unmount
            midRef.current?.removeEventListener('mouseover', expandWidth);
            midRef.current?.removeEventListener('mouseleave', decWidth);
        };
    }, [isSidebarHover]);



    async function getAccounts() {
        try {
            const { data, error } = await supabase.from('accounts')
                .select('*')
                .eq('userid', user?.uid);
            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setFetchedData(data);
            }
        } catch (err) {
            console.log(err);
        }
    }


    const nav = useNavigate()


    function navigateToPages(params: string) {
        const btnSidebar = document.querySelectorAll('.btnSidebar')

        function exapandWidth() {
            gsap.to(midRef.current, {
                maxWidth: '80px',
                duration: 0.3
            })

            for (let i = 0; i < btnSidebar.length; i++) {
                gsap.to(btnSidebar[i].querySelectorAll('span'), {
                    display: 'none'
                })
                gsap.to(btnSidebar[i].querySelectorAll('span'), {
                    scale: '0',
                    transformOrigin: 'left center',
                    duration: 0.3
                })
            }
        }

        exapandWidth()
        nav(params)
    }

    function viewNotifFunc() {
        const btnSidebar = document.querySelectorAll('.btnSidebar')

        function exapandWidth() {
            gsap.to(midRef.current, {
                maxWidth: '80px',
                duration: 0.3
            })

            for (let i = 0; i < btnSidebar.length; i++) {
                gsap.to(btnSidebar[i].querySelectorAll('span'), {
                    display: 'none'
                })
                gsap.to(btnSidebar[i].querySelectorAll('span'), {
                    scale: '0',
                    transformOrigin: 'left center',
                    duration: 0.3
                })
            }
        }

        exapandWidth()
        setViewNotifs(true)
    }


    async function getNotifs() {
        try {
            const { data, error } = await supabase
                .from('notification')
                .select('*')
                .eq('uid', user?.uid)
                .order('created_at', { ascending: false });

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





    return (
        <div
            ref={midRef}
            className='flex flex-col border-r-[1px] overflow-auto border-r-[#414141] positioner text-[#c9c9c9] bg h-[100dvh] p-2 gap-3 w-full max-w-[80px]'>

            <div className='mb-1 px-5 pt-2 items-center justify-start  flex btnSidebar gap-3'>


                <div className='w-[25px] h-[25px] min-w-[25px] min-h-[25px] max-w-[25px] max-h-[25px] border-[1px] overflow-hidden rounded-full flex items-center justify-center'>
                    <FetchPFP userUid={user?.uid} />
                </div>

                <span className='flex flex-col'>
                    <div className='font-bold text-[15px]'>
                        {fetchedData && user && (
                            fetchedData[0]?.username.length >= 15
                                ? fetchedData[0]?.username.slice(0, 10) + '...'
                                : fetchedData[0]?.username
                        )}
                    </div>
                    <div className='text-[#888] text-[10px]'>
                        {fetchedData && user && (
                            fetchedData[0]?.email.length >= 15
                                ? fetchedData[0]?.email.slice(0, 15) + '...'
                                : fetchedData[0]?.email
                        )}
                    </div>
                </span>
            </div>
            <div
                className='flex flex-col gap-3 border-y-[.1px] border-y-[#303030] py-1 justify-start'>
                <div
                    onClick={() => { navigateToPages("/user/dashboard") }}
                    className={`${location === "Dashboard" && 'bg-[#414141]'} btnSidebar flex gap-2 items-center cursor-pointer py-2 rounded-lg w-full justify-start p-5 hover:bg-[#414141]`}>
                    <div className='text-2xl'><LuLayoutDashboard /></div><span> Dashboard</span>
                </div>
                <div
                    onClick={() => { navigateToPages("/user/tasks") }}
                    className={`${location === "Tasks" && 'bg-[#414141]'} btnSidebar flex gap-2 items-center cursor-pointer py-2 rounded-lg w-full justify-start p-5 hover:bg-[#414141]`}>
                    <div className='text-2xl'>
                        <GoTasklist />
                    </div>
                    <span>Tasks</span>
                </div>
                <div
                    onClick={() => { navigateToPages("/user/notes") }}
                    className={`${location === "Notes" && 'bg-[#414141]'} btnSidebar flex gap-2 items-center cursor-pointer py-2 rounded-lg w-full justify-start p-5 hover:bg-[#414141]`}>

                    <div className='text-2xl'>
                        <FaRegNoteSticky />
                    </div>
                    <span>Notes</span>
                </div>
                <div
                    onClick={() => { navigateToPages("/user/goals") }}
                    className={`${location === "Goals" && 'bg-[#414141]'} btnSidebar flex gap-2 items-center cursor-pointer py-2 rounded-lg w-full justify-start p-5 hover:bg-[#414141]`}>

                    <div className='text-2xl'>
                        <LuGoal />
                    </div>
                    <span> Goals</span>
                </div>

                <div
                    onClick={() => { navigateToPages("/user/projects") }}
                    className={`${location === "Projects" && 'bg-[#414141]'} btnSidebar flex gap-2 items-center cursor-pointer py-2 rounded-lg w-full justify-start p-5 hover:bg-[#414141]`}>

                    <div className='text-2xl'>
                        <GoProjectSymlink />
                    </div>
                    <span>Projects</span>
                </div>

                <div
                    onClick={() => { navigateToPages("/user/pomodoro") }}
                    className={`${location === "Pomodoro" && 'bg-[#414141]'} btnSidebar flex gap-2 items-center cursor-pointer py-2 rounded-lg w-full justify-start p-5 hover:bg-[#414141]`}>

                    <div className='text-2xl'>
                        <IoTimer />
                    </div>
                    <span>Pomodoro</span>
                </div>


                <div
                    onClick={() => { navigateToPages("/user/calendar") }}
                    className={`${location === "Events" && 'bg-[#414141]'} btnSidebar flex gap-2 items-center cursor-pointer py-2 rounded-lg w-full justify-start p-5 hover:bg-[#414141]`}>

                    <div className='text-2xl'>
                        <MdDateRange />
                    </div>
                    <span>Deadlines</span>
                </div>
                
                <div
                    onClick={() => { navigateToPages("/user/ask-orgamix") }}
                    className={`${location === "Ask" && 'bg-[#414141]'} btnSidebar flex gap-2 items-center cursor-pointer py-2 rounded-lg w-full justify-start p-5 hover:bg-[#414141]`}
                >
                    {/* Add motion.div for the rotating icon */}
                    <motion.div
                        className="text-2xl"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: .5 }}
                    >
                        <GiArtificialHive />
                    </motion.div>
                    <span>Ask AI</span>
                </div>


            </div>

            <div className='border-t-[.1px] border-t-[#303030] mt-auto pt-1'>
                <div
                    onClick={() => { viewNotifFunc() }}
                    className={`${location === "Notfication" && 'bg-[#414141]'} btnSidebar flex gap-2 items-center cursor-pointer py-2 rounded-lg w-full justify-start p-5 hover:bg-[#414141]`}>
                    <div className='text-2xl relative'>
                        <IoIosNotifications />
                        {
                            notifications.length > 0 &&
                            <div className='absolute top-[-10px] text-white bg-[#111]  h-[20px] flex items-center p-1 rounded-md text-[12px] left-[65%]'>
                                {
                                    notifications.length > 999 ? "999+" : notifications.length
                                }
                            </div>
                        }
                    </div>

                    <span>Notification</span>

                </div>
                <div
                    onClick={() => { navigateToPages("/user/settings") }}
                    className={`${location === "Settings" && 'bg-[#414141]'} mt-2  btnSidebar flex gap-2 items-center cursor-pointer py-2 rounded-lg w-full justify-start p-5 hover:bg-[#414141]`}>
                    <div className='text-2xl'>
                        <IoSettingsOutline />
                    </div>
                    <span>Settings</span>
                </div>

            </div>

        </div>
    )
}

export default Sidebar
