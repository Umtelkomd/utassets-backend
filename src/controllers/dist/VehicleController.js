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
exports.vehicleController = exports.VehicleController = void 0;
var VehicleRepository_1 = require("../repositories/VehicleRepository");
var Vehicle_1 = require("../entity/Vehicle");
var data_source_1 = require("../config/data-source");
var fs_1 = require("fs");
var path_1 = require("path");
var UserRepository_1 = require("../repositories/UserRepository");
var User_1 = require("../entity/User");
var typeorm_1 = require("typeorm");
var VehicleController = /** @class */ (function () {
    function VehicleController() {
    }
    VehicleController.prototype.createVehicle = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var vehicle_1, file, requiredFields, missingFields, optionalFields, existingVehicleByPlate, existingVehicleByVin, userIds, users, newVehicle, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 10, , 11]);
                        vehicle_1 = req.body;
                        file = req.file;
                        // Si hay una imagen, agregar la ruta al vehículo
                        if (file) {
                            vehicle_1.imagePath = file.filename;
                        }
                        requiredFields = ['brand', 'model', 'year', 'licensePlate', 'vehicleStatus', 'fuelType'];
                        missingFields = requiredFields.filter(function (field) { return !vehicle_1[field]; });
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
                        optionalFields = ['vin', 'color', 'mileage', 'insuranceExpiryDate', 'notes'];
                        optionalFields.forEach(function (field) {
                            if (vehicle_1[field] === '' || vehicle_1[field] === undefined) {
                                vehicle_1[field] = null;
                            }
                        });
                        // Convertir strings a números si es necesario
                        if (typeof vehicle_1.year === 'string') {
                            vehicle_1.year = parseInt(vehicle_1.year, 10);
                        }
                        if (typeof vehicle_1.mileage === 'string' && vehicle_1.mileage) {
                            vehicle_1.mileage = parseInt(vehicle_1.mileage, 10);
                        }
                        // Verificar que los enums sean válidos
                        if (vehicle_1.vehicleStatus && !Object.values(Vehicle_1.VehicleStatus).includes(vehicle_1.vehicleStatus)) {
                            // Si hay error y se subió una imagen, eliminarla
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(400).json({
                                message: 'Estado de vehículo inválido',
                                validValues: Object.values(Vehicle_1.VehicleStatus)
                            });
                            return [2 /*return*/];
                        }
                        if (vehicle_1.fuelType && !Object.values(Vehicle_1.FuelType).includes(vehicle_1.fuelType)) {
                            // Si hay error y se subió una imagen, eliminarla
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(400).json({
                                message: 'Tipo de combustible inválido',
                                validValues: Object.values(Vehicle_1.FuelType)
                            });
                            return [2 /*return*/];
                        }
                        // Convertir fecha a objeto Date si viene como string
                        if (typeof vehicle_1.insuranceExpiryDate === 'string' && vehicle_1.insuranceExpiryDate) {
                            vehicle_1.insuranceExpiryDate = new Date(vehicle_1.insuranceExpiryDate);
                        }
                        if (!vehicle_1.licensePlate) return [3 /*break*/, 2];
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.getVehicleByLicensePlate(vehicle_1.licensePlate)];
                    case 1:
                        existingVehicleByPlate = _a.sent();
                        if (existingVehicleByPlate) {
                            // Si hay error y se subió una imagen, eliminarla
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(400).json({
                                message: 'Ya existe un vehículo con esa placa',
                                existingVehicle: existingVehicleByPlate
                            });
                            return [2 /*return*/];
                        }
                        _a.label = 2;
                    case 2:
                        if (!vehicle_1.vin) return [3 /*break*/, 4];
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.getVehicleByVin(vehicle_1.vin)];
                    case 3:
                        existingVehicleByVin = _a.sent();
                        if (existingVehicleByVin) {
                            // Si hay error y se subió una imagen, eliminarla
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(400).json({
                                message: 'Ya existe un vehículo con ese VIN',
                                existingVehicle: existingVehicleByVin
                            });
                            return [2 /*return*/];
                        }
                        _a.label = 4;
                    case 4:
                        if (!vehicle_1.responsibleUsers) return [3 /*break*/, 7];
                        // Si es un string, intentar parsearlo como JSON
                        if (typeof vehicle_1.responsibleUsers === 'string') {
                            try {
                                vehicle_1.responsibleUsers = JSON.parse(vehicle_1.responsibleUsers);
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
                        if (!Array.isArray(vehicle_1.responsibleUsers)) return [3 /*break*/, 6];
                        userIds = vehicle_1.responsibleUsers.map(function (user) { return user.id; });
                        return [4 /*yield*/, data_source_1.AppDataSource.getRepository(User_1.User).findBy({ id: typeorm_1.In(userIds) })];
                    case 5:
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
                        vehicle_1.responsibleUsers = users;
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        if (vehicle_1.responsibleUsers === null) {
                            // Si se envía null, significa que se quieren eliminar todos los responsables
                            vehicle_1.responsibleUsers = [];
                        }
                        _a.label = 8;
                    case 8:
                        console.log('Creando vehículo:', vehicle_1);
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.createVehicle(vehicle_1)];
                    case 9:
                        newVehicle = _a.sent();
                        console.log('Vehículo creado:', newVehicle);
                        res.status(201).json({
                            message: 'Vehículo creado exitosamente',
                            vehicle: newVehicle
                        });
                        return [3 /*break*/, 11];
                    case 10:
                        error_1 = _a.sent();
                        // Si hay error y se subió una imagen, eliminarla
                        if (req.file) {
                            fs_1["default"].unlinkSync(req.file.path);
                        }
                        console.error('Error al crear el vehículo:', error_1);
                        res.status(500).json({
                            message: 'Error al crear el vehículo',
                            error: error_1 instanceof Error ? error_1.message : 'Error desconocido',
                            details: error_1
                        });
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    VehicleController.prototype.getAllVehicles = function (_req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var vehicles, vehiclesWithResponsibles, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.getAllVehicles()];
                    case 1:
                        vehicles = _a.sent();
                        vehiclesWithResponsibles = vehicles.map(function (vehicle) {
                            var _a;
                            return (__assign(__assign({}, vehicle), { responsibleUsers: ((_a = vehicle.responsibleUsers) === null || _a === void 0 ? void 0 : _a.map(function (user) { return ({
                                    id: user.id,
                                    username: user.username,
                                    email: user.email,
                                    fullName: user.fullName,
                                    role: user.role,
                                    isActive: user.isActive
                                }); })) || [] }));
                        });
                        res.status(200).json(vehiclesWithResponsibles);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error(error_2);
                        res.status(500).json({ message: 'Error al obtener los vehículos', error: error_2.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    VehicleController.prototype.getVehicle = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, vehicle, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID de vehículo inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.getVehicleById(id)];
                    case 1:
                        vehicle = _a.sent();
                        if (!vehicle) {
                            res.status(404).json({ message: 'Vehículo no encontrado' });
                            return [2 /*return*/];
                        }
                        res.status(200).json(vehicle);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error(error_3);
                        res.status(500).json({ message: 'Error al obtener el vehículo', error: error_3.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    VehicleController.prototype.updateVehicle = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, vehicle, file, existingVehicle, oldImagePath, existingVehicleByPlate, existingVehicleByVin, userIds, users, updatedVehicle, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 11, , 12]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            if (req.file) {
                                fs_1["default"].unlinkSync(req.file.path);
                            }
                            res.status(400).json({ message: 'ID de vehículo inválido' });
                            return [2 /*return*/];
                        }
                        vehicle = req.body;
                        file = req.file;
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.getVehicleById(id)];
                    case 1:
                        existingVehicle = _a.sent();
                        if (!existingVehicle) {
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(404).json({ message: 'Vehículo no encontrado' });
                            return [2 /*return*/];
                        }
                        // Si hay una nueva imagen
                        if (file) {
                            // Eliminar la imagen anterior si existe
                            if (existingVehicle.imagePath) {
                                oldImagePath = path_1["default"].join(__dirname, '..', '..', 'uploads', 'vehicles', existingVehicle.imagePath);
                                if (fs_1["default"].existsSync(oldImagePath)) {
                                    fs_1["default"].unlinkSync(oldImagePath);
                                }
                            }
                            // Solo guardar el nombre del archivo
                            vehicle.imagePath = file.filename;
                        }
                        // Convertir strings a números si es necesario
                        if (typeof vehicle.year === 'string' && vehicle.year) {
                            vehicle.year = parseInt(vehicle.year, 10);
                        }
                        if (typeof vehicle.mileage === 'string' && vehicle.mileage) {
                            vehicle.mileage = parseInt(vehicle.mileage, 10);
                        }
                        // Verificar que los enums sean válidos
                        if (vehicle.vehicleStatus && !Object.values(Vehicle_1.VehicleStatus).includes(vehicle.vehicleStatus)) {
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(400).json({ message: 'Estado de vehículo inválido' });
                            return [2 /*return*/];
                        }
                        if (vehicle.fuelType && !Object.values(Vehicle_1.FuelType).includes(vehicle.fuelType)) {
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(400).json({ message: 'Tipo de combustible inválido' });
                            return [2 /*return*/];
                        }
                        // Convertir fecha a objeto Date si viene como string
                        if (typeof vehicle.insuranceExpiryDate === 'string' && vehicle.insuranceExpiryDate) {
                            vehicle.insuranceExpiryDate = new Date(vehicle.insuranceExpiryDate);
                        }
                        if (!vehicle.licensePlate) return [3 /*break*/, 3];
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.getVehicleByLicensePlate(vehicle.licensePlate)];
                    case 2:
                        existingVehicleByPlate = _a.sent();
                        if (existingVehicleByPlate && existingVehicleByPlate.id !== id) {
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(400).json({ message: 'Ya existe otro vehículo con esa placa' });
                            return [2 /*return*/];
                        }
                        _a.label = 3;
                    case 3:
                        if (!vehicle.vin) return [3 /*break*/, 5];
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.getVehicleByVin(vehicle.vin)];
                    case 4:
                        existingVehicleByVin = _a.sent();
                        if (existingVehicleByVin && existingVehicleByVin.id !== id) {
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(400).json({ message: 'Ya existe otro vehículo con ese VIN' });
                            return [2 /*return*/];
                        }
                        _a.label = 5;
                    case 5:
                        console.log(vehicle, 'vehicle');
                        if (!vehicle.responsibleUsers) return [3 /*break*/, 8];
                        // Si es un string, intentar parsearlo como JSON
                        if (typeof vehicle.responsibleUsers === 'string') {
                            try {
                                vehicle.responsibleUsers = JSON.parse(vehicle.responsibleUsers);
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
                        if (!Array.isArray(vehicle.responsibleUsers)) return [3 /*break*/, 7];
                        userIds = vehicle.responsibleUsers.map(function (user) { return user.id; });
                        return [4 /*yield*/, data_source_1.AppDataSource.getRepository(User_1.User).findBy({ id: typeorm_1.In(userIds) })];
                    case 6:
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
                        vehicle.responsibleUsers = users;
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        if (vehicle.responsibleUsers === null) {
                            // Si se envía null, significa que se quieren eliminar todos los responsables
                            vehicle.responsibleUsers = [];
                        }
                        _a.label = 9;
                    case 9: return [4 /*yield*/, VehicleRepository_1.vehicleRepository.updateVehicle(id, vehicle)];
                    case 10:
                        updatedVehicle = _a.sent();
                        if (!updatedVehicle) {
                            if (file) {
                                fs_1["default"].unlinkSync(file.path);
                            }
                            res.status(404).json({ message: 'Vehículo no encontrado' });
                            return [2 /*return*/];
                        }
                        res.status(200).json(updatedVehicle);
                        return [3 /*break*/, 12];
                    case 11:
                        error_4 = _a.sent();
                        if (req.file) {
                            fs_1["default"].unlinkSync(req.file.path);
                        }
                        console.error(error_4);
                        res.status(500).json({ message: 'Error al actualizar el vehículo', error: error_4.message });
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    VehicleController.prototype.deleteVehicle = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, vehicleToDelete, deletedVehicle, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID de vehículo inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.getVehicleById(id)];
                    case 1:
                        vehicleToDelete = _a.sent();
                        if (!vehicleToDelete) {
                            res.status(404).json({ message: 'Vehículo no encontrado' });
                            return [2 /*return*/];
                        }
                        // Eliminar la imagen si existe
                        if (vehicleToDelete.imagePath && fs_1["default"].existsSync(vehicleToDelete.imagePath)) {
                            fs_1["default"].unlinkSync(vehicleToDelete.imagePath);
                        }
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.deleteVehicle(id)];
                    case 2:
                        deletedVehicle = _a.sent();
                        if (!deletedVehicle) {
                            res.status(404).json({ message: 'Vehículo no encontrado' });
                            return [2 /*return*/];
                        }
                        res.status(200).json({ message: 'Vehículo eliminado', vehicle: deletedVehicle });
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error(error_5);
                        res.status(500).json({ message: 'Error al eliminar el vehículo', error: error_5.message });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VehicleController.prototype.updateVehicleImage = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, file, vehicle, oldImagePath, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = parseInt(req.params.id, 10);
                        file = req.file;
                        if (!file) {
                            res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.getVehicleById(id)];
                    case 1:
                        vehicle = _a.sent();
                        if (!vehicle) {
                            // Si no se encuentra el vehículo, eliminar la imagen subida
                            fs_1["default"].unlinkSync(file.path);
                            res.status(404).json({ message: 'Vehículo no encontrado' });
                            return [2 /*return*/];
                        }
                        // Si el vehículo ya tiene una imagen, eliminarla
                        if (vehicle.imagePath) {
                            oldImagePath = path_1["default"].join(process.cwd(), 'uploads', 'vehicles', vehicle.imagePath);
                            console.log('Intentando eliminar imagen anterior:', oldImagePath);
                            if (fs_1["default"].existsSync(oldImagePath)) {
                                fs_1["default"].unlinkSync(oldImagePath);
                                console.log('Imagen anterior eliminada exitosamente');
                            }
                            else {
                                console.log('No se encontró la imagen anterior en:', oldImagePath);
                            }
                        }
                        // Actualizar la ruta de la imagen en el vehículo
                        vehicle.imagePath = file.filename;
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.updateVehicle(id, { imagePath: vehicle.imagePath })];
                    case 2:
                        _a.sent();
                        res.status(200).json({
                            message: 'Imagen del vehículo actualizada exitosamente',
                            vehicle: __assign(__assign({}, vehicle), { imagePath: vehicle.imagePath })
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        // Si hay un error, eliminar la imagen subida
                        if (req.file) {
                            fs_1["default"].unlinkSync(req.file.path);
                        }
                        console.error('Error al actualizar la imagen del vehículo:', error_6);
                        res.status(500).json({
                            message: 'Error en el servidor',
                            error: error_6.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VehicleController.prototype.deleteVehicleImage = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, vehicle, imagePath, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = parseInt(req.params.id, 10);
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.getVehicleById(id)];
                    case 1:
                        vehicle = _a.sent();
                        if (!vehicle) {
                            res.status(404).json({ message: 'Vehículo no encontrado' });
                            return [2 /*return*/];
                        }
                        if (!vehicle.imagePath) {
                            res.status(400).json({ message: 'El vehículo no tiene una imagen para eliminar' });
                            return [2 /*return*/];
                        }
                        imagePath = path_1["default"].join(__dirname, '..', '..', 'uploads', 'vehicle', vehicle.imagePath);
                        if (fs_1["default"].existsSync(imagePath)) {
                            fs_1["default"].unlinkSync(imagePath);
                        }
                        // Actualizar el vehículo para eliminar la referencia a la imagen
                        vehicle.imagePath = null;
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.updateVehicle(id, { imagePath: null })];
                    case 2:
                        _a.sent();
                        res.status(200).json({
                            message: 'Imagen del vehículo eliminada exitosamente',
                            vehicle: __assign(__assign({}, vehicle), { imagePath: null })
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        console.error('Error al eliminar la imagen del vehículo:', error_7);
                        res.status(500).json({
                            message: 'Error en el servidor',
                            error: error_7.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VehicleController.prototype.addResponsibleUser = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var vehicleId, userId_1, vehicle, user, isAlreadyResponsible, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        vehicleId = parseInt(req.params.id, 10);
                        userId_1 = req.body.userId;
                        if (isNaN(vehicleId) || !userId_1) {
                            res.status(400).json({ message: 'ID de vehículo y usuario requeridos' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.getVehicleById(vehicleId)];
                    case 1:
                        vehicle = _a.sent();
                        if (!vehicle) {
                            res.status(404).json({ message: 'Vehículo no encontrado' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, UserRepository_1.userRepository.getUserById(userId_1)];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            res.status(404).json({ message: 'Usuario no encontrado' });
                            return [2 /*return*/];
                        }
                        isAlreadyResponsible = vehicle.responsibleUsers.some(function (u) { return u.id === userId_1; });
                        if (isAlreadyResponsible) {
                            res.status(400).json({ message: 'El usuario ya es responsable de este vehículo' });
                            return [2 /*return*/];
                        }
                        // Agregar el usuario como responsable
                        vehicle.responsibleUsers.push(user);
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.updateVehicle(vehicleId, { responsibleUsers: vehicle.responsibleUsers })];
                    case 3:
                        _a.sent();
                        res.status(200).json({
                            message: 'Usuario agregado como responsable exitosamente',
                            vehicle: __assign(__assign({}, vehicle), { responsibleUsers: vehicle.responsibleUsers })
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
    VehicleController.prototype.removeResponsibleUser = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var vehicleId, userId_2, vehicle, userIndex, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        vehicleId = parseInt(req.params.id, 10);
                        userId_2 = req.body.userId;
                        if (isNaN(vehicleId) || !userId_2) {
                            res.status(400).json({ message: 'ID de vehículo y usuario requeridos' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.getVehicleById(vehicleId)];
                    case 1:
                        vehicle = _a.sent();
                        if (!vehicle) {
                            res.status(404).json({ message: 'Vehículo no encontrado' });
                            return [2 /*return*/];
                        }
                        userIndex = vehicle.responsibleUsers.findIndex(function (u) { return u.id === userId_2; });
                        if (userIndex === -1) {
                            res.status(400).json({ message: 'El usuario no es responsable de este vehículo' });
                            return [2 /*return*/];
                        }
                        // Remover el usuario de los responsables
                        vehicle.responsibleUsers.splice(userIndex, 1);
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.updateVehicle(vehicleId, { responsibleUsers: vehicle.responsibleUsers })];
                    case 2:
                        _a.sent();
                        res.status(200).json({
                            message: 'Usuario removido como responsable exitosamente',
                            vehicle: __assign(__assign({}, vehicle), { responsibleUsers: vehicle.responsibleUsers })
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
    VehicleController.prototype.getResponsibleUsers = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var vehicleId, vehicle, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        vehicleId = parseInt(req.params.id, 10);
                        if (isNaN(vehicleId)) {
                            res.status(400).json({ message: 'ID de vehículo inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, VehicleRepository_1.vehicleRepository.getVehicleById(vehicleId)];
                    case 1:
                        vehicle = _a.sent();
                        if (!vehicle) {
                            res.status(404).json({ message: 'Vehículo no encontrado' });
                            return [2 /*return*/];
                        }
                        res.status(200).json({
                            message: 'Responsables del vehículo obtenidos exitosamente',
                            responsibleUsers: vehicle.responsibleUsers
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
    return VehicleController;
}());
exports.VehicleController = VehicleController;
exports.vehicleController = new VehicleController();
