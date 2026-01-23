const { app } = require('@azure/functions');
const { readJson, writeJson } = require('../shared/db');
const { getUserFromRequest } = require('../shared/auth');
const { v4: uuidv4 } = require('uuid');

app.http('tasks', {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    route: 'tasks/{id?}',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const user = await getUserFromRequest(request);
        if (!user) {
            return { status: 401, body: JSON.stringify({ error: "Unauthorized" }) };
        }
        const userId = user.sub;
        const blobName = `${userId}_tasks.json`;
        const container = 'users';

        let tasks = await readJson(container, blobName) || [];

        const method = request.method;
        const id = request.params.id;

        if (method === 'GET') {
            return { body: JSON.stringify(tasks) };
        }

        if (method === 'POST') {
            const body = await request.json();
            const newTask = {
                _id: uuidv4(),
                text: body.text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            tasks.push(newTask);
            await writeJson(container, blobName, tasks);
            return { status: 201, body: JSON.stringify(newTask) };
        }

        if (method === 'PUT') {
            if (!id) return { status: 400, body: JSON.stringify({ error: "Missing ID" }) };
            const body = await request.json();
            const taskIndex = tasks.findIndex(t => t._id === id);
            if (taskIndex > -1) {
                tasks[taskIndex] = { ...tasks[taskIndex], ...body };
                await writeJson(container, blobName, tasks);
                return { body: JSON.stringify(tasks[taskIndex]) };
            } else {
                return { status: 404, body: JSON.stringify({ error: "Task not found" }) };
            }
        }

        if (method === 'DELETE') {
            if (!id) return { status: 400, body: JSON.stringify({ error: "Missing ID" }) };
            const initialLength = tasks.length;
            tasks = tasks.filter(t => t._id !== id);
            if (tasks.length < initialLength) {
                await writeJson(container, blobName, tasks);
                return { status: 204 };
            } else {
                return { status: 404, body: JSON.stringify({ error: "Task not found" }) };
            }
        }
    }
});
