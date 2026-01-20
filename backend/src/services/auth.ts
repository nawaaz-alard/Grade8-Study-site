import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config';
import User from '../models/User';
import Logger from '../utils/logger';

export default class AuthService {
    public async SignUp(userInput: any): Promise<{ user: any; token: string }> {
        try {
            Logger.info('Sign up service invoked');

            const salt = await bcrypt.genSalt(10);
            Logger.silly('Generating salt');

            const hashedPassword = await bcrypt.hash(userInput.password, salt);
            Logger.silly('Hashing password');

            const userRecord = await User.create({
                ...userInput,
                password: hashedPassword,
            });
            Logger.info('User created in DB');

            if (!userRecord) {
                throw new Error('User cannot be created');
            }

            const token = this.generateToken(userRecord);

            const user = userRecord.toObject();
            Reflect.deleteProperty(user, 'password');

            return { user, token };
        } catch (e) {
            Logger.error(e);
            throw e;
        }
    }

    public async SignIn(email: string, password: string): Promise<{ user: any; token: string }> {
        const userRecord = await User.findOne({ email });
        if (!userRecord) {
            throw new Error('User not registered');
        }

        const validPassword = await bcrypt.compare(password, userRecord.password);
        if (validPassword) {
            const token = this.generateToken(userRecord);
            const user = userRecord.toObject();
            Reflect.deleteProperty(user, 'password');
            return { user, token };
        } else {
            throw new Error('Invalid Password');
        }
    }

    private generateToken(user: any) {
        const today = new Date();
        const exp = new Date(today);
        exp.setDate(today.getDate() + 60); // 60 days expiration

        return jwt.sign(
            {
                _id: user._id,
                role: user.role,
                name: user.username,
                exp: exp.getTime() / 1000,
            },
            config.jwtSecret,
        );
    }
}
