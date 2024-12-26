import React, { useEffect, useState } from 'react'
import { supabase } from '../../supabase/supabaseClient'

const useCheckBan:React.FC = (user: any) => {

    const [isUserBan, setIsUserBan] = useState(false);

    useEffect(() => {
      if (user) {
        const checkUserIsBan = async () => {
          try {
            const { data: userBan, error } = await supabase
              .from('accounts')
              .select('is_ban')
              .eq('userid', user?.id)
              .single();
  
            if (error) throw error;
  
            setIsUserBan(userBan?.is_ban || false);
          } catch (error) {
            console.error(error);
          }
        };
  
        checkUserIsBan();
      }
    }, [user]);
  
    return isUserBan;
}


export default useCheckBan
