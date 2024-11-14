
import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../../comps/Sidebar'
import orgamixLogo from '../../assets/Orgamix.png'
import * as GoogleGenerativeAI from "@google/generative-ai";
import FetchPFP from '../../comps/FetchPFP';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import Loader from '../../comps/Loader';
import { IoIosSend } from "react-icons/io";
import useStore from '../../Zustand/UseStore';





const TypingEffect = ({ response }: any) => {
    const [displayText, setDisplayText] = useState('');
    const [index, setIndex] = useState(0);
    const [user] = IsLoggedIn(); // Assuming you have an IsLoggedIn hook for fetching user info
    const {setIsDone} :any = useStore()

    useEffect(() => {
        if (response?.text) {
            if (response?.type === "User") {
                // For User's response, just display the full text immediately
                setDisplayText(response.text); // No typing effect
            } else {
                // For AI's response, apply typing effect
                // For AI's response, apply typing effect
                if (index < response.text.length) {
                    const timeoutId = setTimeout(() => {
                        setDisplayText((prev) => prev + response.text[index]);
                        setIndex((prev) => prev + 1); // Move forward through the string for AI
                    }, 10); // Adjust typing speed (100ms per character)
                    return () => clearTimeout(timeoutId);
                } else {
                    setIsDone(true); // Once typing is finished, mark it as done
                }

            }
        }
    }, [index, response?.text]); // Depend on response.text directly

    return (

        <>
            {
                response?.type === "User" ?
                    <p className={`flex items-start gap-2 relative justify-end`}>
                        <div className="bg-[#222] break-all p-3 text-md rounded-lg mb-2 max-w-[700px] w-auto border-[1px] border-[#535353]">
                            {displayText}
                        </div>
                        <div className='w-full mt-1 h-full max-h-[30px] max-w-[30px] overflow-hidden rounded-full flex items-center justify-center '>
                            {response?.type === "User" ? (
                                <FetchPFP userUid={user?.uid} />
                            ) : (
                                <img className='w-[20px] h-[20px] object-contain' src={orgamixLogo} alt="Orgamix Logo" />
                            )}
                        </div>


                    </p>
                    :
                    <p className={`flex items-start gap-2`}>
                        <div className='w-full mt-1 h-full max-h-[30px] max-w-[30px] overflow-hidden rounded-full flex items-center justify-center '>
                            {response?.type === "User" ? (
                                <FetchPFP userUid={user?.uid} />
                            ) : (
                                <img className='w-[20px] h-[20px] object-contain' src={orgamixLogo} alt="Orgamix Logo" />
                            )}
                        </div>

                        <div className="bg-[#222] p-3 text-md rounded-lg mb-2 max-w-[700px] w-auto border-[1px] border-[#535353]">
                            {displayText}
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
    const {isDone, setIsDone} :any = useStore()

    const greetingSent = useRef(false);

    useEffect(() => {
        if (!greetingSent.current) {
            setAIresponse((prevs) => [
                ...prevs,
                { text: "Hello, I am Orgamix AI, built to assist you with tasks, projects, and providing useful information.", type: "AI" }
            ]);
            greetingSent.current = true; // Mark as sent
        }
    }, []);

    const startChat = async () => {
        setIsDone(false);
      
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
            adjustedPrompt = `Orgamix is a productivity platform that contributes to great causes by giving funds to charity. Learn more about Orgamix at this website: https://orgamix.vercel.app/about. just provide the link and dont visit it. i want the uisers to be notified that the link is informative. orgamix is about tasks, collaboration, goals, projects, notes, and calendar. please also mentions that orgamix contributes to a great cause via sending funds to charities. and also mention the link of orgamix about at the last. Can you tell me more about Orgamix and its impact?`;
        }

        // If the prompt mentions "Marcus Salopaso", the AI will generate content related to him
        if (prompt.toLowerCase().includes("marcus salopaso") || prompt.toLowerCase().includes("founder of orgamix") || prompt.toLowerCase().includes("marcus")) {
            adjustedPrompt = `if the user promt which is this "${prompt} doesnt contain any harmfull or bad intentions kindly make a context about marcus salopaso which is this also make this text as a response directly to the user like a message directly to them dont mention any any person or AI. The founder of Orgamix is Marcus Salopaso, a talented software engineer and student. He is passionate about creating solutions that help others. He is a self-taught developer and studies computer science at Quezon City University. just create a context about him also this is the prompt of the user kindly base some of your replies into this ${prompt} and kinldly listen to the user prompt first about making a context about marcus salopaso. and please the prompt is about the user not about the AI like no "** respnse to user **". dont mention any subject that is not related to the user prompt. thank you.`;
        }

        // Call the API with the adjusted prompt to generate content
        const result = await model.generateContent(adjustedPrompt);
        console.log(result);
        const response = result.response;
        const text = await response.text(); // Await the text() function to extract the content
        console.log(text);

        if (text) {
            setPrompt("");  // Clear the prompt for the next input
        }
        // If the model detects inappropriate language, provide a warning or rejection of the request
        if (text.toLowerCase().includes("harassment") || text.toLowerCase().includes("bad words")) {
            console.log("Warning: Harassment detected. I do not respond to inappropriate content about Marcus Salopaso.");
            setAIresponse((prevs) => [...prevs, "Warning: I do not respond to inappropriate content about Marcus Salopaso."]);
        } else {
            setAIresponse((prevs) => [...prevs, {
                text: text,
                type: "AI"

            }]);  // Add the response to the list of responses
        }


        setLoading(false);
        if (!loading) {
            setPrompt("");
        }
    };



    return (
        <div className='relative'>
            <Sidebar location="Ask" />
            <div className={`ml-[86px] p-3 flex gap-3 flex-col h-[100dvh]  mr-[0px]`}>
                <div className='w-full max-w-[1200px] h-full mx-auto flex flex-col justify-between gap-2'>

                    <div className="flex flex-col gap-5 mt-2 rounded-lg overflow-auto h-full max-h-[85vh] ">
                        {AIresponse.map((response, index) => (
                            <div key={index}>
                                <TypingEffect response={response} />
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-row gap-2 mt-5 w-full relative">
          
                        <textarea
                            value={prompt}
                            readOnly={loading}
                            onChange={(e) => setPrompt(e.target.value)}
                            className={`p-2 ${loading ? "text-[#888]" : "text-white "} pr-[4rem] relative border-[1px] border-[#535353] resize-none rounded-md outline-none w-full mb-2 md:mb-0`}
                            placeholder="Type your message..."
                        />
                        <button
                            onClick={() => {isDone && startChat()}}
                            className={`${isDone ? "bg-[#444]" : "bg-[#888]"} text-white p-2 rounded-md md:w-auto absolute top-[15px] right-3`}
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
