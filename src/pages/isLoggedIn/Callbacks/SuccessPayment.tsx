import React from 'react'
import PaymentHeader from '../../../comps/System/Payment/PaymentHeader'
import { FaCheckCircle } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";


const SuccessPayment: React.FC = () => {
    return (
        <div className='w-full h-[85vh]'>
            <PaymentHeader />

            <div className='rounded-lg h-full max-w-[1200px] mx-auto mt-[3rem] 
            flex items-center justify-center
             bg-[#313131] border-[1px] border-[#535353]'>

                <div className='flex flex-col items-center gap-2 w-full'>
                    <div className='text-5xl text-green-500'>
                        <FaCheckCircle />
                    </div>
                    <div className='text-2xl font-bold'>
                        Payment successful
                    </div>
                    <div className='text-sm text-[#888]'>
                        Successfully paid  ₱50
                    </div>


                    <div className='p-3 border-[1px] mt-[5rem] border-[#535353] rounded-md w-full max-w-[500px] bg-[#414141]'>
                        <div className='font-bold'>
                            Transaction details
                        </div>
                        <div className='mt-5'>
                            <div className='flex gap-2 itm-center justify-between'>
                                <div className='text-[#888]'>Transaction ID</div>
                                <div className='font-semibold'>12512512</div>
                            </div>
                            <div className='flex gap-2 itm-center justify-between'>
                                <div className='text-[#888]'>Item</div>
                                <div className='font-semibold'>Student Plan</div>
                            </div>
                            <div className='flex gap-2 itm-center justify-between'>
                                <div className='text-[#888]'>Date</div>
                                <div className='font-semibold'>2025-1-1</div>
                            </div>
                            <div className='flex gap-2 itm-center justify-between'>
                                <div className='text-[#888]'>Type of transaction</div>
                                <div className='font-semibold'>PH_GCASH</div>
                            </div>
                            <div className='flex gap-2 itm-center justify-between mt-5'>
                                <div className='text-[#888]'>Status</div>
                                <div className='font-semibold bg-[#292929] p-1 px-5 rounded-md border-[#535353]
                                  border-[1px] text-green-500 flex items-center gap-2'>
                                    <FaCheck/>
                                    Success</div>
                            </div>

                        </div>

                   
                    </div>
                    <div className='w-full max-w-[500px] mt-5 p-3 border-[1px] bg-green-600 border-[#535353] text-center rounded-md cursor-pointer hover:bg-green-700  text-[#fff]'>
                            Download receipt
                        </div>
                </div>
            </div>
        </div>
    )
}

export default SuccessPayment
