import { Router, Request, Response, NextFunction } from 'express';
import PaymentService from '../../services/payment';
import middlewares from '../../middleware';
import express from 'express';

const route = Router();

export default (app: Router) => {
    app.use('/payments', route);

    route.post(
        '/subscribe',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const paymentService = new PaymentService();
                const checkoutUrl = await paymentService.CreateCheckoutSession(
                    req.currentUser._id,
                    req.currentUser.email
                );
                return res.status(200).json({ url: checkoutUrl });
            } catch (e) {
                return next(e);
            }
        },
    );

    // Stripe Webhook - Needs raw body
    route.post(
        '/webhook',
        express.raw({ type: 'application/json' }),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const sig = req.headers['stripe-signature'];
                const paymentService = new PaymentService();

                await paymentService.HandleWebhook(sig as string, req.body);

                return res.status(200).send({ received: true });
            } catch (e) {
                return res.status(400).send(`Webhook Error: ${e.message}`);
            }
        },
    );
};
