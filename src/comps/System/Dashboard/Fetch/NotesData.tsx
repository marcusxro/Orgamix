import React, { useEffect, useState } from 'react'
import { supabase } from '../../../../supabase/supabaseClient';
import IsLoggedIn from '../../../../firebase/IsLoggedIn';
import { Carousel, Progress } from "flowbite-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { FaArrowAltCircleRight } from "react-icons/fa";
import Loader from '../../../Loader';
import { useNavigate } from 'react-router-dom';
import useStore from '../../../../Zustand/UseStore';

interface fetchedDataType {
    id: number;
    title: string;
    notes: string;
    category: string;
    userid: string;
    createdat: string
}

const fontOptions = [
    'sans-serif',
    'serif',
    'monospace',
];

// Modules for the Quill editor
const combinedModules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: fontOptions }], // Font options with custom fonts
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" }
        ],
        ["link"],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["clean"]
    ],

};

const leftControl = <div className="text-2xl text-black"><FaArrowAltCircleLeft /></div>
const rightControl = <div className="text-2xl text-black"><FaArrowAltCircleRight /></div>

const NotesData: React.FC = () => {
    const [user] = IsLoggedIn()
    const [progress, setProgressNum] = React.useState(0);

    const [fetchedData, setFetchedData] = useState<fetchedDataType[] | null>(null)

    useEffect(() => {
        if (user) {
            getNotes()
        }
    }, [user])

    async function getNotes() {
        try {
            const { data, error } = await supabase.from("notes")
                .select("*")
                .eq('userid', user?.uid)

            if (error) {
                console.error(error)
            } else {
                setFetchedData(data)

            }
        }
        catch (err) {
            console.log(err)
        }
    }

    const handleSlideChange = (index: number) => {
        setProgressNum(((index + 1) / (fetchedData != null && fetchedData?.length || 0)) * 100);
    };

    const nav = useNavigate()
    const {mobileShow, setMobileShow}: any = useStore()

    return (
        <div className='flex flex-col overflow-auto justify-between h-full'>
            <div className='font-bold'>
                Notes
            </div>

            {
                fetchedData && fetchedData.length > 0 ? (
                    <>
                        <Carousel pauseOnHover
                            className="w-full h-[90%]   mx-auto  custom-carousel  aspect-square mt-2"
                            indicators={false}  // This removes the dots
                            leftControl={leftControl} // Add left arrow control
                            onSlideChange={handleSlideChange}
                            rightControl={rightControl} // Add right arrow control
                        >
                            {
                                fetchedData && fetchedData?.map((note, index) => (
                                    <div
                                        key={index}
                                        className='h-full w-full'>
                                        <ReactQuill
                                            id={index.toString()}
                                            theme='snow'
                                            value={note?.notes}
                                            className='w-full h-full rounded-lg break-all text-black bg-[#e7e7e7] overflow-auto border-[#535353] border-[1px]'
                                            modules={combinedModules}
                                        />
                                    </div>
                                ))
                            }

                        </Carousel >
                        <Progress
                            color='green'
                            className='w-full bg-red-700 mx-auto'
                            progress={progress} />
                    </>
                )
                    : fetchedData !== null && (
                        <div className='text-center flex items-center justify-center text-[#888] h-full'>
                            <div 
                            onClick={() => {
                                setMobileShow(true)

                                nav('/user/notes');
                            }}
                            className='bg-[#111] px-4 py-2 rounded-lg cursor-pointer hover:bg-[#191919] border-[1px] border-[#535353]'>
                                Write your first note! 📝
                            </div>
                        </div>
                    )
            }
            {
                fetchedData === null && (
                    <div className='h-full flex items-center justify-center'>

                        <div className='w-[20px] h-[20px]'>
                            <Loader />
                        </div>
                    </div>
                )
            }
        </div>

    )
}

export default NotesData
