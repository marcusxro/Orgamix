import React from 'react'
import orgamixLogo from '../../../assets/Orgamix.png'
import { IoChevronBack } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

const PaymentHeader:React.FC = () => {
    const nav = useNavigate()
    return (
        <header className='p-4 w-full flex items-center justify-between border-b-[1px] border-b-[#535353]'>
            <div className='flex items-center justify-between  max-w-[1200px] mx-auto  w-full'>
                <div className='font-bold flex items-center gap-2'>
                    <div className='w-[30px] h-[30px] overflow-hidden'>
                        <img src={orgamixLogo} alt="Orgamix Logo" className='h-full w-full object-cover' />
                    </div>
                    ORGAMIX
                </div>


                <div className='flex gap-3 items-center'>
                    <div className='border-[1px] flex items-center gap-1 border-[#535353] bg-[#313131] px-3 p-2 rounded-md cursor-pointer hover:bg-[#414141] ' onClick={() => nav(-1)}>
                        <IoChevronBack /> Back
                    </div>
                    <div className='border-[1px] flex items-center gap-2 border-[#535353] bg-[#313131] px-3 p-2 rounded-md cursor-pointer  hover:bg-[#414141] ' onClick={() => nav('/user/settings')}>
                        Settings <IoSettingsOutline />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default PaymentHeader
