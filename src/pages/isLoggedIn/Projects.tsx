import React, { useEffect, useState } from 'react'
import Sidebar from '../../comps/System/layouts/Sidebar'
import ProjectSidebar from '../../comps/System/Projects/ProjectSidebar'
import useStore from '../../comps/Utils/Zustand/UseStore'
import AddProject from '../../comps/System/Projects/AddProject'
import { supabase } from '../../comps/Utils/supabase/supabaseClient'
import IsLoggedIn from '../../comps/Utils/IsLoggedIn'
import imageBg from '../../assets/ProjectImages/Untitled design (2).png'

import { CiStar } from "react-icons/ci";
import { IoMdStar } from "react-icons/io"; //filled star color
import { MdDateRange } from "react-icons/md";
import moment from 'moment';
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Loader from '../../comps/Svg/Loader'
import MetaEditor from '../../comps/MetaHeader/MetaEditor'


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

// interface accountType {
//     userid: string;
//     username: string;
//     password: string;
//     email: string;
//     id: number;
//     fullname: string;
// }



const Projects: React.FC = () => {
    const { openNew }: any = useStore()
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [sharedProjects, setSharedProjects] = useState<dataType[] | null>(null);
    const [user]:any = IsLoggedIn()
    const nav = useNavigate()
    const { sidebarLoc }: any = useStore()


    useEffect(() => {
        if (user) {
            getProjects();
            getProjectShared()

            const subscription = supabase
                .channel('public:projects')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                    handleRealtimeEvent(payload);
                    getProjects();
                })
                .subscribe();
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user]);

    // Handle real-time events
    const handleRealtimeEvent = (payload: any) => {
        // Filter out updates not related to the current user
        const isCurrentUserProject = payload.new?.created_by === user?.id || payload.old?.created_by === user?.id;

        if (!isCurrentUserProject) return;

        switch (payload.eventType) {
            case 'INSERT':
                setFetchedData((prevData) =>
                    prevData ? [...prevData, payload.new] : [payload.new]
                );
                break;

            case 'UPDATE':
                setFetchedData((prevData) =>
                    prevData
                        ? prevData.map((item) => (item.id === payload.new.id ? payload.new : item))
                        : [payload.new]
                );
                break;

            case 'DELETE':
                setFetchedData((prevData) =>
                    prevData ? prevData.filter((item) => item.id !== payload.old.id) : []
                );
                break;

            default:
                break;
        }
    };

    async function getProjects() {
        if (!user) return;

        try {
            // Initial fetch to get the user's projects
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('created_by', user?.id)
                .order('created_at', { ascending: false }); // Sort



            if (error) {
                console.error('Error fetching data:', error);
            } else {
                if (data) {
                    const filteredData = data.filter(itm => itm.created_by === user?.id);
                    setFetchedData(filteredData);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

   


    async function setAsFav(idOfProj: number, isFavBool: boolean) {
        if (!fetchedData) return
        try {
            const { error } = await supabase
                .from('projects')
                .update({
                    is_favorite: !isFavBool
                })
                .eq('created_at', idOfProj)

            if (error) {
                return console.error('Error fetching data:', error);
            } else {
                console.log("dne")
                getProjects()
            }
        }
        catch (err) {
            console.log(err)
        }
    }


    async function getProjectShared() {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')

            if (error) {
                console.error('Error fetching data:', error);
            } else {

                const fetchedProjects: dataType[] = data || []; // Fallback to empty array

                const arrayOfInvitations = fetchedProjects.filter((itm) =>
                    itm?.invited_emails?.some((itmz: any) => itmz?.userid === user?.id)
                );

                setSharedProjects(arrayOfInvitations)
            }
        } catch (err) {
            console.log(err);
        }
    }



    return (
        <div className='h-auto selectionNone'>
            <Sidebar location='Projects' />
         {
            user && 
            <MetaEditor
            title={`Projects | ${user?.email}`}
            description='Projects to manage your workflow with ease.'
            keywords='Projects, Manage, Workflow, Orgamix'
        />
         }

            {
                openNew &&
                <AddProject />

            }

            <div className='ml-[80px] flex flex-col h-full min-h-[100dvh] md:flex-row'>

                <div className="h-[30px] mb-5 w-full max-w-[100%] md:sticky md:top-0 md:h-screen md:max-w-[300px]">
                    <ProjectSidebar isUid={"none"} />
                </div>

                {/* Content section that is scrollable */}
                <div className='h-full w-full overflow-y-auto mt-2 md:mt-0'>
                    <div className="h-auto  p-4 text-white">
                        {
                            sidebarLoc === "Home" ? (
                                <div>
                                    <div className='font-bold text-xl'>Projects</div>
                                    <div className='text-sm text-[#888]'>
                                        Manage your projects with ease and enhance your workflow.
                                    </div>
                                </div>
                            ) : sidebarLoc === "Favs" ? (
                                <div>
                                    <div className='font-bold text-xl'>Favorite Projects</div>
                                    <div className='text-sm text-[#888]'>
                                        Quickly access and manage your favorite projects.
                                    </div>
                                </div>
                            ) : sidebarLoc === "Shared" && ( // New rendering for "Archived"
                                <div>
                                    <div className='font-bold text-xl'>Shared Projects</div>
                                    <div className='text-sm text-[#888]'>
                                        View and collaborate on projects shared with you.
                                    </div>
                                </div>
                            )
                        }


                        <div className='flex gap-3 flex-wrap mt-7'>
                            {/* Render fetched data based on sidebarLoc */}
                            {Array.isArray(fetchedData) && fetchedData.length > 0 ? (
                                sidebarLoc === "Home" ? (
                                    fetchedData.map((itm: dataType, idx: number) => (
                                        <AnimatePresence key={idx}>
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.3 }}
                                                onClick={() => nav(`/user/projects/view/${itm?.created_by}/${itm?.created_at}_${itm?.id}`)}
                                                className='hover:bg-[#111111] bg-[#313131] cursor-pointer p-2 border-[#535353] border-[1px] rounded-lg w-full max-w-[300px] h-full max-h-[300px]'
                                            >
                                                <div className='h-full max-h-[180px] w-full rounded-md overflow-hidden'>
                                                    <img src={imageBg} className='w-full h-full object-cover' alt="" />
                                                </div>
                                                <div className='h-[30%] pt-3'>
                                                    <div className='flex gap-2 items-center justify-between'>
                                                        <div>{itm?.name.length >= 20 ? itm?.name.slice(0, 20) + "..." : itm.name}</div>
                                                        <div onClick={(e) => { e.stopPropagation(); setAsFav(itm?.created_at, itm?.is_favorite); }} className='text-2xl cursor-pointer'>
                                                            {itm?.is_favorite ? (
                                                                <div className='text-yellow-500'>
                                                                    <IoMdStar />
                                                                </div>
                                                            ) : (
                                                                <CiStar />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className='flex gap-2 items-center justify-between mt-3'>
                                                        <p className='text-sm text-[#888] flex items-center gap-1'>
                                                            <MdDateRange /> {itm?.created_at ? moment(parseInt(itm?.created_at.toString())).format('MMMM Do YYYY') : 'No Creation date'}
                                                        </p>
                                                        <p className='text-sm text-[#888]'>{itm?.is_shared}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    ))
                                ) : sidebarLoc === "Favs" ? (
                                    fetchedData.filter((itm) => itm?.is_favorite).map((itm: dataType, idx: number) => (
                                        <AnimatePresence key={idx}>
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.3 }}
                                                onClick={() => { nav(`/user/projects/view/${itm?.created_by}/${itm?.created_at}_${itm?.id}`); }}
                                                className='hover:bg-[#111111] bg-[#313131] cursor-pointer p-2 border-[#535353] border-[1px] rounded-lg w-full max-w-[300px] h-full max-h-[300px]'
                                            >
                                                <div className='h-full max-h-[180px] w-full rounded-md overflow-hidden'>
                                                    <img src={imageBg} className='w-full h-full object-cover' alt="" />
                                                </div>
                                                <div className='h-[30%] pt-3'>
                                                    <div className='flex gap-2 items-center justify-between'>
                                                        <div>{itm?.name.length >= 20 ? itm?.name.slice(0, 20) + "..." : itm.name}</div>
                                                        <div onClick={(e) => { e.stopPropagation(); setAsFav(itm?.created_at, itm?.is_favorite); }} className='text-2xl cursor-pointer'>
                                                            {itm?.is_favorite ? (
                                                                <div className='text-yellow-500'>
                                                                    <IoMdStar />
                                                                </div>
                                                            ) : (
                                                                <CiStar />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className='flex gap-2 items-center justify-between mt-3'>
                                                        <p className='text-sm text-[#888] flex items-center gap-1'>
                                                            <MdDateRange /> {itm?.created_at ? moment(parseInt(itm?.created_at.toString())).format('MMMM Do YYYY') : 'No Creation date'}
                                                        </p>
                                                        <p className='text-sm text-[#888]'>{itm?.is_shared}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    ))
                                ) : sidebarLoc === "Shared" ? (
                                    sharedProjects?.map((itm: dataType, idx: number) => (
                                        <AnimatePresence key={idx}>
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.3 }}
                                                onClick={() => nav(`/user/projects/view/${itm?.created_by}/${itm?.created_at}`)}
                                                className='hover:bg-[#111111] bg-[#313131] cursor-pointer p-2 border-[#535353] border-[1px] rounded-lg w-full max-w-[300px] h-full max-h-[300px]'
                                            >
                                                <div className='h-full max-h-[180px] w-full rounded-md overflow-hidden'>
                                                    <img src={imageBg} className='w-full h-full object-cover' alt="" />
                                                </div>
                                                <div className='h-[30%] pt-3'>
                                                    <div className='flex gap-2 items-center justify-between'>
                                                        <div>{itm?.name.length >= 20 ? itm?.name.slice(0, 20) + "..." : itm.name}</div>
                                                    </div>
                                                    <div className='flex gap-2 items-center justify-between mt-3'>
                                                        <p className='text-sm text-[#888] flex items-center gap-1'>
                                                            <MdDateRange /> {itm?.created_at ? moment(parseInt(itm?.created_at.toString())).format('MMMM Do YYYY') : 'No Creation date'}
                                                        </p>
                                                        <p className='text-sm text-[#888]'>{itm?.is_shared}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    ))
                                ) : (
                                    <p className='text-sm'>No projects available.</p>
                                )
                            ) : (
                                fetchedData === null ? (
                                    <div className='w-[20px] h-[20px]'>
                                        <Loader />
                                    </div>

                                ) : (
                                    fetchedData.length === 0 &&
                                    sidebarLoc != 'Shared' ?
                                    <p className='text-sm'>Start now, and create your first project!</p> 
                                    :
                                    <p className='text-sm'>No shared projects available</p>
                                )
                            )}

                            {/* Loader for shared projects if not available */}
                            {sidebarLoc === "Shared" && !Array.isArray(sharedProjects) && (
                                <div className='w-[20px] h-[20px]'>
                                    <Loader />
                                </div>
                            )}
                        </div>


                    </div>
                </div>


            </div>
        </div>
    )
}

export default Projects
