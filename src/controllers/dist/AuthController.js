"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.authController = exports.AuthController = void 0;
var UserRepository_1 = require("../repositories/UserRepository");
var jsonwebtoken_1 = require("jsonwebtoken");
var User_1 = require("../entity/User");
var fs = require("fs");
var JWT_SECRET = process.env.JWT_SECRET || 'utassets_secret_key_2024_secure_token';
var JWT_EXPIRES_IN = '24h';
var AuthController = /** @class */ (function () {
    function AuthController() {
    }
    AuthController.prototype.login = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var _a, email, password, username, user, isValidPassword, ip, token, _, userWithoutPassword, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        _a = req.body, email = _a.email, password = _a.password;
                        username = email;
                        console.log('Datos recibidos:', { email: email, password: password });
                        // Validar que se proporcionaron las credenciales
                        if (!email || !password) {
                            console.log('Faltan credenciales:', { email: email, password: password });
                            res.status(400).json({ message: 'Se requiere correo y contraseña' });
                            return [2 /*return*/];
                        }
                        // Buscar el usuario por nombre de usuario o email
                        console.log('Buscando usuario por username:', username);
                        return [4 /*yield*/, UserRepository_1.userRepository.getUserByUsername(username)];
                    case 1:
                        user = _b.sent();
                        if (!!user) return [3 /*break*/, 3];
                        console.log('Usuario no encontrado por username, intentando por email:', username);
                        return [4 /*yield*/, UserRepository_1.userRepository.getUserByEmail(username)];
                    case 2:
                        user = _b.sent();
                        _b.label = 3;
                    case 3:
                        if (!user) {
                            console.log('Usuario no encontrado ni por username ni por email');
                            res.status(401).json({ message: 'Credenciales inválidas' });
                            return [2 /*return*/];
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
                            return [2 /*return*/];
                        }
                        // Verificar la contraseña
                        console.log('Verificando contraseña...');
                        return [4 /*yield*/, UserRepository_1.userRepository.verifyPassword(user, password)];
                    case 4:
                        isValidPassword = _b.sent();
                        if (!isValidPassword) {
                            console.log('Contraseña inválida');
                            res.status(401).json({ message: 'Credenciales inválidas' });
                            return [2 /*return*/];
                        }
                        console.log('Contraseña válida, generando token...');
                        ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                        return [4 /*yield*/, UserRepository_1.userRepository.updateLastLogin(user.id, ip === null || ip === void 0 ? void 0 : ip.toString())];
                    case 5:
                        _b.sent();
                        token = jsonwebtoken_1["default"].sign({
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            role: user.role
                        }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
                        _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                        res.status(200).json({
                            message: 'Inicio de sesión exitoso',
                            token: token,
                            user: userWithoutPassword
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _b.sent();
                        console.error('Error en el inicio de sesión:', error_1);
                        res.status(500).json({
                            message: 'Error en el servidor durante el inicio de sesión',
                            error: error_1.message
                        });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.register = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var userData, file, birthDate, currentDate, minDate, existingUsername, existingEmail, newUser, _, userWithoutPassword, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        userData = req.body;
                        file = req.file;
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
                            userData.fullName = userData.firstName + " " + userData.lastName;
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
                            return [2 /*return*/];
                        }
                        // Generar username del email si no se proporciona
                        if (!userData.username) {
                            userData.username = userData.email.split('@')[0];
                        }
                        // Validar la fecha de nacimiento si se proporciona
                        if (userData.birthDate) {
                            birthDate = new Date(userData.birthDate);
                            currentDate = new Date();
                            minDate = new Date('1900-01-01');
                            if (isNaN(birthDate.getTime())) {
                                // Si hay una imagen y hay error, eliminarla
                                if (file) {
                                    fs.unlinkSync(file.path);
                                }
                                res.status(400).json({
                                    message: 'La fecha de nacimiento no es válida'
                                });
                                return [2 /*return*/];
                            }
                            if (birthDate < minDate || birthDate > currentDate) {
                                // Si hay una imagen y hay error, eliminarla
                                if (file) {
                                    fs.unlinkSync(file.path);
                                }
                                res.status(400).json({
                                    message: 'La fecha de nacimiento debe estar entre 1900 y la fecha actual'
                                });
                                return [2 /*return*/];
                            }
                        }
                        return [4 /*yield*/, UserRepository_1.userRepository.getUserByUsername(userData.username)];
                    case 1:
                        existingUsername = _a.sent();
                        if (existingUsername) {
                            // Si hay una imagen y hay error, eliminarla
                            if (file) {
                                fs.unlinkSync(file.path);
                            }
                            res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, UserRepository_1.userRepository.getUserByEmail(userData.email)];
                    case 2:
                        existingEmail = _a.sent();
                        if (existingEmail) {
                            // Si hay una imagen y hay error, eliminarla
                            if (file) {
                                fs.unlinkSync(file.path);
                            }
                            res.status(400).json({ message: 'El email ya está registrado' });
                            return [2 /*return*/];
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
                        userData.role = User_1.UserRole.TECH;
                        return [4 /*yield*/, UserRepository_1.userRepository.createUser(userData)];
                    case 3:
                        newUser = _a.sent();
                        _ = newUser.password, userWithoutPassword = __rest(newUser, ["password"]);
                        res.status(201).json({
                            message: 'Usuario registrado exitosamente',
                            user: userWithoutPassword
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        // Si hay una imagen y hay error, eliminarla
                        if (req.file) {
                            fs.unlinkSync(req.file.path);
                        }
                        console.error('Error en el registro de usuario:', error_2);
                        res.status(500).json({
                            message: 'Error en el servidor durante el registro',
                            error: error_2.message
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.getCurrentUser = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var userId, user, _, userWithoutPassword, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        userId = req.userId;
                        if (!userId) {
                            res.status(401).json({ message: 'No autenticado' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, UserRepository_1.userRepository.getUserById(userId)];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            res.status(404).json({ message: 'Usuario no encontrado' });
                            return [2 /*return*/];
                        }
                        _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                        res.status(200).json(userWithoutPassword);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error al obtener usuario actual:', error_3);
                        res.status(500).json({
                            message: 'Error en el servidor',
                            error: error_3.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.getAllUsers = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var users, roleFilter_1, roleValues, matchingRole, usersWithoutPasswords, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 10, , 11]);
                        users = void 0;
                        roleFilter_1 = req.query.role;
                        console.log('Filtro de rol recibido:', roleFilter_1);
                        console.log('Todos los valores posibles de UserRole:', Object.values(User_1.UserRole));
                        if (!roleFilter_1) return [3 /*break*/, 7];
                        console.log("Intentando filtrar por rol: " + roleFilter_1);
                        if (!Object.values(User_1.UserRole).includes(roleFilter_1)) return [3 /*break*/, 2];
                        console.log("Rol v\u00E1lido encontrado: " + roleFilter_1 + ", obteniendo usuarios...");
                        return [4 /*yield*/, UserRepository_1.userRepository.getUsersByRole(roleFilter_1)];
                    case 1:
                        users = _a.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        console.log("Rol " + roleFilter_1 + " no coincide exactamente con ning\u00FAn valor del enum. Buscando coincidencias parciales...");
                        roleValues = Object.values(User_1.UserRole);
                        matchingRole = roleValues.find(function (role) {
                            return role.toLowerCase() === roleFilter_1.toLowerCase();
                        });
                        if (!matchingRole) return [3 /*break*/, 4];
                        console.log("Coincidencia parcial encontrada para el rol " + roleFilter_1 + " -> " + matchingRole);
                        return [4 /*yield*/, UserRepository_1.userRepository.getUsersByRole(matchingRole)];
                    case 3:
                        users = _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        console.log("No se encontr\u00F3 ninguna coincidencia para el rol " + roleFilter_1 + ", devolviendo todos los usuarios");
                        return [4 /*yield*/, UserRepository_1.userRepository.getAllUsers()];
                    case 5:
                        users = _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        console.log('No se especificó filtro de rol, devolviendo todos los usuarios');
                        return [4 /*yield*/, UserRepository_1.userRepository.getAllUsers()];
                    case 8:
                        users = _a.sent();
                        _a.label = 9;
                    case 9:
                        console.log("Usuarios encontrados: " + users.length);
                        usersWithoutPasswords = users.map(function (user) {
                            var _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                            return userWithoutPassword;
                        });
                        res.status(200).json(usersWithoutPasswords);
                        return [3 /*break*/, 11];
                    case 10:
                        error_4 = _a.sent();
                        console.error('Error al obtener usuarios:', error_4);
                        res.status(500).json({
                            message: 'Error en el servidor',
                            error: error_4.message
                        });
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.getUserById = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, user, _, userWithoutPassword, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, UserRepository_1.userRepository.getUserById(id)];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            res.status(404).json({ message: 'Usuario no encontrado' });
                            return [2 /*return*/];
                        }
                        _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                        res.status(200).json(userWithoutPassword);
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error al obtener usuario:', error_5);
                        res.status(500).json({
                            message: 'Error en el servidor',
                            error: error_5.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.updateUser = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, existingUser, userData, birthDate, currentDate, minDate, existingUsername, existingEmail, updatedUser, _, userWithoutPassword, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, UserRepository_1.userRepository.getUserById(id)];
                    case 1:
                        existingUser = _a.sent();
                        if (!existingUser) {
                            res.status(404).json({ message: 'Usuario no encontrado' });
                            return [2 /*return*/];
                        }
                        userData = req.body;
                        // Validar la fecha de nacimiento si se proporciona
                        if (userData.birthDate) {
                            birthDate = new Date(userData.birthDate);
                            currentDate = new Date();
                            minDate = new Date('1900-01-01');
                            if (isNaN(birthDate.getTime())) {
                                res.status(400).json({
                                    message: 'La fecha de nacimiento no es válida'
                                });
                                return [2 /*return*/];
                            }
                            if (birthDate < minDate || birthDate > currentDate) {
                                res.status(400).json({
                                    message: 'La fecha de nacimiento debe estar entre 1900 y la fecha actual'
                                });
                                return [2 /*return*/];
                            }
                        }
                        if (!(userData.username && userData.username !== existingUser.username)) return [3 /*break*/, 3];
                        return [4 /*yield*/, UserRepository_1.userRepository.getUserByUsername(userData.username)];
                    case 2:
                        existingUsername = _a.sent();
                        if (existingUsername) {
                            res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
                            return [2 /*return*/];
                        }
                        _a.label = 3;
                    case 3:
                        if (!(userData.email && userData.email !== existingUser.email)) return [3 /*break*/, 5];
                        return [4 /*yield*/, UserRepository_1.userRepository.getUserByEmail(userData.email)];
                    case 4:
                        existingEmail = _a.sent();
                        if (existingEmail) {
                            res.status(400).json({ message: 'El email ya está registrado' });
                            return [2 /*return*/];
                        }
                        _a.label = 5;
                    case 5: return [4 /*yield*/, UserRepository_1.userRepository.updateUser(id, userData)];
                    case 6:
                        updatedUser = _a.sent();
                        if (!updatedUser) {
                            res.status(500).json({ message: 'Error al actualizar el usuario' });
                            return [2 /*return*/];
                        }
                        _ = updatedUser.password, userWithoutPassword = __rest(updatedUser, ["password"]);
                        res.status(200).json({
                            message: 'Usuario actualizado exitosamente',
                            user: userWithoutPassword
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        error_6 = _a.sent();
                        console.error('Error al actualizar usuario:', error_6);
                        res.status(500).json({
                            message: 'Error en el servidor',
                            error: error_6.message
                        });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.deleteUser = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, deletedUser, _, userWithoutPassword, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, UserRepository_1.userRepository.deleteUser(id)];
                    case 1:
                        deletedUser = _a.sent();
                        if (!deletedUser) {
                            res.status(404).json({ message: 'Usuario no encontrado' });
                            return [2 /*return*/];
                        }
                        _ = deletedUser.password, userWithoutPassword = __rest(deletedUser, ["password"]);
                        res.status(200).json({
                            message: 'Usuario eliminado exitosamente',
                            user: userWithoutPassword
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('Error al eliminar usuario:', error_7);
                        res.status(500).json({
                            message: 'Error en el servidor',
                            error: error_7.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.changePassword = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var userId, _a, currentPassword, newPassword, user, isValidPassword, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        userId = req.userId;
                        if (!userId) {
                            res.status(401).json({ message: 'No autenticado' });
                            return [2 /*return*/];
                        }
                        _a = req.body, currentPassword = _a.currentPassword, newPassword = _a.newPassword;
                        if (!currentPassword || !newPassword) {
                            res.status(400).json({ message: 'Se requieren las contraseñas actual y nueva' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, UserRepository_1.userRepository.getUserById(userId)];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            res.status(404).json({ message: 'Usuario no encontrado' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, UserRepository_1.userRepository.verifyPassword(user, currentPassword)];
                    case 2:
                        isValidPassword = _b.sent();
                        if (!isValidPassword) {
                            res.status(401).json({ message: 'Contraseña actual incorrecta' });
                            return [2 /*return*/];
                        }
                        // Actualizar la contraseña
                        return [4 /*yield*/, UserRepository_1.userRepository.updateUser(userId, { password: newPassword })];
                    case 3:
                        // Actualizar la contraseña
                        _b.sent();
                        res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
                        return [3 /*break*/, 5];
                    case 4:
                        error_8 = _b.sent();
                        console.error('Error al cambiar contraseña:', error_8);
                        res.status(500).json({
                            message: 'Error en el servidor',
                            error: error_8.message
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return AuthController;
}());
exports.AuthController = AuthController;
exports.authController = new AuthController();
