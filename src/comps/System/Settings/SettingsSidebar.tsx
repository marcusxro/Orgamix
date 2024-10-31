import React from 'react'
import { MdAccountCircle } from "react-icons/md";
import { MdOutlineSecurity } from "react-icons/md";

interface locStringType {
    locString:string
}

const SettingsSidebar:React.FC = () => {

  return (
    <div className='h-full w-full max-w-[120px] justify-start border-r-[1px] border-r-[#535353] flex items-center flex-col gap-2 p-3'>
        <div className='bg-[#111] p-2 flex  items-center gap-1 rounded-md border-[1px] border-[#535353] cursor-pointer'>
            <span className='text-xl'><MdAccountCircle/></span>
            Account
        </div>
        <div className=' p-2 flex  items-center gap-1 rounded-md  cursor-pointer'>
        <span className='text-xl'><MdOutlineSecurity/></span>
        Security
        </div>
    </div>
  )
}

export default SettingsSidebar
