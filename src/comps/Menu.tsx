import React from 'react'
import OrgamixLogo from '../assets/Orgamix.png'
import { IoMdClose } from "react-icons/io";
import useStore from '../Zustand/UseStore';
import IsLoggedIn from '../firebase/IsLoggedIn';
import FetchPFP from './FetchPFP';


import { LuLayoutDashboard } from "react-icons/lu";
import { GoTasklist } from "react-icons/go";
import { FaRegNoteSticky } from "react-icons/fa6";
import { LuGoal } from "react-icons/lu";
import { GoProjectSymlink } from "react-icons/go";
import { IoSettingsOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

const Menu: React.FC = () => {
    const { showMenu, setShowMenu }: any = useStore()
    const [user]:any = IsLoggedIn()
    const nav = useNavigate()
    return (
        <div className='h-[100dvh] block md:hidden py-4 overflow-auto bg-[#111] fixed top-0 left-0 w-full z-[5066262000] p-5'>
            <header className='flex gap-5 items-center justify-between'>
                <div className='w-[20px] h-[20px] cursor-pointer flex gap-2 items-center'>
                    <img src={OrgamixLogo} className='w-full h-full object-cover' alt="" />
                    <div className='font-bold'>
                        ORGAMIX
                    </div>
                </div>

                <div
                    onClick={() => { setShowMenu(!showMenu) }}
                    className='h-full  p-[13px] rounded-full bg-[#1f1f1f] hover:bg-[#414141] mt-1 px-4 border-[1px] border-[#414141]'>
                    <IoMdClose />
                </div>

            </header>

            <div className='mt-9 flex gap-4 flex-col '>
                {
                    user ?
                        <div
                            onClick={() => { nav('/user/dashboard'); setShowMenu(!showMenu) }}
                            className='w-full bg-white p-3 rounded-lg text-black font-bold text-center'>
                            Dashboard
                        </div> :
                        <div className='flex gap-2'>
                            <div
                                onClick={() => { nav('/sign-in'); setShowMenu(!showMenu) }}
                                className='w-full bg-white cursor-pointer hover:bg-[#d3d3d3] p-3 rounded-lg text-black font-bold text-center'>
                                Sign in
                            </div>
                            <div
                                onClick={() => { nav('/sign-up'); setShowMenu(!showMenu) }}
                                className='w-full bg-white p-3 cursor-pointer hover:bg-[#d3d3d3] rounded-lg text-black font-bold text-center'>
                                Sign up
                            </div>
                        </div>
                }
                <div 
                onClick={() => {nav('/contact'); ; setShowMenu(!showMenu) }}
                className='w-full mt-2 bg-[#1f1f1f]  border-[1px] hover:bg-[#333] cursor-pointer border-[#414141] text-white p-3 rounded-lg  font-bold text-center'>
                    Contact
                </div>
            </div>

            {
                user &&
                <div className='mt-5 flex gap-5 flex-col border-t-[1px] border-t-[#414141] pt-4'>
                    <div className='flex gap-5 justify-between'>
                        <div className='text-lg'>{user?.email}</div>
                        <div className='w-[30px] h-[30px] rounded-full overflow-hidden'>
                            <FetchPFP userUid={user?.id} />
                        </div>
                    </div>

                    <div
                        onClick={() => { nav('/user/dashboard'); setShowMenu(!showMenu) }}
                        className='flex gap-2 justify-between cursor-pointer'>
                        <div>
                            Dashboard
                        </div>

                        <div className='text-xl text-[#888]'>
                            <LuLayoutDashboard />
                        </div>
                    </div>

                    <div
                        onClick={() => { nav('/user/tasks'); setShowMenu(!showMenu) }}
                        className='flex gap-2 justify-between cursor-pointer'>
                        <div>
                            Tasks
                        </div>

                        <div

                            className='text-xl text-[#888]'>
                            <GoTasklist />
                        </div>
                    </div>

                    <div
                        onClick={() => { nav('/user/notes'); setShowMenu(!showMenu) }}
                        className='flex gap-2 justify-between cursor-pointer'>
                        <div>
                            Notes
                        </div>

                        <div className='text-xl text-[#888]'>
                            <FaRegNoteSticky />
                        </div>
                    </div>

                    <div
                        onClick={() => { nav('/user/goals'); setShowMenu(!showMenu) }}
                        className='flex gap-2 justify-between cursor-pointer'>
                        <div>
                            Goals
                        </div>

                        <div className='text-xl text-[#888]'>
                            <LuGoal />
                        </div>
                    </div>

                    <div
                        onClick={() => { nav('/user/projects'); setShowMenu(!showMenu) }}
                        className='flex gap-2 justify-between cursor-pointer'>
                        <div>
                            Projects
                        </div>

                        <div className='text-xl text-[#888]'>
                            <GoProjectSymlink />
                        </div>
                    </div>

                    <div
                        onClick={() => { nav('/user/settings'); setShowMenu(!showMenu) }}
                        className='flex gap-2 justify-between cursor-pointer'>
                        <div>
                            Settings
                        </div>

                        <div className='text-xl text-[#888]'>
                            <IoSettingsOutline />
                        </div>
                    </div>

                </div>
            }



            <div className='mt-9 flex gap-5 flex-col border-t-[1px] border-t-[#414141] pt-4'>
                <div className='cursor-pointer' onClick={() => {nav('/'); ; setShowMenu(!showMenu) }}>
                    Home
                </div>
                <div className='cursor-pointer'>
                    Documentation
                </div>
                 <div className='cursor-pointer' onClick={() => {nav('/about'); ; setShowMenu(!showMenu) }}>
                    About
                </div>
                 <div className='cursor-pointer' onClick={() => {nav('/contact'); ; setShowMenu(!showMenu) }}>
                    Contact
                </div>
            </div>


        </div>
    )
}

export default Menu
