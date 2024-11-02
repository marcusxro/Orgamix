import React from 'react'
import OrgamixLogo from '../assets/Orgamix.png'
import { FaGithub } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { SiGmail } from "react-icons/si";

const Footer: React.FC = () => {
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
                    <div className='text-[#888] cursor-pointer hover:text-[#fff]'>
                        <FaGithub />
                    </div>
                    <div className='text-[#888] cursor-pointer hover:text-[#fff]'>
                        <FaFacebook />
                    </div>
                    <div className='text-[#888] cursor-pointer hover:text-[#fff]'>
                        <SiGmail />
                    </div>
                </div>
                <div className='flex gap-3 text-[#888] items-end md:items-center flex-col md:flex-row'>
                <div className='text-sm'>Free tier ●</div>
                    <div className='cursor-pointer text-sm'>Home</div>
                    <div className='cursor-pointer text-sm'>Documentation</div>
                    <div className='cursor-pointer text-sm'>About</div>
                    <div className='cursor-pointer text-sm'>Contact</div>
                </div>
            </div>
        </div>
    )
}

export default Footer
