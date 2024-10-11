import React from 'react'
import { FaHome } from "react-icons/fa";
import { MdOutlineTrackChanges } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { GoProjectSymlink } from "react-icons/go";

interface KanBanType {
    location: string
}
const KanBanSidebar: React.FC<KanBanType> = ({ location }) => {
    return (
        <div className='sticky top-0 w-full    flex flex-row md:flex-col justify-between h-auto md:h-screen border-r-[1px] border-r-[#414141] '>

            <div className='h-full overflow-y-auto px-3 md py-2 border-b-[1px] bg-[#242424] md:bg-transparent border-b-[#414141] md:border-none items-center md:items-start pb-3  bg-red flex gap-3 w-full flex-row justify-between md:flex-col  '>
                <div className="md:border-b-[1px]  md:border-b-[#414141] w-full pb-0 md:pb-3 items-center justify-start flex flex-row gap-2 md:flex-col md:items-start">
                    <div className={`${location === 'kanban' && "bg-[#535353]"}  w-auto md:w-full flex items-center gap-2 md:text-md px-3 py-1 text-left rounded-lg cursor-pointer`}>
                        <FaHome /> Kanban
                    </div>
                    <div className={` w-auto md:w-full  flex items-center gap-2 md:text-md px-3 py-1 text-left rounded-lg cursor-pointer`}>
                        <MdOutlineTrackChanges /> Changes
                    </div>
                </div>

                <div className='w-auto flex gap-2 flex-row md:flex-col items-center justify-center md:w-full'>
                    <div
                        className='w-auto md:w-full p-3 cursor-pointer rounded-lg ml-auto flex items-center justify-start gap-3 text-md bg-[#111111] hover:bg-[#222222] outline-none border-[#535353] border-[1px]   text-[#888]'>
                        <IoSettingsOutline /> <span className='hidden md:flex'>Settings</span>
                    </div>

                    <div
                        className='w-auto md:w-full p-3 cursor-pointer rounded-lg ml-auto flex items-center justify-start gap-3 text-md bg-[#111111] hover:bg-[#222222] outline-none border-[#535353] border-[1px]   text-[#888]'>
                        <GoProjectSymlink /> <span className='hidden md:flex'>Projects</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default KanBanSidebar
