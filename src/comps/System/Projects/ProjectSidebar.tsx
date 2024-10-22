import React, { useEffect, useState } from 'react'
import { FaHome, FaRegStar } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import useStore from '../../../Zustand/UseStore';
import { supabase } from '../../../supabase/supabaseClient';
import IsLoggedIn from '../../../firebase/IsLoggedIn';

interface propsType{
    isUid: string | undefined
}

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


const ProjectSidebar:React.FC<propsType> = ({ isUid}) => {

    
    const {openNew, setOpenNew}:any = useStore() 
    const { sidebarLoc, setSidebarLoc }: any = useStore()

    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [user] = IsLoggedIn()


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
        <div className='sticky top-0 w-full h-auto md:h-screen border-r-[1px] border-r-[#414141] p-3'>
    
            <div className='h-full overflow-y-auto'>
                <div className="border-b-[1px] border-b-[#414141] items-center flex flex-row gap-2 mb-2 md:flex-col md:items-start pb-3">
                    <div
                                        onClick={() => {setSidebarLoc("Home")}}
                     className={`${sidebarLoc === 'Home' && "bg-[#535353]"}  w-auto md:w-full flex items-center gap-2 md:text-lg px-3 py-1 text-left rounded-lg cursor-pointer`}>
                        <FaHome /> Home
                    </div>
                    <div
                        onClick={() => {setSidebarLoc("Favs")}}
                     className={`${sidebarLoc === 'Favs' && "bg-[#535353]"}  w-auto md:w-full  flex items-center gap-2 md:text-lg px-3 py-1 text-left rounded-lg cursor-pointer`}>
                        <FaRegStar /> Starred
                    </div>
                    <div
                            onClick={() => {setOpenNew(!openNew)}}
                           className='p-3 md:hidden cursor-pointer rounded-lg ml-auto flex items-center justify-center bg-[#111111] outline-none border-[#535353] border-[1px]   text-[#888]'
                        >
                            <FaPlus />
                        </div>
                </div>

                 <div className='hidden md:flex font-bold'>
                    Your Projects
                </div>
 

                <div className='gap-2 mt-2 hidden md:flex'>
                    <input
                    placeholder='Search your projects...'
                        className='p-2 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full max-w-[300px]  text-[#888]'
                        type="text" />
                        <div
                            onClick={() => {setOpenNew(!openNew)}}
                           className='p-3 cursor-pointer rounded-lg flex items-center justify-center bg-[#111111] outline-none border-[#535353] border-[1px]   text-[#888]'
                        >
                            <FaPlus />
                        </div>
                </div>

                <div className='hidden md:flex flex-col gap-1 ml-3 mt-3 bg-[#222222]'>
                {
                    user && fetchedData?.map((itm: dataType, idx: number) => (
                        <div
                        key={idx}
                         className={`${isUid != undefined && isUid === itm?.created_at.toString() && 'bg-[#535353] rounded-lg text-white'} bg-[#222222] p-2 text-[#888] cursor-pointer`}>
                            {itm?.name.length >= 20 ? itm?.name.slice(0, 20) + "..." : itm.name}</div>
                    ))
                }
                </div>

                <div className='mt-5 hidden md:flex font-bold'>
                   Shared Projects
                </div>
                <div className='gap-2 mt-2 hidden md:flex'>
                    <input
                    placeholder='Search your projects...'
                        className='p-2 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full max-w-[300px]  text-[#888]'
                        type="text" />
                </div>
            </div>
        </div>
    )
}

export default ProjectSidebar
