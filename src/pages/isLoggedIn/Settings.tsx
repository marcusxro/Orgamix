import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../../comps/Sidebar'
import NoUserProfile from '../../assets/UserNoProfile.jpg'
import IsLoggedIn from '../../firebase/IsLoggedIn'
import { supabase } from '../../supabase/supabaseClient'
import imageCompression from 'browser-image-compression';
import Loader from '../../comps/Loader'
import moment from 'moment'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { BiSolidError } from "react-icons/bi";
import { FaCheck } from "react-icons/fa";
import { motion } from 'framer-motion';

interface pubsType {
    publicUrl: string
}

interface dataType {
    userid: string;
    username: string;
    password: string;
    email: string;
    id: number;
    fullname: string;
}


const Settings: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const MAX_FILE_SIZE = 200 * 1024; // 200 KB
    const [imageUrl, setImageUrl] = useState<pubsType | null>(null); // Initialize as null
    const [isAllowed, setIsAllowed] = useState<boolean>(false)
    const [changedImage, setChangedImg] = useState<string | null>(null)
    const [user]: any = IsLoggedIn()
    const [loading, setLoading] = useState<boolean>(false)
    const fileInputRef = useRef<HTMLInputElement>(null); // Add ref for the file input
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [username, setUsername] = useState<string>("")
    const [isEdit, setIsEdit] = useState<boolean>(true)
    const [currentPassword, setCurr] = useState<string>("")
    const [newPass, setNewPass] = useState<string>("")
    const [confirmPass, setConfirmPass] = useState<string>("")


    useEffect(() => {
        if (user && fetchedData) {
            setUsername(fetchedData != null && fetchedData[0]?.username || "")
            console.log(fetchedData != null && fetchedData)
        }
    }, [fetchedData, user])

    const [isErrorPfp, setIsErrorPfp] = useState<string | null>(null)

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

    const fetchImage = async () => {
        if (!user) return; // Ensure user is logged in
        try {
            // Get the public URL for the fixed image name
            const { data: publicData, error: urlError }: any = supabase
                .storage
                .from('profile')
                .getPublicUrl(`images/${user.uid}/profile_picture.jpg`);

            if (urlError || !publicData.publicUrl) {
                console.error('Error getting public URL:', urlError?.message);
                setImageUrl(null); // Reset URL if there's an error
            } else {
                // Check if the image exists by attempting to fetch it
                const response = await fetch(publicData.publicUrl);
                if (response.ok) {
                    setImageUrl({ publicUrl: `${publicData.publicUrl}?t=${Date.now()}` });
                } else {
                    setImageUrl(null); // Set to null if the image is not found (404)
                }
            }
        } catch (error) {
            console.error('Error fetching image:', error);
        }
    };

    const [isCompletedPfp, setIsCompletedPfp] = useState<boolean>(false)



    const uploadImage = async () => {
        setLoading(true)
        if (loading) return

        if (!file || !user) {
            setLoading(false)
            return
        };
        try {
            const compressedFile = await imageCompression(file, {
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
                setLoading(false)
                fetchImage();
                setFile(null)
                setFile(null); // Clear the file state
                setIsCompletedPfp(true)
                setIsErrorPfp(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Clear the file input element
                }
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setIsErrorPfp("Error occured, please try again later")
            setLoading(false)
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        if (user) {
            fetchImage();
            getAccounts()
        }
    }, [user]);



    async function getAccounts() {
        try {
            const { data, error } = await supabase.from('accounts')
                .select('*')
                .eq('userid', user?.uid);
            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setFetchedData(data);
            }
        } catch (err) {
            console.log(err);
        }
    }
    const [isCompletedName, setIsCompletedName] = useState<boolean>(false)
    const [isLoadingName, setIsLoadingName] = useState<boolean>(false)

    async function editUserName() {
        setIsLoadingName(true)
        if (isLoadingName) {
            return
        }
        if (!username) {
            setIsLoadingName(false)
            return
        }
        try {
            const { error } = await supabase.from('accounts')
                .update({
                    username: username
                })
                .eq('userid', user?.uid)
            if (error) {
                console.error('Error fetching data:', error);
                setIsCompletedName(false)
                setIsLoadingName(false)
            } else {
                setIsLoadingName(false)
                setIsEdit(prevs => !prevs)
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if (isCompletedName) {
            setTimeout(() => {
                setCompleted(false);
            }, 3000);
        }
    }, [isCompletedName])

    useEffect(() => {
        if (isCompletedPfp) {
            setTimeout(() => {
                setIsCompletedPfp(false);
            }, 3000);
        }
    }, [isCompletedPfp])

    const [IsError, setError] = useState<string | null>(null)
    const [completed, setCompleted] = useState<boolean>(false)
    const [loadingPass, setLoadingPass] = useState<boolean>(false)

    async function handleChangePass() {
        setLoadingPass(true)
        if (loadingPass) return
        if (!currentPassword) {
            setLoadingPass(false)
            return
        };

        // Check if new password and confirm password match
        if (newPass !== confirmPass) {
            setError("New password and confirmation do not match.");
            setLoadingPass(false)
            throw new Error("New password and confirmation do not match.");
        }

        // Check password strength
        const hasUpperCase = /[A-Z]/.test(newPass);
        const hasLowerCase = /[a-z]/.test(newPass);
        const hasNumber = /\d/.test(newPass);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPass);

        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
            setError("Password must contain uppercase, lowercase, number, and special character.");
            setLoadingPass(false)
            throw new Error("Password must contain uppercase, lowercase, number, and special character.");
        }

        const credential = EmailAuthProvider.credential(user?.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            // If re-authentication is successful, update the password

            await updatePassword(user, newPass);
            console.log("Password updated successfully.");

            // Clear inputs after successful password change
            setConfirmPass("");
            setCurr("");
            setNewPass("");
            setError(null)
            setCompleted(true)

            setLoadingPass(false)

        } catch (error: any) {
            setLoadingPass(false)
            console.error("Error updating password:", error.message);
            setError("Error updating password");

            if (error.code === "auth/invalid-credential") {
                setError("Current password is wrong.");
            }
        }
    }

    // Zedmain00!

    useEffect(() => {
        if (completed) {
            setTimeout(() => {
                setCompleted(false);
            }, 3000);
        }
    }, [completed])

    const messageVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };


    return (
        <div className='mb-5'>
            <Sidebar location='Settings' />

            <div className={`ml-[86px] p-3 flex gap-3 flex-col h-[100dvh] mr-[0px]`}>
                <div>
                    <div className='text-2xl font-bold'>Settings</div>
                    <p className="text-[#888] text-sm">Manage your account preferences, privacy, and system settings to customize your experience.</p>
                </div>

                <div className='mt-5 bg-[#111] p-3 border-[1px] border-[#535353] rounded-lg'>
                    <div className=''>
                        <div className='text-xl font-bold'>Profile Details</div>
                    </div>

                    <div className='mt-8'>
                        {isCompletedPfp && (
                            <motion.div
                                className='w-full bg-green-500 p-2 rounded-lg max-w-[305px] my-2 flex items-center gap-2 break-all'
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={messageVariants}
                                transition={{ duration: 0.2 }}
                            >
                                <FaCheck /> Profile successfully changed!
                            </motion.div>
                        )}

                        {isErrorPfp !== null && (
                            <motion.div
                                className='w-full bg-red-500 p-2 rounded-lg mb-2 max-w-[305px] flex items-center gap-2 break-all'
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={messageVariants}
                                transition={{ duration: 0.2 }}
                            >
                                <span className='text-xl'><BiSolidError /></span> {isErrorPfp}
                            </motion.div>
                        )}

                        <div className='flex gap-7 items-center'>
                            <div className='flex flex-col gap-2'>

                                <div className='h-[5em] w-[5em] rounded-full border-[1px] bg-white border-[#535353]'>
                                    {
                                        imageUrl && imageUrl.publicUrl ? (
                                            <img src={changedImage || imageUrl.publicUrl} alt="Profile Preview" className='w-full h-full rounded-full object-cover' />
                                        ) : (
                                            <img src={changedImage ? changedImage : NoUserProfile} className='w-full h-full rounded-full object-cover' />
                                        )
                                    }

                                </div>
                            </div>


                            <div className='flex gap-2 flex-col'>
                                <input
                                    ref={fileInputRef}
                                    className='bg-[#222] border-[1px] border-[#535353] p-1 rounded-md w-full max-w-[200px] text-sm'
                                    type="file"
                                    placeholder='inamo'
                                    accept="image/png, image/jpeg, image/jpg, image/gif" // Accept specific image types
                                    onChange={handleFileChange}
                                />
                                <div
                                    onClick={() => { isAllowed && !loading && uploadImage() }}
                                    className={`${isAllowed ? 'bg-[#222] cursor-pointer' : 'bg-[#888] cursor-not-allowed'}  hover:bg-[#888] flex items-center justify-center border-[1px] 
                                border-[#535353] p-1 rounded-md w-full max-w-[200px] text-sm`}>
                                    {
                                        loading ?
                                            <div className='w-[20px] h-[20px]'>
                                                <Loader />
                                            </div>
                                            :
                                            "Upload"
                                    }

                                </div>
                            </div>

                        </div>


                        <div className='mt-9 border-t-[1px] border-t-[#535353] pt-3'>
                            <div className='mb-5'>Edit account</div>
                            {isCompletedName && (
                                <motion.div
                                    className='w-full bg-green-500 p-2 rounded-lg max-w-[605px] my-2 flex items-center gap-2 break-all'
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={messageVariants}
                                    transition={{ duration: 0.2 }}
                                >
                                    <FaCheck /> Details successfully changed!
                                </motion.div>
                            )}
                            <div className='flex gap-2'>
                                <div className='flex gap-2 flex-col w-full max-w-[300px]'>
                                    <input
                                        readOnly={isEdit}
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value) }}
                                        className={`${isEdit === true ? "text-[#888]" : "text-white"} bg-[#222] border-[1px] border-[#535353] w-full rounded-lg py-1 px-3 outline-none`}
                                        type="text" placeholder='Username' />
                                    <input
                                        value={fetchedData != null && fetchedData[0]?.userid || ""}
                                        className='bg-[#222] border-[1px] text-[#888] border-[#535353] w-full rounded-lg py-1 px-3 outline-none'
                                        type="text" placeholder='Full name' />
                                </div>


                                <div className='flex gap-2 flex-col items-start w-full max-w-[300px]'>
                                    <input
                                        value={fetchedData != null && fetchedData[0]?.email || ""}
                                        className='bg-[#222] border-[1px] border-[#535353] text-[#888] w-full rounded-lg py-1 px-3 outline-none'
                                        type="text" placeholder='Email' />
                                    <div className='flex gap-2 w-full '>
                                        <button
                                            onClick={() => { setIsEdit(prevs => !prevs) }}
                                            className={`${isEdit ? "bg-blue-500" : "bg-red-500"}  border-[1px] border-[#535353] w-full max-w-[100px] rounded-lg p-[4px] outline-none`}>
                                            {
                                                isEdit ?
                                                    "Edit"
                                                    :
                                                    "Cancel"
                                            }
                                        </button>
                                        {
                                            !isEdit &&
                                            <button
                                                onClick={() => { editUserName() }}
                                                className={`bg-green-500 flex items-center justify-center  border-[1px] border-[#535353] w-full max-w-[100px] rounded-lg p-[4px] outline-none`}>
                                                {
                                                    isLoadingName ?
                                                        <div className='w-[20px] h-[20px]'>
                                                            <Loader />
                                                        </div>
                                                        :
                                                        "Save"
                                                }
                                            </button>
                                        }

                                    </div>
                                </div>
                            </div>

                            <div className='mt-9 border-t-[1px] border-t-[#535353] pt-3'>

                                <div className='mb-2'>Other information</div>
                                <div className='pt-3 flex gap-2'>


                                    <div className='w-full max-w-[300px] flex flex-col gap-2'>
                                        <div className='bg-[#222] border-[1px] text-[#888] border-[#535353] w-full rounded-lg py-1 px-3 outline-none'>
                                            Banned: <span>False</span>
                                        </div>
                                        <div className='bg-[#222] border-[1px] text-[#888] border-[#535353] w-full rounded-lg py-1 px-3 outline-none'>
                                            Created at:  <span>{moment(user?.metadata?.createdAt * (user?.metadata?.createdAt.toString().length === 10 ? 1000 : 1)).format('MMMM Do YYYY, h:mm a')}</span>                                  </div>
                                    </div>
                                    <div className='w-full max-w-[300px] flex flex-col gap-2'>
                                        <div className='bg-[#222] border-[1px] text-[#888] border-[#535353] w-full rounded-lg py-1 px-3 outline-none'>
                                            Provider: <span>{user?.providerData[0]?.providerId}</span>
                                        </div>
                                        <div className='bg-[#222] border-[1px] text-[#888] border-[#535353] w-full rounded-lg py-1 px-3 outline-none'>
                                            Created at:  <span>{moment(user?.metadata?.createdAt * (user?.metadata?.createdAt.toString().length === 10 ? 1000 : 1)).format('MMMM Do YYYY, h:mm a')}</span>                                  </div>
                                    </div>

                                </div>
                            </div>


                        </div>

                    </div>


                </div>


                <div className='mt-5 bg-[#111] p-3 border-[1px] border-[#535353] rounded-lg'>
                    <div>
                        <div className='text-xl font-bold'>Password</div>
                        <p className="text-[#888] text-sm">Manage your account preferences, privacy, and system settings to customize your experience.</p>
                    </div>



                    <div className='mt-9 border-t-[1px] border-t-[#535353] pt-3 flex flex-col gap-2'>
                        {/* Error Message */}
                        {IsError !== null && (
                            <motion.div
                                className='w-full bg-red-500 p-2 rounded-lg max-w-[605px] flex items-center gap-2 break-all'
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={messageVariants}
                                transition={{ duration: 0.2 }}
                            >
                                <span className='text-xl'><BiSolidError /></span> {IsError}
                            </motion.div>
                        )}

                        {/* Success Message */}
                        {completed && (
                            <motion.div
                                className='w-full bg-green-500 p-2 rounded-lg max-w-[605px] flex items-center gap-2 break-all'
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={messageVariants}
                                transition={{ duration: 0.2 }}
                            >
                                <FaCheck /> Password successfully changed!
                            </motion.div>
                        )}

                        <div className='flex gap-2 flex-col sm:flex-row'>
                            <div className='w-full max-w-[full] sm:max-w-[300px] flex gap-2 flex-col'>
                                <input
                                    value={currentPassword}
                                    onChange={(e) => { setCurr(e.target.value) }}
                                    className='bg-[#222] border-[1px]  border-[#535353] w-full rounded-lg py-1 px-3 outline-none'
                                    type="text" placeholder='Current password' />
                                <input
                                    value={newPass}
                                    onChange={(e) => { setNewPass(e.target.value) }}
                                    className={`${newPass != confirmPass && "text-red-500"} bg-[#222] border-[1px]  border-[#535353] w-full rounded-lg py-1 px-3 outline-none`}
                                    type="text" placeholder='New password' />
                            </div>

                            <div className='w-full max-w-[full] sm:max-w-[300px] flex gap-2 flex-col'>
                                <input
                                    value={confirmPass}
                                    onChange={(e) => { setConfirmPass(e.target.value) }}
                                    className={`${newPass != confirmPass && "text-red-500"} bg-[#222] border-[1px]  border-[#535353] w-full rounded-lg py-1 px-3 outline-none`}
                                    type="text" placeholder='Confirm password' />

                                <button
                                    onClick={() => {
                                        (currentPassword != "" && newPass === confirmPass && newPass != "" && confirmPass != "") && handleChangePass()
                                    }}
                                    className={`${(currentPassword != "" && newPass === confirmPass && newPass != "" && confirmPass != "") ? "bg-green-500" : "bg-[#888]"} flex items-center justify-center  h-full rounded-lg w-full max-w-[200px] p-1`}>
                                    {
                                        loadingPass ?
                                            <div className='w-[20px] h-[20px]'>
                                                <Loader />
                                            </div>
                                            :
                                            " Change password"
                                    }
                                </button>
                            </div>
                        </div>

                    </div>


                </div>
            </div>
        </div>
    )
}

export default Settings