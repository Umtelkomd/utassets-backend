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
exports.inventoryRepository = exports.InventoryRepository = void 0;
var typeorm_1 = require("typeorm");
var data_source_1 = require("../config/data-source");
var Inventory_1 = require("../entity/Inventory");
var User_1 = require("../entity/User");
var InventoryRepository = /** @class */ (function (_super) {
    __extends(InventoryRepository, _super);
    function InventoryRepository() {
        return _super.call(this, Inventory_1.Inventory, data_source_1.AppDataSource.createEntityManager()) || this;
    }
    InventoryRepository.prototype.createItem = function (item) {
        return __awaiter(this, void 0, Promise, function () {
            var newItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newItem = this.create({
                            itemName: item.itemName,
                            itemCode: item.itemCode,
                            category: item.category,
                            quantity: item.quantity,
                            condition: item.condition,
                            location: item.location,
                            acquisitionDate: item.acquisitionDate || null,
                            lastMaintenanceDate: item.lastMaintenanceDate || null,
                            nextMaintenanceDate: item.nextMaintenanceDate || null,
                            notes: item.notes || null,
                            imagePath: item.imagePath || null,
                            responsibleUsers: item.responsibleUsers || []
                        });
                        return [4 /*yield*/, this.save(newItem)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    InventoryRepository.prototype.getAllItems = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.find({
                            relations: {
                                responsibleUsers: true
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
    InventoryRepository.prototype.getItemById = function (id) {
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
    InventoryRepository.prototype.updateItem = function (id, item) {
        return __awaiter(this, void 0, Promise, function () {
            var existingItem, userRepository, users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({
                            where: { id: id },
                            relations: {
                                responsibleUsers: true
                            }
                        })];
                    case 1:
                        existingItem = _a.sent();
                        if (!existingItem) {
                            return [2 /*return*/, null];
                        }
                        if (!(item.responsibleUsers !== undefined)) return [3 /*break*/, 3];
                        userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
                        return [4 /*yield*/, userRepository.findByIds(item.responsibleUsers.map(function (u) { return u.id; }))];
                    case 2:
                        users = _a.sent();
                        existingItem.responsibleUsers = users;
                        _a.label = 3;
                    case 3:
                        Object.assign(existingItem, item);
                        return [4 /*yield*/, this.save(existingItem)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    InventoryRepository.prototype.deleteItem = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var itemToRemove;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({
                            where: { id: id },
                            relations: ['responsibleUsers']
                        })];
                    case 1:
                        itemToRemove = _a.sent();
                        if (!itemToRemove) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.remove(itemToRemove)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return InventoryRepository;
}(typeorm_1.Repository));
exports.InventoryRepository = InventoryRepository;
exports.inventoryRepository = new InventoryRepository();
