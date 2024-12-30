import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import IsLoggedIn from '../../comps/Utils/IsLoggedIn'
import { FaInfoCircle } from "react-icons/fa";
import { CiLock } from "react-icons/ci";
import { supabase } from '../../comps/Utils/supabase/supabaseClient';
import Loader from '../../comps/Svg/Loader';
import axios from 'axios';
import PaymentHeader from '../../comps/System/Payment/PaymentHeader';
import { v4 as uuidv4 } from 'uuid'; // For generating unique tokens
import Customer from '../../@types/Interface/CustomerDetails';
import MetaEditor from '../../comps/MetaHeader/MetaEditor';


interface voucherTypes {
    id: number;
    code: string;
    count: number;
    max_count: number;
    date: string | number;
    perc: number;
    fixed: number;
}


const Checkout: React.FC = () => {
    const typeParams = useParams()
    const nav = useNavigate()
    const [user] = IsLoggedIn()
    const price: number = typeParams.type === 'free' ? 0.00 : typeParams.type?.toLocaleLowerCase() === 'student' ? 50 : 100
    const planType = typeParams.type?.toLocaleUpperCase() + "-" + 'PLAN'
    const [finalPrice, setFinalPrice] = useState<number>(price)
    const [selectedMethod, setSelectedMethod] = React.useState('gcash')
    const normalPlan = typeParams?.type
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


    const [codeValue, setCodeValue] = useState('')
    const [errorMessage, setErrorMessage] = useState<null | string>(null)
    const [loading, setLoading] = useState(false)


    const [discountInt, setDiscountInt] = useState<null | number>(0.00)

    async function applyDiscount(type: string, discount: number) {
        console.log(type, discount)

        if (type === 'percentage') {
            console.log('percentage')

            const percentage = (price / 100) * discount
            console.log(percentage)
            setDiscountInt(percentage)
            setFinalPrice(price - percentage)
        } else {
            console.log('fixed')
            setDiscountInt(discount)
            setFinalPrice(price - discount)
        }
    }

    const [discountCode, setDiscountCode] = useState<null | string>(null)

    async function isCodeValid(code: string) {
        try {
            const { data: discount, error } = await supabase
                .from('vouchers')
                .select('*')
                .eq('code', code)
                .single()

            if (error) {
                setErrorMessage('Discount code not found')
                throw console.error('code not found');
            }


            //if found
            if (discount) {

                const isExpired = new Date(discount.date) < new Date()

                if (isExpired) {
                    setErrorMessage('Discount code is expired')
                    return false
                }

                const isMaxed = discount.count >= discount.max_count

                if (isMaxed) {
                    setErrorMessage('Discount code is maxed out')
                    return false
                }

                return true
            }
        }

        catch (error) {
            setErrorMessage('Error getting discount')
            console.error('Error getting discount:', error);
        }
    }


    async function getDiscount(code: string) {
        setLoading(true)
        setErrorMessage(null)
        if (loading) return
        if (!code) {
            setErrorMessage('Please enter a discount code')
            setLoading(false)
            return
        }
        try {
            const isAllowed = await isCodeValid(code)
            if (!isAllowed) {
                console.log(isAllowed)
                setLoading(false)
                return
            }
            const { data: discount, error } = await supabase
                .from('vouchers')
                .select('*')
                .eq('code', code)

                .single()

            if (error) {
                setErrorMessage('Discount code not found')
                setLoading(false)
                throw console.error('code not found');
            }

            if (discount) {

                if (discount.listed_uid != null && discount.listed_uid.some((uid: string) => uid === user.id)) {
                    console.error('Discount code has already been used');
                    setErrorMessage('Discount code has already been used')
                    setLoading(false)
                    return;
                }

                setLoading(false)
                setDiscountCode(code)
                console.log(discount)
                const finalizedDiscount = discount.perc ? discount.perc : discount.fixed
                const discountType = discount.perc ? 'percentage' : 'fixed'
                applyDiscount(discountType, finalizedDiscount)
                return discount
            }
        }
        catch (error) {
            setLoading(false)
            setErrorMessage('Error getting discount')
            console.error('Error getting discount:', error);
        }

    }


    function getChannelCode(code: string) {
        if (code === 'gcash') {
            hehe()
            return 'PH_GCASH'
        }
        if (code === 'visa') {
            return 'PH_VISA'
        }
        if (code === 'bpi') {
            return 'BA_BPI'
        }
        if (code === 'bdo') {
            return 'PH_BDO'
        }
        if (code === 'maya') {
            return 'PH_PAYMAYA'
        }
    }



    function hehe() {
        console.log("wow")
    }


    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Months are zero-indexed
        const day = date.getDate();
        return `${year}-${month}-${day}`;
    };


    async function findUser(userId: string) {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('userid', userId)
            .single()

        if (error) {
            console.error('Error getting user:', error);
            return null
        }

        if (data) {
            return data
        }
    }


    async function saveTokenToDatabase(userId: string, data: any) {
        console.log(data)

        const { error } = await supabase
            .from('accounts')
            .update({
                payment_tokens: { ...data }, // Ensure the JSON structure matches
            })
            .eq('userid', userId)

        if (error) {
            console.error('Error saving token:', error);
            return false;
        }

        console.log('Token saved');
        return true; // Indicate success
    }






    async function createCustomer() {
        const url = import.meta.env.VITE_CUSTOMER_URL as string
        const auth = import.meta.env.VITE_XENDIT_SECRET_KEY as string
        const refID = uuidv4();

        try {
            const data = {
                reference_id: refID,
                type: 'INDIVIDUAL',
                individual_detail: {
                    given_names: user?.user_metadata?.full_name || user?.email,
                    surname: ' ',
                },
                email: user?.email,
                mobile_number: '+628121234567890',
            };

            const response = await axios.post(url, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: auth.split(':')[0],
                    password: auth.split(':')[1] || '',
                },
            });

            if (response.data) {
                console.log(response.data);
                return response.data;
            }
        } catch (error: any) {
            console.error(error.response ? error.response.data : error.message);
            return null;
        }
    }


    async function DirectDebit() {
        const customerData: Customer | null = await createCustomer();


        if (customerData === null) {
            console.error('Error creating customer');
            return;
        }


        const referenceToken = uuidv4(); // Generate a unique token

        const tokenData = {
            token: referenceToken, // Your token reference
            is_used: false, // Indicates token usage
            created_at: Date.now(), // Timestamp for when the token was created
            expires_at: Date.now() + 86400000, // Set to tomorrow's date in UNIX timestamp (milliseconds)
            user_plan: planType, // Change to normalPlan if not working
        };

        const tokenSaved = await saveTokenToDatabase(user?.id, tokenData);

        const URL = import.meta.env.VITE_XENDIT_BANK_DEBIT_URL as string;

        console.log(URL)
        const referenceID = user.id + '-' + formatDate(new Date().getTime())
        const successRedirectUrl = `http://localhost:3000/user/success-payment?transaction_id=${referenceID}&item=${planType}&date=${formatDate(new Date().getTime())}&type=${getChannelCode(selectedMethod)}&token=${referenceToken}&finalprice=${finalPrice}${discountCode ? `&discount=${discountCode}` : ''}`;

        const data = {
            "customer_id": customerData?.id,
            channel_code: 'BA_BPI',
            currency: 'PHP',
            amount: 100,
            type: 'BANK_ACCOUNT',
            properties: {
                account_mobile_number: '+asdasdas',
                card_last_four: '1234',
                card_expiry: '06/24',
                account_email: 'email@email.com',

                success_redirect_url: successRedirectUrl,
                failure_redirect_url: 'http://localhost:3000/user/failed-payment',
                cancel_redirect_url: "https://redirect.me/cancel"
            }
        };
        if (tokenSaved) {

            axios.post(URL, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: import.meta.env.VITE_XENDIT_SECRET_KEY as string,
                    password: '', // Leave this blank if not using a password
                }
            })
                .then(response => {
                    console.log(response.data);
                    if (response.data) {
                        const desktopCHeckoutUrl = response.data.authorizer_url
                        console.log(desktopCHeckoutUrl)
                        window.open(desktopCHeckoutUrl)
                    }
                })
                .catch(error => {
                    console.error(error.response ? error.response.data : error.message);
                });
        }
    }


    async function payEWallet() {
        if (!user) {
            return
        }
        try {
            const userDetails = await findUser(user?.id)
            console.log(userDetails)
            console.log(getChannelCode(selectedMethod))
            const referenceToken = uuidv4();

            const tokenData = {
                token: referenceToken,
                is_used: false,
                created_at: Date.now(),
                expires_at: Date.now() + 86400000,
                user_plan: planType,
            };

            const tokenSaved = await saveTokenToDatabase(user?.id, tokenData);
            const referenceID = user.id + '-' + formatDate(new Date().getTime())
            const successRedirectUrl = `http://localhost:3000/user/success-payment?transaction_id=${referenceID}&item=${planType}&date=${formatDate(new Date().getTime())}&type=${getChannelCode(selectedMethod)}&token=${referenceToken}&finalprice=${finalPrice}${discountCode ? `&discount=${discountCode}` : ''}`;

            if (tokenSaved) {
                const response = await axios.post(
                    import.meta.env.VITE_XENDIT_EWALLET_URL as string,
                    {
                        reference_id: referenceID,
                        currency: 'PHP',
                        amount: finalPrice,
                        checkout_method: 'ONE_TIME_PAYMENT',
                        channel_code: getChannelCode(selectedMethod),
                        customer_id: user?.id,
                        channel_properties: {
                            success_redirect_url: successRedirectUrl,
                            failure_redirect_url: 'http://localhost:3000/user/failed-payment',
                            cancel_redirect_url: "https://redirect.me/cancel"
                        },
                        metadata: {
                            branch_area: 'METRO_MANILA',
                            branch_city: 'QUEZON_CITY',
                        },
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        auth: {
                            username: import.meta.env.VITE_XENDIT_SECRET_KEY as string,
                            password: '', // Leave this blank if not using a password
                        },
                    }
                );

                // console.log('Success:', response.data);

                if (response.data) {
                    const desktopCHeckoutUrl = response.data.actions.desktop_web_checkout_url
                    console.log(desktopCHeckoutUrl)

                    console.log('Token saved')
                    window.open(desktopCHeckoutUrl)

                }
            }

        } catch (error) {
            console.error('Error:', error);
        }
    }

    function payChannel() {
        switch (selectedMethod) {
            case 'gcash':
                payEWallet()
                break;
            case 'visa':
                payEWallet()
                break;
            case 'bpi':
                DirectDebit()
                break;
            case 'bdo':
                DirectDebit()
                break;
            case 'maya':
                payEWallet()
                break;
            default:
                console.error('Error paying')
                break;
        }
    }

    return (
        <div className='w-full'>
            <PaymentHeader />

            <MetaEditor
                title={`Checkout - ${typeParams.type?.toLocaleUpperCase()} PLAN`}
                description='Checkout page for payment'
                keywords='payment, checkout, payment gateway'
            />

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
                                value={codeValue}
                                onChange={(e) => setCodeValue(e.target.value)}
                                placeholder='Enter discount code'
                                type="text" className='p-3 w-full text-[#888] rounded-md bg-[#191919] outline-none border-[1px] border-[#535353]' />
                            <div
                                onClick={() => getDiscount(codeValue)}
                                className='w-[300px] items-center flex gap-3 justify-center bg-[#414141] p-3 rounded-md cursor-pointer hover:bg-[#454545] border-[1px] border-[#535353]'>
                                {
                                    loading ?
                                        <div className='w-[20px] h-[20px]'>
                                            <Loader />
                                        </div>
                                        :
                                        'Apply'
                                }
                            </div>
                        </div>
                        {
                            errorMessage &&
                            <div className='text-red-500'>
                                {errorMessage}
                            </div>
                        }
                    </div>

                    <div className='mt-5 flex flex-col gap-2'>
                        <div className='text-sm text-[#888]'>Subtotal       ₱{price}</div>
                        <div className='text-sm text-[#888]'>Discount ₱{discountInt != 0 ? `-${discountInt}` : 0}</div>
                        <div className='font-semibold'>Total       ₱{finalPrice}</div>
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
                            onClick={() => setSelectedMethod('maya')}
                            className={`w-[100px]  h-[30px]   flex gap-3 items-center justify-center rounded-md overflow-hidden cursor-pointer ${selectedMethod === 'maya' && 'border-[3px] border-green-300'} `}>
                            <img src="https://iqftyamgipfbmjmcqnnq.supabase.co/storage/v1/object/public/assets/checkout/maya.jpg" alt="" />
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

                    <div
                        onClick={() => payChannel()}
                        className='w-full p-3 rounded-md bg-[#111] cursor-pointer hover:bg-[#151515] border-[1px] border-[#535353] mt-5 text-center'>
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
