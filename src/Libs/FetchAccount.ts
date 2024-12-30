import { useState, useEffect } from 'react';
import { supabase } from '../comps/Utils/supabase/supabaseClient';
import accountDetails from '../@types/Interface/AccountType';

const UseFetchAccount = (userID: string) => {
    const [userData, setUserData] = useState<accountDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchAccount() {
        setLoading(true);
        setError(null); // Reset any previous errors

        console.log(userID)

        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('userid', userID)
                .single();

            if (error) {
                setError(error.message);
                setUserData(null);
            } else {
                setUserData(data);
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (userID) {
            fetchAccount();
        }
    }, [userID]);

    return { userData, loading, error, refetch: fetchAccount };
};

export default  UseFetchAccount;
