const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Ruta para verificar tokens (SSO)
router.post('/verify', authMiddleware, (req, res) => {
  // Si llegamos aquí, el token es válido (verificado por authMiddleware)
  res.json({
    valid: true,
    user: req.user,
    message: 'Token válido'
  });
});

// Ruta para verificar tokens via GET también
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    valid: true,
    user: req.user,
    message: 'Token válido'
  });
});

// Authentication routes (legacy - mantener por compatibilidad)
router.post('/login', usersController.login);

// User routes protegidas
router.get('/', authMiddleware, usersController.getAllUsers);
router.post('/', authMiddleware, usersController.createUser);
router.put('/:id', authMiddleware, usersController.updateUser);
router.delete('/:id', authMiddleware, usersController.deleteUser);

module.exports = router; 