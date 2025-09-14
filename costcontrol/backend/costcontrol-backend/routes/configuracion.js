const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

router.get('/', configuracionController.getConfig);
router.put('/', configuracionController.updateConfig);
router.post('/test-slack', configuracionController.testSlackConnection);

module.exports = router; 