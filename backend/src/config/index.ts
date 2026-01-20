import dotenv from 'dotenv';
import path from 'path';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();

if (envFound.error) {
    console.warn("⚠️  Couldn't find .env file  ⚠️");
}

export default {
    port: parseInt(process.env.PORT || '8080', 10),
    databaseURL: process.env.MONGODB_URI || 'mongodb://localhost:27017/grade8hub',
    jwtSecret: process.env.JWT_SECRET || 'changeme',
    logs: {
        level: process.env.LOG_LEVEL || 'silly',
    },
    api: {
        prefix: '/api',
    },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        successUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000?success=true',
        cancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:3000?canceled=true',
    }
};
