import React, { useEffect, useState } from 'react'
import { supabase } from '../../supabase/supabaseClient'
import Sidebar from '../../comps/Sidebar'
import IsLoggedIn from '../../firebase/IsLoggedIn'

interface dataType {
    userid: string;
    username: string;
    password: string;
    email: string;
    id: number;
    fullname: string;
}


const System: React.FC = () => {

    const [user] = IsLoggedIn()
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);


    useEffect(() => {
        getAccounts()
    }, [user])


    async function getAccounts() {
        try {
            const { data, error } = await supabase.from('accounts')
                .select('*')
                .eq('userid', user?.uid);
            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setFetchedData(data);
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className='h-auto'>
            <Sidebar location="Dashboard" />

            <div className='ml-[86px] h-[200dvh] p-3 flex flex-col gap-3'>
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

                <div className='flex gap-3 h-[30vh]'>
                    <div className='bg-[#313131] p-5 w-full h-full rounded-lg border-[1px]
                     border-[#535353] hover:bg-[#535353] cursor-pointer'>
                        <span className='text-xl'>📝 Tasks</span>
                        <p className='text-sm text-gray-400 mt-2'>Manage your daily to-do list.</p>
                    </div>
                    <div className='bg-[#313131] p-5 w-full h-full rounded-lg border-[1px]
                     border-[#535353] hover:bg-[#535353] cursor-pointer'>
                        <span className='text-xl'>📒 Notes</span>
                        <p className='text-sm text-gray-400 mt-2'>Store important notes and ideas.</p>
                    </div>
                    <div className='bg-[#313131] p-5 w-full h-full rounded-lg border-[1px]
                     border-[#535353] hover:bg-[#535353] cursor-pointer'>
                        <span className='text-xl'>🎯 Goals</span>
                        <p className='text-sm text-gray-400 mt-2'>Track your progress towards goals.</p>
                    </div>
                    <div className='bg-[#313131] p-5 w-full h-full rounded-lg border-[1px]
                     border-[#535353] hover:bg-[#535353] cursor-pointer'>
                        <span className='text-xl'>📂 Projects</span>
                        <p className='text-sm text-gray-400 mt-2'>Organize your ongoing projects.</p>
                    </div>
                    <div className='bg-[#313131] p-5 w-full h-full rounded-lg border-[1px]
                     border-[#535353] hover:bg-[#535353] cursor-pointer'>
                        <span className='text-xl'>📅 Events</span>
                        <p className='text-sm text-gray-400 mt-2'>Plan and manage events.</p>
                    </div>
                </div>

                <div className='flex gap-3 h-[50vh] mt-4'>
                    <div className='flex flex-col gap-3 w-full h-[50vh] overflow-auto'>
                        <div>Tasks for today</div>
                        <div className='flex flex-col gap-3'>

                            <div className='bg-[#313131] flex overflow-hidden w-full h-full rounded-lg border-[1px]
                             border-[#535353] hover:bg-[#535353] cursor-pointer'>
                                <div className='w-[10px] bg-green-400 h-full p-1'>
                                </div>
                                <div className='ml-3 p-3'>
                                    <div className='text-lg'>
                                        Laundry
                                    </div>
                                    <p className='text-sm text-gray-400 mt-2'>Plan and manage events.</p>

                                </div>
                            </div>

                            <div className='bg-[#313131] flex overflow-hidden w-full h-full rounded-lg border-[1px]
                             border-[#535353] hover:bg-[#535353] cursor-pointer'>
                                <div className='w-[10px] bg-green-400 h-full p-1'>
                                </div>
                                <div className='ml-3 p-3'>
                                    <div className='text-lg'>
                                        Laundry
                                    </div>
                                    <p className='text-sm text-gray-400 mt-2'>Plan and manage events.</p>
                                </div>
                            </div>
                            <div className='bg-[#313131] flex overflow-hidden w-full h-full rounded-lg border-[1px]
                             border-[#535353] hover:bg-[#535353] cursor-pointer'>
                                <div className='w-[10px] bg-green-400 h-full p-1'>
                                </div>
                                <div className='ml-3 p-3'>
                                    <div className='text-lg'>
                                        Laundry
                                    </div>
                                    <p className='text-sm text-gray-400 mt-2'>Plan and manage events.</p>
                                </div>
                            </div>
                            <div className='bg-[#313131] flex overflow-hidden w-full h-full rounded-lg border-[1px]
                             border-[#535353] hover:bg-[#535353] cursor-pointer'>
                                <div className='w-[10px] bg-green-400 h-full p-1'>
                                </div>
                                <div className='ml-3 p-3'>
                                    <div className='text-lg'>
                                        Laundry
                                    </div>
                                    <p className='text-sm text-gray-400 mt-2'>Plan and manage events.</p>
                                </div>
                            </div>
                            <div className='bg-[#313131] flex overflow-hidden w-full h-full rounded-lg border-[1px]
                             border-[#535353] hover:bg-[#535353] cursor-pointer'>
                                <div className='w-[10px] bg-green-400 h-full p-1'>
                                </div>
                                <div className='ml-3 p-3'>
                                    <div className='text-lg'>
                                        Laundry
                                    </div>
                                    <p className='text-sm text-gray-400 mt-2'>Plan and manage events.</p>
                                </div>
                            </div>
                            <div className='bg-[#313131] flex overflow-hidden w-full h-full rounded-lg border-[1px]
                             border-[#535353] hover:bg-[#535353] cursor-pointer'>
                                <div className='w-[10px] bg-green-400 h-full p-1'>
                                </div>
                                <div className='ml-3 p-3'>
                                    Laundry
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='w-full flex flex-col gap-3  overflow-auto'>
                        <div>
                            Important Notes
                        </div>
                        <div className='w-full  h-[49vh] flex gap-3'>
                            <div className='bg-green-500 w-full h-full rounded-lg p-5'>
                                Do sum research
                            </div>
                            <div className='bg-red-500 w-full h-full rounded-lg p-5'>
                                Learn new skills!
                            </div>
                        </div>
                    </div>
                </div>


            </div>


        </div>
    )
}

export default System
