import React, { useEffect, useState } from 'react'
import { FaLinkSlash } from "react-icons/fa6";
import { supabase } from '../Utils/supabase/supabaseClient';
import IsLoggedIn from '../Utils/IsLoggedIn';
import NoUserPfp from '../../assets/UserNoProfile.jpg'
import { useParams } from 'react-router-dom';
import Loader from '../Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip as ReactTooltip } from 'react-tooltip'
import FetchPFP from '../FetchPFP';

interface accountType {
    userid: string;
    username: string;
    password: string;
    email: string;
    id: number;
    fullname: string;
}


interface fetchedDataType {
    id: number;
    title: string;
    notes: string;
    category: string;
    userid: string;
    createdat: string
}

interface closerType {
    closer: React.Dispatch<React.SetStateAction<boolean>>
}
interface fetchedDataTypes {
    id: number;
    title: string;
    notes: string;
    category: string;
    userid: string;
    createdat: string
    sharedEmails: accountType[]
}


const ShareNotes: React.FC<closerType> = ({ closer }) => {
    const [user]:any = IsLoggedIn()
    const params = useParams()
    const [prevData, setPrevData] = useState<fetchedDataTypes[] | null>(null)
    const [email, setEmail] = useState<string>("")
    const [selectionVal, setSelectionVal] = useState<string>("")

    const [fetchedData, setFetchedData] = useState<accountType[] | null>(null);
    const [fetchedNote, setFetchedNote] = useState<fetchedDataType[] | null>(null);
    const [isExiting, setIsExiting] = useState(false);
    const [isCoppied, setIsCoppied] = useState(false);
    const [myAccount, setMyAccount] = useState<accountType[] | null>(null);
    const [emailAdded, setEmailAdded] = useState<accountType[] | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

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


    useEffect(() => {
        if (params && user) {

            getNotes()


        }
    }, [params, user])

    useEffect(() => {
        if (user) {
            getAccounts();
            getMyAccount()
        }
        if (user) {
            getProjectByID()
        }
    }, [email, user]);



    async function getProjectByID() {

        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('createdat', params?.time)
                .eq('userid', params?.id);

            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setPrevData(data)
            
            }
        } catch (err) {
            console.log('Error:', err);
        }
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

    async function getMyAccount() {
        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('userid', user?.id);

            if (error) {
                console.error('Error fetching data:', error);
            } else {
            
                setMyAccount(data);
            }
        } catch (err) {
            console.log('Error:', err);
        }
    }



    async function getNotes() {

        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('userid', params?.id)
                .eq('createdat', params?.time);

            if (error) {
                console.error('Error fetching data:', error);
            } else {

                setFetchedNote(data)
                setSelectionVal(data[0]?.share || "")
                setEmailAdded(data[0]?.sharedEmails || [])
            }
        } catch (err) {
            console.log('Error:', err);
        }
    }

    const [isExpand, setIsExpand] = useState<boolean>(false)

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            closer(false);
            setIsExiting(false);
        }, 300);
    };

    async function saveEditAccess() {
        setLoading(true)

        if (loading) {
            return
        }

        if (selectionVal === "" && !emailAdded && !user) {
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase
                .from('notes')
                .update({
                    share: selectionVal,
                    sharedEmails: emailAdded
                })
                .eq('userid', params?.id)
                .eq('createdat', params?.time);

            if (error) {
                console.error(error);
                setLoading(false);
            } else {

                if (selectionVal === "Only Me" && emailAdded && emailAdded.length > 0) {
                    // Loop through the invited email list and notify them
                    for (const email of emailAdded) {
                        const { error: notificationError } = await supabase
                            .from('notification')
                            .insert({
                                uid: email?.userid,  // Notify this invited user
                                content: `The note "${prevData && prevData[0]?.title}" has been set to private by ${myAccount && myAccount[0]?.username}`,
                                created_at: new Date().toISOString().replace('T', ' ').slice(0, 26) + '+00',
                                linkofpage: `user/notes/${prevData && prevData[0]?.userid}/${prevData && prevData[0]?.createdat}`
                            });

                        if (notificationError) {
                            console.error(`Error notifying ${email}:`, notificationError);
                        } else {
                            console.log(`Notification sent to ${email}`);
                        }
                    }
                }

                if (selectionVal === "Specific" && emailAdded && emailAdded.length > 0) {
                    const previousInvitedEmails = prevData && prevData[0]?.sharedEmails || [];

                    // Find the newly added emails
                    const newlyAddedEmails = emailAdded.filter(email => !previousInvitedEmails.includes(email));

                    const removedEmails = previousInvitedEmails.filter((email: any) => !emailAdded.includes(email));



                    for (const email of newlyAddedEmails) {
                        // Fetch the user account using the email to get the `userid`, if not already in `emailAdded`
                        const { data: userAccount, error: userError } = await supabase
                            .from('accounts')  // Assuming you have an accounts table
                            .select('userid')
                            .eq('userid', email?.userid); // Replace with the actual field for email if necessary

                        if (userError || !userAccount || userAccount.length === 0) {
                            console.error(`Error fetching user account for ${email}:`, userError);
                            continue;
                        }

                        const invitedUserId = userAccount[0]?.userid;

                        // Insert notification for each newly invited user
                        const { error: notificationError } = await supabase
                            .from('notification')
                            .insert({
                                uid: invitedUserId,  // Notify this invited user by their `userid`
                                content: `You have been invited to the note "${prevData && prevData[0]?.title}" by ${myAccount && myAccount[0]?.username}`,
                                created_at: new Date().toISOString().replace('T', ' ').slice(0, 26) + '+00',
                                linkofpage: `user/notes/${prevData && prevData[0]?.userid}/${prevData && prevData[0]?.createdat}`
                            });

                        if (notificationError) {
                            console.error(`Error notifying ${email}:`, notificationError);
                        } else {
                            console.log(`Notification sent to ${email?.username}`);
                        }
                    }

                    if (removedEmails.length > 0) {
                        for (const email of removedEmails) {
                            // Fetch the user account using the email to get the `userid`
                            const { data: userAccount, error: userError } = await supabase
                                .from('accounts')  // Assuming you have an accounts table
                                .select('userid')
                                .eq('userid', email?.userid); // Replace with the actual field for email if necessary

                            if (userError || !userAccount || userAccount.length === 0) {
                                console.error(`Error fetching user account for ${email}:`, userError);
                                continue;
                            }

                            const removedUserId = userAccount[0]?.userid;

                            // Insert notification for each removed user
                            const { error: notificationError } = await supabase
                                .from('notification')
                                .insert({
                                    uid: removedUserId,  // Notify this removed user by their `userid`
                                    content: `You have been removed from the note "${prevData && prevData[0]?.title}" by ${myAccount && myAccount[0]?.username}}`,
                                    created_at: new Date().toISOString().replace('T', ' ').slice(0, 26) + '+00',
                                    linkofpage: `user/notes/${prevData && prevData[0]?.userid}/${prevData && prevData[0]?.createdat}`
                                });

                            if (notificationError) {
                                console.error(`Error notifying ${email}:`, notificationError);
                            } else {
                                console.log(`Notification sent to ${email?.email}`);
                            }
                        }
                    }


                }

                console.log("EDITED!");
                setLoading(false);
                handleOutsideClick()
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }


    const currentLink = window.location.href; // Get the current URL

    const handleCopyLink = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(currentLink)
                .then(() => {
                    console.log("Link copied to clipboard!");
                    setIsCoppied(true);
                })
                .catch(err => {
                    console.error("Failed to copy link: ", err);
                    setIsCoppied(false);
                });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = currentLink;
            textArea.style.position = "fixed"; // Prevent scrolling to bottom
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand("copy");
                console.log("Link copied to clipboard!");
                setIsCoppied(true);
            } catch (err) {
                console.error("Fallback copy failed: ", err);
                setIsCoppied(false);
            }
            document.body.removeChild(textArea);
        }
    };



    return (
        <AnimatePresence>
            {
                !isExiting &&
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
                        onClick={(e) => { e.stopPropagation() }}
                        className={`w-full max-w-[550px] bg-[#313131]  z-[5000] relative
                           rounded-lg p-3 h-full ${selectionVal != 'Specific' ? 'max-h-[250px]' : "max-h-[600px]"} border-[#535353] border-[1px] flex flex-col gap-3 overflow-auto`}>
                        <div className='h-full flex flex-col overflow-auto'>
                            <div className='mb-3'>
                                <div className='text-xl font-bold'>
                                    Share note
                                </div>
                                <p className='text-sm text-[#888]'>
                                    Collaborate effortlessly by sharing your notes with others. Choose specific users or share with everyone to enhance teamwork and productivity!
                                </p>
                            </div>
                            <div className='w-full flex gap-3 flex-col mt-2 h-full'>

                                {
                                    selectionVal === "Specific" &&
                                    <input
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value) }}
                                        type="text"
                                        placeholder='Add people by email'
                                        className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px]'
                                    />
                                }
                                {
                                    selectionVal === "Specific" && email != "" && fetchedData && fetchedData.length != 0 &&
                                    <div className='w-full h-full min-h-[auto] max-h-[80px] bg-[#535353] p-2 rounded-lg overflow-auto'>
                                        {
                                            fetchedData && fetchedData?.map((itm: accountType, idx: number) => (
                                                <div
                                                    onClick={() => { itm?.email !== user?.email && addToArr(itm) }}
                                                    key={idx}
                                                    className='w-full flex items-center gap-3 cursor-pointer p-3 hover:bg-[#111111] rounded-lg'>
                                                    <div className='w-[35px] h-[35px] rounded-full overflow-hidden'>
                                                        <FetchPFP userUid={itm?.userid} />
                                                    </div>
                                                    <div className='flex flex-col'>
                                                        <div className={`${itm?.email === user?.email && 'line-through'} font-bold text-sm`}>

                                                            {itm?.email === user?.email && '(you)'}    {itm?.email}</div>
                                                        <div className='text-[#888] text-sm'>{itm?.username}</div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                }
                                <select
                                    value={selectionVal}
                                    onChange={(e) => { setSelectionVal(e.target.value) }}
                                    className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px]'
                                >
                                    <option value="">Choose access</option>
                                    <option value="Only Me">Only me</option>
                                    <option value="Everyone">Everyone with the link</option>
                                    <option value="Specific">Add specific access by email</option>

                                </select>
                                {
                                    selectionVal === "Specific" && emailAdded != null &&
                                    <div
                                        onClick={() => { setIsExpand(prevs => !prevs) }}
                                        className='flex gap-1 items-center p-3  bg-[#111111] outline-none border-[#535353] border-[1px] w-auto rounded-lg'>
                                        <div className='w-[20px] h-[20px] rounded-full overflow-hidden mr-2'>
                                            <img
                                                className='w-full h-full'
                                                src={NoUserPfp} alt="" />
                                        </div>
                                        <span> {emailAdded != null && emailAdded.length}</span>
                                        <span>people added</span>
                                    </div>
                                }

                                {
                                    selectionVal === "Specific" && emailAdded != null && isExpand && fetchedNote &&
                                    <div className='bg-[#535353]  w-full max-h-[200px] h-full rounded-lg overflow-auto p-2'>
                                        {
                                            emailAdded && emailAdded?.map((itm: accountType, idx: number) => (
                                                <div
                                                    onClick={() => {
                                                        removeFromArr(itm?.email)
                                                    }}
                                                    key={idx}
                                                    className='w-full flex items-center gap-3 cursor-pointer p-3 hover:bg-[#111111] rounded-lg'>
                                                    <div className='w-[35px] h-[35px] rounded-full overflow-hidden'>
                                                        <FetchPFP userUid={itm?.userid} />
                                                    </div>
                                                    <div className='flex flex-col'>
                                                        <div className='font-bold text-sm'>{itm?.email?.length >= 26 ? itm?.email.slice(0, 25) + "..." : itm?.email}</div>
                                                        <div className='text-[#888] text-sm'>{itm?.username}</div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                }
                            </div>
                        </div>


                        <div className='flex mt-auto items-center w-full gap-3'>
                            <div
                                onClick={() => { handleCopyLink() }}
                                data-tooltip-id={`fetch`}
                                className={`${isCoppied && "bg-green-500"} flex items-center bg-blue-500 rounded-lg justify-center border-[#535353] border-[1px]  p-3 cursor-pointer`}>
                                <FaLinkSlash />
                            </div>

                            <ReactTooltip
                                id={`fetch`}
                                place="bottom"
                                variant="dark"
                                className='rounded-lg border-[#535353] bg-red-600 border-[1px]'
                                content={`${isCoppied ? "Link Copied" : "Copy Llnk"}`}
                            />

                            <div className='flex w-full   border-[#535353] border-[1px]  rounded-lg overflow-hidden'>
                                <div
                                    onClick={() => { handleOutsideClick() }}
                                    className='w-full p-2 hover:bg-[#535353] selectionNone bg-[#111111] border-r-[#535353] border-r-[1px]  text-center cursor-pointer'>
                                    Cancel
                                </div>
                                <div
                                    onClick={() => { saveEditAccess() }}
                                    className={`${loading && 'bg-[#535353]'} selectionNone w-full p-2 hover:bg-[#535353] flex items-center justify-center  bg-[#111111] text-center cursor-pointer`}>
                                    {
                                        loading ?
                                            <div className='w-[20px] h-[20px]'>
                                                <Loader />
                                            </div>
                                            :
                                            "Save"
                                    }
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default ShareNotes
