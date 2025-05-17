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
exports.rentalRepository = exports.RentalRepository = void 0;
var typeorm_1 = require("typeorm");
var data_source_1 = require("../config/data-source");
var Rental_1 = require("../entity/Rental");
var RentalRepository = /** @class */ (function (_super) {
    __extends(RentalRepository, _super);
    function RentalRepository() {
        return _super.call(this, Rental_1.Rental, data_source_1.AppDataSource.createEntityManager()) || this;
    }
    RentalRepository.prototype.createRental = function (rental) {
        return __awaiter(this, void 0, Promise, function () {
            var newRental;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newRental = this.create({
                            objectId: rental.objectId,
                            startDate: rental.startDate,
                            endDate: rental.endDate,
                            dailyCost: rental.dailyCost,
                            peopleCount: rental.peopleCount || null,
                            total: rental.total
                        });
                        return [4 /*yield*/, this.save(newRental)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RentalRepository.prototype.getAllRentals = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.find({
                            relations: {
                                object: true
                            },
                            order: {
                                createdAt: 'DESC'
                            }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RentalRepository.prototype.getRentalById = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({
                            where: { id: id },
                            relations: {
                                object: true
                            }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RentalRepository.prototype.updateRental = function (id, rental) {
        return __awaiter(this, void 0, Promise, function () {
            var existingRental;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({
                            where: { id: id },
                            relations: {
                                object: true
                            }
                        })];
                    case 1:
                        existingRental = _a.sent();
                        if (!existingRental) {
                            return [2 /*return*/, null];
                        }
                        Object.assign(existingRental, rental);
                        return [4 /*yield*/, this.save(existingRental)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RentalRepository.prototype.deleteRental = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var rentalToRemove;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({
                            where: { id: id },
                            relations: ['object']
                        })];
                    case 1:
                        rentalToRemove = _a.sent();
                        if (!rentalToRemove) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.remove(rentalToRemove)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RentalRepository.prototype.getRentalsByObject = function (objectId) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.find({
                            where: { objectId: objectId },
                            relations: {
                                object: true
                            },
                            order: {
                                startDate: 'ASC'
                            }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RentalRepository.prototype.getRentalsByDateRange = function (startDate, endDate) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.find({
                            where: [
                                // Alquileres que comienzan dentro del rango
                                { startDate: typeorm_1.Between(startDate, endDate) },
                                // Alquileres que terminan dentro del rango
                                { endDate: typeorm_1.Between(startDate, endDate) },
                                // Alquileres que abarcan todo el rango
                                {
                                    startDate: typeorm_1.LessThanOrEqual(startDate),
                                    endDate: typeorm_1.MoreThanOrEqual(endDate)
                                }
                            ],
                            relations: {
                                object: true
                            },
                            order: {
                                startDate: 'ASC'
                            }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return RentalRepository;
}(typeorm_1.Repository));
exports.RentalRepository = RentalRepository;
exports.rentalRepository = new RentalRepository();
