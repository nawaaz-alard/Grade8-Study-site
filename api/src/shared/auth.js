const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = '895631263906-0m54r2mfu8aatr5jq9qlnmrl0c78m72g.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

async function verifyToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        return ticket.getPayload();
    } catch (error) {
        console.error("Token verification failed:", error); // Only log error, don't throw
        return null;
    }
}

async function getUserFromRequest(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    return await verifyToken(token);
}

module.exports = { verifyToken, getUserFromRequest };
