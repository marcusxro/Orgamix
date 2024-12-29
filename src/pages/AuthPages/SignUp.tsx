import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import React, { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { firebaseAuthKey } from '../../comps/Utils/firebase/FirebaseKey'
import Loader from '../../comps/Svg/Loader'
import { supabase } from '../../comps/Utils/supabase/supabaseClient'
import { motion } from 'framer-motion'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../comps/System/layouts/Header'
import Menu from '../../comps/System/layouts/Menu'
import useStore from '../../comps/Utils/Zustand/UseStore'
import MetaEditor from '../../comps/MetaHeader/MetaEditor'



const SignUp: React.FC = () => {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [repPassword, setRepPassword] = useState<string>("")
    const [Username, setUsername] = useState<string>("")

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const nav = useNavigate()

    const [seePass, setSeePass] = useState<boolean>(false)



    const notif = (params: string) => {
        toast.success(params, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
    }


    const errorModal = (params: string) => {
        toast.error(params, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
    }


    async function createUser(params: string) {
        try {
            const { error } = await supabase.from('accounts').insert({
                userid: params,
                username: Username,
                password: password,
                email: email,
            })
            if (error) {
                console.error('Error inserting data:', error);
            } else {
                setUsername("")
                setEmail("")
                setRepPassword("")
                setPassword("")
                notif('Account created! please verify your email')
                setIsLoading(false)
            }
        } catch (err) {
            console.log(err);
        }
    }



    function createUserAccount(e: FormEvent) {
        e.preventDefault();


        if (!Username || !email || !password || !repPassword) {
            return console.log("Please fill up all inputs!");
        }

        if (password !== repPassword) {
            return console.log("Password fields do not match!");
        }

        if (password.length < 7) {
            return errorModal("Please make your password stronger!");
        }

        if (isLoading) {
            return; // Prevent duplicate requests
        }

        setIsLoading(true);
    

        // Sign up user with Supabase
        supabase.auth
            .signUp({
                email: email,
                password: password,
            })
            .then((response) => {
                const user = response as any;
                setIsLoading(false);

                if (user) {
                    createUser(user.data.user.id);
                    console.log("User signed up successfully:", user);
                    notif("Account created! Please check your email for verification.");
                }
            })
            .catch((error: { message: string | string[] }) => {
                setIsLoading(false);

                if (error) {
                    console.log(error);

                    if (error.message.includes('For security purposes, you can only request')) {
                        return errorModal("For security purposes, you can only request a new verification email every 5 minutes.");
                    }
                    if (error.message.includes("already registered") || error.message.includes("email already in use")) {
                        return errorModal("Email is already in use!");
                    }

                    console.error("Signup error:", error.message);
                    return errorModal("An error occurred. Please try again.");
                }

                errorModal("Something went wrong. Please try again later.");
            });
    }


    function changeValueOfCheck() {

        setSeePass(prevs => !prevs)

    }
    const { showMenu }: any = useStore()

    return (
        <div className='w-full h-[100dvh] p-3 items-center flex justify-center selectionNone'>
            <MetaEditor
                title="Orgamix | Sign Up"
                description="Join Orgamix to start organizing your life with tools for projects, deadlines, and goal setting. Get started today!"
                keywords='Orgamix, Sign Up, Dashboard, Tasks, Projects, Goals'
            />

            <ToastContainer />
            {
                showMenu &&
                <Menu />
            }
            <div className='fixed top-0 left-0 w-full bg-[#222] z-[20]'>
                <Header />
            </div>
            <div className="absolute inset-0 w-full h-full bg-transparent z-10 opacity-40 grid-overlay"></div>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-[#333] z-10 opacity-100"></div>

            <motion.form
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                onSubmit={createUserAccount}
                className='w-full flex flex-col gap-2 z-[12] max-w-[400px] p-3 rounded-lg bg-[#2e2e2e] border-[1px] border-[#414141]'
                action="submit">
                <div className='w-full text-center'>Create your orgamix account</div>
                <input
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                    }}
                    required
                    className='p-2 rounded-md outline-none border-[1px] border-[#414141] bg-[#111] text-white'
                    type="email" placeholder='Email' />
                <input
                    value={Username}
                    onChange={(e) => {
                        setUsername(e.target.value)
                    }}
                    maxLength={20}
                    required
                    className='p-2 rounded-md outline-none border-[1px] border-[#414141] bg-[#111] text-white'
                    type="text" placeholder='Username' />
                <input
                    value={password}
                    maxLength={20}
                    onChange={(e) => {
                        setPassword(e.target.value)
                    }}
                    required
                    className='p-2 rounded-md outline-none border-[1px] border-[#414141] bg-[#111] text-white'
                    type={`${seePass ? "text" : "password"}`} placeholder='Password' />
                <input
                    value={repPassword}
                    maxLength={20}
                    onChange={(e) => {
                        setRepPassword(e.target.value)
                    }}
                    required
                    className='p-2 rounded-md outline-none border-[1px] border-[#414141] bg-[#111] text-white'
                    type={`${seePass ? "text" : "password"}`} placeholder='Repeat Password' />
                <div className='gap-2 flex px-1 w-auto items-center'>
                    <input
                        checked={seePass}
                        onChange={() => { changeValueOfCheck() }}
                        type="checkbox" />
                    <div
                        onClick={() => {
                            changeValueOfCheck()
                        }}
                        className='cursor-pointer selectionNone'>See Password</div>
                </div>
                <button className={`${isLoading && 'bg-[#414141]'} bg-[#242424] py-2 rounded-md flex items-center justify-center  border-[1px] border-[#414141] mt-1 hover:bg-[#414141]`}>
                    {
                        isLoading ?
                            <div className='w-[30px] h-[30px]'>
                                <Loader />
                            </div>
                            :
                            <>
                                Sign up
                            </>
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
                    className={`${isLoading && 'bg-[#414141]'}  bg-[#242424] py-2 rounded-md  border-[1px] border-[#414141] mt-1 hover:bg-[#414141]`}>Sign in </button>
            </motion.form>

        </div>
    )
}

export default SignUp
function createUser(id: any) {
    throw new Error('Function not implemented.')
}

function errorModal(arg0: string) {
    throw new Error('Function not implemented.')
}

function setIsLoading(arg0: boolean) {
    throw new Error('Function not implemented.')
}

function notif(arg0: string) {
    throw new Error('Function not implemented.')
}

function setSeePass(arg0: (prevs: any) => boolean) {
    throw new Error('Function not implemented.')
}

