import React, { useEffect, useState } from 'react';
import Sidebar from '../../comps/Sidebar';
import { IoMdAdd } from "react-icons/io";
import AddNote from '../../comps/System/AddNote';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import { supabase } from '../../supabase/supabaseClient';
import moment from 'moment';
import { CiCalendarDate } from "react-icons/ci";
import { BiCategory } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';
import useStore from '../../Zustand/UseStore';
import Loader from '../../comps/Loader';
import { motion, AnimatePresence } from 'framer-motion'
import { GoSortAsc } from "react-icons/go";
import NoteSorter from '../../comps/NoteSorter';
import MetaEditor from '../../comps/MetaHeader/MetaEditor';


interface fetchedDataType {
    id: number;
    title: string;
    notes: string;
    category: string;
    userid: string;
    createdat: string
}

const Notes = () => {
    const [user] = IsLoggedIn()
    const [fetchedData, setFetchedData] = useState<fetchedDataType[] | null>(null)
    const [filteredData, setFilteredData] = useState<fetchedDataType[] | null | undefined>(null)
    const [showAdd, setShowAdd] = useState<boolean>(true)
    const { mobileShow, setMobileShow }: any = useStore()
    const { editTask } = useStore()
    const [action, setAction] = useState<number | null>(null)
    const [searchVal, setSearchVal] = useState<string>("")
    const [isSort, setSort] = useState(false)
    const [sortVal, setSortVal] = useState<string | null>(null);


    const [sortMethodLoaded, setSortMethodLoaded] = useState<boolean>(false);
    const sortMethod = localStorage.getItem('sortMethodNotes');


    useEffect(() => {
       

        if (user && sortMethod && !sortMethodLoaded) {
            setSortVal(sortMethod);
            setSortMethodLoaded(true); // Mark that the sort method has been loaded
            console.log("Sort method loaded on initial render:", sortMethod);
        }
    }, [user, sortMethod, sortMethodLoaded, sortVal]);


    useEffect(() => {
        const filteredArray = fetchedData?.filter((itm: fetchedDataType) => {
            return itm?.title.toLowerCase().includes(searchVal.toLowerCase())
        })
        

        setFilteredData(filteredArray)

    }, [searchVal])

    useEffect(() => {
        if (user) {
            getNotes()
            const subscription = supabase
                .channel('public:notes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, (payload) => {
            
                    handleRealtimeEvent(payload);
                    getNotes()
                })
                .subscribe();
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user, editTask, sortVal, localStorage, location])


    const handleRealtimeEvent = (payload: any) => {
        const isCurrentUserProject = payload.new?.created_by === user?.uid || payload.old?.created_by === user?.uid;

        if (!isCurrentUserProject) return;


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

    function returnSortTitle() {
        switch (sortVal) {
            case "Alphabetically":
                return "title"
            case "Creation Date":
                return "createdat"
            default:
                return "createdat"

        }
    }


    async function getNotes() {
        try {
            const columnName = returnSortTitle();
            const { data, error } = await supabase.from("notes")
                .select("*")
                .eq('userid', user?.uid)
                .order(columnName === null ? "createdat" : columnName, { ascending: true });

            if (error) {
                console.error(error)
            } else {
                const sortedData = sortVal === 'Creation Date' ? data.reverse() : data;
               
                setFetchedData(sortedData)
                setFilteredData(sortedData)
            }
        }
        catch (err) {
            console.log(err)
        }
    }

    const nav = useNavigate()


    const closeMobile: React.Dispatch<React.SetStateAction<boolean>> = (value) => {
        setMobileShow(value);
    };


    async function deleteTask(idx: number) {
        try {
            const { error } = await supabase
                .from('notes')
                .delete()
                .match({
                    'userid': user?.uid,
                    'id': idx
                })

            if (error) {
                console.log(error)
            }
        }
        catch (err) {
            console.log(err)

        }
    }


    return (
        <div className='flex selectionNone'>
         {
            user && 
            <MetaEditor
            title={`Notes | ${user?.email}`}
            description='Easily create, edit, and organize your notes in this section for a streamlined experience.'
        />
         }
            <Sidebar location='Notes' />
            {
                isSort &&
                <NoteSorter closer={setSort} />
            }


            <div className={`ml-[85px] w-full p-3 flex gap-3 mr-[0] ${showAdd && 'lg:mr-[570px]'} `}>
                <div className='w-full h-full'>
                    <div>
                        <div
                            className='text-2xl font-bold'>
                            Notes
                        </div>
                        <div className='text-sm text-[#888]'>
                            Easily create, edit, and organize your notes in this section for a streamlined experience.
                        </div>
                    </div>


                    <div className='w-full flex gap-3 flex-col items-start h-[90dvh] mt-5 mb-5'>
                        <div className='flex gap-2 justify-between w-full'>
                            <div className='flex gap-2 justify-between items-center w-full max-w-[300px]'>
                                <div
                                    onClick={() => { setShowAdd(prevs => !prevs); setMobileShow(!mobileShow) }}
                                    className='w-auto p-3
                            flex items-center justify-center bg-[#111] border-[#535353] border-[1px] cursor-pointer rounded-lg  hover:bg-[#222]'>
                                    <IoMdAdd />
                                </div>
                                <input
                                    value={searchVal}
                                    onChange={(e) => { setSearchVal(e.target.value) }}
                                    placeholder='Search notes'
                                    className='w-full h-full rounded-lg bg-[#111] border-[#535353] border-[1px] outline-none px-3'
                                    type="text" />
                            </div>
                            <div
                                onClick={() => { setSort(true) }}
                                className='flex items-center cursor-pointer justify-center text-xl rounded-lg bg-[#111] border-[#535353] border-[1px] outline-none px-3 hover:bg-[#222]'>
                                <GoSortAsc />
                            </div>
                        </div>

                        <div className='flex gap-3 mt-5 flex-wrap w-full'>
                            {
                                filteredData?.length === 0 && searchVal != "" &&
                                <div className='text-sm text-[#888]'>No result</div>
                            }
                            {
                                filteredData?.length === 0 && searchVal === "" &&
                                <div className='text-sm text-[#888]'>Write your first note!</div>
                            }


                            {
                                filteredData === null ?
                                    <div className='w-[20px] h-[20px]'>
                                        <Loader />
                                    </div>
                                    :
                                    <AnimatePresence>
                                        {
                                            filteredData && filteredData?.map((itm: fetchedDataType, idx: number) => (
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    transition={{ duration: 0.3 }}
                                                    onClick={() => {
                                                        nav(`/user/notes/${itm?.userid}/${itm?.createdat}`)
                                                    }}
                                                    key={idx}
                                                    className='w-full max-w-[200px] h-full max-h-[200px] overflow-auto
                                                    flex items-start justify-start flex-col bg-[#313131] p-3 border-[#535353] border-[1px] cursor-pointer rounded-lg text-3xl hover:bg-[#222222] '>
                                                    <div className='font-bold text-sm'>
                                                        {itm?.title}
                                                    </div>
                                                    <div className='text-sm text-[#888] mt-2 flex items-center gap-1'>
                                                        <CiCalendarDate />
                                                        <span className='text-[10px]'>
                                                            {itm?.createdat
                                                                ? moment(parseInt(itm.createdat)).format('MMMM Do YYYY')
                                                                : 'No Deadline'}
                                                        </span>
                                                    </div>
                                                    {
                                                        itm?.category &&
                                                        <div className='text-sm text-[#888] flex items-center gap-1'>
                                                            <BiCategory />

                                                            <span className='text-[10px]'>
                                                                {itm?.category}
                                                            </span>

                                                        </div>
                                                    }


                                                    <div className='mt-auto w-full   rounded-lg overflow-hidden flex'>
                                                        <div className='w-full mt-2 border-[#535353] border-[1px] rounded-lg overflow-hidden flex'>
                                                            {
                                                                itm?.id === action ?
                                                                    <>
                                                                        <div
                                                                            onClick={(e) => { e.stopPropagation(); deleteTask(itm?.id) }}
                                                                            className='text-sm bg-[#111111] border-r-[#535353] border-r-[1px]  hover:bg-[#292929] text-red-500 w-full  p-1 text-center'>Delete</div>

                                                                        <div
                                                                            onClick={(e) => { e.stopPropagation(); setAction(null) }}
                                                                            className='text-sm bg-[#111111] text-green-500 w-full  p-1 text-center hover:bg-[#292929] hover:border-[#111111] '>Cancel</div>
                                                                    </>
                                                                    :
                                                                    <div
                                                                        onClick={(e) => { e.stopPropagation(); setAction(itm?.id) }}
                                                                        className='text-sm bg-[#111111] text-green-500 w-full  p-1 text-center hover:bg-[#292929]'>Delete</div>
                                                            }
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        }
                                    </AnimatePresence>

                            }
                        </div>
                    </div>
                </div>

                {
                    showAdd &&
                    <div className='ml-auto stickyPostion hidden lg:block'>
                        <AddNote purpose={'sidebar'} closeMobile={closeMobile} />
                    </div>
                }

                {
                    mobileShow &&

                    <AddNote purpose={'modal'} closeMobile={closeMobile} />

                }

            </div>

        </div>
    );
};

export default Notes;
