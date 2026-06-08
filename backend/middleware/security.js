const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const express = require('express');

const setupSecurityMiddleware = (app) => {
    // Helmet for HTTP Headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:5173", "http://localhost:5173", "ws://127.0.0.1:5173", "http://127.0.0.1:5173"]
            }
        }
    }));

    // CORS for Cross-Origin
    app.use(cors({
        origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true
    }));

    // Body Parser limits
    app.use(express.json({ limit: '10kb' }));

    // Prevent invalid JSON from crashing the server
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
            return res.status(400).json({ success: false, message: 'Invalid JSON payload format' });
        }
        next();
    });

    // Rate Limiting
    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        message: { success: false, message: 'Too many requests, please try again later.' }
    });

    app.use('/api/', apiLimiter);
};

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { success: false, message: 'Too many login attempts, please try again after a minute.' }
});

module.exports = {
    setupSecurityMiddleware,
    loginLimiter
};
