"use strict";
exports.__esModule = true;
var express_1 = require("express");
var ReportController_1 = require("../controllers/ReportController");
var authMiddleware_1 = require("../middlewares/authMiddleware");
var router = express_1.Router();
var reportController = new ReportController_1.ReportController();
// Apply auth middleware to all routes
router.use(authMiddleware_1.authMiddleware);
// Report routes
router.post('/', reportController.create);
router.get('/', reportController.getAll);
router.get('/:id', reportController.getById);
router.put('/:id', reportController.update);
router["delete"]('/:id', reportController["delete"]);
// Comment routes within reports
router.post('/:id/comments', reportController.addComment);
exports["default"] = router;
