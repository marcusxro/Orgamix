import React from 'react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import moment from 'moment';
import { MdOutlineClass } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { motion } from 'framer-motion'
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import Confetti from 'react-confetti'
import WeeklyActivity from './Analytics/WeeklyActivity';

const SidebarDash: React.FC = () => {
  const [user] = IsLoggedIn()

  return (
    <div
      className={`w-[450px] h-full gap-5 bg-[#313131] z-[5000] rounded-lg p-3 overflow-auto border-[#535353] border-[1px]  flex flex-col`}>
        <div>
             
     <div className='font-bold'>
      Weekly Activity
     </div>
      <div className='text-[#888] text-sm'>
        Visualize your overall weekly activity here
        </div>
        </div>
     
      <div className='w-full h-full max-h-[300px]'>
        <WeeklyActivity />
      </div>
    </div>
  )
}

export default SidebarDash
