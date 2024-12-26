import React, { useEffect, useState } from 'react'
import MetaEditor from '../../../comps/MetaHeader/MetaEditor'
import Header from '../../../comps/Header'
import useStore from '../../../Zustand/UseStore'
import Menu from '../../../comps/Menu'
import { motion } from 'framer-motion'
import { supabase } from '../../../supabase/supabaseClient'
import { BiSolidError } from "react-icons/bi";
import Loader from '../../../comps/Loader'
import IsLoggedIn from '../../../comps/Utils/IsLoggedIn'

const ResetPassword: React.FC = () => {
    const { showMenu }: any = useStore()
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [isError, setError] = useState<string>('')
    const [loadingPass, setLoadingPass] = useState<boolean>(false)
    const [successText, setSuccessText] = useState<string>('')
    const [user] = IsLoggedIn()



    async function resetPassword() {
        // Reset Password Logic

        if (loadingPass) return;
        setLoadingPass(true);

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            setLoadingPass(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoadingPass(false)
            return
        }

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasUpperCase) {
            setError('Password must contain at least one uppercase letter')
            setLoadingPass(false)
            return
        }
        if (!hasLowerCase) {
            setError('Password must contain at least one lowercase letter')
            setLoadingPass(false)
            return
        }
        if (!hasNumber) {
            setError('Password must contain at least one number')
            setLoadingPass(false)
            return
        }
        if (!hasSpecialChar) {
            setError('Password must contain at least one special character')
            setLoadingPass(false)
            return
        }


        try {
            const { data, error }: any = await supabase
                .auth
                .updateUser({
                    password: password
                })

            if (error) {
                console.error(error)

                if(!user) {
                    setError('You are not authenticated')
                    setLoadingPass(false)
                    return
                } else {
                    setError('Error resetting password')
                    setLoadingPass(false)
                    return
                }
             
          
            }

            if (data) { setLoadingPass(false); setSuccessText('Password reset successfully') }

        }
        catch (error) {
            if(!user) {
                setError('You are not authenticated')
                setLoadingPass(false)
            } else {
                console.error(error)
                setError('Error resetting password')
                setLoadingPass(false)
            }
  
        }

    }


    useEffect(() => {
        if (isError) {
            setTimeout(() => {
                setError('')
            }, 5000)
        }
    }, [isError])

    useEffect(() => {
        if (successText) {
            setTimeout(() => {
                setSuccessText('')
            }, 5000)
        }
    }, [successText])

    const messageVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    return (


        <div className='w-full h-[100dvh] p-3 items-center flex justify-center selectionNone' >

            <MetaEditor
                title="Orgamix | Reset Password"
                description="Need help logging in? Reset your Orgamix password here and get back to staying organized."
                keywords='Orgamix, Password, Reset, Forgot, Help, Login, Sign in, Sign up, Account, Recovery, Email, Verification, Send, Link, New, Create, Password, Username, User, Name, Full, Name, Email, Address, Phone, Number, Mobile, Verification, Verify'
            />


            <div className="absolute inset-0 w-full h-full bg-transparent z-10 opacity-40 grid-overlay"></div>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-[#333] z-10 opacity-100"></div>
            {
                showMenu &&
                <Menu />
            }
            <div className='fixed top-0 left-0 w-full bg-[#222] z-[20]'>
                <Header />
            </div>



            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                className='w-full flex flex-col z-[20] gap-1 max-w-[400px] p-3 rounded-lg bg-[#2e2e2e] border-[1px] border-[#414141]'>
                <div className='text-[#fff] text-center font-bold text-lg'>
                    Reset Password
                </div>
                <div>
                    <div className='my-2'>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" placeholder='New Password'
                            className='w-full p-2 rounded-lg text-[#888] border-[1px] border-[#535353] bg-[#111] outline-none' />
                    </div>
                    <div className='my-2'>
                        <input
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            type="password" placeholder='Confirm Password'
                            className='w-full p-2 rounded-lg text-[#888] border-[1px] border-[#535353] bg-[#111] outline-none' />
                    </div>
                </div>

                {
                    isError &&
                    <motion.div
                        className='w-full bg-red-500 p-2 rounded-lg max-w-[605px] flex items-center gap-2 break-all'
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={messageVariants}
                        transition={{ duration: 0.2 }}
                    >
                        <span><BiSolidError /></span> {isError}
                    </motion.div>
                }

                {
                    successText &&
                    <motion.div
                        className='w-full bg-green-500 p-2 rounded-lg max-w-[605px] flex items-center gap-2 break-all'
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={messageVariants}
                        transition={{ duration: 0.2 }}
                    >
                        {successText}
                    </motion.div>
                }

                <div className='my-3'>
                    <button
                        onClick={resetPassword}
                        className='w-full bg-[#222] flex items-center justify-center p-2 rounded-lg text-[#fff] border-[1px] border-[#535353] hover:bg-[#535353]'>
                        {
                            loadingPass ?
                                <div className='w-[20px] h-[20px]'>
                                    <Loader />
                                </div>
                                :
                                'Reset Password'
                        }
                    </button>
                </div>

            </motion.div>


        </div>


    )
}

export default ResetPassword
