import React, { useEffect, useState } from 'react'
import { FaHome } from "react-icons/fa";
import { CiChat1 } from "react-icons/ci";

import { IoSettingsOutline } from "react-icons/io5";
import { GoProjectSymlink } from "react-icons/go";
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../../../Zustand/UseStore';
import { supabase } from '../../../supabase/supabaseClient';
import IsLoggedIn from '../../../firebase/IsLoggedIn';

interface KanBanType {
    location: string;
}
interface MessageType {

    userEmail: any;
    userid: any;
    id: number; //timestamp
    content: string

}


interface chatType {
    bgColor: string;
    chatTitle: string;
    isMuted: boolean;
}



const KanBanSidebar: React.FC<KanBanType> = ({ location }) => {
    const nav = useNavigate()

    const { setOpenKanbanSettings }: any = useStore()
    
    const { setOpenKanbanChat }: any = useStore()
    const params = useParams()
    const [chatArray, setChatArray] = useState<MessageType[] | null>(null)
    const [user] = IsLoggedIn()
    const { chatListener }: any = useStore()


    useEffect(() => {
        if (user) {
            getChatArray();
            console.log("asdas")
            const subscription = supabase
                .channel('public:projects')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                    handleRealtimeEvent(payload);
                    console.log(payload)
                    getChatArray();
                })
                .subscribe();

            // Cleanup subscription on unmount or when user changes
            return () => {
                subscription.unsubscribe();
            };
        } else {
            console.log("not loggedin")
        }
    }, [user, params, chatListener]);


    const handleRealtimeEvent = (payload: any) => {

        switch (payload.eventType) {
            case 'INSERT':
                setChatArray((prevData) => {
                    const updatedArray = prevData ? [...prevData, payload.new] : [payload.new];

                    return updatedArray;
                });
                break;
            case 'UPDATE':
                setChatArray((prevData) => {
                    const updatedArray = prevData ? prevData.map((item) =>
                        item.id === payload.new.id ? payload.new : item
                    ) : [payload.new];

                    return updatedArray;
                });
                break;
            case 'DELETE':
                console.log("DELETED");
                setChatArray((prevData) => {
                    const updatedData = prevData ? prevData.filter((item) => item.id !== payload.old.id) : [];

                    return updatedData; // Return new array
                });
                break;
            default:
                break;
        }
    };


    async function getChatArray() {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('chatArr')
                .eq('created_at', params?.time)
                .single();

            if (error) {
                console.log("Error fetching chats:", error);
                return;
            } else {
                if (data?.chatArr) {
                    setChatArray(data.chatArr);
                }
            }
        } catch (err) {
            console.log("Error in getChatArray:", err);
        }
    }



    return (
        <div className='sticky top-0 w-full    flex flex-row md:flex-col justify-between h-auto md:h-screen border-r-[1px] border-r-[#414141] '>

            <div className='h-full overflow-y-auto px-3 md py-2 border-b-[1px] bg-[#242424] md:bg-transparent border-b-[#414141] md:border-none items-center md:items-start pb-3  bg-red flex gap-3 w-full flex-row justify-between md:flex-col  '>
                <div className="md:border-b-[1px]  md:border-b-[#414141] w-full pb-0 md:pb-3 items-center justify-start flex flex-row gap-2 md:flex-col md:items-start">
                    <div className={`${location === 'kanban' && "bg-[#535353]"}  w-auto md:w-full flex items-center gap-2 md:text-md px-3 py-1 text-left rounded-lg cursor-pointer`}>
                        <FaHome /> Kanban
                    </div>
                    <div
                        onClick={() => { setOpenKanbanChat(true) }}
                        className={` w-auto md:w-full  flex items-center gap-2 md:text-md px-3 py-1 text-left rounded-lg cursor-pointer`}>
                        <CiChat1 /> Chats 
                        {chatArray && user && chatArray.length > 0 && (
                            <div className='text-[10px] bg-[#111] border-[1px] border-[#414141] p-2 rounded-lg'>
                                {chatArray.length >= 999 ? "999+" : chatArray.length}
                            </div>
                        )}

                    </div>
                </div>

                <div className='w-auto flex gap-2 flex-row md:flex-col items-center justify-center md:w-full'>
                    <div
                        onClick={() => { setOpenKanbanSettings(true) }}
                        className='w-auto md:w-full p-3 cursor-pointer rounded-lg ml-auto flex items-center justify-start gap-3 text-md bg-[#111111] hover:bg-[#222222] outline-none border-[#535353] border-[1px]   text-[#888]'>
                        <IoSettingsOutline /> <span className='hidden md:flex'>Settings</span>
                    </div>

                    <div
                        onClick={() => { nav('/user/projects') }}
                        className='w-auto md:w-full p-3 cursor-pointer rounded-lg ml-auto flex items-center justify-start gap-3 text-md bg-[#111111] hover:bg-[#222222] outline-none border-[#535353] border-[1px]   text-[#888]'>
                        <GoProjectSymlink /> <span className='hidden md:flex'>Projects</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default KanBanSidebar
