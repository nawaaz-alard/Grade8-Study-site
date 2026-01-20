import expressLoader from './express';
import mongooseLoader from './database';
import Logger from '../utils/logger';

export default async ({ expressApp }) => {
    const mongoConnection = await mongooseLoader();
    Logger.info('✌️ DB loaded and connected!');

    await expressLoader({ app: expressApp });
    Logger.info('✌️ Express loaded');
};
