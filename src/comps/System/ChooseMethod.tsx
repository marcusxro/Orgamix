import React, { useEffect, useState } from 'react'
import useStore from '../../Zustand/UseStore'

interface myTypes{
    closer: React.Dispatch<React.SetStateAction<boolean>>
}

const ChooseMethod:React.FC<myTypes> = ({closer}) => {
    const [methodChosen, setMethodChosen] = useState<string>("")
    const {setShowCreate}:any = useStore()


 


    function saveMethonChosen() {
        if(!methodChosen) return


        if(methodChosen === "Create") {
            setShowCreate("Create")
            closer(prevs=> !prevs)
        } else {
            setShowCreate("Import")
            closer(prevs=> !prevs)
        }
    }


    return (
        <div
            onClick={(e) => { e.stopPropagation() }}
            className='w-full max-w-[550px] bg-[#313131]  z-[5000] relative
        rounded-lg p-3 h-full max-h-[300px] border-[#535353] border-[1px] justify-between flex flex-col overflow-auto'>

            <div>
                <div className='flex flex-col'>
                    <div className='text-xl font-bold'>Choose method</div>
                    <p className='text-[#888] text-sm'>Choose your desired method to publish your own goals in public.</p>
                </div>

                <div className='mt-3 flex flex-wrap gap-3'>
                    <div
                        onClick={() => { setMethodChosen("Import") }}
                        className={`${methodChosen === "Import" && 'bg-green-500'} p-3 rounded-lg cursor-pointer border-[#535353] border-[1px]`}>
              Share your existing goals
                    </div>
                    <div
                        onClick={() => { setMethodChosen("Create") }}
                        className={`${methodChosen === "Create" && 'bg-green-500'} p-3 rounded-lg cursor-pointer border-[#535353] border-[1px]`}>
                        Create a new goal
                    </div>
                </div>

            </div>


            <div className='w-full rounded-lg border-[#535353] border-[1px] flex overflow-hidden'>

                <div
                onClick={() => {closer(prevClick=>!prevClick)}}
                    className='p-2 bg-[#111111] border-r-[#535353] text-center border-r-[1px]  w-full cursor-pointer'>
                    Close</div>
                <div
                onClick={() => {saveMethonChosen()}}
                    className={`${methodChosen === '' && 'bg-[#535353]'} p-2 bg-[#111111] text-center w-full cursor-pointer`}>
                    Continue
                </div>
            </div>
        </div>
    )
}

export default ChooseMethod
