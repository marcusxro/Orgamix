import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../Utils/supabase/supabaseClient';
import IsLoggedIn from '../../../Utils/IsLoggedIn';
import { useParams } from 'react-router-dom';
import useStore from '../../../Utils/Zustand/UseStore';
import Loader from '../../../Svg/Loader';
import Input from '../Input';
import { Button } from '../Button';
import moment from 'moment'




interface tasksType {
    title: string;
    created_at: number;
    created_by: string;
    priority: string;
    type: string;
    id: number;
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



interface userType {
    userid: string;
    username: string;
    password: string;
    email: string;
    id: number;
    fullname: string;
}

interface dataType {
    description: string;
    id: number;
    created_at: number;
    name: string;
    created_by: string;
    deadline: number;
    is_shared: string;
    is_favorite: boolean;
    boards: boardsType[]
}
const EditContainer:React.FC = () => {
    const [user]:any = IsLoggedIn()
    const params = useParams()
    const { settingsBoard, setSettingsBoard }: any = useStore()
    const [isExiting, setIsExiting] = useState(false);
    const [fetchedData, setFetchedData] = useState<boardsType | null>(null);
    const [defData, setDefData] = useState<dataType[] | null>(null)
    const [userData, setUserData] = useState<userType[] | null>(null)
    const [itemName, setItemName] = useState('');
    const [titleColor, setTitleColor] = useState<string>("")
    const [createdAt, setCreatedAt] = useState<number | null>(null)
    const [isDelete, setIsDelete] = useState<boolean>(false)
    const {loading, setLoading}:any = useStore()

    useEffect(() => {
        if (user) {
            getTaskByID()

        }
    }, [user])
    
    async function getTaskByID() {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('created_at', params?.time);

            if (error) {
                console.error('Error fetching data:', error);
                return;
            }

            if (data && data.length > 0) {
                setDefData(data)
                const foundBoard = data[0]?.boards
                    .find((board: boardsType) => board.board_uid === settingsBoard);

                if (foundBoard) {
                    setFetchedData(foundBoard)
                } else {
                    console.log('Board not found');
                }
            } else {
                console.log('No data found for the given parameters.');
            }
        } catch (err) {
            console.log('Error in fetching task:', err);
        }
    }


    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setSettingsBoard(null);
            setIsExiting(false);
        }, 300); // Match the animation duration
    };

    async function findUserByUID(paramsUID: string) {
        if (!paramsUID) return null;

        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('userid', paramsUID);

            if (error) {
                console.error('Error fetching user:', error);
                return <p>Error loading user data</p>;
            }
            if (data) setUserData(data);
        } catch (err) {
            console.error('An error occurred:', err);
            return <p>Error loading user data</p>;
        }
    }

    useEffect(() => {
        if (!fetchedData) return
        const isFound = fetchedData?.created_by;
        findUserByUID(isFound)
    }, [fetchedData, user]);


    useEffect(() => {
        if (fetchedData && fetchedData?.title && fetchedData != null) {
            setItemName(fetchedData?.title || "")
            setTitleColor(fetchedData?.titleColor || "")
            setCreatedAt(fetchedData?.created_at)
        }
    }, [fetchedData])
    

    async function editTask() {
        setLoading(true)

        if(loading) {
            setLoading(false)
            return
        }

        if(!defData)  {
            setLoading(false)
            return
        }
        

        if((defData[0]?.is_shared === "private") && (defData[0]?.created_by != user?.id)) {
               setSettingsBoard(null)
               setLoading(false)
                return 
        } 

        if(!itemName) {
            setLoading(false)
            return
        }
        
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('created_at', params?.time);
    
            if (error) {
                console.error('Error fetching data:', error);
                setLoading(false)
                return;
            }
    
            if (data && data.length > 0) {
                // Find the board to edit
                const foundBoardIndex = data[0]?.boards.findIndex((board: boardsType) => board.board_uid === settingsBoard);
    
                if (foundBoardIndex !== -1) {
                    // Update the specific board's data
                    const updatedBoard = {
                        ...data[0].boards[foundBoardIndex], // Copy the current board data
                        title: itemName,                   // Update the title with the new value
                        titleColor: titleColor             // Update the titleColor with the new value
                    };
    
                    // Replace the old board with the updated one in the boards array
                    const updatedBoards = [...data[0].boards];
                    updatedBoards[foundBoardIndex] = updatedBoard;
    
                    // Update the project with the modified boards array in the database
                    const { error: updateError } = await supabase
                        .from('projects')
                        .update({ boards: updatedBoards })   
                        .eq('created_at', params?.time);
    
                    if (updateError) {
                        setLoading(false)
                        console.error('Error updating board:', updateError);
                    } else {
                        console.log('Board updated successfully');
                        setLoading(false)
                        setFetchedData(updatedBoard); // Optionally update your local state
                        handleOutsideClick()
                    }
                } else {
                    console.log('Board not found');
                    setLoading(false)
                }
            } else {
                console.log('No data found for the given parameters.');
                setLoading(false)
            }
        } catch (err) {
            console.log('Error in updating task:', err);
            setLoading(false)
        }
    }


    async function deleteTask() {

        setLoading(true)

        if(loading) {
            return
        }
        if(!defData)  {
            setLoading(false)
            return
        }

        if(defData && defData.length > 0 && (
            (defData[0]?.is_shared === "private" && defData[0]?.created_by === user?.id)) ) {
                setSettingsBoard(null)
                setLoading(false)
                return
        } 
        
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('created_at', params?.time);
    
            if (error) {
                console.error('Error fetching data:', error);
                setLoading(false)
                return;
            }
    
            if (data && data.length > 0) {
                // Find the board to delete
                const updatedBoards = data[0]?.boards.filter((board: boardsType) => board.board_uid !== settingsBoard);
    
                if (updatedBoards.length !== data[0].boards.length) {
                    const { error: updateError } = await supabase
                        .from('projects')
                        .update({ boards: updatedBoards })
                        .eq('created_at', params?.time);
    
                    if (updateError) {
                        console.error('Error deleting board:', updateError);
                        setLoading(false)
                    } else {
                        console.log('Board deleted successfully');
                        setLoading(false)
                        handleOutsideClick()
                    }
                } else {
                    console.log('Board not found');
                    setLoading(false)
                }
            } else {
                console.log('No data found for the given parameters.');
                setLoading(false)
            }
        } catch (err) {
            console.log('Error in deleting task:', err);
            setLoading(false)
        }
    }
    
    
    return (
        <AnimatePresence>
            {
                settingsBoard && !isExiting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        className='ml-auto positioners flex items-center p-3 justify-center w-full h-full'
                        onClick={handleOutsideClick}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                            exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                            onClick={(e) => e.stopPropagation()}
                            className='w-[450px] h-full bg-[#313131] z-[5000] rounded-lg p-3 overflow-auto border-[#535353] border-[1px] max-h-[350px] flex flex-col justify-between'
                        >



                            <div className='overflow-auto  h-full' >
                                <div className='mb-4'>
                                    <div className='text-xl font-bold'>Manage Boards</div>
                                    <div className='text-sm text-[#888] mt-1'>
                                        Here you can edit, delete, and view other information related to the selected board.
                                    </div>
                                </div>
                                {
                                    !fetchedData && !userData ?
                                        <div className='w-[20px] h-[20px]'>
                                            <Loader />
                                        </div>
                                        :
                                        (
                                            <>
                                                <div>
                                                    <div
                                                        className='flex gap-2 flex-col'
                                                        key={fetchedData?.created_at}>
                                                        <div className='gap-2 flex w-full'>

                                                            <Input
                                                                type="text"
                                                                placeholder="Board title"
                                                                name="containername"
                                                                value={itemName}
                                                                colorVal={"#fff"}
                                                                onChange={(e) => setItemName(e.target.value)}
                                                            />
                                                            <input
                                                                value={titleColor}
                                                                onChange={(e) => { setTitleColor(e.target.value) }}
                                                                className='w-10 h-10 border border-gray-300 rounded-md cursor-pointer appearance-none'
                                                                type="color" />
                                                        </div>
                                                        <div className='flex gap-3 items-center justify-between'>
                                                            <p className='text-sm text-[#888] mt-3'>Added by: {userData && userData[0]?.username}</p>
                                                            <p className='text-sm text-[#888] mt-3'>
                                                                {createdAt
                                                                    ? moment(createdAt).format('MMMM Do YYYY')
                                                                    : 'No date'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )
                                }

                            </div>

                            {
                                !isDelete ?
                                    (
                                        <>
                                            <Button
                                                variant={"addBoard"}
                                                onClick={() => { setIsDelete(true) }}
                                            >
                                                Delete Board</Button>

                                            <div className='w-full h-[50px] flex rounded-lg overflow-hidden border-[#535353] border-[1px] mt-2'>

                                                <Button
                                                    variant={"withBorderRight"}
                                                    onClick={handleOutsideClick}
                                                >
                                                    Close</Button>
                                                <Button
                                                    variant={"withCancel"}
                                                        onClick={editTask}
                                                >
                                                      {
                                                    loading ? 
                                                    <div className='w-[20px] h-[20px]'>
                                                        <Loader />
                                                    </div>
                                                    :
                                                    "Edit"
                                                }
                                                    </Button>
                                            </div>
                                        </>
                                    ) :
                                    (<>

                                        <div className='w-full h-[45px] flex rounded-lg overflow-hidden border-[#535353] border-[1px] mt-2'>

                                            <Button
                                                variant={"withBorderRight"}
                                                onClick={() => { setIsDelete(false) }}
                                            >
                                                Cancel</Button>
                                            <Button
                                                variant={"withCancel"}
                                                onClick={deleteTask}
                                            >
                                                {
                                                    loading ? 
                                                    <div className='w-[20px] h-[20px]'>
                                                        <Loader />
                                                    </div>
                                                    :
                                                    "Delete"
                                                }
                                            </Button>
                                        </div>
                                    </>)
                            }
                        </motion.div>

                    </motion.div>
                )
            }
        </AnimatePresence>
    )
}

export default EditContainer
