import React, { useEffect, useState } from 'react'
import { FaLinkSlash } from "react-icons/fa6";
import { supabase } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import NoUserPfp from '../../assets/UserNoProfile.jpg'
import { useParams } from 'react-router-dom';
import Loader from '../Loader';


interface accountType {
    userid: string;
    username: string;
    password: string;
    email: string;
    id: number;
    fullname: string;
}


interface closerType {
    closer: React.Dispatch<React.SetStateAction<boolean>>
}

const ShareNotes: React.FC<closerType> = ({ closer }) => {
    const [user] = IsLoggedIn()
    const params = useParams()

    const [email, setEmail] = useState<string>("")
    const [selectionVal, setSelectionVal] = useState<string>("")

    const [fetchedData, setFetchedData] = useState<accountType[] | null>(null);





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
        if (params) {
            console.log(params)
        }
    }, [params])

    useEffect(() => {
        if (email && user) {
            getAccounts();
        }
    }, [email, user]);

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
        console.log(emailAdded)
    }, [emailAdded])

    const [isExpand, setIsExpand] = useState<boolean>(false)


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
            console.log(selectionVal);

            let sharedEmails: string[] = [];

            if (selectionVal === "Specific") {
                if (emailAdded && emailAdded.length > 0) {
                    sharedEmails = emailAdded.map((itm) => itm.email);
                } else {
                    console.warn("No emails added for sharing.");
                }
            } else if (selectionVal === "Only me" || selectionVal === "Everyone") {
                sharedEmails = []; // Empty array for "Only me" and "Everyone"
            }

            const { error } = await supabase
                .from('notes')
                .update({
                    share: selectionVal,
                    sharedEmails: sharedEmails
                })
                .eq('userid', params?.uid)
                .eq('createdat', params?.time);

            if (error) {
                console.error(error);
                setLoading(false);
            } else {
                console.log("EDITED!");
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }

    const currentLink = window.location.href; // Get the current URL

    const handleCopyLink = () => {
        navigator.clipboard.writeText(currentLink)
            .then(() => {
                console.log("Link copied to clipboard!");
                // Optionally, show a success message to the user
            })
            .catch(err => {
                console.error("Failed to copy link: ", err);
            });
    };


    
    return (
        <div
            onClick={(e) => { e.stopPropagation() }}
            className='w-full max-w-[550px] bg-[#313131]  z-[5000] relative
            rounded-lg p-3 h-full max-h-[600px] border-[#535353] border-[1px] flex flex-col gap-3 overflow-auto'
        >
            <div className='h-full flex flex-col'>
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
                                        onClick={() => { addToArr(itm) }}
                                        key={idx}
                                        className='w-full flex items-center gap-3 cursor-pointer p-3 hover:bg-[#111111] rounded-lg'>
                                        <div className='w-[35px] h-[35px] rounded-full overflow-hidden'>
                                            <img
                                                className='w-full h-full'
                                                src={NoUserPfp} alt="" />
                                        </div>
                                        <div className='flex flex-col'>
                                            <div className='font-bold text-sm'>{itm?.email}</div>
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
                        selectionVal === "Specific" && emailAdded != null && isExpand &&
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
                                            <img
                                                className='w-full h-full'
                                                src={NoUserPfp} alt="" />
                                        </div>
                                        <div className='flex flex-col'>
                                            <div className='font-bold text-sm'>{itm?.email.length >= 26 ? itm?.email.slice(0, 25) + "..." : itm?.email}</div>
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
                onClick={() => {handleCopyLink()}} 
                className='flex items-center bg-blue-500 rounded-lg justify-center border-[#535353] border-[1px]  p-3 cursor-pointer'>
                    <FaLinkSlash />
                </div>
                <div className='flex w-full   border-[#535353] border-[1px]  rounded-lg overflow-hidden'>
                    <div
                        onClick={() => { closer(false) }}
                        className='w-full p-2 hover:bg-[#535353] bg-[#111111] border-r-[#535353] border-r-[1px]  text-center cursor-pointer'>
                        Cancel
                    </div>
                    <div
                        onClick={() => { saveEditAccess() }}
                        className={`${loading && 'bg-[#535353]'} w-full p-2 hover:bg-[#535353] flex items-center justify-center  bg-[#111111] text-center cursor-pointer`}>
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

        </div>
    )
}

export default ShareNotes
