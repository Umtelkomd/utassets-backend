import { Request, Response } from 'express';
import { User } from '../entity/User';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '../entity/User';
import { AppDataSource } from '../config/data-source';
import { UploadService } from '../upload/upload.service';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';

export class UserController {
    private userRepository = AppDataSource.getRepository(User);
    private uploadService: UploadService;

    constructor() {
        const configService = new ConfigService();
        this.uploadService = new UploadService(configService);
    }

    async createUser(req: Request, res: Response): Promise<Response> {
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
                } catch (error) {
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
                role: role || UserRole.TECH,
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

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return res.status(201).json({ user: userWithoutPassword, token });
        } catch (error) {
            console.error('Error al crear usuario:', error);
            return res.status(500).json({ message: 'Error al crear usuario' });
        }
    }

    async updateUser(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { username, email, fullName, phone, role, isActive } = req.body;
            const file = req.file;

            // Debug logs para entender qué está llegando
            console.log('Datos recibidos:', {
                id,
                username,
                email,
                fullName,
                phone,
                role,
                isActive
            });
            console.log('Archivo recibido:', {
                hasFile: !!file,
                filename: file?.originalname,
                mimetype: file?.mimetype,
                size: file?.size,
                hasBuffer: !!file?.buffer,
                hasPath: !!file?.path,
                fieldname: file?.fieldname
            });

            const user = await this.userRepository.findOne({ where: { id: parseInt(id) } });
            if (!user) {
                if (file && file.path) {
                    fs.unlinkSync(file.path);
                }
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Procesar la imagen si existe - CORREGIDO: usar file.buffer en lugar de file.path
            if (file && file.buffer) {
                console.log('Procesando imagen...');
                try {
                    // Eliminar imagen anterior de Cloudinary si existe
                    if (user.photoPublicId) {
                        console.log('Eliminando imagen anterior:', user.photoPublicId);
                        await this.uploadService.deleteImage(user.photoPublicId);
                    }

                    // Subir nueva imagen
                    console.log('Subiendo nueva imagen a Cloudinary...');
                    const uploadResult = await this.uploadService.uploadImage(file, 'users');
                    console.log('Resultado de subida:', uploadResult);

                    user.photoUrl = uploadResult.url;
                    user.photoPublicId = uploadResult.public_id;
                } catch (error) {
                    console.error('Error al procesar la imagen:', error);
                    if (file && file.path) {
                        fs.unlinkSync(file.path);
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
                        fs.unlinkSync(file.path);
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

            console.log('Guardando usuario actualizado...');
            await this.userRepository.save(user);

            // Eliminar archivo temporal si existe (aunque con memoryStorage no debería existir)
            if (file && file.path) {
                fs.unlinkSync(file.path);
            }

            // Eliminar la contraseña del objeto de respuesta
            const { password: _, ...userWithoutPassword } = user;

            console.log('Usuario actualizado exitosamente:', userWithoutPassword);
            return res.json(userWithoutPassword);
        } catch (error) {
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            console.error('Error al actualizar usuario:', error);
            return res.status(500).json({ message: 'Error al actualizar usuario' });
        }
    }

    async updateUserImage(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const file = req.file;

            console.log('updateUserImage - Datos recibidos:', {
                id,
                hasFile: !!file,
                filename: file?.originalname,
                mimetype: file?.mimetype,
                size: file?.size,
                hasBuffer: !!file?.buffer,
                hasPath: !!file?.path
            });

            if (!file) {
                return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
            }

            const user = await this.userRepository.findOne({ where: { id: parseInt(id) } });
            if (!user) {
                if (file && file.path) {
                    fs.unlinkSync(file.path);
                }
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            try {
                console.log('updateUserImage - Subiendo nueva imagen a Cloudinary...');
                // Subir nueva imagen a Cloudinary
                const uploadResult = await this.uploadService.uploadImage(file, 'users');
                console.log('updateUserImage - Resultado de subida:', uploadResult);

                // Eliminar imagen anterior de Cloudinary si existe
                if (user.photoPublicId) {
                    console.log('updateUserImage - Eliminando imagen anterior:', user.photoPublicId);
                    await this.uploadService.deleteImage(user.photoPublicId);
                }

                // Actualizar con los nuevos datos
                user.photoUrl = uploadResult.url;
                user.photoPublicId = uploadResult.public_id;
                await this.userRepository.save(user);

                // Eliminar archivo temporal si existe (aunque con memoryStorage no debería existir)
                if (file && file.path) {
                    fs.unlinkSync(file.path);
                }

                console.log('updateUserImage - Imagen actualizada exitosamente');
                return res.status(200).json({
                    message: 'Imagen actualizada correctamente',
                    user: {
                        ...user,
                        photoUrl: user.photoUrl
                    }
                });
            } catch (uploadError) {
                console.error('updateUserImage - Error al subir imagen:', uploadError);
                if (file && file.path) {
                    fs.unlinkSync(file.path);
                }
                return res.status(500).json({
                    message: 'Error al subir la imagen',
                    error: uploadError
                });
            }
        } catch (error) {
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            console.error('updateUserImage - Error general:', error);
            return res.status(500).json({ message: 'Error al actualizar imagen de usuario' });
        }
    }

    async deleteUserImage(req: Request, res: Response): Promise<Response> {
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
            } catch (deleteError) {
                return res.status(500).json({
                    message: 'Error al eliminar la imagen de Cloudinary',
                    error: deleteError
                });
            }
        } catch (error) {
            console.error('Error al eliminar imagen de usuario:', error);
            return res.status(500).json({ message: 'Error al eliminar imagen de usuario' });
        }
    }

    async getUsers(req: Request, res: Response): Promise<Response> {
        try {
            const users = await this.userRepository.find({
                select: ['id', 'username', 'email', 'fullName', 'phone', 'role', 'isActive', 'lastLoginDate', 'lastLoginIp', 'createdAt', 'updatedAt', 'photoUrl', 'photoPublicId']
            });
            return res.json(users);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            return res.status(500).json({ message: 'Error al obtener usuarios' });
        }
    }

    async getUserById(req: Request, res: Response): Promise<Response> {
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
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            return res.status(500).json({ message: 'Error al obtener usuario' });
        }
    }
}

export const userController = new UserController(); 