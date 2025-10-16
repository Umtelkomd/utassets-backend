import "reflect-metadata";
import { DataSource } from "typeorm"
import "dotenv/config"
import { User } from '../entity/User';
import { Vehicle } from '../entity/Vehicle';
import { Inventory } from '../entity/Inventory';
import { Movement } from '../entity/Movement';
import { Category } from '../entity/Category';
import { InventoryProject } from '../entity/InventoryProject';
import { Project } from '../entity/Project';
import { Maintenance } from '../entity/Maintenance';
import { Report } from '../entity/Report';
import { Comment } from '../entity/Comment';
import { Rental } from '../entity/Rental';
import { Housing } from '../entity/Housing';
import { Vacation } from '../entity/Vacation';
import { Financing } from '../entity/Financing';
import { Payment } from '../entity/Payment';
import path from 'path';

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME || "u743347598_utassets",
    password: process.env.DB_PASSWORD || "YourStrongPassword123",
    database: process.env.DB_DATABASE || "u743347598_utassets",
    synchronize: false, // Desactivado para evitar cambios automáticos en producción
    logging: true,
    entities: [
        path.join(__dirname, '..', 'entity', '*.{ts,js}'),
        User,
        Vehicle,
        Inventory,
        Movement,
        Category,
        InventoryProject,
        Project,
        Maintenance,
        Report,
        Comment,
        Rental,
        Housing,
        Vacation,
        Financing,
        Payment
    ],
    migrations: [path.join(__dirname, '..', 'migration', '*.{ts,js}')],
    subscribers: [],
    charset: "utf8mb4",
})

export const initialize = async (): Promise<void> => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('Base de datos MySQL conectada con TypeORM');
        }
    } catch (error) {
        console.error('Error al conectar la base de datos:', error);
        process.exit(1);
    }
}; 