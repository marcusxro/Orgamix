import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';
import { CiShare2 } from "react-icons/ci";
import { MdOutlineViewKanban } from "react-icons/md";

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

type DNDType = {
    id: UniqueIdentifier;
    title: string;
    titleColor: string;
    items: {
        id: UniqueIdentifier;
        title: string;
    }[];
};

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
    description: string;
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


export default function Samp() {
    const params = useParams()
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [colorVal, setColorVal] = useState<string>("#ffffff")
    const [user] = IsLoggedIn()

    useEffect(() => {
        if (user) {
            getProjects();
            const subscription = supabase
                .channel('public:projects')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                    console.log('Realtime event:', payload);
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
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('created_by', user?.uid)
                .eq('created_at', params?.time)

            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setFetchedData(data);
                console.log(data)
            }
        } catch (err) {
            console.log(err);
        }
    }




    const [containers, setContainers] = useState<DNDType[]>([]);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [currentContainerId, setCurrentContainerId] = useState<UniqueIdentifier>();
    const [containerName, setContainerName] = useState('');
    const [itemName, setItemName] = useState('');
    const [showAddContainerModal, setShowAddContainerModal] = useState(false);
    const [showAddItemModal, setShowAddItemModal] = useState(false);


    useEffect(() => {
        console.log(containers)
    }, [containers])


    async function onAddContainer() {
        if (!containerName) return;
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
                .eq("created_by", user?.uid)
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
                .eq("created_by", user?.uid)
                .eq("created_at", params?.time);

            if (updateError) {
                console.log("Error updating boards:", updateError);
            } else {
                console.log("Board added successfully!");
            }

            // Reset form and close modal
            setContainerName("");
            setShowAddContainerModal(false);
            setColorVal("")
        } catch (err) {
            console.log("Error adding container:", err);
        }
    }



    interface tasksType {
        title: string;
        created_at: number;
        created_by: string;
        description: string;
        type: string;
        start_work: string;
        deadline: string;
        assigned_to: string; //uid basis
    }


    async function onAddItem() {
        if (!itemName) return;

        try {
            const newTask: tasksType = {
                title: itemName,
                created_at: Date.now(),
                created_by: user?.uid || "", // Ensure user ID is present
                description: '',
                type: '', // You can set a default or pass this as an argument if necessary
                start_work: '',
                deadline: '',
                assigned_to: '', // Set to the actual user ID if needed
            };

            // Fetch the existing project to get the boards
            const { data: projectData, error: fetchError } = await supabase
                .from("projects")
                .select("boards")
                .eq("created_by", user?.uid)
                .eq("created_at", params?.time)
                .single();

            if (fetchError) {
                console.log("Error fetching project:", fetchError);
                return;
            }

            const existingBoards: boardsType[] = projectData?.boards || [];

            // Find the specific board to add the task to
            const boardIndex = existingBoards.findIndex(board => board.board_uid === currentContainerId);
            if (boardIndex === -1) {
                console.log("Board not found!");
                return;
            }

            // Append the new task to the found board's tasks
            existingBoards[boardIndex].tasks.push(newTask);

            // Update the boards array in the project
            const { error: updateError } = await supabase
                .from("projects")
                .update({ boards: existingBoards })
                .eq("created_by", user?.uid)
                .eq("created_at", params?.time);

            if (updateError) {
                console.log("Error updating tasks:", updateError);
            } else {
                console.log("Task added successfully!");
            }

            setShowAddItemModal(false);
            setItemName("")

        } catch (err) {
            console.log("Error adding task:", err);
        }
    }


    // Find the value of the items
    function findValueOfItems(id: UniqueIdentifier | undefined, type: string) {
        if (type === 'container') {
            return containers.find((item) => item.id === id);
        }
        if (type === 'item') {
            return containers.find((container) =>
                container.items.find((item) => item.id === id),
            );
        }
    }

    const findItemTitle = (id: UniqueIdentifier | undefined) => {
        const container = findValueOfItems(id, 'item');
        if (!container) return '';
        const item = container.items.find((item) => item.id === id);
        if (!item) return '';
        return item.title;
    };

    const findContainerTitle = (id: UniqueIdentifier | undefined) => {
        const container = findValueOfItems(id, 'container');
        if (!container) return '';
        return container.title;
    };

    const findContainerItems = (id: UniqueIdentifier | undefined) => {
        const container = findValueOfItems(id, 'container');
        if (!container) return [];
        return container.items;
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

        // Handle Items Sorting
        if (
            active.id.toString().includes('item') &&
            over?.id.toString().includes('item') &&
            active &&
            over &&
            active.id !== over.id
        ) {
            // Find the active container and over container
            const activeContainer = findValueOfItems(active.id, 'item');
            const overContainer = findValueOfItems(over.id, 'item');

            // If the active or over container is not found, return
            if (!activeContainer || !overContainer) return;

            // Find the index of the active and over container
            const activeContainerIndex = containers.findIndex(
                (container) => container.id === activeContainer.id,
            );
            const overContainerIndex = containers.findIndex(
                (container) => container.id === overContainer.id,
            );

            // Find the index of the active and over item
            const activeitemIndex = activeContainer.items.findIndex(
                (item) => item.id === active.id,
            );
            const overitemIndex = overContainer.items.findIndex(
                (item) => item.id === over.id,
            );
            // In the same container
            if (activeContainerIndex === overContainerIndex) {
                let newItems = [...containers];
                newItems[activeContainerIndex].items = arrayMove(
                    newItems[activeContainerIndex].items,
                    activeitemIndex,
                    overitemIndex,
                );

                setContainers(newItems);
            } else {
                // In different containers
                let newItems = [...containers];
                const [removeditem] = newItems[activeContainerIndex].items.splice(
                    activeitemIndex,
                    1,
                );
                newItems[overContainerIndex].items.splice(
                    overitemIndex,
                    0,
                    removeditem,
                );
                setContainers(newItems);
            }
        }

        // Handling Item Drop Into a Container
        if (
            active.id.toString().includes('item') &&
            over?.id.toString().includes('container') &&
            active &&
            over &&
            active.id !== over.id
        ) {
            // Find the active and over container
            const activeContainer = findValueOfItems(active.id, 'item');
            const overContainer = findValueOfItems(over.id, 'container');

            // If the active or over container is not found, return
            if (!activeContainer || !overContainer) return;

            // Find the index of the active and over container
            const activeContainerIndex = containers.findIndex(
                (container) => container.id === activeContainer.id,
            );
            const overContainerIndex = containers.findIndex(
                (container) => container.id === overContainer.id,
            );

            // Find the index of the active and over item
            const activeitemIndex = activeContainer.items.findIndex(
                (item) => item.id === active.id,
            );

            // Remove the active item from the active container and add it to the over container
            let newItems = [...containers];
            const [removeditem] = newItems[activeContainerIndex].items.splice(
                activeitemIndex,
                1,
            );
            newItems[overContainerIndex].items.push(removeditem);
            setContainers(newItems);
        }
    };


    function findBoardContainingTask(taskId: string | number) {
        if (!fetchedData) return
        return fetchedData[0]?.boards.find((boards: boardsType) =>
            boards.tasks.some(task => task.created_at === taskId)
        );
    }

    function findBoardById(boardId: string | number) {
        if (!fetchedData) return
        return fetchedData[0]?.boards.find(board => board.board_uid === boardId);
    }


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
        }



        console.log(newItems)
        saveChangesToDB(newItems)

//       // Handling Task Sorting (within the same or between different boards)
// if (
//     (active.id.toString().includes('item') || active.id.toString().includes('container')) &&
//         over?.id.toString().includes('container') &&
//         active &&
//         over &&
//         active.id !== over.id
// ) {

//     const activeBoard = fetchedData[0]?.boards.find(board => board.board_uid === active.id);
//     const overBoard = fetchedData[0]?.boards.find(board => board.board_uid === over.id);

//     if (!activeBoard || !overBoard) return;
//     console.log("AHAHJ")
//     const activeBoardIndex = newItems.findIndex(
//         (board) => board.board_uid === activeBoard.board_uid,
//     );
//     const overBoardIndex = newItems.findIndex(
//         (board) => board.board_uid === overBoard.board_uid,
//     );

//     const activeTaskIndex = activeBoard.tasks.findIndex(
//         (task) => task.created_at === active.id,
//     );
//     const overTaskIndex = overBoard.tasks.findIndex(
//         (task) => task.created_at === over.id,
//     ); // Define overTaskIndex here

//     if (activeBoardIndex === overBoardIndex) {
//         // Reorder tasks within the same board
//         newItems[activeBoardIndex].tasks = arrayMove(
//             newItems[activeBoardIndex].tasks,
//             activeTaskIndex,
//             overTaskIndex,
//         );
//     } else {
//         // Move task between different boards
//         const [removedTask] = newItems[activeBoardIndex].tasks.splice(
//             activeTaskIndex,
//             1,
//         );
//         newItems[overBoardIndex].tasks.splice(overTaskIndex, 0, removedTask);
//     }

//     // Update fetchedData with new board and task structure
//     const updatedFetchedData = {
//         ...fetchedData[0],
//         boards: newItems,
//     };


//     setFetchedData([updatedFetchedData])

// }

        // Reset active item after sorting
        setActiveId(null);
    }
    


    async function saveChangesToDB(updatedContainers: boardsType[]) {
        console.log("RUN")
        try {
            // Assuming "projects" table has containers and tasks stored
            const { error } = await supabase
                .from('projects')
                .update({ boards: updatedContainers })
                .eq('created_by', user?.uid)
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
                <div className='text-sm text-[#cc0000] flex gap-1 items-center'>
                    <MdDateRange />
                    Deadline Met
                </div>
            );
        } else if (daysDiff > 0) {
            // If the deadline is in the future
            return (
                <div className={`${daysDiff <= 3 && 'text-[#cc0000]'} text-[#888] text-sm flex gap-1 items-center`}>
                    <MdDateRange />
                    {`${deadlineString} / ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} left`}
                </div>
            );
        } else {
            // If the deadline has passed
            return (
                <div className='text-sm text-[#cc0000] flex gap-1 items-center'>
                    <MdDateRange />
                    {`${deadlineString} / ${Math.abs(daysDiff)} ${Math.abs(daysDiff) === 1 ? 'day' : 'days'} ago`}
                </div>
            );
        }
    }


    return (
        <div className=' flex flex-col h-[100dvh] overflow-hidden md:flex-row'>

            <div className="h-[30px] w-full max-w-[100%] md:sticky md:top-0 md:h-screen md:max-w-[200px]">
                <KanBanSidebar location='kanban' />
            </div>

            <div className=' w-full h-[100dvh] overflow-auto'>

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
                        <Button variant={"addBoard"} onClick={onAddContainer}>Add container</Button>
                    </div>

                </Modal>

                <Modal showModal={showAddItemModal} setShowModal={setShowAddItemModal}>
                    <div className="flex flex-col w-full items-start gap-y-4">
                        <h1 className="text-gray-800 text-xl font-bold">Add Item</h1>
                        <Input
                            type="text"
                            placeholder="Item Title"
                            name="itemname"
                            colorVal={"#fffff"}
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                        />
                        <Button variant={"addBoard"} onClick={onAddItem}>Add Item</Button>
                    </div>
                </Modal>

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

                        <Button
                            variant={"addBoard"}
                            onClick={() => setShowAddContainerModal(true)}>
                            <CiShare2 />  <span className='hidden md:block'>Invite</span>
                        </Button>
                    </div>

                </div>
                {
                    fetchedData &&
                    <div className='p-2'>
                        <div className='px-3 border-[#535353] border-[1px] py-2 flex flex-col items-start bg-[#191919] rounded-lg w-full max-w-[550px]'>
                            <h1 className="text-white text-lg font-bold">
                                {fetchedData != null && (fetchedData?.length <= 20 ? fetchedData[0]?.name.slice(0, 20) + "..." : fetchedData != null && fetchedData[0]?.name)}
                            </h1>
                            <div className='text-sm text-[#888] mt-2 w-full max-w-[800px] break-all'>
                                {fetchedData != null && fetchedData[0]?.description}
                            </div>
                            <div className='text-sm flex gap-[1px] items-center text-green-500 mt-2'>
                                {checkDeadlineMet(fetchedData[0]?.deadline)}
                            </div>
                            <div className='text-sm border-[#535353] border-[1px] px-2 py-1 mt-2 rounded-md bg-[#111111]'>
                                {fetchedData != null && fetchedData[0]?.is_shared}
                            </div>
                        </div>
                    </div>
                }
                <div className='mt-5'>
                    <div className="grid p-3 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3    gap-6">

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragMove={handleDragMove}
                            onDragEnd={handleDragEnd}
                        >

                            <SortableContext items={fetchedData && fetchedData[0]?.boards != null ? fetchedData[0].boards.map((board: boardsType) => board.board_uid) : []}>
                                {fetchedData && fetchedData[0].boards && fetchedData[0].boards.map((board: boardsType) => (
                                    <Container
                                        id={board.board_uid}
                                        title={board.title}
                                        titleColor={board?.titleColor}
                                        key={board.board_uid}
                                        itemLength={Array.isArray(board.tasks) ? board.tasks.length : 0} // Safely access length
                                        onAddItem={() => {
                                            setShowAddItemModal(true);
                                            setCurrentContainerId(board.board_uid);
                                        }}
                                    >
                                        {
                                          board?.tasks &&
                                          <SortableContext items={Array.isArray(board.tasks) ? board.tasks.map((task: tasksType) => task?.created_at) : []}>
                                          <div
                                           className="flex items-start flex-col p-2 gap-y-4">
                                              {Array.isArray(board.tasks) && board.tasks.length > 0 ? (
                                                  board.tasks.map((task: tasksType, idx: number) => (
                                                      <Items
                                                          title={task?.title}
                                                          id={task?.created_at}
                                                          key={task?.created_at || `task-${idx}`} // Use created_at as key or fallback to a unique string
                                                      />
                                                  ))
                                              ) : (
                                                  <p>No tasks available</p> // Handle case where tasks array is empty
                                              )}
                                          </div>
                                      </SortableContext>
                                        }
                                       
                                    </Container>
                                ))}
                            </SortableContext>




                            <DragOverlay adjustScale={false}>
                                {/* Drag Overlay For item Item */}
                                {activeId && activeId.toString().includes('item') && (
                                    <Items id={activeId} title={findItemTitle(activeId)} />
                                )}
                                {/* Drag Overlay For Container */}
                                {activeId && activeId.toString().includes('container') && (
                                    <Container titleColor={"fffff"} itemLength={0} id={activeId} title={findContainerTitle(activeId)}>
                                        {findContainerItems(activeId).map((i) => (
                                            <Items key={i.id} title={i.title} id={i.id} />
                                        ))}
                                    </Container>
                                )}
                            </DragOverlay>

                        </DndContext>
                    </div>
                </div>
            </div>
        </div>
    );
}