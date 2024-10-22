import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';
import { CiShare2 } from "react-icons/ci";
import { MdOutlineViewKanban } from "react-icons/md";
import { IoIosContact } from "react-icons/io";
import { FaLinesLeaning } from "react-icons/fa6";
import { BsCalendarDate } from "react-icons/bs";

// DnD
import {
    DndContext,
    DragEndEvent,
    DragMoveEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    UniqueIdentifier,
    closestCorners,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';


// Components
import Container from '../../comps/System/Projects/Container';
import Items from '../../comps/System/Projects/Items';
import Modal from '../../comps/System/Projects/Modal';
import Input from '../../comps/System/Projects/Input';
import { Button } from '../../comps/System/Projects/Button';
import KanBanSidebar from '../../comps/System/Projects/KanBanSidebar';
import { supabase } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import { MdDateRange } from "react-icons/md";
import Visualizer from '../../comps/System/Projects/Visualizer';
import useStore from '../../Zustand/UseStore';
import EditTaskProject from '../../comps/System/Projects/EditTaskProject';
import Loader from '../../comps/Loader';
import EditContainer from '../../comps/System/Projects/EditContainer';
import InviteToProjects from '../../comps/System/Projects/InviteToProjects';
import ProjectSettings from '../../comps/System/Projects/ProjectSettings';
import Chat from '../../comps/System/Projects/Chat';


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

interface MessageType {

    userEmail: any;
    userid: any;
    id: number; //timestamp
    content: string

}


interface dataType {
    description: string;
    id: number;
    created_at: number;
    name: string;
    created_by: string;
    deadline: number;
    is_shared: any;
    invited_emails: null | invitedEmails[];
    updated_at: null | updatedAt[];
    is_favorite: boolean;
    boards: boardsType[]
    chatArr: MessageType[]
}

// interface accountType {
//     userid: string;
//     username: string;
//     password: string;
//     email: string;
//     id: number;
//     fullname: string;
// }


export default function Samp() {
    const params = useParams()
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [colorVal, setColorVal] = useState<string>("")
    const [user] = IsLoggedIn()
    const [loading, setLoading] = useState<boolean>(false)
    const { settingsTask, settingsBoard, }: any = useStore()
    const { inviteToProject, setInviteToProject }: any = useStore()
    const { openKanbanSettings }: any = useStore()
    const { openKanbanChat }: any = useStore()

    useEffect(() => {
        if (user) {
            getProjects();
            const subscription = supabase
                .channel('public:projects')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                    handleRealtimeEvent(payload);
                    getProjects();
                })
                .subscribe();
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user, openKanbanChat, openKanbanSettings, settingsTask, inviteToProject, loading]);




    const handleRealtimeEvent = (payload: any) => {
        switch (payload.eventType) {
            case 'INSERT':
                setFetchedData((prevData) =>
                    prevData ? [...prevData, payload.new] : [payload.new]
                );

                break;
            case 'UPDATE':
                console.log(fetchedData)
                setFetchedData((prevData) =>
                    prevData
                        ? prevData.map((item) =>
                            item.id === payload.new.id ? payload.new : item
                        )
                        : [payload.new]
                );

                break;
            case 'DELETE':
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
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('created_at', params?.time)

            if (data) {
                setFetchedData(data);
                console.log(data)
            }
            if (error) {
                return console.error('Error fetching data:', error);
            }

        } catch (err) {
            console.log(err);
        }
    }




    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [currentContainerId, setCurrentContainerId] = useState<UniqueIdentifier>();
    const [containerName, setContainerName] = useState('');
    const [itemName, setItemName] = useState('');
    const [showAddContainerModal, setShowAddContainerModal] = useState(false);
    const [showAddItemModal, setShowAddItemModal] = useState(false);




    async function onAddContainer() {
        setLoading(true)
        if (loading) {
            setLoading(false)
            return
        };


        if (!containerName) {
            setLoading(false)
            return
        };

        console.log("sdsd")
        try {
            const id = `container-${uuidv4()}`;

            const newData = {
                title: containerName,
                titleColor: colorVal,
                created_at: Date.now(),
                board_uid: id,
                created_by: user?.uid,
                tasks: []
            };

            // Fetch the existing project where boards need to be added
            const { data: projectData, error: fetchError } = await supabase
                .from("projects")
                .select("boards")
                .eq("created_at", params?.time)
                .single(); // Assuming you're fetching a single project

            if (fetchError) {
                console.log("Error fetching project:", fetchError);
                return;
            }

            const existingBoards = projectData?.boards || [];

            // Append the new board to the existing boards array
            const updatedBoards = [...existingBoards, newData];

            // Update the boards array in the project
            const { error: updateError } = await supabase
                .from("projects")
                .update({ boards: updatedBoards })
                .eq("created_at", params?.time);

            if (updateError) {
                console.log("Error updating boards:", updateError);
                setLoading(false)
            } else {
                console.log("Board added successfully!");
                setLoading(false)
            }

            // Reset form and close modal
            setContainerName("");
            setShowAddContainerModal(false);
            setColorVal("")
        } catch (err) {
            console.log("Error adding container:", err);
            setLoading(false)
        }
    }



    const [assignee, setAssigne] = useState<string>("Everyone")

    const [priority, setPriority] = useState<string>("")
    const [workStart, setWorkStart] = useState<string>("")
    const [workEnd, setWorkEnd] = useState<string>("")
    const [workType, setWorkType] = useState<string>("")


    async function onAddItem() {
        setLoading(true)

        if (loading) {
            setLoading(false)
            return
        };


        if (!itemName) {
            setLoading(false)
            return
        };
        if (!assignee) {
            setLoading(false)
            return
        };



        try {

            const newTask: tasksType = {
                title: itemName,
                created_at: Date.now(),
                created_by: user?.uid || "",
                priority: priority,
                type: workType,
                start_work: workStart,
                deadline: workEnd,
                assigned_to: assignee === "" ? "Everyone" : assignee,
            };



            // Fetch the existing project to get the boards
            const { data: projectData, error: fetchError } = await supabase
                .from("projects")
                .select("boards")
                .eq("created_at", params?.time)
                .single();

            if (fetchError) {
                console.log("Error fetching project:", fetchError);
                setLoading(false)
                return;
            }

            const existingBoards: boardsType[] = projectData?.boards || [];

            // Find the specific board to add the task to
            const boardIndex = existingBoards.findIndex(board => board.board_uid === currentContainerId);
            if (boardIndex === -1) {
                console.log("Board not found!");
                setLoading(false)
                return;
            }

            // Append the new task to the found board's tasks
            existingBoards[boardIndex].tasks.push(newTask);

            // Update the boards array in the project




            const { error: updateError } = await supabase
                .from("projects")
                .update({ boards: existingBoards })
                .eq("created_at", params?.time);

            if (updateError) {
                console.log("Error updating tasks:", updateError);
                setLoading(false)
            } else {
                setLoading(false)
                console.log("Task added successfully!");
            }

            setShowAddItemModal(false);
            setItemName("")
            setAssigne("Everyone")
            setWorkType("")
            setWorkEnd("")
            setWorkStart("")
            setPriority("")

        } catch (err) {
            console.log("Error adding task:", err);
            setLoading(false)
        }
    }


    // Find the value of the items
    function findValueOfItems(id: UniqueIdentifier | undefined, type: string) {
        if (!fetchedData) return
        if (type === 'container') {
            return fetchedData[0]?.boards.find((item: boardsType) => item.board_uid === id);
        }
    }

    const findItemTitle = (id: string): string => {
        const replacedString: string = id.replace("task-", "");
        const toInt: number = parseInt(replacedString);
        const foundTask = fetchedData?.[0]?.boards?.flatMap((board) => board.tasks)
            .find((task) => task.created_at === toInt);
        return foundTask?.title ?? 'Untitled Task';
    };

    function checkDeadlineMetForTask(deadlineString: string): string {
        const deadline = new Date(deadlineString);
        const now = new Date();
        deadline.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        const timeDiff = deadline.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            return 'Deadline Met';
        } else if (daysDiff > 0) {
            return `${deadlineString} / ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} left`;
        } else {
            return `${deadlineString} / ${Math.abs(daysDiff)} ${Math.abs(daysDiff) === 1 ? 'day' : 'days'} ago`;
        }
    }




    const findItemTask = (id: string): string => {
        const replacedString: string = id.replace("task-", "");
        const toInt: number = parseInt(replacedString);

        const foundTask = fetchedData?.[0]?.boards?.flatMap((board) => board.tasks)
            .find((task) => task.created_at === toInt);

        if (foundTask?.deadline === "") {
            return ""
        }
        // Returning a string from checkDeadlineMet
        return checkDeadlineMetForTask(foundTask?.deadline ?? '') || 'no start work';
    };


    const findTaskDetails = (id: string, purpose: string) => {
        const replacedString: string = id.replace("task-", "");
        const toInt: number = parseInt(replacedString, 10);

        const foundTask = fetchedData?.[0]?.boards?.flatMap((board) => board.tasks)
            .find((task) => task.created_at === toInt);

        const taskDetail = foundTask?.[purpose as keyof typeof foundTask] ?? ""; // Ensure this is a string

        // Return an empty string if the task detail is not valid
        return typeof taskDetail === 'string' ? taskDetail : "";
    };


    const findTaskAssignee = (id: string) => {

        const replacedString: string = id?.includes('task-') ? id.replace("task-", "") : id;
        const toInt: number = parseInt(replacedString, 10);

        const foundTask = fetchedData?.[0]?.boards?.flatMap((board) => board.tasks)
            .find((task) => task.created_at === toInt);

        const taskDetail = foundTask?.assigned_to

        // Return an empty string if the task detail is not valid
        return typeof taskDetail === 'string' ? taskDetail : "";
    };



    const findContainerItems = (id: UniqueIdentifier | undefined) => {
        const container = findValueOfItems(id, 'container');

        return container as boardsType
    };

    // DND Handlers
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const { id } = active;
        setActiveId(id);
    }

    const handleDragMove = (event: DragMoveEvent) => {
        const { active, over } = event;

        if (!active || !over || !fetchedData || !fetchedData[0]?.boards) return;

        const activeId = active.id.toString();
        const overId = over.id.toString();

        // Extract the task IDs (removing the 'task-' prefix)
        const activeTaskId = activeId.includes('task-') ? activeId.replace('task-', '') : activeId;

        const boards = fetchedData[0].boards;

        // Handle reordering within the same board (same container)
        if (activeId.includes('task-') && overId.includes('task-') && activeTaskId !== overId.replace('task-', '')) {
            const activeBoard = boards.find((board) =>
                board.tasks.some((task) => task.created_at.toString() === activeTaskId)
            );
            const overBoard = boards.find((board) =>
                board.tasks.some((task) => task.created_at.toString() === overId.replace('task-', ''))
            );

            if (!activeBoard || !overBoard) return;
            const activeBoardIndex = boards.findIndex((board) => board.board_uid === activeBoard.board_uid);
            const overBoardIndex = boards.findIndex((board) => board.board_uid === overBoard.board_uid);
            const activeTaskIndex = activeBoard.tasks.findIndex((task) => task.created_at.toString() === activeTaskId);
            const overTaskIndex = overBoard.tasks.findIndex((task) => task.created_at.toString() === overId.replace('task-', ''));
            // Reordering within the same board
            if (activeBoardIndex === overBoardIndex) {
                let updatedBoards = [...boards];
                updatedBoards[activeBoardIndex].tasks = arrayMove(
                    updatedBoards[activeBoardIndex].tasks,
                    activeTaskIndex,
                    overTaskIndex
                );
                updateFetchedData(updatedBoards);
            }
            // Move task between boards (non-empty)
            else {
                let updatedBoards = [...boards];
                const [movedTask] = updatedBoards[activeBoardIndex].tasks.splice(activeTaskIndex, 1);
                updatedBoards[overBoardIndex].tasks.splice(overTaskIndex, 0, movedTask);
                updateFetchedData(updatedBoards);
            }
        }

        // Handle moving tasks between boards (containers), including empty boards
        if (activeId.includes('task-') && overId.includes('container-')) {
            const activeBoard = boards.find((board) =>
                board.tasks.some((task) => task.created_at.toString() === activeTaskId)
            );
            const overBoard = boards.find((board) => board.board_uid === overId.replace('board-', ''));

            if (!activeBoard || !overBoard) return;

            const activeBoardIndex = boards.findIndex((board) => board.board_uid === activeBoard.board_uid);
            const overBoardIndex = boards.findIndex((board) => board.board_uid === overBoard.board_uid);
            const activeTaskIndex = activeBoard.tasks.findIndex((task) => task.created_at.toString() === activeTaskId);

            let updatedBoards = [...boards];

            // Remove the task from the active board
            const [movedTask] = updatedBoards[activeBoardIndex].tasks.splice(activeTaskIndex, 1);

            // If the target board (overBoard) is empty, add the task to its tasks array
            if (updatedBoards[overBoardIndex].tasks.length === 0) {
                updatedBoards[overBoardIndex].tasks = [movedTask]; // Initialize the tasks array
            } else {
                // If the target board has tasks, push the task to the end of the list
                updatedBoards[overBoardIndex].tasks.push(movedTask);
            }

            updateFetchedData(updatedBoards);
        }
    };




    const updateFetchedData = (updatedBoards: boardsType[]) => {
        if (!fetchedData) return

        const updatedData = [{ ...fetchedData[0], boards: updatedBoards }];
        setFetchedData(updatedData);
    };


    // This is the function that handles the sorting of the containers and items when the user is done dragging.
    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;



        if (!fetchedData) return; // Check if fetchedData is available

        // Copying the fetchedData's boards
        let newItems = [...fetchedData[0]?.boards];


        // Handling Container (Board) Sorting
        if (
            active.id.toString().includes('container') &&
            over?.id.toString().includes('container') &&
            active &&
            over &&
            active.id !== over.id
        ) {
            const activeContainerIndex = newItems.findIndex(
                (container) => container.board_uid === active.id,
            );
            const overContainerIndex = newItems.findIndex(
                (container) => container.board_uid === over.id,
            );

            // Swap the active and over containers (boards)
            newItems = arrayMove(newItems, activeContainerIndex, overContainerIndex);

            // Update the fetchedData with the new board order
            setFetchedData([{ ...fetchedData[0], boards: newItems }]);

            await saveChangesToDB(newItems);
        }


        if (
            active.id.toString().includes('task') && // Task is being dragged
            over?.id.toString().includes('task') && // Dropped over another task
            active &&
            over
        ) {
            const activeBoard = newItems.find((board) =>
                board.tasks.some((task) => "task-" + task.created_at.toString() === active.id),
            );
            const overBoard = newItems.find((board) =>
                board.tasks.some((task) => "task-" + task.created_at.toString() === over.id),
            );



            if (!activeBoard || !overBoard) return;

            const activeBoardIndex = newItems.findIndex(
                (board) => board.board_uid === activeBoard.board_uid,
            );
            const overBoardIndex = newItems.findIndex(
                (board) => board.board_uid === overBoard.board_uid,
            );

            const activeTaskIndex = activeBoard.tasks.findIndex(
                (task) => task.created_at.toString() === active.id,
            );
            const overTaskIndex = overBoard.tasks.findIndex(
                (task) => task.created_at.toString() === over.id,
            );

            if (activeBoardIndex === overBoardIndex) {
                // Reorder tasks within the same board
                newItems[activeBoardIndex].tasks = arrayMove(
                    newItems[activeBoardIndex].tasks,
                    activeTaskIndex,
                    overTaskIndex,
                );
            } else {
                // Move task between different boards
                const [removedTask] = newItems[activeBoardIndex].tasks.splice(
                    activeTaskIndex,
                    1,
                );
                newItems[overBoardIndex].tasks.splice(overTaskIndex, 0, removedTask);
            }

            // Update fetchedData with new board and task structure
            const updatedFetchedData = [{ ...fetchedData[0], boards: newItems }];
            setFetchedData(updatedFetchedData);

            // Save the updated tasks and boards to the database

            await saveChangesToDB(newItems);
        }

        // Reset active drag state if applicable
        setActiveId(null);
    }





    async function saveChangesToDB(updatedContainers: boardsType[]) {
        try {
            const { error } = await supabase
                .from('projects')
                .update({ boards: updatedContainers })
                // .eq('created_by', user?.uid)
                .eq('created_at', params?.time);

            if (error) {
                console.log('Error saving updated order:', error);
            } else {
                console.log('Updated order saved successfully!');
            }
        } catch (err) {
            console.log('Error during update:', err);
        }
    }


    function checkDeadlineMet(deadlineString: string | number): JSX.Element {
        const deadline = new Date(deadlineString);
        const now = new Date();
        deadline.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        // Calculate difference in time
        const timeDiff = deadline.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            // If deadline is today
            return (
                <div className='text-sm text-red-500 flex gap-1 items-center'>
                    <MdDateRange />
                    Deadline Met
                </div>
            );
        } else if (daysDiff > 0) {
            // If the deadline is in the future
            return (
                <div className={`${daysDiff <= 3 && 'text-red-500'} text-[#888] text-sm flex gap-1 items-center`}>
                    <MdDateRange />
                    {`${deadlineString} / ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} left`}
                </div>
            );
        } else {
            // If the deadline has passed
            return (
                <div className='text-sm text-red-500 flex gap-1 items-center'>
                    <MdDateRange />
                    {`${deadlineString} / ${Math.abs(daysDiff)} ${Math.abs(daysDiff) === 1 ? 'day' : 'days'} ago`}
                </div>
            );
        }
    }




    return (
        <div className=' flex flex-col h-[100dvh] overflow-hidden md:flex-row'>

            {
                //closes the modal if its in private, and not included in shareable invited_emails
                (fetchedData && fetchedData.length > 0 && (
                    (fetchedData[0].is_shared !== "private" && fetchedData[0].is_shared === "public") ||
                    (fetchedData[0].is_shared === "private" && fetchedData[0].created_by === user?.uid) ||
                    (fetchedData[0].is_shared === "shareable" &&
                    ((fetchedData[0].invited_emails === null && fetchedData[0].created_by === user?.uid) ||
                    (fetchedData[0].invited_emails?.some((itm: invitedEmails) => itm.email === user?.email) || false)))
                )) && settingsTask != null && settingsTask != null &&
                <EditTaskProject isAllowed={(findTaskAssignee((settingsTask.toString())) === user?.email ? true : false) ||
                    (findTaskAssignee((settingsTask.toString())) === "Everyone" && true) ||
                    (fetchedData && fetchedData[0]?.created_by === user?.uid ? true : false)
                } />

            }
            {
                //closes the modal if its in private, and not included in shareable invited_emails
                (fetchedData && fetchedData.length > 0 && (
                    (fetchedData[0].is_shared !== "private" && fetchedData[0].is_shared === "public") ||
                    (fetchedData[0].is_shared === "private" && fetchedData[0].created_by === user?.uid) ||
                    (fetchedData[0].is_shared === "shareable" &&
                    ((fetchedData[0].invited_emails === null && fetchedData[0].created_by === user?.uid) ||
                    (fetchedData[0].invited_emails?.some((itm: invitedEmails) => itm.email === user?.email) || false)))
                )) &&

                settingsBoard !== null && (
                    <EditContainer />
                )
            }
            {
                inviteToProject &&
                <InviteToProjects />
            }
            {
                //closes the modal if its in private, and not included in shareable invited_emails
                (fetchedData && fetchedData.length > 0 && (
                    (fetchedData[0].is_shared !== "private" && fetchedData[0].is_shared === "public") ||
                    (fetchedData[0].is_shared === "private" && fetchedData[0].created_by === user?.uid) ||
                    (fetchedData[0].is_shared === "shareable" &&
                    ((fetchedData[0].invited_emails === null && fetchedData[0].created_by === user?.uid) ||
                    (fetchedData[0].invited_emails?.some((itm: invitedEmails) => itm.email === user?.email) || false)))
                )) &&
                openKanbanSettings &&
                <ProjectSettings />
            }
            {

                 //closes the modal if its in private, and not included in shareable invited_emails
                 (fetchedData && fetchedData.length > 0 && (
                    (fetchedData[0].is_shared !== "private" && fetchedData[0].is_shared === "public") ||
                    (fetchedData[0].is_shared === "private" && fetchedData[0].created_by === user?.uid) ||
                    (fetchedData[0].is_shared === "shareable" &&
                    ((fetchedData[0].invited_emails === null && fetchedData[0].created_by === user?.uid) ||
                    (fetchedData[0].invited_emails?.some((itm: invitedEmails) => itm.email === user?.email) || false)))
                )) &&
                openKanbanChat &&
                <Chat />
            }

            <div className="h-[30px] w-full max-w-[100%] md:sticky md:top-0 md:h-screen md:max-w-[200px]">
                <KanBanSidebar location='kanban' />


            </div>

            <div className=' w-full h-[100dvh] overflow-auto'>
                {
                    fetchedData && fetchedData.length > 0 && (
                        (fetchedData[0]?.is_shared !== "private") ||
                        (fetchedData[0]?.is_shared === "private" && fetchedData[0]?.created_by === user?.uid)) &&
                    <Modal
                        showModal={showAddContainerModal}
                        setShowModal={setShowAddContainerModal}
                    >
                        <div className="flex flex-col w-full items-start gap-y-4">
                            <div>
                                <h1 className="text-xl font-bold">Add Board</h1>
                                <p className='text-sm text-[#888]'>
                                    Create a new Kanban board to organize tasks and track your workflow more efficiently.
                                </p>
                            </div>
                            <div className='gap-2 flex w-full'>
                                <Input
                                    type="text"
                                    placeholder="Board title"
                                    name="containername"
                                    value={containerName}
                                    colorVal={colorVal}
                                    onChange={(e) => setContainerName(e.target.value)}
                                />
                                <input
                                    value={colorVal}
                                    onChange={(e) => { setColorVal(e.target.value) }}
                                    className='w-10 h-10 border border-gray-300 rounded-md cursor-pointer appearance-none'
                                    type="color" />
                            </div>

                            <Button variant={"addBoard"} onClick={() => { !loading && onAddContainer() }}>
                                {
                                    loading ?
                                        <div className='w-[20px] h-[20px]'>
                                            <Loader />
                                        </div>
                                        :
                                        "Add container"
                                }
                            </Button>
                        </div>

                    </Modal>
                }

                {
                    fetchedData && fetchedData.length > 0 && (
                        (fetchedData[0]?.is_shared !== "private") ||
                        (fetchedData[0]?.is_shared === "private" && fetchedData[0]?.created_by === user?.uid)) &&

                    <Modal showModal={showAddItemModal} setShowModal={setShowAddItemModal}>
                        <div className="flex flex-col w-full items-start gap-y-4 ">
                            <div className='mb-2'>
                                <h1 className="text-white text-xl font-bold">Add task</h1>
                                <p className='text-sm text-[#888]'>Add your task inside your board.</p>
                            </div>
                            <Input
                                type="text"
                                placeholder="Task Title"
                                name="itemname"
                                colorVal={"#fffff"}
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                            />
                            <div className='w-full flex gap-3 items-center'>
                                {
                                    fetchedData && fetchedData[0]?.is_shared != "private" && user &&
                                    <>
                                        <div className='flex gap-1 items-center w-full max-w-[150px]'> <span className='text-xl'><IoIosContact /></span> Assignee</div>
                                        <select
                                            value={assignee}
                                            onChange={(e) => { setAssigne(e.target.value) }}
                                            className='p-2 w-full outline-none bg-[#111111] border-[#535353] border-[1px] rounded-lg flex items-center justify-center cursor-pointer'>
                                            <option
                                                className='text-green-500 hover:text-green-500'
                                                value="Everyone" >Everyone</option>
                                            {
                                                fetchedData && fetchedData[0]?.is_shared != "public" &&

                                                <option
                                                    className='text-green-500 hover:text-green-500'
                                                    value={user?.email?.toString()}>(me) {user?.email}</option>
                                            }

                                            {
                                                fetchedData && fetchedData[0]?.is_shared != "public" && fetchedData[0]?.invited_emails?.map((itm, idx: number) => (
                                                    <option
                                                        key={idx}
                                                        value={itm?.email}>{itm?.email}</option>
                                                ))
                                            }

                                        </select>
                                    </>
                                }

                            </div>
                            <div className='w-full flex gap-3 items-center'>
                                <div className='flex gap-1 items-center w-full max-w-[150px]'> <span className='text-xl'><FaLinesLeaning /></span>Priority</div>
                                <select
                                    value={priority}
                                    onChange={(e) => { setPriority(e.target.value) }}
                                    className='p-2 w-full bg-[#111111]  border-[#535353] border-[1px] rounded-lg outline-none flex items-center justify-center cursor-pointer'
                                    name="" id="">
                                    <option value="">Choose priority</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                            <div className='w-full flex gap-3 items-center'>
                                <div className='flex gap-1 items-center w-full max-w-[150px]'> <span className='text-xl'><FaLinesLeaning /></span>Type</div>
                                <select
                                    value={workType}
                                    onChange={(e) => { setWorkType(e.target.value) }}
                                    className='p-2 w-full bg-[#111111]  border-[#535353] border-[1px] rounded-lg outline-none flex items-center justify-center cursor-pointer'
                                    name="" id="">
                                    <option value="">Choose type</option>
                                    <option value="Future Enhancement">Future Enhancement</option>
                                    <option value="Bug">Bug</option>
                                    <option value="Research">Research</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Improvement">Improvement</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                            <div className='w-full flex gap-3 items-center'>
                                <div className='flex gap-1 items-center w-full max-w-[150px]'> <span className='text-xl'><BsCalendarDate /></span> Work Start Date</div>
                                <input
                                    value={workStart}
                                    onChange={(e) => { setWorkStart(e.target.value) }}
                                    className='p-2 w-full bg-[#111111] border-[#535353] border-[1px] rounded-lg flex  cursor-pointer'
                                    type="date" />
                            </div>

                            <div className='w-full flex gap-3 items-center'>
                                <div className='flex gap-1 items-center w-full max-w-[150px]'> <span className='text-xl'><BsCalendarDate /></span> Due Date</div>
                                <input
                                    value={workEnd}
                                    onChange={(e) => { setWorkEnd(e.target.value) }}
                                    className='p-2 w-full bg-[#111111] border-[#535353] border-[1px] rounded-lg flex  cursor-pointer'
                                    type="date" />
                            </div>


                            <div className='w-full flex rounded-lg overflow-hidden border-[#535353] border-[1px] mt-4'>
                                <Button variant={"withBorderRight"} onClick={() => { setShowAddItemModal(false) }}>Close</Button>
                                <Button variant={"withCancel"} onClick={() => { !loading && onAddItem() }}>
                                    {
                                        loading ?
                                            <div className='w-[20px] h-[20px]'>
                                                <Loader />
                                            </div>
                                            :
                                            "Add Item"
                                    }
                                </Button>

                            </div>
                        </div>
                    </Modal>
                }


                <div className="p-3 h-[60px] mt-[35px] border-b-[#535353] border-b-[1px] md:mt-0  flex items-center justify-between gap-y-2">
                    <div className='text-md border-[#535353] border-[1px] p-2 text-[#888] rounded-md bg-[#111111]'>
                        filter
                    </div>

                    <div className='flex gap-3 items-center'>
                        <Button
                            variant={"addBoard"}
                            onClick={() => setShowAddContainerModal(true)}>
                            <MdOutlineViewKanban /> Add Board
                        </Button>

                        {
                            fetchedData && fetchedData[0]?.created_by === user?.uid &&
                            <Button
                                variant={"addBoard"}
                                onClick={() => { { setInviteToProject(true) } }}>
                                <CiShare2 />  <span className='hidden md:block'>Invite</span>
                            </Button>
                        }
                    </div>

                </div>


                {
                    user?.uid && fetchedData != null &&
                        (fetchedData != null && fetchedData[0]?.created_by === user?.uid) ||
                        fetchedData != null && fetchedData[0]?.is_shared === "public" ||
                        ((fetchedData != null && fetchedData[0]?.is_shared === "shareable") &&
                            (fetchedData != null && fetchedData[0]?.invited_emails?.find((itm) => itm?.email === user?.email)))
                        && fetchedData[0]?.boards?.length > 0
                        ?
                        (
                            <>
                                {
                                    fetchedData &&
                                    <div className=' p-2 flex justify-center md:justify-between items-center md:items-start gap-2 flex-col md:flex-row'>
                                        <div className='px-3 border-[#535353] border-[1px] py-2 flex flex-col items-start bg-[#191919] rounded-lg w-full max-w-[550px]'>
                                            <div>
                                                <h1 className="text-white text-lg font-bold">
                                                    {
                                                        fetchedData != null && (fetchedData[0]?.name.length >= 30 ?
                                                            fetchedData[0]?.name.slice(0, 30) + "..."
                                                            : fetchedData != null && fetchedData[0]?.name)
                                                    }
                                                </h1>
                                                <div className='text-sm text-[#888] w-full max-w-[800px] break-all'>
                                                    {fetchedData != null && fetchedData[0]?.description}
                                                </div>
                                            </div>

                                            <div className='text-sm mb-2 flex gap-[1px] items-center text-green-500 mt-2'>
                                                {fetchedData[0]?.deadline && checkDeadlineMet(fetchedData[0]?.deadline)}
                                            </div>

                                            {
                                                fetchedData[0]?.boards?.length > 0 && fetchedData[0]?.boards != null &&

                                                <Visualizer boardsOBJ={fetchedData[0]?.boards} />

                                            }
                                            <div className='text-sm border-[#535353] border-[1px] px-2 py-1 mt-2 rounded-md bg-[#111111]'>
                                                {fetchedData != null && fetchedData[0]?.is_shared}
                                            </div>
                                        </div>

                                    </div>
                                }
                                {
                                    fetchedData != null && fetchedData[0]?.boards?.length === 0 || fetchedData != null && fetchedData[0]?.boards === null &&
                                    <div className='p-2 text-[#888] text-sm'>create your first board!</div>
                                }
                                <div className='mt-5'>
                                    <div className="grid p-3 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCorners}
                                            onDragStart={handleDragStart}
                                            onDragMove={handleDragMove}
                                            onDragEnd={handleDragEnd}>

                                            <SortableContext items={fetchedData && fetchedData[0]?.boards != null ? fetchedData[0].boards.map((board: boardsType) => board.board_uid) : []}>
                                                {user && fetchedData && fetchedData[0].boards && fetchedData[0].boards.map((board: boardsType) => (
                                                    <Container
                                                        id={board.board_uid}
                                                        title={board.title}
                                                        titleColor={board?.titleColor}
                                                        key={board.board_uid}
                                                        itemLength={Array.isArray(board.tasks) ? board.tasks.length : 0} // Safely access length
                                                        onAddItem={() => {
                                                            setShowAddItemModal(true);
                                                            setCurrentContainerId(board.board_uid);
                                                        }}>

                                                        <div
                                                            className='p-2 flex flex-col gap-2'>
                                                            {Array.isArray(board.tasks) && board.tasks.length > 0 ? (
                                                                board.tasks.map((task: tasksType, idx: number) => {
                                                                    const deadline = findTaskDetails(`task-${task?.created_at}`, "deadline");
                                                                    const type = findTaskDetails(`task-${task?.created_at}`, "type");
                                                                    if (!user) return
                                                                    let assignedTo = task?.assigned_to === user?.email
                                                                    return (
                                                                        <div className='px-2'>
                                                                            <Items
                                                                                title={task?.title}
                                                                                id={`task-${task?.created_at}`}
                                                                                start_work={task?.start_work}
                                                                                deadline={checkDeadlineMetForTask(deadline)}
                                                                                assigned_to={task?.assigned_to}
                                                                                type={type}
                                                                                priority={task?.priority}
                                                                                key={idx}
                                                                                isAssigned={
                                                                                    task.assigned_to === "Everyone" ? true : (task?.assigned_to === user?.email)
                                                                                }
                                                                            />
                                                                        </div>
                                                                    );
                                                                })
                                                            ) : (
                                                                <p className='px-2 text-sm text-[#888]'>No tasks available</p>
                                                            )}

                                                        </div>
                                                    </Container>
                                                ))}
                                            </SortableContext>


                                            <DragOverlay adjustScale={false}>
                                                {/* Drag Overlay For item Item */}
                                                {activeId && activeId.toString().includes('task') && (
                                                    <Items
                                                        start_work={findItemTask(activeId.toString())}
                                                        deadline={findItemTask(activeId.toString())}
                                                        assigned_to={findTaskAssignee((activeId.toString()))}
                                                        type={findTaskDetails((activeId.toString()), ("type"))}
                                                        priority={""}
                                                        id={activeId}
                                                        isAssigned={true}
                                                        title={findItemTitle(activeId.toString())} />
                                                )}
                                                {/* Drag Overlay For Container */}
                                                {activeId && activeId.toString().includes('container') && (
                                                    <Container
                                                        titleColor={findContainerItems(activeId)?.titleColor}
                                                        itemLength={findContainerItems(activeId)?.tasks?.length}
                                                        id={activeId}
                                                        title={findContainerItems(activeId)?.title}>
                                                        {
                                                            activeId && findContainerItems(activeId)?.tasks?.map((task: tasksType) => (
                                                                <div className='px-2'>
                                                                    <Items
                                                                        start_work={task?.start_work}
                                                                        deadline={checkDeadlineMetForTask(findTaskDetails(`task-${task?.created_at}`, "deadline"))}
                                                                        assigned_to={task?.assigned_to}
                                                                        type={task?.type}
                                                                        priority={task?.priority}
                                                                        isAssigned={
                                                                            task.assigned_to === "Everyone" ? true : (task?.assigned_to === user?.email)
                                                                        }
                                                                        key={task?.created_at}
                                                                        title={task?.title}
                                                                        id={task?.created_at}
                                                                    />
                                                                </div>
                                                            ))
                                                        }

                                                    </Container>
                                                )}
                                            </DragOverlay>

                                        </DndContext>
                                    </div>
                                </div>
                            </>
                        )
                        :
                        (
                            <div className='p-3'>
                                {
                                    !fetchedData ?
                                        <div className='w-[20px] h-[20px]'>
                                            <Loader />
                                        </div>
                                        :
                                        (<>
                                            {
                                                !user ?
                                                    <div>NO USER</div>
                                                    :
                                                    <>
                                                        {
                                                            fetchedData.length === 0 ?
                                                                <div>The project may have been deleted or does not exist.</div>
                                                                :
                                                                <div>NOT ALLOWED</div>
                                                        }
                                                    </>
                                            }
                                        </>)
                                }
                            </div>
                        )
                }
            </div>
        </div>
    );
}