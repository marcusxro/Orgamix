import React, { useState } from 'react'
import { supabase } from '../../supabase/supabaseClient'
import Loader from '../Loader'
import IsLoggedIn from '../../firebase/IsLoggedIn'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const AddNewTask = () => {

    const [user] = IsLoggedIn()
    const [title, setTitle] = useState<string>('')
    const [Description, setDescription] = useState<string>('')

    const [deadline, setdeadline] = useState<string>('')
    const [priority, setpriority] = useState<string>('')
    const [category, setcategory] = useState<string>('')
    const [repeat, setrepeat] = useState<string>('')

    const [loading, setLoading] = useState<boolean>(false)



    const notif = (params: string) => {
        toast.success(params, {
            position: "top-left",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
    }


    async function createNewTask() {
        setLoading(true)

        if (!title) {
            setLoading(false)
            return
        }

        if (loading) {
            return
        }

        if (!user) {
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.from('tasks').insert({
                title: title,
                description: Description,
                deadline: deadline,
                priority: priority,
                category: category,
                repeat: repeat,
                userid: user?.uid,
                isdone: false
            })
            if (error) {
                console.log(error)
                setLoading(false)
            } else {
                setTitle('')
                setLoading(false)
                setDescription('')
                setdeadline('')
                setdeadline('')
                setpriority('')
                setcategory('')
                setrepeat('')
            }
        }
        catch (err) {
            console.error(err)
            setLoading(false)
        }
    }
    return (
        <div 
        onClick={(e) => {
            e.stopPropagation()
        }}
        className='w-full max-w-[350px] bg-[#313131] 
             rounded-lg p-3 h-full border-[#535353] border-[1px] flex flex-col gap-3 overflow-auto'>
            <ToastContainer />
            <div className='mb-2'>
                <div className='font-bold'>
                    Add New Task
                </div>
                <p className='text-[#888] text-sm'>Start organizing your tasks by adding new ones here.</p>
            </div>
            <input
                required
                value={title}
                onChange={(e) => { setTitle(e.target.value) }}
                className='p-3 rounded-lg bg-[#111111] outline-none'
                maxLength={50}
                type="text" placeholder='Title' />
            <textarea
                value={Description}
                onChange={(e) => { setDescription(e.target.value) }}
                maxLength={150}
                placeholder='Description'
                className='resize-none w-full h-[150px] rounded-lg p-3 bg-[#111111] outline-none'></textarea>

            <div className='gap-3 flex'>
                <div className='flex flex-col gap-1'>
                    <label htmlFor="input">Deadline</label>
                    <input
                        value={deadline}
                        onChange={(e) => { setdeadline(e.target.value) }}
                        type="date" className='p-2 rounded-lg bg-[#111111]' />
                </div>
                <div className='flex flex-col gap-1'>
                    <div>Priority</div>
                    <select
                        value={priority}
                        onChange={(e) => { setpriority(e.target.value) }}
                        className="p-2 rounded-lg bg-[#111111]">
                        <option value="">Choose Priority</option>
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>

                </div>
            </div>

            <div className='flex gap-3'>
                <div className='flex flex-col gap-1'>
                    <div>Category</div>
                    <select
                        value={category}
                        onChange={(e) => { setcategory(e.target.value) }}
                        className='p-2 rounded-lg bg-[#111111]'>
                        <option value="">Choose Category</option>
                        <option value="Work">Work</option>
                        <option value="Personal">Personal</option>
                        <option value="School">School</option>
                        <option value="Other">Other</option>
                    </select>
                </div>


                <div className="flex flex-col w-full gap-1">
                    <label>Repeat:</label>
                    <select
                        value={repeat}
                        onChange={(e) => { setrepeat(e.target.value) }}
                        className='w-full p-2 rounded-lg bg-[#111111]'>
                        <option value="none">None</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
            </div>


            <div className='mt-auto w-full'>
                <div
                    onClick={() => { createNewTask() }}
                    className={`${loading && 'bg-[#535353] '} bg-[#111111] flex items-center justify-center  p-3 rounded-lg text-center cursor-pointer border-[#535353] border-[1px] hover:bg-[#535353] `}>
                    {
                        loading ?
                            <div className='w-[20px] h-[20px]'>
                                <Loader />
                            </div>
                            :
                            <> Add Task</>
                    }
                </div>
            </div>
        </div>
    )
}

export default AddNewTask
