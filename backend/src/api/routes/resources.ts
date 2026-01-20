import { Router, Request, Response, NextFunction } from 'express';
import ResourceService from '../../services/resource';
import middlewares from '../../middleware';
import usageTracker from '../../middleware/usageTracker';
import { z } from 'zod';

const route = Router();

const CreateResourceSchema = z.object({
    title: z.string().min(3),
    subject: z.string(),
    term: z.number(),
    type: z.enum(['pdf', 'video', 'link', 'quiz', 'note']),
    url: z.string().url(),
    isPremium: z.boolean().optional(),
    description: z.string().optional(),
});

export default (app: Router) => {
    app.use('/resources', route);

    // Get all resources (Public or Auth - decided Auth for SaaS tracking)
    route.get(
        '/',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        usageTracker, // Track usage
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const resourceService = new ResourceService();
                // Allow filtering by subject/term via query params
                const filter: any = {};
                if (req.query.subject) filter.subject = req.query.subject;
                if (req.query.term) filter.term = req.query.term;

                const resources = await resourceService.GetResources(filter, req.currentUser.subscriptionTier);
                return res.status(200).json({ resources });
            } catch (e) {
                return next(e);
            }
        },
    );

    // Admin only: Create Resource
    route.post(
        '/',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        middlewares.isRole(['admin']),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const validatedData = CreateResourceSchema.parse(req.body);
                const resourceService = new ResourceService();
                const resource = await resourceService.CreateResource({
                    ...validatedData,
                    createdBy: req.currentUser._id
                });
                return res.status(201).json({ resource });
            } catch (e) {
                return next(e);
            }
        },
    );

    // Admin only: Delete Resource
    route.delete(
        '/:id',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        middlewares.isRole(['admin']),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const resourceService = new ResourceService();
                await resourceService.DeleteResource(req.params.id);
                return res.status(204).end();
            } catch (e) {
                return next(e);
            }
        }
    );
};
