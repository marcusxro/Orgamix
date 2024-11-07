import React from 'react'
import { motion } from 'framer-motion'
import WeeklyActivity from './Analytics/WeeklyActivity';
import InvitedProjects from './Analytics/InvitedProjects';
import NotifShow from './NotifShow';
import useStore from '../../../Zustand/UseStore';

const SidebarDash: React.FC = () => {
  const { showActivity, setShowActivity }: any = useStore();

  return (
    <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
    exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}

      className={`w-[450px] h-full gap-2 bg-[#313131] z-[5000] rounded-lg overflow-auto border-[#535353] border-[1px]  flex flex-col`}>
      <div className='h-full flex flex-col gap-2 overflow-auto'>
        <div className='p-3'>
          <div className='font-bold'>
            Weekly Activity
          </div>
          <div className='text-[#888] text-sm'>
            Visualize your overall weekly activity here
          </div>
        </div>

        <div className='w-full h-full min-h-[200px] p-3'>
          <WeeklyActivity />
        </div>
        <div className='h-full p-3 border-y-[1px] border-y-[#535353]'>
          <InvitedProjects />
        </div>
        <div className='h-full overflow-visible p-3'>

          <NotifShow />
        </div>
      </div>

      <div className='h-auto flex lg:hidden items-center justify-end p-3 border-t-[1px] border-t-[#535353]'>
        <div 
        onClick={() => { setShowActivity(!showActivity); }}
        className='bg-[#111] cursor-pointer hover:bg-[#222] px-5 py-2 rounded-lg border-[1px] border-[#535353]'>
          Close
        </div>
      </div>
    </motion.div>
  )
}

export default SidebarDash
