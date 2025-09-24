"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CommentController_1 = require("../controllers/CommentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const commentController = new CommentController_1.CommentController();
// Apply auth middleware to all routes
router.use(authMiddleware_1.authMiddleware);
// Comment routes
router.get('/report/:reportId', commentController.getByReportId);
router.put('/:id', commentController.update);
router.delete('/:id', commentController.delete);
exports.default = router;
