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
exports.initialize = exports.AppDataSource = void 0;
require("reflect-metadata");
var typeorm_1 = require("typeorm");
require("dotenv/config");
var User_1 = require("../entity/User");
var Vehicle_1 = require("../entity/Vehicle");
var Inventory_1 = require("../entity/Inventory");
var Movement_1 = require("../entity/Movement");
var Category_1 = require("../entity/Category");
var InventoryProject_1 = require("../entity/InventoryProject");
var Project_1 = require("../entity/Project");
var Maintenance_1 = require("../entity/Maintenance");
var Report_1 = require("../entity/Report");
var Comment_1 = require("../entity/Comment");
var Rental_1 = require("../entity/Rental");
var path_1 = require("path");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: true,
    entities: [
        path_1["default"].join(__dirname, '..', 'entity', '*.{ts,js}'),
        User_1.User,
        Vehicle_1.Vehicle,
        Inventory_1.Inventory,
        Movement_1.Movement,
        Category_1.Category,
        InventoryProject_1.InventoryProject,
        Project_1.Project,
        Maintenance_1.Maintenance,
        Report_1.Report,
        Comment_1.Comment,
        Rental_1.Rental
    ],
    migrations: [],
    subscribers: [],
    charset: "utf8mb4"
});
exports.initialize = function () { return __awaiter(void 0, void 0, Promise, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                if (!!exports.AppDataSource.isInitialized) return [3 /*break*/, 2];
                return [4 /*yield*/, exports.AppDataSource.initialize()];
            case 1:
                _a.sent();
                console.log('Base de datos MySQL conectada con TypeORM');
                _a.label = 2;
            case 2: return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('Error al conectar la base de datos:', error_1);
                process.exit(1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
