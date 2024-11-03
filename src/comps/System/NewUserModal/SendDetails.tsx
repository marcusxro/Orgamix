import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion';
import NoUserProfile from '../../../assets/UserNoProfile.jpg'
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import { BiSolidError } from "react-icons/bi";
import projectImage from '../../../assets/ProjectImages/Untitled design (3).png'
import imageCompression from 'browser-image-compression';
import { supabase } from '../../../supabase/supabaseClient';
import Loader from '../../Loader';

interface pubsType {
    publicUrl: string
}

const SendDetails: React.FC = () => {
    const [user] = IsLoggedIn()
    const [userName, setUserName] = useState("")
    const [fullName, setFullName] = useState("")
    const MAX_FILE_SIZE = 200 * 1024; // 200 KB
    const [isErrorPfp, setIsErrorPfp] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null);
    const [isAllowed, setIsAllowed] = useState<boolean>(false)
    const [changedImage, setChangedImg] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null); // Add ref for the file input
    const [loading, setLoading] = useState<boolean>(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;

        // Validate file type and size
        if (selectedFile) {
            const isImage = selectedFile.type.startsWith('image/');
            const isUnderLimit = selectedFile.size <= MAX_FILE_SIZE;

            if (!isImage) {
                setIsErrorPfp('Please select an image file.');
                setFile(null);
                setIsAllowed(false)
                return;
            }

            if (!isUnderLimit) {
                setIsErrorPfp('File size must be less than 200 KB.');
                setFile(null);
                setIsAllowed(false)
                return;
            }
            console.log(selectedFile)
            setIsAllowed(true)
            setFile(selectedFile);
            setChangedImg(URL.createObjectURL(selectedFile)); // Set image preview URL
        }
    };
    const messageVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    useEffect(() => {
        if (isErrorPfp) {
            setTimeout(() => {
                setIsErrorPfp(null);
            }, 5000);
        }
    }, [isErrorPfp])

    const uploadImage = async () => {
        setLoading(true)

        if (loading) return

        if (!user) {
            setLoading(false)
            return
        };
        
        
        try {
            const imageToUpload = file ? file : await fetch(NoUserProfile).then(res => res.blob()).then(blob => new File([blob], "default_profile.jpg", { type: "image/jpeg" }));

            const compressedFile = await imageCompression(imageToUpload, {
                maxSizeMB: 0.2, // Compress to max size 200 KB
                useWebWorker: true,
                maxWidthOrHeight: 300
            });
            // Use the user's UID for the path and a fixed name
            const filePath = `images/${user.uid}/profile_picture.jpg`; // Fixed file name for the profile picture

            // Remove the existing image (optional but recommended)
            await supabase.storage.from('profile').remove([filePath]);

            // Upload the image to the user's UID folder with a fixed name
            const { data, error } = await supabase.storage
                .from('profile')
                .upload(filePath, compressedFile); // No upsert; we remove the old one first

            if (error) {
                console.error('Error uploading file:', error.message);
                setLoading(false)
            } else {
                console.log('File uploaded successfully:', data);
                // Fetch the new image URL after uploading
                setLoading(true)
                setFile(null)
                setFile(null); // Clear the file state
                setIsErrorPfp(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Clear the file input element
                }
                return true
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setIsErrorPfp("Error occured, please try again later")
            setLoading(false)
        } finally {
            setLoading(false)
        }
    };


    async function createUserForGoogle() {
        if(loading) return

        if(user?.providerData[0]?.providerId != 'google.com'){
            setLoading(false)
            setIsErrorPfp("You are not signed in with Google")
            return
        }
        const isDoneUploading = await uploadImage()


        if (!isDoneUploading) {
            setLoading(false)
            setIsErrorPfp("Error occured, please try again later")
           return
        }
        try {
            const { error } = await supabase.from('accounts').insert({
                userid: user?.uid,
                username: userName,
                password: "GoogleProvider",
                email: fullName,
            })
            if (error) {
                console.error('Error inserting data:', error);
                setLoading(false)
                setIsErrorPfp("Error occured, please try again later")
            } else {
                setUserName("")
                setFullName("")
            }
        } catch (err) {
            console.log(err);
            setLoading(false)
            setIsErrorPfp("Error occured, please try again later")
        }
    }


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className='ml-auto positioners flex  items-center p-3 justify-center w-full h-full '>


            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                className={`w-[550px] h-full max-h-[750px] bg-[#313131] z-[5000] rounded-lg overflow-auto border-[#535353] border-[1px]  flex flex-col justify-between`}>

                <div className='overflow-auto  h-full ' >
                    <div className='bg-[#222] h-[90px] relative '>

                        <div className='w-full h-full overflow-hidden'>
                            <img
                            className='w-full h-full object-cover object-top center'
                            src={projectImage} alt="" />
                        </div>

                        <div className='flex items-start w-full absolute -bottom-10  px-3'>
                            <div className='w-[100px] h-[100px] bg-slate-400 border-[#535353] border-[1px] rounded-full overflow-hidden'>
                                <img
                                    className='w-full h-full object-cover'
                                    src={changedImage || NoUserProfile} alt="Profile" />
                            </div>

                        </div>

                    </div>
                    <div className='mt-[3rem] px-5'>
                        <div className='text-md font-bold'>
                            {
                                fullName != '' ? fullName : ""
                            }
                        </div>
                        <div className='text-sm text-[#888]'>
                            {
                                user?.email != '' ? user?.email : "No email"
                            }
                        </div>
                    </div>
                    {isErrorPfp !== null && (
                        <div className='px-2 my-2 flex items-start'>
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={messageVariants}
                                className='flex gap-2 items-center w-full justify-start bg-red-500 text-white p-2 rounded-lg'>
                                <BiSolidError className='text-xl' />
                                {isErrorPfp}
                            </motion.div>
                        </div>
                    )}
                    <div className='mt-[2rem] px-5  flex flex-col gap-4 '>
                        <div className='flex gap-5 justify-between border-t-[#535353] border-t-[1px] pt-6'>
                            <div className='w-full max-w-[100px] text-[#888]'>Email</div>
                            <div className='flex gap-5 w-full max-w-[300px]'>

                                <input
                                    readOnly
                                    value={user?.email as string}
                                    className='w-full px-2 py-3 rounded-lg outline-none text-[#888] border-[#535353] border-[1px] bg-[#111] '
                                    placeholder='Email'
                                    type="text" />
                            </div>
                        </div>
                        <div className='flex gap-5 justify-between border-t-[#535353] border-t-[1px] pt-6'>
                            <div className='w-full max-w-[100px] text-[#888]'>Name</div>
                            <div className='flex gap-5 w-full max-w-[300px]'>

                                <input
                                    maxLength={30}
                                    value={fullName}
                                    onChange={(e) => { setFullName(e.target.value) }}
                                    className='w-full px-2 py-3 rounded-lg outline-none text-white border-[#535353] border-[1px] bg-[#111]'
                                    placeholder='Full name'
                                    type="text" />


                            </div>
                        </div>
                        <div className='flex gap-5 justify-between border-t-[#535353] border-t-[1px] pt-6'>
                            <div className='w-full max-w-[100px] text-[#888]'>Username</div>
                            <div className='flex gap-5 w-full max-w-[300px]'>

                                <input
                                    maxLength={30}
                                    value={userName}
                                    onChange={(e) => { setUserName(e.target.value) }}
                                    className='w-full px-2 py-3 rounded-lg outline-none text-white border-[#535353] border-[1px] bg-[#111]'
                                    placeholder='Username'
                                    type="text" />
                            </div>
                        </div>

                        <div className='flex gap-5 justify-between border-t-[#535353] border-t-[1px] pt-6'>
                            <div className='w-full max-w-[100px] text-[#888]'>Profile photo</div>
                            <div className='flex gap-5 w-full max-w-[300px]'>
                                <div className='flex gap-2 items-start  w-full'>

                                    <div
                                        onClick={() => { fileInputRef.current?.click() }}
                                        className='w-full px-2 py-2  bg-[#111] selectionNone hover:bg-[#222] text-center cursor-pointer rounded-lg outline-none text-white border-[#535353] border-[1px] '
                                    >
                                        Click to upload
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        className='bg-[#222] hidden border-[1px]  border-[#535353] p-1 rounded-md w-full max-w-[200px] text-sm'
                                        type="file"
                                        placeholder='inamo'
                                        accept="image/png, image/jpeg, image/jpg, image/gif" // Accept specific image types
                                        onChange={handleFileChange}
                                    />
                                </div>

                            </div>

                        </div>

                        <div className='text-sm border-t-[#535353] selectionNone border-t-[1px] pt-6 text-[#888]'>
                            Welcome to orgamix! We are excited to have you on board. Please fill in your details to get started. 🎉
                        </div>
                    </div>


                </div>

                <div className='w-full flex items-center justify-end p-3'>
                    <div
                    onClick={() => { !loading &&  userName && fullName && createUserForGoogle() }}
                     className={`px-5 py-2 ${!userName || !fullName ? "bg-[#222] cursor-not-allowed" : "bg-[#111]  cursor-pointer"} rounded-lg selectionNone border-[#535353] border-[1px] hover:bg-[#222]`}>
                      {
                        loading ?
                        <div className='w-[20px] h-[20px]'>
                            <Loader />
                            </div>:
                            "Save"
                      }
                    </div>
                </div>
            </motion.div>

        </motion.div>
    )
}

export default SendDetails
