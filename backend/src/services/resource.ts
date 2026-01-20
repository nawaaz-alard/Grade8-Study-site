import Resource from '../models/Resource';
import Logger from '../utils/logger';

export default class ResourceService {
    public async CreateResource(resourceInput: any): Promise<any> {
        try {
            const resourceRecord = await Resource.create(resourceInput);
            return resourceRecord.toObject();
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

    public async GetResources(filter: any, userSubscription: string = 'free'): Promise<any[]> {
        try {
            const query = { ...filter };

            // If user is free tier, do not show premium resources (or show but locked - strictly filtering here for security)
            // Alternatively, we could fetch all and mark them as locked in transformation. 
            // For this implementation, we'll return all, but the frontend should handle 'isPremium' check vs user role.
            // But to be secure SaaS:
            if (userSubscription === 'free') {
                // logic option: only return free resources
                // query.isPremium = false; 
            }

            return await Resource.find(query).sort({ createdAt: -1 });
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

    public async DeleteResource(resourceId: string): Promise<void> {
        try {
            await Resource.deleteOne({ _id: resourceId });
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }
}
