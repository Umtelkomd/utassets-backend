import { Request, Response } from 'express';
import { User } from '../entity/User';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '../entity/User';
import * as path from 'path';
import * as fs from 'fs';
import { AppDataSource } from '../config/data-source';

export class UserController {
    private userRepository = AppDataSource.getRepository(User);

    async createUser(req: Request, res: Response) {
        try {
            // Extraer datos del FormData
            const { username, email, password, fullName, role, birthDate } = req.body;
            const file = req.file;

            console.log('backend', req, res)

            // Validar campos requeridos
            if (!username || !email || !password || !fullName) {
                // Si hay una imagen y hay error, eliminarla
                if (file) {
                    fs.unlinkSync(file.path);
                }
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
                // Si hay una imagen y hay error, eliminarla
                if (file) {
                    fs.unlinkSync(file.path);
                }
                return res.status(400).json({ message: 'El usuario o email ya existe' });
            }

            // Hash de la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Crear el usuario
            const user = this.userRepository.create({
                username,
                email,
                password: hashedPassword,
                fullName,
                role: role || UserRole.TECH,
                birthDate: birthDate ? new Date(birthDate) : undefined,
                isActive: true,
                imagePath: file ? file.filename : null
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

            res.status(201).json({ user: userWithoutPassword, token });
        } catch (error) {
            // Si hay una imagen y hay error, eliminarla
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            console.error('Error al crear usuario:', error);
            res.status(500).json({ message: 'Error al crear usuario' });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { username, email, fullName, phone, role, isActive } = req.body;

            const user = await this.userRepository.findOne({ where: { id: parseInt(id) } });
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
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

            // Eliminar la contraseña del objeto de respuesta
            const { password: _, ...userWithoutPassword } = user;

            res.json(userWithoutPassword);
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({ message: 'Error al actualizar usuario' });
        }
    }

    async updateUserImage(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
            }

            const user = await this.userRepository.findOne({ where: { id: parseInt(id) } });
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Si ya tiene una imagen, eliminarla
            if (user.imagePath) {
                const oldImagePath = path.join(__dirname, '..', '..', 'uploads', 'users', user.imagePath);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Actualizar la ruta de la imagen
            user.imagePath = file.filename;
            await this.userRepository.save(user);

            res.json({ message: 'Imagen actualizada correctamente', imagePath: user.imagePath });
        } catch (error) {
            console.error('Error al actualizar imagen de usuario:', error);
            res.status(500).json({ message: 'Error al actualizar imagen de usuario' });
        }
    }

    async deleteUserImage(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const user = await this.userRepository.findOne({ where: { id: parseInt(id) } });
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            if (!user.imagePath) {
                return res.status(400).json({ message: 'El usuario no tiene imagen' });
            }

            // Eliminar la imagen
            const imagePath = path.join(__dirname, '..', '..', 'uploads', 'users', user.imagePath);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }

            // Actualizar el usuario
            user.imagePath = null;
            await this.userRepository.save(user);

            res.json({ message: 'Imagen eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar imagen de usuario:', error);
            res.status(500).json({ message: 'Error al eliminar imagen de usuario' });
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const users = await this.userRepository.find({
                select: ['id', 'username', 'email', 'fullName', 'phone', 'role', 'isActive', 'lastLoginDate', 'lastLoginIp', 'createdAt', 'updatedAt', 'imagePath']
            });
            res.json(users);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ message: 'Error al obtener usuarios' });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await this.userRepository.findOne({
                where: { id: parseInt(id) },
                select: ['id', 'username', 'email', 'fullName', 'phone', 'role', 'isActive', 'lastLoginDate', 'lastLoginIp', 'createdAt', 'updatedAt', 'imagePath']
            });

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.json(user);
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({ message: 'Error al obtener usuario' });
        }
    }
} 