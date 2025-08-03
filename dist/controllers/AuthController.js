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
exports.authController = exports.AuthController = void 0;
const UserRepository_1 = require("../repositories/UserRepository");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../entity/User");
const upload_service_1 = require("../upload/upload.service");
const JWT_SECRET = process.env.JWT_SECRET || 'utassets_secret_key_2024_secure_token';
const JWT_EXPIRES_IN = '90d';
class AuthController {
    constructor() {
        this.uploadService = upload_service_1.uploadService;
        // ConfigService ya no es necesario para UploadService
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const username = email;
            // Validar que se proporcionaron las credenciales
            if (!email || !password) {
                res.status(400).json({ message: 'Se requiere correo y contraseña' });
                return;
            }
            // Buscar el usuario por nombre de usuario o email
            let user = await UserRepository_1.userRepository.getUserByUsername(username);
            if (!user) {
                user = await UserRepository_1.userRepository.getUserByEmail(username);
            }
            if (!user) {
                res.status(401).json({ message: 'Credenciales inválidas' });
                return;
            }
            // Verificar si el usuario está activo
            if (!user.isActive) {
                res.status(401).json({ message: 'Usuario desactivado. Contacte al administrador.' });
                return;
            }
            // PRIMERO verificar la contraseña antes de enviar correos
            const isValidPassword = await UserRepository_1.userRepository.verifyPassword(user, password);
            if (!isValidPassword) {
                res.status(401).json({ message: 'Credenciales inválidas' });
                return;
            }
            // DESPUÉS verificar si el email está confirmado (solo si las credenciales son correctas)
            if (!user.isEmailConfirmed) {
                try {
                    // Generar nuevo token de confirmación
                    const { v4: uuidv4 } = await Promise.resolve().then(() => __importStar(require('uuid')));
                    const newConfirmationToken = uuidv4();
                    const newTokenExpires = new Date();
                    newTokenExpires.setHours(newTokenExpires.getHours() + 24); // 24 horas nuevas
                    // Actualizar el usuario con el nuevo token
                    await UserRepository_1.userRepository.updateUser(user.id, {
                        emailConfirmationToken: newConfirmationToken,
                        emailConfirmationTokenExpires: newTokenExpires
                    });
                    // Importar el servicio de email dinámicamente
                    const { emailService } = await Promise.resolve().then(() => __importStar(require('../services/EmailService')));
                    // Enviar nuevo correo de confirmación
                    const emailSent = await emailService.sendEmailConfirmation({ ...user, emailConfirmationToken: newConfirmationToken }, newConfirmationToken, true // Es un reenvío
                    );
                    const message = emailSent
                        ? 'Tu cuenta no está confirmada. Hemos enviado un nuevo correo de confirmación a tu bandeja de entrada.'
                        : 'Tu cuenta no está confirmada. Hemos intentado enviarte un correo de confirmación, pero hubo un problema. Por favor, solicita un nuevo correo desde la página de login.';
                    console.log(`📧 Nuevo correo de confirmación ${emailSent ? 'enviado' : 'falló'} para usuario: ${user.email}`);
                    res.status(401).json({
                        message,
                        emailNotConfirmed: true,
                        email: user.email,
                        newEmailSent: emailSent
                    });
                    return;
                }
                catch (emailError) {
                    console.error('Error al enviar correo de confirmación automático:', emailError);
                    res.status(401).json({
                        message: 'Tu cuenta no está confirmada. Hubo un problema al enviar el correo de confirmación. Por favor, solicita un nuevo correo desde la página de login.',
                        emailNotConfirmed: true,
                        email: user.email,
                        newEmailSent: false
                    });
                    return;
                }
            }
            // Actualizar último inicio de sesión
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            await UserRepository_1.userRepository.updateLastLogin(user.id, ip === null || ip === void 0 ? void 0 : ip.toString());
            // Generar token JWT
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            // Responder con el token y datos del usuario (excluyendo la contraseña)
            const { password: _, ...userWithoutPassword } = user;
            res.status(200).json({
                message: 'Inicio de sesión exitoso',
                token,
                user: userWithoutPassword
            });
        }
        catch (error) {
            console.error('Error en el inicio de sesión:', error);
            res.status(500).json({
                message: 'Error en el servidor durante el inicio de sesión',
                error: error.message
            });
        }
    }
    async register(req, res) {
        try {
            const userData = req.body;
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
            // Verificar si ya existe un usuario con el mismo username o email
            const existingUsername = await UserRepository_1.userRepository.getUserByUsername(userData.username);
            if (existingUsername) {
                res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
                return;
            }
            const existingEmail = await UserRepository_1.userRepository.getUserByEmail(userData.email);
            if (existingEmail) {
                res.status(400).json({ message: 'El email ya está registrado' });
                return;
            }
            // Procesar la imagen si existe
            if (file) {
                try {
                    const uploadResult = await this.uploadService.uploadImage(file, 'users');
                    userData.photoUrl = uploadResult.url;
                    userData.photoPublicId = uploadResult.public_id;
                }
                catch (error) {
                    console.error('Error al subir la imagen a Cloudinary:', error);
                    res.status(500).json({ message: 'Error al subir la imagen' });
                    return;
                }
            }
            // Crear el objeto UserCreateDTO
            const userCreateDTO = {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                fullName: userData.fullName,
                role: User_1.UserRole.TECH,
                isActive: true,
                phone: userData.phone,
                birthDate: userData.birthDate ? new Date(userData.birthDate) : undefined,
                photoUrl: userData.photoUrl,
                photoPublicId: userData.photoPublicId
            };
            const newUser = await UserRepository_1.userRepository.createUser(userCreateDTO);
            // Excluir la contraseña de la respuesta
            const { password: _, ...userWithoutPassword } = newUser;
            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user: userWithoutPassword
            });
        }
        catch (error) {
            console.error('Error en el registro de usuario:', error);
            res.status(500).json({
                message: 'Error en el servidor durante el registro',
                error: error.message
            });
        }
    }
    async getCurrentUser(req, res) {
        try {
            // El middleware debe haber añadido el userId a la request
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ message: 'No autenticado' });
                return;
            }
            const user = await UserRepository_1.userRepository.getUserById(userId);
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            // Excluir la contraseña de la respuesta
            const { password: _, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        }
        catch (error) {
            console.error('Error al obtener usuario actual:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
    async getAllUsers(req, res) {
        try {
            // Esta ruta debería estar protegida y solo accesible por administradores
            let users;
            // Verificar si hay un filtro de rol en la consulta
            const roleFilter = req.query.role;
            console.log('Filtro de rol recibido:', roleFilter);
            console.log('Todos los valores posibles de UserRole:', Object.values(User_1.UserRole));
            if (roleFilter) {
                console.log(`Intentando filtrar por rol: ${roleFilter}`);
                // Verificar si el valor del rol coincide exactamente con alguno de los enum
                if (Object.values(User_1.UserRole).includes(roleFilter)) {
                    console.log(`Rol válido encontrado: ${roleFilter}, obteniendo usuarios...`);
                    users = await UserRepository_1.userRepository.getUsersByRole(roleFilter);
                }
                else {
                    console.log(`Rol ${roleFilter} no coincide exactamente con ningún valor del enum. Buscando coincidencias parciales...`);
                    // Intentar encontrar una coincidencia aproximada
                    const roleValues = Object.values(User_1.UserRole);
                    const matchingRole = roleValues.find(role => role.toLowerCase() === roleFilter.toLowerCase());
                    if (matchingRole) {
                        console.log(`Coincidencia parcial encontrada para el rol ${roleFilter} -> ${matchingRole}`);
                        users = await UserRepository_1.userRepository.getUsersByRole(matchingRole);
                    }
                    else {
                        console.log(`No se encontró ninguna coincidencia para el rol ${roleFilter}, devolviendo todos los usuarios`);
                        users = await UserRepository_1.userRepository.getAllUsers();
                    }
                }
            }
            else {
                console.log('No se especificó filtro de rol, devolviendo todos los usuarios');
                users = await UserRepository_1.userRepository.getAllUsers();
            }
            console.log(`Usuarios encontrados: ${users.length}`);
            // Excluir las contraseñas de todos los usuarios
            const usersWithoutPasswords = users.map(user => {
                const { password: _, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
            res.status(200).json(usersWithoutPasswords);
        }
        catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
    async getUserById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const user = await UserRepository_1.userRepository.getUserById(id);
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            // Excluir la contraseña de la respuesta
            const { password: _, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        }
        catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
    async updateUser(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            // Verificar que el usuario existe
            const existingUser = await UserRepository_1.userRepository.getUserById(id);
            if (!existingUser) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            // Obtener los datos a actualizar
            const userData = req.body;
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
                const existingUsername = await UserRepository_1.userRepository.getUserByUsername(userData.username);
                if (existingUsername) {
                    res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
                    return;
                }
            }
            // Si se intenta cambiar el email, verificar que no exista otro usuario con ese email
            if (userData.email && userData.email !== existingUser.email) {
                const existingEmail = await UserRepository_1.userRepository.getUserByEmail(userData.email);
                if (existingEmail) {
                    res.status(400).json({ message: 'El email ya está registrado' });
                    return;
                }
            }
            // Actualizar el usuario
            const updatedUser = await UserRepository_1.userRepository.updateUser(id, userData);
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
        }
        catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
    async deleteUser(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const deletedUser = await UserRepository_1.userRepository.deleteUser(id);
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
        }
        catch (error) {
            console.error('Error al eliminar usuario:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
    async changePassword(req, res) {
        try {
            // El middleware debe haber añadido el userId a la request
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ message: 'No autenticado' });
                return;
            }
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.status(400).json({ message: 'Se requieren las contraseñas actual y nueva' });
                return;
            }
            const user = await UserRepository_1.userRepository.getUserById(userId);
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            // Verificar la contraseña actual
            const isValidPassword = await UserRepository_1.userRepository.verifyPassword(user, currentPassword);
            if (!isValidPassword) {
                res.status(401).json({ message: 'Contraseña actual incorrecta' });
                return;
            }
            // Actualizar la contraseña
            await UserRepository_1.userRepository.updateUser(userId, { password: newPassword });
            res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
        }
        catch (error) {
            console.error('Error al cambiar contraseña:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
    async googleCallback(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000/utassets'}/login?error=google_auth_failed`);
                return;
            }
            // Generar token JWT
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            // Establecer el token como cookie HTTP-only
            res.cookie('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 90 * 24 * 60 * 60 * 1000 // 90 días
            });
            // Actualizar último inicio de sesión
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            await UserRepository_1.userRepository.updateLastLogin(user.id, ip === null || ip === void 0 ? void 0 : ip.toString());
            // Redirigir al frontend con éxito
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000/utassets'}/login?google_auth=success`);
        }
        catch (error) {
            console.error('Error en callback de Google:', error);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000/utassets'}/login?error=server_error`);
        }
    }
    // Nuevo método para verificar tokens desde sistemas externos (SSO)
    async verifyToken(req, res) {
        try {
            const authHeader = req.headers['authorization'];
            let token = authHeader && authHeader.split(' ')[1];
            // Si no hay token en el header, intentar obtenerlo del body o query
            if (!token) {
                token = req.body.token || req.query.token;
            }
            if (!token) {
                res.status(401).json({
                    valid: false,
                    message: 'Token no proporcionado'
                });
                return;
            }
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                // Verificar que el usuario aún existe y está activo
                const user = await UserRepository_1.userRepository.getUserById(decoded.id);
                if (!user || !user.isActive) {
                    res.status(401).json({
                        valid: false,
                        message: 'Usuario no encontrado o inactivo'
                    });
                    return;
                }
                // Retornar información del usuario sin datos sensibles
                const { password: _, ...userWithoutPassword } = user;
                res.status(200).json({
                    valid: true,
                    user: userWithoutPassword,
                    message: 'Token válido'
                });
            }
            catch (jwtError) {
                res.status(401).json({
                    valid: false,
                    message: 'Token inválido o expirado'
                });
                return;
            }
        }
        catch (error) {
            console.error('Error al verificar token:', error);
            res.status(500).json({
                valid: false,
                message: 'Error interno del servidor'
            });
        }
    }
    // Método para login con redirección SSO
    async loginWithRedirect(req, res) {
        try {
            const { email, password } = req.body;
            const redirectUrl = req.query.redirect || req.body.redirect;
            const username = email;
            // Validar que se proporcionaron las credenciales
            if (!email || !password) {
                const errorUrl = redirectUrl ?
                    `${redirectUrl}?error=missing_credentials` :
                    `${process.env.FRONTEND_URL || 'http://localhost:3000/utassets'}/login?error=missing_credentials`;
                if (redirectUrl) {
                    res.redirect(errorUrl);
                    return;
                }
                else {
                    res.status(400).json({ message: 'Se requiere correo y contraseña' });
                    return;
                }
            }
            // Buscar el usuario por nombre de usuario o email
            let user = await UserRepository_1.userRepository.getUserByUsername(username);
            if (!user) {
                user = await UserRepository_1.userRepository.getUserByEmail(username);
            }
            if (!user) {
                const errorUrl = redirectUrl ?
                    `${redirectUrl}?error=invalid_credentials` :
                    `${process.env.FRONTEND_URL || 'http://localhost:3000/utassets'}/login?error=invalid_credentials`;
                if (redirectUrl) {
                    res.redirect(errorUrl);
                    return;
                }
                else {
                    res.status(401).json({ message: 'Credenciales inválidas' });
                    return;
                }
            }
            // Verificar si el usuario está activo
            if (!user.isActive) {
                const errorUrl = redirectUrl ?
                    `${redirectUrl}?error=user_inactive` :
                    `${process.env.FRONTEND_URL || 'http://localhost:3000/utassets'}/login?error=user_inactive`;
                if (redirectUrl) {
                    res.redirect(errorUrl);
                    return;
                }
                else {
                    res.status(401).json({ message: 'Usuario desactivado. Contacte al administrador.' });
                    return;
                }
            }
            // Verificar la contraseña
            const isValidPassword = await UserRepository_1.userRepository.verifyPassword(user, password);
            if (!isValidPassword) {
                const errorUrl = redirectUrl ?
                    `${redirectUrl}?error=invalid_credentials` :
                    `${process.env.FRONTEND_URL || 'http://localhost:3000/utassets'}/login?error=invalid_credentials`;
                if (redirectUrl) {
                    res.redirect(errorUrl);
                    return;
                }
                else {
                    res.status(401).json({ message: 'Credenciales inválidas' });
                    return;
                }
            }
            // Verificar confirmación de email (solo si no es OAuth)
            if (!user.isEmailConfirmed) {
                const errorUrl = redirectUrl ?
                    `${redirectUrl}?error=email_not_confirmed` :
                    `${process.env.FRONTEND_URL || 'http://localhost:3000/utassets'}/login?error=email_not_confirmed`;
                if (redirectUrl) {
                    res.redirect(errorUrl);
                    return;
                }
                else {
                    res.status(401).json({ message: 'Email no confirmado' });
                    return;
                }
            }
            // Actualizar último inicio de sesión
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            await UserRepository_1.userRepository.updateLastLogin(user.id, ip === null || ip === void 0 ? void 0 : ip.toString());
            // Generar token JWT
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            if (redirectUrl) {
                // Redirigir con el token
                const redirectUrlWithToken = `${redirectUrl}?token=${token}`;
                res.redirect(redirectUrlWithToken);
            }
            else {
                // Respuesta JSON normal
                const { password: _, ...userWithoutPassword } = user;
                res.status(200).json({
                    message: 'Inicio de sesión exitoso',
                    token,
                    user: userWithoutPassword
                });
            }
        }
        catch (error) {
            console.error('Error en login con redirección:', error);
            const redirectUrl = req.query.redirect || req.body.redirect;
            const errorUrl = redirectUrl ?
                `${redirectUrl}?error=server_error` :
                `${process.env.FRONTEND_URL || 'http://localhost:3000/utassets'}/login?error=server_error`;
            if (redirectUrl) {
                res.redirect(errorUrl);
            }
            else {
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        }
    }
    // ✨ NUEVO: Generar token de redirección para usuario ya autenticado
    async generateRedirectToken(req, res) {
        try {
            const user = req.user; // Usuario viene del middleware de autenticación
            const redirectUrl = req.query.redirect || req.body.redirect;
            if (!redirectUrl) {
                res.status(400).json({
                    message: 'URL de redirección requerida',
                    error: 'REDIRECT_URL_REQUIRED'
                });
                return;
            }
            console.log('🔄 [UTAssets] Generando token de redirección para usuario ya autenticado:', user.email);
            console.log('🎯 [UTAssets] URL de redirección:', redirectUrl);
            // Verificar que el usuario sigue activo
            const currentUser = await UserRepository_1.userRepository.getUserById(user.id);
            if (!currentUser || !currentUser.isActive) {
                res.status(401).json({
                    message: 'Usuario no encontrado o inactivo',
                    error: 'USER_INACTIVE'
                });
                return;
            }
            // Generar token JWT
            const token = jsonwebtoken_1.default.sign({
                id: currentUser.id,
                username: currentUser.username,
                email: currentUser.email,
                role: currentUser.role
            }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            console.log('✅ [UTAssets] Token generado exitosamente para:', currentUser.email);
            // Devolver el token y la URL completa
            const redirectUrlWithToken = `${redirectUrl}?token=${token}`;
            res.status(200).json({
                token,
                redirectUrl: redirectUrlWithToken,
                user: {
                    id: currentUser.id,
                    email: currentUser.email,
                    fullName: currentUser.fullName,
                    role: currentUser.role
                }
            });
        }
        catch (error) {
            console.error('❌ [UTAssets] Error generando token de redirección:', error);
            res.status(500).json({
                message: 'Error interno del servidor',
                error: 'INTERNAL_SERVER_ERROR'
            });
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
