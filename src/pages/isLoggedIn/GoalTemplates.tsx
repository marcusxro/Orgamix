import React from 'react'
import { useNavigate } from 'react-router-dom'
import { IoChevronBackOutline } from "react-icons/io5";
import NoUserProfile from '../../assets/UserNoProfile.jpg'
import { LuLayoutDashboard } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import Marquee from 'react-fast-marquee'
import { MdPublish } from "react-icons/md";

const GoalTemplates: React.FC = () => {
    const nav = useNavigate()


    return (
        <div className='w-full h-full'>
            <header className='p-3 flex items-center h-auto pb-2 justify-between border-b-[#535353] border-b-[1px] overflow-auto'>
                <div className='flex items-center h-auto pb-2 justify-between w-full max-w-[1200px] mx-auto'>
                    <div className='flex gap-3 items-center'>
                        <div className='w-[35px] h-[35px] rounded-full overflow-hidden'>
                            <img
                                className='w-full h-full'
                                src={NoUserProfile} alt="" />
                        </div>
                        <div 
                        onClick={() => {nav(-1)}}
                        className='flex gap-1 hover:bg-[#535353] items-center bg-[#313131] 
                        border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3'><IoChevronBackOutline /> Back</div>
                    </div>
                    <div className='flex gap-3 items-center'>
                        <div
                            className='flex gap-1 items-center bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#535353]'>
                            Dashboard <LuLayoutDashboard />
                        </div>
                        <div
                            className='flex gap-1 items-center bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-3 md:p-2 px-3 hover:bg-[#535353]'>
                            <span className='hidden md:block'>Settings</span> <IoSettingsOutline />
                        </div>
                    </div>
                </div>
            </header>


            <div className='mt-3 mx-auto max-w-[1200px] p-3'>
                <div className='flex flex-col gap-2'>
                    <div className='text-xl font-bold'>
                        Choose templates
                    </div>
                    <p className='text-sm text-[#888] w-full max-w-[500px]'>
                        Select from a variety of pre-defined goal templates to help you stay organized and motivated. Easily import a template that aligns with your objectives, whether for personal development, fitness, or work projects.
                    </p>
                </div>
                <div className='w-full h-auto my-4'>
                    <Marquee
                        pauseOnHover
                        autoFill>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Work</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Personal</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Fitness</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Education</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Health</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Finance</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Travel</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Hobbies</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Relationships</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Spiritual</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Career</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Self-Development</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Home</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Community</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Creativity</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Environment</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Volunteering</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Family</div>

                    </Marquee>
                </div>

                <div className='flex items-start mt-4 gap-2 justify-between flex-col md:flex-row'>
                    <div className='flex gap-3 items-center'>
                        <div
                            className='flex gap-1 items-center bg-[#476d4a] border-[#535353] border-[1px] cursor-pointer rounded-lg p-3 md:p-2 px-3 hover:bg-[#535353]'>
                            <span className='hidden md:block'>Create a Template</span> <MdPublish />
                        </div>
                        <select
                            // value={category}
                            // onChange={(e) => { setCategory(e.target.value) }}
                            className='p-3 rounded-lg bg-[#111111] outline-none  border-[#535353] border-[1px]  text-[#888]'
                            name="" id="">
                            <option value="">Find template by:</option>
                            <option value="Work">Work</option>
                            <option value="Personal">Personal</option>
                            <option value="Fitness">Fitness</option>
                            <option value="Education">Education</option>
                            <option value="Health">Health</option>
                            <option value="Finance">Finance</option>
                            <option value="Travel">Travel</option>
                            <option value="Hobbies">Hobbies</option>
                            <option value="Relationships">Relationships</option>
                            <option value="Spiritual">Spiritual</option>
                            <option value="Career">Career</option>
                            <option value="Self-Development">Self-Development</option>
                            <option value="Home">Home</option>
                            <option value="Community">Community</option>
                            <option value="Creativity">Creativity</option>
                            <option value="Environment">Environment</option>
                            <option value="Volunteering">Volunteering</option>
                            <option value="Family">Family</option>
                        </select>
                    </div>

                    <input
                        className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full max-w-[300px]  text-[#888]'
                        type="text" placeholder='Search (e.g., Sofware Engineering)' />
                </div>
            </div>



        </div>
    )
}

export default GoalTemplates
