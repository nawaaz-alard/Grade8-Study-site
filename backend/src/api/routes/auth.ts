import { Router, Request, Response, NextFunction } from 'express';
import AuthService from '../../services/auth';
import { z } from 'zod'; // For validation

const route = Router();

const SignupSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});

export default (app: Router) => {
    app.use('/auth', route);

    route.post(
        '/signup',
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                // Validate input
                const validatedData = SignupSchema.parse(req.body);

                const authServiceInstance = new AuthService();
                const { user, token } = await authServiceInstance.SignUp(validatedData);

                return res.status(201).json({ user, token });
            } catch (e) {
                return next(e);
            }
        },
    );

    route.post(
        '/signin',
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { email, password } = req.body;
                const authServiceInstance = new AuthService();
                const { user, token } = await authServiceInstance.SignIn(email, password);
                return res.status(200).json({ user, token });
            } catch (e) {
                return next(e);
            }
        },
    );
};
