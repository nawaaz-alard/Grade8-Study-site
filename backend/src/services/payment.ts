import Stripe from 'stripe';
import config from '../config';
import User from '../models/User';
import Logger from '../utils/logger';

export default class PaymentService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(config.stripe.secretKey || '', {
            apiVersion: '2023-10-16',
        });
    }

    public async CreateCheckoutSession(userId: string, email: string): Promise<string> {
        try {
            // 1. Find or Create Stripe Customer
            // For simplicity in this demo, we create a new session. 
            // In prod, you'd save stripeCustomerId to User model and reuse it.

            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                customer_email: email,
                line_items: [
                    {
                        price_data: {
                            currency: 'usd', // or zar for South Africa
                            product_data: {
                                name: 'Grade 8 Study Hub Premium',
                                description: 'Unlock all study resources and unlimited tasks.',
                            },
                            unit_amount: 9900, // 99.00 (cents)
                            recurring: {
                                interval: 'month',
                            },
                        },
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: config.stripe.successUrl,
                cancel_url: config.stripe.cancelUrl,
                metadata: {
                    userId,
                },
            });

            return session.url || '';
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

    public async HandleWebhook(signature: string, payload: Buffer): Promise<void> {
        try {
            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                config.stripe.webhookSecret || ''
            );

            switch (event.type) {
                case 'checkout.session.completed':
                    const session = event.data.object as Stripe.Checkout.Session;
                    await this.upgradeUser(session.metadata?.userId);
                    break;
                case 'customer.subscription.deleted':
                    // Handle downgrade logic here
                    break;
                default:
                    Logger.info(`Unhandled event type ${event.type}`);
            }
        } catch (e) {
            Logger.error(`Webhook Error: ${e.message}`);
            throw new Error(`Webhook Error: ${e.message}`);
        }
    }

    private async upgradeUser(userId: string | undefined) {
        if (!userId) return;
        try {
            await User.findByIdAndUpdate(userId, { subscriptionTier: 'premium' });
            Logger.info(`User ${userId} upgraded to Premium via Stripe.`);
        } catch (e) {
            Logger.error(`Failed to upgrade user ${userId}`, e);
        }
    }
}
