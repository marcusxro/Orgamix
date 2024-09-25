import React, { FormEvent, useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { firebaseAuthKey } from '../../firebase/FirebaseKey'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const SignIn: React.FC = () => {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")


    const nav = useNavigate()


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

        if (!email || !password) {
            return  errorNotif("Please type something!")

        }

        signInWithEmailAndPassword(firebaseAuthKey, email, password)
            .then((res) => {
                const user = res.user
                const isVerified = res.user.emailVerified

                if (!isVerified) {
                    return errorNotif("Please verify your email first!")
                } else {
                    console.log("User signed in!!!", user)
                }
            }).catch((err) => {
                console.log(err)

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

    return (
        <div className='w-full h-[100dvh] p-3 items-center flex justify-center'>
                        <ToastContainer />
            <form
                onSubmit={signIn}
                className='w-full flex flex-col gap-2 max-w-[400px] p-3 rounded-lg bg-[#2e2e2e] border-[1px] border-[#414141]'
                action="submit">
                <div className='w-full text-center'>Please sign in with your Account</div>
                <input
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                    }}
                    required
                    className='p-2 rounded-md outline-none'
                    type="email" placeholder='Email' />
                <input
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                    }}
                    required
                    className='p-2 rounded-md outline-none '
                    type="password" placeholder='Password' />
                <div className='text-sm w-full py-1 gap-1 flex'>
                    Forgot password?
                    <span
                        onClick={() => { nav('/recover') }}
                        className='text-blue-400 cursor-pointer'>
                        Click Here!
                    </span>
                </div>
                <button className='bg-[#242424] py-2 rounded-md  border-[1px] border-[#414141] hover:bg-[#414141]'>Sign in</button>
                <div className='relative'>
                    <div className='border-[1px] border-[#414141] mt-[10px]'>

                    </div>
                    <div className='centeredItem'>
                        or
                    </div>
                </div>
                <button
                    onClick={() => {
                        nav('/sign-up')
                    }}
                    className='bg-[#242424] py-2 rounded-md  border-[1px] border-[#414141] mt-1 hover:bg-[#414141]'>Sign up </button>
            </form>
        </div>
    )
}

export default SignIn
