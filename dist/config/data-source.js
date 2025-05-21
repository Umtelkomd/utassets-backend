"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
require("dotenv/config");
const User_1 = require("../entity/User");
const Vehicle_1 = require("../entity/Vehicle");
const Inventory_1 = require("../entity/Inventory");
const Movement_1 = require("../entity/Movement");
const Category_1 = require("../entity/Category");
const InventoryProject_1 = require("../entity/InventoryProject");
const Project_1 = require("../entity/Project");
const Maintenance_1 = require("../entity/Maintenance");
const Report_1 = require("../entity/Report");
const Comment_1 = require("../entity/Comment");
const Rental_1 = require("../entity/Rental");
const Housing_1 = require("../entity/Housing");
const path_1 = __importDefault(require("path"));
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME || "u743347598_utassets",
    password: process.env.DB_PASSWORD || "YourStrongPassword123",
    database: process.env.DB_DATABASE || "u743347598_utassets",
    synchronize: true,
    logging: true,
    entities: [
        path_1.default.join(__dirname, '..', 'entity', '*.{ts,js}'),
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
        Rental_1.Rental,
        Housing_1.Housing
    ],
    migrations: [],
    subscribers: [],
    charset: "utf8mb4",
});
const initialize = async () => {
    try {
        if (!exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.initialize();
            console.log('Base de datos MySQL conectada con TypeORM');
        }
    }
    catch (error) {
        console.error('Error al conectar la base de datos:', error);
        process.exit(1);
    }
};
exports.initialize = initialize;
