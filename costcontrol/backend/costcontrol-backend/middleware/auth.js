const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../data-source');
const { User } = require('../entities/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'AUTH_TOKEN_MISSING' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Verify user still exists and is active
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: decoded.userId });
    
    if (!user) {
      return res.status(403).json({ 
        error: 'User not found',
        code: 'AUTH_USER_NOT_FOUND' 
      });
    }
    
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        error: 'Token expired',
        code: 'AUTH_TOKEN_EXPIRED' 
      });
    }
    
    return res.status(403).json({ 
      error: 'Invalid token',
      code: 'AUTH_TOKEN_INVALID' 
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      });
    }
    
    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'AUTH_INSUFFICIENT_PERMISSIONS',
        requiredRoles: userRoles,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};