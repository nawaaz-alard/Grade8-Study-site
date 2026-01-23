const { app } = require('@azure/functions');
const { OAuth2Client } = require('google-auth-library');
const { readJson, writeJson } = require('../shared/db');

const CLIENT_ID = '895631263906-0m54r2mfu8aatr5jq9qlnmrl0c78m72g.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

app.http('auth-google', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/google',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { credential } = body;

            if (!credential) {
                return { status: 400, body: JSON.stringify({ error: "Missing credential" }) };
            }

            // Verify Google Token
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: CLIENT_ID,
            });
            const payload = ticket.getPayload();
            const userId = payload['sub'];
            const email = payload['email'];
            const name = payload['name'];
            const picture = payload['picture'];

            // Check if user exists in 'users' container
            // We use the 'sub' (stable Google User ID) as the filename
            const userBlobName = `${userId}.json`;
            let userProfile = await readJson('users', userBlobName);

            if (!userProfile) {
                // Create new user profile
                userProfile = {
                    id: userId,
                    email: email,
                    name: name,
                    picture: picture,
                    createdAt: new Date().toISOString(),
                    role: 'student', // default role
                    subscription: 'free', // free, premium
                    usage: {
                        logins: 1,
                        lastLogin: new Date().toISOString()
                    }
                };
                await writeJson('users', userBlobName, userProfile);
            } else {
                // Update login stats
                userProfile.usage = userProfile.usage || {};
                userProfile.usage.logins = (userProfile.usage.logins || 0) + 1;
                userProfile.usage.lastLogin = new Date().toISOString();
                // Update mutable fields if they changed on Google side
                userProfile.picture = picture;
                userProfile.name = name;

                await writeJson('users', userBlobName, userProfile);
            }

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userProfile)
            };

        } catch (error) {
            context.error("Login Error:", error);
            return {
                status: 500,
                body: JSON.stringify({ error: "Authentication failed", details: error.message })
            };
        }
    }
});
