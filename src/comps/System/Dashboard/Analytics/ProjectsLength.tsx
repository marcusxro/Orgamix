import { useEffect, useState } from 'react';
import { supabase } from '../../../../supabase/supabaseClient';
import IsLoggedIn from '../../../../firebase/IsLoggedIn';

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

const ProjectsLength = () => {
    const [taskData, setTasksData] = useState<dataType[] | null>(null);
    const [user] = IsLoggedIn();

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
                .from('projects')
                .select('*')
                .eq('created_by', user?.uid)

            if (data) {
                setTasksData(data);
            } else {
                console.log("Error:", error);
            }
        } catch (err) {
            console.error("Error fetching tasks:", err);
        }
    }
    console.log(taskData);
    return taskData?.length ? ( <div className='text-md text-[#888]'>({taskData.length})</div> ) : ( <div>(0)</div> );
  
}

export default ProjectsLength
