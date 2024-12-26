// useTaskData.ts
import { useEffect, useState } from 'react';
import { supabase } from '../../../../supabase/supabaseClient';
import IsLoggedIn from '../../../Utils/IsLoggedIn';

export interface TaskDataType {
    title: string;
    deadline: string;
    description: string;
    id: number;
    isdone: boolean;
    priority: string;
    userid: string;
    repeat: string;
    createdAt: string;
    link: string[];
    category: string;
}

const TaskLength = () => {
    const [user]:any = IsLoggedIn();
    const [taskData, setTasksData] = useState<TaskDataType[] | null>(null);

    useEffect(() => {
        if (user) {
            getUserTask();

        }
    }, [user]);

    async function getUserTask() {
        try {
            if (!user) {
                console.error('User is not defined or uid is missing');
                return;
            }

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('userid', user?.id)

            if (data) {
                setTasksData(data);
            } else {
                console.log("Error:", error);
            }
        } catch (err) {
            console.error("Error fetching tasks:", err);
        }
    }
    return taskData?.length ? ( <div className='text-md text-[#888]'>({taskData.length})</div> ) : ( <div>(0)</div> );
};

export default TaskLength;
