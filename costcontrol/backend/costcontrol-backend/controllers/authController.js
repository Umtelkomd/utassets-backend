const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../data-source');
const { User } = require('../entities/User');
const { asyncHandler } = require('../middleware/errorHandler');

// Login endpoint
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required',
      code: 'MISSING_CREDENTIALS'
    });
  }

  // Find user by email
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Check if user is active
  if (!user.active) {
    return res.status(401).json({
      error: 'Account is disabled',
      code: 'ACCOUNT_DISABLED'
    });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({
      error: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  // Return user data (without password) and token
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active
  };

  res.json({
    success: true,
    data: {
      user: userData,
      token
    },
    message: 'Login successful'
  });
});

// Verify token endpoint
exports.verify = asyncHandler(async (req, res) => {
  // This endpoint is used to verify if a token is still valid
  // The authenticateToken middleware will handle the token verification
  
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: req.user.id } });

  if (!user || !user.active) {
    return res.status(401).json({
      error: 'User not found or disabled',
      code: 'USER_NOT_FOUND'
    });
  }

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active
  };

  res.json({
    success: true,
    data: {
      user: userData
    }
  });
});

// Logout endpoint (for completeness, though JWT is stateless)
exports.logout = asyncHandler(async (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  // This endpoint can be used for logging purposes
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});