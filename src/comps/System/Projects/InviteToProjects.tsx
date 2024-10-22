import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../../Zustand/UseStore';
import { ImUnlocked } from "react-icons/im";
import { FaLock } from "react-icons/fa";
import { BsShareFill } from "react-icons/bs";
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import { Button } from './Button';
import noUserProfile from '../../../assets/UserNoProfile.jpg'
import { supabase } from '../../../supabase/supabaseClient';
import { useParams } from 'react-router-dom';
import Loader from '../../Loader';


interface invitedEmails {
    userid: string;
    username: string;
    password: string;
    email: string;
    id: number;
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
    id: number;
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


interface dataType {
    description: string;
    id: number;
    created_at: number;
    name: string;
    created_by: string;
    deadline: number;
    is_shared: string;
    invited_emails: null | invitedEmails[];
    updated_at: null | updatedAt[];
    is_favorite: boolean;
    boards: boardsType[]
}

interface accountType {
    userid: string; //
    username: string; //
    password: string; //
    email: string;
    id: number;
    is_ban: boolean;
}


const InviteToProjects: React.FC = () => {
    const [isExiting, setIsExiting] = useState(false);
    const [prevData, setPrevData] = useState<dataType[] | null>(null)
    const { inviteToProject, setInviteToProject }: any = useStore()

    const [fetchedData, setFetchedData] = useState<accountType[] | null>(null);


    const [user] = IsLoggedIn()
    const [emailAdded, setEmailAdded] = useState<invitedEmails[] | null>(null);

    const [email, setEmail] = useState<string>("")
    const params = useParams()
    const [clickListener, setClickListener] = useState<string>("")

    const [privacySel, setPrivacySel] = useState<string | null>("")
    const [isExpand, setIsExpand] = useState<boolean>(false)

    const [loading, setLoading] = useState<boolean>(false)



    useEffect(() => {
        if (email && user) {
            getAccounts();
        }
    }, [email, user]);


    useEffect(() => {
        if (prevData != null && prevData[0]?.is_shared && prevData && clickListener === "") {
            setPrivacySel(prevData[0]?.is_shared || "")
        }
        if (prevData != null && prevData[0]?.invited_emails != null && prevData) {
            setEmailAdded(prevData && prevData[0]?.invited_emails)
        }

    }, [prevData, clickListener])


    function addToArr(params: accountType) {
        // Check if the email is already in the emailAdded array
        const isEmailAdded = emailAdded?.some(itm => itm.email === params.email);
        if (!isEmailAdded) {
            setEmailAdded((prevEmails) => {
                // Initialize newEmails with params if prevEmails is null
                const newEmails = prevEmails ? [...prevEmails, params] : [params];
                // Clear the email input field since the email is being added
                setEmail("");

                return newEmails; // Return the updated email array
            });
        }
    }

    function removeFromArr(emailToRemove: string) {
        setEmailAdded((prevEmails) => {
            if (!prevEmails) return null; // Return null if there are no emails
            // Filter out the email that matches the provided parameter
            const updatedEmails = prevEmails.filter(emailObj => emailObj.email !== emailToRemove);

            return updatedEmails.length > 0 ? updatedEmails : null; // Return null if the array is empty
        });
    }


    async function getAccounts() {


        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('email', email);

            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setFetchedData(data);
            }
        } catch (err) {
            console.log('Error:', err);
        }
    }


    useEffect(() => {
        if (user) {
            getProjectByID()
        }
    }, [user, privacySel])



    async function getProjectByID() {

        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('created_at', params?.time)
                .eq('created_by', user?.uid);

            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setPrevData(data)
            }
        } catch (err) {
            console.log('Error:', err);
        }
    }


    async function saveEditData() {
        setLoading(true)

        if (loading) {
            setLoading(false)
            return
        }

        // if(privacySel === "shareable") {
        //     if(!emailAdded) {
        //         setLoading(false)
        //         return
        //     }
        // }


        if (privacySel === "") {
            setLoading(false)
            return
        }


        try {
            const { error } = await supabase
                .from('projects')
                .update({
                    is_shared: privacySel,
                    invited_emails: emailAdded
                })
                .eq('created_at', params?.time)
                .eq('created_by', user?.uid);


            if (error) {
                console.error('Error fetching data:', error);
                setLoading(false)
            } else {
                console.log("EDITED")
                setIsExpand(false)
                setLoading(false)
                handleOutsideClick()
            }

        }
        catch (err) {
            console.log(err)
            setLoading(false)
        }
    }


    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setInviteToProject(null);
            setIsExiting(false);
        }, 300); // Match the animation duration
    };


    return (
        <AnimatePresence>
            {
                inviteToProject && !isExiting &&
                setPrevData != null &&
                (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.2 } }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className='ml-auto positioners flex items-center p-3 justify-center w-full h-full'
                            onClick={handleOutsideClick}>
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                                exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                                className={`w-[450px] h-full bg-[#313131] z-[5000] rounded-lg p-3 overflow-auto border-[#535353] border-[1px] ${privacySel === "shareable" ? "max-h-[600px]" : "max-h-[300px]"} flex flex-col justify-between`}
                                onClick={(e) => e.stopPropagation()} >

                                <div className='overflow-auto  h-full' >
                                    <div className='mb-4'>
                                        <div className='text-xl font-bold'>Invite project members</div>
                                        <div className='text-sm text-[#888] mt-1'>
                                            Add your team members to collaborate on the project. Enter their email addresses to send an invitation and grant access.
                                        </div>
                                    </div>

                                    <div className='flex gap-2 flex-col w-full  mt-3'>
                                        <div>Privacy</div>
                                        <div className='flex gap-3 justify-between overflow-auto'>
                                            <div
                                                onClick={() => { setPrivacySel("public"); setClickListener("clicked") }}
                                                className={`${privacySel === "public" && "bg-green-500"} px-3 w-full justify-center py-2 flex gap-2
                                                items-center cursor-pointer border-[#535353] border-[1px] rounded-lg `}><ImUnlocked />Public</div>
                                            <div
                                                onClick={() => { setPrivacySel("private"); setClickListener("clicked") }}
                                                className={`${privacySel === "private" && "bg-green-500"} px-3 w-full justify-center py-2 flex gap-2 
                                                items-center cursor-pointer border-[#535353] border-[1px] rounded-lg `}><FaLock />Private</div>
                                            <div
                                                onClick={() => { setPrivacySel("shareable"); setClickListener("clicked") }}
                                                className={`${privacySel === "shareable" && "bg-green-500"} px-3 w-full justify-center py-2 flex gap-2 
                                                items-center cursor-pointer border-[#535353] border-[1px] rounded-lg `}><BsShareFill /> Shareable</div>
                                        </div>
                                    </div>

                                    {
                                        privacySel === "shareable" && emailAdded != null && emailAdded?.length >= 1 &&
                                        <div
                                            onClick={() => { setIsExpand(prevs => !prevs) }}
                                            className='flex gap-1 items-center p-3 mt-2 bg-[#111111] outline-none border-[#535353] border-[1px] w-auto rounded-lg'>
                                            <div className='w-[20px] h-[20px] rounded-full overflow-hidden mr-2'>
                                                <img
                                                    className='w-full h-full'
                                                    src={noUserProfile} alt="" />
                                            </div>
                                            <span> {emailAdded != null && emailAdded.length}</span>
                                            <span>people added</span>
                                        </div>
                                    }
                                    {
                                        privacySel === "shareable" && isExpand && emailAdded != null && emailAdded?.length >= 1 &&
                                        <div className='bg-[#535353] mt-2 w-full max-h-[200px] h-full rounded-lg overflow-auto p-2'>
                                            {
                                                emailAdded && emailAdded?.map((itm: invitedEmails, idx: number) => (
                                                    <div
                                                        onClick={() => {
                                                            removeFromArr(itm?.email)
                                                        }}
                                                        key={idx}
                                                        className='w-full flex items-center gap-3 cursor-pointer p-3 hover:bg-[#111111] rounded-lg'>
                                                        <div className='w-[35px] h-[35px] rounded-full overflow-hidden'>
                                                            <img
                                                                className='w-full h-full'
                                                                src={noUserProfile} alt="" />
                                                        </div>
                                                        <div className='flex flex-col'>
                                                            <div className='font-bold text-sm'>{itm?.email.length >= 40 ? itm?.email.slice(0, 40) + "..." : itm?.email}</div>
                                                            <div className='text-[#888] text-sm'>{itm?.username}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    }
                                    {
                                        privacySel === "shareable" &&
                                        <div className='w-full mt-2 flex flex-col gap-2'>
                                            <input
                                                value={email}
                                                onChange={(e) => { setEmail(e.target.value) }}
                                                placeholder='Add people by email'
                                                className='p-2 rounded-md border-[#535353] border-[1px] w-full outline-none'
                                            />

                                            {
                                                email && fetchedData &&
                                                <>
                                                    {
                                                        fetchedData?.length <= 0 ?
                                                            <>
                                                                No result
                                                            </>
                                                            :
                                                            <div className='flex gap-1'>
                                                                <div>
                                                                    {fetchedData.length}
                                                                </div>
                                                                <div className='flex gap-1'>
                                                                    {
                                                                        fetchedData.length > 1 ?
                                                                            <>results</>
                                                                            :
                                                                            <>result</>
                                                                    }

                                                                    <span>
                                                                        found
                                                                    </span>
                                                                </div>
                                                            </div>
                                                    }
                                                </>
                                            }

                                            {
                                                email != '' && fetchedData != null && fetchedData.map((itm, idx: number) => (
                                                    <div className='bg-[#535353]  w-full max-h-[200px] h-full rounded-lg overflow-auto p-2'>
                                                        <div
                                                            onClick={() => { addToArr(itm); console.log("CLICKED") }}
                                                            key={idx}
                                                            className='w-full flex items-center gap-3 cursor-pointer p-3 hover:bg-[#111111] rounded-lg'>
                                                            <div className='w-[35px] h-[35px] rounded-full overflow-hidden'>
                                                                <img
                                                                    className='w-full h-full'
                                                                    src={noUserProfile} alt="" />
                                                            </div>
                                                            <div className='flex flex-col'>
                                                                <div className='font-bold text-sm'>{itm?.email.length >= 26 ? itm?.email.slice(0, 25) + "..." : itm?.email}</div>
                                                                <div className='text-[#888] text-sm'>{itm?.username}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            }

                                        </div>
                                    }
                                </div>
                                <div className='w-full
                                min-h-[40px]
                                 flex rounded-lg overflow-hidden border-[#535353] border-[1px] mt-4'>
                                    <Button
                                        variant={"withBorderRight"}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => { saveEditData() }}
                                        variant={"withCancel"}>
                                        {
                                            loading ?
                                                <div className='w-[20px] h-[20px]'>
                                                    <Loader />
                                                </div>

                                                :
                                                <>Save</>
                                        }
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )

            }
        </AnimatePresence>
    )
}

export default InviteToProjects
