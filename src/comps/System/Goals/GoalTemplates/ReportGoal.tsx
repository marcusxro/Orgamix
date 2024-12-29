import React, { useState } from 'react'
import { supabase } from '../../../Utils/supabase/supabaseClient';
import IsLoggedIn from '../../../Utils/IsLoggedIn';
import Loader from '../../../Svg/Loader';
import { motion, AnimatePresence } from 'framer-motion';




interface subtaskType {
    is_done: boolean;
    startedAt: string;
    subGoal: string
}
interface habitsType {
    repeat: string;
    habit: string;
}

interface dataType {
    userid: string;
    id: number;
    title: string;
    category: string;
    is_done: boolean;
    created_at: number;
    description: string;
    sub_tasks: subtaskType[];
    habit: habitsType[];
    deadline: string;
    authorUid: string;
    download_count: number
}

interface contentType {
    uidtoreport: string;
    category: string;
    description: string;
    is_done: boolean;
    created_at: number;
    uid: string;
    content: dataType,
    authorUid: string
}
interface propsType {
    closer: React.Dispatch<React.SetStateAction<number | null>>;
    contentObj: contentType
}


const ReportGoal: React.FC<propsType> = ({ closer, contentObj }) => {
    const [selectedReason, setSelectedReason] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [isDoneReport, setIsDoneReport] = useState<boolean>(false)
    const [user]:any = IsLoggedIn()
    const [isExiting, setIsExiting] = useState(false);



    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            closer(null);
            setIsExiting(false);
        }, 300);
    };

    async function reportUser() {
        setLoading(true)

        if (loading) return

        if (!contentObj) {
            setLoading(false)
            return
        }
        if (selectedReason === "") {
            setLoading(false)
            return
        }
        if (!user) {
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.from('reports').insert({
                uidtoreport: contentObj?.authorUid,
                description: description,
                content: contentObj,
                category: selectedReason,
                is_done: false,
                created_at: Date.now(),
                uid: user?.id
            });

            if (error) {
                console.error('Error inserting data:', error);
                setLoading(false)
            } else {
                setSelectedReason("")
                setDescription("")
                console.log("REPORTED!")
                setLoading(false)
                setIsDoneReport(true)
            }
        } catch (err) {
            setLoading(false)
            console.log(err);
        }
    }



    return (
        <AnimatePresence>
            {
                !isExiting &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className='ml-auto positioners flex items-center p-3 justify-center relative w-full h-full'
                    onClick={handleOutsideClick}>
                     <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        onClick={(e) => { e.stopPropagation() }}
                        className={`w-full max-w-[540px] bg-[#313131]  z-[5000] relative
                        rounded-lg p-3 h-full ${isDoneReport ? 'max-h-[150px]' : 'max-h-[400px]'} border-[#535353] border-[1px] 
                        justify-between flex flex-col`}>

                        <div className='flex  flex-col gap-2'>
                            {
                                isDoneReport ?
                                    <div>
                                        <div className='text-xl font-bold'>Thank you!</div>
                                        <p className='text-sm text-[#888]'>Your report will be reviewed by our team. Thank you for helping us keep the platform safe!</p>
                                    </div>
                                    :
                                    <>

                                        <div className='flex flex-col gap-1 mb-2'>
                                            <div className='text-xl font-bold'>Report</div>
                                            <p className='text-sm text-[#888]'>Please select a reason for reporting this goal and provide any additional information to help us review your report.</p>
                                        </div>



                                        <div className='flex flex-col gap-1'>
                                            <label className='px-1'>Select a reason</label>
                                            <select
                                                value={selectedReason}
                                                onChange={(e) => { setSelectedReason(e.target.value) }}
                                                className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full max-w-[300px]  text-[#888]'
                                            >
                                                <option value="">Select Reason</option>
                                                <option value="inappropriate">Inappropriate Content</option>
                                                <option value="spam">Spam or Misleading Content</option>
                                                <option value="false_info">False or Misleading Information</option>
                                                <option value="harassment">Harassment, Bullying, or Abusive Behavior</option>
                                                <option value="hate_speech">Hate Speech or Offensive Language</option>
                                                <option value="self_harm">Promotion of Self-harm or Dangerous Activities</option>
                                                <option value="violence">Violence or Threatening Behavior</option>
                                                <option value="privacy_violation">Privacy Violation or Personal Information</option>
                                                <option value="copyright">Copyright or Intellectual Property Violation</option>
                                                <option value="sexual_content">Sexual Content or Harassment</option>
                                                <option value="fraud">Fraud or Phishing</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div className='flex flex-col gap-1 w-full'>
                                            <label className='px-1'>Additional Details (Optional)</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => { setDescription(e.target.value) }}
                                                maxLength={200}
                                                className='p-3 rounded-lg bg-[#111111] outline-none h-full max-h-[400px] resize-none border-[#535353] border-[1px] w-full'
                                                placeholder="Describe why you are reporting this goal."

                                            ></textarea>
                                        </div>
                                    </>
                            }
                        </div>

                        <div className='w-full max-h-[40px] h-full rounded-lg border-[#535353] border-[1px] flex overflow-hidden'>
                            {
                                isDoneReport ?
                                    <div onClick={() => { !loading && handleOutsideClick() }}
                                        className='p-2 bg-[#111111] border-r-[#535353] text-center border-r-[1px]  w-full cursor-pointer hover:bg-[#222222] '>
                                        Close
                                    </div>
                                    :
                                    <>
                                        <div
                                            onClick={() => { !loading && handleOutsideClick()  }}
                                            className='p-2 bg-[#111111] border-r-[#535353] text-center border-r-[1px]  w-full cursor-pointer hover:bg-[#222222] '>Cancel</div>
                                        <div
                                            onClick={() => { reportUser() }}
                                            className={`${selectedReason ? "bg-[#111111]" : " bg-[#535353]"} flex items-center justify-center p-2 border-r-[#535353] text-center border-r-[1px]  w-full cursor-pointer hover:bg-[#222222]`}>
                                            {
                                                loading ?
                                                    <div className='w-[20px] h-[20px]'>
                                                        <Loader />
                                                    </div>
                                                    :
                                                    "Submit"
                                            }
                                        </div>
                                    </>
                            }
                        </div>

                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default ReportGoal
