"use strict";
exports.__esModule = true;
require("reflect-metadata");
var express_1 = require("express");
var cors_1 = require("cors");
var data_source_1 = require("./config/data-source");
var AuthRoutes_1 = require("./routes/AuthRoutes");
var userRoutes_1 = require("./routes/userRoutes");
var VehicleRoutes_1 = require("./routes/VehicleRoutes");
var InventoryRoutes_1 = require("./routes/InventoryRoutes");
var ProjectRoutes_1 = require("./routes/ProjectRoutes");
var InventoryProjectRoutes_1 = require("./routes/InventoryProjectRoutes");
var CategoryRoutes_1 = require("./routes/CategoryRoutes");
var MovementRoutes_1 = require("./routes/MovementRoutes");
var MaintenanceRoutes_1 = require("./routes/MaintenanceRoutes");
var ReportRoutes_1 = require("./routes/ReportRoutes");
var CommentRoutes_1 = require("./routes/CommentRoutes");
var RentalRoutes_1 = require("./routes/RentalRoutes");
var path_1 = require("path");
require("./scripts/initDirectories");
var app = express_1["default"]();
var PORT = process.env.PORT || 5050;
app.use(cors_1["default"]({
    origin: [
        'https://glassfaser-utk.de',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));
app.use(express_1["default"].json());
app.use(express_1["default"].urlencoded({ extended: true }));
// Servir archivos estáticos
app.use('/uploads', express_1["default"].static(path_1["default"].join(__dirname, '..', 'uploads')));
app.use('/uploads/users', express_1["default"].static(path_1["default"].join(__dirname, '..', 'uploads', 'users')));
app.use('/uploads/vehicles', express_1["default"].static(path_1["default"].join(__dirname, '..', 'uploads', 'vehicles')));
app.use('/uploads/inventory', express_1["default"].static(path_1["default"].join(__dirname, '..', 'uploads', 'inventory')));
// Rutas
app.use('/api/auth', AuthRoutes_1["default"]);
app.use('/api/users', userRoutes_1["default"]);
app.use('/api/vehicles', VehicleRoutes_1["default"]);
app.use('/api/inventory', InventoryRoutes_1["default"]);
app.use('/api/projects', ProjectRoutes_1["default"]);
app.use('/api/inventory-projects', InventoryProjectRoutes_1["default"]);
app.use('/api/categories', CategoryRoutes_1["default"]);
app.use('/api/movements', MovementRoutes_1["default"]);
app.use('/api/maintenance', MaintenanceRoutes_1["default"]);
app.use('/api/reports', ReportRoutes_1["default"]);
app.use('/api/comments', CommentRoutes_1["default"]);
app.use('/api/rentals', RentalRoutes_1["default"]);
// Inicializar la base de datos y el servidor
data_source_1.AppDataSource.initialize()
    .then(function () {
    console.log('Base de datos conectada');
    app.listen(PORT, function () {
        console.log("Servidor corriendo en el puerto " + PORT);
    });
})["catch"](function (error) { return console.log('Error al conectar con la base de datos:', error); });
