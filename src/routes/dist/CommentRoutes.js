"use strict";
exports.__esModule = true;
var express_1 = require("express");
var CommentController_1 = require("../controllers/CommentController");
var authMiddleware_1 = require("../middlewares/authMiddleware");
var router = express_1.Router();
var commentController = new CommentController_1.CommentController();
// Apply auth middleware to all routes
router.use(authMiddleware_1.authMiddleware);
// Comment routes
router.get('/report/:reportId', commentController.getByReportId);
router.put('/:id', commentController.update);
router["delete"]('/:id', commentController["delete"]);
exports["default"] = router;
