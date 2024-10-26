import React, { useState } from 'react'
import { ImUnlocked } from "react-icons/im";
import { FaLock } from "react-icons/fa";
import { BsShareFill } from "react-icons/bs";
import { supabase } from '../../../supabase/supabaseClient';
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import Loader from '../../Loader';
import useStore from '../../../Zustand/UseStore';

const AddProject:React.FC = () => {

    const [nameVal, setNameVal] = useState("New Project")
    const [description, setDesc] = useState("Sample description")
    const [category, setCat] = useState<string>('');
    const [deadline, setDeadline] = useState<string>("")
    const [privacySel, setPrivacySel] = useState("public")
    const {openNew, setOpenNew}:any = useStore() 
    const {loading, setLoading}:any = useStore()

    const [user] = IsLoggedIn()

    async function createProject() {
        setLoading(true);
        if (loading) {
            setLoading(false);
            return;
        }
        if (!nameVal || !description || !category) {
            setLoading(false);
            return;
        }
    
        try {
            // Check if a project with a similar name exists
            const { data: existingProjects, error: fetchError } = await supabase
                .from('projects')
                .select('name')
                .eq('created_by', user?.uid)
                .like('name', `${nameVal}%`)
       
    
            if (fetchError) {
                console.error('Error fetching data:', fetchError);
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
                created_by: user?.uid,
                category: category
            });
    
            if (error) {
                console.error('Error inserting data:', error);
            } else {
                console.log("Project created");
                setOpenNew(!openNew);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }
    

    return (
        <div
            onClick={(e) => { e.stopPropagation() }}
            className='w-full max-w-[600px] h-full max-h-[630px] bg-[#313131] z-[5000]
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
                            onChange={(e) => {setDeadline(e.target.value)}}
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

            <div className='w-full flex border-[#535353] border-[1px] overflow-hidden rounded-lg mt-2'>
                <div
                onClick={() => {!loading && setOpenNew("")}}
                    className='p-3 bg-[#111111] outline-none  text-center border-r-[#535353] border-r-[1px] cursor-pointer text-[#888] w-full hover:bg-[#222222]'>
                    Cancel
                </div>
                <div
                    onClick={() =>{createProject()}}
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
    )
}

export default AddProject
