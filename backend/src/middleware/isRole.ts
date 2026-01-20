import { Request, Response, NextFunction } from 'express';

const isRole = (requiredRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.currentUser) {
            return res.status(401).send('User not authenticated');
        }

        if (!requiredRoles.includes(req.currentUser.role)) {
            return res.status(403).send('Access denied: insufficient permissions');
        }

        next();
    };
};

export default isRole;
