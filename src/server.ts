import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
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
import path from 'path';
import './scripts/initDirectories';

const app = express();
const PORT = process.env.PORT || 5050;

// Configuración de CORS mejorada
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://glassfaser-utk.de'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Access-Control-Allow-Origin'],
    exposedHeaders: ['Content-Length', 'X-Requested-With', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Middleware adicional para OPTIONS requests (preflight)
app.options('*', cors({
    origin: [
        'http://localhost:3000',
        'https://glassfaser-utk.de'
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/uploads/users', express.static(path.join(__dirname, '..', 'uploads', 'users')));
app.use('/uploads/vehicles', express.static(path.join(__dirname, '..', 'uploads', 'vehicles')));
app.use('/uploads/inventory', express.static(path.join(__dirname, '..', 'uploads', 'inventory')));

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

// Inicializar la base de datos y el servidor
AppDataSource.initialize()
    .then(() => {
        console.log('Base de datos conectada');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    })
    .catch((error) => console.log('Error al conectar con la base de datos:', error)); 