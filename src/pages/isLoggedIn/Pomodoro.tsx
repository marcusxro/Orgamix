import React, { useCallback, useEffect, useRef, useState } from 'react'
import MetaEditor from '../../comps/MetaHeader/MetaEditor'
import Sidebar from '../../comps/Sidebar'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { FaPause } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import useStore from '../../Zustand/UseStore';
import { supabase, supabaseTwo } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import songList from '../../comps/System/Timer/SongList';
import Switch from "react-switch";
import Loader from '../../comps/Loader';
import { set } from 'date-fns';

interface worksType {
    title: string;
    category: string;
    type: string;
    isTaskDone: boolean;
    workID: string;
}

interface pomodoroDataType {
    user_id: string;
    created_at: string;
    works: worksType[];
    remaining_time: number;
    is_running: boolean;
    updated_at: string;
    type: string;
    work_timer: number;
    short_timer: number;
    long_timer: number;
    id: number;
    musicID: string;
    autoStart: boolean;
    autoChecked: boolean;
}


const Pomodoro: React.FC = () => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [selectedTab, setSelectedTab] = useState('Work');
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [user] = IsLoggedIn()
    const [timerLoading, setTimerLoading] = useState(false);



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

    const [_, setTimerSize] = React.useState(150);

    // useEffect(() => {
    //     const handleBeforeUnload = (event: any) => {
    //         event.preventDefault();
    //         event.returnValue = "Are you sure you want to leave? The timer will reset."; // This string may not always be displayed but is required to trigger the dialog.
    //     };

    //     window.addEventListener("beforeunload", handleBeforeUnload);

    //     return () => {
    //         window.removeEventListener("beforeunload", handleBeforeUnload);
    //     };
    // }, []);


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

    const [isAutoStart, setIsAutoStart] = useState(false);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [isCreatingData, setIsCreatingData] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [pomodoroData, setPomodoroData] = useState<pomodoroDataType[] | null>(null);
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [timerDB, setTimerDB] = React.useState<number>(0);
    const [checkerTimer, setCheckerTimer] = React.useState<number>(0);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    const [isStarted, setIsStarted] = useState<boolean>(false)
    const { setWorkTimer, setShortTimer, setLongTimer } = useStore();
    const [selectedMusicId, setSelectedMusicId] = useState<string | null>(null)

    const [workTimerDuration, setWorkTimerDuration] = useState<number>(0);
    const [shortTimerDuration, setShortTimerDuration] = useState<number>(0);
    const [longTimerDuration, setLongTimerDuration] = useState<number>(0);



    useEffect(() => {
        if (user) {
            createPomodoroData();
            getPomodoroData()
            const subscription = supabaseTwo
                .channel('public:timer')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'timer' }, (payload) => {
                    handleRealtimeEvent(payload);
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user, timerLoading]); // Update on `sortVal` change as well
    const [isFirstUser, setIsFirstUser] = useState(false);


    const handleRealtimeEvent = (payload: any) => {
        if (!isFirstUser) return; // Only the first user should listen to the updates
        const isCurrentUserProject = payload.new?.user_id === user?.uid || payload.old?.user_id === user?.uid;
        if (!isCurrentUserProject) return;

        switch (payload.eventType) {
            case 'INSERT':

                setPomodoroData((prevData) =>
                    prevData ? [...prevData, payload.new] : [payload.new]
                );
                break;
            case 'UPDATE':

                setPomodoroData((prevData) =>
                    prevData
                        ? prevData.map((item) =>
                            item.id === payload.new.id ? payload.new : item

                        )
                        : [payload.new]
                );


                break;
            case 'DELETE':
                setPomodoroData((prevData) =>
                    prevData ? prevData.filter((item) => item.id !== payload.old.id) : null
                );
                break;
            default:
                break;
        }
    };


    const updateTimerState = async (time: any, running: boolean, type: any) => {
        if (user)
            try {
                await supabaseTwo
                    .from('timer')
                    .update({
                        remaining_time: time,
                        is_running: running,
                        type: type,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_id', user?.uid);
            } catch (error) {
                console.error('Error updating timer state:', error);
            }
    };


    async function getPomodoroData() {
        try {
            const { data, error } = await supabaseTwo
                .from('timer')
                .select('*')
                .eq('user_id', user?.uid);

            if (error) {
                console.error('Error fetching timer data:', error);
                return;
            } else {
                setPomodoroData(data);
                if (data) {
                    setWorkTimer(data[0].work_timer * 60);
                    setShortTimer(data[0].short_timer * 60);
                    setLongTimer(data[0].long_timer * 60);
                    setIsPaused(data[0].is_paused);
                    setSelectedTab(data[0].type || 'Work');
                    setWorkTimerDuration(data[0].work_timer);
                    setShortTimerDuration(data[0].short_timer);
                    setLongTimerDuration(data[0].long_timer);
                    setIsFirstUser(true);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    async function createPomodoroData() {
        try {
            const { data: existingData, error: fetchError } = await supabaseTwo
                .from('timer')
                .select('*')
                .eq('user_id', user?.uid);

            if (fetchError) {
                console.error('Error fetching pomodoro data:', fetchError);
                return;
            }

            if (existingData && existingData.length > 0) {
                console.log('Pomodoro data already exists for this user.');
                return;
            }
            setIsCreatingData(true);
            const { data, error } = await supabaseTwo
                .from('timer')
                .insert([
                    {
                        user_id: user?.uid,
                        is_running: false,
                        created_at: Date.now(),
                        work_timer: 25,
                        short_timer: 5,
                        long_timer: 15,
                    }
                ]);

            if (error) console.error('Error creating pomodoro data:', error);
            setIsCreatingData(false);
        } catch (err) {
            console.log(err);
        }
    }
    const fetchTimerState = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabaseTwo
                .from('timer')
                .select('*')
                .eq('user_id', user?.uid);

            if (error) {
                console.error('Error fetching timer data:', error);
                return;
            }

            if (data && data.length > 0) {
                const timerData = data[0];
                const selectedType = timerData.type || 'Work'; // Use the type from the database
                const timerDuration = selectedType === 'Work'
                    ? (timerData.work_timer || 25) * 60
                    : selectedType === 'Short'
                        ? (timerData.short_timer || 5) * 60
                        : (timerData.long_timer || 15) * 60;

                const updatedAt = timerData.updated_at ? new Date(timerData.updated_at).getTime() : null;
                const now = Date.now();
                const elapsedTime = updatedAt ? Math.floor((now - updatedAt) / 1000) : 0;
                const adjustedRemainingTime = timerData.is_running
                    ? Math.max(0, (timerData.remaining_time || timerDuration) - elapsedTime)
                    : timerDuration;

                setPomodoroData(data);
                setRemainingTime(adjustedRemainingTime);
                setTimerDB(adjustedRemainingTime)
                setCheckerTimer(adjustedRemainingTime)
                setIsStarted(timerData.is_running || false);
                setSelectedTab(selectedType); // Set the selected tab based on the database
                console.log(timerDB)

                if (timerData.autoStart) {
                    const nextTab = selectedType === 'Work' ? 'Short' : selectedType === 'Short' ? 'Long' : 'Work';
                    setSelectedTab(nextTab);
                    const nextDuration = nextTab === 'Work'
                        ? (timerData.work_timer || 25) * 60
                        : nextTab === 'Short'
                            ? (timerData.short_timer || 5) * 60
                            : (timerData.long_timer || 15) * 60;
                    setRemainingTime(nextDuration);
                    setIsStarted(true);
                    setIsPlaying(true);
                    startTimer(nextTab, true); // Automatically start the next timer
                }
                if (timerData.is_running) {
                    startTimer(selectedType, true);
                }
            } else {
                console.log('No timer data found for this user.');
            }
        } catch (err) {
            console.error('Error fetching timer state:', err);
        }
    }, [user?.uid, timerLoading]);


    useEffect(() => {
        if (user && isStarted) {
            const intervalTimer = setInterval(() => {
                setCheckerTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalTimer);
                        setIsStarted(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(intervalTimer);
        }
    }, [isStarted, user]);

   useEffect(() => {
    if (checkerTimer === 0) {
        console.log("Timer is done");

        if (isAutoStart) {
            const nextTab = selectedTab === 'Work' ? 'Short' : selectedTab === 'Short' ? 'Long' : 'Work';
            console.log(nextTab);
            setRemainingTime(0);
            handleTabChange(nextTab);
            startTimer(nextTab, true);
            console.log("RAM");

            setIsStarted(true);
            setIsPlaying(true);
        } else {
            setIsStarted(false);
            setIsPlaying(false);
            resetTimer(selectedTab);
        }
    }
}, [checkerTimer, selectedTab]);


    useEffect(() => {
        if (user) fetchTimerState();
    }, [user, fetchTimerState]);

    useEffect(() => {
        const syncInterval = setInterval(() => {
            if (isStarted) updateTimerState(remainingTime, true, selectedTab);
        }, 5000);

        return () => clearInterval(syncInterval);
    }, [isStarted, remainingTime, updateTimerState, selectedTab, isPaused, isPlaying]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (isStarted) {
                updateTimerState(remainingTime, true, selectedTab);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isStarted, remainingTime, updateTimerState, selectedTab]);

    useEffect(() => {
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [intervalId]);




    const startTimer = async (type: string, boolVal: boolean) => {
        if (isStarted && boolVal) return;
       
        if (isStarted && intervalId) return; // Prevent duplicate starts

        setIsStarted(boolVal);
        setIsPlaying(boolVal);

        const duration = type === 'Work'
            ? (pomodoroData as pomodoroDataType[])[0]?.work_timer * 60
            : type === 'Short'
                ? (pomodoroData as pomodoroDataType[])[0]?.short_timer * 60
                : (pomodoroData as pomodoroDataType[])[0]?.long_timer * 60;

        const initialRemainingTime = duration || 0;

        setRemainingTime(initialRemainingTime); // Sync the initial value
        setCheckerTimer(initialRemainingTime);

        // Update the timer type and time in the database
        await updateTimerState(initialRemainingTime, boolVal, type);
        await updateTimerType(type);

        if (intervalId) {
            clearInterval(intervalId);
        }

        const counterInterval = setInterval(() => {
            setTimerDB((prev) => {
                if (prev <= 1) {
                    clearInterval(counterInterval);
                    setIsStarted(false);
                    updateTimerState(0, false, selectedTab);

                    if (isAutoStart) {
                        const nextTab = selectedTab === 'Work' ? 'Short' : selectedTab === 'Short' ? 'Long' : 'Work';
                        handleTabChange(nextTab);
                        startTimer(nextTab, true);
                    }

                    return 0;
                }
                updateTimerState(prev - 1, true, selectedTab);
                return prev - 1;
            });
        }, 1000);

        setLoading(false);
        setIntervalId(counterInterval);
        passWorksToTimer(selectedData);
    };

    async function passWorksToTimer(works: worksType[] | null) {
        if (selectedData && selectedMusicId && user != null || isAuthChecked || isAutoStart) {
            const worksData = works != null && works.map((work: any) => {
                return {
                    title: work.title,
                    category: work.category,
                    type: work.type,
                    isTaskDone: work.isTaskDone,
                    workID: work.workID
                };
            });

            const { error } = await supabaseTwo
                .from('timer')
                .update({
                    works: worksData || null,
                    musicID: selectedMusicId || null,
                    autoStart: isAutoStart || false,
                    autoCheck: isAuthChecked || false
                })
                .eq('user_id', user?.uid);
            if (error) {
                console.log(error)
            } else {
                console.log('works passed')
                setSelectedData(null)
                setSelectedMusicId(null)
                setLoading(false);
                renderSelected(selectedMusicId as string)
            }
        }

    }


    const pauseTimer = async () => {
        setIsPaused(true);
        setIsStarted(false);
        setIsPlaying(false); // Ensure the timer stops playing
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null); // Ensure intervalId is cleared
        }
        await updateTimerState(remainingTime, false, selectedTab);
    };



    const resetTimer = async (tab: string) => {
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null); // Ensure intervalId is cleared
        }
        const duration = pomodoroData
            ? tab === 'Work'
                ? pomodoroData[0].work_timer * 60
                : tab === 'Short'
                    ? pomodoroData[0].short_timer * 60
                    : pomodoroData[0].long_timer * 60
            : 1500;
        setRemainingTime(duration);
        setIsStarted(false);
        setIsPaused(false);
        setIsPlaying(false);
        removeWorksToTimer()
        await updateTimerState(duration, false, tab);
    };



    async function removeWorksToTimer() {
        const { error } = await supabaseTwo
            .from('timer')
            .update({
                works: null,
                musicID: null,
                autoStart: false,
                autoCheck: false
            })
            .eq('user_id', user?.uid);
        if (error) {
            console.log(error)
        } else {
            console.log('works removed')
            setLoading(false);
        }

    }


    const updateTimerType = async (type: string) => {
        try {
            await supabaseTwo
                .from('timer')
                .update({ type })
                .eq('user_id', user?.uid);
        } catch (error) {
            console.error('Error updating timer type:', error);
        }
    };



    const resumeTimer = () => {
        setIsPaused(false);
        setIsStarted(true);
        const interval = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalId!);
                    setIsStarted(false);
                    updateTimerState(0, false, selectedTab);
                    return 0;
                }
                updateTimerState(prev - 1, true, selectedTab);
                return prev - 1;
            });
        }, 1000);
        setIntervalId(interval);
    };



    const handleTabChange = (tab: string) => {
        setSelectedTab(tab);
        setIsPlaying(false);
        setIsStarted(false);
        setIsPaused(true);
        resetTimer(tab);
    };

    function renderSelected(selectedID: string) {
        if (selectedID === selectedMusicId) {
            setSelectedMusicId(null); // Deselect if the same ID is clicked again
        } else {
            setSelectedMusicId(selectedID); // Select the new ID
        }
    }





    async function editDuration() {
        if (timerLoading) {
            return
        };
        setTimerLoading(true);
        if (!user) {
            setTimerLoading(false);
            return
        };

        if (!workTimerDuration || !shortTimerDuration || !longTimerDuration) {
            setTimerLoading(false);
            return
        }

        try {
            const { error } = await supabaseTwo
                .from('timer')
                .update({
                    work_timer: workTimerDuration,
                    short_timer: shortTimerDuration,
                    long_timer: longTimerDuration
                })
                .eq('user_id', user.uid);
            if (error) {
                console.log(error)
                setTimerLoading(false);
            } else {
                console.log("Timer duration updated")
                setTimerLoading(false);
            }
        }
        catch (err) {
            console.log(err)
            setTimerLoading(false);
        }

    }


    const handleTimerCompletion = useCallback(() => {
        console.log("Timer is done");

        if (isAutoStart) {
            const nextTab = selectedTab === 'Work' ? 'Short' : selectedTab === 'Short' ? 'Long' : 'Work';
            console.log(nextTab);
            setRemainingTime(0);
            handleTabChange(nextTab);
            startTimer(nextTab, true);
            console.log("RAM");

            setIsStarted(true);
            setIsPlaying(true);
        } 
    }, [selectedTab, handleTabChange, startTimer, resetTimer]);

    useEffect(() => {
        if (checkerTimer === 0) {
            if (!isStarted) return; // Prevent redundant execution
            handleTimerCompletion();
        }
    }, [checkerTimer, handleTimerCompletion]);
    
   
    
    return (
        <div>
            <MetaEditor
                title={`Pomodoro`}
                description='Pomodoro timer to help you focus on your tasks.'
                keywords='Pomodoro, Timer, Focus, Task'
            />
            <Sidebar location="Pomodoro" />
            <div className='ml-[86px] lg:h-[100vh] p-3 flex gap-3 overflow-auto mr-[0px] flex-col lg:flex-row'>
                <div className='w-full h-full bg-[#191919] rounded-lg border-[1px] border-[#535353] p-3 flex items-center justify-center flex-col'>
                    <div className='flex gap-2 w-full max-w-[500px] text-sm mx-auto bg-[#111] mb-5 p-3 rounded-[2rem] border-[1px] border-[#535353]'>
                        <div
                            onClick={() => handleTabChange('Work')}
                            className={`w-full text-center ${selectedTab === "Work" && 'bg-[#222] border-[1px] border-[#535353]'} cursor-pointer p-2 rounded-[1.5rem]`}>Work</div>
                        <div
                            onClick={() => handleTabChange('Short')}
                            className={`w-full text-center ${selectedTab === "Short" && 'bg-[#222] border-[1px] border-[#535353]'} cursor-pointer p-2 rounded-[1.5rem]`}>Short</div>
                        <div
                            onClick={() => handleTabChange('Long')}
                            className={`w-full text-center ${selectedTab === "Long" && 'bg-[#222] border-[1px] border-[#535353]'} cursor-pointer p-2 rounded-[1.5rem]`}>Long</div>
                    </div>
       
                    <div
                        ref={containerRef}
                        className='w-full h-full max-w-[150px] max-h-[150px] sm:max-w-[200px] sm:max-h-[200px] md:max-w-[300px] md:max-h-[300px] lg:max-w-[400px] lg:max-h-[400px] xl:max-w-[500px] xl:max-h-[500px]'>
                        {selectedTab === 'Work' && pomodoroData && (
                            <CountdownCircleTimer
                                colors="#42b3f5"
                                duration={remainingTime}
                                size={containerRef.current ? (containerRef.current as HTMLDivElement).clientWidth : 150}
                                strokeLinecap="round"
                                isSmoothColorTransition
                                strokeWidth={10}
                                isPlaying={isPlaying && pomodoroData && pomodoroData[0]?.type === 'Work'}
                                key={`timer-${selectedTab}-${pomodoroData?.[0]?.work_timer ? pomodoroData[0].work_timer * 60 : 0}`}
                                onUpdate={(_) => {
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
                        )}
                        {selectedTab === 'Short' && pomodoroData && (
                            <CountdownCircleTimer
                                colors="#03fc88"
                                duration={remainingTime}
                                size={containerRef.current ? (containerRef.current as HTMLDivElement).clientWidth : 150}
                                strokeLinecap="round"
                                isSmoothColorTransition
                                strokeWidth={10}
                                isPlaying={isPlaying && pomodoroData && pomodoroData[0]?.type === 'Short'}
                                key={`timer-${selectedTab}-${pomodoroData?.[0]?.short_timer ? pomodoroData[0].short_timer * 60 : 0}`}
                                onUpdate={(_) => {
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
                        )}
                        {selectedTab === 'Long' && pomodoroData && (
                            <CountdownCircleTimer
                                colors="#fc9d03"
                                duration={remainingTime}
                                size={containerRef.current ? (containerRef.current as HTMLDivElement).clientWidth : 150}
                                strokeLinecap="round"
                                isSmoothColorTransition
                                strokeWidth={10}
                                isPlaying={isPlaying && pomodoroData && pomodoroData[0]?.type === 'Long'}
                                key={`timer-${selectedTab}-${pomodoroData?.[0]?.long_timer ? pomodoroData[0].long_timer * 60 : 0}`}
                                onUpdate={(_) => {
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
                        )}

                    </div>

                    <div className='flex gap-2 mt-9'>
                        {user != null && (
                            <>
                                {!isStarted && !isPaused && (
                                    <button onClick={() => startTimer(selectedTab, true)} className="bg-blue-500 text-white px-4 py-2 rounded">
                                        {loading ? (
                                            <div className='w-[20px] h-[20px]'>
                                                <Loader />
                                            </div>
                                        ) : (
                                            'Start'
                                        )}
                                    </button>
                                )}
                                {isStarted && (
                                    <button onClick={pauseTimer} className="bg-yellow-500 text-white px-4 py-2 rounded">
                                        Pause
                                    </button>
                                )}
                                {isPaused && (
                                    <button onClick={resumeTimer} className="bg-green-500 text-white px-4 py-2 rounded">
                                        Resume
                                    </button>
                                )}
                                <button onClick={() => resetTimer(selectedTab)} className="bg-red-500 text-white px-4 py-2 rounded">
                                    Reset
                                </button>
                            </>
                        )}

                        <div>


                        </div>
                    </div>

                </div>

                {
                    isCreatingData ?
                        <div className='bg-[#191919] w-full gap-5 flex items-center justify-center rounded-lg h-full border-[1px] border-[#535353] overflow-auto'>



                            <div className='w-[30px] h-[30px]'>
                                <Loader />
                            </div>
                            <div>
                                Creating your pomodoro data...
                            </div>
                        </div>
                        :
                        <div className='bg-[#191919] w-full rounded-lg h-full border-[1px] border-[#535353] overflow-auto'>

                            <div className='p-3 mb-5'>
                                <div className='font-bold'>
                                    Pomodoro Timer
                                </div>
                                <div className='text-sm text-[#888]'>
                                    here you can focus on your tasks with the help of the pomodoro timer.
                                </div>
                            </div>

                            <div className='p-3 border-t-[1px] border-t-[#535353] pt-5'>



                                <div className='flex items-start flex-col md:flex-row gap-2 rounded-md min-h-[300px]'>

                                    <div className='w-full h-full'>
                                        <div className='font-bold text-sm mb-4'>
                                            Select works you want to work with
                                        </div>
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
                                                                key={index}
                                                                className={`flex gap-2 items-center border-[1px] border-[#535353] overflow-hidden cursor-pointer hover:bg-[#212121] bg-[#151515] rounded-lg ${isSelected ? 'bg-[#444]' : ''}`}>
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
                                    </div>
                                    <div className='w-full h-full'>
                                        <div className='font-bold text-sm mb-4'>
                                            Choose music to play
                                        </div>
                                        <div className='w-full flex flex-col gap-2  h-full border-[1px] max-h-[300px] overflow-auto border-[#535353]  p-3 rounded-md min-h-[300px] bg-[#333]'>
                                            {
                                                songList.map((song: any, index) => {
                                                    const isSelected = song.songID === selectedMusicId;
                                                    return (
                                                        <div
                                                            onClick={() => { renderSelected(song.songID) }}
                                                            key={index}
                                                            className={`flex gap-2 flex-row items-center border-[1px] cursor-pointer hover:bg-[#212121] bg-[#151515] rounded-lg ${isSelected ? 'border-green-500' : 'border-[#535353]'}`}>
                                                            <div className='p-5 flex gap-2 items-center'>
                                                                <div onClick={() => { playSong(song, index) }}>
                                                                    {playID === index ? <FaPause /> : <FaPlay />}
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

                                                        </div>
                                                    );
                                                })}

                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='mt-5 border-t-[1px] border-t-[#535353] pt-5 p-3'>
                                <div className='text-sm mb-5 font-bold'>
                                    Time configure
                                </div>

                                <div className='grid gap-2 grid-cols-2'>
                                    <div
                                        className='w-full'>
                                        <input
                                            maxLength={10}
                                            value={workTimerDuration || ''}
                                            onChange={(e) => setWorkTimerDuration(Math.min(Number(e.target.value) || 0, 500))}
                                            className='w-full p-2 bg-[#212121] border-[1px] border-[#535353] rounded-md text-[#ecececec] outline-none'
                                            placeholder='Work timer (minutes)'
                                            type="number" />
                                    </div>
                                    <div
                                        className='w-full'>
                                        <input
                                            maxLength={10}
                                            value={shortTimerDuration || ''}
                                            onChange={(e) => setShortTimerDuration(Math.min(Number(e.target.value) || 0, 500))}
                                            className='w-full p-2 bg-[#212121] border-[1px] border-[#535353] rounded-md text-[#ecececec] outline-none'
                                            placeholder='Short break timer (minutes)'
                                            type="number" />
                                    </div>
                                    <div
                                        className='w-full'>
                                        <input
                                            maxLength={10}
                                            value={longTimerDuration || ''}
                                            onChange={(e) => setLongTimerDuration(Math.min(Number(e.target.value) || 0, 500))}
                                            className='w-full p-2 bg-[#212121] border-[1px] border-[#535353] rounded-md text-[#ecececec] outline-none'
                                            placeholder='Long break timer (minutes)'
                                            type="number" />
                                    </div>

                                    <div className='flex gap-2 w-full'>
                                        <div
                                            onClick={editDuration}
                                            className={`w-full flex items-center justify-center cursor-pointer text-center hover:bg-[#aaaaaa] p-2 ${selectedTab === 'Work' ? 'bg-[#42b3f5]' : selectedTab === 'Short' ? 'bg-[#03fc88]' : 'bg-[#fc9d03]'} px-5 text-black border-[1px] border-[#535353] rounded-md outline-none`}>
                                            {
                                                timerLoading ? (
                                                    <div className='w-[20px] h-[20px]'>
                                                        <Loader />
                                                    </div>
                                                ) : 'Save'
                                            }
                                        </div>
                                        <div className={`w-full cursor-pointer text-center hover:bg-[#aaaaaa] p-2 ${selectedTab === 'Work' ? 'bg-[#42b3f5]' : selectedTab === 'Short' ? 'bg-[#03fc88]' : 'bg-[#fc9d03]'} px-5 text-black border-[1px] border-[#535353] rounded-md outline-none`}>
                                            Reset
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* <div className='mt-5 border-t-[1px] border-t-[#535353] pt-5 p-3'>
                                <div className='font-bold'>
                                    Automations
                                </div>
                                <div className='flex flex-col md:flex-row gap-2 mt-5'>
                                    {
                                        <>

                                            {
                                                isAuthChecked && (
                                                    "CHECKED"
                                                )

                                            }
                                            {

                                                isAutoStart && (
                                                    "STARTED"
                                                )
                                            }
                                        </>
                                    }
                                    <div className='flex gap-4 justify-between items-center bg-[#212121] p-3 rounded-md  border-[1px] border-[#535353] '>
                                        <span>Auto Start Breaks</span>
                                        <Switch
                                            offColor='#444'
                                            uncheckedIcon={false}
                                            checkedIcon={false}
                                            onColor={`${selectedTab === 'Work' ? '#42b3f5' : selectedTab === 'Short' ? '#03fc88' : '#fc9d03'}`}
                                            onChange={() => setIsAutoStart((prevs: boolean) => !prevs)}
                                            checked={isAutoStart} />
                                    </div>

                                    <div className='flex gap-4 justify-between items-center bg-[#212121] p-3 rounded-md  border-[1px] border-[#535353] '>
                                        <span>Auto Check Tasks</span>
                                        <Switch
                                            offColor='#444'
                                            uncheckedIcon={false}
                                            checkedIcon={false}
                                            onColor={`${selectedTab === 'Work' ? '#42b3f5' : selectedTab === 'Short' ? '#03fc88' : '#fc9d03'}`}
                                            onChange={() => setIsAuthChecked((prevs: boolean) => !prevs)}
                                            checked={isAuthChecked} />
                                    </div>
                                </div>
                            </div> */}

                        </div>
                }

            </div>
        </div>
    )
}

export default Pomodoro