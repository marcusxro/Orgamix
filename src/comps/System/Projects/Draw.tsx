import { useSyncDemo } from '@tldraw/sync'
import React, { useEffect, useState } from 'react'
import {
    Atom,
    TLComponents,
    Tldraw,
    react,
    useAtom,
    useEditor,
    useIsToolSelected,
    useTools,
    useValue,
    useTldrawUser,
    TLUserPreferences
} from 'tldraw'
import 'tldraw/tldraw.css'
import { Toggle } from './toggle/Toggle'
import { AnimatePresence, motion } from 'framer-motion'
import useStore from '../../../Zustand/UseStore'
import IsLoggedIn from '../../../firebase/IsLoggedIn'
import { supabase } from '../../../supabase/supabaseClient'
import orgamixLogo from '../../../assets/Orgamix.png'



// Create context for managing private mode state
const PrivateModeContext = React.createContext<null | Atom<boolean>>(null)

const components: TLComponents = {
    // Custom component to display in front of the canvas
    InFrontOfTheCanvas: () => {
        const editor = useEditor()
        const isInSelectTool = useIsToolSelected(useTools().select)
        const userId = useValue('userId', () => editor.user.getId(), [])
        const myPrivateSelectedShapes = useValue(
            'private shapes',
            () =>
                editor
                    .getSelectedShapes()
                    .filter((shape) => !!shape.meta.private && shape.meta.ownerId === userId),
            [editor, userId]
        )

        const isPrivateMode$ = React.useContext(PrivateModeContext)!
        const isPrivateMode = useValue(isPrivateMode$)


        const { setIsExisting }: any = useStore();
        const { setShowDrawer }: any = useStore()

        const handleOutsideClick = () => {
            setIsExisting(true);
            setTimeout(() => {
                setShowDrawer(null);
                setIsExisting(false);
            }, 300);
        };

        return (
            <>
                {isInSelectTool && myPrivateSelectedShapes.length > 0 ? (
                    <div className="toggle-panel">
                        <div>
                            Make {myPrivateSelectedShapes.length} selected shape
                            {myPrivateSelectedShapes.length > 1 ? 's' : ''} public?{' '}
                        </div>
                        <button
                            onClick={() => {
                                editor.markHistoryStoppingPoint()
                                // Change private shapes to public
                                const allAffectedShapes = [
                                    ...editor.getShapeAndDescendantIds(myPrivateSelectedShapes.map((s) => s.id)),
                                ].map((id) => editor.getShape(id)!)

                                editor.updateShapes(
                                    allAffectedShapes.map((shape) => ({
                                        ...shape,
                                        meta: { ...shape.meta, private: false },
                                    }))
                                )
                            }}
                        >
                            Yes
                        </button>
                    </div>
                ) : (
                    <div className="toggle-panel pointer" onClick={() => isPrivateMode$.update((v) => !v)}>
                        <div className='text-white'>Private mode</div>
                        <Toggle isChecked={isPrivateMode} />
                    </div>
                )}

                {/* Custom Back Button */}
                <div className="custom-button-container flex items-center justify-center text-center hover:bg-[#888]">
                    <button className="custom-button text-white " onClick={handleOutsideClick}>
                        Close
                    </button>
                </div>


                <div className="absolute bottom-[80px] scale-[.5] md:scale-[1] flex gap-2 font-bold text-sm md:rotate-0 md:bottom-[10px] rotate-90 px-5 justify-center items-center border-[1px] border-[#535353] right-[-60px] md:right-[5px] bg-[#222] text-white p-1 rounded-lg">
                  <span className='w-[20px] h-[20px] overflow-hidden'>
                    <img className='w-full h-full object-cover' src={orgamixLogo} alt="" />
                    </span>  ORGAMIX
                </div>
            </>
        )
    },
}



function Draw({ roomId }: { roomId: string }) {
    const { isExiting, setIsExisting }: any = useStore();
    const { setShowDrawer }: any = useStore()

    const handleOutsideClick = () => {
        setIsExisting(true);
        setTimeout(() => {
            setShowDrawer(null);
            setIsExisting(false);
        }, 500);
    };
    const isPrivateMode$ = React.useContext(PrivateModeContext)!


    const [user]:any = IsLoggedIn()

    const initialPreferences: any = user
        ? { id: user.id, name: user.email, colorScheme: 'dark'}
        : { id: 'defaultUid', name: 'Guest', colorScheme: 'dark'};

    const [userPreferences, setUserPreferences] = useState<TLUserPreferences>(initialPreferences);

    const store = useSyncDemo({ roomId: roomId, userInfo: userPreferences })

    const userName = useTldrawUser({ userPreferences, setUserPreferences })



    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('accounts')
                        .select('*')
                        .eq('userid', user?.id);

                    if (error) {
                        console.error('Error fetching data:', error);
                    } else if (data.length > 0) {
                        setUserPreferences({ id: user.id, name: data[0]?.username, colorScheme: 'dark',});
                    }
                } catch (err) {
                    console.error('Error:', err);
                }
            }
        };

        fetchUserPreferences();
    }, [user]);



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
                        className={`w-full h-full bg-[#313131] z-[5000] rounded-lg  overflow-auto border-[#535353] border-[1px]  flex flex-col justify-between`}
                        onClick={(e) => e.stopPropagation()}>
                        <Tldraw
                            user={userName}
                            store={store}
                            deepLinks

                            isShapeHidden={(shape, editor) => {
                                const userId = editor.user.getId()
                                // Hide private shapes from other users
                                return !!shape.meta.private && shape.meta.ownerId !== userId
                            }}
                            onMount={(editor) => {
                                // Add private and ownerId metadata when a shape is created
                                editor.store.sideEffects.registerBeforeCreateHandler('shape', (shape) => {
                                    if ('private' in shape.meta) return shape
                                    return {
                                        ...shape,
                                        meta: {
                                            ...shape.meta,
                                            private: isPrivateMode$.get(),
                                            ownerId: editor.user.getId(),
                                        },
                                    }
                                })

                                // Clean up the selection by removing any hidden shapes
                                return react('clean up selection', () => {
                                    const selectedShapes = editor.getSelectedShapes()
                                    const filteredSelectedShapes = selectedShapes.filter((s) => !editor.isShapeHidden(s))
                                    if (filteredSelectedShapes.length !== selectedShapes.length) {
                                        editor.select(...filteredSelectedShapes)
                                    }
                                })
                            }}
                            components={{
                                ...components,

                            }}
                        />

                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default function SyncPrivateContentExample({ roomId }: { roomId: string }) {
    return (
        <PrivateModeContext.Provider value={useAtom('isPrivateDrawingMode', false)}>
            <Draw roomId={roomId} />
        </PrivateModeContext.Provider>
    )
}

/**
 * This example demonstrates how to create a 'private' drawing mode where any shapes created by one person cannot be seen by another.
 * It sets up a simple ownership system where each shape created is tagged with the id of the user who created it.
 * It also adds a boolean flag to each shape called 'private' which is set to true if the shape is created in private mode.
 * If the user selects one or more private shapes, they will be given the option to make them public.
 *
 * 1. We create a context to store the atom that will hold the state of the private drawing mode. We are using signals here but you can use any state management library you like.
 * 2. We override the `InFrontOfTheCanvas` component to add a tool panel at the top of the screen that allows the user to toggle private drawing mode on and off, and to make private shapes public.
 * 3. We use the context to get the atom that holds the state of the private drawing mode. We then have to call 'useValue' on the atom to get the current value in a reactive way.
 * 4. We override the `isShapeHidden` function to hide shapes that are private and not owned by the current user.
 * 5. We register a side effect that adds the 'private' and 'ownerId' meta fields to each shape created. We set the 'private' field to the current value of the private drawing mode atom.
 * 6. We register a side effect that cleans up the selection by removing any hidden shapes from the selection. This re-runs whenever the selection or the hidden state of a selected shape changes.
 * 7. Child shapes (e.g inside groups and frames) do not inherit the 'private' meta property from their parent. So when making a shape public, we decide to also make all descendant shapes public since this is most likely what the user intended.
 */
