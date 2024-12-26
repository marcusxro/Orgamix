import { useEffect, useState } from 'react';
import { supabase } from '../../../../supabase/supabaseClient';
import IsLoggedIn from '../../../Utils/IsLoggedIn';

interface subtaskType {
    is_done: boolean;
    startedAt: string;
    subGoal: string
}
interface habitsType {
    repeat: string;
    habit: string;
}
interface dataType {
    userid: string;
    id: number;
    title: string;
    category: string;
    is_done: boolean;
    created_at: number;
    description: string;
    sub_tasks: subtaskType[];
    habit: habitsType[];
    deadline: string;
}

const GoalsLength:React.FC = () => {
    const [taskData, setTasksData] = useState<dataType[] | null>(null);
    const [user]:any = IsLoggedIn();

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
                .from('goals')
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
  
}

export default GoalsLength
