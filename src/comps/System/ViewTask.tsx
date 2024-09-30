import React from 'react'
import { CiCalendarDate } from "react-icons/ci";
import moment from 'moment'
interface taskDataType {
    title: string;
    deadline: string;
    description: string;
    id: number;
    isdone: boolean;
    priority: string;
    userid: string;
    repeat: string
    createdAt: string;
    link: string;
    category: string;
}

interface propsType {
    objPass: taskDataType;
    closer: React.Dispatch<React.SetStateAction<taskDataType | null>>;
}


const ViewTask: React.FC<propsType> = ({ objPass, closer }) => {

    return (
        <div
            onClick={(e) => { e.stopPropagation() }}
            className='w-full max-w-[350px] bg-[#313131] h-full max-h-[500px]
              rounded-lg p-5  border-[#535353] border-[1px] flex flex-col gap-3 overflow-auto'>
            <div className='font-bold'>
                {objPass?.title}
            </div>

            <div className='text-sm text-[#888] break-all'>
                {objPass?.description ? objPass?.description : 'No Description'}
            </div>

            <div
            onClick={() => {
                objPass?.link && window.open(objPass?.link, '_blank')
            }}
             className='text-sm text-blue-500 break-all underline cursor-pointer'>
                {objPass?.link ? objPass?.link : 'No Link'}
            </div>



            <div className='flex gap-2'>
                <span className='font-bold'>  Created At: </span>
                <div className='text-[#888] flex items-center gap-1'>
                  <CiCalendarDate/>   
                  {objPass?.createdAt 
                ? moment(parseInt(objPass.createdAt)).format('MMMM Do YYYY') 
                : 'No Deadline'}
                </div>
            </div>


            <div className='flex gap-2'>
                <span className='font-bold'>  Deadline: </span>
                <div className='text-[#888] flex items-center gap-1'>
                  <CiCalendarDate/>  {objPass?.deadline ? objPass?.deadline : 'No Deadline'}
                </div>
            </div>


            <div className='flex gap-2'>
                <span className='font-bold'>  Priority: </span>
                <div className='text-[#888] flex items-center gap-1'>

                    <div className='w-[10px] h-[10px] bg-yellow-500'>
                    </div>
                    {objPass?.priority ? objPass?.priority : 'No Priority'}
                </div>
            </div>


            <div className='flex gap-2'>
                <span className='font-bold'>  Category: </span>
                <div className='text-[#888] flex items-center gap-1'>

                    <div className='w-[10px] h-[10px] bg-red-500'>
                    </div>
                    {objPass?.category ? objPass?.category : 'No Ctegory'}
                </div>
            </div>


            <div className='flex gap-2'>
                <span className='font-bold'>  Repeat: </span>
                <div className='text-[#888] flex items-center gap-1'>

                    <div className='w-[10px] h-[10px] bg-orange-500'>
                    </div>
                    {objPass?.repeat ? objPass?.repeat : 'No Repeat'}
                </div>
            </div>

            <div className='flex gap-2'>
                <span className='font-bold'>  Status: </span>
                <div className='text-[#888] flex items-center gap-1'>

                    <div className='w-[10px] h-[10px] bg-green-500'>
                    </div>
                    {objPass?.isdone ? 'Completed' : 'In progress'}
                </div>
            </div>

            <div 
            onClick={() => {closer(null)}}
            className='mt-auto w-full p-2 bg-[#684444] text-center rounded-lg hover:bg-[#535353] cursor-pointer'>
                Close
            </div>
        </div>
    )
}

export default ViewTask
