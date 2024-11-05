import React from 'react'
import { motion } from 'framer-motion'
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import WeeklyActivity from './Analytics/WeeklyActivity';
import InvitedProjects from './Analytics/InvitedProjects';
import NotifShow from './NotifShow';

const SidebarDash: React.FC = () => {
  return (
    <div
      className={`w-[450px] h-full gap-5 bg-[#313131] z-[5000] rounded-lg overflow-auto border-[#535353] border-[1px]  flex flex-col`}>
      <div className='p-3'>
        <div className='font-bold'>
          Weekly Activity
        </div>
        <div className='text-[#888] text-sm'>
          Visualize your overall weekly activity here
        </div>
      </div>

      <div className='w-full h-full max-h-[300px] p-3'>
        <WeeklyActivity />
      </div>
      <div className='h-full p-3 border-y-[1px] border-y-[#535353]'>
        <InvitedProjects />
      </div>
      <div className='h-full overflow-auto p-3'>
        
        <NotifShow />
      </div>
    </div>
  )
}

export default SidebarDash
