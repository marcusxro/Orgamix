import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import Loader from '../Loader';
import ShareNotes from './ShareNotes';

const fontOptions = [
    'sans-serif',
    'serif',
    'monospace',
];


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
        ["link", "image", "video"],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["clean"]
    ],

};

interface fetchedDataType {
    id: number;
    title: string;
    notes: string;
    category: string;
    userid: string;
    createdat: string;
    share: string;
    sharedEmails: string[]
}


const VisitNote = () => {
    const [user] = IsLoggedIn()
    const params = useParams()
    const [fetchedData, setFetchedData] = useState<fetchedDataType[] | null>(null)
    const [title, setTitle] = useState<string>('');
    const [value, setValue] = useState<string>('');




    useEffect(() => {
        if (user) {
            fetchNoteByIds()
            const subscription = supabase
                .channel('public:accounts')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, (payload) => {
                    console.log('Realtime event:', payload);
                    handleRealtimeEvent(payload);
                })
                .subscribe();
            return () => {
                subscription.unsubscribe();
            };
        } else {
            fetchNoteByIds()
        }
    }, [user])

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


    async function fetchNoteByIds() {
        try {
            const { data, error } = await supabase.from("notes")
                .select("*")
                .eq('userid', params?.uid)
                .eq('createdat', params?.time)

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


    useEffect(() => {
        if (fetchedData && fetchedData.length > 0) {
            setTitle(fetchedData[0].title || '');
            setValue(fetchedData[0].notes || '');

        }
        if (fetchedData) {
            console.log(fetchedData)
        }
    }, [fetchedData]);


    // Auto-save functionality
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (title || value) {
                editNote();
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [title, value]);


    async function editNote() {
        try {
            const { data, error } = await supabase
                .from("notes")
                .update({
                    title: title,
                    notes: value,
                })
                .eq('userid', params?.uid)
                .eq('createdat', params?.time)

            if (error) {
                console.error(error)
            } else {
                console.log(data)
            }
        }
        catch (err) {
            console.log(err)
        }
    }

    const nav = useNavigate()
    const [isShare, setIsShare] = useState<boolean>(false)

    return (
        <div className={`${!fetchedData && 'items-center justify-center'} p-2 h-[100dvh]  overflow-auto flex flex-col gap-2`}>
            {
                isShare &&
                <div
                    onClick={() => { setIsShare(false) }}
                    className='positioners w-full h-full flex items-center justify-center p-3'>
                    <ShareNotes closer={setIsShare} />
                </div>
            }
            {
                fetchedData ? (
                        fetchedData[0]?.share === "Specific" &&  user != null &&
                        fetchedData[0]?.sharedEmails.some((itm) => user?.email?.includes(itm)) ||
                        fetchedData[0]?.userid === user?.uid ||
                        fetchedData[0]?.share === "Only me" &&
                        fetchedData[0]?.userid === user?.uid ||
                        fetchedData[0]?.share === "Everyone" ? (
                        <>
                            <div className='flex gap-2'>
                                {user && (
                                    <div
                                        onClick={() => { nav(-1); }}
                                        className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] cursor-pointer'>
                                        back
                                    </div>
                                )}
                                <input
                                    value={title}
                                    onChange={(e) => { setTitle(e.target.value); }}
                                    type="text"
                                    placeholder='Title'
                                    className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px]'
                                />
                                {
                                    fetchedData &&
                                    fetchedData[0]?.userid === user?.uid &&
                                    <div
                                        onClick={() => { setIsShare(true); }}
                                        className='p-3 px-4 cursor-pointer flex items-center justify-center rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px]'>
                                        Share
                                    </div>
                                }

                            </div>

                            <div className='w-full h-[90%]'>
                                <ReactQuill
                                    theme='snow'
                                    value={value}
                                    onChange={setValue}
                                    className='w-full h-full rounded-lg break-all text-white'
                                    modules={combinedModules}
                                />
                            </div>
                        </>
                    ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          Access Denied!
                        </div>
                    )
                ) : (
                    <div className='w-[20px] h-[20px]'>
                        <Loader />
                    </div>
                )
            }
        </div>
    )
}

export default VisitNote
