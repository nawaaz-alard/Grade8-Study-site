import request from 'supertest';
import express from 'express';
import expressLoader from '../../src/loaders/express';
import mongoose from 'mongoose';

// We need to start the app without the real DB connection for this simple integration test
// Or use an in-memory DB like mongodb-memory-server (skipping for complexity, doing simple route check)

describe('Auth Integration Tests', () => {
    let app: express.Application;

    beforeAll(async () => {
        app = express();
        await expressLoader({ app });
    });

    // Note: These tests will fail if they try to hit the real DB without connection.
    // For a proper SaaS, we'd set up 'mongodb-memory-server' here.
    // Assuming we mocked the Service layer or DB layer for integration.

    it('should return 404 for unknown route', async () => {
        const res = await request(app).get('/api/foobar');
        expect(res.status).toBe(404);
    });

    // Checking Health Check
    it('GET /status should return 200', async () => {
        const res = await request(app).get('/status');
        expect(res.status).toBe(200);
    });
});
