import React, { FormEvent, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'
import Menu from '../../comps/Menu';
import Header from '../../comps/Header';
import useStore from '../../Zustand/UseStore';
import Loader from '../../comps/Loader';
import MetaEditor from '../../comps/MetaHeader/MetaEditor';
import { supabase } from '../../supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const ForgotPassword:React.FC = () => {
    const [email, setEmail] = useState<string>("")
    const [loading, setLoading] = useState(false)

    const resetPassword = async (e: FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);

        try {

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password/${uuidv4()}?email=${email}`,
            });

            if (error) {
                console.error(error);
                toast.error("Error sending reset email. Please try again.", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            } else {
                toast.success("Verification sent!", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                setEmail('');
            }
        } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } finally {
            setLoading(false);
        }
    };

    const nav = useNavigate()
    const { showMenu }: any = useStore()


    return (
        <div className='w-full h-[100dvh] p-3 items-center flex justify-center selectionNone' >
            <MetaEditor
                title="Orgamix | Forgot Password"
                description="Need help logging in? Reset your Orgamix password here and get back to staying organized."
                keywords='Orgamix, Password, Reset, Forgot, Help, Login, Sign in, Sign up, Account, Recovery, Email, Verification, Send, Link, New, Create, Password, Username, User, Name, Full, Name, Email, Address, Phone, Number, Mobile, Verification, Verify'
            />

            <ToastContainer />
            <div className="absolute inset-0 w-full h-full bg-transparent z-10 opacity-40 grid-overlay"></div>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-[#333] z-10 opacity-100"></div>

            {
                showMenu &&
                <Menu />
            }
            <div className='fixed top-0 left-0 w-full bg-[#222] z-[20]'>
                <Header />
            </div>

            <motion.form
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                onSubmit={resetPassword}
                className='w-full flex flex-col z-[20] gap-2 max-w-[400px] p-3 rounded-lg bg-[#2e2e2e] border-[1px] border-[#414141]'
                action="submit">

                <div className='w-full text-center'>
                    Recover your account
                </div>
                <input
                    value={email}
                    onChange={(e) => { setEmail(e.target.value) }}
                    required
                    type="email"
                    className='p-2 rounded-md outline-none '
                    placeholder='Email' />
                <button
                    className={`bg-[#242424] py-2 rounded-md flex items-center justify-center  border-[1px] border-[#414141] mt-1 hover:bg-[#414141]`}>
                    {
                        loading ?
                            <div className='w-[20px] h-[20px]'>
                                <Loader />
                            </div>
                            :
                            "Recover"
                    }
                </button>
                <div className='relative'>
                    <div className='border-[1px] border-[#414141] mt-[10px]'>

                    </div>
                    <div className='centeredItem'>
                        or
                    </div>

                </div>
                <button
                    onClick={() => {
                        nav('/sign-in')
                    }}
                    className={`bg-[#242424] py-2 rounded-md  border-[1px] border-[#414141] mt-1 hover:bg-[#414141]`}>Sign in </button>
                <button
                    onClick={() => {
                        nav('/sign-up')
                    }}
                    className={`bg-[#242424] py-2 rounded-md  border-[1px] border-[#414141] mt-1 hover:bg-[#414141]`}>Sign up </button>
            </motion.form>
        </div>
    )
}

export default ForgotPassword
