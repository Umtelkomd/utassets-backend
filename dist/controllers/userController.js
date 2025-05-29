"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const User_1 = require("../entity/User");
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const User_2 = require("../entity/User");
const data_source_1 = require("../config/data-source");
const upload_service_1 = require("../upload/upload.service");
const config_1 = require("@nestjs/config");
const fs_1 = __importDefault(require("fs"));
class UserController {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const configService = new config_1.ConfigService();
        this.uploadService = new upload_service_1.UploadService(configService);
    }
    async createUser(req, res) {
        try {
            const { username, email, password, fullName, role, birthDate } = req.body;
            const file = req.file;
            // Validar campos requeridos
            if (!username || !email || !password || !fullName) {
                return res.status(400).json({
                    message: 'Faltan campos requeridos: username, email, password o fullName'
                });
            }
            // Verificar si el usuario o email ya existen
            const existingUser = await this.userRepository.findOne({
                where: [
                    { username },
                    { email }
                ]
            });
            if (existingUser) {
                return res.status(400).json({ message: 'El usuario o email ya existe' });
            }
            // Hash de la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
            let photoUrl = null;
            let photoPublicId = null;
            if (file) {
                try {
                    const uploadResult = await this.uploadService.uploadImage(file, 'users');
                    photoUrl = uploadResult.url;
                    photoPublicId = uploadResult.public_id;
                }
                catch (error) {
                    console.error('Error al subir la imagen a Cloudinary:', error);
                    return res.status(500).json({ message: 'Error al subir la imagen' });
                }
            }
            // Crear el usuario
            const user = this.userRepository.create({
                username,
                email,
                password: hashedPassword,
                fullName,
                role: role || User_2.UserRole.TECH,
                birthDate: birthDate ? new Date(birthDate) : undefined,
                isActive: true,
                photoUrl,
                photoPublicId
            });
            // Guardar el usuario
            await this.userRepository.save(user);
            // Eliminar la contraseña del objeto de respuesta
            const { password: _, ...userWithoutPassword } = user;
            // Generar token
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET no está definido');
            }
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(201).json({ user: userWithoutPassword, token });
        }
        catch (error) {
            console.error('Error al crear usuario:', error);
            return res.status(500).json({ message: 'Error al crear usuario' });
        }
    }
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { username, email, fullName, phone, role, isActive } = req.body;
            const file = req.file;
            const user = await this.userRepository.findOne({ where: { id: parseInt(id) } });
            if (!user) {
                if (file && file.path) {
                    fs_1.default.unlinkSync(file.path);
                }
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            // Procesar la imagen si existe
            if (file && file.path) {
                try {
                    // Eliminar imagen anterior de Cloudinary si existe
                    if (user.photoPublicId) {
                        await this.uploadService.deleteImage(user.photoPublicId);
                    }
                    // Subir nueva imagen
                    const uploadResult = await this.uploadService.uploadImage(file, 'users');
                    user.photoUrl = uploadResult.url;
                    user.photoPublicId = uploadResult.public_id;
                }
                catch (error) {
                    console.error('Error al procesar la imagen:', error);
                    if (file && file.path) {
                        fs_1.default.unlinkSync(file.path);
                    }
                    return res.status(500).json({ message: 'Error al procesar la imagen del usuario' });
                }
            }
            // Verificar si el nuevo username o email ya existen en otros usuarios
            if (username !== user.username || email !== user.email) {
                const existingUser = await this.userRepository.findOne({
                    where: [
                        { username },
                        { email }
                    ]
                });
                if (existingUser && existingUser.id !== parseInt(id)) {
                    if (file && file.path) {
                        fs_1.default.unlinkSync(file.path);
                    }
                    return res.status(400).json({ message: 'El usuario o email ya existe' });
                }
            }
            // Actualizar los campos
            user.username = username || user.username;
            user.email = email || user.email;
            user.fullName = fullName || user.fullName;
            user.phone = phone || user.phone;
            user.role = role || user.role;
            user.isActive = isActive !== undefined ? isActive : user.isActive;
            await this.userRepository.save(user);
            // Eliminar archivo temporal si existe
            if (file && file.path) {
                fs_1.default.unlinkSync(file.path);
            }
            // Eliminar la contraseña del objeto de respuesta
            const { password: _, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
        }
        catch (error) {
            if (req.file && req.file.path) {
                fs_1.default.unlinkSync(req.file.path);
            }
            console.error('Error al actualizar usuario:', error);
            return res.status(500).json({ message: 'Error al actualizar usuario' });
        }
    }
    async updateUserImage(req, res) {
        try {
            const { id } = req.params;
            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
            }
            const user = await this.userRepository.findOne({ where: { id: parseInt(id) } });
            if (!user) {
                if (file && file.path) {
                    fs_1.default.unlinkSync(file.path);
                }
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            try {
                // Subir nueva imagen a Cloudinary
                const uploadResult = await this.uploadService.uploadImage(file, 'users');
                // Eliminar imagen anterior de Cloudinary si existe
                if (user.photoPublicId) {
                    await this.uploadService.deleteImage(user.photoPublicId);
                }
                // Actualizar con los nuevos datos
                user.photoUrl = uploadResult.url;
                user.photoPublicId = uploadResult.public_id;
                await this.userRepository.save(user);
                // Eliminar archivo temporal
                if (file && file.path) {
                    fs_1.default.unlinkSync(file.path);
                }
                return res.status(200).json({
                    message: 'Imagen actualizada correctamente',
                    user: {
                        ...user,
                        photoUrl: user.photoUrl
                    }
                });
            }
            catch (uploadError) {
                if (file && file.path) {
                    fs_1.default.unlinkSync(file.path);
                }
                return res.status(500).json({
                    message: 'Error al subir la imagen',
                    error: uploadError
                });
            }
        }
        catch (error) {
            if (req.file && req.file.path) {
                fs_1.default.unlinkSync(req.file.path);
            }
            console.error('Error al actualizar imagen de usuario:', error);
            return res.status(500).json({ message: 'Error al actualizar imagen de usuario' });
        }
    }
    async deleteUserImage(req, res) {
        try {
            const { id } = req.params;
            const user = await this.userRepository.findOne({ where: { id: parseInt(id) } });
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            if (!user.photoUrl || !user.photoPublicId) {
                return res.status(400).json({ message: 'El usuario no tiene imagen' });
            }
            try {
                // Eliminar de Cloudinary
                await this.uploadService.deleteImage(user.photoPublicId);
                // Actualizar el usuario para eliminar las referencias
                user.photoUrl = null;
                user.photoPublicId = null;
                await this.userRepository.save(user);
                return res.status(200).json({
                    message: 'Imagen eliminada correctamente',
                    user
                });
            }
            catch (deleteError) {
                return res.status(500).json({
                    message: 'Error al eliminar la imagen de Cloudinary',
                    error: deleteError
                });
            }
        }
        catch (error) {
            console.error('Error al eliminar imagen de usuario:', error);
            return res.status(500).json({ message: 'Error al eliminar imagen de usuario' });
        }
    }
    async getUsers(req, res) {
        try {
            const users = await this.userRepository.find({
                select: ['id', 'username', 'email', 'fullName', 'phone', 'role', 'isActive', 'lastLoginDate', 'lastLoginIp', 'createdAt', 'updatedAt', 'photoUrl', 'photoPublicId']
            });
            return res.json(users);
        }
        catch (error) {
            console.error('Error al obtener usuarios:', error);
            return res.status(500).json({ message: 'Error al obtener usuarios' });
        }
    }
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await this.userRepository.findOne({
                where: { id: parseInt(id) },
                select: ['id', 'username', 'email', 'fullName', 'phone', 'role', 'isActive', 'lastLoginDate', 'lastLoginIp', 'createdAt', 'updatedAt', 'photoUrl', 'photoPublicId']
            });
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            return res.json(user);
        }
        catch (error) {
            console.error('Error al obtener usuario:', error);
            return res.status(500).json({ message: 'Error al obtener usuario' });
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
