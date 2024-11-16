import React, { useEffect, useState } from 'react'
import { FaPlus } from "react-icons/fa6";
import { supabaseTwo } from '../../../supabase/supabaseClient';
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import { useNavigate } from 'react-router-dom';
import Loader from '../../Loader';
import useStore from '../../../Zustand/UseStore';
import { motion } from 'framer-motion';
import { RiMessage3Fill } from "react-icons/ri";


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

const AISidebar: React.FC<AISidebarProps> = ({ location }) => {
  const [user] = IsLoggedIn()
  const [fetchedData, setFetchedData] = React.useState<ChatType[] | null>(null)


  useEffect(() => {
    if (user) {
      getChats()
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



  const nav = useNavigate()

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
  // State to track the sidebar visibility
  const [isHiddens, setIsHiddens] = useState(localStorage.getItem('hideSidebar') === 'true');
  const { setIsHidden }: any = useStore();
  // Sync state with localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('hideSidebar', isHiddens ? 'true' : 'false');
    setIsHidden(isHiddens)
  }, [isHiddens]);

  useEffect(() => {
    const handleStorageChange = (event: any) => {
      if (event.key === 'hideSidebar') {
        setIsHiddens(event.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);



  return (

    <motion.div
      className="md:ml-[84px] w-[200px] hidden md:block overflow-hidden h-[100dvh] fixed"
      initial={false} // Don't animate on initial render
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className='w-full  h-full border-r-[1px] border-r-[#535353] p-4 overflow-auto  '>
     
        <div className='flex flex-col gap-3 text-sm'>
          <div
            onClick={() => { nav(`/user/ask-orgamix`) }}
            className='flex gap-4 items-center bg-[#191919] p-2 px-4 cursor-pointer border-[1px] hover:bg-[#212121] border-[#535353] rounded-lg text-sm'>
            <span className='text-[12px] flex items-center'>
              <FaPlus /> </span>New chat
          </div>

          Recent

          <div className='flex flex-col gap-3 h-full items-start max-h-[400px] pb-8'>
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
                  <RiMessage3Fill/>
                    <span className='text-[12px] flex items-center overflow-hidden'>
                      {chat?.chats[0]?.text.length > 20 ? chat?.chats[0]?.text.substring(0, 20) + '...' : chat?.chats[0]?.text}

                    </span>
                  </div>
                )
              })

            }

            <div className='h-[30px] p-3'>

            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AISidebar
