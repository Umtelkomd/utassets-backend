"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const data_source_1 = require("./config/data-source");
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const VehicleRoutes_1 = __importDefault(require("./routes/VehicleRoutes"));
const InventoryRoutes_1 = __importDefault(require("./routes/InventoryRoutes"));
const ProjectRoutes_1 = __importDefault(require("./routes/ProjectRoutes"));
const InventoryProjectRoutes_1 = __importDefault(require("./routes/InventoryProjectRoutes"));
const CategoryRoutes_1 = __importDefault(require("./routes/CategoryRoutes"));
const MovementRoutes_1 = __importDefault(require("./routes/MovementRoutes"));
const MaintenanceRoutes_1 = __importDefault(require("./routes/MaintenanceRoutes"));
const ReportRoutes_1 = __importDefault(require("./routes/ReportRoutes"));
const CommentRoutes_1 = __importDefault(require("./routes/CommentRoutes"));
const path_1 = __importDefault(require("path"));
require("./scripts/initDirectories");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5050;
// Configuración de CORS mejorada
app.use((0, cors_1.default)({
    origin: '*', // Permite cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Access-Control-Allow-Origin'],
    exposedHeaders: ['Content-Length', 'X-Requested-With', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
// Middleware adicional para OPTIONS requests (preflight)
app.options('*', (0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Servir archivos estáticos
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
app.use('/uploads/users', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads', 'users')));
app.use('/uploads/vehicles', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads', 'vehicles')));
app.use('/uploads/inventory', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads', 'inventory')));
// Rutas
app.use('/api/auth', AuthRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/vehicles', VehicleRoutes_1.default);
app.use('/api/inventory', InventoryRoutes_1.default);
app.use('/api/projects', ProjectRoutes_1.default);
app.use('/api/inventory-projects', InventoryProjectRoutes_1.default);
app.use('/api/categories', CategoryRoutes_1.default);
app.use('/api/movements', MovementRoutes_1.default);
app.use('/api/maintenance', MaintenanceRoutes_1.default);
app.use('/api/reports', ReportRoutes_1.default);
app.use('/api/comments', CommentRoutes_1.default);
// Inicializar la base de datos y el servidor
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log('Base de datos conectada');
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
})
    .catch((error) => console.log('Error al conectar con la base de datos:', error));
