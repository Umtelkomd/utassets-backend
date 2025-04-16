"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MovementController_1 = require("../controllers/MovementController");
const router = (0, express_1.Router)();
// Rutas
router.post('/', MovementController_1.movementController.createMovement.bind(MovementController_1.movementController));
router.get('/', MovementController_1.movementController.getAllMovements.bind(MovementController_1.movementController));
router.get('/:id', MovementController_1.movementController.getMovement.bind(MovementController_1.movementController));
router.get('/inventory/:inventoryId', MovementController_1.movementController.getMovementsByInventoryId.bind(MovementController_1.movementController));
router.put('/:id', MovementController_1.movementController.updateMovement.bind(MovementController_1.movementController));
router.delete('/:id', MovementController_1.movementController.deleteMovement.bind(MovementController_1.movementController));
exports.default = router;
