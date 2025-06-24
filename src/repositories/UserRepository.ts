import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entity/User';
import { Vehicle } from '../entity/Vehicle';
import { Inventory } from '../entity/Inventory';
import { Report } from '../entity/Report';
import { Comment } from '../entity/Comment';
import bcrypt from 'bcrypt';
import { DeepPartial } from 'typeorm';

export interface UserCreateDTO {
    username: string;
    email: string;
    password: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    isActive?: boolean;
    isEmailConfirmed?: boolean;
    emailConfirmationToken?: string;
    emailConfirmationTokenExpires?: Date;
    phone?: string;
    birthDate?: Date;
    photoUrl?: string;
    photoPublicId?: string;
    googleId?: string;
}

type UserUpdateDTO = DeepPartial<User>;

class UserRepository {
    private repository = AppDataSource.getRepository(User);

    async createUser(userData: UserCreateDTO): Promise<User> {
        // Hash de la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const user = this.repository.create({
            ...userData,
            password: hashedPassword,
            isActive: userData.isActive ?? true
        });
        return this.repository.save(user);
    }

    async getAllUsers(): Promise<User[]> {
        return this.repository.find();
    }

    async getUsersByRole(role: UserRole): Promise<User[]> {
        return this.repository.find({
            where: { role }
        });
    }

    async getUserById(id: number): Promise<User | null> {
        return this.repository.findOneBy({ id });
    }

    async getUserByUsername(username: string): Promise<User | null> {
        return this.repository.findOneBy({ username });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.repository.findOneBy({ email });
    }

    async updateUser(id: number, userData: UserUpdateDTO): Promise<User | null> {
        // Hash de la contraseña si se está actualizando
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        await this.repository.update(id, userData);
        return this.getUserById(id);
    }

    async deleteUser(id: number): Promise<User | null> {
        const userToDelete = await this.getUserById(id);
        if (!userToDelete) {
            return null;
        }

        // Iniciar una transacción para asegurar la integridad de los datos
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Remover el usuario como responsable de vehículos
            const vehicleRepository = queryRunner.manager.getRepository(Vehicle);
            const vehiclesWithUser = await vehicleRepository.find({
                relations: ['responsibleUsers'],
                where: {
                    responsibleUsers: {
                        id: id
                    }
                }
            });

            for (const vehicle of vehiclesWithUser) {
                vehicle.responsibleUsers = vehicle.responsibleUsers.filter(user => user.id !== id);
                await vehicleRepository.save(vehicle);
            }

            // 2. Remover el usuario como responsable de inventario
            const inventoryRepository = queryRunner.manager.getRepository(Inventory);
            const inventoriesWithUser = await inventoryRepository.find({
                relations: ['responsibleUsers'],
                where: {
                    responsibleUsers: {
                        id: id
                    }
                }
            });

            for (const inventory of inventoriesWithUser) {
                inventory.responsibleUsers = inventory.responsibleUsers.filter(user => user.id !== id);
                await inventoryRepository.save(inventory);
            }

            // 3. Manejar reportes creados por el usuario
            const reportRepository = queryRunner.manager.getRepository(Report);
            const userReports = await reportRepository.find({
                where: { user: { id: id } }
            });

            // Opción A: Eliminar todos los reportes del usuario (incluyendo comentarios)
            // Si prefieres mantener los reportes, cambiar user a null (ver Opción B abajo)
            for (const report of userReports) {
                await reportRepository.delete(report.id);
            }

            // Opción B: Mantener reportes pero quitar la referencia al usuario
            // for (const report of userReports) {
            //     report.user = null;
            //     await reportRepository.save(report);
            // }

            // 4. Manejar comentarios creados por el usuario
            const commentRepository = queryRunner.manager.getRepository(Comment);
            const userComments = await commentRepository.find({
                where: { user: { id: id } }
            });

            // Opción A: Eliminar todos los comentarios del usuario
            // Si prefieres mantener los comentarios, cambiar user a null (ver Opción B abajo)
            for (const comment of userComments) {
                await commentRepository.delete(comment.id);
            }

            // Opción B: Mantener comentarios pero quitar la referencia al usuario
            // for (const comment of userComments) {
            //     comment.user = null;
            //     await commentRepository.save(comment);
            // }

            // 5. Finalmente, eliminar el usuario
            await queryRunner.manager.delete(User, id);

            // Confirmar la transacción
            await queryRunner.commitTransaction();

            return userToDelete;

        } catch (error) {
            // Revertir la transacción en caso de error
            await queryRunner.rollbackTransaction();
            console.error('Error al eliminar usuario y sus referencias:', error);
            throw error;
        } finally {
            // Liberar el queryRunner
            await queryRunner.release();
        }
    }

    async verifyPassword(user: User, password: string): Promise<boolean> {
        return bcrypt.compare(password, user.password);
    }

    async updateLastLogin(id: number, ip?: string): Promise<void> {
        await this.repository.update(id, {
            lastLoginDate: new Date(),
            lastLoginIp: ip
        });
    }
}

export const userRepository = new UserRepository(); 