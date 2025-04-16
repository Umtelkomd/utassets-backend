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

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "panda_assets",
    synchronize: true, // Habilitar sincronización automática
    logging: true,
    entities: [
        User,
        Vehicle,
        Inventory,
        Movement,
        Category,
        InventoryProject,
        Project,
        Maintenance
    ],
    migrations: [],
    subscribers: [],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export const initialize = async (): Promise<void> => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('Base de datos conectada con TypeORM');
        }
    } catch (error) {
        console.error('Error al conectar la base de datos:', error);
        process.exit(1);
    }
}; 