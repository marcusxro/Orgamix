import React,{useState } from 'react'
import { CiCalendarDate } from "react-icons/ci";
import moment from 'moment'
import useStore from '../../Zustand/UseStore';
import { AnimatePresence, motion } from 'framer-motion';


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
    link: string[];
    category: string;
}

interface propsType {
    objPass: taskDataType;
}


const ViewTask: React.FC<propsType> = ({ objPass }) => {
    const { setViewTask } = useStore();
    const [isExiting, setIsExiting] = useState(false);

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setViewTask(null);
            setIsExiting(false);
        }, 300);
    };

    return (
        <AnimatePresence>
            {
                !isExiting && objPass &&
                <motion.div initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className='ml-auto positioners flex items-center p-3 justify-center relative w-full h-full'
                    onClick={handleOutsideClick}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        onClick={(e) => { e.stopPropagation() }}
                        className='w-full max-w-[350px] bg-[#313131] h-full max-h-[500px]
                        rounded-lg p-5  border-[#535353] border-[1px] flex flex-col gap-3 overflow-auto'>
                            <div className='flex flex-col gap-2 overflow-auto'>

                            <div className='font-bold'>
                                {objPass?.title}
                            </div>
                            <div className='text-sm text-[#888] break-all'>
                                {objPass?.description ? objPass?.description : 'No Description'}
                            </div>
                            <div className='flex gap-2'>
                                <span className='font-bold'>  Created At: </span>
                                <div className='text-[#888] flex items-center gap-1'>
                                    <CiCalendarDate />
                                    {objPass?.createdAt
                                        ? moment(parseInt(objPass.createdAt)).format('MMMM Do YYYY')
                                        : 'No Deadline'}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <span className='font-bold'>  Deadline: </span>
                                <div className='text-[#888] flex items-center gap-1'>
                                    <CiCalendarDate />  {objPass?.deadline ? objPass?.deadline : 'No Deadline'}
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
                                    {objPass?.category ? objPass?.category : 'No Category'}
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
                            <div className='mt-6 flex flex-col gap-2'>
                                {
                                    objPass?.link != null &&
                                    objPass?.link.map((item: string, idx: number) => (

                                        <div
                                            key={idx}
                                            onClick={() => {
                                                item && window.open(item, '_blank')
                                            }}
                                            className='text-sm bg-[#222] p-2 rounded-md border-[#535353] border-[1px] text-blue-500 break-all underline cursor-pointer'>
                                            {item}
                                        </div>


                                    ))
                                }
                            </div>
                        </div>
                        <div
                            onClick={() => { handleOutsideClick() }}
                            className='mt-auto w-full p-2 bg-[#684444] border-[#535353] border-[1px] text-center rounded-lg hover:bg-[#535353] cursor-pointer'>
                            Close
                        </div>
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default ViewTask
