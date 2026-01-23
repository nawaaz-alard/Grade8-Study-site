const { app } = require('@azure/functions');
const axios = require('axios');
const { readJson, writeJson } = require('../shared/db');
const { verifyToken } = require('../shared/auth');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

app.http('verifyPayment', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { reference, credential } = body;

            if (!reference || !credential) {
                return { status: 400, body: JSON.stringify({ error: "Missing fields" }) };
            }

            // 1. Verify User
            const userPayload = await verifyToken(credential);
            if (!userPayload) {
                return { status: 401, body: JSON.stringify({ error: "Invalid auth token" }) };
            }
            const userId = userPayload['sub'];

            // 2. Verify Transaction with Paystack
            // https://api.paystack.co/transaction/verify/:reference
            const paystackUrl = `https://api.paystack.co/transaction/verify/${reference}`;
            const paystackResponse = await axios.get(paystackUrl, {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                }
            });

            const data = paystackResponse.data;

            if (data.status && data.data.status === 'success') {
                // Payment was successful
                // Update User Profile
                const userBlobName = `${userId}.json`;
                const userProfile = await readJson('users', userBlobName);

                if (userProfile) {
                    userProfile.subscription = 'premium'; // Set to premium
                    userProfile.paymentRef = reference;
                    userProfile.lastPaymentDate = new Date().toISOString();

                    await writeJson('users', userBlobName, userProfile);

                    return {
                        status: 200,
                        body: JSON.stringify({ success: true, message: "Subscription activated", user: userProfile })
                    };
                } else {
                    return { status: 404, body: JSON.stringify({ error: "User profile not found. Login first." }) };
                }

            } else {
                return { status: 400, body: JSON.stringify({ error: "Payment verification failed", details: data.message }) };
            }

        } catch (error) {
            context.error("Payment Verification Error:", error);
            return {
                status: 500,
                body: JSON.stringify({ error: "Server error during verification" })
            };
        }
    }
});
