import React from 'react'
import IsLoggedIn from '../firebase/IsLoggedIn'
import { useNavigate } from 'react-router-dom'
import OrgamixLogo from '../assets/Orgamix.png'


const Header: React.FC = () => {
    const [user] = IsLoggedIn()

    const nav = useNavigate()

    return (
        <header className='flex gap-3 justify-between items-center px-[5%] py-4 border-b-[1px] border-b-[#414141]'>
            <div className='w-[20px] h-[20px] cursor-pointer flex gap-2 items-center'>
                <img src={OrgamixLogo} className='w-full h-full object-cover' alt="" />
                <div className='font-bold'>
                    ORGAMIX
                </div>
            </div>

            {
                user ?
                    <div
                        onClick={() => { nav('/user/dashboard') }}
                        className={`bg-[#242424] py-2 rounded-md cursor-pointer  px-4 border-[1px]
                 border-[#414141] mt-1 hover:bg-[#414141]`}>
                        Dashboard</div>
                    :
                    <div className='flex gap-3 justify-between items-center'>
                        <div
                            onClick={() => { nav('sign-in') }}
                            className={`bg-[#242424] py-2 rounded-md  px-4 border-[1px]
                     border-[#414141] mt-1 hover:bg-[#414141]`}>
                            Sign in</div>
                        <div
                            onClick={() => { nav('sign-up') }}
                            className={`bg-[#242424] py-2 rounded-md  px-4 border-[1px]
                     border-[#414141] mt-1 hover:bg-[#414141]`}>
                            Sign   up</div>
                    </div>
            }
        </header>
    )
}

export default Header
