import React, { useEffect, useRef, useState } from 'react'
import { LuLayoutDashboard } from "react-icons/lu";
import { GoTasklist } from "react-icons/go";
import { FaRegNoteSticky } from "react-icons/fa6";
import { LuGoal } from "react-icons/lu";
import { GoProjectSymlink } from "react-icons/go";
import { AiOutlineAudit } from "react-icons/ai";
import { IoSettingsOutline } from "react-icons/io5";
import { supabase } from '../supabase/supabaseClient';
import IsLoggedIn from '../firebase/IsLoggedIn';
import gsap from 'gsap'
import userNoProfile from '../assets/UserNoProfile.jpg'
import { useNavigate } from 'react-router-dom';


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

const Sidebar: React.FC<paramsType> = ({location}) => {

    const [user] = IsLoggedIn()

    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);


    useEffect(() => {
       if(user) { getAccounts();}
    }, [user]);

    const midRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const btnSidebar = document.querySelectorAll('.btnSidebar')

        function exapandWidth() {
            gsap.to(midRef.current, {
                maxWidth: '200px',
                duration: 0.3
            })

            for (let i = 0; i < btnSidebar.length; i++) {
                gsap.to(btnSidebar[i].querySelectorAll('span'), {
                    display: 'block'
                })
                gsap.to(btnSidebar[i].querySelectorAll('span'), {
                    scale: '1',
                    transformOrigin: 'left center',
                    duration: 0.3
                })
            }
        }

        function decWidth() {
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


        midRef.current?.addEventListener("mouseover", exapandWidth)
        midRef.current?.addEventListener("mouseleave", decWidth)


        for (let i = 0; i < btnSidebar.length; i++) {
            gsap.to(btnSidebar[i].querySelectorAll('span'), {
                display: 'none',
            })
            gsap.to(btnSidebar[i].querySelectorAll('span'), {
                scale: '0',
                transformOrigin: 'left center',
                duration: 0,
            })
        }

        return () => {
            midRef.current?.addEventListener("mouseover", exapandWidth)
            midRef.current?.addEventListener("mouseleave", decWidth)
        }
    }, [])

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

    return (
        <div
            ref={midRef}
            className='flex flex-col border-r-[1px] overflow-auto border-r-[#414141] positioner text-[#c9c9c9] bg h-[100dvh] p-2 gap-3 w-full max-w-[80px]'>

            <div className='mb-1 px-5 pt-2 items-center justify-start  flex btnSidebar gap-3'>

                <div className='w-[25px] h-[25px] overflow-hidden rounded-full bg-red-700'>
                    <img src={userNoProfile} className='w-full h-full object-cover' alt="" />
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
                    onClick={() => { navigateToPages("/user/tasks")}}
                    className={`${location === "Tasks" && 'bg-[#414141]'} btnSidebar flex gap-2 items-center cursor-pointer py-2 rounded-lg w-full justify-start p-5 hover:bg-[#414141]`}>
                    <div className='text-2xl'>
                        <GoTasklist />
                    </div>
                    <span>Tasks</span>
                </div>
                <div
                    onClick={() => { navigateToPages("/user/notes")}}
                    className={`${location === "Notes" && 'bg-[#414141]'} btnSidebar flex gap-2 items-center cursor-pointer py-2 rounded-lg w-full justify-start p-5 hover:bg-[#414141]`}>

                    <div className='text-2xl'>
                        <FaRegNoteSticky />
                    </div>
                    <span>Notes</span>
                </div>
                <div
                    onClick={() => { navigateToPages("/user/goals")}}
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
                    onClick={() => { navigateToPages("/user/tasks") }}
                    className={`${location === "Events" && 'bg-[#414141]'} btnSidebar flex gap-2 items-center cursor-pointer py-2 rounded-lg w-full justify-start p-5 hover:bg-[#414141]`}>

                    <div className='text-2xl'>
                        <AiOutlineAudit />
                    </div>
                    <span>Events</span>
                </div>

            </div>
            <div className='border-t-[.1px] border-t-[#303030] mt-auto pt-1'>
                <div
                    onClick={() => { navigateToPages("/user/tasks") }}
                    className={`${location === "Settings" && 'bg-[#414141]'} btnSidebar flex gap-2 items-center cursor-pointer py-2 rounded-lg w-full justify-start p-5 hover:bg-[#414141]`}>

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
