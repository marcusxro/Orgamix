import React, { useEffect, useState } from 'react';
import useStore from '../../Zustand/UseStore';
import { motion, AnimatePresence } from 'framer-motion';
import userNoProfile from '../../assets/UserNoProfile.jpg';
import { AiTwotoneCloseCircle } from "react-icons/ai";
import { supabase } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

interface dataType {
  id: number;
  content: string;
  created_at: any; // Assuming this is a timestamp in milliseconds
  uid: string;
  linkofpage: string;
}

const Notification: React.FC = () => {
  const { setViewNotifs }: any = useStore();
  const [isExiting, setIsExiting] = useState(false);
  const [notifs, setNotifications] = useState<dataType[] | null>(null);
  const [groupedData, setGroupedData] = useState<{ [key: string]: dataType[] }>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  const [user] = IsLoggedIn();
  const nav = useNavigate();

  const handleOutsideClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      setViewNotifs(null);
      setIsExiting(false);
    }, 300);
  };

  useEffect(() => {
    if (user) {
      getNotifs();
      const subscription = supabase
        .channel('public:notification')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notification' }, (payload) => {
          console.log('Realtime event:', payload);
          handleRealtimeEvent(payload);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, isExiting, isLoaded]);


  const handleRealtimeEvent = (payload: any) => {
    console.log('Received payload:', payload); // Check the payload structure

    setNotifications((prevNotifs: any) => {
      let updatedData = [...prevNotifs]; // Start with current notifications
      setIsLoaded(prevs => !prevs)
      switch (payload.eventType) {
        case 'INSERT':
          updatedData.push(payload.new); // Add new notification
          break;
        case 'UPDATE':
          updatedData = updatedData.map((item) =>
            item.id === payload.new.id ? payload.new : item
          );
          break;
        case 'DELETE':
          updatedData = updatedData.filter((item) => item.id !== payload.old.id);
          break;
        default:
          console.warn('Unhandled event type:', payload.eventType);
          return prevNotifs;
      }
      groupNotifs(updatedData); // Regroup notifications after update
      return updatedData; // Return the updated notification list to setNotifications
    });
  };

  async function getNotifs() {
    try {
      const { data, error } = await supabase
        .from('notification')
        .select('*')
        .eq('uid', user?.uid)
        .order('created_at', { ascending: false });

      if (data) {
        setNotifications(data); 
        groupNotifs(data); 
      }

      if (error) {
        console.log(error);
      }
    } catch (err) {
      console.log(err);
    }
  }

  const groupNotifs = (notifications: dataType[]) => {
    const grouped: { [key: string]: dataType[] } = {};
    const today = new Date();
    notifications.forEach((notif) => {
      const createdAt = new Date(notif.created_at);
      let key = '';
      if (isToday(createdAt, today)) {
        key = 'Today';
      } else if (isYesterday(createdAt, today)) {
        key = 'Yesterday';
      } else if (isLastWeek(createdAt, today)) {
        key = `Last Week (${moment(createdAt).format('MMMM Do')})`; // Format the date
      } else if (isLastMonth(createdAt, today)) {
        key = `Last Month (${moment(createdAt).format('MMMM Do')})`; // Format the date
      } else {
        key = 'Earlier';
      }
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(notif);
    });
    setGroupedData(grouped); // Update the grouped notifications state
  };

  function isToday(date: Date, today: Date) {
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  function isYesterday(date: Date, today: Date) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
  }

  function isLastWeek(date: Date, today: Date) {
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    return date >= weekAgo && date < today;
  }

  function isLastMonth(date: Date, today: Date) {
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);
    return date >= monthAgo && date < today;
  }

  function getNavigated(params: string) {
    handleOutsideClick();
    setTimeout(() => {
      nav(params);
    }, (100));
  }

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className='ml-auto positioners flex items-center p-3 justify-center relative w-full h-full'
          onClick={handleOutsideClick}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
            exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
            onClick={(e) => { e.stopPropagation() }}
            className={`w-[550px] h-full bg-[#313131] z-[5000] max-h-[700px] rounded-lg overflow-auto border-[#535353] border-[1px] flex flex-col justify-between`}
          >
            <div className='h-auto flex gap-2 justify-between p-3 border-b-[#535353] border-b-[1px]'>
              <div className='flex gap-2 justify-between w-full'>
                <div className='flex gap-2 items-center'>
                  <div className='w-[20px] h-[20px] overflow-hidden rounded-full'>
                    <img className='w-full h-full object-cover' src={userNoProfile} alt="" />
                  </div>
                  <div>Notifications</div>
                </div>
                <div onClick={handleOutsideClick} className='flex items-center justify-center text-2xl cursor-pointer'>
                  <AiTwotoneCloseCircle />
                </div>
              </div>
            </div>

            {
              notifs != null && notifs.length === 0 && (
                <div className='h-full flex flex-col gap-5 overflow-auto p-3'>
                  <div className='text-center text-[#888]'>No notifications found</div>
                </div>
              )
            }

            {
              notifs == null && (
                <div className='h-full flex flex-col gap-5 overflow-auto p-3'>
                  <div className='bg-[#888] rounded-lg min-h-[60px] animate-pulse'>

                  </div>
                  <div className='bg-[#888] rounded-lg min-h-[60px] animate-pulse'>

                  </div>
                  <div className='bg-[#888] rounded-lg min-h-[60px] animate-pulse'>

                  </div>
                  <div className='bg-[#888] rounded-lg min-h-[60px] animate-pulse'>

                  </div>
                  <div className='bg-[#888] rounded-lg min-h-[60px] animate-pulse'>

                  </div>
                </div>
              )
            }
            {
              notifs != null && notifs.length > 0 && (
                <div className='h-full flex flex-col gap-5 overflow-auto p-3'>
                  {groupedData && Object.keys(groupedData).map((key) => (
                    <motion.div
                      key={key} // Ensure each group has a unique key
                      initial={{ opacity: 0, y: 20 }} // Initial position and opacity
                      animate={{ opacity: 1, y: 0 }} // End position and opacity
                      transition={{ duration: 0.2 }} // Transition timing
                    >
                      <div className={`${key === "Earlier" ? 'border-l-blue-500' : key === "Today" ? 'border-l-green-500' : ''} flex flex-col gap-2 pl-3 border-l-[2px]`}>
                        <h3 className="font-bold">{key}</h3>
                        {groupedData[key].map((itm: dataType, index) => (
                          <motion.div
                            key={`${itm.id}-${index}`} // Using both id and index for uniqueness
                            initial={{ y: 20, opacity: 0 }} // Initial position and opacity
                            animate={{ y: 0, opacity: 1 }} // End position and opacity
                            transition={{
                              duration: 0.4,
                              delay: index * 0.1 // Staggered animation for notifications
                            }}
                            onClick={() => { getNavigated(itm.linkofpage) }}
                            className='bg-[#222] rounded-lg flex justify-between items-start flex-col hover:bg-[#292929] border-[1px] border-[#535353] cursor-pointer'
                          >
                            <div className='p-3 rounded-lg flex justify-between gap-2 items-start w-full'>
                              <span className='w-full max-w-[300px]'>{itm.content}</span>
                              <span className="text-gray-400 text-sm whitespace-nowrap">
                                {itm.created_at ? moment(itm.created_at).format('h:mm A') : 'No Creation date'}
                              </span>
                            </div>
                            {
                              moment().diff(moment(itm?.created_at), 'seconds') < 5 &&
                              <div className='mx-3 my-2 border-1 border-[#535353] border-[1px] p-1 px-2 text-sm text-green-500 rounded-md'>new</div>
                            }
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

              )
            }
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Notification;
