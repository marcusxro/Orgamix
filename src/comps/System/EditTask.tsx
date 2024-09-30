import React, { useEffect, useState } from 'react'
import Loader from '../Loader';
import { supabase } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useStoreBoolean from '../../Zustand/UseStore';

interface objPassContent {
    title: string;
    deadline: string;
    description: string;
    id: number;
    isdone: boolean;
    priority: string;
    userid: string;
    repeat: string
    category: string
}

interface taskDataType {
    objPass: objPassContent;
    closer: React.Dispatch<React.SetStateAction<objPassContent | null>>;
}


const EditTask: React.FC<taskDataType> = ({ objPass, closer}) => {
    const [user] = IsLoggedIn()
    const [title, setTitle] = useState(objPass?.title || '');
    const [Description, setDescription] = useState<string>(objPass?.description || '')
    const [deadline, setdeadline] = useState<string>(objPass?.deadline || '')
    const [priority, setpriority] = useState<string>(objPass?.priority || '')
    const [category, setcategory] = useState<string>(objPass?.category || '')
    const [repeat, setrepeat] = useState<string>(objPass?.repeat || '')
    const [loading, setLoading] = useState<boolean>(false)

    const { showNotif, setShowNotif } = useStoreBoolean();


    const notif = () => {
        toast.success("Task edited!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
    }
    async function editTask() {
        setLoading(true)
        if (loading) {
            return
        }
        try {
            const { error } = await supabase.from('tasks')
                .update({
                    title: title,
                    description: Description,
                    deadline: deadline,
                    priority: priority,
                    category: category,
                    repeat: repeat,
                })
                .eq('id', objPass?.id)    
                .eq('userid', user?.uid); 
            if (error) {
                console.log('error encountered, please try again later.')
                setLoading(false)

            } else {
                setShowNotif(!showNotif)
                notif()
                setLoading(false)
                closer(null)
            }
        }
        catch (err) {
            setLoading(false)
        }
    }

    return (
        <div
            onClick={(e) => { e.stopPropagation() }}
            className='w-full max-w-[350px] bg-[#313131] 
             rounded-lg p-3 h-full max-h-[500px] border-[#535353] border-[1px] flex flex-col gap-3 overflow-auto'>
            <div className='text-xl font-bold'>Edit Task</div>
            <ToastContainer />

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

            <div className='mt-3 w-full'>
                <div
                    onClick={() => { editTask() }}
                    className={`${loading && 'bg-[#535353] '} bg-[#111111] flex items-center justify-center  p-3 rounded-lg text-center cursor-pointer border-[#535353] border-[1px] hover:bg-[#535353] `}>
                    {
                        loading ?
                            <div className='w-[20px] h-[20px]'>
                                <Loader />
                            </div>
                            :
                            <> Save Changes</>
                    }
                </div>
            </div>
        </div>
    )
}

export default EditTask
