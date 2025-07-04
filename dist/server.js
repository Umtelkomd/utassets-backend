"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("./config/passport"));
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
const RentalRoutes_1 = __importDefault(require("./routes/RentalRoutes"));
const HousingRoutes_1 = __importDefault(require("./routes/HousingRoutes"));
const VacationRoutes_1 = __importDefault(require("./routes/VacationRoutes"));
const FinancingRoutes_1 = __importDefault(require("./routes/FinancingRoutes"));
const PaymentRoutes_1 = __importDefault(require("./routes/PaymentRoutes"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5051;
// Crear directorios necesarios
const createUploadDirectories = () => {
    const dirs = [
        path_1.default.join(__dirname, '..', 'uploads'),
        path_1.default.join(__dirname, '..', 'uploads', 'users'),
        path_1.default.join(__dirname, '..', 'uploads', 'vehicles'),
        path_1.default.join(__dirname, '..', 'uploads', 'inventory'),
        path_1.default.join(__dirname, '..', 'uploads', 'housing')
    ];
    dirs.forEach(dir => {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
            console.log(`✅ Directorio creado: ${dir}`);
        }
    });
};
// Crear directorios
createUploadDirectories();
app.use((0, cors_1.default)({
    origin: [
        'https://glassfaser-utk.de',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Habilitar credentials para cookies
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Configurar sesión para Passport
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'utassets_session_secret_2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));
// Inicializar Passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Servir archivos estáticos
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
app.use('/uploads/users', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads', 'users')));
app.use('/uploads/vehicles', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads', 'vehicles')));
app.use('/uploads/inventory', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads', 'inventory')));
app.use('/uploads/housing', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads', 'housing')));
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
app.use('/api/rentals', RentalRoutes_1.default);
app.use('/api/housing', HousingRoutes_1.default);
app.use('/api/vacations', VacationRoutes_1.default);
app.use('/api/financings', FinancingRoutes_1.default);
app.use('/api/payments', PaymentRoutes_1.default);
// Inicializar la base de datos y el servidor
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log('Base de datos conectada');
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
})
    .catch((error) => console.log('Error al conectar con la base de datos:', error));
