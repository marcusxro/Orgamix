import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';

const IsLoggedIn = (): [any | null, React.Dispatch<React.SetStateAction<any | null>>] => {
  const [user, setUser] = useState<any | null>(null);
  const nav = useNavigate();
  const location = useLocation()


  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } }: any = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        console.log(user)
      }


      //middleware func
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

  return [user, setUser];
};

export default IsLoggedIn;