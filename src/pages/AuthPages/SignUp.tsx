import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import React, { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { firebaseAuthKey } from '../../firebase/FirebaseKey'
import axios from 'axios'
import Loader from '../../comps/Loader'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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



    function createUserAccount(e: FormEvent) {
        e.preventDefault()

        if (!Username || !email || !password || !repPassword) {
            return console.log("please fill up all inputs!")
        }

        if (password !== repPassword) {
            return console.log("Password fields are not matched!")
        } else {
            // 7 minimum characters
            if (password.length <= 6 || password.length <= 6) {
                return errorModal("Please make your password stronger!")
            }
        }

        if (isLoading) {
            //prevent spam clicks
            return
        }
        setIsLoading(true)
        console.log("clicked")
        createUserWithEmailAndPassword(firebaseAuthKey, email, password)
            .then((userCred) => {
                sendEmailVerification(userCred.user)
                const user = firebaseAuthKey.currentUser
                if (user && !user.emailVerified) {
                    axios.post('http://localhost:8080/CreateAccount', {
                        Username: Username,
                        Email: email,
                        Password: password,
                        Uid: userCred?.user?.uid
                    }).then((res) => {
                        console.log(res.status)
                        if (res.status === 201) {
                            setUsername("")
                            setEmail("")
                            setRepPassword("")
                            setPassword("")
                            notif('Account created! please verify your email')
                            setIsLoading(false)
                        } else {
                            setIsLoading(false)
                        }

                    }).catch((err) => {
                        console.log(err)
                    })
                }


            }).catch((err: any) => {
                setIsLoading(false)

                if (err === 'Email already in use') {
                    return errorModal("Email is used!")
                }

                if (err.code === 'auth/email-already-in-use') {
                    return errorModal("Email is used!")
                }

                if (err) {
                    console.log(err)
                }
            })
    }


    function changeValueOfCheck() {

        setSeePass(prevs => !prevs)
        console.log(seePass)
    }
    return (
        <div className='w-full h-[100dvh] p-3 items-center flex justify-center'>
            <ToastContainer />
            <form
                onSubmit={createUserAccount}
                className='w-full flex flex-col gap-2 max-w-[400px] p-3 rounded-lg bg-[#2e2e2e] border-[1px] border-[#414141]'
                action="submit">
                <div className='w-full text-center'>Create your account</div>
                <input
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                    }}
                    required
                    className='p-2 rounded-md outline-none'
                    type="email" placeholder='Email' />
                <input
                    value={Username}
                    onChange={(e) => {
                        setUsername(e.target.value)
                    }}
                    required
                    className='p-2 rounded-md outline-none'
                    type="text" placeholder='Username' />
                <input
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                    }}
                    required
                    className='p-2 rounded-md outline-none '
                    type={`${seePass ? "text": "password"}`} placeholder='Password' />
                <input
                    value={repPassword}
                    onChange={(e) => {
                        setRepPassword(e.target.value)
                    }}
                    required
                    className='p-2 rounded-md outline-none '
                    type={`${seePass ? "text": "password"}`} placeholder='Repeat Password' />
                <div className='gap-2 flex px-1 w-auto items-center'>
                    <input
                        checked={seePass}
                        onChange={() => { changeValueOfCheck() }}
                        type="checkbox" />
                    <div
                        onClick={() => {
                            changeValueOfCheck()
                        }}
                        className='cursor-pointer'>See Password</div>
                </div>
                <button className={`${isLoading && 'bg-[#414141]'}bg-[#242424] py-2 rounded-md flex items-center justify-center  border-[1px] border-[#414141] mt-1 hover:bg-[#414141]`}>
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
                    className={`${isLoading && 'bg-[#414141]'}bg-[#242424] py-2 rounded-md  border-[1px] border-[#414141] mt-1 hover:bg-[#414141]`}>Sign in </button>
            </form>

        </div>
    )
}

export default SignUp
