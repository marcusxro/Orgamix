import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import useStore from '../../Zustand/UseStore';
import Loader from '../Loader';
import { motion, AnimatePresence } from 'framer-motion';


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
interface AddNoteProps {
    purpose: string;
    closeMobile: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddNote: React.FC<AddNoteProps> = ({ purpose, closeMobile }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [user] = IsLoggedIn()

    const [value, setValue] = useState<string>('');
    const [title, setTitle] = useState<string>('');

    const [category, setcategory] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false)
    const { editTask, setEditTask } = useStore()

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            closeMobile(false);
            setIsExiting(false);
        }, 100);
    };

    async function createNote() {
        if (loading) return;

        setLoading(true);

        if (!value || !title || !category) {
            setLoading(false);
            return;
        }

        try {
            // Step 1: Check for existing notes with a similar title
            const { data: existingNotes, error: fetchError } = await supabase
                .from("notes")
                .select("title")
                .eq("userid", user?.uid)
                .like("title", `${title}%`);

            if (fetchError) {
                console.error(fetchError);
                setLoading(false);
                return;
            }

            // Step 2: Determine if any existing notes share the title
            // Determine the new title with an index if necessary
            let newTitle = title;

            if (existingNotes.length > 0) {
                const exactMatches = existingNotes.filter(itm =>
                    itm?.title === title || itm?.title.startsWith(`${title} (`));

                if (exactMatches.length > 0) {
                    const maxIndex = exactMatches.reduce((acc, itm) => {
                        const match = itm.title.match(/\((\d+)\)$/); // Check for pattern "renameGoal (index)"
                        const index = match ? parseInt(match[1], 10) : 0;
                        return Math.max(acc, index);
                    }, 0);

                    newTitle = `${title} (${maxIndex + 1})`;
                }


            }


            // Step 3: Insert the new note with the updated title
            const { error: insertError } = await supabase.from("notes").insert({
                title: newTitle,
                notes: value,
                category: category,
                userid: user?.uid,
                createdat: Date.now(),
            });

            if (insertError) {
                console.error(insertError);
                setLoading(false);
                return;
            }

            console.log("Note created!");
            setTitle("");
            setValue("");
            setcategory("");
            setEditTask(!editTask);

            if (purpose === "modal") {
                handleOutsideClick();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
                    className={`${purpose == "modal" && "ml-auto positioners flex items-center p-3 justify-end lg:hidden"} relative w-full h-full`}
                    onClick={handleOutsideClick}>

                    <motion.div
                        initial={{ x: 50, scale: 0.95, opacity: 0 }} // Starts off-screen to the left
                        animate={{ x: 0, scale: 1, opacity: 1, transition: { duration: 0.2 } }} // Moves to default position
                        exit={{ x: 50, scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        onClick={(e) => { e.stopPropagation() }}
                        className='w-full max-w-[550px] bg-[#313131]  z-[5000] relative
                 rounded-lg p-3 h-full border-[#535353] border-[1px] flex flex-col gap-3 overflow-auto'>

                        <div className='mb-2'>
                            <div className='font-bold'>
                                Add New Note
                            </div>
                            <p className='text-[#888] text-sm'>Begin organizing your tasks by adding new notes here.</p>
                        </div>
                        <input
                            value={title}
                            maxLength={40}
                            onChange={(e) => { setTitle(e.target.value) }}
                            type="text" placeholder='title'
                            className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px]'
                        />
                        <div className='flex flex-col gap-1 '>
                            <select
                                value={category}
                                onChange={(e) => { setcategory(e.target.value) }}
                                className='p-2 rounded-lg bg-[#111111] border-[#535353] border-[1px] text-[#888]'>
                                <option value="">Choose Category</option>
                                <option value="Work">Work</option>
                                <option value="Personal">Personal</option>
                                <option value="School">School</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className='w-full h-[50%]'>
                            <ReactQuill
                                theme='snow'
                                value={value}
                                onChange={setValue}
                                className='w-full h-full rounded-lg break-all text-black bg-[#a2a2a2] overflow-auto border-[#535353] border-[1px]'
                                modules={combinedModules}
                            />
                        </div>

                        <div>




                        </div>
                        <div className='mt-auto flex gap-2 w-full'>
                            {
                                purpose === 'modal' &&
                                <div
                                    onClick={() => handleOutsideClick()}
                                    className={` bg-[#684444] w-full mt-2 flex items-center justify-center  p-2 text-sm rounded-lg text-center cursor-pointer
                         border-[#535353] border-[1px] hover:bg-[#535353] `}>
                                    Close
                                </div>
                            }

                            <div
                                onClick={() => { createNote() }}
                                className={`${loading && 'bg-[#535353] '} w-full bg-[#111111] mt-2 flex items-center justify-center  p-2 text-sm rounded-lg text-center cursor-pointer
                                        border-[#535353] border-[1px] hover:bg-[#535353] `}>
                                {
                                    loading ?
                                        <div className='w-[20px] h-[20px] m-1'>
                                            <Loader />
                                        </div>
                                        :
                                        'Add Note'
                                }
                            </div>


                        </div>


                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    );
};

export default AddNote;
