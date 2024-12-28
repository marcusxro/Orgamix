import React, { useEffect, useState } from 'react'
import PaymentHeader from '../../../comps/System/Payment/PaymentHeader'
import { FaCheckCircle } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { useSearchParams } from 'react-router-dom';
import IsLoggedIn from '../../../comps/Utils/IsLoggedIn';
import { supabase } from '../../../supabase/supabaseClient';

interface paymentTokens {
    token: string;
    is_used: boolean;
    created_at: string;
    expires_at: string;
    userPlan: string;
}

interface accountDetails {
    username: string;
    email: string;
    userId: string;
    id: number;
    plan: string;
    payment_tokens: paymentTokens
}

const SuccessPayment: React.FC = () => {
    const [searchParams] = useSearchParams();

    const transactionId = searchParams.get('transaction_id');
    const item = searchParams.get('item');
    const dateVal = searchParams.get('date');
    const type = searchParams.get('type');
    const transactionToken: string | null = searchParams.get('token');

    const [user] = IsLoggedIn();

    const [isError, setIsError] = useState<string | null>(null);


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



    async function validateAndProcessToken(token: string) {

        console.log("Validating token");

        const userAccount = await validateProcess();

        if (!userAccount) {
            setIsError('Failed to fetch user account');
            return;
        }

        console.log(userAccount);


        // Check if token is valid
        if (userAccount.payment_tokens.token !== token) {
            setIsError('Invalid token (not found)');
            return;
        }

        // Check if token is used
        if (userAccount.payment_tokens.is_used) {
            setIsError('Token already used');
            return;
        }

        // Check if token is expired
        if (userAccount.payment_tokens.expires_at < new Date().toISOString()) {
            setIsError('Token expired');
            return;
        }

        // Check if user plan is the same as the token
        if (userAccount.payment_tokens.user_plan !== item) {
            setIsError('Invalid token (not matching user plan)');
            return;
        }

        const updatedTokens = {
            token: token,
            is_used: true,
            created_at: new Date().toISOString(),
            expires_at: new Date().toISOString(),
            user_plan: item
        }
        

  
        // Mark token as used
        const { error: updateError } = await supabase
            .from('accounts')
            .update({
                payment_tokens: { ...updatedTokens }, // Ensure the JSON structure matches
            })
            .eq('userid', user.id)


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
                    <div className='w-full max-w-[600px] mt-5 p-3 border-[1px] bg-green-600 border-[#535353] text-center rounded-md cursor-pointer hover:bg-green-700  text-[#fff]'>
                        Download receipt
                    </div>

                    {
                        isError &&
                        <div className='text-red-500 mt-5'>
                            {isError}
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default SuccessPayment
