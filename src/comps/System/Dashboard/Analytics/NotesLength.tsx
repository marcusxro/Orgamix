// useTaskData.ts
import { useEffect, useState } from 'react';
import { supabase } from '../../../../supabase/supabaseClient';
import IsLoggedIn from '../../../../firebase/IsLoggedIn';

interface fetchedDataType {
    id: number;
    title: string;
    notes: string;
    category: string;
    userid: string;
    createdat: string
}

const NotesLength = () => {
    const [taskData, setTasksData] = useState<fetchedDataType[] | null>(null);
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
                .from('notes')
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

export default NotesLength
