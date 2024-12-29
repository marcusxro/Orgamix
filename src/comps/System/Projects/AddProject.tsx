import React, { useState } from 'react'
import { ImUnlocked } from "react-icons/im";
import { FaLock } from "react-icons/fa";
import { BsShareFill } from "react-icons/bs";
import { supabase } from '../../Utils/supabase/supabaseClient';
import IsLoggedIn from '../../Utils/IsLoggedIn';
import Loader from '../../Svg/Loader';
import useStore from '../../Utils/Zustand/UseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { BiSolidError } from "react-icons/bi";
import { FaCheck } from "react-icons/fa";

const AddProject: React.FC = () => {
    const [isExiting, setIsExiting] = useState(false);

    const [nameVal, setNameVal] = useState("New Project")
    const [description, setDesc] = useState("Sample description")
    const [category, setCat] = useState<string>('');
    const [deadline, setDeadline] = useState<string>("")
    const [privacySel, setPrivacySel] = useState("public")
    const { openNew, setOpenNew }: any = useStore()
    const { loading, setLoading }: any = useStore()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [user]:any = IsLoggedIn()

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setOpenNew("");
            setIsExiting(false);
        }, 300);
    };
    async function createProject() {
        setLoading(true);
        if (loading) {
            setLoading(false);

            return;
        }
        if (!nameVal || !description || !category) {
            setLoading(false);
            setError("Please fill in all required fields");
            return;
        }

        try {
            // Check if a project with a similar name exists
            const { data: existingProjects, error: fetchError } = await supabase
                .from('projects')
                .select('name')
                .eq('created_by', user?.id)
                .like('name', `${nameVal}%`)


            if (fetchError) {
                console.error('Error fetching data:', fetchError);
                setError('An unexpected error occurred');
                setLoading(false);
                return;
            }

            // If there are similar project names, find the highest index and increment it
            let finalName = nameVal;
            if (existingProjects.length > 0) {
                const namePattern = new RegExp(`^${nameVal} \\((\\d+)\\)$`);
                let maxIndex = 1;

                existingProjects.forEach(project => {
                    const match = project.name.match(namePattern);
                    if (match) {
                        maxIndex = Math.max(maxIndex, parseInt(match[1], 10) + 1);
                    } else if (project.name === nameVal) {
                        maxIndex = 2;
                    }
                });

                finalName = `${nameVal} (${maxIndex})`;
            }

            // Insert the new project with the determined name

            const { error } = await supabase.from('projects').insert({
                name: finalName,
                description: description,
                created_at: Date.now(),
                deadline: deadline,
                is_shared: privacySel,
                created_by: user?.id,
                category: category,

            });

            if (error) {
                console.error('Error inserting data:', error);
                setError('An unexpected error occurred');
            } else {
                console.log("Project created");
                setIsExiting(true);
                setSuccess("Project created successfully");
                setTimeout(() => {
                    setOpenNew(!openNew);
                    setIsExiting(false);
                    setError(null);
                    setSuccess(null);
                }, 300);


            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred');
        } finally {
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
                    className='ml-auto positioners flex items-center p-3 justify-center relative w-full h-full'
                    onClick={handleOutsideClick}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}

                        onClick={(e) => { e.stopPropagation() }}
                        className='w-full max-w-[600px] h-auto bg-[#313131] z-[5000]
                        rounded-lg p-5 border-[#535353] border-[1px] flex flex-col justify-between overflow-auto'>


                        <div className='h-auto'>
                            <div>
                                <div className='text-xl font-bold'>Create Project</div>
                                <p className="text-sm text-[#888]">
                                    Start a new project, set goals, and organize tasks efficiently. Collaborate and track progress with ease.
                                </p>
                            </div>


                            <div className='mt-7'>
                                <div className='flex gap-1 flex-col'>
                                    <div>Project name</div>
                                    <input
                                        maxLength={50}
                                        value={nameVal}
                                        onChange={(e) => { setNameVal(e.target.value) }}
                                        className='p-2 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px]  text-[#888]'
                                        type="text" />
                                </div>
                            </div>


                            <div className='mt-3 h-full max-h-[150px] overflow-hidden'>
                                <div className='flex gap-1 flex-col h-full'>
                                    <div>Description</div>
                                    <textarea
                                        maxLength={300}
                                        value={description}
                                        onChange={(e) => { setDesc(e.target.value) }}
                                        className='p-2 h-full rounded-lg resize-none bg-[#111111] outline-none border-[#535353] border-[1px] w-full  text-[#888]'

                                    />
                                </div>
                            </div>


                            <div className='mt-3 flex gap-3 overflow-auto'>
                                <div className='flex gap-1 flex-col w-full'>
                                    <div>
                                        Category
                                    </div>
                                    <select
                                        value={category}
                                        onChange={(e) => { setCat(e.target.value) }}
                                        className='p-3 rounded-lg bg-[#111111] outline-none  border-[#535353] border-[1px]  text-[#888]'
                                        name="" id="">
                                        <option value="">Category:</option>
                                        <option value="work">Work</option>
                                        <option value="personal">Personal</option>
                                        <option value="team_collaboration">Team Collaboration</option>
                                        <option value="learning">Learning</option>
                                        <option value="research">Research</option>
                                        <option value="creative">Creative</option>
                                        <option value="freelance">Freelance</option>
                                        <option value="home_improvement">Home Improvement</option>
                                        <option value="health_fitness">Health & Fitness</option>
                                        <option value="financial">Financial</option>
                                        <option value="event_planning">Event Planning</option>
                                        <option value="non_profit">Non-Profit</option>
                                        <option value="side_hustle">Side Hustle</option>
                                    </select>
                                </div>
                                <div className='flex gap-1 flex-col w-full'>
                                    <div>
                                        Deadline (optional)
                                    </div>
                                    <input
                                        className='p-3 rounded-lg bg-[#111111] outline-none  border-[#535353] border-[1px]  text-[#888]'
                                        value={deadline}
                                        onChange={(e) => { setDeadline(e.target.value) }}
                                        type="Date" />
                                </div>
                            </div>

                            <div className='flex gap-2 flex-col w-full  mt-3'>
                                <div>Privacy</div>
                                <div className='flex gap-3 justify-between overflow-auto'>
                                    <div
                                        onClick={() => { setPrivacySel("public") }}
                                        className={`${privacySel === "public" && "bg-green-500"} px-3 w-full justify-center py-2 flex gap-2 items-center cursor-pointer border-[#535353] border-[1px] rounded-lg `}><ImUnlocked />Public</div>
                                    <div
                                        onClick={() => { setPrivacySel("private") }}
                                        className={`${privacySel === "private" && "bg-green-500"} px-3 w-full justify-center py-2 flex gap-2 items-center cursor-pointer border-[#535353] border-[1px] rounded-lg `}><FaLock />Private</div>
                                    <div
                                        onClick={() => { setPrivacySel("shareable") }}
                                        className={`${privacySel === "shareable" && "bg-green-500"} px-3 w-full justify-center py-2 flex gap-2 items-center cursor-pointer border-[#535353] border-[1px] rounded-lg `}><BsShareFill /> Shareable</div>
                                </div>
                            </div>
                        </div>

                        <div className='mt-5'>
                            {
                                error != null && success == null &&
                                <div className='flex gap-2 items-center mt-2 bg-red-500 text-white p-2 rounded-lg'>
                                    <BiSolidError />
                                    {error}
                                </div>
                            }
                            {
                                success != null &&
                                <div className='flex gap-2 items-center bg-green-500 text-white p-2 rounded-lg'>
                                    <FaCheck />
                                    {success}
                                </div>
                            }
                            <div className='w-full flex mt-2 border-[#535353] border-[1px] overflow-hidden rounded-lg'>

                                <div
                                    onClick={() => { !loading && handleOutsideClick() }}
                                    className='p-3 bg-[#111111] outline-none  text-center border-r-[#535353] border-r-[1px] cursor-pointer text-[#888] w-full hover:bg-[#222222]'>
                                    Cancel
                                </div>
                                <div
                                    onClick={() => { createProject() }}
                                    className={`${loading ? "bg-[#535353]" : "bg-[#111111]"} p-3 flex items-center justify-center  outline-none  text-center  cursor-pointer text-[#888] w-full hover:bg-[#222222]`}>
                                    {
                                        loading ?
                                            <div className='w-[20px] h-[20px]'>
                                                <Loader />
                                            </div>
                                            :

                                            "Create"
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

export default AddProject
