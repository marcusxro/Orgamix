import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../supabase/supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import IsLoggedIn from '../../../../firebase/IsLoggedIn';
import { Tooltip as ReactTooltip } from 'react-tooltip'


interface InvitedEmails {
    username: string;
    email: string;
    userid: string;
}

interface UpdatedAt {
    date: string;
    username: string;
    email: string;
    uid: string;
    itemMoved: string;
}

interface Subtask {
    id: number;
    description: string;
    completed: boolean;
}

interface TasksType {
    title: string;
    created_at: number;
    created_by: string;
    priority: string;
    type: string;
    start_work: string;
    deadline: string;
    assigned_to: string; // uid basis
    subTasks: Subtask[];
}

interface BoardsType {
    title: string;
    titleColor: string; // hex
    created_at: number;
    board_uid: string;
    created_by: string;
    tasks: TasksType[];
}

interface DataType {
    description: string;
    id: number;
    created_at: number;
    name: string; // Project name
    created_by: string;
    deadline: number;
    is_shared: any;
    invited_emails: InvitedEmails[] | null;
    updated_at: UpdatedAt[] | null;
    is_favorite: boolean;
    boards: BoardsType[];
}

const InvitedProjects: React.FC = () => {
    const [fetchedData, setFetchedData] = useState<DataType[] | null>(null);
    const [user] = IsLoggedIn();

    useEffect(() => {
        if (user) {
            getProjects();
        }
    }, [user]);

    async function getProjects() {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*');

            if (error) {
                console.error('Error fetching data:', error);
                return;
            }

            if (data) {
                const filteredData = data.filter((project: any) =>
                    project.invited_emails?.some((invited: any) => invited.email === user?.email)
                );
                setFetchedData(filteredData);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    }

    const calculateStats = () => {
        if (!fetchedData || !Array.isArray(fetchedData)) {
            console.warn("No data available or data is not an array");
            return [];
        }

        const projectStats = fetchedData.map((project) => {
            let boardsCreated = 0;
            let tasksCreated = 0;

            if (project.boards && Array.isArray(project.boards)) {
                project.boards.forEach((board) => {
                    if (board.created_by === user?.uid) {
                        boardsCreated += 1;

                        if (board.tasks && Array.isArray(board.tasks)) {
                            board.tasks.forEach((task) => {
                                if (task.created_by === user?.uid) {
                                    tasksCreated += 1;
                                }
                            });
                        }
                    }
                });
            }

            return {
                projectName: project.name,
                boardsCreated,
                tasksCreated,
            };
        });


        // Transform project stats into a single array for the pie chart
        const totalContributions = projectStats.reduce((acc, stats) => {
            return acc + stats.boardsCreated + stats.tasksCreated;
        }, 0);

        const pieData = projectStats.map((stats) => {
            const totalForProject = stats.boardsCreated + stats.tasksCreated;
            const percentage = totalContributions > 0 ? (totalForProject / totalContributions) * 100 : 0; // Calculate percentage

            return {
                name: stats.projectName,
                value: totalForProject,
                boards: stats.boardsCreated,
                tasks: stats.tasksCreated,
                percentage: percentage.toFixed(2), // Store percentage as a fixed decimal
            };
        });

        return pieData;
    };

    const dataForPieChart = calculateStats();

    const COLORS = [
        '#000000', // Black
        '#1C1C1C', // Dark Gray
        '#2E2E2E', // Darker Gray
        '#3B3B3B', // Dark Charcoal
        '#4B0082', // Indigo
        '#4B0082', // Dark Violet
        '#5C5C5C', // Dim Gray
        '#7B7B7B', // Light Slate Gray
        '#8B0000', // Dark Red
        '#8B008B', // Dark Magenta
        '#8B4513', // Saddle Brown
        '#A52A2A', // Brown
        '#2F4F4F', // Dark Slate Gray
        '#191970', // Midnight Blue
        '#483D8B', // Dark Slate Blue
        '#696969', // Dim Gray
        '#B22222', // Firebrick
        '#4F4F4F', // Dark Gray
        '#708090', // Slate Gray
        '#4C4C4C', // Darker Gray
        '#2A2A2A', // Jet
        '#800080', // Purple
    ];

    return (
        <div>
            <div className='mb-8'>
                <div className=' font-bold flex gap-2'>Project Activity Summary
                <span className='px-2 text-sm rounded-lg bg-[#222] border-[1px] border-[#535353]'>
                        {dataForPieChart.length}
                    </span>

                </div>
                <p className='text-sm text-[#888]'>Monitor the activity of your invited projects here</p>

            </div>
            {
                fetchedData === null && (
                    <div className='h-full w-full min-h-[200px] bg-[#888] rounded-lg animate-pulse flex gap-2'>
                
                    </div>
                )
            }

            {
                fetchedData && fetchedData.length > 0 && (
                    <div className='flex h-full w-full gap-2 items-start bg-[#191919] border-[1px] border-[#535353] rounded-lg  justify-start'>
                        <div className='w-full h-full max-w-[200px] min-h-[200px]'>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const { name, value } = payload[0];
                                                const { boards, tasks } = dataForPieChart.find(item => item.name === name) || {};
                                                return (
                                                    <div className="custom-tooltip bg-[#111] p-2 border-[1px] border-[#535353] rounded-lg">
                                                        <p className="label mb-2 font-bold text-white">{`${name}`}</p>
                                                        <p className="label text-white">{`Total Created: ${value}`}</p>
                                                        <p className="label text-white">{`Boards Created: ${boards}`}</p>
                                                        <p className="label text-white">{`Tasks Created: ${tasks}`}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Pie
                                        data={dataForPieChart}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius="40%" // Use percentage for outer radius
                                        fill="#222"
                                        label={({ percentage, x, y }) => (
                                            <text
                                                x={x}
                                                y={y}
                                                fontSize={10}
                                                fill="#FFFFFF" // Change the label text color to white
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                {`${percentage}%`} {/* Display percentage */}
                                            </text>
                                        )}
                                    >
                                        {dataForPieChart.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className='w-full flex flex-col gap-2 p-2 overflow-auto max-h-[200px]'>
                            {
                                dataForPieChart?.map((item, index) => (
                                    <div
                                        data-tooltip-id={`hover-${index}${item.name}`}
                                        className='flex flex-col gap-2 h-auto sm:h-[90px] sm:flex-row items-center justify-between bg-[#222] cursor-pointer hover:bg-[#333] border-[1px] border-[#535353] p-2 rounded-lg text-sm'
                                        key={index}>

                                        <p  className="font-bold text-sm text-left w-full" key={index}>{item.name}</p>
                                        <p className='text-sm text-green-500 text-left w-full sm:w-auto'>{item?.percentage}%</p>

                                        <ReactTooltip
                                            id={`hover-${index}${item.name}`}
                                            place="bottom"
                                            variant="dark"
                                            className='rounded-lg border-[#535353] border-[1px]'
                                            content={`Total Created: ${item.value} \n Boards Created: ${item.boards} \n Tasks Created: ${item.tasks}`}
                                        />
                                    </div>
                                ))

                            }
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default InvitedProjects;
