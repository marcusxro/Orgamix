import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../Utils/Zustand/UseStore';
import { useParams } from 'react-router-dom';
import IsLoggedIn from '../../Utils/IsLoggedIn';
import { supabase } from '../../Utils/supabase/supabaseClient';
import { IoMdClose } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import moment from 'moment';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { CiChat1 } from "react-icons/ci";
import { FaArrowDown } from "react-icons/fa6";
import Loader from '../../Svg/Loader';
import FetchPFP from '../../FetchPFP';


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

interface accountType {
    userid: string;
    username: string;
    password: string;
    email: string;
    id: number;
    fullname: string;
}

const Chat:React.FC = () => {
    const [isExiting, setIsExiting] = useState(false);
    const { openKanbanChat, setOpenKanbanChat }: any = useStore()
    const params = useParams()
    const [user]:any = IsLoggedIn()
    const [chats, setChats] = useState<chatType[] | null>(null)
    const [chatArray, setChatArray] = useState<MessageType[] | null>(null)
    const [chatText, setChatText] = useState<string>("")
    const [myAccount, setMyAccount] = useState<accountType | null>(null)
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false)
    const [isFetched, setIsFetched] = useState<boolean>(false)
    const [isShow, setIsShow] = useState<boolean>(false)


    const toggleEmojiPicker = () => {
        if (isOpen) {
            setTimeout(() => {
                setIsOpen(!isOpen);
            }, 100);
        } else {
            setIsOpen(!isOpen);
        }
    };

    // Function to handle emoji selection and update chatText
    const onEmojiClick = (emojiData: any) => {
        setChatText(prev => prev + emojiData.emoji); // Append selected emoji to the existing chat text
    };

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setOpenKanbanChat(null);
            setIsExiting(false);
        }, 300);
    };

    useEffect(() => {
        if (user) {
            getChats();
            getChatArray()
            getAccounts()
            const subscription = supabase
                .channel('public:projects')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                    handleRealtimeEvent(payload);
                    getChatArray()
                    getChats();
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
                setChatArray((prevData) =>
                    prevData ? [...prevData, payload.new] : [payload.new]
                );
                break;
            case 'UPDATE':

                setChatArray((prevData) =>
                    prevData
                        ? prevData.map((item) =>
                            item.id === payload.new.id ? payload.new : item
                        )
                        : [payload.new]
                );

                break;
            case 'DELETE':
                setChatArray((prevData) =>
                    prevData ? prevData.filter((item) => item.id !== payload.old.id) : null
                );
                break;
            default:
                break;
        }
    };

    async function getChats() {
        const [unix, id]:any = params.time?.toString().split('_');

        try {
            const { data, error } = await supabase
                .from('projects')
                .select('chats')
                .eq('created_at', unix)
                .eq('id', id)
                .single(); // Ensures we get a single result (not an array)

          
            if (!data?.chats) {
                createSchemaIfChatsNull()
            } else {
                setChats(data?.chats)
                setIsFetched(true)
            }

            if (error) {
                console.log(error)
                setIsFetched(false)
            }
        }
        catch (err) {
            console.log(err)
        }
    }




    async function createSchemaIfChatsNull() {
        const [unix, id]:any = params.time?.toString().split('_');

        try {
            // Fetch the chats field for the specific project
            const { data, error } = await supabase
                .from('projects')
                .select('chats')
                .eq('created_at', unix)
                .eq('id', id)
                .single(); // Ensures we get a single result (not an array)

            if (error) {
                console.error("Error fetching project:", error);
                return;
            }

            // If the 'chats' field is null, update with the new schema
            if (!data?.chats) {
                const { error: updateError } = await supabase
                    .from('projects')
                    .update({
                        chats: ({
                            chatTitle: 'Your groupchat',
                            isMuted: false,
                            bgColor: "313131",
                        })
                    })
                    .eq('created_at', unix)
                    .eq('id', id)

                if (updateError) {
                    console.error("Error updating project with new chat schema:", updateError);
                } else {
                    console.log("Chat schema successfully created.");
                }
            }
        } catch (err) {
            console.error("An error occurred:", err);
        }
    }

    async function getChatArray() {
        const [unix, id]:any = params.time?.toString().split('_');

        try {
            const { data, error } = await supabase
                .from('projects')
                .select('chatarr')
                .eq('created_at', unix)
                .eq('id', id)
                .single();

            if (error) {
                console.log("Error fetching chats:", error);
                return;
            } else {
                if (data?.chatarr) {
                    setChatArray(data.chatarr);
                }
            }
        } catch (err) {
            console.log("Error in getChatArray:", err);
        }
    }

    const chatContainerRef = useRef<HTMLDivElement>(null);


    const scrollToBottomSmooth = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };


    const isNearBottom = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            return (scrollTop + clientHeight) / scrollHeight >= 0.8;
        }
        return false;
    };


    useEffect(() => {
        const handleScroll = () => {
            if (chatContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
                const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;


                if (scrollPercentage <= 0.9) {
                    setIsShow(true)
                } else {
                    setIsShow(false)
                }
            }
        };

        const chatContainer = chatContainerRef.current;

        if (chatContainer) {
            chatContainer.addEventListener('scroll', handleScroll);
        }

        // Cleanup the event listener on component unmount
        return () => {
            if (chatContainer) {
                chatContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isShow]);





    useEffect(() => {
        if (isNearBottom()) {
            scrollToBottomSmooth();
        }
    }, [chatArray, user]);
    

    useEffect(() => {
        if (user != null && chatContainerRef.current && openKanbanChat && chats != null) {
            // Scroll to the bottom when the chat container is available
            const timer = setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight - 20;
                }
            }, 100); // Small delay to ensure rendering is complete

            return () => clearTimeout(timer); // Cleanup the timer
        }
    }, [user, openKanbanChat, chats, isFetched]);



    async function sendChat() {
        setLoading(true)
        console.log("sending chat")

        if (loading) {
            console.log("faled")
            setLoading(false)
            return
        }
        if (!chatText) {
            console.log("no chat")
            setLoading(false)
            return
        };
        if (!myAccount) {
            console.log("no account")

            setLoading(false)
            return
        }
        const [unix, id]:any = params.time?.toString().split('_');


        try {
            // Fetch the chats field for the specific project
            const { data, error } = await supabase
                .from('projects')
                .select('chatarr')
                .eq('created_at', unix)
                .eq('id', id) 
                .single();

            if (error) {
                console.log("Error fetching chats:", error);
                setLoading(false)
                return;
            }
            if (data && myAccount) {

                const newMessage = {
                    userEmail: myAccount && myAccount?.username, // User's email
                    userid: user?.id, // User's ID
                    id: Date.now(), // Unique ID (timestamp)
                    content: chatText // The message content
                };

                // Append the new message to the chatArr
                const updatedChatArr = [...(data.chatarr || []), newMessage];

                // Update the chatArr field in the database
                const { error: updateError } = await supabase
                    .from('projects')
                    .update({ chatarr: updatedChatArr })
                  .eq('created_at', unix)
                .eq('id', id) 

                if (updateError) {
                    console.log("Error updating chatArr:", updateError);
                    setLoading(false)
                    return
                } else {
                    isNearBottom()
                    setChatText("");
                    setLoading(false)
                    return
                }
            }
        } catch (err) {
            console.log("Error in sendChat:", err);
            setLoading(false)
            return
        }
    }
    async function getAccounts() {
        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('userid', user?.id)
                .limit(1);  // Fetch only one row
            
            if (data && data.length > 0) {
                setMyAccount(data[0]);  // Set the first item in the array
            }
    
            if (error) {
                console.log(error);
            }
        } catch (err) {
            console.log(err);
        }
    }
    


    return (
        <AnimatePresence>
            {
                !isExiting && chatContainerRef && openKanbanChat &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className='ml-auto positioners flex items-center p-3 justify-center relative w-full h-full'
                    onClick={handleOutsideClick}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        className={`w-[550px] h-full bg-[#313131] z-[5000] max-h-[700px] rounded-lg  overflow-auto border-[#535353] border-[1px]  flex flex-col justify-between`}
                        onClick={(e) => e.stopPropagation()}>
                        <div className='h-auto flex gap-2 justify-between p-3 bg-[#222]  border-b-[#535353] border-b-[1px]'>
                            <div className='flex gap-4 items-center'>
                                <div>
                                    <CiChat1 />
                                </div>
                                <div >
                                    {chats != null && chats[0]?.chatTitle as string}
                                </div>
                            </div>
                            <div className='flex gap-2 items-center'>
                                <div
                                    onClick={handleOutsideClick}
                                    className='p-2 bg-[#888] cursor-pointer rounded-lg border-[#535353] border-[1px]'>
                                    <IoMdClose />
                                </div>
                            </div>
                        </div>
                        <div className='p-3 h-full flex flex-col justify-between'>

                            <div className='h-full overflow-auto'>
                                <div
                                    ref={chatContainerRef}
                                    className='h-full max-h-[500px] bg-red overflow-auto'>

                                    {
                                        chatArray && chatArray != null && chatArray.length > 0 ?
                                            <div className='h-full gap-3 flex flex-col'>
                                                {
                                                    chatArray.map((itm: MessageType, idx: number) => (
                                                        itm.content != null &&
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ scale: 0.8, opacity: 0 }}  // Initial scale and opacity
                                                            animate={{ scale: 1, opacity: 1 }}    // Animate to full size and opacity
                                                            transition={{ duration: 0.3 }}          // Animation duration
                                                            className={`${itm?.userid === user?.id ? "ml-auto" : ""} flex gap-2 items-start justify-start`}>
                                                            {
                                                                !(user?.id === itm?.userid) && (!itm?.id.toString().includes('muted-')) &&
                                                                <div className='w-[30px] h-[30px] flex items-center justify-center rounded-full overflow-hidden'>
                                                                 <FetchPFP userUid={itm?.userid} />
                                                                </div>
                                                            }
                                                                <div className='flex flex-col gap-1 items-start justify-start'>
                                                                    {
                                                                        <div className={`${itm?.userid === user?.id ? "text-right" : "text-left"} text-[10px] w-full text-[#888]`}>
                                                                            {!(user?.id === itm?.userid) && (!itm?.id.toString().includes('muted-')) && itm?.userEmail + " • "}
                                                                            {
                                                                                (!itm?.id.toString().includes('muted-')) &&
                                                                                itm?.id &&
                                                                                moment(itm?.id).calendar(null, {
                                                                                    sameDay: '[Today at] LT',
                                                                                    lastDay: '[Yesterday at] LT',
                                                                                    lastWeek: '[Last] dddd [at] LT',
                                                                                    sameElse: 'MMMM Do YYYY, h:mm:ss a'
                                                                                }) // Show formatted date and time
                                                                            }
                                                                        </div>
                                                                    }
                                                                
                                                                <div
                                                                    className={`${itm?.id.toString().includes('muted-') ? "border-none mx-auto w-full text-[#888] max-w-100" :
                                                                        (itm?.userid === user?.id ? "bg-[#111111] ml-auto " : "bg-[#77777722] mr-auto w-auto")} shadow-md text-white border-[#535353] border-[1px] max-w-[300px] text-sm p-2 rounded-md break-all`}>
                                                                    {itm?.id.toString().includes('muted-') && itm?.userEmail + " "}
                                                                    {itm?.content}
                                                                 
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                }
                                            </div>

                                            :
                                            <div className='h-full flex items-end justify-center text-sm text-[#888]'>
                                                <div className='mb-5'>
                                                    Send your first chat!
                                                </div>
                                            </div>
                                    }
                                    {
                                        isShow &&
                                        <div
                                            style={{ transform: 'translate(-50%, -50%)' }}
                                            onClick={scrollToBottomSmooth}
                                            className='h-[50px] absolute bottom-[10%] cursor-pointer hover:bg-[#1111] border-[#535353] text-[#535353] border-[1px] left-[50%] w-[50px] rounded-full flex items-center justify-center p-1 bg-[#222]'>
                                            <FaArrowDown />
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className='flex gap-2 h-full max-h-[70px] '>
                                <textarea
                                    maxLength={300}
                                    value={chatText}
                                    onChange={(e) => { setChatText(e.target.value) }}
                                    className='p-3 w-full rounded-lg outline-none resize-none border-[#535353] border-[1px]'
                                    placeholder='Type a new message'
                                    name="" id="" />
                                <div className='flex flex-col gap-2'>
                                    <div
                                        onClick={() => { !loading && sendChat() }}
                                        className={`${chatText ? ' bg-[#111]' : ' bg-[#222]'} h-full cursor-pointer p-1 w-[50px] flex items-center justify-center rounded-lg border-[#535353] border-[1px]`}>
                                        {
                                            loading ?
                                                <div className='w-[20px] h-[20px]'>
                                                    <Loader />
                                                </div>
                                                :
                                                <IoSend />
                                        }
                                    </div>
                                    <div>
                                        <div
                                            onClick={toggleEmojiPicker}
                                            className={`bg-[#111] h-full cursor-pointer p-1 flex  w-[50px]  items-center justify-center rounded-lg border-[#535353] border-[1px]`}>
                                            <MdOutlineEmojiEmotions />

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <AnimatePresence>
                                {isOpen && (
                                    // Background overlay with click handler, but delaying close to complete animation
                                    <motion.div
                                        className="bg-red-900 positioners w-full h-full flex items-center justify-center"
                                        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        onClick={() => {
                                            setTimeout(() => {
                                                setIsOpen(false);
                                            }, 300);
                                        }}
                                    >
                                        {/* EmojiPicker container with exit scale animation */}
                                        <motion.div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                            initial={{ opacity: 0.5 }}
                                            animate={{ opacity: .9 }}
                                            exit={{ scale: 0.5, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}>
                                            <div className="dark-mode-emoji-picker scale-[0.9]">
                                                <EmojiPicker onEmojiClick={onEmojiClick} theme={"dark" as Theme} />
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </motion.div>

                </motion.div>
            }
        </AnimatePresence>
    )
}

export default Chat
