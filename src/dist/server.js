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
require("reflect-metadata");
var express_1 = require("express");
var path_1 = require("path");
var cors_1 = require("cors");
var data_source_1 = require("./config/data-source");
var dotenv_1 = require("dotenv");
var fs_1 = require("fs");
// Cargar variables de entorno
dotenv_1["default"].config();
// Importar rutas
var userRoutes_1 = require("./routes/userRoutes");
var VehicleRoutes_1 = require("./routes/VehicleRoutes");
var AuthRoutes_1 = require("./routes/AuthRoutes");
var InventoryRoutes_1 = require("./routes/InventoryRoutes");
var CategoryRoutes_1 = require("./routes/CategoryRoutes");
var ProjectRoutes_1 = require("./routes/ProjectRoutes");
var MaintenanceRoutes_1 = require("./routes/MaintenanceRoutes");
var MovementRoutes_1 = require("./routes/MovementRoutes");
var app = express_1["default"]();
// Configuración de CORS
app.use(cors_1["default"]({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Middleware
app.use(express_1["default"].json());
// Crear directorios necesarios si no existen
var uploadDirs = ['uploads/users', 'uploads/vehicles'];
uploadDirs.forEach(function (dir) {
    var fullPath = path_1["default"].join(__dirname, '..', dir);
    if (!fs_1["default"].existsSync(fullPath)) {
        fs_1["default"].mkdirSync(fullPath, { recursive: true });
    }
});
// Servir archivos estáticos desde la carpeta uploads
app.use('/api/uploads', express_1["default"].static('uploads'));
// Configurar rutas
app.use('/api/users', userRoutes_1["default"]);
app.use('/api/vehicles', VehicleRoutes_1["default"]);
app.use('/api/auth', AuthRoutes_1["default"]);
app.use('/api/inventory', InventoryRoutes_1["default"]);
app.use('/api/categories', CategoryRoutes_1["default"]);
app.use('/api/projects', ProjectRoutes_1["default"]);
app.use('/api/maintenance', MaintenanceRoutes_1["default"]);
app.use('/api/movements', MovementRoutes_1["default"]);
// Rutas de prueba
app.get('/', function (_req, res) {
    res.send('API funcionando correctamente');
});
app.get('/api', function (_req, res) {
    res.send('API funcionando correctamente');
});
// Usar un puerto diferente para evitar conflictos
var PORT = process.env.PORT || 5050;
// Inicializar TypeORM y luego iniciar el servidor
var startServer = function () { return __awaiter(void 0, void 0, Promise, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, data_source_1.initialize()];
            case 1:
                _a.sent(); // Inicializar la conexión TypeORM
                app.listen(PORT, function () {
                    console.log("Servidor corriendo en puerto " + PORT);
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error al iniciar el servidor:', error_1);
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
startServer();
