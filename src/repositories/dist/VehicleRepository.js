"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.vehicleRepository = exports.VehicleRepository = void 0;
var typeorm_1 = require("typeorm");
var data_source_1 = require("../config/data-source");
var Vehicle_1 = require("../entity/Vehicle");
var User_1 = require("../entity/User");
var VehicleRepository = /** @class */ (function (_super) {
    __extends(VehicleRepository, _super);
    function VehicleRepository() {
        return _super.call(this, Vehicle_1.Vehicle, data_source_1.AppDataSource.createEntityManager()) || this;
    }
    VehicleRepository.prototype.createVehicle = function (vehicle) {
        return __awaiter(this, void 0, Promise, function () {
            var newVehicle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newVehicle = this.create({
                            licensePlate: vehicle.licensePlate,
                            brand: vehicle.brand,
                            model: vehicle.model,
                            year: vehicle.year,
                            vin: vehicle.vin || null,
                            color: vehicle.color || null,
                            vehicleStatus: vehicle.vehicleStatus,
                            mileage: vehicle.mileage || null,
                            fuelType: vehicle.fuelType,
                            insuranceExpiryDate: vehicle.insuranceExpiryDate || null,
                            technicalRevisionExpiryDate: vehicle.technicalRevisionExpiryDate || null,
                            notes: vehicle.notes || null,
                            imagePath: vehicle.imagePath || null,
                            responsibleUsers: vehicle.responsibleUsers || []
                        });
                        return [4 /*yield*/, this.save(newVehicle)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VehicleRepository.prototype.getAllVehicles = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.find({
                            relations: {
                                responsibleUsers: true
                            },
                            order: {
                                brand: 'ASC',
                                model: 'ASC'
                            }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VehicleRepository.prototype.getVehicleById = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({
                            where: { id: id },
                            relations: {
                                responsibleUsers: true
                            }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VehicleRepository.prototype.getVehicleByLicensePlate = function (licensePlate) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({
                            where: { licensePlate: licensePlate }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VehicleRepository.prototype.getVehicleByVin = function (vin) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({
                            where: { vin: vin }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VehicleRepository.prototype.updateVehicle = function (id, vehicle) {
        return __awaiter(this, void 0, Promise, function () {
            var existingVehicle, userRepository, users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({
                            where: { id: id },
                            relations: {
                                responsibleUsers: true
                            }
                        })];
                    case 1:
                        existingVehicle = _a.sent();
                        if (!existingVehicle) {
                            return [2 /*return*/, null];
                        }
                        // Actualizar propiedades si existen en el DTO
                        if (vehicle.licensePlate !== undefined)
                            existingVehicle.licensePlate = vehicle.licensePlate;
                        if (vehicle.brand !== undefined)
                            existingVehicle.brand = vehicle.brand;
                        if (vehicle.model !== undefined)
                            existingVehicle.model = vehicle.model;
                        if (vehicle.year !== undefined)
                            existingVehicle.year = vehicle.year;
                        if (vehicle.vin !== undefined)
                            existingVehicle.vin = vehicle.vin;
                        if (vehicle.color !== undefined)
                            existingVehicle.color = vehicle.color;
                        if (vehicle.vehicleStatus !== undefined)
                            existingVehicle.vehicleStatus = vehicle.vehicleStatus;
                        if (vehicle.mileage !== undefined)
                            existingVehicle.mileage = vehicle.mileage;
                        if (vehicle.fuelType !== undefined)
                            existingVehicle.fuelType = vehicle.fuelType;
                        if (vehicle.insuranceExpiryDate !== undefined)
                            existingVehicle.insuranceExpiryDate = vehicle.insuranceExpiryDate;
                        if (vehicle.technicalRevisionExpiryDate !== undefined)
                            existingVehicle.technicalRevisionExpiryDate = vehicle.technicalRevisionExpiryDate;
                        if (vehicle.notes !== undefined)
                            existingVehicle.notes = vehicle.notes;
                        if (vehicle.imagePath !== undefined)
                            existingVehicle.imagePath = vehicle.imagePath;
                        if (!(vehicle.responsibleUsers !== undefined)) return [3 /*break*/, 3];
                        userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
                        return [4 /*yield*/, userRepository.findByIds(vehicle.responsibleUsers.map(function (u) { return u.id; }))];
                    case 2:
                        users = _a.sent();
                        existingVehicle.responsibleUsers = users;
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.save(existingVehicle)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VehicleRepository.prototype.deleteVehicle = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var vehicleToRemove;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({
                            where: { id: id }
                        })];
                    case 1:
                        vehicleToRemove = _a.sent();
                        if (!vehicleToRemove) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.remove(vehicleToRemove)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return VehicleRepository;
}(typeorm_1.Repository));
exports.VehicleRepository = VehicleRepository;
exports.vehicleRepository = new VehicleRepository();
