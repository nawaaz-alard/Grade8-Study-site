import mongoose from 'mongoose';

const User = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please enter a username'],
            index: true,
        },
        email: {
            type: String,
            lowercase: true,
            index: true,
        },
        password: {
            type: String, // Hashed password
        },
        role: {
            type: String,
            default: 'student',
            enum: ['student', 'admin', 'guest'],
        },
        subscriptionTier: {
            type: String,
            default: 'free',
            enum: ['free', 'premium', 'enterprise'],
        },
        birthYear: {
            type: Number,
        },
        lastLogin: Date,
    },
    { timestamps: true },
);

export default mongoose.model('User', User);
