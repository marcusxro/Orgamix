interface paymentTokens {
    token: string;
    is_used: boolean;
    created_at: number;
    expires_at: number;
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

export default accountDetails;