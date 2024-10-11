import React, { useEffect, useState } from 'react'
import Sidebar from '../../comps/Sidebar'
import ProjectSidebar from '../../comps/System/Projects/ProjectSidebar'
import useStore from '../../Zustand/UseStore'
import AddProject from '../../comps/System/Projects/AddProject'
import { supabase } from '../../supabase/supabaseClient'
import IsLoggedIn from '../../firebase/IsLoggedIn'
import imageBg from '../../assets/ProjectImages/Untitled design (2).png'

import { CiStar } from "react-icons/ci";
import { IoMdStar } from "react-icons/io"; //filled star color
import { MdDateRange } from "react-icons/md";
import moment from 'moment';
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface dataType {
    id: number;
    description: string;
    created_at: number,
    name: string,
    deadline: string,
    is_shared: string,
    created_by: string;
    is_favorite: boolean
}

const Projects = () => {
    const { openNew, setOpenNew }: any = useStore()
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [user] = IsLoggedIn()
    const nav = useNavigate()

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
                .eq('created_by', user?.uid)


            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setFetchedData(data);
            }
        } catch (err) {
            console.log(err);
        }
    }


    return (
        <div className='h-auto'>
            <Sidebar location='Projects' />

            {
                openNew &&
                <div
                    onClick={() => { setOpenNew(!openNew); }}
                    className='ml-auto positioners flex items-center justify-center p-3 w-full h-full'>
                    <AddProject />
                </div>
            }

            <div className='ml-[80px] flex flex-col h-full min-h-[100dvh] md:flex-row'>

                <div className="h-[30px] mb-5 w-full max-w-[100%] md:sticky md:top-0 md:h-screen md:max-w-[300px]">
                    <ProjectSidebar location={"home"} isUid={"none"} />
                </div>

                {/* Content section that is scrollable */}
                <div className='h-full w-full overflow-y-auto mt-2 md:mt-0'>
                    <div className="h-auto  p-4 text-white">
                        <div>
                            <div className='font-bold text-xl'>Projects</div>
                            <div className='text-sm text-[#888]'>
                                Manage your projects efficiently with our intuitive interface. Create, edit, and organize your projects seamlessly for a streamlined workflow and enhanced productivity.
                            </div>
                        </div>

                        <div className='flex gap-3 flex-wrap mt-7'>
                            {
                                fetchedData && fetchedData?.map((itm: dataType, idx: number) => (
                                    <AnimatePresence>
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.3 }}
                                            key={idx}
                                            onClick={() => { nav(`/user/projects/view/${itm?.created_by}/${itm?.created_at}`); }}
                                            className='hover:bg-[#111111] cursor-pointer p-2 border-[#535353] border-[1px] rounded-lg w-full max-w-[300px] h-full max-h-[300px]'>
                                            <div className='h-full max-h-[180px] w-full rounded-md overflow-hidden '>

                                                <img src={imageBg} className='w-full h-full object-cover' alt="" />
                                            </div>

                                            <div className='h-[30%] pt-3 '>
                                                <div className='flex gap-2 items-center justify-between'>
                                                    <div>{itm?.name.length >= 20 ? itm?.name.slice(0, 20) + "..." : itm.name}</div>
                                                    <div className='text-2xl cursor-pointer'>
                                                        {
                                                            itm?.is_favorite ?
                                                                <div className='text-yellow-500'>
                                                                    <IoMdStar />
                                                                </div>
                                                                :
                                                                <CiStar />
                                                        }
                                                    </div>
                                                </div>
                                                <div className='flex gap-2 items-center justify-between mt-3'>
                                                    <p className='text-sm text-[#888] flex items-center gap-1'><MdDateRange />     {itm?.created_at
                                                        ? moment(parseInt(itm?.created_at.toString())).format('MMMM Do YYYY')
                                                        : 'No Creation date'}</p>
                                                    <p className='text-sm text-[#888]'>{itm?.is_shared}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                ))
                            }
                        </div>

                    </div>
                </div>


            </div>
        </div>
    )
}

export default Projects
