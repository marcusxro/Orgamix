import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';
import { CiShare2 } from "react-icons/ci";
import { MdOutlineViewKanban } from "react-icons/md";
import { IoIosContact } from "react-icons/io";
import { FaLinesLeaning } from "react-icons/fa6";
import { BsCalendarDate } from "react-icons/bs";
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheck } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import moment from 'moment';
import { MdDateRange } from "react-icons/md";

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
import Visualizer from '../../comps/System/Projects/Visualizer';
import useStore from '../../Zustand/UseStore';
import EditTaskProject from '../../comps/System/Projects/EditTaskProject';
import Loader from '../../comps/Loader';
import EditContainer from '../../comps/System/Projects/EditContainer';
import InviteToProjects from '../../comps/System/Projects/InviteToProjects';
import ProjectSettings from '../../comps/System/Projects/ProjectSettings';
import Chat from '../../comps/System/Projects/Chat';
import MetaEditor from '../../comps/MetaHeader/MetaEditor';


interface invitedEmails {
    username: string;
    email: string;
    userid: string;
}

interface updatedAt {
    date: string;
    username: string;
    email: string;
    uid: string;
    itemMoved: string
}

interface Subtask {
    id: number;
    description: string;
    completed: boolean;
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
    subTasks: Subtask[]
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

interface accountType {
    userid: string; //
    username: string; //
    password: string; //
    email: string;
    id: number;
    is_ban: boolean;
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
    chatArr: MessageType[];
    currently_here: accountType[]
}



export default function Samp() {
    const params = useParams()
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [colorVal, setColorVal] = useState<string>("")
    const [user] = IsLoggedIn()
    const { loading, setLoading }: any = useStore()
    const { settingsTask, settingsBoard, viewNotifs }: any = useStore()
    const { inviteToProject, setInviteToProject }: any = useStore()
    const { openKanbanSettings }: any = useStore()
    const { openKanbanChat }: any = useStore()
    const [searchQuery, setSearchQuery] = useState('');
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtask, setNewSubtask] = useState<string>("");
    const [isEditing, setIsEditing] = useState<number | null>(null); // Track the ID of the subtask being edited
    const [editedTask, setEditedTask] = useState<string>("");


    useEffect(() => {
        if (user) {
            getProjects();
            getAccounts()
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
    }, [user, openKanbanChat, openKanbanSettings, viewNotifs, settingsBoard, settingsTask, inviteToProject, loading]);

    const handleRealtimeEvent = (payload: any) => {
        console.log(payload.new);

        // Check if the item matches the payload before switching
        const matchingItem = fetchedData?.find(item => item.id === payload.new.id);
        if (matchingItem) {
            // Place any specific logic you want to handle with `created_by` here
            if (matchingItem.created_by !== payload.new.created_by) {
                console.log(`created_by changed from ${matchingItem.created_by} to ${payload.new.created_by}`);
            }
        }

        switch (payload.eventType) {
            case 'INSERT':
                setFetchedData((prevData) =>
                    prevData ? [...prevData, payload.new] : [payload.new]
                );
                break;

            case 'UPDATE':
                if (fetchedData) {
                    setFetchedData(fetchedData.map((item) =>
                        item.id === payload.new.id ? payload.new : item
                    ));
                }
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
            }
            if (error) {
                return console.error('Error fetching data:', error);
            }

        } catch (err) {
            console.log(err)
        }
    }

    async function getAccounts() {
        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('userid', user?.uid)

            if (data) {
                console.log(data)
            }
            if (error) {
                return console.error('Error fetching data:', error);
            }

        } catch (err) {
            console.log(err)
        }
    }


    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [currentContainerId, setCurrentContainerId] = useState<UniqueIdentifier>();
    const [containerName, setContainerName] = useState('');
    const [itemName, setItemName] = useState('');
    const [showAddContainerModal, setShowAddContainerModal] = useState(false);
    const [showAddItemModal, setShowAddItemModal] = useState(false);


    async function onAddContainer() {
        if (loading) return; // Prevent multiple submissions
        setLoading(true);


        if (!containerName) {
            setLoading(false)
            return
        };

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
        if (loading) return; // Prevent multiple submissions
        setLoading(true);


        if (!itemName || !assignee) {
            setLoading(false);
            return;
        }

        try {
            // Fetch the existing project to get the boards
            const { data: projectData, error: fetchError } = await supabase
                .from("projects")
                .select("boards")
                .eq("created_at", params?.time)
                .single();

            if (fetchError) {
                console.log("Error fetching project:", fetchError);
                setLoading(false);
                return;
            }

            const existingBoards: boardsType[] = projectData?.boards || [];

            // Flatten all task titles across all boards
            const allTaskTitles = existingBoards.flatMap(board => board.tasks.map(task => task.title));

            // Count how many times the itemName appears in all task titles
            const matchingTasks = allTaskTitles.filter(title => title.startsWith(itemName));
            const taskIndex = matchingTasks.length > 0 ? `(${matchingTasks.length + 1})` : "";

            const finalTitle = `${itemName}${taskIndex}`;

            const newTask: tasksType = {
                title: finalTitle, // Use the title with the new index
                created_at: Date.now(),
                created_by: user?.uid || "",
                priority: priority,
                type: workType,
                start_work: workStart,
                deadline: workEnd,
                assigned_to: assignee === "" ? "Everyone" : assignee,
                subTasks: subtasks,
            };

            // Find the specific board to add the task to
            const boardIndex = existingBoards.findIndex(board => board.board_uid === currentContainerId);
            if (boardIndex === -1) {
                console.log("Board not found!");
                setLoading(false);
                return;
            }

            // Append the new task to the board's tasks
            existingBoards[boardIndex].tasks.push(newTask);

            // Update the project with the modified boards array
            const { error: updateError } = await supabase
                .from("projects")
                .update({ boards: existingBoards })
                .eq("created_at", params?.time);

            if (updateError) {
                console.log("Error updating tasks:", updateError);
                setLoading(false);
            } else {
                console.log("Task added successfully!");
            }

            setLoading(false);
            setShowAddItemModal(false);
            setItemName("");
            setAssigne("Everyone");
            setWorkType("");
            setWorkEnd("");
            setWorkStart("");
            setPriority("");
            setSubtasks([])

        } catch (err) {
            console.log("Error adding task:", err);
            setLoading(false);
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

    const findTaskSubs = (id: string) => {
        const replacedString: string = id.replace("task-", "");
        const toInt: number = parseInt(replacedString, 10);

        const foundTask = fetchedData?.[0]?.boards?.flatMap((board) => board.tasks)
            .find((task) => task.created_at === toInt);



        const taskDetail = foundTask?.subTasks.length ?? 0; // Ensure this is a string

        // Return an empty string if the task detail is not valid
        return taskDetail;
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
        setLoading(true)

        if (loading) {
            return
        };
        try {
            const { error } = await supabase
                .from('projects')
                .update({ boards: updatedContainers })
                // .eq('created_by', user?.uid)
                .eq('created_at', params?.time);

            if (error) {
                console.log('Error saving updated order:', error);
                setLoading(false)
            } else {
                console.log('Updated order saved successfully!');
                setLoading(false)
            }
        } catch (err) {
            console.log('Error during update:', err);
            setLoading(false)
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
    const [filteredData, setFilteredData] = useState<dataType[] | null>(null);

    useEffect(() => {
        if (!fetchedData) return;

        const filtered = fetchedData?.map(project => ({
            ...project,
            boards: project.boards?.filter(board =>
                board?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                board?.tasks.some(task =>
                    task.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
            )
                .map(board => ({
                    ...board,
                    tasks: board?.tasks?.filter(task =>
                        task?.title?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                }))
        }));

        setFilteredData(filtered);
    }, [fetchedData, searchQuery]);


    const addSubtask = () => {
        if (newSubtask.trim()) {
            const newTask: Subtask = {
                id: Date.now(), // Unique ID based on timestamp
                description: newSubtask,
                completed: false,
            };
            setSubtasks([...subtasks, newTask]);
            setNewSubtask(""); // Clear input after adding
        }
    };

    const deleteSubtask = (id: number) => {
        const updatedSubtasks = subtasks.filter(subtask => subtask.id !== id);
        setSubtasks(updatedSubtasks);
    };

    const toggleCompletion = (id: number) => {
        const updatedSubtasks = subtasks.map(subtask =>
            subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
        );
        setSubtasks(updatedSubtasks);
    };


    const startEditing = (id: number, description: string) => {
        setIsEditing(id);
        setEditedTask(description);
    };

    const saveEditedTask = (id: number) => {
        if (!editedTask) return

        const updatedSubtasks = subtasks.map(subtask =>
            subtask.id === id ? { ...subtask, description: editedTask } : subtask
        );
        setSubtasks(updatedSubtasks);
        setIsEditing(null); // Exit editing mode
        setEditedTask("");
    };



    return (
        <div className=' flex flex-col h-[100dvh] overflow-hidden md:flex-row'>
            {
                user && fetchedData &&
                <MetaEditor
                    title={`${fetchedData && fetchedData[0]?.name || "Not found"} | ${user?.email}`}
                    description='Projects to manage your workflow with ease.'
                    keywords='Projects, Manage, Workflow, Orgamix'
                />
            }
            {
                //closes the modal if its in private, and not included in shareable invited_emails
                (fetchedData && fetchedData.length > 0 && (
                    fetchedData[0]?.created_by === user?.uid ||
                    (fetchedData[0]?.is_shared !== "private" && fetchedData[0]?.is_shared === "public") ||
                    (fetchedData[0]?.is_shared === "private" && fetchedData[0]?.created_by === user?.uid) ||
                    (fetchedData[0]?.is_shared === "shareable" &&
                        ((fetchedData[0]?.invited_emails === null && fetchedData[0]?.created_by === user?.uid) ||
                            (fetchedData[0]?.invited_emails?.some((itm: invitedEmails) => itm.email === user?.email) || false)))
                )) && settingsTask != null && settingsTask != null &&
                <EditTaskProject isAllowed={(findTaskAssignee((settingsTask.toString())) === user?.email ? true : false) ||
                    (findTaskAssignee((settingsTask.toString())) === "Everyone" && true) ||
                    (fetchedData && fetchedData[0]?.created_by === user?.uid ? true : false)
                } />

            }
            {
                (fetchedData && fetchedData.length > 0 && (
                    fetchedData[0]?.created_by === user?.uid ||
                    (fetchedData[0]?.is_shared !== "private" && fetchedData[0]?.is_shared === "public") ||
                    (fetchedData[0]?.is_shared === "private" && fetchedData[0]?.created_by === user?.uid) ||
                    (fetchedData[0]?.is_shared === "shareable" &&
                        ((fetchedData[0]?.invited_emails === null && fetchedData[0]?.created_by === user?.uid) ||
                            (fetchedData[0]?.invited_emails?.some((itm: invitedEmails) => itm.email === user?.email) || false)))
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
                (fetchedData && fetchedData.length > 0 && (
                    fetchedData[0]?.created_by === user?.uid ||
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
                (fetchedData && fetchedData.length > 0 && (
                    fetchedData[0]?.created_by === user?.uid ||
                    (fetchedData[0].is_shared !== "private" && fetchedData[0].is_shared === "public") ||
                    (fetchedData[0].is_shared === "private" && fetchedData[0].created_by === user?.uid) ||

                    (fetchedData[0].is_shared === "shareable" &&
                        ((fetchedData[0].invited_emails === null && fetchedData[0]?.created_by === user?.uid) ||
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
                        purpose='modal'
                        showModal={showAddContainerModal}
                        setShowModal={setShowAddContainerModal}>
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

                    <Modal showModal={showAddItemModal} setShowModal={setShowAddItemModal} purpose='task'>
                        <div className="flex flex-col w-full items-start gap-y-4 justify-between h-full overflow-auto">
                            <div className='flex flex-col w-full items-start gap-y-4 '>
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

                                <div className='flex flex-col gap-2 '>
                                    <div className='flex flex-col'>
                                        <div>Subtasks</div>
                                        <div className='text-sm text-[#888]'>Break down tasks into smaller steps. Track progress by checking off completed items.</div>
                                    </div>


                                    <div className="flex gap-2 mt-2">
                                        <input
                                            type="text"
                                            value={newSubtask}
                                            onChange={(e) => setNewSubtask(e.target.value)}
                                            placeholder="Enter subtask"
                                            className='p-2 w-full bg-[#111111] border-[#535353] border-[1px] rounded-lg flex outline-none '

                                        />
                                        <button onClick={addSubtask}
                                            className='p-2 px-4 text-[#888]  gap-2 text-sm items-center hover:bg-[#222] flex bg-[#111111] border-[#535353] border-[1px] rounded-lg   cursor-pointer'>
                                            <span>Add</span> <IoMdAdd />
                                        </button>
                                    </div>

                                    <div className="mt-4 flex flex-col gap-2">
                                        {subtasks.length > 0 ? (
                                            subtasks.map((subtask) => (
                                                <div key={subtask.id} className="flex items-center bg-[#222] rounded-md justify-between py-1">
                                                    <div className='flex gap-2 p-2 items-center'>
                                                        <input
                                                            type="checkbox"
                                                            checked={subtask.completed}
                                                            onChange={() => toggleCompletion(subtask.id)}
                                                        />
                                                        <div className='flex flex-col items-start justify-start'>
                                                            <div className="flex items-center gap-2">
                                                                <div>
                                                                </div>
                                                                {isEditing === subtask.id ? (
                                                                    <input
                                                                        type="text"
                                                                        value={editedTask}
                                                                        onChange={(e) => setEditedTask(e.target.value)}
                                                                        className="border p-1 rounded-md px-2 outline-none"
                                                                    />
                                                                ) : (
                                                                    <span
                                                                        className={subtask.completed ? 'line-through text-gray-400 cursor-pointer' : 'cursor-pointer'}
                                                                        onClick={() => startEditing(subtask.id, subtask.description)}
                                                                    >
                                                                        {subtask.description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className='text-sm text-[#888] px-2'>
                                                                {subtask.id ? moment(subtask.id).format('MM/DD/YY, h:mm A') : 'No Creation date'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 m-2">
                                                        {isEditing === subtask.id ? (
                                                            <button
                                                                onClick={() => saveEditedTask(subtask.id)}
                                                                className="text-green-500 hover:text-green-700"
                                                            >
                                                                Save
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => deleteSubtask(subtask.id)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-[#888]">No subtasks available</div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className='w-full h-full max-h-[40px] flex rounded-lg overflow-hidden border-[#535353] border-[1px] mt-4'>
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
                    </Modal>
                }


                <div className="p-3 h-[60px] mt-[35px] overflow-auto border-b-[#535353] border-b-[1px] md:mt-0  flex items-center justify-between gap-y-2">
                    <div className='flex gap-2 items-center'>
                        {
                            loading ?
                                <div className='flex gap-2 items-center text-[10px] border-[#535353] border-[1px] h-full p-2 rounded-md'>
                                    <div className='w-[20px] h-[20px] text-[#888]'>
                                        <Loader />
                                    </div>
                                </div>
                                :
                                <div className='flex gap-2 items-center text-[10px]  border-[#535353] border-[1px] h-full p-[13px] rounded-md'>
                                    <div className='text-[#888] flex items-center'>
                                        <FaCheck />
                                    </div>
                                </div>
                        }
                        <div className='w-full max-w-[250px] mr-2  overflow-hidden r'>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder='⌕ Search (e.g tasks, boards)'
                                className=' flex gap-2 w-full items-center placeholder:text-[#888] text-md border-[#535353] border-[1px] p-[7px] outline-none text-[#888] rounded-md bg-[#111111]'
                                type="text" />

                        </div>


                    </div>
                    <div className='flex gap-3 items-center '>
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
                    user?.uid && fetchedData !== null
                        ? (
                            // Check if the user has access to the project
                            (fetchedData[0]?.created_by === user?.uid ||
                                fetchedData[0]?.is_shared === "public" ||
                                (fetchedData[0]?.is_shared === "shareable" &&
                                    fetchedData[0]?.invited_emails?.some((itm) => itm?.email === user?.email)))
                                ? (
                                    // Check if there are boards
                                    fetchedData[0]?.boards?.length > 0
                                        ? (
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


                                                <div className='mt-5'>
                                                    <div className="grid p-3 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                                                        <DndContext
                                                            sensors={sensors}
                                                            collisionDetection={closestCorners}
                                                            onDragStart={handleDragStart}
                                                            onDragMove={handleDragMove}
                                                            onDragEnd={handleDragEnd}>

                                                            <SortableContext items={filteredData && filteredData[0]?.boards != null ? filteredData[0].boards.map((board: boardsType) => board.board_uid) : []}>
                                                                <AnimatePresence>
                                                                    {
                                                                        filteredData && filteredData[0]?.boards?.length === 0 && searchQuery &&
                                                                        <div className='text-sm text-[#888]'>No result</div>
                                                                    }
                                                                    {user && filteredData && filteredData[0].boards && filteredData[0].boards.map((board: boardsType) => (
                                                                        <motion.div
                                                                            key={board.board_uid}
                                                                            layout
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            animate={{ opacity: 1, y: 0 }} // Animate to visible position
                                                                            exit={{ opacity: 0, y: 10 }} // Animate out to hidden position
                                                                            transition={{ duration: 0.3, ease: 'easeInOut' }} // Adjust duration and easing
                                                                        >

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
                                                                                            return (
                                                                                                <div
                                                                                                    className='px-2'

                                                                                                >
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
                                                                                                        subTasksLength={task?.subTasks.length}
                                                                                                    />
                                                                                                </div>
                                                                                            );
                                                                                        })
                                                                                    ) : (
                                                                                        <p className='px-2 text-sm text-[#888]'>No tasks available</p>
                                                                                    )}

                                                                                </div>

                                                                            </Container>
                                                                        </motion.div>

                                                                    ))}
                                                                </AnimatePresence>
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
                                                                        subTasksLength={findTaskSubs((activeId.toString()))}
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
                                                                                        subTasksLength={task?.subTasks.length}
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
                                        ) : (
                                            // No boards available
                                            <div className='text-sm text-[#888] w-full text-left p-2 '>Create your first Kanban board!</div>
                                        )
                                ) : (
                                    // User is not allowed access
                                    <div className='text-sm text-[#888] w-full text-center p-2'>
                                        Not Allowed
                                    </div>
                                )
                        ) : (
                            // Fetched data is not available or still loading
                            <div className='p-3 overflow-hidden'>
                                {!fetchedData ? (
                                    <div className='flex gap-2 items-center h-[92vh] justify-center'>
                                        <div className='w-[20px] h-[20px]'>
                                            <Loader />
                                        </div>
                                        <div className='text-sm text-[#888]'>Fetching your data</div>
                                    </div>
                                ) : (
                                    <div className='text-sm text-[#888] w-full text-center'>
                                        The project may have been deleted or does not exist.
                                    </div>
                                )}
                            </div>
                        )
                }



            </div>
        </div>
    );
}