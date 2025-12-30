const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        
        // Check if user is blocked
        try {
            const [users] = await db.query('SELECT status FROM admin WHERE id = ?', [user.id]);
            if (users.length > 0 && users[0].status === 'blocked') {
                return res.status(403).json({ message: 'Your account has been blocked. Please contact administrator.' });
            }
        } catch (error) {
            console.error('Error checking user status:', error);
            // Continue if check fails (don't block legitimate users)
        }
        
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;

