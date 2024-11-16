import React, { useEffect } from 'react'
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import { supabase, supabaseTwo } from '../../../supabase/supabaseClient';
import { AnimatePresence, motion } from 'framer-motion';
import { RiMessage3Fill } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import Loader from '../../Loader';
import { FaPlus } from "react-icons/fa6";
import useStore from '../../../Zustand/UseStore';
import { LuLayoutDashboard } from "react-icons/lu";
import FetchPFP from '../../FetchPFP';


interface chats {
    text: string;
    type: string;
    created_at: string;
}

interface ChatType {
    id: number;
    created_at: string;
    userid: string;
    chats: chats[]
}
interface AISidebarProps {

    location: string;

}
const AiMenuModal: React.FC<AISidebarProps> = ({ location }) => {
    const [fetchedData, setFetchedData] = React.useState<ChatType[] | null>(null)
    const [user] = IsLoggedIn()

    useEffect(() => {
        if (user) {
            getChats()
            getAccountData()
            const subscription = supabaseTwo
                .channel('public:notification')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'notification' }, (payload) => {
                    console.log('Realtime event:', payload);
                    handleRealtiveForAccounts(payload);
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };

        }
    }, [user]);

    const handleRealtiveForAccounts = (payload: any) => {
        console.log('Received payload:', payload); // Check the payload structure

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
    }



    async function getChats() {

        try {
            const { data, error } = await supabaseTwo
                .from('user_chats')
                .select('*')
                .eq('userid', user?.uid)
                .order('created_at', { ascending: false })
            if (error) {
                console.log(error)
            } else {
                setFetchedData(data)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    const { isHidden, setIsHidden } = useStore()
    const nav = useNavigate()
    const [isExisting, setIsExisting] = React.useState(false)

    const handleOutsideClick = () => {
        setIsExisting(true);
        setTimeout(() => {
            setIsHidden(!isHidden);
            setIsExisting(false);
        }, 300);
    };


    const [accountData, setGetAccountData] = React.useState<any>(null)

    async function getAccountData() {
        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('userid', user?.uid)
            if (error) {
                console.log(error)
            } else {
                console.log(data)
                setGetAccountData(data)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    

    return (

        <AnimatePresence>
            {
                !isExisting && !isHidden &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    onClick={handleOutsideClick}
                    className='h-full w-full positioners z-[500] md:hidden'

                >
                    <motion.div
                        initial={{ x: -50, scale: 0.95, opacity: 0 }} // Starts off-screen to the left
                        animate={{ x: -0, scale: 1, opacity: 1, transition: { duration: 0.2 } }} // Moves to default position
                        exit={{ x: -50, scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        onClick={(e) => e.stopPropagation()}
                        className='w-full max-w-[250px] bg-[#292929]  h-full border-r-[1px] border-r-[#535353] p-4 overflow-auto  '>

                        <div className='flex flex-col gap-3 text-sm justify-between h-full'>

                            <div className='flex flex-col gap-3'>
                                <div
                                    onClick={() => { nav(`/user/ask-orgamix`) }}
                                    className='flex gap-4 items-center bg-[#191919] p-2 px-4 cursor-pointer border-[1px] hover:bg-[#212121] border-[#535353] rounded-lg text-sm'>
                                    <span className='text-[12px] flex items-center'>
                                        <FaPlus /> </span>New chat
                                </div>



                                <div className='flex flex-col items-start gap-3 h-full max-h-[400px] pb-8 '>
                                    Recent
                                    {
                                        fetchedData?.length === 0 && <div className='text-[12px] text-[#888]'>No recent chats</div>
                                    }
                                    {
                                        fetchedData === null &&
                                        <div className='w-[20px] h-[20px]'>
                                            <Loader />
                                        </div>
                                    }
                                    {
                                        fetchedData?.map((chat, index) => {
                                            return (
                                                <div
                                                    onClick={() => { nav(`/user/ask-orgamix/${chat?.created_at}`), window.location.reload() }}
                                                    key={index} className={`${location === chat?.created_at ? "bg-[#191919]" : "bg-[#363636] "}  flex gap-4 items-center p-2 px-4 cursor-pointer border-[1px] hover:bg-[#212121] border-[#535353] rounded-lg text-sm`}>
                                                    <RiMessage3Fill />
                                                    <span className='text-[12px] flex items-center overflow-hidden'>
                                                        {chat?.chats[0]?.text.length > 20 ? chat?.chats[0]?.text.substring(0, 20) + '...' : chat?.chats[0]?.text}

                                                    </span>
                                                </div>
                                            )
                                        })

                                    }




                                </div>
                            </div>
                            <div 
                            onClick={() => {nav('/user/dashboard')}}
                            className='flex flex-col gap-3 border-t-[1px] border-t-[#535353] pt-5'>
                                <div className='px-4 bg-[#191919] flex items-center gap-4 cursor-pointer hover:bg-[#222] p-2 rounded-md border-[1px] border-[#535353]'>
                                    <LuLayoutDashboard/> Dashboard
                                </div>

                                <div className='flex gap-2 mt-2'>
                                    <div className='w-[30px] h-[30px] border-[1px] overflow-hidden rounded-full'>
                                        <FetchPFP userUid={user?.uid} />
                                    </div>
                                    <div>
                                        <div className='font-bold reducedHeight'>
                                            {accountData?.length === 0 
                                                ? "No account" 
                                                : accountData?.[0]?.username.length > 20 
                                                    ? accountData?.[0]?.username.substring(0, 20) + '...' 
                                                    : accountData?.[0]?.username}
                                        </div>
                                        <div className='text-[10px] text-[#888]'>
                                            Free
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default AiMenuModal
