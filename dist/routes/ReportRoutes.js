"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReportController_1 = require("../controllers/ReportController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const reportController = new ReportController_1.ReportController();
// Apply auth middleware to all routes
router.use(authMiddleware_1.authMiddleware);
// Report routes
router.post('/', reportController.create);
router.get('/', reportController.getAll);
router.get('/:id', reportController.getById);
router.put('/:id', reportController.update);
router.delete('/:id', reportController.delete);
// Comment routes within reports
router.post('/:id/comments', reportController.addComment);
exports.default = router;
