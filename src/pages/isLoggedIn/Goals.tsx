import React, { useEffect, useState } from 'react'
import Sidebar from '../../comps/Sidebar'
import { FaPlus } from "react-icons/fa6";
import CreateGoals from '../../comps/System/CreateGoals';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import { supabase } from '../../supabase/supabaseClient';
import moment from 'moment';

interface subtaskType {
    is_done: boolean;
    startedAt: string;
    subGoal: string
}
interface habitsType {
    repeat: string;
    habit: string;
}
interface dataType {
    userid: string;
    id: number;
    title: string;
    category: string;
    is_done: boolean;
    created_at: number;
    description: string;
    sub_tasks: subtaskType[];
    habit: habitsType[];
    deadline: string;
}


const Goals: React.FC = () => {
    const [GoalListener, setGoalListener] = useState<boolean>(false)
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);

    const [user] = IsLoggedIn()


    useEffect(() => {
        if (user) {
            fetchGoalsByID()
        }
    }, [GoalListener, user])


    async function fetchGoalsByID() {
        try {
            const { data, error } = await supabase
                .from('goals')
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
        <div>
            <Sidebar location='Goals' />


            <div className='ml-[86px] p-3 flex gap-3 h-[100dvh] mr-[0px] lg:mr-[370px]'>
                <div className='w-full h-full'>
                    <div>
                        <div
                            className='text-2xl font-bold'>
                            Goals
                        </div>
                        <div className='text-sm text-[#888]'>
                            Easily create, edit, and organize your notes in this section for a streamlined experience.
                        </div>
                    </div>

                    <div className='mt-4 flex items-start'>
                        <div className='bg-[#313131] p-3 hover:bg-[#535353] border-[#535353] border-[1px] cursor-pointer rounded-lg flex gap-2 items-center'>
                            Create Goal <span className='text-md'><FaPlus /></span>
                        </div>
                    </div>
                    <div className='flex flex-wrap gap-3 mt-2'>
                        {
                            fetchedData && fetchedData?.map((itm: dataType, idx: number) => (
                                <div
                                    key={idx}
                                    className='w-full max-w-[300px] bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg '>
                                    <div className='h-[100px] items-start p-3 justify-start flex flex-col border-b-[#535353] border-b-[1px]  '>
                                        <div className='font-bold'>
                                        {itm?.title}
                                        </div>
                                        <div className='text-[#888] text-sm'>
                                           Category: {itm?.category}
                                        </div>
                                        <div className='text-[#888] text-sm'>
                                          Status: {itm?.is_done ? "Completed" : "In progress"}
                                        </div>
                                    </div>

                                    <div className='flex justify-between items-center p-3 text-[#888]'>
                                        <div>
                                            {itm?.sub_tasks.filter((itmz) => itmz.is_done).length}
                                            /
                                            {itm?.sub_tasks.filter((itmz) => !itmz.is_done).length}
                                        </div>


                                        <div>
                                        {itm?.created_at
                                            ? moment(parseInt(itm?.created_at.toString())).format('MMMM Do YYYY')
                                             : 'No Creation date'}
                                        </div>
                                    </div>


                                </div>
                            ))
                        }
                    </div>
                </div>

                <div className='ml-auto stickyPostion hidden lg:block'>
                    <CreateGoals listener={setGoalListener} />
                </div>
            </div>
        </div>
    )
}

export default Goals
