const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const securityHeaders = require('./src/middleware/securityHeaders');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { syncDatabase } = require('./src/models');

const authRoutes = require('./src/routes/authRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(cors({
    origin: ['http://localhost:3000', 'https://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Initialize database and start server
const startServer = async () => {
    try {
        await syncDatabase();
        
        const PORT = process.env.PORT || 5000;
        
        // Check for SSL certificates (for HTTPS)
        const certPath = path.join(__dirname, 'certs');
        const hasCerts = fs.existsSync(path.join(certPath, 'localhost.key')) && 
                        fs.existsSync(path.join(certPath, 'localhost.crt'));
        
        if (process.env.NODE_ENV === 'production' && hasCerts) {
            const sslOptions = {
                key: fs.readFileSync(path.join(certPath, 'localhost.key')),
                cert: fs.readFileSync(path.join(certPath, 'localhost.crt'))
            };
            https.createServer(sslOptions, app).listen(PORT, () => {
                console.log(`HTTPS Server running on port ${PORT}`);
            });
        } else {
            app.listen(PORT, () => {
                console.log(`HTTP Server running on port ${PORT}`);
                console.log('Note: For production, enable HTTPS with valid certificates');
            });
        }
        
        console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
        
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();

module.exports = app;