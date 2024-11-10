import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../../Zustand/UseStore';
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { useSyncDemo } from '@tldraw/sync'
import { useParams } from 'react-router-dom';

const Draw: React.FC = () => {
    const [isExiting, setIsExiting] = useState(false);
    const { setShowDrawer }: any = useStore()
    const params    = useParams()

    const store = useSyncDemo({ roomId: `${params?.time ?? 'defaultTime'}${params?.uid ?? 'defaultUid'}`})

    const handleOutsideClick = () => {
        setIsExiting(true);
        setTimeout(() => {
            setShowDrawer(null);
            setIsExiting(false);
        }, 300);
    };

    return (
        <AnimatePresence>
            {
                !isExiting &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className='ml-auto positioners flex items-center p-3 justify-center relative w-full h-full'
                    onClick={handleOutsideClick}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                        exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                        className={`w-full h-full bg-[#313131] z-[5000]  rounded-lg  overflow-auto border-[#535353] border-[1px]  flex flex-col justify-between`}
                        onClick={(e) => e.stopPropagation()}>
                        <Tldraw  store={store} />

                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default Draw
