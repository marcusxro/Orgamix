import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../Utils/supabase/supabaseClient';
import { useNavigate } from 'react-router-dom';

const BannedUser: React.FC = () => {
    const [isExiting, setIsExiting] = useState(false);

    const nav = useNavigate()


    async function logOutUser() {
        setIsExiting(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error logging out:', error.message);
            } else {
                console.log("Logout successful");
         
                nav('/sign-in');
            }
        } catch (err) {
            console.error('Error logging out:', err);
        }
    }


    function openMailTo() {
        window.open('mailto:orgamixteam@gmail.com');
    }   


    return (
        <AnimatePresence>
            {
                !isExiting && (

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        className='ml-auto maxedIndex   flex items-center p-3 justify-center w-full h-full'
                    >

                        <div className='w-full max-w-[500px] h-auto p-5 bg-[#313131] z-[5000000000000000000000000000000000000000]  rounded-lg  overflow-auto border-[#535353] border-[1px]  flex flex-col justify-between'>
                            <h2 className='font-bold'>You are banned from the platform</h2>
                            <p className='text-sm text-[#888] mt-1 mb-5'>
                                You have been banned from the platform for violating our terms of service. If you believe this is a mistake, <span 
                                onClick={() => openMailTo()}
                                className='font-bold cursor-pointer text-[#999]'>please contact support</span>.
                            </p>
                            <button
                                className='bg-red-500 hover:bg-red-600 text-white p-2 rounded-md mt-3'
                                onClick={() => logOutUser()}>Log out</button>
                        </div>
                    </motion.div>
                )
            }
        </AnimatePresence>
    )
}

export default BannedUser
