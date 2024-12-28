import React, { useEffect, useState } from 'react'
import PaymentHeader from '../../../comps/System/Payment/PaymentHeader'
import { FaCheckCircle } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { useSearchParams } from 'react-router-dom';
import IsLoggedIn from '../../../comps/Utils/IsLoggedIn';
import { supabase } from '../../../supabase/supabaseClient';
import { useRef } from "react";

interface paymentTokens {
    token: string;
    is_used: boolean;
    created_at: number;
    expires_at: number;
    userPlan: string;
}

// interface accountDetails {
//     username: string;
//     email: string;
//     userId: string;
//     id: number;
//     plan: string;
//     payment_tokens: paymentTokens
// }

const SuccessPayment: React.FC = () => {
    const [searchParams] = useSearchParams();
    const receiptRef = useRef<HTMLDivElement>(null);

    const transactionId = searchParams.get('transaction_id');
    const item = searchParams.get('item');
    const dateVal = searchParams.get('date');
    const type = searchParams.get('type');
    const transactionToken: string | null = searchParams.get('token');
    const finalPrice = searchParams.get('finalprice');

    const [user] = IsLoggedIn();
    const [isError, setIsError] = useState<string | null>(null);

    const [isLoaded, setIsLoaded] = useState<boolean>(false);


    const handleDownload = async () => {
        if (receiptRef.current) {
            // Dynamically import html2pdf.js
            const html2pdf = (await import('html2pdf.js')).default; // Dynamically import the module
            
            const element = receiptRef.current;
    
            element.style.height='100%'
            // Convert HTML to PDF using html2pdf.js
            html2pdf()
                .from(element)        // Pass in the element to be converted
                .save('receipt.pdf'); // Save the PDF
        }
    };
    
    
    // Validate and update token on success
    async function validateProcess() {
        try {
            const { data: userAccount, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('userid', user.id)
                .single();

            if (error || !userAccount) {
                console.error('Failed to fetch user account:', error);
                return null;
            }

            console.log('User account fetched:', userAccount);
            return userAccount;
        } catch (error) {
            console.error('Unexpected error while fetching user account:', error);
            return null;
        }
    }

    async function returnToNull() {
        const updatedTokens = {
            token: null,
            is_used: null,
            created_at: null,
            expires_at: null,
            user_plan: null
        }
        try {
            const { data: userAccount, error } = await supabase
                .from('accounts')
                .update({
                    payment_tokens: { ...updatedTokens }, // Ensure the JSON structure matches
                })
                .eq('userid', user.id)
                .single();

            if (error || !userAccount) {
                console.error('Failed to fetch user account:', error);
                return null;
            }

            console.log('User account fetched:', userAccount);
            return userAccount;
        }
        catch (error) {
            console.error('Unexpected error while fetching user account:', error);
            return null;
        }
    }



    async function validateAndProcessToken(token: string) {

        console.log("Validating token");

        const userAccount = await validateProcess();

        console.log("User account:", userAccount);

        if (userAccount === null) {
            setIsError('Failed to fetch user account');
            return;
        }

        // Check if token is valid
        if (userAccount.payment_tokens.token !== token) {
            setIsError('Invalid token (not found)');
            return;
        }

        // Check if token is used
        // if (userAccount.payment_tokens.is_used) {
        //     setIsError('Token already used');
        //     return;
        // }


        // Check if token is expired
        if (new Date(userAccount.payment_tokens.expires_at).getTime() < new Date().getTime()) {
            setIsError('Token expired');
            returnToNull();
            return;
        }

        // Check if user plan is the same as the token
        if (userAccount.payment_tokens.user_plan !== item) {
            setIsError('Invalid token (not matching user plan)');
            return;
        }

        // Mark token as used
        const { error: updateError } = await supabase
            .from('accounts')
            .update({
                'payment_tokens': {
                    ...userAccount.payment_tokens, // Keep previous payment token data
                    token: token,
                    is_used: true,
                    user_plan: item
                }
            })
            .eq('userid', user.id); // Targeting the correct user by their ID

        if (updateError) {
            console.error("Error updating payment tokens:", updateError);
        } else {
            console.log("Payment token successfully updated.");
        }

        if (updateError) {
            console.error('Failed to update token:', updateError);
            setIsError('Failed to update token');
            return;
        }

        // Update user's subscription plan
        const { error: userUpdateError } = await supabase
            .from('accounts')
            .update({ plan: item })
            .eq('userid', user.id)

        if (userUpdateError) {
            setIsError('Failed to update user subscription');
        }


        setIsLoaded(true);
        return { success: true };
    }

    useEffect(() => {
        validateAndProcessToken(transactionToken != null ? transactionToken : '');
    }, [transactionId, searchParams, user]);


    return (
        <div className='w-full h-[85vh]'>
            <PaymentHeader />

            <div className='rounded-lg h-[800px] max-w-[1200px] mx-auto mt-[3rem] overflow-auto 
            flex items-center justify-center
             bg-[#313131] border-[1px] border-[#535353]'>


                <div
                    ref={receiptRef}
                    className='flex flex-col items-center gap-2 w-full bg-[#313131] p-5'>
                    {
                        user != null &&
                        isLoaded &&
                        isError != null &&
                        isError != "Invalid token (not found)" &&
                        // isError != "Token already used" &&
                        isError != "Token expired" &&
                        isError != "Invalid token (not matching user plan)" &&
                        isError != "Failed to update token" &&
                        isError != "Failed to update user subscription" &&
                        <>
                            <div className='text-5xl text-green-500'>
                                <FaCheckCircle />
                            </div>

                            <div className='text-2xl font-bold'>
                                Payment successful
                            </div>
                            <div className='text-sm text-[#888]'>
                                Successfully paid  ₱{finalPrice}
                            </div>


                            <div className='p-3 border-[1px] mt-[5rem] border-[#535353] rounded-md w-full max-w-[600px] bg-[#414141]'>
                                <div className='font-bold'>
                                    Transaction details
                                </div>
                                <div className='mt-5 flex flex-col gap-3'>
                                    <div className='flex gap-2 itm-center justify-between'>
                                        <div className='text-[#888]'>Transaction ID</div>
                                        <div className='font-semibold text-right'>{transactionId}</div>
                                    </div>
                                    <div className='flex gap-2 itm-center justify-between'>
                                        <div className='text-[#888]'>Item</div>
                                        <div className='font-semibold'>{item}</div>
                                    </div>
                                    <div className='flex gap-2 itm-center justify-between'>
                                        <div className='text-[#888]'>Date</div>
                                        <div className='font-semibold'>{dateVal}</div>
                                    </div>
                                    <div className='flex gap-2 itm-center justify-between'>
                                        <div className='text-[#888]'>Type of transaction</div>
                                        <div className='font-semibold'>{type}</div>
                                    </div>
                                    <div className='flex gap-2 itm-center justify-between mt-5'>
                                        <div className='text-[#888]'>Status</div>
                                        <div className='font-semibold bg-[#292929] p-1 px-5 rounded-md border-[#535353]
                                  border-[1px] text-green-500 flex items-center gap-2'>
                                            <FaCheck />
                                            Success</div>
                                    </div>

                                </div>


                            </div>
                            <div
                                data-html2canvas-ignore
                                onClick={() => handleDownload()}
                                className='w-full max-w-[600px] mt-5 p-3 border-[1px] bg-green-600 border-[#535353] text-center rounded-md cursor-pointer hover:bg-green-700  text-[#fff]'>
                                Download receipt
                            </div>
                        </>
                    }

                    {
                        isError &&
                        <div
                            data-html2canvas-ignore
                            className='text-red-500 mt-5'>
                            {isError}
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default SuccessPayment
