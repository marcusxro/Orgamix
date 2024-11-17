import React, { useEffect, useRef, useState } from 'react'
import MetaEditor from '../../comps/MetaHeader/MetaEditor'
import Sidebar from '../../comps/Sidebar'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { FaPause } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import useStore from '../../Zustand/UseStore';
import { supabase } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import songList from '../../comps/System/Timer/SongList';


const Pomodoro: React.FC = () => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [selectedTab, setSelectedTab] = React.useState('Work');
    const containerRef = React.useRef(null);
    const [user] = IsLoggedIn()

    React.useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = (containerRef.current as HTMLDivElement).clientWidth;
                setTimerSize(containerWidth * 1);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Call handler right away so state gets updated with initial window size

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [timerSize, setTimerSize] = React.useState(150);

    useEffect(() => {
        const handleBeforeUnload = (event: any) => {
            event.preventDefault();
            event.returnValue = "Are you sure you want to leave? The timer will reset."; // This string may not always be displayed but is required to trigger the dialog.
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);


    const { workTimer, shortTimer, longTimer }: any = useStore();
    const { setWorkTimer, setShortTimer, setLongTimer }: any = useStore();

    const addTime = (additionalTime: number) => {
        if (selectedTab === 'Work') {
            setWorkTimer(workTimer + additionalTime);
        } else if (selectedTab === 'Short') {
            setShortTimer(shortTimer + additionalTime);
        } else if (selectedTab === 'Long') {
            setLongTimer(longTimer + additionalTime);
        }
    };

    const formatTime = (time: number) => {
        const days = Math.floor(time / (60 * 60 * 24));
        const hours = Math.floor((time % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((time % (60 * 60)) / 60);
        const seconds = time % 60;
        return `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`;
    };

    const [isLoaded, setIsLoaded] = useState(false)
    const [events, setEvents] = useState<any>([]);
    const [searchedData, setSearchedData] = useState<any>([])
    useEffect(() => {
        if (user) {
            fetchAllDatas();
        }
    }, [user, isLoaded]);



    async function fetchAllDatas() {
        const tasks = await fetchUserTasks();
        const goals = await fetchUserGoals();
        const projects = await fetchUserProjects();
        const notes = await fetchUserNotes();

        if (tasks && goals && projects) {
            setIsLoaded(true)
        }
        // Map combined data to event format required by the calendar
        const combinedData = [
            ...(tasks || []).map(item => {
                const deadline = new Date(item.deadline);
                if (!isNaN(deadline.getTime())) { // Check if the date is valid
                    return {
                        title: item.title,
                        category: item?.category,
                        type: "Task",
                        isTaskDone: false,
                        workID: item.createdAt
                    };
                }
                return null; // Return null if the date is invalid
            }).filter(event => event), // Filter out any null events
            ...(goals || []).map(item => {
                const deadline = new Date(item.deadline);
                if (!isNaN(deadline.getTime())) { // Check if the date is valid
                    return {
                        title: item.title,
                        category: item?.category,
                        type: "Goal",
                        isTaskDone: false,
                        workID: item.created_at
                    };
                }
                return null; // Return null if the date is invalid
            }).filter(event => event), // Filter out any null events
            ...(notes || []).map(item => {
                const deadline = new Date(item.deadline);
                if (!isNaN(deadline.getTime())) { // Check if the date is valid
                    return {
                        title: item.title,
                        type: "Note",
                        category: item?.category,
                        isTaskDone: false,
                        workID: item.createdat
                    };
                }
                return null; // Return null if the date is invalid
            })
                .filter(event => event), // Filter out any null events
            ...(projects || []).map(item => {
                const deadline = new Date(item.deadline);
                if (!isNaN(deadline.getTime())) { // Check if the date is valid
                    return {
                        title: item.name,
                        type: "Project",
                        category: item?.category,
                        isTaskDone: false,
                        workID: item.created_at
                    };
                }
                return null; // Return null if the date is invalid
            }).filter(event => event), // Filter out any null events
        ];
        setEvents(combinedData);
    }


    async function fetchUserTasks() {
        if (!user) return null;
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('userid', user.uid);
        if (error) console.error('Error fetching tasks:', error);
        return data;
    }

    async function fetchUserGoals() {
        if (!user) return null;
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('userid', user.uid);
        if (error) console.error('Error fetching goals:', error);
        return data;
    }

    async function fetchUserNotes() {
        if (!user) return null;
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('userid', user.uid);
        if (error) console.error('Error fetching goals:', error);
        return data;
    }

    async function fetchUserProjects() {
        if (!user) return null;
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('created_by', user.uid);
        if (error) console.error('Error fetching projects:', error);
        return data;
    }

    const [searchValue, setSearchValue] = useState('')

    const [selectedData, setSelectedData] = useState<any[] | null>(null)
    function handleSelect(event: any) {
        setSelectedData((prevs: any) => {
            if (prevs && prevs.some((e: any) => e.title === event.title)) {
                return prevs.filter((e: any) => e.title !== event.title); // Remove event if it's already in selectedData
            }
            return [...(prevs || []), event]; // Add event if it's not in selectedData
        });
    }


    useEffect(() => {
        const filtereds = events.filter((event: any) => event.title.toLowerCase().includes(searchValue.toLowerCase()))

        if (searchValue === '') {
            setSearchedData(events)
        } else {
            setSearchedData(filtereds)
        }
    }, [searchValue, events])


    const [playID, setPlayID] = useState<number | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null);   // Reference to the audio instance.

    const playSong = (song: any, index: number) => {
        if (playID === index) {
          // If the same song is clicked, toggle pause/play
          if (audioRef.current) {
            if (audioRef.current.paused) {
              audioRef.current.play();
            } else {
              audioRef.current.pause();
              setPlayID(null);
            }
          }
        } else {
          // Play a new song
          if (audioRef.current) {
            audioRef.current.pause(); // Pause the previous song
          }
          const audio = new Audio(song.src);
          audioRef.current = audio;
          audio.play();
          audio.loop = true; // Loop the audio
          setPlayID(index);
        }
      };


    return (
        <div>
            <MetaEditor
                title={`Pomodoro`}
                description='Pomodoro timer to help you focus on your tasks.'
                keywords='Pomodoro, Timer, Focus, Task'
            />
            <Sidebar location="Pomodoro" />

            <div className='ml-[86px] h-[100vh] p-3 flex gap-3 overflow-auto mr-[0px] flex-col md:flex-row'>

                <div className='w-full h-full bg-[#191919] rounded-lg border-[1px] border-[#535353] p-3 flex items-center justify-center flex-col'>
                    <div className='flex gap-2 w-full max-w-[500px] text-sm mx-auto bg-[#111] mb-5 p-3 rounded-[2rem] border-[1px] border-[#535353]'>
                        <div
                            onClick={() => setSelectedTab('Work')}
                            className={`w-full text-center ${selectedTab === "Work" && 'bg-[#222] border-[1px] border-[#535353]'} cursor-pointer p-2 rounded-[1.5rem]`}>Work</div>
                        <div
                            onClick={() => setSelectedTab('Short')}
                            className={`w-full text-center ${selectedTab === "Short" && 'bg-[#222] border-[1px] border-[#535353]'} cursor-pointer p-2 rounded-[1.5rem]`}>Short</div>
                        <div
                            onClick={() => setSelectedTab('Long')}
                            className={`w-full text-center ${selectedTab === "Long" && 'bg-[#222] border-[1px] border-[#535353]'} cursor-pointer p-2 rounded-[1.5rem]`}>Long</div>
                    </div>

                    <div
                        ref={containerRef}
                        className='w-full h-full max-w-[150px] max-h-[150px] sm:max-w-[200px] sm:max-h-[200px] md:max-w-[300px] md:max-h-[300px] lg:max-w-[400px] lg:max-h-[400px] xl:max-w-[500px] xl:max-h-[500px]'>
                        {
                            selectedTab === 'Work' && (
                                <CountdownCircleTimer
                                    colors="#42b3f5"
                                    duration={424}
                                    size={containerRef.current ? (containerRef.current as HTMLDivElement).clientWidth * 1 : 150}
                                    strokeLinecap="round"
                                    isSmoothColorTransition
                                    strokeWidth={10}
                                    isPlaying={isPlaying}
                                    key={window.innerWidth} // Add a key to force re-render on window resize
                                    onUpdate={(remainingTime) => {
                                        const timerElement = document.getElementById('timer-text');
                                        if (timerElement) {
                                            timerElement.classList.add('slide-down');
                                            setTimeout(() => {
                                                timerElement.classList.remove('slide-down');
                                            }, 500);
                                        }
                                    }}
                                >
                                    {({ remainingTime }) => (
                                        <div id="timer-text" className="timer-text text-2xl font-bold bg-transparent">
                                            {formatTime(remainingTime)}
                                        </div>
                                    )}
                                </CountdownCircleTimer>
                            )
                        }
                        {
                            selectedTab === 'Short' &&
                            <CountdownCircleTimer
                                colors="#03fc88"
                                duration={timerSize}
                                size={containerRef.current ? (containerRef.current as HTMLDivElement).clientWidth * 1 : 150}
                                strokeLinecap="round"
                                isSmoothColorTransition
                                strokeWidth={10}
                                isPlaying={isPlaying}
                                key={window.innerWidth} // Add a key to force re-render on window resize
                                onUpdate={(remainingTime) => {
                                    const timerElement = document.getElementById('timer-text');
                                    if (timerElement) {
                                        timerElement.classList.add('slide-down');
                                        setTimeout(() => {
                                            timerElement.classList.remove('slide-down');
                                        }, 500);
                                    }
                                }}
                            >
                                {({ remainingTime }) => (
                                    <div id="timer-text" className="timer-text text-2xl font-bold bg-transparent">
                                        {remainingTime}
                                    </div>
                                )}
                            </CountdownCircleTimer>
                        }
                        {
                            selectedTab === 'Long' &&
                            <CountdownCircleTimer
                                colors="#fc9d03"
                                duration={timerSize}
                                size={containerRef.current ? (containerRef.current as HTMLDivElement).clientWidth * 1 : 150}
                                strokeLinecap="round"
                                isSmoothColorTransition
                                strokeWidth={10}
                                isPlaying={isPlaying}
                                key={window.innerWidth} // Add a key to force re-render on window resize
                                onUpdate={(remainingTime) => {
                                    const timerElement = document.getElementById('timer-text');
                                    if (timerElement) {
                                        timerElement.classList.add('slide-down');
                                        setTimeout(() => {
                                            timerElement.classList.remove('slide-down');
                                        }, 500);
                                    }
                                }}
                            >
                                {({ remainingTime }) => (
                                    <div id="timer-text" className="timer-text text-2xl font-bold bg-transparent">
                                        {remainingTime}
                                    </div>
                                )}
                            </CountdownCircleTimer>
                        }
                    </div>

                    <div className='flex gap-2 mt-9'>
                        {
                            isPlaying ?
                                <div
                                    onClick={() => { setIsPlaying((prevs) => !prevs) }}
                                    className='text-sm font-bold px-5 rounded-md bg-[#191919] py-2 flex gap-2 items-center cursor-pointer border-[1px] border-[#535353]'><FaPause /> Pause</div>
                                :
                                <div
                                    onClick={() => { setIsPlaying((prevs) => !prevs) }}
                                    className='text-sm font-bold px-5 rounded-md bg-[#191919] py-2 flex gap-2 items-center cursor-pointer border-[1px] border-[#535353]'><FaPlay />Start</div>


                        }
                        <div>
                            <div className='text-sm font-bold px-5 rounded-md bg-[#191919] py-2 flex gap-2 items-center cursor-pointer border-[1px] border-[#535353]'>
                                <IoIosSettings />Settings
                            </div>

                        </div>
                    </div>

                </div>
                <div className='bg-[#191919] p-3 w-full rounded-lg h-full border-[1px] border-[#535353] overflow-auto'>
                    <div>
                        <div className='font-bold'>
                            Pomodoro Timer
                        </div>
                        <div className='text-sm text-[#888]'>
                            here you can focus on your tasks with the help of the pomodoro timer.
                        </div>
                    </div>

                    <div className='mt-4 text-sm mb-4'>
                        Select works you want to work with
                    </div>

                    <div className='flex items-start flex-col md:flex-row gap-2 rounded-md mt-2 min-h-[300px]'>
                        <div className='w-full flex flex-col gap-2  h-full border-[1px] max-h-[300px] overflow-auto border-[#535353]  p-3 rounded-md min-h-[300px] bg-[#333]'>

                            <input
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className='w-full p-2 bg-[#212121] border-[1px] border-[#535353] rounded-md text-[#ecececec] outline-none'
                                placeholder='Search works'
                                type="text" />
                            <div className='w-full h-full grid grid-cols-2 gap-2'>
                                {
                                    searchedData != null && searchedData.map((event: any, index: number) => {
                                        const isSelected = selectedData?.some((selected: any) => selected.workID === event.workID);
                                        return (
                                            <div
                                                onClick={() => { handleSelect(event) }}
                                                key={index} className={`flex gap-2 items-center border-[1px] border-[#535353] overflow-hidden cursor-pointer hover:bg-[#212121] bg-[#151515] rounded-lg ${isSelected ? 'bg-[#444]' : ''}`}>
                                                {
                                                    isSelected && (
                                                        <div className='bg-[#42b3f5] w-[2px] h-full'>

                                                        </div>
                                                    )
                                                }
                                                <div className='p-2'>

                                                    <div className='text-sm text-[#888] font-bold'>
                                                        {event.title.length > 20 ? `${event.title.slice(0, 20)}...` : event.title}
                                                    </div>
                                                    <div className='text-sm text-[#888]'>
                                                        {event.type}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                            {
                                searchedData != null && searchedData.length === 0 && (
                                    <div className='text-sm text-[#888]'>
                                        No available works
                                    </div>
                                )
                            }
                        </div>
                        <div className='w-full flex flex-col gap-2  h-full border-[1px] max-h-[300px] overflow-auto border-[#535353]  p-3 rounded-md min-h-[300px] bg-[#333]'>

                            {
                                songList.map((song, index) => (
                                    <div key={index}
                                        className='flex gap-2 items-center border-[1px] p-6 border-[#535353] overflow-hidden cursor-pointer hover:bg-[#212121] bg-[#151515] rounded-lg'>
                                        <div onClick={() => {playSong(song, index)}}>
                                            {
                                                playID === index ?
                                                    <FaPause />
                                                    :
                                                    <FaPlay />
                                            }
                                        </div>
                                        <div className='p-2'>

                                            <div className='text-sm text-[#888] font-bold'>
                                                {song.title}
                                            </div>
                                            <div className='text-sm text-[#888]'>
                                                {song.Date}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }

                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Pomodoro
