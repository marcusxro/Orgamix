import React, { useEffect, useState } from 'react'
import { FaHome } from "react-icons/fa";
import { CiChat1 } from "react-icons/ci";

import { IoSettingsOutline } from "react-icons/io5";
import { GoProjectSymlink } from "react-icons/go";
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../../../Zustand/UseStore';
import { supabase } from '../../../supabase/supabaseClient';
import IsLoggedIn from '../../Utils/IsLoggedIn';
import { FaFlipboard } from "react-icons/fa";

interface KanBanType {
    location: string;
}
interface MessageType {
    userEmail: any;
    userid: any;
    id: number; //timestamp
    content: string

}


const KanBanSidebar: React.FC<KanBanType> = ({ location }) => {
    const nav = useNavigate()

    const { setOpenKanbanSettings }: any = useStore()
    const { openKanbanChat, setOpenKanbanChat, setShowDrawer }: any = useStore()
    const params = useParams()
    const [chatArray, setChatArray] = useState<MessageType[] | null>(null)
    const [user]: any = IsLoggedIn()
    const { chatListener }: any = useStore()


    useEffect(() => {
        if (user) {
            getChatArray();
            const subscription = supabase
                .channel('public:projects')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                    handleRealtimeEvent(payload);

                    getChatArray();
                })
                .subscribe();

            // Cleanup subscription on unmount or when user changes
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user, params, chatListener, openKanbanChat]);


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
        console.log("Fetching chats for project:", params);

        const [unix, id]:any = params.time?.toString().split('_');

        // Log the results
        console.log("Unix:", unix); // Output: 1732705034508
        console.log("ID:", id);     // Output: 58


        try {
            // Query for the project, checking both the created_by and invited_emails
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .eq('created_at', unix)
                .single();  // Use .single() if expecting exactly one row

            if (error) {
                console.error("Error fetching chats:", error);
                return;
            }

            if (data) {
                console.log(data)
                setChatArray(data?.chatarr);  // Set the chat array if data is valid 
            } else {
                setChatArray(null);
                console.log("No chats found for this project.");
            }
        } catch (err) {
            console.error("Error in getChatArray:", err);
        }
    }




    return (
        <div className='sticky top-0 w-full  z-[1000]  flex flex-row md:flex-col justify-between h-auto md:h-screen border-r-[1px] border-r-[#414141] '>

            <div className='h-full overflow-y-auto px-3 md py-2 border-b-[1px] bg-[#242424] md:bg-transparent border-b-[#414141] md:border-none items-center md:items-start pb-3  bg-red flex gap-3 w-full flex-row justify-between md:flex-col  '>
                <div className="md:border-b-[1px]  md:border-b-[#414141] w-full pb-0 md:pb-3 items-center justify-start flex flex-row gap-2 md:flex-col md:items-start">
                    <div className={`${location === 'kanban' && "bg-[#535353]"}  w-auto md:w-full flex items-center gap-2 md:text-md px-3 py-1 text-left rounded-lg cursor-pointer`}>
                        <FaHome /> Kanban
                    </div>
                    <div
                        onClick={() => { setOpenKanbanChat(true) }}
                        className={` w-auto md:w-full  flex items-center gap-2 md:text-md px-3 py-1 text-left rounded-lg cursor-pointer`}>
                        <CiChat1 /> Chats
                        {chatArray != null && user && chatArray.length > 0 && (
                            <div className='text-[10px] bg-[#111] border-[1px] border-[#414141] p-2 rounded-lg'>
                                {chatArray.length >= 999 ? "999+" : chatArray.length}
                            </div>
                        )}

                    </div>
                    <div
                        onClick={() => { setShowDrawer(true) }}
                        className={` w-auto md:w-full  flex items-center gap-2 md:text-md px-3 py-1 text-left rounded-lg cursor-pointer`}
                    >
                        <FaFlipboard />    Draw
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
