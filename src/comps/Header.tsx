import React from 'react'
import IsLoggedIn from '../firebase/IsLoggedIn'
import { useNavigate } from 'react-router-dom'
import OrgamixLogo from '../assets/Orgamix.png'
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import useStore from '../Zustand/UseStore';


const Header: React.FC = () => {
    const [user] = IsLoggedIn()

    const nav = useNavigate()
    const {showMenu, setShowMenu}: any = useStore()

    return (
        <header className='flex gap-3 mx-auto px-3 justify-between items-center py-4 border-b-[1px] border-b-[#414141]'>
            <div className='flex gap-3 justify-between items-center mx-auto w-full max-w-[1200px] '>

                <div className='w-[20px] h-[20px] cursor-pointer flex gap-2 items-center'>
                    <img src={OrgamixLogo} className='w-full h-full object-cover' alt="" />
                    <div className='font-bold'>
                        ORGAMIX
                    </div>

                    <div className='hidden text-[13px] gap-3 ml-[2rem] md:flex'>
                        <div>
                            Home
                        </div>
                        <div>
                            Documentation
                        </div>
                        <div>
                            About
                        </div>
                        <div>
                            Contact
                        </div>
                    </div>
                </div>

                <div className='flex items-center gap-2'>

                    {
                        user ?
                            <div
                                onClick={() => { nav('/user/dashboard') }}
                                className={`bg-[#242424] py-2 rounded-md cursor-pointer  px-4 border-[1px]
                 border-[#414141] mt-1 hover:bg-[#414141] hidden md:block `}>
                                Dashboard</div>
                            :
                            <div className='flex gap-3 justify-between items-center'>
                                <div
                                    onClick={() => { nav('sign-in') }}
                                    className={`bg-[#242424] py-2 rounded-md  px-4 border-[1px]
                     border-[#414141] mt-1 hover:bg-[#414141] hidden md:block`}>
                                    Sign in</div>
                                <div
                                    onClick={() => { nav('sign-up') }}
                                    className={`bg-[#242424] py-2 rounded-md  px-4 border-[1px]
                     border-[#414141] mt-1 hover:bg-[#414141] hidden md:block`}>
                                    Sign   up</div>
                            </div>
                    }
                    <div 
                        onClick={() => {setShowMenu(!showMenu)}}
                    className='block md:hidden h-full  p-[13px] rounded-full bg-[#1f1f1f] hover:bg-[#414141] mt-1 242424] px-4 border-[1px] border-[#414141]'>
                        <HiOutlineMenuAlt4 />
                    </div>
                </div>
            </div>

        </header>
    )
}

export default Header
