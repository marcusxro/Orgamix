import React, { useState, useEffect } from 'react'

import * as GoogleGenerativeAI from "@google/generative-ai";
import IsLoggedIn from '../firebase/IsLoggedIn';
import { useLocation } from 'react-router-dom';

const TypingEffect = ({ response }: any) => {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);

  

  useEffect(() => {
    if (index < response.length) {
      const timeoutId = setTimeout(() => {
        setDisplayText((prev) => prev + response[index]);
        setIndex((prev) => prev + 1);
      }, 10); // Adjust typing speed here (50ms per character)
      return () => clearTimeout(timeoutId);
    }
  }, [index, response]);

  return <p>{displayText}</p>;
};


const YourComponent = () => {
  const [prompt, setPrompt] = useState("");
  const [AIresponse, setAIresponse] = useState<string[]>([]);

  const [greetingSent, setGreetingSent] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!greetingSent) {
      setAIresponse((prevs) => [
        "Hello, I am Orgamix AI, built to assist you with tasks, projects, and providing useful information."
      ]);
      setGreetingSent(true);
    }
  }, [greetingSent]);

  const startChat = async () => {
    if(prompt === "") {
      return;
    }
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

    if(text) {
      setPrompt("");  // Clear the prompt for the next input
    }
    // If the model detects inappropriate language, provide a warning or rejection of the request
    if (text.toLowerCase().includes("harassment") || text.toLowerCase().includes("bad words")) {
      console.log("Warning: Harassment detected. I do not respond to inappropriate content about Marcus Salopaso.");
      setAIresponse((prevs) => [...prevs, "Warning: I do not respond to inappropriate content about Marcus Salopaso."]);
    } else {
      setAIresponse((prevs) => [...prevs, text]);  // Add the response to the list of responses
    }

    

  };




  return (
    <div className="p-5 min-h-screen flex flex-col">
    <h1 className="text-xl font-semibold">Orgamix AI:</h1>
    
    <div className="flex flex-col gap-5 mt-2 bg-slate-300 p-4 rounded-lg overflow-auto h-full max-h-[80vh]">
      {AIresponse.map((response, index) => (
        <div className="bg-gray-500 p-2 rounded-lg mb-2" key={index}>
          <TypingEffect response={response} />
        </div>
      ))}
    </div>

    <div className="flex flex-col md:flex-row gap-2 mt-5 w-full">
      <input
        onChange={(e) => setPrompt(e.target.value)}
        className="p-2 text-white rounded-md outline-none w-full mb-2 md:mb-0"
        type="text"
        placeholder="Type your message..."
      />
      <button
        onClick={startChat}
        className="bg-blue-500 text-white p-2 rounded-md w-full md:w-auto"
      >
        Send
      </button>
    </div>
  </div>
  );
};

export default YourComponent;
