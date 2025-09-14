import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import { AppDataSource } from './config/data-source';
import authRoutes from './routes/AuthRoutes';
import userRoutes from './routes/userRoutes';
import vehicleRoutes from './routes/VehicleRoutes';
import inventoryRoutes from './routes/InventoryRoutes';
import projectRoutes from './routes/ProjectRoutes';
import inventoryProjectRoutes from './routes/InventoryProjectRoutes';
import categoryRoutes from './routes/CategoryRoutes';
import movementRoutes from './routes/MovementRoutes';
import maintenanceRoutes from './routes/MaintenanceRoutes';
import reportRoutes from './routes/ReportRoutes';
import commentRoutes from './routes/CommentRoutes';
import rentalRoutes from './routes/RentalRoutes';
import housingRoutes from './routes/HousingRoutes';
import vacationRoutes from './routes/VacationRoutes';
import financingRoutes from './routes/FinancingRoutes';
import paymentRoutes from './routes/PaymentRoutes';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5051;

// Crear directorios necesarios
const createUploadDirectories = () => {
    const dirs = [
        path.join(__dirname, '..', 'uploads'),
        path.join(__dirname, '..', 'uploads', 'users'),
        path.join(__dirname, '..', 'uploads', 'vehicles'),
        path.join(__dirname, '..', 'uploads', 'inventory'),
        path.join(__dirname, '..', 'uploads', 'housing')
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Directorio creado: ${dir}`);
        }
    });
};

// Crear directorios
createUploadDirectories();

app.use(cors({
    origin: [
       process.env.COSTCONTROL_FRONTEND_URL,
        process.env.UTASSETS_FRONTEND_URL
    ].filter((url): url is string => typeof url === 'string' && url.length > 0),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Habilitar credentials para cookies
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configurar sesión para Passport
app.use(session({
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
app.use(passport.initialize());
app.use(passport.session());

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/uploads/users', express.static(path.join(__dirname, '..', 'uploads', 'users')));
app.use('/uploads/vehicles', express.static(path.join(__dirname, '..', 'uploads', 'vehicles')));
app.use('/uploads/inventory', express.static(path.join(__dirname, '..', 'uploads', 'inventory')));
app.use('/uploads/housing', express.static(path.join(__dirname, '..', 'uploads', 'housing')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/inventory-projects', inventoryProjectRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/housing', housingRoutes);
app.use('/api/vacations', vacationRoutes);
app.use('/api/financings', financingRoutes);
app.use('/api/payments', paymentRoutes);

// Inicializar la base de datos y el servidor
AppDataSource.initialize()
    .then(() => {
        console.log('Base de datos conectada');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    })
    .catch((error) => console.log('Error al conectar con la base de datos:', error)); 