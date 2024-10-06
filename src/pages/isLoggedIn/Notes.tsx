import React, { useEffect, useState } from 'react';
import Sidebar from '../../comps/Sidebar';
import { CiCirclePlus } from "react-icons/ci";
import AddNote from '../../comps/System/AddNote';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import { supabase } from '../../supabase/supabaseClient';
import moment from 'moment';
import { CiCalendarDate } from "react-icons/ci";
import { BiCategory } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';
import useStore from '../../Zustand/UseStore';
import Loader from '../../comps/Loader';


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
    const [showAdd, setShowAdd] = useState<boolean>(true)
    const [mobileShow, setMobileShow] = useState<boolean>(false)
    const { editTask } = useStore()
    const [action, setAction] = useState<number | null>(null)


    useEffect(() => {
        if (user) {
            getNotes()
            const subscription = supabase
                .channel('public:notes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, (payload) => {
                    console.log('Realtime event:', payload);
                    handleRealtimeEvent(payload);
                    getNotes()
                })
                .subscribe();
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user, editTask])


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
        <div className='flex'>
            <Sidebar location='Notes' />
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


                    <div className='w-full flex gap-3 flex-col  h-[90dvh] mt-5 mb-5'>
                        <div
                            onClick={() => { setShowAdd(prevs => !prevs); setMobileShow(prevs => !prevs) }}
                            className='w-full max-w-[150px] h-full max-h-[150px] p-9
                    flex items-center justify-center bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg text-3xl hover:bg-[#535353]'>
                            <CiCirclePlus />
                        </div>
                        <div className='flex gap-3 flex-wrap'>
                            {
                                fetchedData === null ?
                                    <div className='w-[20px] h-[20px]'>
                                        <Loader />
                                    </div>
                                    :

                                    fetchedData && fetchedData?.map((itm: fetchedDataType, idx: number) => (
                                        <div
                                            onClick={() => {
                                                nav(`/user/notes/${itm?.userid}/${itm?.createdat}`)
                                            }}
                                            key={idx}
                                            className='w-full max-w-[150px] h-full max-h-[150px] overflow-auto
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
                                            <div className='text-sm text-[#888] flex items-center gap-1'>
                                                <BiCategory />

                                                <span className='text-[10px]'>
                                                    {itm?.category}
                                                </span>
                                            </div>

                                            <div className='mt-auto w-full border-[#535353] border-[1px]  rounded-lg overflow-hidden flex'>
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
                                                            className='text-sm bg-[#111111] text-green-500 w-full  p-1 text-center hover:bg-[#292929]'>Actions</div>
                                                }
                                            </div>
                                        </div>
                                    ))

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
                    <div
                        onClick={() => { setMobileShow(prevs => !prevs) }}
                        className='ml-auto positioners w-full h-full flex justify-end lg:hidden z-30'>
                        <AddNote purpose={'modal'} closeMobile={closeMobile} />
                    </div>
                }

            </div>

        </div>
    );
};

export default Notes;
