import { Request } from 'express';
import { expressjwt as jwt } from 'express-jwt';
import config from '../config';

const getTokenFromHeader = (req: Request) => {
    if (
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
    ) {
        return req.headers.authorization.split(' ')[1];
    }
    return undefined;
};

export default jwt({
    secret: config.jwtSecret, // The secret used to sign the JWT
    algorithms: ['HS256'], // Algorithm used for signing
    getToken: getTokenFromHeader, // Function to extract token
});
