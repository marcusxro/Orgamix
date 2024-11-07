import React, { useEffect, useState } from 'react'
import { FaHome, FaRegStar } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import useStore from '../../../Zustand/UseStore';
import { supabase } from '../../../supabase/supabaseClient';
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import { useNavigate } from 'react-router-dom';
import { BsShareFill } from "react-icons/bs";
import Loader from '../../Loader';
import { motion } from 'framer-motion'
interface propsType {
    isUid: string | undefined
}

interface invitedEmails {
    username: string;
    email: string;
    uid: string;
}

interface updatedAt {
    date: string;
    username: string;
    email: string;
    uid: string;
    itemMoved: string
}


interface tasksType {
    title: string;
    created_at: number;
    created_by: string;
    priority: string;
    type: string;
    start_work: string;
    deadline: string;
    assigned_to: string; //uid basis
}

interface boardsType {
    title: string;
    titleColor: string; //hex
    created_at: number;
    board_uid: string;
    created_by: string;
    tasks: tasksType[]
}

interface MessageType {

    userEmail: any;
    userid: any;
    id: number; //timestamp
    content: string

}

interface dataType {
    description: string;
    id: number;
    created_at: number;
    name: string;
    created_by: string;
    deadline: number;
    is_shared: any;
    invited_emails: null | invitedEmails[];
    updated_at: null | updatedAt[];
    is_favorite: boolean;
    boards: boardsType[]
    chatArr: MessageType[]
}


const ProjectSidebar: React.FC<propsType> = ({ isUid }) => {


    const { openNew, setOpenNew }: any = useStore()
    const { sidebarLoc, setSidebarLoc }: any = useStore()
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [user] = IsLoggedIn()
    const [searchVal, setSearchVal] = useState("")
    const [filteredData, setFilteredData] = useState<dataType[] | null>(null);


    const [isMobile, setIsMobile] = useState(window.innerWidth >= 768);


    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth >= 768);
        };

        // Add event listener for resize
        window.addEventListener("resize", handleResize);

        // Cleanup the event listener on component unmount
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (isMobile) {
            setSidebarLoc("Home")
        } else {
            console.log("nyawnyaw");
        }
    }, [isMobile]);


    useEffect(() => {
        const foundFiltered = fetchedData && fetchedData?.filter((itm: dataType) => {
            return itm?.name.toLowerCase().includes(searchVal.toLowerCase())
        })

        setFilteredData(foundFiltered)

    }, [searchVal, fetchedData])

    useEffect(() => {
        if (user) {
            getProjects();
            const subscription = supabase
                .channel('public:projects')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                    console.log('Realtime event:', payload);
                    handleRealtimeEvent(payload);
                })
                .subscribe();
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user]);

    const handleRealtimeEvent = (payload: any) => {
        switch (payload.eventType) {
            case 'INSERT':
                setFetchedData((prevData) =>
                    prevData ? [...prevData, payload.new] : [payload.new]
                );
                break;
            case 'UPDATE':
                setFetchedData((prevData) =>
                    prevData
                        ? prevData.map((item) =>
                            item.id === payload.new.id ? payload.new : item
                        )
                        : [payload.new]
                );
                break;
            case 'DELETE':
                console.log("DELETED")
                setFetchedData((prevData) =>
                    prevData ? prevData.filter((item) => item.id !== payload.old.id) : null
                );
                break;
            default:
                break;
        }
    };

    async function getProjects() {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')


            if (error) {
                console.error('Error fetching data:', error);
            } else {
                const fetchedProjects: dataType[] = data || []; // Fallback to empty array


                const arrayOfInvitations = fetchedProjects.filter((itm) =>
                    itm?.invited_emails?.some((itmz: any) => itmz?.userid === user?.uid)
                );


                setFetchedData(arrayOfInvitations)
            }
        } catch (err) {
            console.log(err);
        }
    }

    const nav = useNavigate()

    return (
        <div className='sticky top-0 w-full h-auto md:h-screen border-r-[1px] border-r-[#414141] p-3'>

            <div className='h-full overflow-y-auto'>
                <div className="border-b-[1px] overflow-auto border-b-[#414141] items-center flex flex-row gap-2 mb-2 md:flex-col md:items-start pb-3">
                    <div
                        onClick={() => { setSidebarLoc("Home") }}
                        className={`${sidebarLoc === 'Home' && "bg-[#111] border-[#535353] border-[1px]"} h-[40px] lg:h-full  w-auto md:w-full flex items-center gap-2 md:text-lg px-3 py-1 text-left rounded-lg cursor-pointer`}>
                        <FaHome /><span className={`${sidebarLoc === "Home" ? "flex" : "hidden sm:flex"} `}>Home</span>
                    </div>
                    <div
                        onClick={() => { setSidebarLoc("Favs") }}
                        className={`${sidebarLoc === 'Favs' && "bg-[#111] border-[#535353] border-[1px]"}  h-[40px] lg:h-full   w-auto md:w-full  flex items-center gap-2 md:text-lg px-3 py-1 text-left rounded-lg cursor-pointer`}>
                        <FaRegStar /> <span className={`${sidebarLoc === "Favs" ? "flex" : "hidden sm:flex"} `}>Favorite</span>
                    </div>

                    <div
                        onClick={() => { setSidebarLoc("Shared") }}
                        className={`${sidebarLoc === 'Shared' && "bg-[#111] border-[#535353] border-[1px]"}  h-[40px] lg:h-full   w-auto md:w-full   items-center gap-2 flex lg:hidden md:text-lg px-3 py-1 text-left rounded-lg cursor-pointer`}>
                        <BsShareFill /> <span className={`${sidebarLoc === "Shared" ? "flex" : "hidden sm:flex"} `}>Shared</span>
                    </div>

                    <div
                        onClick={() => { setOpenNew(!openNew) }}
                        className='p-3 md:hidden cursor-pointer rounded-lg ml-auto flex items-center justify-center bg-[#111111] outline-none border-[#535353] border-[1px]   text-[#888]'
                    >
                        <FaPlus />
                    </div>

                </div>

                <div className='hidden md:flex font-bold'>
                    Shared Projects
                </div>


                <div className='gap-2 mt-2 hidden md:flex'>
                    <input
                        value={searchVal}
                        onChange={(e) => { setSearchVal(e.target.value) }}
                        placeholder='Search your projects...'
                        className='p-2 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full max-w-[300px]  text-[#888]'
                        type="text" />
                    <div
                        onClick={() => { setOpenNew(!openNew) }}
                        className='p-3 cursor-pointer rounded-lg flex items-center justify-center bg-[#111111] outline-none border-[#535353] border-[1px]   text-[#888]'
                    >
                        <FaPlus />
                    </div>
                </div>

                <div className='hidden md:flex flex-col gap-1 mt-3 '>
                    {
                        fetchedData && fetchedData.length === 0 ?
                            <div className='text-sm text-[#888]'>No shared projects</div>
                            :
                            <>
                                {
                                    filteredData && filteredData.length === 0 &&
                                    <div className='text-sm text-[#888]'>No result</div>
                                }
                                {
                                    !fetchedData &&
                                    <div className='w-[20px] h-[20px]'>
                                        <Loader />
                                    </div>
                                }
                            </>
                    }
                    {
                        user && fetchedData && filteredData?.map((itm: dataType, idx: number) => (
                            <motion.div
                                key={`${itm.id}-${idx}`} // Using both id and idx for uniqueness
                                initial={{ y: 20, opacity: 0 }} // Initial position and opacity
                                animate={{ y: 0, opacity: 1 }} // End position and opacity
                                transition={{
                                    duration: 0.2,
                                    delay: idx * 0.1 // Staggered animation for notifications
                                }}
                                onClick={() => { nav(`/user/projects/view/${itm?.created_by}/${itm?.created_at}`); }}

                                className={`${isUid != undefined && isUid === itm?.created_at.toString() && 'bg-[#535353] rounded-lg text-white'} border-[#535353] border-[1px]  bg-[#1b1b1b] rounded-lg  p-2 text-[#888] cursor-pointer`}>
                                <div className='text-white'>
                                    {itm?.name.length >= 20 ? itm?.name.slice(0, 20) + "..." : itm.name}
                                </div>

                                <div>
                                    {itm?.is_shared}
                                </div>
                            </motion.div>
                        ))
                    }
                </div>

            </div>
        </div>
    )
}

export default ProjectSidebar
