
import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../../comps/Sidebar'
import orgamixLogo from '../../assets/Orgamix.png'
import * as GoogleGenerativeAI from "@google/generative-ai";
import FetchPFP from '../../comps/FetchPFP';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import Loader from '../../comps/Loader';
import { IoIosSend } from "react-icons/io";
import useStore from '../../Zustand/UseStore';
import { FaArrowDown } from "react-icons/fa6";
import { motion } from 'framer-motion'
import { IoCopyOutline } from "react-icons/io5";
import { PiSpeakerHigh } from "react-icons/pi";
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { FaCircleStop } from "react-icons/fa6";



const TypingEffect = ({ response, container }: any) => {
    const [displayText, setDisplayText] = useState('');
    const [index, setIndex] = useState(0);
    const [user] = IsLoggedIn(); // Assuming you have an IsLoggedIn hook for fetching user info
    const { isDone, setIsDone }: any = useStore();
    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const prevScrollTop = useRef(0); // To track previous scroll position
    const [isBottomReached, setIsBottomReached] = useState(false);
    const [typingDone, setTypingDone] = useState<boolean>(false); // Track if typing is done for the current response


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
                            scrollToBottom()
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

    const isCode = (text: string) => {
        // Check for common code patterns and keywords
        const codePatterns = [
            /<.*?>/, // HTML tags
            /\b(function|const|let|var|class|import|export|return|if|else|for|while|switch|case|break|continue|try|catch|finally|throw|new|this|super|extends|constructor|static|get|set|async|await|yield|typeof|instanceof|void|delete|in|of)\b/, // Common JavaScript keywords
            /=>/, // Arrow functions
            /\/\*[\s\S]*?\*\/|\/\/.*/, // Comments
            /['"`][^'"`]*['"`]/, // Strings
            /\{[^}]*\}/, // Object literals or blocks
            /\[[^\]]*\]/, // Array literals
            /\([^)]*\)/, // Function parameters or expressions
            /;$/, // Semicolons at the end of lines
        ];

        return codePatterns.some(pattern => pattern.test(text));
    };

    const [msgId, setMsgId] = useState<string | null>(null);

    function copyText(params: string) {
        navigator.clipboard.writeText(displayText);
        setMsgId(params);

    }

    const [prevCreatedAt, setPrevCreatedAt] = useState(response.created_at);
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);




    const getProfessionalVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        return voices.find(voice => voice.name.includes("Google") || voice.name.includes("Microsoft")) || voices[0];
    };

    // Function to read the text aloud with a professional-sounding voice
    const readTextAloud = (text: string) => {
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            const voice = getProfessionalVoice();
            utterance.voice = voice;
            utterance.lang = 'en-US'; // Set the language
            utterance.pitch = 0.9; // Slightly lower pitch for a formal tone
            utterance.rate = 0.9;  // Slower speaking rate
            window.speechSynthesis.speak(utterance);
            speechSynthesisRef.current = utterance; // Keep track of the utterance for stopping later
        } else {
            console.error("SpeechSynthesis is not supported in this browser.");
        }
    };

    // Function to stop the current speech
    const stopSpeech = () => {
        if (speechSynthesisRef.current) {
            window.speechSynthesis.cancel(); // Stop the current speech
            setIsSpeaking(false);
        }
    };

    // Trigger voice reading when typing is done and when a new response is received
    useEffect(() => {
        if (typingDone && !isSpeaking && !isUserScrolling) {
            readTextAloud(displayText);
            setIsSpeaking(true); 
        }
    }, [typingDone, displayText, isSpeaking, isUserScrolling]);
    

    // Listen for response updates based on created_at to handle new messages
    useEffect(() => {
        if (response?.created_at !== prevCreatedAt) {
            stopSpeech(); // Stop speech if a new message arrives
            setPrevCreatedAt(response.created_at); // Update the previous message timestamp
            setDisplayText(''); // Clear the previous message's text (if needed)
            setIndex(0); // Reset typing effect
            setTypingDone(false); // Reset typing completion status
            setIsSpeaking(false); // Reset speaking status
        }
    }, [response, prevCreatedAt]);

    // Toggle speech on click (start/stop)
    const toggleSpeech = (text: string) => {
        if (isSpeaking) {
            stopSpeech(); // Stop speech
        } else {
            readTextAloud(text); // Start speech
            setIsSpeaking(true);
        }
    };
    


    return (

        <>
            {
                response?.type === "User" ?
                    <p className={`flex items-start gap-2 relative justify-end text-sm`}>
                        <div className="bg-[#191919] px-3 break-all p-2 rounded-lg mb-2 max-w-[700px] w-auto border-[1px] border-[#535353]">
                            {displayText}
                        </div>
                        <div className='w-[30px] mt-1 h-[30px] min-h-[30px] min-w-[30px] bg-[#191919] max-w-[30px] overflow-hidden rounded-full flex items-center justify-center '>
                            {response?.type === "User" ? (
                                <FetchPFP userUid={user?.uid} />
                            ) : (
                                <img className='w-[20px] h-[20px] object-contain' src={orgamixLogo} alt="Orgamix Logo" />
                            )}
                        </div>


                    </p>
                    :
                    <p className={`flex items-start gap-2 text-sm`}>
                        <div className='w-full mt-1 h-full min-h-[30px] min-w-[30px] bg-[#191919] border-[1px] border-[#535353] max-w-[30px] overflow-hidden rounded-full flex items-center justify-center '>
                            <img className='w-[20px] h-[20px] object-contain' src={orgamixLogo} alt="Orgamix Logo" />
                        </div>
                        <div>
                            <div className="bg-[#191919] p-2 changeFont text-left rounded-lg mb-2 max-w-[700px] w-auto border border-[#535353] overflow-auto">

                                {
                                    // If the displayText contains code, render it as code
                                    isCode(displayText) ? (
                                        <pre className="whitespace-pre-wrap sans isCode p-2 rounded-lg text-green-500 break-words">
                                            <code>{displayText}</code>
                                        </pre>
                                    ) : (
                                        // Otherwise, render it as normal text
                                        <pre className="whitespace-pre-wrap  px-3">
                                            {displayText}
                                        </pre>
                                    )
                                }

                            </div>
                            {typingDone && (
                                <div className="flex gap-3 mt-3 ml-1">
                                    <div
                                        onClick={() => copyText(response.created_at)}
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
                                        onClick={() => toggleSpeech(displayText)}
                                        className='cursor-pointer hover:text-[#888]'>
                                        {
                                            isSpeaking ? <PiSpeakerHigh /> : <FaCircleStop />
                                        }

                                    </div>
                                </div>
                            )}

                        </div>

                    </p>
            }
        </>
    );
};


const ArtificialIntelligence: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [AIresponse, setAIresponse] = useState<any[]>([]);
    const { isDone, setIsDone }: any = useStore()
    const [isTyping, setIsTyping] = useState(false); // State to track if AI is typing
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isShow, setIsShow] = useState<boolean>(false)
    const greetingSent = useRef(false);
    const [isUserScrolling, setIsUserScrolling] = useState(false);

    const scrollToBottom = () => {

        if (chatContainerRef.current) {
            console.log("clicked!")
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    };


    const scrollToBottomSmooth = () => {

        if (chatContainerRef.current && !isUserScrolling) {
            console.log("clicked!")
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




    useEffect(() => {
        if (!greetingSent.current) {
            setAIresponse((prevs) => [
                ...prevs,
                {
                    text: "Hello, I am Orgamix AI, built to assist you with tasks, projects, and providing useful information.",
                    type: "AI",
                    created_at: Date.now()
                }
            ]);
            greetingSent.current = true; // Mark as sent
        }
    }, []);

    const startChat = async () => {
        scrollToBottomSmooth()
        setIsDone(false);
        setIsTyping(true); // Show typing indicator
        setLoading(true);
        if (loading) {
            return
        }
        if (prompt === "") {
            setLoading(false);
            return;
        }

        setAIresponse((prevs) => [...prevs, {
            text: prompt,
            type: "User"

        }]);

        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Default prompt based on user input
        let adjustedPrompt = prompt;

        // If the prompt mentions "Orgamix" or "founder of Orgamix", include additional details about Orgamix
        if (prompt.toLowerCase().includes("orgamix") || prompt.toLowerCase().includes("founder of orgamix")) {
            console.log("Orgamix is prompted");


            adjustedPrompt = `please listen first the prompt (${prompt}) of the user and if its relevant to provide the information about orgamix provide this similar or improved context, but dont ever metion unrelated thins "Orgamix is a productivity platform that contributes to great causes by giving funds to charity. Learn more about Orgamix at this website: https://orgamix.vercel.app/about. 
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

        // Call the API with the adjusted prompt to generate content
        try {
            const result = await model.generateContent(adjustedPrompt);
            const response = result.response;
            const text = await response.text();

            if (text) {
                setPrompt(""); // Clear input field
            }

            if (text.toLowerCase().includes("harassment")) {
                setAIresponse((prevs) => [
                    ...prevs,
                    {
                        text: "Warning: I do not respond to inappropriate content.",
                        type: "AI",
                    },
                ]);
            } else {
                setAIresponse((prevs) => [
                    ...prevs,
                    {
                        text,
                        type: "AI",
                    },
                ]);
            }
        } catch (error) {
            console.error("Error generating response:", error);

            setAIresponse((prevs) => [
                ...prevs,
                {
                    text: "Error occured, please send other prompt.",
                    type: "AI",
                    created_at: Date.now()
                },
            ])

        } finally {
            setLoading(false);
            setIsTyping(false); // Stop typing indicator after response is ready
        }
    };



    return (
        <div className='relative'>
            <div className='hidden md:block'>

                <Sidebar location="Ask" />
            </div>

            <div className={`md:ml-[86px] p-3 flex gap-3 flex-col h-[100dvh]  mr-[0px]`}>
                <div className='w-full max-w-[1200px] h-full mx-auto flex flex-col justify-between gap-2 relative'>
                    <div
                        ref={chatContainerRef}
                        className="flex flex-col gap-5 mt-2 rounded-lg overflow-auto h-full pb-[3rem] mb-[4.2rem]">
                        {AIresponse.map((response, index) => (
                            <div key={index}>
                                <TypingEffect response={response} container={chatContainerRef} setAIresponse={setAIresponse} />
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

                                <div className="bg-[#333] flex gap-2 items-center  p-2 text-lg rounded-lg mb-2 max-w-[700px] w-auto border-[1px] border-[#535353]">
                                    <div className='w-[20px] h-[20px]'>
                                        <Loader />
                                    </div>
                                </div>
                            </p>
                        }

                    </div>

                    <div className="flex flex-row gap-2 w-full absolute bottom-0 left-0">
                        <textarea
                            value={prompt}
                            readOnly={loading}
                            onChange={(e) => setPrompt(e.target.value)}
                            className={`p-2 ${loading ? "text-[#888]" : "text-white "} bg-[#111] pr-[4rem] relative border-[1px] border-[#535353] resize-none rounded-md outline-none w-full mb-2 md:mb-0`}
                            placeholder="Type your message..."
                        />
                        <button
                            onClick={() => { isDone && startChat() }}
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


            </div>
        </div>
    )
}

export default ArtificialIntelligence
