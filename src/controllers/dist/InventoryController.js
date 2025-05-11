"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.inventoryController = exports.InventoryController = void 0;
var InventoryRepository_1 = require("../repositories/InventoryRepository");
var fs_1 = require("fs");
var path_1 = require("path");
var data_source_1 = require("../config/data-source");
var User_1 = require("../entity/User");
var typeorm_1 = require("typeorm");
var UserRepository_1 = require("../repositories/UserRepository");
var InventoryController = /** @class */ (function () {
    function InventoryController() {
    }
    InventoryController.prototype.createItem = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var item_1, file, requiredFields, missingFields, optionalFields, userIds, users, newItem, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        item_1 = req.body;
                        file = req.file;
                        // Si hay una imagen, agregar la ruta al vehículo
                        if (file) {
                            item_1.imagePath = file.filename;
                        }
                        requiredFields = ['itemName', 'category', 'quantity', 'condition'];
                        missingFields = requiredFields.filter(function (field) { return !item_1[field]; });
                        if (missingFields.length > 0) {
                            // Si hay error y se subió una imagen, eliminarla
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(400).json({
                                message: 'Faltan campos requeridos',
                                fields: missingFields
                            });
                            return [2 /*return*/];
                        }
                        optionalFields = [
                            'acquisitionDate',
                            'lastMaintenanceDate',
                            'nextMaintenanceDate',
                            'notes'
                        ];
                        optionalFields.forEach(function (field) {
                            if (item_1[field] === '' || item_1[field] === undefined) {
                                item_1[field] = null;
                            }
                        });
                        if (!item_1.responsibleUsers) return [3 /*break*/, 3];
                        // Si es un string, intentar parsearlo como JSON
                        if (typeof item_1.responsibleUsers === 'string') {
                            try {
                                item_1.responsibleUsers = JSON.parse(item_1.responsibleUsers);
                            }
                            catch (error) {
                                if (file) {
                                    fs_1["default"].unlinkSync(file.path);
                                }
                                res.status(400).json({
                                    message: 'Formato inválido para usuarios responsables'
                                });
                                return [2 /*return*/];
                            }
                        }
                        if (!Array.isArray(item_1.responsibleUsers)) return [3 /*break*/, 2];
                        userIds = item_1.responsibleUsers.map(function (user) { return user.id; });
                        return [4 /*yield*/, data_source_1.AppDataSource.getRepository(User_1.User).findBy({ id: typeorm_1.In(userIds) })];
                    case 1:
                        users = _a.sent();
                        if (users.length !== userIds.length) {
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(400).json({
                                message: 'Uno o más usuarios responsables no existen'
                            });
                            return [2 /*return*/];
                        }
                        item_1.responsibleUsers = users;
                        _a.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        if (item_1.responsibleUsers === null) {
                            // Si se envía null, significa que se quieren eliminar todos los responsables
                            item_1.responsibleUsers = [];
                        }
                        _a.label = 4;
                    case 4: return [4 /*yield*/, InventoryRepository_1.inventoryRepository.createItem(item_1)];
                    case 5:
                        newItem = _a.sent();
                        res.status(201).json(newItem);
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        // Si hay error y se subió una imagen, eliminarla
                        if (req.file) {
                            fs_1["default"].unlinkSync(req.file.path);
                        }
                        console.error('Error al crear el item:', error_1);
                        res.status(500).json({
                            message: 'Error al crear el item',
                            error: error_1 instanceof Error ? error_1.message : 'Error desconocido',
                            details: error_1
                        });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    InventoryController.prototype.getAllItems = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var items, itemsWithResponsibles, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.getAllItems()];
                    case 1:
                        items = _a.sent();
                        itemsWithResponsibles = items.map(function (item) {
                            var _a;
                            return (__assign(__assign({}, item), { responsibleUsers: ((_a = item.responsibleUsers) === null || _a === void 0 ? void 0 : _a.map(function (user) { return ({
                                    id: user.id,
                                    username: user.username,
                                    email: user.email,
                                    fullName: user.fullName,
                                    role: user.role,
                                    isActive: user.isActive
                                }); })) || [] }));
                        });
                        res.status(200).json(itemsWithResponsibles);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error(error_2);
                        res.status(500).json({ message: 'Error al obtener los items', error: error_2.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    InventoryController.prototype.getItem = function (req, res) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var id, item, itemWithFilteredResponsibles, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID de item inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.getItemById(id)];
                    case 1:
                        item = _b.sent();
                        if (!item) {
                            res.status(404).json({ message: 'Item no encontrado' });
                            return [2 /*return*/];
                        }
                        itemWithFilteredResponsibles = __assign(__assign({}, item), { responsibleUsers: ((_a = item.responsibleUsers) === null || _a === void 0 ? void 0 : _a.map(function (user) { return ({
                                id: user.id,
                                username: user.username,
                                email: user.email,
                                fullName: user.fullName,
                                role: user.role,
                                isActive: user.isActive
                            }); })) || [] });
                        res.status(200).json(itemWithFilteredResponsibles);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        console.error(error_3);
                        res.status(500).json({ message: 'Error al obtener el item', error: error_3.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    InventoryController.prototype.updateItem = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, item, file, existingItem, oldImagePath, userIds, users, updatedItem, error_4, filePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            if (req.file) {
                                fs_1["default"].unlinkSync(req.file.path);
                            }
                            res.status(400).json({ message: 'ID inválido' });
                            return [2 /*return*/];
                        }
                        item = req.body;
                        file = req.file;
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.getItemById(id)];
                    case 1:
                        existingItem = _a.sent();
                        if (!existingItem) {
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(404).json({ message: 'Item no encontrado' });
                            return [2 /*return*/];
                        }
                        // Si hay archivo cargado, guardar solo el nombre del archivo y eliminar la anterior
                        if (file) {
                            // Eliminar la imagen anterior si existe
                            if (existingItem.imagePath) {
                                oldImagePath = path_1["default"].join(__dirname, '..', '..', 'uploads', 'vehicles', existingItem.imagePath);
                                if (fs_1["default"].existsSync(oldImagePath)) {
                                    fs_1["default"].unlinkSync(oldImagePath);
                                }
                            }
                            // Solo guardar el nombre del archivo
                            item.imagePath = file.filename;
                        }
                        if (!item.responsibleUsers) return [3 /*break*/, 4];
                        // Si es un string, intentar parsearlo como JSON
                        if (typeof item.responsibleUsers === 'string') {
                            try {
                                item.responsibleUsers = JSON.parse(item.responsibleUsers);
                            }
                            catch (error) {
                                if (file) {
                                    fs_1["default"].unlinkSync(file.path);
                                }
                                res.status(400).json({
                                    message: 'Formato inválido para usuarios responsables'
                                });
                                return [2 /*return*/];
                            }
                        }
                        if (!Array.isArray(item.responsibleUsers)) return [3 /*break*/, 3];
                        userIds = item.responsibleUsers.map(function (user) { return user.id; });
                        return [4 /*yield*/, data_source_1.AppDataSource.getRepository(User_1.User).findBy({ id: typeorm_1.In(userIds) })];
                    case 2:
                        users = _a.sent();
                        if (users.length !== userIds.length) {
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(400).json({
                                message: 'Uno o más usuarios responsables no existen'
                            });
                            return [2 /*return*/];
                        }
                        item.responsibleUsers = users;
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        if (item.responsibleUsers === null) {
                            // Si se envía null, significa que se quieren eliminar todos los responsables
                            item.responsibleUsers = [];
                        }
                        _a.label = 5;
                    case 5: return [4 /*yield*/, InventoryRepository_1.inventoryRepository.updateItem(id, item)];
                    case 6:
                        updatedItem = _a.sent();
                        if (!updatedItem) {
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(404).json({ message: 'Item no encontrado' });
                            return [2 /*return*/];
                        }
                        res.status(200).json(updatedItem);
                        return [3 /*break*/, 8];
                    case 7:
                        error_4 = _a.sent();
                        // Si hay un error y se subió un archivo, intentar eliminarlo
                        if (req.file) {
                            try {
                                filePath = path_1["default"].join(process.cwd(), 'uploads', 'inventory', req.file.filename);
                                if (fs_1["default"].existsSync(filePath)) {
                                    fs_1["default"].unlinkSync(filePath);
                                    console.log("Archivo eliminado debido a error: " + filePath);
                                }
                            }
                            catch (err) {
                                console.error('Error al eliminar archivo tras fallo:', err);
                            }
                        }
                        console.error(error_4);
                        res.status(500).json({ message: 'Error al actualizar el item', error: error_4.message });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    InventoryController.prototype.deleteItem = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, itemToDelete, fullPath, deletedItem, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.getItemById(id)];
                    case 1:
                        itemToDelete = _a.sent();
                        if (!itemToDelete) {
                            res.status(404).json({ message: 'Item no encontrado' });
                            return [2 /*return*/];
                        }
                        // Eliminar la imagen si existe
                        if (itemToDelete.imagePath) {
                            try {
                                fullPath = path_1["default"].join(process.cwd(), 'uploads', 'inventory', itemToDelete.imagePath);
                                // Verificar si el archivo existe antes de intentar eliminarlo
                                if (fs_1["default"].existsSync(fullPath)) {
                                    fs_1["default"].unlinkSync(fullPath);
                                    console.log("Imagen eliminada: " + itemToDelete.imagePath);
                                }
                            }
                            catch (err) {
                                console.error('Error al eliminar la imagen:', err);
                                // Continuamos con la eliminación aunque no se haya podido eliminar la imagen
                            }
                        }
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.deleteItem(id)];
                    case 2:
                        deletedItem = _a.sent();
                        if (!deletedItem) {
                            res.status(404).json({ message: 'Item no encontrado' });
                            return [2 /*return*/];
                        }
                        res.status(200).json({ message: 'Item eliminado', item: deletedItem });
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error(error_5);
                        res.status(500).json({ message: 'Error al eliminar el item', error: error_5.message });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    InventoryController.prototype.updateItemImage = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, item, oldImagePath, updatedItem, error_6, filePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.getItemById(id)];
                    case 1:
                        item = _a.sent();
                        if (!item) {
                            res.status(404).json({ message: 'Item no encontrado' });
                            return [2 /*return*/];
                        }
                        if (!req.file) {
                            res.status(400).json({ message: 'No se proporcionó una imagen' });
                            return [2 /*return*/];
                        }
                        // Eliminar la imagen anterior si existe
                        if (item.imagePath) {
                            try {
                                oldImagePath = path_1["default"].join(process.cwd(), 'uploads', 'inventory', item.imagePath);
                                if (fs_1["default"].existsSync(oldImagePath)) {
                                    fs_1["default"].unlinkSync(oldImagePath);
                                    console.log("Imagen anterior eliminada: " + item.imagePath);
                                }
                            }
                            catch (err) {
                                console.error('Error al eliminar la imagen anterior:', err);
                            }
                        }
                        // Actualizar con la nueva imagen
                        item.imagePath = req.file.filename;
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.updateItem(id, item)];
                    case 2:
                        updatedItem = _a.sent();
                        res.status(200).json({
                            message: 'Imagen actualizada exitosamente',
                            item: updatedItem
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        console.error(error_6);
                        if (req.file) {
                            try {
                                filePath = path_1["default"].join(process.cwd(), 'uploads', 'inventory', req.file.filename);
                                if (fs_1["default"].existsSync(filePath)) {
                                    fs_1["default"].unlinkSync(filePath);
                                    console.log("Archivo eliminado debido a error: " + filePath);
                                }
                            }
                            catch (err) {
                                console.error('Error al eliminar archivo tras fallo:', err);
                            }
                        }
                        res.status(500).json({ message: 'Error al actualizar la imagen', error: error_6.message });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    InventoryController.prototype.deleteItemImage = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, item, imagePath, updatedItem, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.getItemById(id)];
                    case 1:
                        item = _a.sent();
                        if (!item) {
                            res.status(404).json({ message: 'Item no encontrado' });
                            return [2 /*return*/];
                        }
                        if (!item.imagePath) {
                            res.status(400).json({ message: 'El item no tiene una imagen' });
                            return [2 /*return*/];
                        }
                        // Eliminar la imagen
                        try {
                            imagePath = path_1["default"].join(process.cwd(), 'uploads', 'inventory', item.imagePath);
                            if (fs_1["default"].existsSync(imagePath)) {
                                fs_1["default"].unlinkSync(imagePath);
                                console.log("Imagen eliminada: " + item.imagePath);
                            }
                        }
                        catch (err) {
                            console.error('Error al eliminar la imagen:', err);
                        }
                        // Actualizar el item para eliminar la referencia a la imagen
                        item.imagePath = null;
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.updateItem(id, item)];
                    case 2:
                        updatedItem = _a.sent();
                        res.status(200).json({
                            message: 'Imagen eliminada exitosamente',
                            item: updatedItem
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        console.error(error_7);
                        res.status(500).json({ message: 'Error al eliminar la imagen', error: error_7.message });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    InventoryController.prototype.addResponsibleUser = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var itemId, userId_1, item, user, isAlreadyResponsible, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        itemId = parseInt(req.params.id, 10);
                        userId_1 = req.body.userId;
                        if (isNaN(itemId) || !userId_1) {
                            res.status(400).json({ message: 'ID de item y usuario requeridos' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.getItemById(itemId)];
                    case 1:
                        item = _a.sent();
                        if (!item) {
                            res.status(404).json({ message: 'Item no encontrado' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, UserRepository_1.userRepository.getUserById(userId_1)];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            res.status(404).json({ message: 'Usuario no encontrado' });
                            return [2 /*return*/];
                        }
                        isAlreadyResponsible = item.responsibleUsers.some(function (u) { return u.id === userId_1; });
                        if (isAlreadyResponsible) {
                            res.status(400).json({ message: 'El usuario ya es responsable de este item' });
                            return [2 /*return*/];
                        }
                        // Agregar el usuario como responsable
                        item.responsibleUsers.push(user);
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.updateItem(itemId, { responsibleUsers: item.responsibleUsers })];
                    case 3:
                        _a.sent();
                        res.status(200).json({
                            message: 'Usuario agregado como responsable exitosamente',
                            item: __assign(__assign({}, item), { responsibleUsers: item.responsibleUsers })
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_8 = _a.sent();
                        console.error('Error al agregar responsable:', error_8);
                        res.status(500).json({
                            message: 'Error en el servidor',
                            error: error_8.message
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    InventoryController.prototype.removeResponsibleUser = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var itemId, userId_2, item, userIndex, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        itemId = parseInt(req.params.id, 10);
                        userId_2 = req.body.userId;
                        if (isNaN(itemId) || !userId_2) {
                            res.status(400).json({ message: 'ID de item y usuario requeridos' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.getItemById(itemId)];
                    case 1:
                        item = _a.sent();
                        if (!item) {
                            res.status(404).json({ message: 'Item no encontrado' });
                            return [2 /*return*/];
                        }
                        userIndex = item.responsibleUsers.findIndex(function (u) { return u.id === userId_2; });
                        if (userIndex === -1) {
                            res.status(400).json({ message: 'El usuario no es responsable de este item' });
                            return [2 /*return*/];
                        }
                        // Remover el usuario de los responsables
                        item.responsibleUsers.splice(userIndex, 1);
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.updateItem(itemId, { responsibleUsers: item.responsibleUsers })];
                    case 2:
                        _a.sent();
                        res.status(200).json({
                            message: 'Usuario removido como responsable exitosamente',
                            item: __assign(__assign({}, item), { responsibleUsers: item.responsibleUsers })
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _a.sent();
                        console.error('Error al remover responsable:', error_9);
                        res.status(500).json({
                            message: 'Error en el servidor',
                            error: error_9.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    InventoryController.prototype.getResponsibleUsers = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var itemId, item, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        itemId = parseInt(req.params.id, 10);
                        if (isNaN(itemId)) {
                            res.status(400).json({ message: 'ID de item inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.getItemById(itemId)];
                    case 1:
                        item = _a.sent();
                        if (!item) {
                            res.status(404).json({ message: 'Item no encontrado' });
                            return [2 /*return*/];
                        }
                        res.status(200).json({
                            message: 'Responsables del item obtenidos exitosamente',
                            responsibleUsers: item.responsibleUsers
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        console.error('Error al obtener responsables:', error_10);
                        res.status(500).json({
                            message: 'Error en el servidor',
                            error: error_10.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return InventoryController;
}());
exports.InventoryController = InventoryController;
exports.inventoryController = new InventoryController();
