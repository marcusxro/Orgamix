import React from 'react';
import { motion } from 'framer-motion';
import { Carousel, Progress } from "flowbite-react";
import sidebarImage from '../../../assets/Tutorial/SidebarImage.png';
import modalImage from '../../../assets/Tutorial/Modal.png';
import actionsOne from '../../../assets/Tutorial/ActionsOne.png';
import Deadlines from '../../../assets/Tutorial/Deadlines.png';
import SetttingsImg from '../../../assets/Tutorial/Settings.png';
import useStore from '../../../Zustand/UseStore';
import { supabase } from '../../../supabase/supabaseClient';
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import Loader from '../../Loader';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { FaArrowAltCircleRight } from "react-icons/fa";

const leftControl = <div className="text-2xl text-[#888]"><FaArrowAltCircleLeft /></div>
const rightControl = <div className="text-2xl text-[#888]"><FaArrowAltCircleRight /></div>

const Tutorial: React.FC = () => {
    const [progress, setProgressNum] = React.useState(0);
    const totalSlides = 5; // Adjust based on your carousel slides count
    const [user] = IsLoggedIn()
    const [loading, setLoading] = React.useState(false);
    // Update progress based on the active slide index
    const handleSlideChange = (index: number) => {
        setProgressNum(((index + 1) / totalSlides) * 100);
    };

    const { isProgress, setProgress }: any = useStore()



    async function doneTutorial() {
        setLoading(true)

        if (loading) return
        try {
            const { error } = await supabase
                .from('accounts')
                .update({ is_done: true })
                .eq('userid', user?.uid)

            if (error) {
                console.log(error)
                setLoading(false)
            }
            else {
                setProgress("Completed")
                setLoading(false)
                console.log("------tutorial completed------")
            }

        }
        catch (error) {
            console.log(error)
            setLoading(false)
        }
    }
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="ml-auto positioners flex items-center p-3 justify-center w-full h-full"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                className="w-[550px] h-full max-h-[800px] bg-[#313131] z-[5000] p-3 rounded-lg overflow-auto border-[#535353] border-[1px] flex flex-col justify-between"
            >
                <div className="overflow-auto h-full flex gap-2 flex-col">
                    <div className="mb-4">
                        <div className="font-bold">Quick Start Guide</div>
                        <p className="text-sm text-[#888]">
                            Discover the main features and get familiar with the interface. Swipe through the steps below to begin!
                        </p>
                    </div>

                    <div className='text-sm'>
                        {
                            progress === 20 &&
                            <div className=' text-[#888] w-full max-w-[500px]  mx-auto'>
                                Kindly look for the left side to navigate through the app.
                            </div>
                        }
                        {
                            progress === 40 &&
                            <div className=' text-[#888] w-full max-w-[500px]  mx-auto'>
                                In the right side, you'll always find the add modal to create new items.
                            </div>
                        }
                        {
                            progress === 60 &&
                            <div className=' text-[#888] w-full max-w-[500px]  mx-auto'>
                                In some page, you'll find the actions right in the items itself.
                            </div>
                        }
                        {
                            progress === 80 &&
                            <div className=' text-[#888] w-full max-w-[500px]  mx-auto'>
                                In this page, you can see your upcoming deadlines.
                            </div>
                        }
                        {
                            progress === 100 &&
                            <div className=' text-[#888] w-full max-w-[500px]  mx-auto'>
                                In settings, you can customize your account and change your password.
                            </div>
                        }
                    </div>
                    {/* Progress Bar */}

                    <Progress
                        className='w-full max-w-[500px] mx-auto'
                        progress={progress} />

                    {/* Carousel */}
                    <Carousel
                        pauseOnHover
                        className="w-full h-full max-h-[520px]  mx-auto max-w-[500px] custom-carousel  aspect-square mt-2"
                        onSlideChange={handleSlideChange}
                        leftControl={leftControl}// Add left arrow control
                        rightControl={rightControl} // Add right arrow control
                    >
                        <div className="h-full w-full">
                            <img
                                className="w-full h-full object-cover object-left"
                                src={sidebarImage}
                                alt="Sidebar Tutorial"
                            />
                        </div>

                        <div className="h-full w-full ">
                            <img
                                className="w-full h-full object-cover object-right-top my-auto"
                                src={modalImage}
                                alt="Sidebar Tutorial"
                            />
                        </div>
                        <div className="h-full w-full">
                            <img
                                className="w-full h-full object-cover object-left-top my-auto"
                                src={actionsOne}
                                alt="Sidebar Tutorial"
                            />
                        </div>
                        <div className="h-full w-full">
                            <img
                                className="w-full h-full object-cover object-left-top my-auto"
                                src={Deadlines}
                                alt="Sidebar Tutorial"
                            />
                        </div>
                        <div className="h-full w-full">
                            <img
                                className="w-full h-full object-cover object-left-top my-auto"
                                src={SetttingsImg}
                                alt="Sidebar Tutorial"
                            />
                        </div>
                    </Carousel>

                </div>


                {/* Got it Button */}
                <div className="flex items-center justify-end mt-4">
                    <div
                        onClick={() => { doneTutorial() }}
                        className='px-5 py-2 bg-[#111] cursor-pointer hover:bg-[#222] rounded-lg border-[#535353] border-[1px] '>
                        {
                            loading ?
                                <div className='w-[20px] h-[20px]'>
                                    <Loader />
                                </div>
                                : 
                                "Got it!"
                        }
                    </div>
                </div>
            </motion.div>


        </motion.div>
    );
};

export default Tutorial;
