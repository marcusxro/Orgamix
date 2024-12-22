import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import IsLoggedIn from '../../firebase/IsLoggedIn'
import orgamixLogo from '../../assets/Orgamix.png'
import { FaInfoCircle } from "react-icons/fa";
import { IoChevronBack } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { CiLock } from "react-icons/ci";

const Checkout: React.FC = () => {
    const typeParams = useParams()
    const nav = useNavigate()
    const [user] = IsLoggedIn()

    console.log(user)

    useEffect(() => {
        if (typeParams.type === 'free') {
            console.log('free')
        } else if (typeParams.type === 'student') {
            console.log('student')
        }
        else if (typeParams.type === 'team') {
            console.log('team')
        }
        else {
            nav('/error-checkout-type')
        }
    }, [typeParams])


    const price = typeParams.type === 'free' ? '0.00' : typeParams.type?.toLocaleLowerCase() === 'student' ? '50' : '100'
    const [selectedMethod, setSelectedMethod] = React.useState('gcash')
    return (
        <div className='w-full'>
            <header className='p-4 w-full flex items-center justify-between border-b-[1px] border-b-[#535353]'>
                <div className='flex items-center justify-between  max-w-[1200px] mx-auto  w-full'>
                    <div className='font-bold flex items-center gap-2'>
                        <div className='w-[30px] h-[30px] overflow-hidden'>
                            <img src={orgamixLogo} alt="Orgamix Logo" className='h-full w-full object-cover' />
                        </div>
                        ORGAMIX
                    </div>



                    <div className='flex gap-3 items-center'>
                        <div className='border-[1px] flex items-center gap-1 border-[#535353] bg-[#313131] px-3 p-2 rounded-md cursor-pointer hover:bg-[#414141] ' onClick={() => nav(-1)}>
                            <IoChevronBack /> Back
                        </div>
                        <div className='border-[1px] flex items-center gap-2 border-[#535353] bg-[#313131] px-3 p-2 rounded-md cursor-pointer  hover:bg-[#414141] ' onClick={() => nav('/user/settings')}>
                            Settings <IoSettingsOutline />
                        </div>
                    </div>
                </div>
            </header>

            <div className='rounded-lg max-w-[1200px] mx-auto mt-[3rem]  bg-[#313131] border-[1px] border-[#535353]'>
                <div className='text-[20px] p-3 flex w-full items-center justify-between font-bold border-b-[1px] border-b-[#535353] pb-2'>
                    <div>
                        Checkout
                    </div>

                    <div className='cursor-pointer flex gap-2 items-center hover:bg-[#454545] bg-[#414141] p-2 rounded-md border-[1px] border-[#535353]'>
                        <FaInfoCircle />
                    </div>
                </div>

                <div className='mt-5 p-3 flex flex-col gap-3'>
                    <div>
                        <div className="font-semibold">
                            Shipping information
                        </div>
                        <p className='text-sm text-[#888]'>
                            Kindly double check your shipping information before proceeding to checkout.
                        </p>

                    </div>
                    <div className='flex gap-3 mt-5'>
                        <input
                            readOnly={true}
                            value={user?.email}
                            type="text" className='p-3 text-[#888] w-full rounded-md bg-[#191919] outline-none border-[1px] border-[#535353]' />
                        <input
                            readOnly={true}
                            value={user?.id}
                            type="text" className='p-3 w-full text-[#888] rounded-md bg-[#191919] outline-none border-[1px] border-[#535353]' />
                    </div>

                    <div className='flex flex-col gap-3 mt-5'>
                        <div>
                            <div className="font-semibold">
                                Review your cart
                            </div>
                            <p className='text-sm text-[#888]'>
                                If you got your order wrong, you can easily change it by clicking the button below.
                            </p>

                        </div>


                        <div className='mt-5 font-semibold'>
                            {typeParams.type?.toLocaleUpperCase()} PLAN
                        </div>
                        <div className='flex gap-3 items-center'>
                            <input
                                placeholder='Enter discount code'
                                type="text" className='p-3 w-full text-[#888] rounded-md bg-[#191919] outline-none border-[1px] border-[#535353]' />
                            <div className='w-[300px] items-center flex gap-3 justify-center bg-[#414141] p-3 rounded-md cursor-pointer hover:bg-[#454545] border-[1px] border-[#535353]'>
                                Apply
                            </div>
                        </div>
                    </div>

                    <div className='mt-5 flex flex-col gap-2'>
                        <div className='text-sm text-[#888]'>Subtotal       ₱{price}</div>
                        <div className='text-sm text-[#888]'>Discount ₱0.00</div>
                        <div className='font-semibold'>Total       ₱{price}</div>
                    </div>
                    <div className='border-b-[1px] border-b-[#535353] w-full mt-3'>
                    </div>
                    <div className='font-semibold mt-3'>
                        Choose payment method
                    </div>
                    <div className='mt-2 flex gap-3 items-center flex-wrap justify-start'>

                        <div 
                        onClick={() => setSelectedMethod('gcash')}
                        className={`w-[100px]  h-[30px]   flex gap-3 items-center justify-center rounded-md overflow-hidden cursor-pointer ${selectedMethod === 'gcash' && 'border-[3px] border-green-300'} `}>
                            <img src="https://iqftyamgipfbmjmcqnnq.supabase.co/storage/v1/object/public/assets/checkout/gcash.png" alt="" />
                        </div>
                        
                        <div 
                        onClick={() => setSelectedMethod('visa')}
                        className={`w-[100px] h-[30px]  flex gap-3 items-center justify-center rounded-md overflow-hidden cursor-pointer ${selectedMethod === 'visa' && 'border-[3px] border-green-300'}`}>
                            <img src="https://iqftyamgipfbmjmcqnnq.supabase.co/storage/v1/object/public/assets/checkout/visa.jpg" alt="" />
                        </div>

                        <div
                        onClick={() => setSelectedMethod('bpi')}
                         className={`w-[100px] h-[30px]  flex gap-3 items-center justify-center rounded-md overflow-hidden cursor-pointer ${selectedMethod === 'bpi' && 'border-[3px] border-green-300'}`}>
                            <img src="https://iqftyamgipfbmjmcqnnq.supabase.co/storage/v1/object/public/assets/checkout/bpi.png" alt="" />
                        </div>
                        <div
                            onClick={() => setSelectedMethod('bdo')}
                         className={`w-[100px] h-[30px]  flex gap-3 items-center justify-center rounded-md overflow-hidden cursor-pointer ${selectedMethod === 'bdo' && 'border-[3px] border-green-300'}`}>
                            <img src="https://iqftyamgipfbmjmcqnnq.supabase.co/storage/v1/object/public/assets/checkout/bdo.png" alt="" />
                        </div>
                    </div>

                    <div className='w-full p-3 rounded-md bg-[#111] cursor-pointer hover:bg-[#151515] border-[1px] border-[#535353] mt-5 text-center'>
                        Pay Now
                    </div>
                    <div className='mt-3'>
                        <div className='font-semibold flex items-center gap-2'>
                            <div className='text-blue-300'>
                                <CiLock />
                            </div>
                            Sercure Checkout - SSL Encrypted</div>
                        <p className='text-sm text-[#888]'>
                            Ensuring your financial information is secure is our top priority. We use industry-standard encryption to protect your credit card details throughout the checkout process.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
