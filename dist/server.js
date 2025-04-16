"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const data_source_1 = require("./config/data-source");
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
// Importar rutas
const InventoryRoutes_1 = __importDefault(require("./routes/InventoryRoutes"));
const MaintenanceRoutes_1 = __importDefault(require("./routes/MaintenanceRoutes"));
const MovementRoutes_1 = __importDefault(require("./routes/MovementRoutes"));
const CategoryRoutes_1 = __importDefault(require("./routes/CategoryRoutes"));
const ProjectRoutes_1 = __importDefault(require("./routes/ProjectRoutes"));
const InventoryProjectRoutes_1 = __importDefault(require("./routes/InventoryProjectRoutes"));
const VehicleRoutes_1 = __importDefault(require("./routes/VehicleRoutes"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const VehicleAssignmentRoutes_1 = __importDefault(require("./routes/VehicleAssignmentRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: '*', // Permite todas las solicitudes de origen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json());
// Servir archivos estáticos desde la carpeta uploads
app.use('/api/uploads', express_1.default.static('uploads'));
// Configurar rutas
app.use('/api/auth', AuthRoutes_1.default);
app.use('/api/inventory', InventoryRoutes_1.default);
app.use('/api/maintenance', MaintenanceRoutes_1.default);
app.use('/api/movements', MovementRoutes_1.default);
app.use('/api/categories', CategoryRoutes_1.default);
app.use('/api/projects', ProjectRoutes_1.default);
app.use('/api/inventory-projects', InventoryProjectRoutes_1.default);
app.use('/api/vehicles', VehicleRoutes_1.default);
app.use('/api/vehicle-assignments', VehicleAssignmentRoutes_1.default);
// Ruta de prueba
app.get('/', (_req, res) => {
    res.send('API funcionando correctamente');
});
// Ruta de prueba para /api
app.get('/api', (_req, res) => {
    res.send('API funcionando correctamente');
});
// Usar un puerto diferente para evitar conflictos
const PORT = process.env.PORT || 5050;
// Inicializar TypeORM y luego iniciar el servidor
const startServer = async () => {
    try {
        await (0, data_source_1.initialize)(); // Inicializar la conexión TypeORM
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en puerto ${PORT}`);
        });
    }
    catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};
startServer();
