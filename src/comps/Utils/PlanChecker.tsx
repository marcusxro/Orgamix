import React, { useEffect, useState } from 'react'
import IsLoggedIn from './IsLoggedIn';
import { supabase } from './supabase/supabaseClient';
import ExpirationModal from '../System/ExpirationModal';

const PlanChecker: React.FC = () => {
    const [user] = IsLoggedIn();

    const [status, setStatus] = useState<string | null>(null);

    async function getUserPlan() {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('userid', user.id)
            .single();
        if (error) {
            console.log(error.message)
        }

        if (data) {
            console.log(data)

            if (data.payment_tokens) {
                const subscriptionStartDate = new Date(data.payment_tokens.created_at || new Date());
                const currentDate = new Date();

                const expirationDate = new Date(subscriptionStartDate);
                expirationDate.setMonth(subscriptionStartDate.getMonth() + 1);

                // Adjust the day if the next month has fewer days (e.g., February)
                if (expirationDate.getDate() !== subscriptionStartDate.getDate()) {
                    expirationDate.setDate(0); // Set to the last valid day of the month
                }

                const isExpired = currentDate > expirationDate;


                const dayBeforeExpiration = new Date(expirationDate);

                dayBeforeExpiration.setDate(expirationDate.getDate() - 30);


                if (isExpired) {
                    console.log("Your subscription has expired. Please renew your subscription.")
                    setStatus("expired")
                }


                if (dayBeforeExpiration.toLocaleDateString() === currentDate.toLocaleDateString()) {
                    console.log("Your subscription will expire tomorrow. Please renew your subscription.")
                    setStatus("expiring")
                }




            }
        }
        return data
    }


    useEffect(() => {
        getUserPlan()
    }, [user, status])


    return (
        <>
            <>
                asdasdasd</>
            {
                status === "expired" && (
                    <ExpirationModal />
                )
            }
        </>
    )

}

export default PlanChecker
