import mongoose from 'mongoose';
import config from '../config';
import Logger from '../utils/logger';

export default async (): Promise<any> => {
    try {
        const connection = await mongoose.connect(config.databaseURL, {});
        Logger.info('✌️ DB Loaded and Connected!');
        return connection.connection.db;
    } catch (err) {
        Logger.error('🔥 Error loading database connection', err);
        process.exit(1);
    }
};
