import { Request, Response } from 'express';
import { userRepository } from '../repositories/UserRepository';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../entity/User';
import * as path from 'path';
import * as fs from 'fs';

const JWT_SECRET = process.env.JWT_SECRET || 'utassets_secret_key_2024_secure_token';
const JWT_EXPIRES_IN = '24h';

export class AuthController {
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const username = email;

            console.log('Datos recibidos:', { email, password });

            // Validar que se proporcionaron las credenciales
            if (!email || !password) {
                console.log('Faltan credenciales:', { email, password });
                res.status(400).json({ message: 'Se requiere correo y contraseña' });
                return;
            }

            // Buscar el usuario por nombre de usuario o email
            console.log('Buscando usuario por username:', username);
            let user = await userRepository.getUserByUsername(username);

            if (!user) {
                console.log('Usuario no encontrado por username, intentando por email:', username);
                user = await userRepository.getUserByEmail(username);
            }

            if (!user) {
                console.log('Usuario no encontrado ni por username ni por email');
                res.status(401).json({ message: 'Credenciales inválidas' });
                return;
            }

            console.log('Usuario encontrado:', {
                id: user.id,
                username: user.username,
                email: user.email,
                isActive: user.isActive
            });

            // Verificar si el usuario está activo
            if (!user.isActive) {
                console.log('Usuario inactivo');
                res.status(401).json({ message: 'Usuario desactivado. Contacte al administrador.' });
                return;
            }

            // Verificar la contraseña
            console.log('Verificando contraseña...');
            const isValidPassword = await userRepository.verifyPassword(user, password);
            if (!isValidPassword) {
                console.log('Contraseña inválida');
                res.status(401).json({ message: 'Credenciales inválidas' });
                return;
            }

            console.log('Contraseña válida, generando token...');

            // Actualizar último inicio de sesión
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            await userRepository.updateLastLogin(user.id, ip?.toString());

            // Generar token JWT
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            // Responder con el token y datos del usuario (excluyendo la contraseña)
            const { password: _, ...userWithoutPassword } = user;
            res.status(200).json({
                message: 'Inicio de sesión exitoso',
                token,
                user: userWithoutPassword
            });
        } catch (error) {
            console.error('Error en el inicio de sesión:', error);
            res.status(500).json({
                message: 'Error en el servidor durante el inicio de sesión',
                error: (error as Error).message
            });
        }
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const userData = req.body as Partial<User>;
            const file = req.file;

            // Logs detallados para depuración
            console.log('=== DATOS DE REGISTRO ===');
            console.log('Body completo:', req.body);
            console.log('userData:', userData);
            console.log('Headers:', req.headers);
            console.log('Content-Type:', req.headers['content-type']);
            console.log('File:', file);
            console.log('=======================');

            // Si se proporcionan firstName y lastName, combinarlos en fullName
            if (userData.firstName && userData.lastName && !userData.fullName) {
                userData.fullName = `${userData.firstName} ${userData.lastName}`;
            }

            // Validar datos de entrada básicos
            if (!userData.email || !userData.password || !userData.fullName) {
                console.log('Datos faltantes:', {
                    email: userData.email,
                    password: userData.password ? 'presente' : 'ausente',
                    fullName: userData.fullName
                });
                // Si hay una imagen y hay error, eliminarla
                if (file) {
                    fs.unlinkSync(file.path);
                }
                res.status(400).json({
                    message: 'Datos incompletos. Se requiere email, contraseña y nombre completo'
                });
                return;
            }

            // Generar username del email si no se proporciona
            if (!userData.username) {
                userData.username = userData.email.split('@')[0];
            }

            // Validar la fecha de nacimiento si se proporciona
            if (userData.birthDate) {
                const birthDate = new Date(userData.birthDate);
                const currentDate = new Date();
                const minDate = new Date('1900-01-01');

                if (isNaN(birthDate.getTime())) {
                    // Si hay una imagen y hay error, eliminarla
                    if (file) {
                        fs.unlinkSync(file.path);
                    }
                    res.status(400).json({
                        message: 'La fecha de nacimiento no es válida'
                    });
                    return;
                }

                if (birthDate < minDate || birthDate > currentDate) {
                    // Si hay una imagen y hay error, eliminarla
                    if (file) {
                        fs.unlinkSync(file.path);
                    }
                    res.status(400).json({
                        message: 'La fecha de nacimiento debe estar entre 1900 y la fecha actual'
                    });
                    return;
                }
            }

            // Verificar si ya existe un usuario con el mismo username o email
            const existingUsername = await userRepository.getUserByUsername(userData.username);
            if (existingUsername) {
                // Si hay una imagen y hay error, eliminarla
                if (file) {
                    fs.unlinkSync(file.path);
                }
                res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
                return;
            }

            const existingEmail = await userRepository.getUserByEmail(userData.email);
            if (existingEmail) {
                // Si hay una imagen y hay error, eliminarla
                if (file) {
                    fs.unlinkSync(file.path);
                }
                res.status(400).json({ message: 'El email ya está registrado' });
                return;
            }

            // Si hay una imagen como archivo, agregar la ruta al usuario
            if (file) {
                userData.imagePath = file.filename;
            }
            // Si se proporciona una URL de imagen directamente
            else if (userData.imagePath && typeof userData.imagePath === 'string' && userData.imagePath.startsWith('http')) {
                // Mantener la URL como está
                console.log('Usando URL de imagen proporcionada:', userData.imagePath);
            }

            // Por defecto, los usuarios nuevos se registran como técnicos
            // Solo un administrador puede cambiar este valor posteriormente
            userData.role = UserRole.TECH;

            const newUser = await userRepository.createUser(userData);

            // Excluir la contraseña de la respuesta
            const { password: _, ...userWithoutPassword } = newUser;

            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user: userWithoutPassword
            });
        } catch (error) {
            // Si hay una imagen y hay error, eliminarla
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            console.error('Error en el registro de usuario:', error);
            res.status(500).json({
                message: 'Error en el servidor durante el registro',
                error: (error as Error).message
            });
        }
    }

    async getCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            // El middleware debe haber añadido el userId a la request
            const userId = (req as any).userId;
            if (!userId) {
                res.status(401).json({ message: 'No autenticado' });
                return;
            }

            const user = await userRepository.getUserById(userId);
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }

            // Excluir la contraseña de la respuesta
            const { password: _, ...userWithoutPassword } = user;

            res.status(200).json(userWithoutPassword);
        } catch (error) {
            console.error('Error al obtener usuario actual:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: (error as Error).message
            });
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            // Esta ruta debería estar protegida y solo accesible por administradores
            let users: User[];

            // Verificar si hay un filtro de rol en la consulta
            const roleFilter = req.query.role as string;
            console.log('Filtro de rol recibido:', roleFilter);
            console.log('Todos los valores posibles de UserRole:', Object.values(UserRole));

            if (roleFilter) {
                console.log(`Intentando filtrar por rol: ${roleFilter}`);

                // Verificar si el valor del rol coincide exactamente con alguno de los enum
                if (Object.values(UserRole).includes(roleFilter as UserRole)) {
                    console.log(`Rol válido encontrado: ${roleFilter}, obteniendo usuarios...`);
                    users = await userRepository.getUsersByRole(roleFilter as UserRole);
                } else {
                    console.log(`Rol ${roleFilter} no coincide exactamente con ningún valor del enum. Buscando coincidencias parciales...`);
                    // Intentar encontrar una coincidencia aproximada
                    const roleValues = Object.values(UserRole);
                    const matchingRole = roleValues.find(role =>
                        role.toLowerCase() === roleFilter.toLowerCase()
                    );

                    if (matchingRole) {
                        console.log(`Coincidencia parcial encontrada para el rol ${roleFilter} -> ${matchingRole}`);
                        users = await userRepository.getUsersByRole(matchingRole);
                    } else {
                        console.log(`No se encontró ninguna coincidencia para el rol ${roleFilter}, devolviendo todos los usuarios`);
                        users = await userRepository.getAllUsers();
                    }
                }
            } else {
                console.log('No se especificó filtro de rol, devolviendo todos los usuarios');
                users = await userRepository.getAllUsers();
            }

            console.log(`Usuarios encontrados: ${users.length}`);

            // Excluir las contraseñas de todos los usuarios
            const usersWithoutPasswords = users.map(user => {
                const { password: _, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });

            res.status(200).json(usersWithoutPasswords);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: (error as Error).message
            });
        }
    }

    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const user = await userRepository.getUserById(id);
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }

            // Excluir la contraseña de la respuesta
            const { password: _, ...userWithoutPassword } = user;

            res.status(200).json(userWithoutPassword);
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: (error as Error).message
            });
        }
    }

    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            // Verificar que el usuario existe
            const existingUser = await userRepository.getUserById(id);
            if (!existingUser) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }

            // Obtener los datos a actualizar
            const userData = req.body as Partial<User>;

            // Validar la fecha de nacimiento si se proporciona
            if (userData.birthDate) {
                const birthDate = new Date(userData.birthDate);
                const currentDate = new Date();
                const minDate = new Date('1900-01-01');

                if (isNaN(birthDate.getTime())) {
                    res.status(400).json({
                        message: 'La fecha de nacimiento no es válida'
                    });
                    return;
                }

                if (birthDate < minDate || birthDate > currentDate) {
                    res.status(400).json({
                        message: 'La fecha de nacimiento debe estar entre 1900 y la fecha actual'
                    });
                    return;
                }
            }

            // Si se intenta cambiar el username, verificar que no exista otro usuario con ese username
            if (userData.username && userData.username !== existingUser.username) {
                const existingUsername = await userRepository.getUserByUsername(userData.username);
                if (existingUsername) {
                    res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
                    return;
                }
            }

            // Si se intenta cambiar el email, verificar que no exista otro usuario con ese email
            if (userData.email && userData.email !== existingUser.email) {
                const existingEmail = await userRepository.getUserByEmail(userData.email);
                if (existingEmail) {
                    res.status(400).json({ message: 'El email ya está registrado' });
                    return;
                }
            }

            // Actualizar el usuario
            const updatedUser = await userRepository.updateUser(id, userData);
            if (!updatedUser) {
                res.status(500).json({ message: 'Error al actualizar el usuario' });
                return;
            }

            // Excluir la contraseña de la respuesta
            const { password: _, ...userWithoutPassword } = updatedUser;

            res.status(200).json({
                message: 'Usuario actualizado exitosamente',
                user: userWithoutPassword
            });
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: (error as Error).message
            });
        }
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const deletedUser = await userRepository.deleteUser(id);
            if (!deletedUser) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }

            // Excluir la contraseña de la respuesta
            const { password: _, ...userWithoutPassword } = deletedUser;

            res.status(200).json({
                message: 'Usuario eliminado exitosamente',
                user: userWithoutPassword
            });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: (error as Error).message
            });
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            // El middleware debe haber añadido el userId a la request
            const userId = (req as any).userId;
            if (!userId) {
                res.status(401).json({ message: 'No autenticado' });
                return;
            }

            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.status(400).json({ message: 'Se requieren las contraseñas actual y nueva' });
                return;
            }

            const user = await userRepository.getUserById(userId);
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }

            // Verificar la contraseña actual
            const isValidPassword = await userRepository.verifyPassword(user, currentPassword);
            if (!isValidPassword) {
                res.status(401).json({ message: 'Contraseña actual incorrecta' });
                return;
            }

            // Actualizar la contraseña
            await userRepository.updateUser(userId, { password: newPassword });

            res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: (error as Error).message
            });
        }
    }
}

export const authController = new AuthController(); 