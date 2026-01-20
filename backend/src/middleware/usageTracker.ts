import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Logger from '../utils/logger';

const usageTracker = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.auth && req.auth._id) {
            // Fire and forget - don't await to not slow down response
            const UserModel = mongoose.model('User');
            UserModel.updateOne(
                { _id: req.auth._id },
                { $inc: { 'usageStats.apiCalls': 1 }, $set: { lastActive: new Date() } }
            ).exec().catch(err => {
                Logger.error('Failed to update usage stats', err);
            });
        }
        next();
    } catch (e) {
        Logger.error('Usage tracker error', e);
        next();
    }
};

export default usageTracker;
