const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

router.get('/', pagosController.getAll);
router.get('/metrics', pagosController.getMetrics);
router.get('/pending', pagosController.getPending);
router.get('/approved', pagosController.getApproved);
router.get('/:id', pagosController.getById);
router.post('/', pagosController.create);
router.put('/:id', pagosController.update);
router.delete('/:id', pagosController.remove);

// Approval routes
router.post('/:id/approve', pagosController.approve);
router.post('/:id/defer', pagosController.defer);

module.exports = router; 