"use strict";
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
exports.rentalController = exports.RentalController = void 0;
var RentalRepository_1 = require("../repositories/RentalRepository");
var InventoryRepository_1 = require("../repositories/InventoryRepository");
var RentalController = /** @class */ (function () {
    function RentalController() {
    }
    // Crear un nuevo alquiler
    RentalController.prototype.createRental = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var rentalRepository, rental_1, requiredFields, missingFields, startDate, endDate, object, diffTime, diffDays, calculatedTotal, newRental, rentalWithObject, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, RentalRepository_1.getRentalRepository()];
                    case 1:
                        rentalRepository = _a.sent();
                        rental_1 = req.body;
                        requiredFields = ['objectId', 'startDate', 'endDate', 'dailyCost', 'total'];
                        missingFields = requiredFields.filter(function (field) { return !rental_1[field]; });
                        if (missingFields.length > 0) {
                            res.status(400).json({
                                message: 'Faltan campos requeridos',
                                fields: missingFields
                            });
                            return [2 /*return*/];
                        }
                        startDate = new Date(rental_1.startDate);
                        endDate = new Date(rental_1.endDate);
                        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                            res.status(400).json({ message: 'Fechas inválidas' });
                            return [2 /*return*/];
                        }
                        if (startDate >= endDate) {
                            res.status(400).json({ message: 'La fecha de inicio debe ser anterior a la fecha de fin' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.getItemById(rental_1.objectId)];
                    case 2:
                        object = _a.sent();
                        if (!object) {
                            res.status(404).json({ message: 'Objeto no encontrado' });
                            return [2 /*return*/];
                        }
                        diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                        calculatedTotal = parseFloat(rental_1.dailyCost) * diffDays;
                        if (!rental_1.total || Math.abs(calculatedTotal - parseFloat(rental_1.total)) > 0.01) {
                            rental_1.total = calculatedTotal;
                        }
                        return [4 /*yield*/, rentalRepository.createRental({
                                objectId: rental_1.objectId,
                                startDate: startDate,
                                endDate: endDate,
                                dailyCost: parseFloat(rental_1.dailyCost),
                                peopleCount: rental_1.peopleCount ? parseInt(rental_1.peopleCount, 10) : null,
                                total: parseFloat(rental_1.total)
                            })];
                    case 3:
                        newRental = _a.sent();
                        return [4 /*yield*/, rentalRepository.getRentalById(newRental.id)];
                    case 4:
                        rentalWithObject = _a.sent();
                        res.status(201).json(rentalWithObject);
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error('Error al crear el alquiler:', error_1);
                        res.status(500).json({
                            message: 'Error al crear el alquiler',
                            error: error_1 instanceof Error ? error_1.message : 'Error desconocido'
                        });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // Obtener todos los alquileres
    RentalController.prototype.getAllRentals = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var rentalRepository, rentals, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, RentalRepository_1.getRentalRepository()];
                    case 1:
                        rentalRepository = _a.sent();
                        return [4 /*yield*/, rentalRepository.getAllRentals()];
                    case 2:
                        rentals = _a.sent();
                        res.status(200).json(rentals);
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error al obtener los alquileres:', error_2);
                        res.status(500).json({
                            message: 'Error al obtener los alquileres',
                            error: error_2 instanceof Error ? error_2.message : 'Error desconocido'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Obtener un alquiler por ID
    RentalController.prototype.getRental = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, rentalRepository, rental, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID de alquiler inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, RentalRepository_1.getRentalRepository()];
                    case 1:
                        rentalRepository = _a.sent();
                        return [4 /*yield*/, rentalRepository.getRentalById(id)];
                    case 2:
                        rental = _a.sent();
                        if (!rental) {
                            res.status(404).json({ message: 'Alquiler no encontrado' });
                            return [2 /*return*/];
                        }
                        res.status(200).json(rental);
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error al obtener el alquiler:', error_3);
                        res.status(500).json({
                            message: 'Error al obtener el alquiler',
                            error: error_3 instanceof Error ? error_3.message : 'Error desconocido'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Actualizar un alquiler
    RentalController.prototype.updateRental = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, rental, rentalRepository, existingRental, startDate, endDate, object, updatedRental, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID de alquiler inválido' });
                            return [2 /*return*/];
                        }
                        rental = req.body;
                        return [4 /*yield*/, RentalRepository_1.getRentalRepository()];
                    case 1:
                        rentalRepository = _a.sent();
                        return [4 /*yield*/, rentalRepository.getRentalById(id)];
                    case 2:
                        existingRental = _a.sent();
                        if (!existingRental) {
                            res.status(404).json({ message: 'Alquiler no encontrado' });
                            return [2 /*return*/];
                        }
                        // Validar fechas si se proporcionan
                        if (rental.startDate || rental.endDate) {
                            startDate = rental.startDate ? new Date(rental.startDate) : existingRental.startDate;
                            endDate = rental.endDate ? new Date(rental.endDate) : existingRental.endDate;
                            if (startDate >= endDate) {
                                res.status(400).json({ message: 'La fecha de inicio debe ser anterior a la fecha de fin' });
                                return [2 /*return*/];
                            }
                        }
                        if (!(rental.objectId && rental.objectId !== existingRental.objectId)) return [3 /*break*/, 4];
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.getItemById(rental.objectId)];
                    case 3:
                        object = _a.sent();
                        if (!object) {
                            res.status(404).json({ message: 'Objeto no encontrado' });
                            return [2 /*return*/];
                        }
                        _a.label = 4;
                    case 4: return [4 /*yield*/, rentalRepository.updateRental(id, rental)];
                    case 5:
                        updatedRental = _a.sent();
                        res.status(200).json(updatedRental);
                        return [3 /*break*/, 7];
                    case 6:
                        error_4 = _a.sent();
                        console.error('Error al actualizar el alquiler:', error_4);
                        res.status(500).json({
                            message: 'Error al actualizar el alquiler',
                            error: error_4 instanceof Error ? error_4.message : 'Error desconocido'
                        });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // Eliminar un alquiler
    RentalController.prototype.deleteRental = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, rentalRepository, rental, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID de alquiler inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, RentalRepository_1.getRentalRepository()];
                    case 1:
                        rentalRepository = _a.sent();
                        return [4 /*yield*/, rentalRepository.getRentalById(id)];
                    case 2:
                        rental = _a.sent();
                        if (!rental) {
                            res.status(404).json({ message: 'Alquiler no encontrado' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, rentalRepository.deleteRental(id)];
                    case 3:
                        _a.sent();
                        res.status(200).json({
                            message: 'Alquiler eliminado correctamente',
                            id: id
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        console.error('Error al eliminar el alquiler:', error_5);
                        res.status(500).json({
                            message: 'Error al eliminar el alquiler',
                            error: error_5 instanceof Error ? error_5.message : 'Error desconocido'
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Obtener alquileres por objeto
    RentalController.prototype.getRentalsByObject = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var objectId, object, rentalRepository, rentals, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        objectId = parseInt(req.params.objectId, 10);
                        if (isNaN(objectId)) {
                            res.status(400).json({ message: 'ID de objeto inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, InventoryRepository_1.inventoryRepository.getItemById(objectId)];
                    case 1:
                        object = _a.sent();
                        if (!object) {
                            res.status(404).json({ message: 'Objeto no encontrado' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, RentalRepository_1.getRentalRepository()];
                    case 2:
                        rentalRepository = _a.sent();
                        return [4 /*yield*/, rentalRepository.getRentalsByObject(objectId)];
                    case 3:
                        rentals = _a.sent();
                        res.status(200).json(rentals);
                        return [3 /*break*/, 5];
                    case 4:
                        error_6 = _a.sent();
                        console.error('Error al obtener los alquileres del objeto:', error_6);
                        res.status(500).json({
                            message: 'Error al obtener los alquileres del objeto',
                            error: error_6 instanceof Error ? error_6.message : 'Error desconocido'
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Obtener alquileres por rango de fechas
    RentalController.prototype.getRentalsByDateRange = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var _a, startDate, endDate, start, end, rentalRepository, rentals, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
                        if (!startDate || !endDate) {
                            res.status(400).json({ message: 'Se requieren startDate y endDate' });
                            return [2 /*return*/];
                        }
                        start = new Date(startDate);
                        end = new Date(endDate);
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                            res.status(400).json({ message: 'Fechas inválidas' });
                            return [2 /*return*/];
                        }
                        if (start > end) {
                            res.status(400).json({ message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, RentalRepository_1.getRentalRepository()];
                    case 1:
                        rentalRepository = _b.sent();
                        return [4 /*yield*/, rentalRepository.getRentalsByDateRange(start, end)];
                    case 2:
                        rentals = _b.sent();
                        res.status(200).json(rentals);
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _b.sent();
                        console.error('Error al obtener los alquileres por rango de fechas:', error_7);
                        res.status(500).json({
                            message: 'Error al obtener los alquileres por rango de fechas',
                            error: error_7 instanceof Error ? error_7.message : 'Error desconocido'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return RentalController;
}());
exports.RentalController = RentalController;
exports.rentalController = new RentalController();
