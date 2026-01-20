import { Container } from 'typedi';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger';

const attachCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const UserModel = mongoose.model('User');
        const userRecord = await UserModel.findById(req.auth._id);
        if (!userRecord) {
            return res.sendStatus(401);
        }
        const currentUser = userRecord.toObject();
        Reflect.deleteProperty(currentUser, 'password');
        req.currentUser = currentUser;
        return next();
    } catch (e) {
        Logger.error('🔥 Error attaching user to req: %o', e);
        return next(e);
    }
};

export default attachCurrentUser;
