"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const data_source_1 = require("../config/data-source");
const User_1 = require("../entity/User");
const Vehicle_1 = require("../entity/Vehicle");
const Inventory_1 = require("../entity/Inventory");
const Report_1 = require("../entity/Report");
const Comment_1 = require("../entity/Comment");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserRepository {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    async createUser(userData) {
        var _a;
        // Hash de la contraseña antes de guardarla
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(userData.password, salt);
        const user = this.repository.create({
            ...userData,
            password: hashedPassword,
            isActive: (_a = userData.isActive) !== null && _a !== void 0 ? _a : true
        });
        return this.repository.save(user);
    }
    async getAllUsers() {
        return this.repository.find();
    }
    async getUsersByRole(role) {
        return this.repository.find({
            where: { role }
        });
    }
    async getUserById(id) {
        return this.repository.findOneBy({ id });
    }
    async getUserByUsername(username) {
        return this.repository.findOneBy({ username });
    }
    async getUserByEmail(email) {
        return this.repository.findOneBy({ email });
    }
    async getUserByPasswordResetToken(token) {
        return this.repository.findOneBy({ passwordResetToken: token });
    }
    async updateUser(id, userData) {
        // Hash de la contraseña si se está actualizando
        if (userData.password) {
            const salt = await bcrypt_1.default.genSalt(10);
            userData.password = await bcrypt_1.default.hash(userData.password, salt);
        }
        await this.repository.update(id, userData);
        return this.getUserById(id);
    }
    async deleteUser(id) {
        const userToDelete = await this.getUserById(id);
        if (!userToDelete) {
            return null;
        }
        // Iniciar una transacción para asegurar la integridad de los datos
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // 1. Remover el usuario como responsable de vehículos
            const vehicleRepository = queryRunner.manager.getRepository(Vehicle_1.Vehicle);
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
            const inventoryRepository = queryRunner.manager.getRepository(Inventory_1.Inventory);
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
            const reportRepository = queryRunner.manager.getRepository(Report_1.Report);
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
            const commentRepository = queryRunner.manager.getRepository(Comment_1.Comment);
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
            await queryRunner.manager.delete(User_1.User, id);
            // Confirmar la transacción
            await queryRunner.commitTransaction();
            return userToDelete;
        }
        catch (error) {
            // Revertir la transacción en caso de error
            await queryRunner.rollbackTransaction();
            console.error('Error al eliminar usuario y sus referencias:', error);
            throw error;
        }
        finally {
            // Liberar el queryRunner
            await queryRunner.release();
        }
    }
    async verifyPassword(user, password) {
        return bcrypt_1.default.compare(password, user.password);
    }
    async updateLastLogin(id, ip) {
        await this.repository.update(id, {
            lastLoginDate: new Date(),
            lastLoginIp: ip
        });
    }
}
exports.userRepository = new UserRepository();
