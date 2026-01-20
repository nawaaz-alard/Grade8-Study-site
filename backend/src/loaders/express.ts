import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from '../api';
import config from '../config';

export default ({ app }: { app: express.Application }) => {
    // Health Check endpoints
    app.get('/status', (req, res) => {
        res.status(200).end();
    });
    app.head('/status', (req, res) => {
        res.status(200).end();
    });

    // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    app.enable('trust proxy');

    // The magic package that prevents frontend developers going crazy
    // Alternate description:
    // Enable Cross Origin Resource Sharing to all origins by default
    app.use(cors());

    // Middleware that transforms the raw string of req.body into json
    app.use(express.json());

    // Helmet logic for security headers
    app.use(helmet());

    // Swagger UI
    const swaggerDocument = require('yamljs').load('./swagger.yaml');
    const swaggerUi = require('swagger-ui-express');
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Load API routes
    app.use(config.api.prefix, routes());

    /// catch 404 and forward to error handler
    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    });

    /// error handlers
    app.use((err, req, res, next) => {
        /**
         * Handle 401 thrown by express-jwt library
         */
        if (err.name === 'UnauthorizedError') {
            return res
                .status(err.status)
                .send({ message: err.message })
                .end();
        }
        return next(err);
    });

    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({
            errors: {
                message: err.message,
            },
        });
    });
};
