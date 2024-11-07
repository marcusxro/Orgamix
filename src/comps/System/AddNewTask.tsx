import React, { useState } from 'react'
import { supabase } from '../../supabase/supabaseClient'
import Loader from '../Loader'
import IsLoggedIn from '../../firebase/IsLoggedIn'
import 'react-toastify/dist/ReactToastify.css';
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { AnimatePresence, motion } from 'framer-motion';
import useStore from '../../Zustand/UseStore';

interface propsPurpose {
    purpose: string;
    closer: React.Dispatch<React.SetStateAction<Boolean>>
}


const AddNewTask: React.FC<propsPurpose> = ({ purpose }) => {

    const [user] = IsLoggedIn()
    const [title, setTitle] = useState<string>('')
    const [Description, setDescription] = useState<string>('')

    const [deadline, setdeadline] = useState<string>('')
    const [priority, setpriority] = useState<string>('')
    const [category, setcategory] = useState<string>('')
    const [repeat, setrepeat] = useState<string>('')
    const [link, setLink] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null); // Track the index of the link being edited
    const [isExiting, setIsExiting] = useState(false);
    const { setIsShowAdd }: any = useStore();

    const [links, setLinks] = useState<string[]>([]);

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsShowAdd(false);
            setIsExiting(false);
        }, 100);
    };

    const handleAddLink = () => {
        if (link && isValidURL(link)) {
            setLinks([...links, link]);  // Add new link to the array
            setLink('');  // Clear input after adding
            console.log("Link added:", link); // Log the added link
        } else {
            console.error("Invalid link:", link); // Log the error
            alert("Please enter valid URL")
        }
    };

    const handleRemoveLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));  // Remove link by index
    };

    const handleEditLink = (index: number | null) => {
        setEditingIndex(index);
        index != null && setLink(links[index]);  // Set the link to edit in the input
    };
    const isValidURL = (stringVal: string) => {
        const regex = /^(ftp|http|https):\/\/[^ "]+$/; // Regex for validating URL
        return regex.test(stringVal);
    };

    const handleUpdateLink = () => {
        if (editingIndex !== null && link) {
            const updatedLinks = [...links];
            updatedLinks[editingIndex] = link;  // Update the link at the editing index
            setLinks(updatedLinks);
            setLink('');  // Clear the input after updating
            setEditingIndex(null);  // Reset editing index
        }
    };

    async function createNewTask() {
        setLoading(true);

        if (!title || loading || !user) {
            setLoading(false);
            return;
        }

        try {
            // Fetch existing tasks to check for duplicate titles
            const { data: existingTasks, error: fetchError } = await supabase
                .from('tasks')
                .select('title')
                .eq('userid', user?.uid);

            if (fetchError) {
                console.log(fetchError);
                setLoading(false);
                return;
            }

            // Check if any tasks have a similar title and calculate the next index
            let newTitle = title;


            if (existingTasks.length > 0) {
                const exactMatches = existingTasks.filter(itm =>
                    itm?.title === title || itm?.title.startsWith(`${title} (`));

                if (exactMatches.length > 0) {
                    const maxIndex = exactMatches.reduce((acc, itm) => {
                        const match = itm.title.match(/\((\d+)\)$/); // Check for pattern "renameGoal (index)"
                        const index = match ? parseInt(match[1], 10) : 0;
                        return Math.max(acc, index);
                    }, 0);

                    newTitle = `${title} (${maxIndex + 1})`;
                }


            }

            


            // Insert the new task with the modified title
            const { error } = await supabase.from('tasks').insert({
                title: newTitle,
                description: Description,
                deadline: deadline,
                priority: priority,
                category: category,
                repeat: repeat,
                userid: user?.uid,
                isdone: false,
                createdAt: Date.now(),
                link: links
            });

            if (error) {
                console.log(error);
                setLoading(false);
            } else {
                // Clear fields on successful creation
                setTitle('');
                setDescription('');
                setdeadline('');
                setpriority('');
                setcategory('');
                setrepeat('');
                setLink('');
                setLoading(false);
            
                setLinks([])

                if(purpose === "Modal") {
                    handleOutsideClick()
                }
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }

    return (
        <AnimatePresence>
            {
                !isExiting &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className={`
                    ${purpose != 'Modal' && 'w-full h-full relative'}
                    ${purpose === 'Modal' && 'ml-auto positioners flex items-center p-3 justify-end relative w-full h-full lg:hidden'}`}
                    onClick={() => { handleOutsideClick() }}>

                    <motion.div
                        initial={{ x: 50, scale: 0.95, opacity: 0 }} // Starts off-screen to the left
                        animate={{ x: 0, scale: 1, opacity: 1, transition: { duration: 0.2 } }} // Moves to default position
                        exit={{ x: 50, scale: 0.95, opacity: 0, transition: { duration: 0.2 } }} //
                        onClick={(e) => { e.stopPropagation() }}
                        className='w-full max-w-[350px] bg-[#313131] 
                        rounded-lg p-3 h-full border-[#535353] border-[1px] flex flex-col  justify-between gap-3 overflow-auto'>

                        <div className='flex flex-col gap-3 overflow-auto  mb-auto'>
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
                                className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px]'
                                maxLength={50}
                                type="text" placeholder='Title' />
                            <textarea
                                value={Description}
                                onChange={(e) => { setDescription(e.target.value) }}
                                maxLength={150}
                                placeholder='Description'
                                className='resize-none w-full min-h-[150px] rounded-lg p-3 bg-[#111111] outline-none border-[#535353] border-[1px]'></textarea>

                            <div className='gap-3 flex'>
                                <div className='flex flex-col gap-1'>
                                    <label htmlFor="input">Deadline</label>
                                    <input
                                        value={deadline}
                                        onChange={(e) => { setdeadline(e.target.value) }}
                                        type="date" className='p-2 rounded-lg bg-[#111111] border-[#535353] border-[1px] text-[#888]' />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <div>Priority</div>
                                    <select
                                        value={priority}
                                        onChange={(e) => { setpriority(e.target.value) }}
                                        className="p-2 rounded-lg bg-[#111111] border-[#535353] border-[1px] text-[#888]">
                                        <option value="">Choose Priority</option>
                                        <option value="Low">Low Priority</option>
                                        <option value="Medium">Medium Priority</option>
                                        <option value="High">High Priority</option>
                                    </select>

                                </div>
                            </div>

                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1'>
                                    <div>Category</div>
                                    <select
                                        value={category}
                                        onChange={(e) => { setcategory(e.target.value) }}
                                        className='p-2 rounded-lg bg-[#111111] border-[#535353] border-[1px] text-[#888]'>
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
                                        className='w-full p-2 rounded-lg bg-[#111111] border-[#535353] border-[1px] text-[#888]'>
                                        <option value="none">None</option>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>


                            </div>

                            <input
                                required
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px]'
                                type="text"
                                placeholder='Link'
                            />
                            {editingIndex !== null ? (
                                <button
                                    type="button"
                                    onClick={handleUpdateLink}
                                    className=" p-2 rounded-lg bg-[#111] border-[#535353] border-[1px] text-blue-500  w-full"
                                >
                                    Update Link
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleAddLink}
                                    className=" p-2 rounded-lg bg-[#111] text-green-500 border-[#535353] border-[1px] w-full"
                                >
                                    Add Link
                                </button>
                            )}

                            {/* Display the added links */}
                            <ul className="mt-3">
                                {links.map((link, index) => (
                                    <li key={index} className={`${index === editingIndex && "bg-blue-500"} items-start gap-3 flex justify-between mb-2 bg-[#222] p-2 rounded-lg`}>
                                        <span className='w-full max-w-[200px] break-words text-[#888]'>{link}</span>

                                        <div className='flex items-start h-full'>
                                            {
                                                index === editingIndex ?
                                                    <button
                                                        onClick={() => { handleEditLink(null); setLink("") }}
                                                        className="ml-2 p-2 bg-[#111] border-[#535353] border-[1px] rounded-md text-[#888] hover:text-red-500"
                                                    >
                                                        <IoMdClose />
                                                    </button>
                                                    :
                                                    <button
                                                        onClick={() => handleEditLink(index)}
                                                        className="ml-2 p-2 bg-[#111] border-[#535353] border-[1px] rounded-md text-[#888] hover:text-blue-500"
                                                    >
                                                        <MdModeEdit />
                                                    </button>
                                            }
                                            <button
                                                onClick={() => handleRemoveLink(index)}
                                                className="ml-2 p-2 bg-[#111] border-[#535353] border-[1px] rounded-md text-[#888] hover:text-red-500"
                                            >
                                                <MdDelete />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                        </div>
                        <div className=''>
                            <div className='mt-auto w-full flex gap-2 items-center'>
                                {
                                    purpose === 'Modal'
                                    &&
                                    <div className='w-full'>
                                        <div
                                            onClick={() => { handleOutsideClick() }}
                                            className={`${loading && 'bg-[#535353] '}  bg-[#111111]  text-red-500 flex items-center justify-center  p-3 rounded-lg text-center cursor-pointer border-[#535353] border-[1px] hover:bg-[#535353] `}>
                                            Close
                                        </div>
                                    </div>
                                }
                                <div
                                    onClick={() => { createNewTask() }}
                                    className={`${loading && 'bg-[#535353] '} w-full bg-[#111111] flex items-center justify-center  p-3 rounded-lg text-center cursor-pointer border-[#535353] border-[1px] hover:bg-[#535353] `}>
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
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default AddNewTask
