import React from 'react'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid';

const Test:React.FC = () => {

    const createEWalletCharge = async () => {
        try {
          const response = await axios.post(
            'https://api.xendit.co/ewallets/charges',
            {
              reference_id: 'order-id-123',
              currency: 'PHP',
              amount: 25000,
              checkout_method: 'ONE_TIME_PAYMENT',
              channel_code: 'PH_GCASH',
              customer_id: uuidv4(),
              channel_properties: {
                success_redirect_url: 'https://www.orgamix.tech/pricing',
                failure_redirect_url: 'https://www.orgamix.tech/pricing',
            },
              metadata: {
                branch_area: 'PLUIT',
                branch_city: 'JAKARTA',
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
              auth: {
                username: 'xnd_development_rPDlHcnbSsRHxJIhSs0xv73wPzCLjP4UBkHx9n1DFtyE7L0poPzRr5G5i92Wr2',
                password: '', // Leave this blank if not using a password
              },
            }
          );
      
          console.log('Success:', response.data);
        } catch (error) {
          console.error('Error:', error);
        }
      };

  return (
    <div>

        <button onClick={createEWalletCharge} className='bg-blue-500 text-white p-2 rounded-md'>
            we
        </button>
      
    </div>
  )
}

export default Test
