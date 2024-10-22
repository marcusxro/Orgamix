import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip'

interface tasksType {
    title: string;
    created_at: number;
    created_by: string;
    priority: string;
    type: string;
    start_work: string;
    deadline: string;
    assigned_to: string; // uid basis
}

interface boardsType {
    title: string;
    titleColor: string; // hex
    created_at: number;
    board_uid: string;
    created_by: string;
    tasks: tasksType[];
}

interface dataType {
    boardsOBJ: boardsType[];
}

const Visualizer: React.FC<dataType> = ({ boardsOBJ }) => {
    // Calculate total number of tasks
    const totalTasks = boardsOBJ.reduce((total, board) => total + board.tasks.length, 0);

    return (
        <div className="h-full max-h-[30px] w-full max-w-[400px] bg-black"> {/* Remove overflow-hidden */}
            <div className="flex rounded-md  ">
                {boardsOBJ.map((board) => {
                    const taskCount = board.tasks.length;
                    const barWidth = totalTasks > 0 ? (taskCount / totalTasks) * 100 + 1 : 0; // Calculate percentage width

                    return (
                        <>
                            <div
                                data-tooltip-id={board?.board_uid}
                                key={board.board_uid}
                                className="flex cursor-pointer h-full group"
                                style={{
                                    backgroundColor: board.titleColor,
                                    border: board.titleColor ? 'none' : '2px solid #fff',
                                    width: `${barWidth}%`,
                                    minHeight: '25px',
                                }}
                            >
                            </div>
                            {/* Tooltip */}
                            <ReactTooltip
                                id={board?.board_uid}
                                place="top"
                                variant="dark"
                                content={`${board?.title}  (${barWidth.toFixed(0)}%)`}
                            />
                        </>

                    );
                })}
            </div>
        </div>
    );
};

export default Visualizer;
