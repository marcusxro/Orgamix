import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../../Zustand/UseStore';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../supabase/supabaseClient';
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import { CiEdit } from "react-icons/ci";
import Loader from '../../Loader';
import { CiStar } from "react-icons/ci";
import { IoMdStar } from "react-icons/io"; //filled star color
import { Button } from './Button';
import moment from 'moment';

interface invitedEmails {
    username: string;
    email: string;
    uid: string;
}

interface updatedAt {
    date: string;
    username: string;
    email: string;
    uid: string;
    itemMoved: string
}


interface tasksType {
    title: string;
    created_at: number;
    created_by: string;
    priority: string;
    type: string;
    start_work: string;
    deadline: string;
    assigned_to: string; //uid basis
}

interface boardsType {
    title: string;
    titleColor: string; //hex
    created_at: number;
    board_uid: string;
    created_by: string;
    tasks: tasksType[]
}


interface dataType {
    description: string;
    id: number;
    created_at: number;
    name: string;
    created_by: string;
    deadline: number;
    is_shared: string;
    invited_emails: null | invitedEmails[];
    updated_at: null | updatedAt[];
    is_favorite: boolean;
    boards: boardsType[]
}
interface accountType {
    userid: string;
    username: string;
    password: string;
    email: string;
    id: number;
    fullname: string;
}
const ProjectSettings = () => {
    const [isExiting, setIsExiting] = useState(false);
    const { setOpenKanbanSettings}: any = useStore()
    const params = useParams()
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [projectTitle, setProjectTitle] = useState<string>("");
    const [projectDesc, setProjectDesc] = useState<string>("");
    const [projectDeadline, setProjectDeadline] = useState<any | null>(null);
    const [projectStar, setProjectStar] = useState<boolean | null>(null);
    const [adminData, setAdminData] = useState<accountType[] | null>(null);

    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [isEq, setIsEq] = useState("")

    const [loading,setLoading] = useState<boolean>(false)

    useEffect(() => {
        if (fetchedData) {
            setProjectTitle(fetchedData[0]?.name || "")
            setProjectDesc(fetchedData[0]?.description || "")
            setProjectDeadline(fetchedData[0]?.deadline || null)
            setProjectStar(fetchedData[0]?.is_favorite || null)
        }
    }, [fetchedData, isEdit])

    const [user] = IsLoggedIn()

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setOpenKanbanSettings(false);
            setIsExiting(false);
        }, 300);
    };



    useEffect(() => {
        if (user) {
            getProjects();
            const subscription = supabase
                .channel('public:projects')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                    handleRealtimeEvent(payload);
                })
                .subscribe();
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user]);

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


    async function getProjects() {
        try {
            // First query: Fetching projects
            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('created_at', params?.time);

            // Handle error for the first query
            if (projectError) {
                console.error('Error fetching project data:', projectError);
                return;
            }

            // Check if project data exists
            if (projectData && projectData.length > 0) {
                const createdBy = projectData[0]?.created_by;

                // Second query: Fetching related accounts based on created_by from the first query
                const { data: accountData, error: accountError } = await supabase
                    .from('accounts')
                    .select('*')
                    .eq('userid', createdBy);

                // Handle error for the second query
                if (accountError) {
                    console.error('Error fetching account data:', accountError);
                    return;
                }

                // If account data exists, update the state with it
                if (accountData) {
                    setAdminData(accountData);  // Set admin data from the second query
                }
            }

            // After both queries are done, update fetched data if projectData is available
            if (projectData) {
                setFetchedData(projectData);
                console.log(projectData);  // Logging the fetched project data
            }

        } catch (err) {
            console.error('Error in getProjects:', err);
        }
    }

    async function setAsFav() {
        try {
            const { error } = await supabase
                .from('projects')
                .update({
                    is_favorite: fetchedData && !fetchedData[0]?.is_favorite
                })
                .eq('created_at', params?.time)

            if (error) {
                return console.error('Error fetching data:', error);
            } else {
                console.log("dne")
            }
        }
        catch (err) {
            console.log(err)
        }
    }

    async function editProject() {
        setLoading(true);
    
        if (!fetchedData) {
            setLoading(false);
            return;
        }
    
        if (loading) {
            setLoading(false);
            return;
        }
    
        if (!projectDesc || !projectTitle) {
            console.log("haha");
            setLoading(false);
            return;
        }
    
        try {
            let finalTitle = projectTitle;
    
            // Check if the title is changing
            if (projectTitle !== fetchedData[0]?.name) {
                // Check if any project has a similar name
                const { data: existingProjects, error: fetchError } = await supabase
                    .from('projects')
                    .select('name')
                    .like('name', `${projectTitle}%`);
    
                if (fetchError) {
                    console.error('Error fetching data:', fetchError);
                    setLoading(false);
                    return;
                }
    
                // Find the highest index if there are similar names
                if (existingProjects.length > 0) {
                    const namePattern = new RegExp(`^${projectTitle} \\((\\d+)\\)$`);
                    let maxIndex = 1;
    
                    existingProjects.forEach(project => {
                        const match = project.name.match(namePattern);
                        if (match) {
                            maxIndex = Math.max(maxIndex, parseInt(match[1], 10) + 1);
                        } else if (project.name === projectTitle) {
                            maxIndex = 2;
                        }
                    });
    
                    finalTitle = `${projectTitle} (${maxIndex})`;
                }
            }
    
            // Update the project
            const { error } = await supabase
                .from('projects')
                .update({
                    name: finalTitle,
                    description: projectDesc,
                    deadline: projectDeadline
                })
                .eq('created_at', params?.time);
    
            if (error) {
                console.error('Error updating data:', error);
            } else {
                console.log("Project updated successfully");
                setIsEdit(false);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setLoading(false);
        }
    }
    

    const nav = useNavigate()


    async function deleteProject() {
        setLoading(true)

        if(loading) {
            return setLoading(false)
        }

        try {
            const { error } = await supabase
            .from('projects')
            .delete()
            .eq('created_at', params?.time)

        if (error) {
            setLoading(false)
            return console.error('Error fetching data:', error);
        } else {
            handleOutsideClick()
            console.log("dne")
            setLoading(false)
            setIsEdit(false)
            nav('/user/projects')
        }
        }
        catch(err) {
            console.log(err)
            setLoading(false)
        }
    }


    return (
        <AnimatePresence>
            {
                !isExiting &&       (fetchedData && fetchedData.length > 0 && (
                    (fetchedData[0]?.is_shared !== "private") ||
                    (fetchedData[0]?.is_shared === "private" && fetchedData[0]?.created_by === user?.uid))) &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className='ml-auto positioners flex items-center p-3 justify-center w-full h-full'
                    onClick={() => {!loading && handleOutsideClick()}}>

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        className={`w-[450px] h-full max-h-[700px] bg-[#313131] z-[5000] rounded-lg p-3 overflow-auto border-[#535353] border-[1px]  flex flex-col justify-between`}
                        onClick={(e) => e.stopPropagation()} >
                        <div className='overflow-auto  h-full' >
                            <div className='mb-4'>
                                <div className='text-xl font-bold'>Project settings</div>
                                <div className='text-sm text-[#888] mt-1'>
                                    Edit, Delete, and view some informations here for your project.
                                </div>
                            </div>
                            {
                                fetchedData && adminData ?
                                    <>
                                        <div className='flex flex-col mt-5'>
                                            <div className='flex items-end gap-2'>
                                                <div className='w-full flex flex-col gap-1'>
                                                    <div className='text-[#888]'>
                                                        Title
                                                    </div>
                                                    <input
                                                        maxLength={40}
                                                        readOnly={!isEdit}
                                                        value={projectTitle}
                                                        placeholder='Project title'
                                                        onChange={(e) => { setProjectTitle(e.target.value) }}
                                                        className={`bg-[#111] ${isEdit ? "text-white cursor-text" : "cursor-not-allowed text-[#888]"} border-[#535353] border-[1px] rounded-lg w-full p-2 outline-none`}
                                                    />
                                                </div>
                                                <div
                                                    className='flex gap-2' >
                                                    {
                                                        isEdit ?
                                                            <>
                                                                <div
                                                                  onClick={() => {!loading && setIsEdit(prevs => !prevs) }}
                                                                 className={`${isEdit && "text-red-500"}  hover:bg-[#1111] bg-[#222] border-[#535353] border-[1px]  p-2  rounded-lg cursor-pointer`}>
                                                                    Cancel
                                                                </div>
                                                                <div 
                                                                onClick={editProject}
                                                                className={`${isEdit && "text-green-500 flex items-center"} hover:bg-[#1111] bg-[#222] border-[#535353] border-[1px]  p-2  rounded-lg cursor-pointer`}>
                                                                    {
                                                                        loading ? 
                                                                        <div className='w-[20px] h-[20px] flex items-center justify-center'>
                                                                            <Loader />
                                                                        </div>
                                                                        :
                                                                        "Save"
                                                                    }
                                                                </div>
                                                            </>

                                                            :
                                                            <div
                                                            onClick={() => {(!loading && fetchedData && fetchedData[0]?.created_by === user?.uid )&& setIsEdit(prevs => !prevs) }}
                                                             className={`${isEdit && "text-green-500"} ${fetchedData && fetchedData[0]?.created_by === user?.uid && "cursor-pointer"}  cursor-not-allowed bg-[#222] border-[#535353] border-[1px]  p-2 text-2xl rounded-lg`}>
                                                                <CiEdit />
                                                            </div>

                                                    }


                                                </div>
                                            </div>
                                            <div className='h-full max-h-[300px] mt-2 flex flex-col gap-1'>
                                                <div className='text-[#888]'>
                                                    Description
                                                </div>
                                                <textarea
                                                    value={projectDesc}
                                                    onChange={(e) => { setProjectDesc(e.target.value) }}
                                                    placeholder='Project description'
                                                    readOnly={!isEdit}
                                                    className={`bg-[#111] ${isEdit ? "text-white cursor-text" : "cursor-not-allowed text-[#888]"} h-full resize-none  border-[#535353] border-[1px] rounded-lg w-full p-2 outline-none`}

                                                />
                                            </div>
                                            <div className='flex flex-col gap-1'>
                                                <div className='text-[#888]'>
                                                    deadline
                                                </div>
                                                <input
                                                    value={projectDeadline?.toString()}
                                                    onChange={(e) => { setProjectDeadline(e.target.value) }}
                                                    readOnly={!isEdit}
                                                    className={`bg-[#111] ${isEdit ? "text-white cursor-text" : "cursor-not-allowed text-[#888]"} h-full resize-none  border-[#535353] border-[1px] rounded-lg w-full p-2 outline-none`}
                                                    type="date" />
                                            </div>

                                            <div className='mt-5 text-sm text-[#888] flex items-start justify-between  gap-2'>
                                                <div
                                                    onClick={() => {fetchedData && fetchedData[0]?.created_by === user?.uid && setAsFav()}}
                                                    className={`${fetchedData && fetchedData[0]?.created_by === user?.uid ? "cursor-pointer" : "cursor-not-allowed"}  flex items-center gap-2 w-auto bg-[#222] p-2 rounded-lg`}>
                                                    Favorite
                                                    <div className='text-2xl'>
                                                        {
                                                            projectStar ?
                                                                <div className='text-yellow-500'>
                                                                    <IoMdStar />
                                                                </div>
                                                                :

                                                                <CiStar />

                                                        }
                                                    </div>
                                                </div>

                                                <div className='flex flex-col w-full justify-end items-end'>
                                                    <div className='flex gap-2 text-[#888] '>
                                                        <div>Created at:</div>
                                                        <div>
                                                            {fetchedData[0]?.created_at
                                                                ? moment(parseInt(fetchedData[0]?.created_at.toString())).format('MMMM Do YYYY')
                                                                : 'No Creation date'}
                                                        </div>
                                                    </div>
                                                    <div className='flex gap-2 text-[#888] '>
                                                        <div>Created by:</div>
                                                        <div>
                                                            {adminData != null && adminData[0]?.username.length >= 10 ? (adminData[0]?.username.slice(0, 10) + "...") : (adminData && adminData[0]?.username)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='mt-5 mb-5'>
                                                <div className='text-[#888]'>
                                                    Delete Project
                                                </div>
                                                <div className="mt-4 text-red-500 bg-[#222222] break-all p-3 rounded-lg">
                                                    delete/{fetchedData && fetchedData[0]?.name}
                                                </div>
                                                <input
                                                    value={isEq}
                                                    onChange={(e) => { fetchedData && fetchedData[0]?.created_by === user?.uid &&  setIsEq(e.target.value) }}
                                                    placeholder='Confirm the text above'
                                                    type="text"
                                                    readOnly={(!isEdit && (fetchedData && fetchedData[0]?.created_by === user?.uid)) ? false : true}
                                                    className="mt-2 bg-[#111] border-[#535353] border-[1px]  outline-none p-3 rounded-lg w-full"
                                                />
                                                <div
                                                onClick={() => {!loading && isEq === ("delete/" +  fetchedData[0]?.name)  && deleteProject()}}
                                                    className={`${isEq === ("delete/" +  fetchedData[0]?.name) && "bg-red-950 text-white cursor-pointer"} 
                                                  mt-2  text-[#888] bg-[#2222] cursor-not-allowed text-center border-[#535353] border-[1px]  outline-none p-2 rounded-lg w-full`}>
                                                    Delete
                                                </div>
                                                <div className='my-2 text-sm text-[#888]'>
                                                  Once you delete this, there is no way to retrieve this project back.
                                                </div>
                                            </div>

                                        </div>
                                    </>
                                    :
                                    <div className='w-[20px] h-[20px]'>
                                        <Loader />
                                    </div>
                            }

                        </div>

                        <div className='rounded-lg overflow-hidden border-[#535353] border-[1px]'>
                            <Button
                            onClick={() => {!loading && handleOutsideClick()}}
                                variant={"withCancel"}>
                                Close
                            </Button>
                        </div>
                    </motion.div>

                </motion.div>

            }
        </AnimatePresence>
    )
}

export default ProjectSettings
