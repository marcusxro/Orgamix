import React from 'react'
import OrgamixLogo from '../assets/Orgamix.png'
import { FaGithub } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {

    const handleEmailClick = () => {
        window.location.href = 'mailto:orgamixteam@gmail.com'; // Triggers email client with the provided email
    };
    const nav = useNavigate()
    return (
        <div className='h-auto  flex flex-col gap-5 bg-[#1b1b1b] items-center text-white border-t-[1px] border-t-[#535353] p-5 overflow-auto'>

            <div className='flex justify-between gap-5 mx-auto max-w-[1180px] w-full'>
                <div className='flex items-center gap-4'>
                    <div className='w-[30px] h-[30px] cursor-pointer'>
                        <img
                            className='w-full h-full object-cover'
                            src={OrgamixLogo} alt="" />
                    </div>
                    <div className='text-[#888]'>
                        © 2024
                    </div>
                </div>

                <div>
                    Orgamix
                </div>
            </div>

            <div className='w-full mx-auto  max-w-[1180px]  gap-5 justify-between flex items-start md:items-center mt-5 '>
                <div className='flex gap-3'>
                    <div
                        onClick={() => { window.open('https://github.com/marcusxro') }}

                        className='text-[#888] cursor-pointer hover:text-[#fff]'>
                        <FaGithub />
                    </div>
                    <div

                        onClick={() => { window.open('https://www.facebook.com/marcuss09') }}

                        className='text-[#888] cursor-pointer hover:text-[#fff]'>
                        <FaFacebook />
                    </div>
                    <div
                        onClick={handleEmailClick}
                        className='text-[#888] cursor-pointer hover:text-[#fff]'>
                        <SiGmail />
                    </div>
                </div>
                <div className='flex gap-3 text-[#888] items-end md:items-center flex-col md:flex-row'>
                    <div className='text-sm'>Free tier ●</div>
                    <div
                        onClick={() => { nav('/') }}
                        className='cursor-pointer text-sm'>Home</div>
                    <div 
                        onClick={() => { nav('/documentation') }}
                    className='cursor-pointer text-sm'>Documentation</div>
                    <div
                        onClick={() => { nav('/about') }}
                    className='cursor-pointer text-sm'>About</div>
                    <div
                        onClick={() => { nav('/contact') }}
                     className='cursor-pointer text-sm'>Contact</div>
                </div>
            </div>
        </div>
    )
}

export default Footer
