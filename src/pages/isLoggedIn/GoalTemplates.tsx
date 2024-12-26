import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoChevronBackOutline } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import Marquee from 'react-fast-marquee'
import { MdPublish } from "react-icons/md";
import CreateGoals from '../../comps/System/CreateGoals';
import ChooseMethod from '../../comps/System/ChooseMethod';
import useStore from '../../Zustand/UseStore';
import ImportGoals from '../../comps/System/ImportGoals';
import UploadImport from '../../comps/System/UploadImport';
import { supabase } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../comps/Utils/IsLoggedIn';
import moment from 'moment';
import Loader from '../../comps/Loader';
import { BiCategory } from "react-icons/bi";
import { FaEllipsisH } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";
import GetAuthor from '../../comps/System/GetAuthor';
import ViewTemplate from '../../comps/System/ViewTemplate';
import ReportGoal from '../../comps/System/ReportGoal';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../../comps/Footer';
import MetaEditor from '../../comps/MetaHeader/MetaEditor';
import FetchPFP from '../../comps/FetchPFP';


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


const GoalTemplates: React.FC = () => {
    const nav = useNavigate()
    const [isOpenCreate, setIsOpenCreate] = useState<boolean>(false)
    const [goalListener, setGoalListener] = useState<boolean>(false)
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [findTemplate, setFindTemplate] = useState<string>("")
    const { showCreate, setShowCreate, templateID, setTemplateID }: any = useStore()
    const [searchVal, setSearchVal] = useState<string>("")
    const [originalData, setOriginalData] = useState<dataType[] | null>(null); // To store unfiltered data
    const [isReport, setIsReport] = useState<number | null>(null)
    const [goalToReport, setGoalToReport] = useState<any>(null);


    const [user]:any = IsLoggedIn()

    useEffect(() => {
        if (user) {
            fetchGoalsByID()

            const subscription = supabase
                .channel('public:templates')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'templates' }, (payload) => {
             
                    handleRealtimeEvent(payload);
                })
                .subscribe();
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [goalListener, user, findTemplate])

    useEffect(() => {
        if (user && searchVal && originalData) {
            // Perform search on the original data
            const searchResults = originalData.filter(
                (item) =>
                    item.title.toLowerCase().includes(searchVal.toLowerCase()) ||
                    item.description.toLowerCase().includes(searchVal.toLowerCase())
            );
            setFetchedData(searchResults);
        } else if (!searchVal && originalData) {
            // If searchVal is empty, reset to original data
            setFetchedData(originalData);
        }
    }, [searchVal, originalData]);



    const handleRealtimeEvent = (payload: any) => {
        switch (payload.eventType) {
            case 'INSERT':
                setFetchedData((prevData) =>
                    prevData ? [...prevData, payload.new] : [payload.new]
                );
                break;
            case 'UPDATE':
                setFetchedData((prevData) =>
                    prevData
                        ? prevData.map((item) =>
                            item.id === payload.new.id ? payload.new : item
                        )
                        : [payload.new]
                );
                break;
            case 'DELETE':
                console.log("DELETED")
                setFetchedData((prevData) =>
                    prevData ? prevData.filter((item) => item.id !== payload.old.id) : null
                );
                break;
            default:
                break;
        }
    };
    async function fetchGoalsByID() {
        try {
            let query = supabase
                .from('templates')
                .select('*')
                .order('download_count', { ascending: false });

            // Apply the category filter only if findTemplate is not empty
            if (findTemplate !== '') {
                query = query.eq('category', findTemplate);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setFetchedData(data);
                setOriginalData(data); // Store the original data to preserve it for search filtering
            }
        } catch (err) {
            console.log(err);
        }
    }


    const [viewEllip, setViewEllip] = useState<number | null>(null)
    const [isDelete, setIsDelete] = useState<number | null>(null)



    async function deleteGoalsByID(docID: number, userUID: string) {
        if (isDelete === null) return
        try {


            const { data, error } = await supabase
                .from('templates')
                .delete()
                .match({
                    'created_at': docID,
                    'authorUid': userUID
                })

            if (error) {
                console.log(error)
            } else {
                console.log(data)
                setIsDelete(null)
                setViewEllip(null)
            }

        } catch (err) {
            console.log(err);
        }
    }


    


    return (
        <div
            onClick={() => { setViewEllip(null) }}
            className='w-full h-full selectionNone'>
            {
                user &&
                <MetaEditor
                    title={`Goal Templates | ${user?.email}`}
                    description='Choose from a variety of pre-defined goal templates to help you stay organized and motivated. Easily import a template that aligns with your objectives, whether for personal development, fitness, or work projects.'
                    keywords='Orgamix, Goal Template, Templates, Goals, Projects, Tasks'
                />
            }
            {
                isOpenCreate &&
                <ChooseMethod closer={setIsOpenCreate} />
            }
            {
                showCreate === "Create" &&

                <CreateGoals listener={setGoalListener} purpose='Modal' closer={setShowCreate} location="template" />
            }
            {
                templateID != "" &&
                <ViewTemplate />
            }

            {
                showCreate === "Import" &&
                <ImportGoals />
            }


            {
                showCreate === "Upload" &&
                <UploadImport />
            }

            {
                isReport != null &&
                <ReportGoal closer={setIsReport} contentObj={goalToReport} />
            }

            <header className='p-3 flex items-center h-auto pb-2 justify-between border-b-[#535353] border-b-[1px] overflow-auto'>
                <div className='flex items-center h-auto pb-2 justify-between w-full max-w-[1200px] mx-auto'>
                    <div className='flex gap-3 items-center'>
                        <div className='w-[35px] bg-[#111] flex items-center justify-center border-[1px] h-[35px] rounded-full overflow-hidden'>
                            <FetchPFP userUid={user?.id} />
                        </div>
                        <div
                            onClick={() => { nav(-1) }}
                            className='flex gap-1 hover:bg-[#535353] items-center bg-[#313131] 
                        border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3'><IoChevronBackOutline /> Back</div>
                    </div>
                    <div className='flex gap-3 items-center'>
                        <div
                            onClick={() => { nav('/user/dashboard') }}
                            className='flex gap-1 items-center bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#535353]'>
                            Dashboard <LuLayoutDashboard />
                        </div>
                        <div
                            onClick={() => { nav('/user/settings') }}
                            className='flex gap-1 items-center bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-3 md:p-2 px-3 hover:bg-[#535353]'>
                            <span className='hidden md:block'>Settings</span> <IoSettingsOutline />
                        </div>
                    </div>
                </div>
            </header>


            <div className='mt-3 mx-auto max-w-[1200px] p-3 min-h-[100vh]'>
                <div className='flex flex-col gap-2'>
                    <div className='text-xl font-bold'>
                        Choose templates
                    </div>
                    <p className='text-sm text-[#888] w-full max-w-[500px]'>
                        Select from a variety of pre-defined goal templates to help you stay organized and motivated. Easily import a template that aligns with your objectives, whether for personal development, fitness, or work projects.
                    </p>
                </div>
                <div className='w-full h-auto my-4'>
                    <Marquee
                        pauseOnHover
                        autoFill>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Work</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Personal</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Fitness</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Education</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Health</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Finance</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Travel</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Hobbies</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Relationships</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Spiritual</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Career</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Self-Development</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Home</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Community</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Creativity</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Environment</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Volunteering</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Family</div>

                    </Marquee>
                </div>

                <div className='flex items-start mt-7 gap-2 justify-between flex-col md:flex-row'>
                    <div className='flex gap-3 items-center'>
                        <div
                            onClick={() => { setIsOpenCreate(prevCLick => !prevCLick) }}
                            className='flex gap-1 items-center bg-[#476d4a] border-[#535353] border-[1px] cursor-pointer rounded-lg p-3 md:p-2 px-3 hover:bg-[#535353]'>
                            <span className='hidden md:block'>Create a Template</span> <MdPublish />
                        </div>
                        <select
                            value={findTemplate}
                            onChange={(e) => { setFindTemplate(e.target.value) }}
                            className='p-3 rounded-lg bg-[#111111] outline-none  border-[#535353] border-[1px]  text-[#888]'
                            name="" id="">
                            <option value="">Find template by:</option>
                            <option value="">All</option>
                            <option value="Work">Work</option>
                            <option value="Personal">Personal</option>
                            <option value="Fitness">Fitness</option>
                            <option value="Education">Education</option>
                            <option value="Health">Health</option>
                            <option value="Finance">Finance</option>
                            <option value="Travel">Travel</option>
                            <option value="Hobbies">Hobbies</option>
                            <option value="Relationships">Relationships</option>
                            <option value="Spiritual">Spiritual</option>
                            <option value="Career">Career</option>
                            <option value="Self-Development">Self-Development</option>
                            <option value="Home">Home</option>
                            <option value="Community">Community</option>
                            <option value="Creativity">Creativity</option>
                            <option value="Environment">Environment</option>
                            <option value="Volunteering">Volunteering</option>
                            <option value="Family">Family</option>
                        </select>
                    </div>

                    <input
                        value={searchVal}
                        onChange={(e) => { setSearchVal(e.target.value) }}
                        className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full max-w-[300px]  text-[#888]'
                        type="text" placeholder='Search (e.g., Sofware Engineering)' />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-[3rem] pb-5 ">

                    {
                        fetchedData === null ?
                            <div className='w-[20px] h-[20px]'>
                                <Loader />
                            </div>
                            :
                            <>
                                {
                                    fetchedData.length === 0 &&
                                    <div>
                                        <div>No result :(</div>
                                    </div>
                                }
                                <AnimatePresence>
                                    {
                                        fetchedData && fetchedData?.map((itm: dataType, idx: number) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.3 }}
                                                onClick={() => {
                                                    setTemplateID(itm?.created_at)
                                                }}
                                                key={idx}
                                                className='w-full justify-between flex flex-col  bg-[#313131] border-[#535353] relative border-[1px] cursor-pointer rounded-lg overflow-hidden hover:bg-[#222222]'>

                                                <div className='flex h-auto items-start  justify-start    '>
                                                    <div
                                                        className={`w-[2px] h-full`}>
                                                    </div>

                                                    <div
                                                        className='flex flex-col p-3 w-full'>
                                                        {
                                                            viewEllip === idx && isDelete === null &&
                                                            (<div
                                                                onClick={(e) => { e.stopPropagation() }}
                                                                className=' bg-[#111111] border-[#535353] border-[1px] flex flex-col toRight overflow-hidden rounded-md'>
                                                                <div
                                                                    onClick={() => {
                                                                        setTemplateID(itm?.created_at)
                                                                    }}
                                                                    className='px-2 py-1 border-b-[#535353] border-b-[1px] hover:bg-[#222222]'>View</div>
                                                                <div
                                                                    onClick={() => {
                                                                        setIsReport(itm?.created_at);
                                                                        setGoalToReport(itm)
                                                                    }}
                                                                    className='px-2 py-1 border-b-[#535353] border-b-[1px] hover:bg-[#222222]'>Report</div>

                                                                {itm?.authorUid === user?.id &&
                                                                    <div
                                                                        onClick={() => { setIsDelete(idx) }}
                                                                        className='px-2 py-1 border-b-[#535353] border-b-[1px] hover:bg-[#222222]'>Delete</div>}
                                                                <div
                                                                    onClick={() => { setViewEllip(null) }}
                                                                    className='px-2 py-1 border-b-[#535353] border-b-[1px] text-red-500 hover:bg-[#222222]'>Close</div>
                                                            </div>)
                                                        }
                                                        {
                                                            isDelete === idx && itm?.authorUid === user?.id && viewEllip === idx &&
                                                            (<div
                                                                onClick={(e) => { e.stopPropagation() }}
                                                                className=' bg-[#111111] border-[#535353] border-[1px] flex flex-col toRight overflow-hidden rounded-md'>
                                                                <div
                                                                    onClick={() => { setIsDelete(null) }}
                                                                    className='px-2 py-1 border-b-[#535353] border-b-[1px] hover:bg-[#222222]'>Cancel</div>
                                                                <div
                                                                    onClick={() => { deleteGoalsByID(itm?.created_at, itm?.authorUid) }}
                                                                    className='px-2 py-1 text-red-500 border-b-[#535353] border-b-[1px] hover:bg-[#222222]'>Delete</div>
                                                            </div>)
                                                        }

                                                        <div className='flex gap-3 justify-between w-full'>
                                                            <div className='font-bold mb-1'>
                                                                {itm?.title.length >= 25 ? itm?.title.slice(0, 25) + '...' : itm?.title}
                                                            </div>
                                                            <div>

                                                                <div
                                                                    onClick={(e) => { e.stopPropagation(); setViewEllip(idx) }}
                                                                    className='text-[#888] hover:text-[#fff]'>
                                                                    <FaEllipsisH />
                                                                </div>

                                                            </div>
                                                        </div>

                                                        <div className='text-[#888] text-sm flex gap-1 items-center'>
                                                            <BiCategory />{itm?.category}
                                                        </div>
                                                        <div className='text-[#888] text-sm flex gap-1 items-center'>
                                                            
                                                            <GetAuthor authorUid={itm?.authorUid} />
                                                        </div>
                                                        <div className='text-[#888] text-sm flex gap-1 items-center'>
                                                            <MdOutlineFileDownload /> {itm?.download_count}  <p>
                                                                {itm?.download_count >= 1000 ? (
                                                                    <span className="label label-top-choice">🌟 Top Download</span>
                                                                ) : itm?.download_count >= 500 ? (
                                                                    <span className="label label-highly-rated">⭐ Highly Rated</span>
                                                                ) : itm?.download_count >= 300 ? (
                                                                    <span className="label label-best-choice">🔥 Best User Choice</span>
                                                                ) : itm?.download_count >= 100 ? (
                                                                    <span className="label label-trending">📈 Trending Now</span>
                                                                ) : itm?.download_count >= 50 ? (
                                                                    <span className="label label-popular">✨ Popular</span>
                                                                ) : (
                                                                    <span className="label label-default"></span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='flex justify-between mt-auto items-center p-3 border-t-[#535353] border-t-[1px]  text-[#888] gap-2'>
                                                    
                                                    <div className='flex items-center gap-2'>
                                                    <div className='w-[20px] bg-[#111] flex items-center justify-center border-[1px] h-[20px] rounded-full overflow-hidden'>
                                                                <FetchPFP userUid={itm?.authorUid} />
                                                            </div>
                                                        {itm?.sub_tasks.filter((itmz) => itmz.is_done).length}
                                                        /
                                                        {itm?.sub_tasks.length}
                                                    </div>


                                                    <div>
                                                        {itm?.created_at
                                                            ? moment(parseInt(itm?.created_at.toString())).format('MMMM Do YYYY')
                                                            : 'No Creation date'}
                                                    </div>
                                                </div>


                                            </motion.div>
                                        ))
                                    }
                                </AnimatePresence>
                            </>
                    }
                </div>
            </div>


            <Footer />
        </div>
    )
}

export default GoalTemplates
