import React from 'react'
import PaymentHeader from '../../../comps/System/Payment/PaymentHeader'
import { MdOutlineError } from "react-icons/md";

const FailedPayment: React.FC = () => {
    return (
        <div className='w-full h-[85vh]'>
            <PaymentHeader />

            <div className='rounded-lg h-full max-w-[1200px] mx-auto mt-[3rem] 
            flex items-center justify-center
             bg-[#313131] border-[1px] border-[#535353]'>
                <div className='flex flex-col items-center gap-2'>
                    <div className='text-5xl text-red-500'>
                        <MdOutlineError />
                    </div>
                    <div className='text-2xl font-bold'>
                        Payment Failed
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FailedPayment
