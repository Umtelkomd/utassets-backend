const express = require('express');
const router = express.Router();
const cuentasPorPagarController = require('../controllers/cuentasPorPagarController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

router.get('/', cuentasPorPagarController.getAll);
router.get('/:id', cuentasPorPagarController.getById);
router.post('/', cuentasPorPagarController.create);
router.put('/:id', cuentasPorPagarController.update);
router.delete('/:id', cuentasPorPagarController.remove);

module.exports = router; 