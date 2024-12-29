import React, { useEffect, useState } from 'react'
import { GiScrollQuill } from "react-icons/gi";
import { supabase } from '../../Utils/supabase/supabaseClient';



async function fetchAuthorByID(params: string): Promise<userType | null> {
    try {
        const { data, error } = await supabase
            .from('accounts')
            .select('username') 
            .eq("userid", params)
            .single();

        if (error) {
            console.error('Error fetching data:', error);
            return null;
        }

        return data as userType;
    } catch (err) {
        console.error('Error:', err);
        return null;
    }
}


interface userType {
    userid: string;
    username: string;
    password: string;
    email: string;
    id: number;
    fullname: string;
}

interface userId{
        authorUid: string
}
const GetAuthor:React.FC<userId> = ({authorUid}) => {
    const [authorName, setAuthorName] = useState<string | null>(null);
    
    useEffect(() => {
        // Fetch the author name when the component mounts
        const fetchAuthor = async () => {
            const user = await fetchAuthorByID(authorUid);
            setAuthorName(user?.username || 'Unknown');
        };

        fetchAuthor();
    }, [authorUid]);

    return (
        <div className="flex items-center gap-2">
            <GiScrollQuill />
            {authorName ? authorName : 'Loading...'}
        </div>
    );
}

export default GetAuthor
