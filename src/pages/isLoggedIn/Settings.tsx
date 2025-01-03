import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../../comps/System/layouts/Sidebar'
import NoUserProfile from '../../assets/UserNoProfile.jpg'
import IsLoggedIn from '../../comps/Utils/IsLoggedIn'
import { supabase } from '../../comps/Utils/supabase/supabaseClient'
import imageCompression from 'browser-image-compression';
import Loader from '../../comps/Svg/Loader'
import { BiSolidError } from "react-icons/bi";
import { FaCheck } from "react-icons/fa";
import { motion } from 'framer-motion';
import { IoIosLogOut } from "react-icons/io";
import Footer from '../../comps/System/layouts/Footer'
import MetaEditor from '../../comps/MetaHeader/MetaEditor'
import { useNavigate } from 'react-router-dom'

interface pubsType {
    publicUrl: string
}

interface payment_tokens {
    token: string;
    is_used: boolean;
    created_at: string;
    expires_at: string;
    userPlan: string;
}

interface dataType {
    userid: string;
    username: string;
    password: string;
    email: string;
    id: number;
    fullname: string;
    plan: string;
    payment_tokens: payment_tokens
}


const Settings: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileAttachment, setFileAttachment] = useState<File | null>(null);
    const nav = useNavigate()

    const MAX_FILE_SIZE = 200 * 1024; // 200 KB
    const [imageUrl, setImageUrl] = useState<pubsType | null>(null); // Initialize as null
    const [isAllowed, setIsAllowed] = useState<boolean>(false)
    const [changedImage, setChangedImg] = useState<string | null>(null)
    const [user]: any = IsLoggedIn()
    const [loading, setLoading] = useState<boolean>(false)
    const fileInputRef = useRef<HTMLInputElement>(null); // Add ref for the file input
    const fileInputRefAttachment = useRef<HTMLInputElement>(null); // Add ref for the file input
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [username, setUsername] = useState<string>("")
    const [isEdit, setIsEdit] = useState<boolean>(true)
    const [currentPassword, setCurr] = useState<string>("")
    const [newPass, setNewPass] = useState<string>("")
    const [confirmPass, setConfirmPass] = useState<string>("")


    useEffect(() => {
        if (user && fetchedData) {
            setUsername(fetchedData != null && fetchedData[0]?.username || "")
        }
    }, [fetchedData, user])

    const [isErrorPfp, setIsErrorPfp] = useState<string | null>(null)
    const [isErrorAttach, setIsErrorAttach] = useState<string | null>(null)

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

            setIsAllowed(true)
            setFile(selectedFile);
            setChangedImg(URL.createObjectURL(selectedFile)); // Set image preview URL
        }
    };

    const handleFileChangeAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;

        // Validate file type and size
        if (selectedFile) {
            const isImage = selectedFile.type.startsWith('image/');
            const isUnderLimit = selectedFile.size <= 500 * 1024;

            if (!isImage) {
                setIsErrorAttach('Please select an image file.');
                setFileAttachment(null);
                return;
            }

            if (!isUnderLimit) {
                setIsErrorAttach('File size must be less than 500 KB.');
                setFileAttachment(null);
                return;
            }

            setIsAllowed(true)
            setFileAttachment(selectedFile);
        }
    };


    const fetchImage = async () => {
        if (!user) return; // Ensure user is logged in
        try {
            // Get the public URL for the fixed image name
            const { data: publicData, error: urlError }: any = supabase
                .storage
                .from('profile')
                .getPublicUrl(`images/${user.id}/profile_picture.jpg`);

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

        if (loading) return
        setLoading(true)
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
            const filePath = `images/${user.id}/profile_picture.jpg`; // Fixed file name for the profile picture

            // Remove the existing image (optional but recommended)
            await supabase.storage.from('profile').remove([filePath]);

            // Upload the image to the user's UID folder with a fixed name
            const { error } = await supabase.storage
                .from('profile')
                .upload(filePath, compressedFile); // No upsert; we remove the old one first

            if (error) {
                console.error('Error uploading file:', error.message);
                setLoading(false)
            } else {
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


    const [loadingFeedBacks, setLoadingFeedBacks] = useState<boolean>(false)

    const uploadImageAttachment = async () => {
        setLoadingFeedBacks(true)

        if (!fileAttachment || !user) {
            return false; // Return false if no file or user
        }


        try {
            const compressedFile = await imageCompression(fileAttachment, {
                maxSizeMB: 0.2,
                useWebWorker: true,
                maxWidthOrHeight: 500
            });
            const timestamp = Date.now(); // Get the current timestamp
            const newFileName = `${timestamp}-${fileAttachment.name}`; // Create a unique file name
            const filePath = `attachments/${user.id}/${newFileName}`; // Use the new unique file name

            const { data, error } = await supabase.storage
                .from('profile')
                .upload(filePath, compressedFile);

            if (error) {
                console.error('Error uploading file:', error.message);

                return false; // Return false if upload failed
            } else {

                setFileAttachment(null);
                setIsErrorAttach(null)
                if (fileInputRefAttachment.current) {
                    fileInputRefAttachment.current.value = ''; // Clear file input
                }
                return newFileName; // Return true if upload succeeded
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            return false; // Return false if an error occurs
        } finally {
            setLoading(false);
        }
    };
    const [sentFeedback, setIsSet] = useState<boolean>(false)

    async function sendFeedbacks() {

        const uploadSuccessful = await uploadImageAttachment();

        if (!feedbackType || !description || !rating) {
            setLoadingFeedBacks(false)
            return
        }

        try {
            const { error } = await supabase
                .from('feedbacks')
                .insert({
                    type: feedbackType,
                    description: description,
                    attachment: uploadSuccessful,
                    rating: rating,
                    userid: user?.id,
                    created_at: Date.now()
                });

            if (error) {
                console.error('Error inserting feedback:', error);
                setLoadingFeedBacks(false)
            } else {
                console.log('Feedback submitted successfully.');
                setFeedbackType("General Feedback")
                setDescription("")
                setRating(0)
                setLoadingFeedBacks(false)
                setIsSet(true)
            }
        } catch (err) {
            setLoadingFeedBacks(false)
            console.log('Error in sendFeedbacks:', err);
        }
    }


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
                .eq('userid', user?.id);
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
                .eq('userid', user?.id)
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

    useEffect(() => {
        if (sentFeedback) {
            setTimeout(() => {
                setIsSet(false);
            }, 3000);
        }
    }, [sentFeedback])

    const [IsError, setError] = useState<string | null>(null)
    const [completed, setCompleted] = useState<boolean>(false)
    const [loadingPass, setLoadingPass] = useState<boolean>(false)




    async function handleChangePass() {
        setLoadingPass(true);
        setError(null);

        // Prevent multiple submissions
        if (loadingPass) return;

        // Validate current password
        if (!currentPassword) {
            setError("Current password is required.");
            setLoadingPass(false);
            return;
        }

        // Validate if new password and confirm password match
        if (newPass !== confirmPass) {
            setError("New password and confirmation do not match.");
            setLoadingPass(false);
            return;
        }

        // Validate password strength
        const hasUpperCase = /[A-Z]/.test(newPass);
        const hasLowerCase = /[a-z]/.test(newPass);
        const hasNumber = /\d/.test(newPass);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPass);

        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
            setError("Password must contain uppercase, lowercase, number, and special character.");
            setLoadingPass(false);
            return;
        }

        try {
            // Authenticate with current password
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email,
                password: currentPassword,
            });

            if (signInError) {
                setError("Authentication failed. Please check your current password.");
                setLoadingPass(false);
                return;
            }

            // Update the password
            const { data: updateData, error: updateError } = await supabase.auth.updateUser({
                password: newPass,
            });

            if (updateError) {
                setError("Failed to update password. Please try again.");
                setLoadingPass(false);
                return;
            }

            // Success feedback
            setConfirmPass("");
            setCurr("");
            setNewPass("");
            setError(null)
            setCompleted(true)

            setLoadingPass(false)

        } catch (err) {
            console.error("Error changing password:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoadingPass(false);
        }
    }


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

    const [feedbackType, setFeedbackType] = useState('General Feedback');
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState<number | any>(3);

    async function logOutUser() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error logging out:', error.message);
            } else {
                console.log("Logout successful");
                nav('/sign-in');
            }
        } catch (err) {
            console.error('Error logging out:', err);
        }
    }

    const [chosenPlan, setChosenPlan] = useState<string>("student")

    return (
        <div className='selectionNone'>
            <Sidebar location='Settings' />
            {
                user &&
                <MetaEditor
                    title={`Settings | ${user?.email}`}
                    description='Manage your account preferences, privacy, and system settings to customize your experience.'
                    keywords='settings, account, preferences, privacy, system settings'
                />
            }

            <div className='flex flex-col w-full max-w-[1300px] mx-auto'>
                <div className={`ml-[86px] p-3  flex gap-3 flex-col h-auto `}>
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

                                {/* <div className='mt-9 border-t-[1px] border-t-[#535353] pt-3'>

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
                                                Last sign in:  <span>{moment(user?.metadata?.lastLoginAt
                                                    * (user?.metadata?.lastLoginAt
                                                        .toString().length === 10 ? 1000 : 1)).format('MMMM Do YYYY, h:mm a')}</span>                                  </div>
                                        </div>

                                    </div>
                                </div> */}


                            </div>

                            <div className='mt-9 border-t-[1px] border-t-[#535353] pt-3'>
                                <div className='mb-2 font-bold'>Subscription</div>
                                <p className='text-[#888] text-sm'>
                                    {

                                        fetchedData && fetchedData && fetchedData[0]?.plan === "free" ?
                                            "You are currently on the free plan. Upgrade to student or team plan to unlock more features."
                                            : fetchedData && fetchedData[0]?.plan === "STUDENT-PLAN" ?
                                                "You are currently on the student plan. Enjoy your benefits!"
                                                : fetchedData && fetchedData[0]?.plan === "TEAM-PLAN" ?
                                                    "You are currently on the team plan. Enjoy all the features with your team!"
                                                    :
                                                    "You are on an unknown plan. Please contact support."
                                    }

                                </p>

                                <p className='text-sm'>
                                    {
                                        fetchedData && fetchedData[0]?.plan != 'free' && (() => {
                                            const subscriptionStartDate = new Date(fetchedData[0]?.payment_tokens?.expires_at || new Date());
                                            const currentDate = new Date();

                                            // Calculate the expiration date as the same date next month
                                            const expirationDate = new Date(subscriptionStartDate);
                                            expirationDate.setMonth(subscriptionStartDate.getMonth() + 1);

                                            // Adjust the day if the next month has fewer days (e.g., February)
                                            if (expirationDate.getDate() !== subscriptionStartDate.getDate()) {
                                                expirationDate.setDate(0); // Set to the last valid day of the month
                                            }

                                            const isExpired = currentDate > expirationDate;

                                            return isExpired ? (
                                                <span className="text-red-500">
                                                    Your subscription has expired. Please renew your subscription.
                                                </span>
                                            ) : (
                                                <span className='text-green-600'>
                                                    Your subscription is active until {expirationDate.toLocaleDateString()}
                                                </span>
                                            );
                                        })()
                                    }

                                </p>

                                {
                                    fetchedData && fetchedData[0]?.plan === "free" &&
                                    <div className='flex gap-2 mt-3'>
                                        <select
                                            onChange={(e) => { setChosenPlan(e.target.value) }}
                                            className='bg-[#222] border-[1px] border-[#535353] w-full max-w-[100px] rounded-lg p-[4px] outline-none'
                                            name="" id="">
                                            <option value="student">Student</option>
                                            <option value="team">Team</option>
                                        </select>
                                        <button
                                            onClick={() => { nav(`/user/checkout/${chosenPlan}`) }}
                                            className='bg-blue-500 border-[1px] border-[#535353] w-full max-w-[100px] rounded-lg p-[4px] outline-none'>
                                            Upgrade
                                        </button>
                                    </div>
                                }
                                {
                                    fetchedData && fetchedData[0]?.plan === "student" &&
                                    <div className='flex gap-2 mt-3'>
                                        <button
                                            className='bg-red-500 border-[1px] border-[#535353] w-full max-w-[100px] rounded-lg p-[4px] outline-none'>
                                            Downgrade
                                        </button>
                                        <button
                                            className='bg-red-500 border-[1px] border-[#535353] w-full max-w-[100px] rounded-lg p-[4px] outline-none'>
                                            Refund
                                        </button>
                                    </div>
                                }
                                {
                                    fetchedData && fetchedData[0]?.plan === "team" &&
                                    <div className='flex gap-2 mt-3'>
                                        <button
                                            className='bg-red-500 border-[1px] border-[#535353] w-full max-w-[100px] rounded-lg p-[4px] outline-none'>
                                            Downgrade
                                        </button>
                                        <button
                                            className='bg-red-500 border-[1px] border-[#535353] w-full max-w-[100px] rounded-lg p-[4px] outline-none'>
                                            Refund
                                        </button>
                                    </div>
                                }
                            </div>
                        </div>


                    </div>



                    <div className='mt-5 bg-[#111] p-3 border-[1px] border-[#535353] rounded-lg'>
                        <div>
                            <div className='text-xl font-bold'>Password</div>
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

                    <div className='mt-5 bg-[#111] p-3 border-[1px] border-[#535353] rounded-lg'>
                        <div>
                            <div className='text-xl font-bold'>Feedback</div>
                        </div>
                        {isErrorAttach !== null && (
                            <motion.div
                                className='w-full bg-red-500 p-2 mt-2 rounded-lg max-w-[305px] flex items-center gap-2 break-all'
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={messageVariants}
                                transition={{ duration: 0.2 }}
                            >
                                <span className='text-xl'><BiSolidError /></span> {isErrorAttach}
                            </motion.div>
                        )}
                        {sentFeedback && (
                            <motion.div
                                className='w-full bg-green-500 p-2 rounded-lg max-w-[505px] my-2 flex items-center gap-2 break-all'
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={messageVariants}
                                transition={{ duration: 0.2 }}
                            >
                                <FaCheck /> Your feedback has been successfully submitted.

                            </motion.div>
                        )}


                        <div className="mb-4 mt-5 w-full max-w-[300px]">
                            <label htmlFor="feedbackType" className="block text-[#888] font-medium mb-2">Feedback Type</label>
                            <select
                                id="feedbackType"
                                value={feedbackType}
                                onChange={(e) => setFeedbackType(e.target.value)}
                                className="w-full p-2  bg-[#222] border-[1px]  border-[#535353] outline-none rounded-md"
                            >
                                <option value="General Feedback">General Feedback</option>
                                <option value="Bug Report">Bug Report</option>
                                <option value="Feature Request">Feature Request</option>
                            </select>
                        </div>

                        <div className="mb-4 w-full max-w-[300px]">
                            <label htmlFor="description" className="block text-[#888] outline-none font-medium mb-2">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required

                                className="w-full p-2  outline-none  bg-[#222] border-[1px]  border-[#535353] rounded-md resize-none"
                            />

                        </div>
                        <div className="mb-4">
                            <label htmlFor="attachment" className="block text-[#888] font-medium mb-2">Attachment (Optional)</label>
                            <input
                                ref={fileInputRefAttachment}
                                className='bg-[#222] border-[1px] border-[#535353] p-1 rounded-md w-full max-w-[200px] text-sm'
                                type="file"
                                placeholder='inamo'
                                accept="image/png, image/jpeg, image/jpg, image/gif" // Accept specific image types
                                onChange={handleFileChangeAttachment}
                            />
                        </div>

                        <div className="mb-4 w-full max-w-[300px]">
                            <label className="block  text-[#888] font-medium mb-2">Rate Our System (1-5)</label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={rating}
                                accept="image/png, image/jpeg, image/jpg, image/gif" // Accept specific image types
                                onChange={(e) => setRating(e.target.value)}
                                className="w-full"
                            />
                            <div className="text-gray-700 mt-1">Rating: {rating}</div>
                        </div>

                        <div
                            onClick={() => { !loadingFeedBacks && sendFeedbacks() }}
                            className={`${!description || !feedbackType ? 'bg-[#888]' : 'bg-green-500 '} w-full max-w-[200px] flex items-center justify-center rounded-lg text-center cursor-pointer border-[1px] border-[#535353] p-1`}>
                            {
                                loadingFeedBacks ?
                                    <div className='w-[20px] h-[20px]'>
                                        <Loader />
                                    </div>
                                    :
                                    "Send"
                            }

                        </div>

                    </div>

                    <div className='mt-5 bg-[#111] p-3 border-[1px] border-[#535353] rounded-lg'>
                        <div className='flex gap-5 items-center'>
                            <div className='text-xl font-bold'>Logout</div>
                            <div
                                onClick={logOutUser}
                                className='bg-red-500 text-white p-3 rounded-lg cursor-pointer hover:bg-[#888]'>
                                <IoIosLogOut />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div className='ml-[81px]'>
                <Footer />
            </div>
        </div>
    )
}

export default Settings
