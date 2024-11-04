import React, { useEffect, useState } from 'react'
import { supabase } from '../../supabase/supabaseClient'
import Sidebar from '../../comps/Sidebar'
import IsLoggedIn from '../../firebase/IsLoggedIn'
import { useLocation } from 'react-router-dom';
import SidebarDash from '../../comps/System/Dashboard/SidebarDash';
import TasksAnalytics from '../../comps/System/Dashboard/Analytics/TasksAnalytics';
import NotesAnalytics from '../../comps/System/Dashboard/Analytics/NotesAnalytics';
import GoalsAnalytics from '../../comps/System/Dashboard/Analytics/GoalsAnalytics';
import ProjectAnalytics from '../../comps/System/Dashboard/Analytics/ProjectAnalytics';
import TaskData from '../../comps/System/Dashboard/Fetch/TaskData';
import NotesData from '../../comps/System/Dashboard/Fetch/NotesData';
import TaskLength from '../../comps/System/Dashboard/Analytics/TaskLength';
import NotesLength from '../../comps/System/Dashboard/Analytics/NotesLength';
import GoalsLength from '../../comps/System/Dashboard/Analytics/GoalsLength';
import ProjectsLength from '../../comps/System/Dashboard/Analytics/ProjectsLength';

interface dataType {
    userid: string;
    username: string;
    password: string;
    email: string;
    id: number;
    fullname: string;
}


const System: React.FC = () => {
    const location = useLocation()
    const [user] = IsLoggedIn()
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);

    useEffect(() => {
        if (user) { getAccounts() }
    }, [user, location])


    async function getAccounts() {
        try {
            const { data, error } = await supabase.from('accounts')
                .select('*')
                .eq('userid', user?.uid);
            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setFetchedData(data);
                console.log(data)
            }
        } catch (err) {
            console.log(err);
        }
    }




    return (
        <div className='h-auto'>
            <Sidebar location="Dashboard" />

            <div className='ml-[86px] h-[100vh] p-3 flex gap-3 overflow-auto mr-[0px] lg:mr-[460px]'>


                <div className='flex flex-col gap-3 w-full h-[100dvh] overflow-auto'>
                    <div className='flex flex-col mb-3'>
                        <div className='text-2xl font-bold'>
                            Welcome back,   {fetchedData && user && (
                                fetchedData[0]?.username.length >= 15
                                    ? fetchedData[0]?.username.slice(0, 10) + '...'
                                    : fetchedData[0]?.username
                            )}!🎉
                        </div>

                        <p className='text-base text-[#888]'>
                            We're glad to have you here. Let's dive in and make today productive!
                        </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 xl:flex gap-3 h-[auto] xl:h-[30vh]'>
                        <div className='bg-[#313131] p-5 w-full h-full rounded-lg border-[1px] min-h-[200px]
                     border-[#535353] hover:bg-[#535353] cursor-pointer justify-between flex flex-col'>
                            <div>
                                <span className='text-xl flex items-center gap-2'>📝 Tasks <TaskLength /></span>
                                <p className='text-sm text-gray-400 mt-2'>Manage your daily to-do list.</p>

                            </div>
                            <div className='max-h-[170px] h-full w-full  z-20 relative'>
                                <TasksAnalytics />
                            </div>
                        </div>
                        <div className='bg-[#313131] p-5 w-full h-full rounded-lg border-[1px] min-h-[200px]
                     border-[#535353] hover:bg-[#535353] cursor-pointer justify-between flex flex-col'>
                            <div>
                                <span className='text-xl flex items-center gap-2'>📒 Notes <NotesLength /></span>
                                <p className='text-sm text-gray-400 mt-2'>Store important notes and ideas.</p>

                            </div>
                            <div className='max-h-[170px] h-full w-full z-10 relative'>
                                <NotesAnalytics />
                            </div>
                        </div>
                        <div className='bg-[#313131] p-5 w-full h-full rounded-lg border-[1px] min-h-[200px]
                     border-[#535353] hover:bg-[#535353] cursor-pointer justify-between flex flex-col'>
                            <div>
                                <span className='text-xl flex items-center gap-2'>🎯 Goals <GoalsLength /></span>
                                <p className='text-sm text-gray-400 mt-2'>Track your progress towards goals.</p>

                            </div>

                            <div className='max-h-[170px] h-full w-full  z-10 relative'>
                                <GoalsAnalytics />
                            </div>
                        </div>
                        <div className='bg-[#313131] p-5 w-full h-full rounded-lg border-[1px] min-h-[200px]
                     border-[#535353] hover:bg-[#535353] cursor-pointer justify-between flex flex-col'>
                            <div>
                                <span className='text-xl flex items-center gap-2'>📂 Projects <ProjectsLength /> </span>
                                <p className='text-sm text-gray-400 mt-2'>Organize your ongoing projects.</p>

                            </div>

                            <div className='max-h-[170px] h-full w-full  z-20 relative'>
                                <ProjectAnalytics />
                            </div>
                        </div>
                    </div>
                    
                    <div className='flex gap-3 h-[57%]  mt-4 flex-col xl:flex-row'>
                        <div className='flex flex-col gap-3 w-full h-full overflow-auto rounded-lg p-3 bg-[#313131] border-[1px] min-h-[200px]
                               border-[#535353]'>
                    
                                <TaskData />
                   
                        </div>

                        <div className='w-full h-full min-h-[500px] bg-[#222]  p-3 rounded-lg flex flex-col  border-[#535353] border-[1px] overflow-auto'>
                  
                           <NotesData />
                        </div>

                    </div>

                </div>

                <div className='ml-auto stickyPostion hidden lg:block'>
                    <SidebarDash />
                </div>

            </div>


        </div>
    )
}

export default System
