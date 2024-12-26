
import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../../comps/Sidebar'
import orgamixLogo from '../../assets/Orgamix.png'
import * as GoogleGenerativeAI from "@google/generative-ai";
import FetchPFP from '../../comps/FetchPFP';
import IsLoggedIn from '../../comps/Utils/IsLoggedIn';
import Loader from '../../comps/Loader';
import { IoIosSend } from "react-icons/io";
import useStore from '../../Zustand/UseStore';
import { FaArrowDown } from "react-icons/fa6";
import { motion } from 'framer-motion'
import { IoCopyOutline } from "react-icons/io5";
import { PiSpeakerHigh } from "react-icons/pi";
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { FaCircleStop } from "react-icons/fa6";
import AISidebar from '../../comps/System/AIComp/AISidebar';
import { supabase, supabaseTwo } from '../../supabase/supabaseClient';
import { useLocation, useParams } from 'react-router-dom';
import AIHeader from '../../comps/System/AIComp/AIHeader';
import MetaEditor from '../../comps/MetaHeader/MetaEditor';



const TypingEffect = ({ response, container }: any) => {

    const [displayText, setDisplayText] = useState('');
    const [index, setIndex] = useState(0);
    const { isDone, setIsDone }: any = useStore();
    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const prevScrollTop = useRef(0); // To track previous scroll position
    const [isBottomReached, setIsBottomReached] = useState(false);
    const [_, setTypingDone] = useState<boolean>(false); // Track if typing is done for the current response


    // Function to detect user scrolling direction
    const checkScrollDirection = () => {
        if (container.current) {
            const { scrollTop } = container.current;

            // Check if the user is scrolling up
            if (scrollTop < prevScrollTop.current) {
                setIsUserScrolling(true); // User is scrolling up
            } else {
                setIsUserScrolling(false); // User is scrolling down
            }

            // Update previous scroll position
            prevScrollTop.current = scrollTop;
        }
    };

    // Function to scroll to the bottom of the container
    const scrollToBottom = () => {
        if (container.current) {
            container.current.scrollTop = container.current.scrollHeight;
        }
    };

    // Effect to handle auto-scrolling logic
    useEffect(() => {
        if (!isUserScrolling && container.current) {
            const { scrollTop, scrollHeight, clientHeight } = container.current;
            const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;

            // Scroll to bottom only if near the bottom
            if (isNearBottom && !isBottomReached) {
                setIsBottomReached(true);
                scrollToBottom();
            }
        }
    }, [isUserScrolling]); // Depend on scrolling status

    // Handle typing effect
    useEffect(() => {
        if (response?.text) {
            if (response?.type === 'User') {
                // User's response: display the full text immediately
                setDisplayText(response.text);
            } else {
                const typingInterval = setInterval(() => {

                    if (index < response.text.length) {


                        if (isUserScrolling && isDone) {
                            clearInterval(typingInterval)
                            setDisplayText((prev) => prev + response.text[index]);
                            setIndex((prev) => prev + 1); // Move forward through the string for AI

                        } else {

                            setDisplayText((prev) => prev + response.text[index]);
                            setIndex((prev) => prev + 1); // Move forward through the string for AI
                            setTypingDone(true); // Set typingDone to true to trigger the copy div

                        }

                    } else {

                        clearInterval(typingInterval); // Stop typing when done
                        setIsDone(true); // Mark typing as done

                    }
                }, 3); // Adjust typing speed (10ms per character)




                if (!isUserScrolling && !isDone) {
                    scrollToBottom();
                }

                return () => clearInterval(typingInterval); // Cleanup interval
            }
        }
    }, [index, response?.text, isDone, isUserScrolling]); // Trigger effect based on typing index and response text

    // Listen for scroll events to detect user scrolling
    useEffect(() => {
        const handleScroll = () => {
            checkScrollDirection();
        };

        const currentContainer = container.current;
        if (currentContainer) {
            currentContainer.addEventListener('scroll', handleScroll);
        }

        // Cleanup the event listener on component unmount
        return () => {
            if (currentContainer) {
                currentContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, []); // Empty dependency array to run this effect once on mount


    return (
        <>
            {displayText}
        </>
    );
};


const ViewAiChat: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [AIresponse, setAIresponse] = useState<any | any[]>(null);
    const { isDone, setIsDone }: any = useStore()
    const [isTyping, setIsTyping] = useState(false); // State to track if AI is typing
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isShow, setIsShow] = useState<boolean>(false)
    const [isUserScrolling, setIsUserScrolling] = useState(false)
    const params = useParams();
    const [user]: any = IsLoggedIn()

    const [chatInfos, setChatInfos] = useState<any>([]);


    useEffect(() => {
        if (user) {
            getSpecificChats()
        }
    }, [user])

    async function getSpecificChats() {
        try {
            const { data, error } = await supabaseTwo
                .from('user_chats')
                .select('*')
                .eq('created_at', params.time)

            if (error) {
                console.log(error)
            } else {
                setChatInfos(data[0])
                setAIresponse(data[0].chats)
            }
        }
        catch (error) {
            console.log(error)
        }
    }



    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    };



    const scrollToBottomSmooth = () => {
        if (chatContainerRef.current && !isUserScrolling) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    const isNearBottom = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            return (scrollTop + clientHeight) / scrollHeight >= 0.8;
        }
        return false;
    };

    useEffect(() => {
        const handleScroll = () => {
            if (chatContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
                const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

                setIsUserScrolling(scrollPercentage < 0.8); // User is scrolling if not near the bottom
                setIsShow(scrollPercentage < 0.9); // Show the scroll-down button if not near the bottom
            }
        };

        const chatContainer = chatContainerRef.current;

        if (chatContainer) {
            chatContainer.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (chatContainer) {
                chatContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    useEffect(() => {
        if (!isUserScrolling && isNearBottom()) {
            scrollToBottomSmooth();
        }
    }, [AIresponse]);


    async function editChats(chatData: any) {
        try {
            const { error } = await supabaseTwo
                .from('user_chats')
                .update({ chats: chatData })
                .eq('userid', user?.id)
                .eq('created_at', params.time);

            if (error) {
                console.log(error);
            } else {
                console.log('Success saving chat');
            }
        } catch (error) {
            console.log(error);
        }
    }



    const [myTasks, setMyTasks] = useState<any | null>(null);
    const [myGoals, setMyGoals] = useState<any | null>(null);
    const [myProjects, setMyProjects] = useState<any | null>(null);

    function runAnalyticsForTasks() {
        setIsDone(false);
        setIsTyping(true); // Show typing indicator
        setLoading(true);
        scrollToBottomSmooth();

        if (loading) {
            return
        }

        const userChatData: any = [
            ...AIresponse,
            {
                text: "Can you provide me with some analytics on my tasks?",
                type: "User",
                created_at: user?.id
            }
        ];

        setAIresponse(userChatData); // Update state with user prompt

        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Default prompt based on user input
        let adjustedPrompt = "Can you provide me with some very comprehensive analytics on my tasks? and also provide recommendations or etc" + JSON.stringify(myTasks);

        model.generateContent(adjustedPrompt).then(result => {
            const response = result.response;
            const text = response.text();

            const aiChatData = [
                ...userChatData,
                {
                    text: text,
                    type: "AI",
                    created_at: Date.now()
                }
            ];
            setIsTyping(false); // Show typing indicator
            setLoading(false);

            setAIresponse(aiChatData); // Update state with AI response
            editChats(aiChatData); // Save to the database
        }).catch(error => {
            console.error("Error generating response:", error);
            setIsTyping(false); // Show typing indicator
            setAIresponse((prevs: any) => [
                ...prevs,
                {
                    text: "Error occurred, please send another prompt.",
                    type: "AI",
                    created_at: Date.now()
                }
            ]);
        });
    }

    function runAnalyticsForGoals() {
        setIsDone(false);
        setIsTyping(true); // Show typing indicator
        setLoading(true);
        scrollToBottomSmooth();

        if (loading) {
            return
        }


        const userChatData: any = [
            ...AIresponse,
            {
                text: "Can you provide me with some analytics on my goals?",
                type: "User",
                created_at: user?.id
            }
        ];

        setAIresponse(userChatData); // Update state with user prompt

        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Default prompt based on user input
        let adjustedPrompt = "Can you provide me with some very comprehensive analytics on my goals? and also provide recommendations or etc" + JSON.stringify(myGoals);

        model.generateContent(adjustedPrompt).then(result => {
            const response = result.response;
            const text = response.text();

            const aiChatData = [
                ...userChatData,
                {
                    text: text,
                    type: "AI",
                    created_at: Date.now()
                }
            ];
            setIsTyping(false); // Show typing indicator
            setLoading(false);

            setAIresponse(aiChatData); // Update state with AI response
            editChats(aiChatData); // Save to the database
        }).catch(error => {
            console.error("Error generating response:", error);
            setIsTyping(false); // Show typing indicator
            setAIresponse((prevs: any) => [
                ...prevs,
                {
                    text: "Error occurred, please send another prompt.",
                    type: "AI",
                    created_at: Date.now()
                }
            ]);
        });
    }

    function runAnalyticsForProjects() {
        setIsDone(false);
        setIsTyping(true); // Show typing indicator
        setLoading(true);
        scrollToBottomSmooth();

        if (loading) {
            return
        }


        const userChatData: any = [
            ...AIresponse,
            {
                text: "Can you provide me with some analytics on my projects?",
                type: "User",
                created_at: user?.id
            }
        ];

        setAIresponse(userChatData); // Update state with user prompt

        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Default prompt based on user input
        let adjustedPrompt = "Can you provide me with some very comprehensive analytics on my projects data? and also provide recommendations or etc. and dont provide information that can affect the user, like userid or password." + JSON.stringify(myProjects);

        model.generateContent(adjustedPrompt).then(result => {
            const response = result.response;
            const text = response.text();

            const aiChatData = [
                ...userChatData,
                {
                    text: text,
                    type: "AI",
                    created_at: Date.now()
                }
            ];
            setIsTyping(false); // Show typing indicator
            setLoading(false);

            setAIresponse(aiChatData); // Update state with AI response
            editChats(aiChatData); // Save to the database
        }).catch(error => {
            console.error("Error generating response:", error);
            setIsTyping(false); // Show typing indicator
            setAIresponse((prevs: any) => [
                ...prevs,
                {
                    text: "Error occurred, please send another prompt.",
                    type: "AI",
                    created_at: Date.now()
                }
            ]);
        });
    }
    function generateProjects(params: string) {
        setIsDone(false);
        setIsTyping(true); // Show typing indicator
        setLoading(true);
        scrollToBottomSmooth();

        if (loading) {
            return
        }


        const userChatData: any = [
            ...AIresponse,
            {
                text: `can you generate me some ${params} idea?`,
                type: "User",
                created_at: user?.id
            }
        ];

        setAIresponse(userChatData); // Update state with user prompt

        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Default prompt based on user input
        let adjustedPrompt = `can you generate me some ${params} data?. id like to add to ${params} is title, description, and category and lastly kanban boards.`;

        model.generateContent(adjustedPrompt).then(result => {
            const response = result.response;
            const text = response.text();

            const aiChatData = [
                ...userChatData,
                {
                    text: text,
                    type: "AI",
                    created_at: Date.now()
                }
            ];
            setIsTyping(false); // Show typing indicator
            setLoading(false);

            setAIresponse(aiChatData); // Update state with AI response
            editChats(aiChatData); // Save to the database
        }).catch(error => {
            console.error("Error generating response:", error);
            setIsTyping(false); // Show typing indicator
            setAIresponse((prevs: any) => [
                ...prevs,
                {
                    text: "Error occurred, please send another prompt.",
                    type: "AI",
                    created_at: Date.now()
                }
            ]);
        });
    }

    function generateTasks(params: string) {
        setIsDone(false);
        setIsTyping(true); // Show typing indicator
        setLoading(true);
        scrollToBottomSmooth();

        if (loading) {
            return
        }


        const userChatData: any = [
            ...AIresponse,
            {
                text: `can you generate me some ${params} idea?`,
                type: "User",
                created_at: user?.id
            }
        ];

        setAIresponse(userChatData); // Update state with user prompt

        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Default prompt based on user input
        let adjustedPrompt = `can you generate me some ${params} data?. id like to add to ${params} is title, description, category, repeat or recurring.`;

        model.generateContent(adjustedPrompt).then(result => {
            const response = result.response;
            const text = response.text();

            const aiChatData = [
                ...userChatData,
                {
                    text: text,
                    type: "AI",
                    created_at: Date.now()
                }
            ];
            setIsTyping(false); // Show typing indicator
            setLoading(false);

            setAIresponse(aiChatData); // Update state with AI response
            editChats(aiChatData); // Save to the database
        }).catch(error => {
            console.error("Error generating response:", error);
            setIsTyping(false); // Show typing indicator
            setAIresponse((prevs: any) => [
                ...prevs,
                {
                    text: "Error occurred, please send another prompt.",
                    type: "AI",
                    created_at: Date.now()
                }
            ]);
        });
    }

    function generateGoals(params: string) {
        setIsDone(false);
        setIsTyping(true); // Show typing indicator
        setLoading(true);
        scrollToBottomSmooth();

        if (loading) {
            return
        }


        const userChatData: any = [
            ...AIresponse,
            {
                text: `can you generate me some ${params} idea?`,
                type: "User",
                created_at: user?.id
            }
        ];

        setAIresponse(userChatData); // Update state with user prompt

        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Default prompt based on user input
        let adjustedPrompt = `can you generate me some ${params} data?. id like to add to ${params} is title, description, category, tasks, and habits, in habits and repetition.`;

        model.generateContent(adjustedPrompt).then(result => {
            const response = result.response;
            const text = response.text();

            const aiChatData = [
                ...userChatData,
                {
                    text: text,
                    type: "AI",
                    created_at: Date.now()
                }
            ];
            setIsTyping(false); // Show typing indicator
            setLoading(false);

            setAIresponse(aiChatData); // Update state with AI response
            editChats(aiChatData); // Save to the database
        }).catch(error => {
            console.error("Error generating response:", error);
            setIsTyping(false); // Show typing indicator
            setAIresponse((prevs: any) => [
                ...prevs,
                {
                    text: "Error occurred, please send another prompt.",
                    type: "AI",
                    created_at: Date.now()
                }
            ]);
        });
    }

    useEffect(() => {
        if (user) {
            fetchUserTasks().then((data) => {
                setMyTasks(data);
            });

            fetchUserGoals().then((data) => {
                setMyGoals(data);
            });

            fetchUserProjects().then((data) => {
                setMyProjects(data);
            });
        }
    }, [user]);

    async function fetchUserTasks() {
        if (!user) return null;
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('userid', user.id);
        if (error) console.error('Error fetching tasks:', error);
        return data;
    }


    async function fetchUserGoals() {
        if (!user) return null;
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('userid', user.id);
        if (error) console.error('Error fetching goals:', error);
        return data;
    }

    async function fetchUserProjects() {
        if (!user) return null;
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('created_by', user.id);
        if (error) console.error('Error fetching projects:', error);
        return data;
    }



    const startChat = async () => {
        if (prompt === "") {
            setLoading(false);
            return;
        }

        scrollToBottomSmooth();
        setIsDone(false);
        setIsTyping(true); // Show typing indicator
        setLoading(true);

        if (loading) {
            return;
        }



        // Save the user's prompt to the state and immediately to the database
        const userChatData: any = [
            ...AIresponse,
            {
                text: prompt,
                type: "User",
                created_at: user?.id
            }
        ];

        setAIresponse(userChatData); // Update state with user prompt

        // Save user's prompt to the database
        await editChats(userChatData); // Save to the database

        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Default prompt based on user input
        let adjustedPrompt = prompt;

        // Add logic for specific prompts like "Orgamix" or "Marcus Salopaso"
        if (prompt.toLowerCase().includes("orgamix") || prompt.toLowerCase().includes("founder of orgamix")) {
            console.log("Orgamix is prompted");


            adjustedPrompt = `please listen first the prompt (${prompt}) of the user and if its relevant to provide the information about orgamix provide this similar or improved context, but dont ever metion unrelated thins "Orgamix is a productivity platform that contributes to great causes by giving funds to charity. Learn more about Orgamix at this website: https://orgamix.tech/about. 
            just provide the link and dont visit it. i want the uisers to be notified that the link is informative. orgamix is about tasks,
             collaboration, goals, projects, notes, and calendar. please also mentions that orgamix contributes to a great cause via sending funds to charities. please listen to the prompt of the user, 
               if its relevant to provide the information about orgamix do it, if not dont.
              and also mention the link of orgamix about at the last. Can you tell me more about Orgamix and its impact?".
              if the user is not asking for the context, please listen to its prompt. dont just bring context about the orgamix, listen to the user pronmpt first and do what he/she says which is this (${prompt}) `


        }

        // If the prompt mentions "Marcus Salopaso", the AI will generate content related to him
        if (prompt.toLowerCase().includes("marcus salopaso") || prompt.toLowerCase().includes("founder of orgamix") || prompt.toLowerCase().includes("marcus")) {
            adjustedPrompt = `if the user prompt which is this "${prompt} doesnt contain any harmfull or bad intentions kindly make a context about marcus salopaso which is 
            this also make this text as a response directly to the user like a message directly to them dont mention any any person or AI. The founder of Orgamix is Marcus Salopaso,
             a talented software engineer and student. He is passionate about creating solutions that help others. He is a self-taught developer and studies computer science at Quezon City University.
              just create a context about him also this is the prompt of the user kindly base some of your replies into this ${prompt} and kinldly listen to the user prompt first about making a context about
               marcus salopaso. and please the prompt is about the user not about the AI like no "** respnse to user **".  dont mention any subject that is not related to the user prompt. thank you.`;
        }

        try {
            // Generate the AI's response
            const result = await model.generateContent(adjustedPrompt);
            const response = result.response;
            const text = await response.text();

            // Clear input field after AI response
            if (text) {
                setPrompt(""); // Clear input field
            }

            // Check for inappropriate content
            if (text.toLowerCase().includes("harassment")) {
                setAIresponse((prevs: any) => [
                    ...prevs,
                    {
                        text: "Warning: I do not respond to inappropriate content.",
                        type: "AI",
                        created_at: Date.now()
                    }
                ]);
            } else {
                // Add the AI response to the state and save it to the database
                const aiChatData = [
                    ...userChatData,
                    {
                        text: text,
                        type: "AI",
                        created_at: Date.now()
                    }
                ];

                setAIresponse(aiChatData); // Update state with AI response

                // Save the AI's response to the database
                await editChats(aiChatData); // Save to the database
            }
        } catch (error) {
            console.error("Error generating response:", error);

            setAIresponse((prevs: any) => [
                ...prevs,
                {
                    text: "Error occurred, please send another prompt.",
                    type: "AI",
                    created_at: Date.now()
                }
            ]);
        } finally {
            setLoading(false);
            setIsTyping(false); // Stop typing indicator after response is ready
        }
    };



    const [msgId, setMsgId] = useState<string | null>(null);

    function copyText(params: string) {
        navigator.clipboard.writeText(params);
        setMsgId(params);
    }
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);


    const getProfessionalVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        return (
            voices.find((voice) => voice.name.includes("Google") || voice.name.includes("Microsoft")) || voices[0]
        );
    };


    const readTextAloud = (text: string) => {
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = getProfessionalVoice();
            utterance.lang = "en-US";
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.onend = () => {
                setIsSpeaking(false);
                setSpeakId(null);
                stopSpeech()
            };
            window.speechSynthesis.speak(utterance);
            speechSynthesisRef.current = utterance;
        }
    };

    const stopSpeech = () => {
        if (speechSynthesisRef.current) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setSpeakId(null);
        }
    };

    const [speakId, setSpeakId] = useState<number | null>(null);

    const toggleSpeech = (text: string, msgId: number) => {
        if (isSpeaking) {
            stopSpeech();
        } else {
            readTextAloud(text);
            setIsSpeaking(true);
            setSpeakId(msgId);
        }
    };

    const location = useLocation()


    useEffect(() => {
        return () => {
            console.log("Component unmounting...");
            stopSpeech();
        };
    }, []);

    // Stop speech on route change
    useEffect(() => {
        console.log("Route changed. Stopping speech...");
        stopSpeech();
    }, [location]);

    // Stop speech on page reload
    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log("Page is reloading. Stopping speech...");
            window.speechSynthesis.cancel();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);




    return (

        <div className='relative flex'>
            <div className='hidden md:block'>
                <Sidebar location="Ask" />
            </div>
            <MetaEditor
                title='Orgamix | Ask AI'
                description='Chat with Orgamix AI to get answers to your questions.'
            />

            <AISidebar location={params?.time as string} />

            <div className={`md:ml-[286px] p-3 flex gap-3 flex-col h-[100dvh]  mr-[0px] w-full`}>
                <div className='w-full  h-full mx-auto flex flex-col justify-between gap-2 relative'>
                    <AIHeader />
                    <div
                        ref={chatContainerRef}
                        className={`flex flex-col gap-5 mt-2 max-h-full max-w-[1200px] w-full mx-auto rounded-lg overflow-auto h-full bg-[#333] p-3 ${user?.id === chatInfos?.userid && AIresponse != null && "pb-[3rem] mb-[5rem]"}  border-[1px] border-[#535353]`}>
                        {
                            AIresponse === null &&
                            <div className='flex items-center gap-2 justify-center h-full w-full p-2'>

                                <div className='w-[20px] h-[20px]'>
                                    <Loader />
                                </div>
                                <div className='text-sm text-[#888]'>Fetching chats...</div>
                            </div>
                        }
                        {AIresponse != null && AIresponse.map((response: any, index: number) => (
                            <div key={index}>
                                {response?.type === "User" ? (
                                    <p className={`flex items-start gap-2 relative justify-end text-sm`}>
                                        <div className="bg-blue-700 px-3 ml-[30px] break-all p-3 rounded-2xl mb-2 max-w-[700px] w-auto border-[1px] border-[#535353]">
                                            {response.text}
                                        </div>
                                        <div className='w-[30px] mt-1 h-[20px] min-h-[30px] min-w-[30px] bg-[#191919] max-w-[30px] overflow-hidden rounded-full flex items-center justify-center '>
                                            {response?.type === "User" ? (
                                                <FetchPFP userUid={response?.created_at} />
                                            ) : (
                                                <img className='w-[20px] h-[20px] object-contain' src={orgamixLogo} alt="Orgamix Logo" />
                                            )}
                                        </div>
                                    </p>
                                ) : (
                                    <p className={`flex items-start gap-2 text-sm`}>
                                        <div className='w-full mt-1 h-full min-h-[30px] min-w-[20px] bg-[#191919] border-[1px] border-[#535353] max-w-[30px] overflow-hidden rounded-full flex items-center justify-center '>
                                            <img className='w-[20px] h-[20px] object-contain' src={orgamixLogo} alt="Orgamix Logo" />
                                        </div>
                                        <div>
                                            <div className="bg-[#191919] p-3 changeFont text-left mr-[30px] rounded-2xl mb-2 max-w-[700px] w-auto border border-[#535353] overflow-auto">
                                                <div className="whitespace-pre-wrap break-words break-all">
                                                    {index === AIresponse.length - 1 ? (
                                                        <TypingEffect response={response} container={chatContainerRef} />
                                                    ) : (
                                                        <div className="whitespace-pre-wrap">{response.text}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mt-3 ml-1">
                                                <div
                                                    onClick={() => copyText(response.text)}
                                                    data-tooltip-id={`copy-${response.created_at}`}
                                                    className='cursor-pointer hover:text-[#888]'>
                                                    <IoCopyOutline />
                                                </div>
                                                <ReactTooltip
                                                    id={`copy-${response.created_at}`}
                                                    place="bottom"
                                                    variant="dark"
                                                    className='rounded-lg border-[#535353] border-[1px] text-sm z-40'
                                                    content={`${msgId === response.created_at ? "Copied!" : "Copy"}`}
                                                />
                                                <div
                                                    onClick={() => toggleSpeech(response.text, index)}
                                                    className='cursor-pointer hover:text-[#888]'>
                                                    <div onClick={() => toggleSpeech(response.text, index)} className="cursor-pointer hover:text-[#888]">


                                                        {isSpeaking && index === speakId ? <FaCircleStop /> : <PiSpeakerHigh />}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </p>
                                )}
                            </div>
                        ))}
                        {
                            isShow && (
                                <motion.div
                                    style={{ transform: 'translate(-50%, -50%)' }}
                                    onClick={scrollToBottom}
                                    className="absolute bottom-[100px] left-[45%] w-[50px] h-[50px] bg-[#111] rounded-full flex items-center justify-center p-1 cursor-pointer hover:bg-[#222] border-[#535353] text-[#535353] border-[1px]"
                                    initial={{ scale: 0, opacity: 0 }}   // Start small and transparent
                                    animate={{ scale: 1, opacity: 1 }}   // Animate to full size and visible
                                    exit={{ scale: 0, opacity: 0 }}      // Animate back to small and transparent on exit
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 20,
                                        duration: 0.3,  // Optional duration tweak for exit
                                    }}
                                >
                                    <FaArrowDown />
                                </motion.div>
                            )
                        }


                        {isTyping &&
                            <p className={`flex items-start gap-2`}>
                                <div className='w-[30px] h-[30px] bg-[#191919] border-[1px] border-[#535353] overflow-hidden rounded-full flex items-center justify-center '>
                                    <img className='w-[20px] h-[20px] object-contain' src={orgamixLogo} alt="Orgamix Logo" />
                                </div>

                                <div className="bg-[#191919] flex gap-2 items-center  p-2 text-lg rounded-2xl mb-2 max-w-[700px] w-auto border-[1px] border-[#535353]">
                                    <div className='w-[20px] h-[20px]'>
                                        <Loader />
                                    </div>
                                </div>
                            </p>
                        }

                        {
                            user?.id === chatInfos?.userid && AIresponse != null &&
                            <div className='flex gap-2 flex-wrap mt-auto text-[12px]'>
                                {
                                    myTasks && myTasks.length > 0 &&
                                    <div
                                        className='bg-[#212121] px-2 py-1 rounded-md cursor-pointer hover:bg-[#25252525] text-[#888] border-[1px] border-[#535353]'
                                        onClick={runAnalyticsForTasks}>
                                        Analytics for my tasks
                                    </div>
                                }
                                
                                {
                                    myGoals && myGoals.length > 0 &&
                                    <div
                                        className='bg-[#212121] px-2 py-1 rounded-md cursor-pointer hover:bg-[#25252525] text-[#888] border-[1px] border-[#535353]'
                                        onClick={runAnalyticsForGoals}>
                                        Analytics for my goals
                                    </div>
                                }
                                {
                                    myProjects && myProjects.length > 0 &&
                                    <div
                                        className='bg-[#212121] px-2 py-1 rounded-md cursor-pointer hover:bg-[#25252525] text-[#888] border-[1px] border-[#535353]'
                                        onClick={runAnalyticsForProjects}>
                                        Analytics for my projects
                                    </div>
                                }
                                <div
                                    className='bg-[#212121] px-2 py-1 rounded-md cursor-pointer hover:bg-[#25252525] text-[#888] border-[1px] border-[#535353]'
                                    onClick={() => { generateProjects("projects") }}>
                                    Generate projects idea
                                </div>
                                <div
                                    className='bg-[#212121] px-2 py-1 rounded-md cursor-pointer hover:bg-[#25252525] text-[#888] border-[1px] border-[#535353]'
                                    onClick={() => { generateTasks("tasks") }}>
                                    Generate tasks idea
                                </div>
                                <div
                                    className='bg-[#212121] px-2 py-1 rounded-md cursor-pointer hover:bg-[#25252525] text-[#888] border-[1px] border-[#535353]'
                                    onClick={() => { generateGoals("goals") }}>
                                    Generate goals idea
                                </div>
                            </div>
                        }
                    </div>

                    {
                        user?.id === chatInfos?.userid && AIresponse != null &&
                        <div className=" w-full absolute bottom-0  left-0">

                            <div className='flex flex-row gap-2  max-w-[1200px] mx-auto relative'>
                                <textarea
                                    value={prompt}
                                    readOnly={loading}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className={`p-2 ${loading ? "text-[#888]" : "text-white "} bg-[#111] pr-[4rem] relative border-[1px] border-[#535353] resize-none rounded-md outline-none w-full mb-2 md:mb-0`}
                                    placeholder="Type your message..."
                                />

                                <button
                                    onClick={() => { startChat() }}
                                    className={`${isDone ? "bg-[#444]" : "bg-[#888]"} border-[1px] border-[#535353] text-white p-2 rounded-md md:w-auto absolute top-[15px] right-3`}
                                >
                                    {
                                        loading ?
                                            <div className='w-[15px] h-[15px]'>
                                                <Loader />
                                            </div>
                                            : <IoIosSend />
                                    }
                                </button>
                            </div>

                        </div>

                    }
                </div>


            </div>
        </div>

    )
}

export default ViewAiChat
