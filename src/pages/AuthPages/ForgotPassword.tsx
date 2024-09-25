import React, { FormEvent, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { sendPasswordResetEmail } from 'firebase/auth';
import { firebaseAuthKey } from '../../firebase/FirebaseKey';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState<string>("")

    const resetPassword = (e: FormEvent) => {
        e.preventDefault()
        sendPasswordResetEmail(firebaseAuthKey, email)
            .then(() => {
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

                setEmail('')
            }).catch((err) => {
                console.log(err)
            })
    }

    const nav = useNavigate()
    return (
        <div className='w-full h-[100dvh] p-3 items-center flex justify-center'>
            <ToastContainer />

            <form
                onSubmit={resetPassword}
                className='w-full flex flex-col gap-2 max-w-[400px] p-3 rounded-lg bg-[#2e2e2e] border-[1px] border-[#414141]'
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
                    className={`bg-[#242424] py-2 rounded-md  border-[1px] border-[#414141] mt-1 hover:bg-[#414141]`}>Recover</button>
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
            </form>
        </div>
    )
}

export default ForgotPassword
