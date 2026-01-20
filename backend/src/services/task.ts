import Task from '../models/Task';
import { Types } from 'mongoose';
import Logger from '../utils/logger';

export default class TaskService {
    public async CreateTask(userId: string, taskInput: { text: string; subject?: string; dueDate?: Date }): Promise<any> {
        try {
            Logger.info('Creating task for user: ' + userId);
            const taskRecord = await Task.create({
                userId: new Types.ObjectId(userId),
                ...taskInput,
            });
            return taskRecord.toObject();
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

    public async GetTasks(userId: string): Promise<any[]> {
        try {
            return await Task.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

    public async UpdateTask(taskId: string, userId: string, updateData: { completed?: boolean; text?: string }): Promise<any> {
        try {
            const task = await Task.findOneAndUpdate(
                { _id: new Types.ObjectId(taskId), userId: new Types.ObjectId(userId) },
                { $set: updateData },
                { new: true }
            );
            if (!task) throw new Error('Task not found or access denied');
            return task.toObject();
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

    public async DeleteTask(taskId: string, userId: string): Promise<void> {
        try {
            const result = await Task.deleteOne({ _id: new Types.ObjectId(taskId), userId: new Types.ObjectId(userId) });
            if (result.deletedCount === 0) throw new Error('Task not found or access denied');
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }
}
