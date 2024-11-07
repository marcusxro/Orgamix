import React, { FormEvent, useEffect, useState } from 'react'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { firebaseAuthKey } from '../../firebase/FirebaseKey'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import Header from '../../comps/Header';
import useStore from '../../Zustand/UseStore';
import Menu from '../../comps/Menu';
import { motion } from 'framer-motion'
import { FaGoogle } from "react-icons/fa";

import { provider } from '../../firebase/FirebaseKey';
import Loader from '../../comps/Loader';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import MetaEditor from '../../comps/MetaHeader/MetaEditor';

const SignIn: React.FC = () => {

    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [user] = IsLoggedIn()
    const [loading, setLoading] = useState(false)
    const [isLoad, setIsLoad] = useState(false)
    
    async function handleGoogleSignIn() {
        if (loading) return; // Prevent multiple calls if already loading
        setIsLoad(true);
    
        try {
            const result = await signInWithPopup(firebaseAuthKey, provider);
            const user = result.user;
            console.log("User signed in:", user);
            // Additional actions, like saving user info, can be done here
    
        } catch (err: any) {
            console.log(err);
            if (err.code === 'auth/popup-closed-by-user') {
                setIsLoad(false); // Reset loading state if user closes the popup
            } else {
                console.error("Error during sign-in:", err);
            }
        } finally {
            setIsLoad(false); // Reset loading state regardless of success or error
        }
    }
    

    const nav = useNavigate()


    useEffect(() => {
        if (user?.emailVerified) {
            nav('/user/dashboard')
        }
    }, [user])


    const errorNotif = (params: string) => {
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


    function signIn(e: FormEvent) {
        e.preventDefault()
        setLoading(true)
        if (loading) {
            return
        }
        if (!email || !password) {
            setLoading(false)
            return errorNotif("Please type something!")

        }

        signInWithEmailAndPassword(firebaseAuthKey, email, password)
            .then((res) => {
                const user = res.user
                const isVerified = res.user.emailVerified

                if (!isVerified) {
                    setLoading(false)
                    errorNotif("Please verify your email first!")
                } else {
                    window.location.reload()
                    console.log("User signed in!!!", user)
                    setLoading(false)
                    nav('/user/dashboard')
                }

            }).catch((err) => {
                console.log(err)
                setLoading(false)
                if (err.code === 'auth/user-not-found') {
                    errorNotif("user not found!")
                }
                if (err.code === 'auth/wrong-password, please try again') {
                    errorNotif("wrong password!")
                }
                if (err.code === 'auth/too-many-requests') {
                    errorNotif("Too many requests!!")
                }
                if (err.code === 'auth/invalid-credential') {
                    errorNotif("Invalid user details!")
                }
            })
    }

    const [isSee, setIsSee] = useState<boolean>(false)
    const { showMenu }: any = useStore()
    return (
        <div className='w-full h-[100dvh] p-3 items-center flex justify-center'>
            <MetaEditor
                title="Orgamix | Sign In"
                description="Access your Orgamix dashboard to manage and track your tasks, projects, and personal goals with ease."
                keywords='Orgamix, Sign In, Dashboard, Tasks, Projects, Goals'
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
                onSubmit={signIn}
                className='w-full flex z-[12] flex-col gap-2 max-w-[400px] p-3 rounded-lg bg-[#2e2e2e] border-[1px] border-[#414141]'
                action="submit">
                <div className='w-full text-center'>Please sign in with Orgamix your account</div>
                <input
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                    }}
                    required
                    className='p-2 rounded-md outline-none border-[1px] border-[#414141] bg-[#111]'
                    type="email" placeholder='Email' />

                <div className='w-full relative'>
                    <input
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                        }}
                        required
                        className='p-2 pr-9 rounded-md outline-none w-full relative border-[1px] border-[#414141] bg-[#111]'
                        type={`${isSee ? 'text' : 'password'}`} placeholder='Password' />

                    <div
                        onClick={() => { setIsSee(prevs => !prevs) }}
                        className='absolute top-3 right-3 z-10 text-[#888] cursor-pointer selectionNone hover:text-white'>
                        {
                            isSee ?
                                <FaEyeSlash />
                                :
                                <FaEye />
                        }
                    </div>
                </div>

                <div className='text-sm w-full py-1 gap-1 flex'>
                    Forgot password?
                    <span
                        onClick={() => { nav('/recover') }}
                        className='text-blue-400 cursor-pointer'>
                        Click Here!
                    </span>
                </div>
                <button className='bg-[#242424] flex items-center justify-center py-2 rounded-md  border-[1px] border-[#414141] hover:bg-[#414141]'>
                    {
                        loading ?
                            <div className='w-[20px] h-[20px]'>
                                <Loader />
                            </div>
                            :
                            "Sign in"
                    }
                </button>
                <div className='relative'>
                    <div className='border-[1px] border-[#414141] mt-[10px]'>

                    </div>
                    <div className='centeredItem'>
                        or
                    </div>
                </div>

                <div
                    onClick={() => {!isLoad && handleGoogleSignIn()}}
                    className='bg-[#242424] py-2 rounded-md selectionNone cursor-pointer  border-[1px] border-[#414141] mt-1 hover:bg-[#414141] flex gap-2 items-center justify-center'>

                    {
                        isLoad ?
                            <div className='w-[20px] h-[20px]'>
                                <Loader />
                            </div>

                            :
                            <>
                                <span className='text-md text-orange-500'>  <FaGoogle /></span> Sign in with Google
                            </>
                    }

                </div>

                <button
                    onClick={() => {
                        nav('/sign-up')
                    }}
                    className='bg-[#242424] py-2 rounded-md selectionNone border-[1px] border-[#414141] mt-1 hover:bg-[#414141]'>Sign up </button>
            </motion.form>
        </div>
    )
}

export default SignIn
