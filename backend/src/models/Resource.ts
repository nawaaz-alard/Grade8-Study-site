import mongoose from 'mongoose';

const Resource = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            index: true,
        },
        subject: {
            type: String,
            required: true,
            index: true,
        },
        term: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ['pdf', 'video', 'link', 'quiz', 'note'],
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        isPremium: {
            type: Boolean,
            default: false,
        },
        description: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    { timestamps: true },
);

export default mongoose.model('Resource', Resource);
