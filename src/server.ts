import 'reflect-metadata';
import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import { initialize } from './config/data-source';
import dotenv from 'dotenv';
import fs from 'fs';

// Cargar variables de entorno
dotenv.config();

// Importar rutas
import userRoutes from './routes/userRoutes';
import vehicleRoutes from './routes/VehicleRoutes';
import authRoutes from './routes/AuthRoutes';
import inventoryRoutes from './routes/InventoryRoutes';
import categoryRoutes from './routes/CategoryRoutes';
import projectRoutes from './routes/ProjectRoutes';
import maintenanceRoutes from './routes/MaintenanceRoutes';
import movementRoutes from './routes/MovementRoutes';

const app = express();

// Configuración de CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware
app.use(express.json());

// Crear directorios necesarios si no existen
const uploadDirs = ['uploads/users', 'uploads/vehicles'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Servir archivos estáticos desde la carpeta uploads
app.use('/api/uploads', express.static('uploads'));

// Configurar rutas
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/movements', movementRoutes);

// Rutas de prueba
app.get('/', (_req: Request, res: Response) => {
    res.send('API funcionando correctamente');
});

app.get('/api', (_req: Request, res: Response) => {
    res.send('API funcionando correctamente');
});

// Usar un puerto diferente para evitar conflictos
const PORT = process.env.PORT || 5050;

// Inicializar TypeORM y luego iniciar el servidor
const startServer = async (): Promise<void> => {
    try {
        await initialize(); // Inicializar la conexión TypeORM

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en puerto ${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer(); 