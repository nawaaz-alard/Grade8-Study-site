import mongoose from 'mongoose';

const Task = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        text: {
            type: String,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        dueDate: {
            type: Date,
        },
        subject: {
            type: String, // Optional: tag tasks by subject
        }
    },
    { timestamps: true },
);

export default mongoose.model('Task', Task);
