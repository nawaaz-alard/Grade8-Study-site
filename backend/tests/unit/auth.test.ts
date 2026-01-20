import AuthService from '../../src/services/auth';
import User from '../../src/models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../src/models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService Unit Tests', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();
    });

    describe('SignUp', () => {
        it('should create a user and return user record + token', async () => {
            // Arrange
            const userInput = {
                username: 'testuser',
                email: 'test@test.com',
                password: 'password123',
            };

            const hashedPassword = 'hashed_password';
            const createdUser = {
                _id: 'userId123',
                ...userInput,
                password: hashedPassword,
                toObject: jest.fn().mockReturnValue({ ...userInput, _id: 'userId123' }), // Remove password logic
            };

            (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
            (User.create as jest.Mock).mockResolvedValue(createdUser);
            (jwt.sign as jest.Mock).mockReturnValue('mock_token');

            // Act
            const result = await authService.SignUp(userInput);

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith(userInput.password, 'salt');
            expect(User.create).toHaveBeenCalledWith({ ...userInput, password: hashedPassword });
            expect(result.token).toBe('mock_token');
            expect(result.user.email).toBe(userInput.email);
        });
    });

    describe('SignIn', () => {
        it('should return token if password matches', async () => {
            // Arrange
            const email = 'test@test.com';
            const password = 'password123';
            const hashedPassword = 'hashed_password';
            const foundUser = {
                _id: 'userId123',
                email,
                password: hashedPassword,
                toObject: jest.fn().mockReturnValue({ _id: 'userId123', email }),
            };

            (User.findOne as jest.Mock).mockResolvedValue(foundUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mock_token');

            // Act
            const result = await authService.SignIn(email, password);

            // Assert
            expect(User.findOne).toHaveBeenCalledWith({ email });
            expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result.token).toBe('mock_token');
        });

        it('should throw error if user not found', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);

            await expect(authService.SignIn('wrong@email.com', 'pass'))
                .rejects
                .toThrow('User not registered');
        });
    });
});
