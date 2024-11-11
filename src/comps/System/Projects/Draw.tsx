import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../../Zustand/UseStore';
import { Tldraw, DefaultColorThemePalette, useTldrawUser, TLUserPreferences } from 'tldraw'
import 'tldraw/tldraw.css'
import { useSyncDemo } from '@tldraw/sync'
import { useParams } from 'react-router-dom';
import IsLoggedIn from '../../../firebase/IsLoggedIn';
import { supabase } from '../../../supabase/supabaseClient';

const Draw: React.FC = () => {
    const [isExiting, setIsExiting] = useState(false);
    const { setShowDrawer }: any = useStore()
    const params = useParams()
    const [user] = IsLoggedIn()

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setShowDrawer(null);
            setIsExiting(false);
        }, 300);
    };
    const initialPreferences = user
        ? { id: user.uid, name: user.email }
        : { id: 'defaultUid', name: 'Guest' };

    const [userPreferences, setUserPreferences] = useState<TLUserPreferences>(initialPreferences);


    const store = useSyncDemo({ roomId: `${params?.time ?? 'defaultTime'}${params?.uid ?? 'defaultUid'}`, userInfo: userPreferences })

    const userName = useTldrawUser({ userPreferences, setUserPreferences })



    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('accounts')
                        .select('*')
                        .eq('userid', user?.uid);
    
                    if (error) {
                        console.error('Error fetching data:', error);
                    } else if (data.length > 0) {
                        setUserPreferences({ id: user.uid, name: data[0]?.username});
                    }
                } catch (err) {
                    console.error('Error:', err);
                }
            }
        };
    
        fetchUserPreferences();
    }, [user]);
    

    DefaultColorThemePalette.lightMode.black.solid = 'aqua'

    return (
        <AnimatePresence>
            {
                !isExiting &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className='ml-auto positioners flex items-center p-1 justify-center relative w-full h-full'
                    onClick={handleOutsideClick}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        className={`w-full h-full bg-[#313131] z-[5000]  rounded-lg  overflow-auto border-[#535353] border-[1px]  flex flex-col justify-between`}
                        onClick={(e) => e.stopPropagation()}>
                        <div className='flex gap-2 p-2'>
                            <div
                                onClick={handleOutsideClick}
                                className='bg-[#111] px-5 cursor-pointer border-[#535353] border-[1px] rounded-lg'>
                                Back
                            </div>
                        </div>
                        <Tldraw
                        inferDarkMode={true}
                        forceMobile={true}
                            user={userName}
                            store={store} />

                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default Draw
