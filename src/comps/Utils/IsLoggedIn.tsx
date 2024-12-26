import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckBan from './CheckBan';
import useStore from '../../Zustand/UseStore';

const IsLoggedIn = (): [any | null, React.Dispatch<React.SetStateAction<any | null>>] => {
  const [user, setUser] = useState<any | null>(null);

  const {isBanned, setIsbanned}:any = useStore()

  const nav = useNavigate();
  const location = useLocation()


  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } }: any = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }

      //checker func
      if (!user && location.pathname.includes("/user/")) {
        nav('/sign-in')
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setUser(session?.user ?? null);
      }

    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const bannedStatus = CheckBan(user);

  // Update state with the banned status
  useEffect(() => {
    setIsbanned(bannedStatus);

    if(isBanned){
      console.log("User is banned _-----------------------")
      console.log(isBanned)
    }
  }, [bannedStatus]);




  return isBanned ? [null, setUser] : [user, setUser];
};

export default IsLoggedIn;