import React from 'react'
import Header from '../comps/Header'
import gradientVideo from '../assets/gradient.mp4'
import Marquee from 'react-fast-marquee'
import { CiRepeat } from "react-icons/ci";
import { CiCalendarDate } from "react-icons/ci";
import realtimeTask from '../assets/Homepage/Tasks/Realtime.mp4'
import { LuLayoutTemplate } from "react-icons/lu";
import noteSample from '../assets/Homepage/Notes/Note.jpeg'
import { MdOutlineFileDownload } from "react-icons/md";
import KanbanDemo from '../assets/Homepage/Kanban/KanbanDemo.mp4'
import ConnectedSvg from '../comps/ConnectedSvg';
import Footer from '../comps/Footer';
import AllDevices from '../assets/Homepage/AllDe.png'
import { MdOutlineArrowOutward } from "react-icons/md";
import IsLoggedIn from '../firebase/IsLoggedIn';
import { useNavigate } from 'react-router-dom';
import useStore from '../Zustand/UseStore';
import Menu from '../comps/Menu';
import MetaEditor from '../comps/MetaHeader/MetaEditor';
import AdSenseAd from '../comps/AdSense/AdGenerator';

const Homepage: React.FC = () => {
  const [user] = IsLoggedIn()
  const nav = useNavigate()
  const { showMenu }: any = useStore()

  return (
    <div className='h-auto relative bg-[#222] min-h-[100vh] '>
      <MetaEditor
        title="Orgamix | Home"
        description="Orgamix is a productivity web app designed to help you manage tasks, goals, notes, projects, and deadlines, all while supporting charitable causes."
        keywords='Orgamix, productivity, tasks, goals, notes, projects, deadlines, charity, donations, web app, software, organization, management, planning, collaboration, real-time, projects, tasks, goals, notes, deadlines'
     />
      <Header />
      {
        showMenu &&
        <Menu />
        
      }
      <div className='px-5'>
      <AdSenseAd  />
        <div className='w-full max-w-[1200px]   mx-auto mt-8  overflow-hidden '>
          <div className="videoBg  rounded-md p-5 text-center gap-3 min-h-[400px] md:min-h-[500px] flex items-center flex-col justify-center bg-[#11]  relative overflow-hidden">

            <video
              className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-50"
              src={gradientVideo}
              autoPlay
              muted
              loop />
            <div className="absolute inset-0 w-full h-full bg-transparent z-10 opacity-40 grid-overlay"></div>


            <div className="relative z-10 text-[2rem] font-bold reducedHeight mix-blend-difference">
              Stay organized and contribute to a great cause
            </div>
            <p className="relative z-10 text-md  max-w-[700px] w-full text-[#a8a8a8]">
              Orgamix provides productivity tools that help you with your day-to-day life while contributing to charity funds.
            </p>

            <div className='flex relative z-10 gap-3 text-sm mt-5'>
              <div
                onClick={() => {
                  !user ? nav('/sign-in') : nav('/user/dashboard')
                }}
                className='bg-[#222] px-5 py-2 font-bold rounded-lg cursor-pointer hover:bg-[#888]'>
                Start now
              </div>
              <div className='bg-[#fff] text-black font-bold px-5 py-2 rounded-lg cursor-pointer hover:bg-[#888] hover:text-white'>
                View demo
              </div>
            </div>
          </div>
          <div className='p-3 my-5 relative'>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-[#222] via-transparent to-[#222] z-21 opacity-100"></div>

            <Marquee autoFill>
              <div className='ml-5 px-5 py-1 bg-[#3333] border-[1px]
                     border-[#414141] text-[#636262] rounded-lg'>
                Task
              </div>
              <div className='ml-5 px-5 py-1 bg-[#3333] border-[1px]
                     border-[#414141] text-[#636262] rounded-lg'>
                Notes
              </div>
              <div className='ml-5 px-5 py-1 bg-[#3333] border-[1px]
                     border-[#414141] text-[#636262] rounded-lg'>
                Goals
              </div>
              <div className='ml-5 px-5 py-1 bg-[#3333] border-[1px]
                     border-[#414141] text-[#636262] rounded-lg'>
                Collaborative
              </div>
              <div className='ml-5 px-5 py-1 bg-[#3333] border-[1px]
                     border-[#414141] text-[#636262] rounded-lg'>
                Real-time
              </div>
              <div className='ml-5 px-5 py-1 bg-[#3333] border-[1px]
                     border-[#414141] text-[#636262] rounded-lg'>
                Projects
              </div>
              <div className='ml-5 px-5 py-1 bg-[#3333] border-[1px]
                     border-[#414141] text-[#636262] rounded-lg'>
                Deadlines
              </div>
            </Marquee>
          </div>

          <div className='flex gap-2'>

            <div className='flex flex-col gap-2 w-full'>

              <div className='w-full h-[auto] md:h-[300px]  border-[1px] border-[#414141] py-8 bg-[#1f1f1f] rounded-md p-5 flex gap-5 justify-between flex-col md:flex-row relative'>

                <div>
                  <div className="absolute inset-0 w-full h-full bg-transparent z-10 opacity-40 grid-overlay"></div>

                  <div className='font-bold'>Stay on Top of Your productivity.</div>
                  <p className='text-[13px] text-[#888] w-full max-w-[300px]'>
                    Easily create, organize, and prioritize works. Set due dates, add reminders, and focus on what matters most
                  </p>

                </div>

                <div className='flex gap-5 w-full max-w-[700px] overflow-hidden z-[30] relative'>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-transparent to-[#222] z-10 opacity-100"></div>
                  <div className='bg-[#313131] w-full min-w-[400px]  overflow-hidden flex items-start flex-col p-3 rounded-lg cursor-pointer border-[#535353] border-[1px]'>
                    <div className='font-bold break-all text-md'>
                      Write Blog Post on Productivity Tips
                    </div>
                    <p className='text-[#888] break-all text-[12px]'>Research and draft a 1,000-word article on time management techniques and tools.</p>
                    <p className='text-[#888] flex gap-1  items-center my-2 break-all text-sm'>
                      <CiRepeat /> Weekly
                    </p>

                    <div className='mt-auto pt-2 flex gap-4 text-[10px] md:text-sm'>

                      <div className='flex gap-1 items-center justify-start'>
                        <div>
                          < CiCalendarDate />
                        </div>
                        <p className='text-[#888] text-[10px]'>2024-10-03</p>
                      </div>

                      <div className='flex items-center gap-1 justify-start'>
                        <div className='w-[10px] h-[10px] bg-red-500'>

                        </div>
                        <p className='text-[#888] text-[10px]'>Personal</p>
                      </div>

                      <div className='hidden items-center gap-1 justify-start  md:flex'>
                        <div className='w-[10px] h-[10px] bg-yellow-500'>

                        </div>
                        <p className='text-[#888] text-[10px]'>Medium priority</p>
                      </div>

                    </div>


                    <div className='flex mt-2 w-full border-[#535353] border-[1px] overflow-hidden rounded-l-lg  rounded-r-lg'>
                      <div
                        className='bg-[#111111] px-3 p-1 text-red-500  hover:bg-[#222] text-sm items-center flex justify-center border-r-[1px] border-[#535353] text-center w-full'>Delete</div>
                      <div
                        className='bg-[#111111] px-3 p-1 text-blue-500 
                       hover:bg-[#2222] border-r-[1px] text-sm items-center flex justify-center border-[#535353] text-center w-full'>Edit</div>

                      <div
                        className='bg-[#111111] px-3 p-1 w-full text-center text-sm items-center flex justify-center hover:bg-[#222]'>Cancel</div>

                    </div>
                    <div className='w-full mt-2  rounded-l-lg rounded-r-lg  text-sm items-center flex justify-center overflow-hidden border-[#535353] border-[1px]'>


                      <div className='bg-[#111111] px-3 p-1 text-green-500 text-sm items-center flex justify-center py-1 hover:bg-[#222] border-r-[1px] border-[#535353] text-center w-full'>Complete</div>
                    </div>
                  </div>

                  <div className='bg-[#313131] w-full min-w-[400px]  overflow-hidden flex items-start flex-col p-3 rounded-lg cursor-pointer border-[#535353] border-[1px]'>
                    <div className='font-bold break-all text-md'>
                      Finalize Project Proposal
                    </div>
                    <p className='text-[#888] break-all text-[12px]'>Complete the project overview, timeline, and goals for the upcoming client presentation.</p>
                    <p className='text-[#888] flex gap-1  items-center my-2 break-all text-sm'>
                      <CiRepeat /> Monthly
                    </p>

                    <div className='mt-auto pt-2 flex gap-4 text-[10px] md:text-sm'>

                      <div className='flex gap-1 items-center justify-start'>
                        <div>
                          < CiCalendarDate />
                        </div>
                        <p className='text-[#888] text-[10px]'>2024-10-30</p>
                      </div>

                      <div className='flex items-center gap-1 justify-start'>
                        <div className='w-[10px] h-[10px] bg-red-500'>

                        </div>
                        <p className='text-[#888] text-[10px]'>Work</p>
                      </div>

                      <div className='hidden items-center gap-1 justify-start  md:flex'>
                        <div className='w-[10px] h-[10px] bg-yellow-500'>

                        </div>
                        <p className='text-[#888] text-[10px]'>High priority</p>
                      </div>

                    </div>


                    <div className='flex mt-2 w-full border-[#535353] border-[1px] overflow-hidden rounded-l-lg  rounded-r-lg'>
                      <div className='bg-[#111111] px-3 p-1 text-red-500  hover:bg-[#222] text-sm items-center flex justify-center border-r-[1px] border-[#535353] text-center w-full'>Delete</div>
                      <div className='bg-[#111111] px-3 p-1 text-blue-500 hover:bg-[#2222] border-r-[1px] text-sm items-center flex justify-center border-[#535353] text-center w-full'>Edit</div>

                      <div className='bg-[#111111] px-3 p-1 w-full text-center text-sm items-center flex justify-center hover:bg-[#222]'>Cancel</div>

                    </div>
                    <div className='w-full mt-2  rounded-l-lg rounded-r-lg  text-sm items-center flex justify-center overflow-hidden border-[#535353] border-[1px]'>
                      <div className='bg-[#111111] px-3 p-1 text-green-500 text-sm items-center flex justify-center py-1 hover:bg-[#222] border-r-[1px] border-[#535353] text-center w-full'>Complete</div>
                    </div>
                  </div>

                </div>
              </div>

              <div className='flex gap-2 flex-col md:flex-row'>
                <div className='w-full h-[300px]  border-[1px]
                     border-[#414141] py-8 bg-[#1f1f1f] rounded-md p-5 flex flex-col justify-between gap-5'>
                  <div>
                    <div className='font-bold'>Smart filtering</div>
                    <p className='text-[13px] text-[#888] w-full max-w-[300px]'>
                      Effortlessly navigate and locate your works with our advanced search, sorting, and tabulation features for pending and completed items.
                    </p>
                  </div>
                  <div className='w-full max-w-[200px] overflow-hidden rounded-lg ml-auto'>
                    <div className="flex  border-[#535353] border-[1px] w-auto items-start overflow-hidden  rounded-l-lg  rounded-r-lg">
                      <div className='w-full bg-[#111] text-white text-sm py-2 flex items-center justify-center border-r-[#535353] border-r-[1px] px-2'>Pending</div>
                      <div className='w-full bg-[#111] text-sm py-2 flex items-center justify-center text-green-500 px-2'>Completed</div>
                    </div>
                  </div>
                </div>

                <div className='w-full max-w-[full] md:max-w-[300px] h-[300px]  border-[1px]
                     border-[#414141] py-8 bg-[#1f1f1f] rounded-md p-5 gap-5 flex flex-col  justify-start'>
                  <div>
                    <div className='font-bold'>Real-time changes</div>
                    <p className='text-[13px] text-[#888] w-full max-w-[300px]'>
                      Receive real-time updates to prioritize works and set reminders.
                    </p>
                  </div>

                  <div className='rounded-lg overflow-hidden mr-auto'>
                    <video
                      autoPlay
                      muted
                      loop
                      className='w-full h-full'
                      src={realtimeTask}></video>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className='bg-[#111]  border-[1px] border-[#414141] mt-5 p-5 rounded-md text-center text-[13px] md:text-md'>
            Start
            <span className='px-2 py-1 border-[1px] ml-1
                     border-[#414141] rounded-md bg-[#1f1f1f] mr-1'>working</span>
            with our software at
            <span className='px-2 py-1 border-[1px] ml-1
                     border-[#414141] rounded-md bg-[#1f1f1f]'>no cost.</span>

          </div>

          <div className='flex gap-2 mt-5'>

            <div className='flex flex-col md:flex-row gap-2 w-full'>
              <div className='w-full max-w-[full]  md:max-w-[600px] h-[auto] md:h-[300px]  border-[1px] border-[#414141] py-8 bg-[#1f1f1f] rounded-md p-5 flex gap-5 justify-between flex-col md:flex-row relative'>

                <div>
                  <div className="absolute inset-0 w-full h-full bg-transparent z-10 opacity-40 grid-overlay"></div>

                  <div className='font-bold'>Elevate Your Workflow</div>
                  <p className='text-[13px] text-[#888] w-full max-w-[300px]'>
                    Capture and store your thoughts effortlessly.
                  </p>

                </div>

                <div>
                  <img
                    className='w-full h-full object-contain'
                    src={noteSample} alt="" />
                </div>
              </div>

              <div className='flex gap-2 flex-row'>
                <div className='w-full h-[300px]  border-[1px] border-[#414141] py-8 bg-[#1f1f1f] rounded-md p-5 flex flex-col justify-between gap-5'>
                  <div>

                    <div className='font-bold'>Templates</div>
                    <p className='text-[13px] text-[#888] w-full max-w-[300px]'>
                      Easily download the goals that interests you.
                    </p>
                  </div>

                  <div className="w-full max-w-[550px] bg-[#313131] z-[5000] relative rounded-lg p-3 h-full max-h-[800px] border-[#535353] border-[1px] justify-between flex flex-col overflow-auto  items-start" >

                    <div className='p-3 bg-[#111] text-[1rem] md:text-[2vw]  border-[#535353] border-[1px]  rounded-md -rotate-12'>
                      <LuLayoutTemplate />
                    </div>

                    <div className='flex text-sm px-3 py-2 items-center ml-auto gap-3 bg-[#111]  border-[#535353] border-[1px]  rounded-lg rotate-6'>
                      Download <MdOutlineFileDownload />
                    </div>

                  </div>
                </div>

                <div className='w-full max-w-[300px] h-[300px]  border-[1px] overflow-hidden border-[#414141] py-8 bg-[#1f1f1f] rounded-md p-5 gap-5 flex flex-col  justify-between'>

                  <div>
                    <div className='font-bold'>Publish your goals</div>
                    <p className='text-[13px] text-[#888] w-full max-w-[300px]'>
                      Share your goals easily in public
                    </p>
                  </div>

                  <div className='relative w-full max-w-[400px] md:min-w-[270px] min-w-[10vw]'>

                    <div className='w-full max-w-[750px] bg-[#313131]  z-[5000]  min-w-[300px] rounded-lg p-3 h-full max-h-[300px] border-[#535353] border-[1px] justify-between flex flex-col overflow-auto gap-1'>

                      <div className="absolute inset-0 w-full h-full bg-transparent z-10 opacity-40 grid-overlay"></div>

                      <div className="absolute inset-0 md:w-[100%] w-[120%] right-0 h-full bg-gradient-to-r from-transparent via-transparent to-[#222] z-20 opacity-100"></div>

                      <div className="flex flex-col">
                        <div className="text-sm font-bold">Choose method</div>
                        <p className="text-[#888] text-[10px]">Choose your desired method to publish your own goals in public.</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <div className="bg-green-500 p-1 text-[10px] rounded-lg cursor-pointer border-[#535353] border-[1px]">Share your existing goals</div>
                        <div className="false p-1 text-[10px] rounded-lg cursor-pointer border-[#535353] border-[1px]">Create a new goal</div>
                      </div>
                      <div className="w-full text-[10px] rounded-lg border-[#535353] border-[1px] flex overflow-hidden">
                        <div className="p-1 bg-[#111111] border-r-[#535353] text-center border-r-[1px] hover:bg-[#222]  w-full cursor-pointer">Close</div>
                        <div className="false p-1 bg-[#111111] hover:bg-[#222]  text-center w-full cursor-pointer">Continue</div>
                      </div>
                    </div>
                  </div>

                </div>


              </div>
            </div>

          </div>

          <div className='bg-[#111]  border-[1px] border-[#414141] mt-5 p-5 rounded-md text-center text-[13px] md:text-md'>
            Work with large
            <span className='px-2 py-1 border-[1px] ml-1
                     border-[#414141] rounded-md bg-[#1f1f1f]'>team.</span>

          </div>

          <div className='relative w-full border-[1px] border-[#414141] py-8 bg-[#1f1f1f] mt-5 rounded-md p-5'>
            <div className="absolute inset-0 w-full h-full bg-transparent z-10 opacity-40 grid-overlay"></div>

            {/* Text Content */}
            <div className='mb-6'>
              <div className='font-bold'>Manage projects</div>
              <p className='text-[13px] text-[#888] w-full max-w-[300px]'>
                Streamline tasks, coordinate with your team, and keep everything on track.
              </p>
            </div>

            {/* 16:9 Video Container */}
            <div className='relative w-full overflow-hidden rounded-md border-[1px] border-[#414141] z-[30]'>
              <div className='h-0 w-full pb-[50.25%]'></div> {/* 16:9 ratio padding */}
              <video
                className='absolute top-0 left-0 w-full h-full object-contain rounded-md'
                autoPlay
                muted
                loop
                src={KanbanDemo}
              ></video>
            </div>

          </div>


          <div className='flex gap-2 mt-5  '>
            <div className='bg-[#1f1f1f] relative w-full max-w-[300px] gap-5 flex-col justify-between border-[1px] border-[#414141] p-5 flex items-start rounded-md text-center text-[13px] md:text-md'>
              <div className='mb-6'>
                <div className='font-bold text-left'>Generate fund</div>
                <p className='text-[13px] text-[#888] text-left w-full max-w-[300px]'>
                  Ad revenue goes directly to charities and community projects.
                </p>
              </div>
              <div className="absolute inset-0 w-full h-full bg-transparent z-10 opacity-40 grid-overlay"></div>

              <div className='mx-auto'>
                <ConnectedSvg />
              </div>

            </div>

            <div className='bg-[#1f1f1f] w-full border-[1px] border-[#414141] p-5 rounded-md text-center text-[13px] md:text-md overflow-hidden'>
              <div className='mb-6'>
                <div className='font-bold text-left'>Empower Your Giving</div>
                <p className='text-[13px] text-[#888] text-left w-full max-w-[300px]'>
                  Raise funds for orgamx easily from any device.
                </p>
              </div>

              <div className='w-full max-h-[500px] h-full max-w-[900px] relative overflow-hidden '>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-[#222] via-transparent to-[#222] z-21 opacity-100"></div>
                <img
                  className='w-full h-full object-cover'
                  src={AllDevices} alt="" />
              </div>

            </div>
          </div>


          <div className='mt-5 bg-[#292929] p-5 mb-[2rem] reducedHeight rounded-[2rem] font-bold border-[1px] border-[#414141] flex justify-between items-center gap-5'>
            <div>
              START WORKING AND MAKE DIFFERENCE
            </div>

            <div
              onClick={() => {
                !user ? nav('/sign-in') : nav('/user/dashboard')
              }}
              className='text-black  bg-white rounded-full p-5 px-7 cursor-pointer hover:bg-[#414141]  hover:text-white'>
              <MdOutlineArrowOutward />
            </div>
          </div>

        </div>

      </div>
      <Footer />
    </div>
  )
}

export default Homepage
