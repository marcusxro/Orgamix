import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import IsLoggedIn from './Utils/IsLoggedIn'
import { useNavigate } from 'react-router-dom'
import OrgamixLogo from '../assets/Orgamix.png'
import { HiOutlineMenuAlt4 } from "react-icons/hi"
import useStore from '../Zustand/UseStore'

const Header: React.FC = () => {
    const [user]:any = IsLoggedIn()
    const nav = useNavigate()
    const { showMenu, setShowMenu }: any = useStore()
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    const controlHeaderVisibility = () => {
        if (typeof window !== 'undefined') {
            const currentScrollY = window.scrollY
            if (currentScrollY > lastScrollY) {
                // Scrolling down
                setIsVisible(false)
            } else {
                // Scrolling up
                setIsVisible(true)
            }
            setLastScrollY(currentScrollY)
        }
    }

    useEffect(() => {
        window.addEventListener('scroll', controlHeaderVisibility)
        return () => {
            window.removeEventListener('scroll', controlHeaderVisibility)
        }
    }, [lastScrollY])

    return (
        <motion.header
            initial={{ y: 0 }}
            animate={{ y: isVisible ? 0 : -100 }}
            transition={{ duration: 0.3 }}
            className='flex gap-3 sticky top-0 bg-[#242424] z-[200000000] mx-auto px-5 justify-between items-center py-4 border-b-[1px] border-b-[#414141]'
        >
            <div className='flex gap-3 justify-between items-center mx-auto w-full max-w-[1200px] '>
                <div className='w-[20px] h-[20px] cursor-pointer flex gap-2 items-center'>
                    <img src={OrgamixLogo} className='w-full h-full object-cover' alt="" />
                    <div
                        onClick={() => { nav('/') }}
                     className='font-bold'>ORGAMIX</div>
                    <div className='hidden text-[13px] gap-3 ml-[2rem] md:flex'>
                        <div onClick={() => { nav('/') }}>Home</div>
                        <div>Documentation</div>
                        <div onClick={() => { nav('/about') }}>About</div>
                        <div onClick={() => { nav('/contact') }}>Contact</div>
                        <div onClick={() => { nav('/pricing') }}>Pricing</div>
                        <div onClick={() => { nav('/articles') }}>Articles</div>
                    </div>
                </div>

                <div className='flex items-center gap-2'>
                    {user ? (
                        <div
                            onClick={() => { nav('/user/dashboard') }}
                            className={`bg-[#242424] py-2 rounded-md cursor-pointer px-4 border-[1px]
                                border-[#414141] mt-1 hover:bg-[#414141] hidden md:block `}
                        >
                            Dashboard
                        </div>
                    ) : (
                        <div className='flex gap-3 justify-between items-center'>
                            <div
                                onClick={() => { nav('/sign-in') }}
                                className={`bg-[#242424] py-2 rounded-md px-4 border-[1px] cursor-pointer
                                    border-[#414141] mt-1 hover:bg-[#414141] hidden md:block`}
                            >
                                Sign in
                            </div>
                            <div
                                onClick={() => { nav('/sign-up') }}
                                className={`bg-[#242424] py-2 rounded-md px-4 border-[1px] cursor-pointer
                                    border-[#414141] mt-1 hover:bg-[#414141] hidden md:block`}
                            >
                                Sign up
                            </div>
                        </div>
                    )}
                    <div
                        onClick={() => { setShowMenu(!showMenu) }}
                        className='block md:hidden h-full p-[13px] rounded-full bg-[#1f1f1f] hover:bg-[#414141] mt-1 px-4 border-[1px] border-[#414141]'
                    >
                        <HiOutlineMenuAlt4 />
                    </div>
                </div>
            </div>
        </motion.header>
    )
}

export default Header
