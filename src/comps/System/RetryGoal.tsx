import React, { useState } from 'react'
import { supabase } from '../../supabase/supabaseClient'
import { useParams } from 'react-router-dom'
import IsLoggedIn from '../../firebase/IsLoggedIn'
import Loader from '../Loader'

interface closerType {
    closer: React.Dispatch<React.SetStateAction<boolean>>
}

const RetryGoal: React.FC<closerType> = ({ closer }) => {

    const [openDateVal, setOpenDateVal] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const params = useParams()
    const [user] = IsLoggedIn()


    async function retryGoal() {
        setLoading(true);
        if (loading) return;
        if (!user || !params) return;

        // Check if the openDateVal is in the past
        const selectedDate = new Date(openDateVal);
        const currentDate = new Date();

        if (selectedDate < currentDate) {
            alert("The selected date has already passed.");
            setLoading(false); // Reset loading state before returning
            return; // Exit the function if the date has passed
        }

        try {
            // Step 1: Fetch the current goal data to get sub_tasks
            const { data: goalData, error: fetchError } = await supabase
                .from('goals')
                .select('sub_tasks')
                .eq('userid', user?.uid)
                .eq('created_at', params?.time)
                .single();

            if (fetchError) throw fetchError;

            // Step 2: Create updated sub_tasks with is_done set to false
            const updatedSubTasks = goalData.sub_tasks.map((subTask: any) => ({
                ...subTask,
                is_done: false, // Mark all subtasks as not done
            }));

            // Step 3: Update the parent goal and the subtasks
            const { error: updateError } = await supabase
                .from('goals')
                .update({
                    is_done: false,
                    deadline: openDateVal,
                    sub_tasks: updatedSubTasks, // Update with modified subtasks
                })
                .eq('userid', user?.uid)
                .eq('created_at', params?.time);

            if (updateError) {
                console.log(updateError);
            } else {
                console.log("Goal renewed");
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false); // Ensure loading state is reset
        }
    }

    return (
        <div
            onClick={(e) => { e.stopPropagation() }}
            className='w-full max-w-[550px] bg-[#313131]  z-[5000] relative
            rounded-lg p-3 h-full max-h-[600px] border-[#535353] border-[1px] justify-between flex flex-col overflow-auto'>
            <div>

                <div className='text-xl font-bold'>
                    Retry Goal
                </div>
                <p className='mt-1 text-sm text-[#888]'> The "Retry Goal" lets you revisit goals you struggled with. Learn from past attempts, adjust your strategy, and give it another shot. Remember, persistence leads to success! </p>

                <div className='mt-5'>
                    <div className='font-bold'>
                        Due Date
                    </div>
                    <p className='text-sm text-[#888] mb-2'>
                        Add a new due date
                    </p>
                    <input
                        value={openDateVal}
                        onChange={(e) => { setOpenDateVal(e.target.value) }}
                        className='p-2 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] '
                        type="date" />
                </div>
            </div>

            <div className='w-full rounded-lg border-[#535353] border-[1px] flex overflow-hidden'>
                <div
                    onClick={() => { closer(prevs => !prevs) }}
                    className='p-2 bg-[#111111] border-r-[#535353] text-center border-r-[1px]  w-full cursor-pointer'>
                    Cancel
                </div>
                <div
                    onClick={() => { retryGoal() }}
                    className={`${!openDateVal && 'bg-[#535353]' || loading && 'bg-[#535353] flex items-center justify-center'} p-2 bg-[#111111] text-center w-full cursor-pointer`}>
                    {
                        loading ?
                            <div className='w-[20px] h-[20px]'>
                                <Loader />
                            </div>
                            :
                            "Save"
                    }
                </div>
            </div>

        </div>
    )
}

export default RetryGoal
