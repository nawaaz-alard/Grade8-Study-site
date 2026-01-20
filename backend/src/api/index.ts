import { Router } from 'express';
import auth from './routes/auth';
import task from './routes/tasks';
import resource from './routes/resources';
import payment from './routes/payment';

// guaranteed to get dependencies
export default () => {
    const app = Router();
    auth(app);
    task(app);
    resource(app);
    payment(app);
    // user(app);

    return app;
}
