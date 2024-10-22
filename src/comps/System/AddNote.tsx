import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import useStore from '../../Zustand/UseStore';
import Loader from '../Loader';


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
interface AddNoteProps {
    purpose: string;
    closeMobile: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddNote: React.FC<AddNoteProps> = ({ purpose, closeMobile }) => {

    const [user] = IsLoggedIn()

    const [value, setValue] = useState<string>('');
    const [title, setTitle] = useState<string>('');

    const [category, setcategory] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false)
    const { editTask, setEditTask } = useStore()


    async function createNote() {
        setLoading(true)

        if (loading) {
            setLoading(false)
            return
        }


        if (!value || !title || !category) {
            setLoading(false)
            return
        }
        try {
            const { error } = await supabase.from("notes").insert({
                title: title,
                notes: value,
                category: category,
                userid: user?.uid,
                createdat: Date.now()
            })
            if (error) {
                console.error(error)
                setLoading(false)

            } else {
                console.log("note created!")
                setTitle("")
                setValue("")
                setcategory("")
                setEditTask(!editTask)
                setLoading(false)
            }
        }
        catch (err) {
            console.error(err)
            setLoading(false)
        }
    }


    return (
        <div
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
            <div className='w-full h-[30%]'>
                <ReactQuill
                    theme='snow'
                    value={value}
                    onChange={setValue}
                    className='w-full h-[100%]  rounded-lg break-all text-white'
                    modules={combinedModules}
                />
            </div>

            <div>




            </div>
            <div className='mt-auto'>
                {
                    purpose === 'modal' &&
                    <div
                        onClick={() => closeMobile(false)}
                        className={` bg-[#684444] mt-2 flex items-center justify-center  p-3 rounded-lg text-center cursor-pointer
                     border-[#535353] border-[1px] hover:bg-[#535353] `}>
                        Close
                    </div>
                }

                <div
                    onClick={() => { createNote() }}
                    className={`${loading && 'bg-[#535353] '} bg-[#111111] mt-2 flex items-center justify-center  p-3 rounded-lg text-center cursor-pointer
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


        </div>
    );
};

export default AddNote;
