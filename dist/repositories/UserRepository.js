"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const data_source_1 = require("../config/data-source");
const User_1 = require("../entity/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserRepository {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    async createUser(userData) {
        // Hash de la contraseña antes de guardarla
        if (userData.password) {
            const salt = await bcrypt_1.default.genSalt(10);
            userData.password = await bcrypt_1.default.hash(userData.password, salt);
        }
        const user = this.repository.create(userData);
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
        await this.repository.delete(id);
        return userToDelete;
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
