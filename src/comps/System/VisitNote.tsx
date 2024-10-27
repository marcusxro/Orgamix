import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import Loader from '../Loader';
import ShareNotes from './ShareNotes';
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { IoMdClose } from "react-icons/io";


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
        ["link"],
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
    const [isEdit, setIsEdit] = useState(false)
    const [isEdited, setIsEdited] = useState<boolean>(false)
    
    useEffect(() => {
        if (user) {
            fetchNoteByIds()
            const subscription = supabase
                .channel('public:notes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, (payload) => {
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
    }, [user, isEdited])

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
                setTitle(data[0].title || '');
                setValue(data[0].notes || '');
            }
        }
        catch (err) {
            console.log(err)
        }
    }


    // Auto-save functionality
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (title || value) {
                editNote()
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [title, value]);


    async function editNote() {
        try {

            const { data, error } = await supabase
                .from("notes")
                .update({
                    notes: value,
                })
                .eq('userid', params?.uid)
                .eq('createdat', params?.time);

            if (error) {
                console.error(error);
            } else if (data) {
                console.log("Edited");
            }
        } catch (err) {
            console.log(err);
        }
    }


    async function editTitle() {
        // Avoid editing if already edited
        if (isEdited) return;
        setIsEdited(true); // Set editing in progress

        if(title === "") {
          return  setIsEdited(false)
        }


        try {
            // Step 1: Check for existing notes with a similar title
            const { data: existingNotes, error: fetchError } = await supabase
                .from("notes")
                .select("title, createdat")
                .eq("userid", params?.uid)
                .like("title", `${title}%`);

            if (fetchError) {
                console.error(fetchError);
                setIsEdited(false); // Reset to allow future edits
                return;
            }

            let updatedTitle = title;

            // Step 2: Determine if this note is the root note
            const isRootNote = existingNotes.some(
                (note: any) => note.title === title && note.createdat === params?.time
            );

            if (!isRootNote) {
                // If not the root note, add an index based on similar notes count
                const similarNotesCount = existingNotes.filter(note => note.title.startsWith(title)).length;

                if (!isRootNote && similarNotesCount > 0) {
                    updatedTitle = `${title} (${similarNotesCount})`;
                }
        
            }

            // Step 3: Update the note with the updated title
            const { data, error } = await supabase
                .from("notes")
                .update({
                    title: updatedTitle,
                })
                .eq('userid', params?.uid)
                .eq('createdat', params?.time);

            if (error) {
                console.error(error);
                setIsEdit(false); // Exit edit mode after completion
            } else if (data) {
                console.log("Note edited successfully");
                setIsEdit(false); // Exit edit mode after completion
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsEdited(false); // Ensure `isEdited` is reset after the attempt
            setIsEdit(false); // Exit edit mode after completion
        }
    }



    const nav = useNavigate()
    const [isShare, setIsShare] = useState<boolean>(false)

    return (
        <div className={`${!fetchedData && 'items-center justify-center'} p-4 h-[100dvh]  overflow-auto flex flex-col gap-2`}>
            {
                isShare &&

                <ShareNotes closer={setIsShare} />
            }
            {
                fetchedData ? (
                    (fetchedData[0]?.share === "Specific" && user != null &&
                        fetchedData[0]?.sharedEmails?.some((itm: any) => itm?.email === user?.email)) ||


                        fetchedData[0]?.userid === user?.uid ||
                        fetchedData[0]?.share === "Only me" &&
                        fetchedData[0]?.userid === user?.uid ||
                        fetchedData[0]?.share === "Everyone" ? (
                        <>
                            <div className='flex gap-2 justify-between overflow-auto'>
                                <div className='flex gap-2'>
                                    {user && (
                                        <div
                                            onClick={() => { nav(-1); }}
                                            className='p-3 rounded-lg bg-[#111111] outline-none hover:bg-[#222] border-[#535353] border-[1px] cursor-pointer'>
                                            back
                                        </div>
                                    )}

                                    <div className='flex gap-2'>
                                        <input
                                            value={title}
                                            readOnly={isEdit === true ? false : true}
                                            onChange={(e) => { setTitle(e.target.value); }}
                                            type="text"
                                            placeholder='Title'
                                            className={`p-3 rounded-lg  ${isEdit !== true  ? "text-[#888]" : "text-white"} bg-[#111111] outline-none border-[#535353] border-[1px]`}
                                        />
                                        {
                                            isEdit ?

                                                <div className='flex gap-2'>
                                                    <div
                                                        onClick={() => { setIsEdit(false) }}
                                                        className='p-3 rounded-lg bg-[#111111] hover:bg-[#222] outline-none flex items-center justify-center border-[#535353] border-[1px]'>
                                                        <IoMdClose />
                                                    </div>
                                                    <div
                                                        onClick={() => { editTitle() }}
                                                        className={`p-3 rounded-lg bg-[#111111] ${title != "" && "text-blue-500"} text-[#888] hover:bg-[#222] outline-none flex items-center justify-center border-[#535353] border-[1px]`}>
                                                        {
                                                            isEdited ?
                                                                <div className='w-[20px] h-[20px]'>
                                                                    <Loader />
                                                                </div>
                                                                :
                                                                <MdModeEdit />
                                                        }
                                                    </div>
                                                </div> :
                                                <div
                                                    onClick={() => { setIsEdit(true); }}
                                                    className='p-3 rounded-lg bg-[#111111] hover:bg-[#222] outline-none flex items-center justify-center border-[#535353] border-[1px]'>
                                                    <MdModeEdit />
                                                </div>

                                        }
                                    </div>

                                </div>
                                {
                                    fetchedData &&
                                    fetchedData[0]?.userid === user?.uid &&
                                    <div
                                        onClick={() => { setIsShare(true); }}
                                        className='p-3 px-4 cursor-pointer hover:bg-[#222] flex items-center justify-center rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px]'>
                                        Share
                                    </div>
                                }

                            </div>

                            <div className='w-full h-[90%] max-w-[800px] mx-auto'>
                                <ReactQuill
                                    theme='snow'
                                    value={value}
                                    onChange={setValue}
                                    className='w-full h-full rounded-lg break-all text-black bg-[#e7e7e7] overflow-auto border-[#535353] border-[1px]'
                                    modules={combinedModules}
                                />

                            </div>
                        </>
                    ) : (

                        user &&
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
