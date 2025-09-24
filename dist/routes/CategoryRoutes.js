"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CategoryController_1 = require("../controllers/CategoryController");
const router = (0, express_1.Router)();
// Rutas
router.post('/', CategoryController_1.categoryController.createCategory.bind(CategoryController_1.categoryController));
router.get('/', CategoryController_1.categoryController.getAllCategories.bind(CategoryController_1.categoryController));
router.get('/:id', CategoryController_1.categoryController.getCategory.bind(CategoryController_1.categoryController));
router.put('/:id', CategoryController_1.categoryController.updateCategory.bind(CategoryController_1.categoryController));
router.delete('/:id', CategoryController_1.categoryController.deleteCategory.bind(CategoryController_1.categoryController));
exports.default = router;
