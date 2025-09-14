const express = require('express');
const router = express.Router();
const proyectosController = require('../controllers/proyectosController');

router.get('/', proyectosController.getAll);
router.get('/metrics', proyectosController.getMetrics);
router.get('/costs-by-project', proyectosController.getCostsByProject);
router.get('/:id', proyectosController.getById);
router.post('/', proyectosController.create);
router.put('/:id', proyectosController.update);
router.delete('/:id', proyectosController.remove);

module.exports = router;