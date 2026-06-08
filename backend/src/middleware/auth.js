const jwt = require('jsonwebtoken');
const { Session, AuditLog } = require('../models');

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Session hijacking prevention
        const session = await Session.findByPk(decoded.sessionId);
        
        if (!session || new Date(session.expires_at) < new Date()) {
            return res.status(401).json({ message: 'Session expired or invalid.' });
        }
        
        // IP validation for session hijacking
        if (session.ip_address && session.ip_address !== req.ip) {
            await AuditLog.create({
                action: 'SESSION_IP_MISMATCH',
                user_id: decoded.userId,
                user_type: decoded.userType,
                details: `Expected IP: ${session.ip_address}, Actual: ${req.ip}`,
                ip_address: req.ip
            });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

const requireEmployee = (req, res, next) => {
    if (req.user.userType !== 'employee') {
        return res.status(403).json({ message: 'Employee access required.' });
    }
    next();
};

module.exports = { verifyToken, requireEmployee };