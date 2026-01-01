const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');
const { startExpiryChecker } = require('./scheduler/expiryChecker');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware - CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'https://khandeshmatrimony.com',
            'https://www.khandeshmatrimony.com',
            'http://khandeshmatrimony.com',
            'http://www.khandeshmatrimony.com',
            process.env.FRONTEND_URL
        ].filter(Boolean); // Remove undefined values
        
        // Allow if in allowed list or if FRONTEND_URL matches
        if (allowedOrigins.some(allowed => origin === allowed || origin.startsWith(allowed))) {
            callback(null, true);
        } else {
            // In production, be more strict
            if (process.env.NODE_ENV === 'production') {
                // Still allow for now, but log it
                console.log('⚠️  CORS: Allowing origin:', origin);
                callback(null, true);
            } else {
                callback(null, true);
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (uploaded photos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/', sitemapRoutes); // Sitemap route (serves /sitemap.xml)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Khandesh Vivah API is running' });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
    try {
        const db = require('./config/db');
        await db.query('SELECT 1 as test');
        res.json({ status: 'OK', message: 'Database connected successfully' });
    } catch (error) {
        console.error('❌ Database health check failed:', error.message);
        res.status(500).json({ 
            status: 'ERROR', 
            message: 'Database connection failed', 
            error: error.message,
            code: error.code
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 ============================================`);
    console.log(`🚀 SERVER STARTED SUCCESSFULLY`);
    console.log(`🚀 ============================================`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`📡 API URL: http://localhost:${PORT}/api`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📡 DB Health: http://localhost:${PORT}/api/health/db`);
    console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
    console.log(`🚀 ============================================\n`);

    // Start expiry checker scheduler
    // Runs immediately on startup, then every 4 hours
    startExpiryChecker();
});

