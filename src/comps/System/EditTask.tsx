import React, { useState } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import 'react-toastify/dist/ReactToastify.css';
import useStoreBoolean from '../../Zustand/UseStore';
import { FaPlus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { MdModeEdit } from "react-icons/md";
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../Zustand/UseStore';
import Loader from '../Loader';


interface objPassContent {
    title: string;
    deadline: string;
    description: string;
    id: number;
    isdone: boolean;
    priority: string;
    userid: string;
    repeat: string;
    createdAt: string;
    link: string[];
    category: string;
}

interface taskDataType {
    objPass: objPassContent;
}

const EditTask: React.FC<taskDataType> = ({ objPass }) => {
    const [user] = IsLoggedIn();
    const [title, setTitle] = useState(objPass?.title || '');
    const [Description, setDescription] = useState<string>(objPass?.description || '');
    const [deadline, setdeadline] = useState<string>(objPass?.deadline || '');
    const [priority, setpriority] = useState<string>(objPass?.priority || '');
    const [category, setcategory] = useState<string>(objPass?.category || '');
    const [repeat, setrepeat] = useState<string>(objPass?.repeat || '');
    const [loading, setLoading] = useState<boolean>(false);
    const [link, setLink] = useState<string>('');
    const { showNotif, setShowNotif } = useStoreBoolean();
    const [links, setLinks] = useState<string[]>(objPass?.link || []);
    const [editingIndex, setEditingIndex] = useState<number | null>(null); // Track the index of the link being edited
    const { setViewEditTask } = useStore()
    const [isExiting, setIsExiting] = useState(false);

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setViewEditTask(null);
            setIsExiting(false);
        }, 300);
    };

    const isValidURL = (stringVal: string) => {
        const regex = /^(ftp|http|https):\/\/[^ "]+$/; // Regex for validating URL
        return regex.test(stringVal);
    };

    const handleAddLink = () => {
        if (link && isValidURL(link)) {
            setLinks([...links, link]);  // Add new link to the array
            setLink('');  // Clear input after adding
        } else {
            alert("Please enter a valid URL");
        }
    };

    const handleRemoveLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));  // Remove link by index
    };

    const handleEditLink = (index: number | null) => {
        setEditingIndex(index);
        index != null && setLink(links[index]);  // Set the link to edit in the input
    };

    const handleUpdateLink = () => {
        if (editingIndex !== null && link && isValidURL(link)) {
            const updatedLinks = [...links];
            updatedLinks[editingIndex] = link;  // Update the link at the editing index
            setLinks(updatedLinks);
            setLink('');  // Clear the input after updating
            setEditingIndex(null);  // Reset editing index
        }
    };


    async function editTask() {
        setLoading(true);
        if (loading) return;

        try {
            // Fetch existing tasks to check for duplicate titles, excluding the current task
            const { data: existingTasks, error: fetchError } = await supabase
                .from('tasks')
                .select('title')
                .eq('userid', user?.uid)
                .neq('id', objPass?.id);

            if (fetchError) {
                console.log(fetchError);
                setLoading(false);
                return;
            }

            // Check if any tasks have a similar title and calculate the next index
            let newTitle = title;
            let index = 1;

            const similarTitles = existingTasks
                .map(task => task.title)
                .filter(existingTitle => existingTitle.startsWith(title));

            similarTitles.forEach(existingTitle => {
                const match = existingTitle.match(/\((\d+)\)$/); // matches "(number)" at the end
                if (match) {
                    const number = parseInt(match[1], 10);
                    if (!isNaN(number) && number >= index) {
                        index = number + 1;
                    }
                } else if (existingTitle === title) {
                    index = 2;
                }
            });

            if (index > 1 && objPass.title !== title) {
                newTitle = `${title} (${index})`;
            }

            // Update the task with the potentially modified title
            const { error } = await supabase.from('tasks')
                .update({
                    title: newTitle,
                    description: Description,
                    deadline: deadline,
                    priority: priority,
                    category: category,
                    repeat: repeat,
                    link: links // Save the entire array of links
                })
                .eq('id', objPass?.id)
                .eq('userid', user?.uid);

            if (error) {
                console.log('Error encountered, please try again later.');
            } else {
                setShowNotif(!showNotif);
                handleOutsideClick()
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AnimatePresence>
            {
                !isExiting && objPass &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className='ml-auto positioners flex items-center p-3 justify-center relative w-full h-full'
                    onClick={handleOutsideClick}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        onClick={(e) => { e.stopPropagation() }}
                        className='w-full max-w-[350px] bg-[#313131] 
                        rounded-lg p-3 h-full max-h-[600px] border-[#535353] border-[1px] justify-between flex flex-col gap-3 overflow-auto'>

                        <div className='flex flex-col gap-3 overflow-auto mb-auto'>

                            <div className='text-xl font-bold'>Edit Task</div>
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
                                className='resize-none w-full min-h-[150px] rounded-lg p-3 bg-[#111111] outline-none'></textarea>

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


                            <div className='mt-3'>

                            </div>

                            {editingIndex !== null ? (
                                <div className="flex gap-2">
                                    <input
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        className='p-3 rounded-lg bg-[#111111] w-full outline-none'
                                        type="text" placeholder='Edit link here' />
                                    <button onClick={handleUpdateLink} className='rounded-lg bg-[#111] border-[#535353] border-[1px] p-2'>Update</button>
                                </div>
                            ) :

                                <div className='flex gap-2'>
                                    <input
                                        required
                                        value={link}
                                        onChange={(e) => { setLink(e.target.value) }}
                                        className='p-3 rounded-lg bg-[#111111] w-full outline-none'
                                        type="text" placeholder='Add link here' />

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddLink}
                                            className='rounded-lg bg-green-800 p-4 border-[#535353] text-[12px] border-[1px]'><FaPlus /></button>
                                    </div>
                                </div>
                            }

                            <div className="flex flex-col gap-2">
                                {links.map((link, index) => (
                                    <div key={index} className={`${editingIndex === index && "bg-blue-500"} flex justify-between items-center gap-3 bg-[#222] p-2 rounded-md`}>
                                        <span className='text-sm'>{link}</span>
                                        <div className="flex gap-2">
                                            {
                                                editingIndex === index ?
                                                    <button onClick={() => { handleEditLink(null); setLink("") }} className="p-2 bg-[#111] border-[#535353] 
                                        border-[1px] rounded-md text-[#888] hover:text-red-500"><IoMdClose /></button>
                                                    :
                                                    <button onClick={() => handleEditLink(index)} className="p-2 bg-[#111] border-[#535353] 
                                        border-[1px] rounded-md text-[#888] hover:text-blue-500"><MdModeEdit /></button>
                                            }

                                            <button onClick={() => handleRemoveLink(index)} className="p-2 bg-[#111] border-[#535353] border-[1px] 
                                rounded-md text-[#888] hover:text-red-500"><MdDelete /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>


                        </div>

                        <button onClick={() => {!loading && editTask()}} className='rounded-lg flex items-center justify-center bg-blue-800 border-[#535353] border-[1px] p-2'>
                            {
                                loading ?
                                <div className='w-[20px] m-[2px] h-[20px]'>
                                    <Loader />
                                </div>
                                :
                                "Update Task"
                            }
                        </button>
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    );
};

export default EditTask;
