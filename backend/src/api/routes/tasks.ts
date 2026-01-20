import { Router, Request, Response, NextFunction } from 'express';
import TaskService from '../../services/task';
import { z } from 'zod';
import middlewares from '../../middleware';

const route = Router();

const CreateTaskSchema = z.object({
    text: z.string().min(1),
    subject: z.string().optional(),
    dueDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
});

const UpdateTaskSchema = z.object({
    text: z.string().optional(),
    completed: z.boolean().optional(),
});

export default (app: Router) => {
    app.use('/tasks', route);

    route.get(
        '/',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const taskService = new TaskService();
                const tasks = await taskService.GetTasks(req.currentUser._id);
                return res.status(200).json({ tasks });
            } catch (e) {
                return next(e);
            }
        },
    );

    route.post(
        '/',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const validatedData = CreateTaskSchema.parse(req.body);
                const taskService = new TaskService();
                const task = await taskService.CreateTask(req.currentUser._id, validatedData);
                return res.status(201).json({ task });
            } catch (e) {
                return next(e);
            }
        },
    );

    route.patch(
        '/:id',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const validatedData = UpdateTaskSchema.parse(req.body);
                const taskService = new TaskService();
                const task = await taskService.UpdateTask(req.params.id, req.currentUser._id, validatedData);
                return res.status(200).json({ task });
            } catch (e) {
                return next(e);
            }
        },
    );

    route.delete(
        '/:id',
        middlewares.isAuth,
        middlewares.attachCurrentUser,
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const taskService = new TaskService();
                await taskService.DeleteTask(req.params.id, req.currentUser._id);
                return res.status(204).end();
            } catch (e) {
                return next(e);
            }
        },
    );
};
