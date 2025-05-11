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
exports.UserController = void 0;
var User_1 = require("../entity/User");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var User_2 = require("../entity/User");
var path = require("path");
var fs = require("fs");
var data_source_1 = require("../config/data-source");
var UserController = /** @class */ (function () {
    function UserController() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    UserController.prototype.createUser = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, username, email, password, fullName, role, birthDate, file, existingUser, hashedPassword, user, _, userWithoutPassword, token, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        _a = req.body, username = _a.username, email = _a.email, password = _a.password, fullName = _a.fullName, role = _a.role, birthDate = _a.birthDate;
                        file = req.file;
                        console.log('backend', req, res);
                        // Validar campos requeridos
                        if (!username || !email || !password || !fullName) {
                            // Si hay una imagen y hay error, eliminarla
                            if (file) {
                                fs.unlinkSync(file.path);
                            }
                            return [2 /*return*/, res.status(400).json({
                                    message: 'Faltan campos requeridos: username, email, password o fullName'
                                })];
                        }
                        return [4 /*yield*/, this.userRepository.findOne({
                                where: [
                                    { username: username },
                                    { email: email }
                                ]
                            })];
                    case 1:
                        existingUser = _b.sent();
                        if (existingUser) {
                            // Si hay una imagen y hay error, eliminarla
                            if (file) {
                                fs.unlinkSync(file.path);
                            }
                            return [2 /*return*/, res.status(400).json({ message: 'El usuario o email ya existe' })];
                        }
                        return [4 /*yield*/, bcrypt.hash(password, 10)];
                    case 2:
                        hashedPassword = _b.sent();
                        user = this.userRepository.create({
                            username: username,
                            email: email,
                            password: hashedPassword,
                            fullName: fullName,
                            role: role || User_2.UserRole.TECH,
                            birthDate: birthDate ? new Date(birthDate) : undefined,
                            isActive: true,
                            imagePath: file ? file.filename : null
                        });
                        // Guardar el usuario
                        return [4 /*yield*/, this.userRepository.save(user)];
                    case 3:
                        // Guardar el usuario
                        _b.sent();
                        _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                        // Generar token
                        if (!process.env.JWT_SECRET) {
                            throw new Error('JWT_SECRET no está definido');
                        }
                        token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
                        res.status(201).json({ user: userWithoutPassword, token: token });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        // Si hay una imagen y hay error, eliminarla
                        if (req.file) {
                            fs.unlinkSync(req.file.path);
                        }
                        console.error('Error al crear usuario:', error_1);
                        res.status(500).json({ message: 'Error al crear usuario' });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    UserController.prototype.updateUser = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, _a, username, email, fullName, phone, role, isActive, user, existingUser, _, userWithoutPassword, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        id = req.params.id;
                        _a = req.body, username = _a.username, email = _a.email, fullName = _a.fullName, phone = _a.phone, role = _a.role, isActive = _a.isActive;
                        return [4 /*yield*/, this.userRepository.findOne({ where: { id: parseInt(id) } })];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            return [2 /*return*/, res.status(404).json({ message: 'Usuario no encontrado' })];
                        }
                        if (!(username !== user.username || email !== user.email)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.userRepository.findOne({
                                where: [
                                    { username: username },
                                    { email: email }
                                ]
                            })];
                    case 2:
                        existingUser = _b.sent();
                        if (existingUser && existingUser.id !== parseInt(id)) {
                            return [2 /*return*/, res.status(400).json({ message: 'El usuario o email ya existe' })];
                        }
                        _b.label = 3;
                    case 3:
                        // Actualizar los campos
                        user.username = username || user.username;
                        user.email = email || user.email;
                        user.fullName = fullName || user.fullName;
                        user.phone = phone || user.phone;
                        user.role = role || user.role;
                        user.isActive = isActive !== undefined ? isActive : user.isActive;
                        return [4 /*yield*/, this.userRepository.save(user)];
                    case 4:
                        _b.sent();
                        _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                        res.json(userWithoutPassword);
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _b.sent();
                        console.error('Error al actualizar usuario:', error_2);
                        res.status(500).json({ message: 'Error al actualizar usuario' });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    UserController.prototype.updateUserImage = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, file, user, oldImagePath, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        file = req.file;
                        if (!file) {
                            return [2 /*return*/, res.status(400).json({ message: 'No se ha subido ninguna imagen' })];
                        }
                        return [4 /*yield*/, this.userRepository.findOne({ where: { id: parseInt(id) } })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, res.status(404).json({ message: 'Usuario no encontrado' })];
                        }
                        // Si ya tiene una imagen, eliminarla
                        if (user.imagePath) {
                            oldImagePath = path.join(__dirname, '..', '..', 'uploads', 'users', user.imagePath);
                            if (fs.existsSync(oldImagePath)) {
                                fs.unlinkSync(oldImagePath);
                            }
                        }
                        // Actualizar la ruta de la imagen
                        user.imagePath = file.filename;
                        return [4 /*yield*/, this.userRepository.save(user)];
                    case 2:
                        _a.sent();
                        res.json({ message: 'Imagen actualizada correctamente', imagePath: user.imagePath });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error al actualizar imagen de usuario:', error_3);
                        res.status(500).json({ message: 'Error al actualizar imagen de usuario' });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    UserController.prototype.deleteUserImage = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, user, imagePath, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        return [4 /*yield*/, this.userRepository.findOne({ where: { id: parseInt(id) } })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, res.status(404).json({ message: 'Usuario no encontrado' })];
                        }
                        if (!user.imagePath) {
                            return [2 /*return*/, res.status(400).json({ message: 'El usuario no tiene imagen' })];
                        }
                        imagePath = path.join(__dirname, '..', '..', 'uploads', 'users', user.imagePath);
                        if (fs.existsSync(imagePath)) {
                            fs.unlinkSync(imagePath);
                        }
                        // Actualizar el usuario
                        user.imagePath = null;
                        return [4 /*yield*/, this.userRepository.save(user)];
                    case 2:
                        _a.sent();
                        res.json({ message: 'Imagen eliminada correctamente' });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Error al eliminar imagen de usuario:', error_4);
                        res.status(500).json({ message: 'Error al eliminar imagen de usuario' });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    UserController.prototype.getUsers = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var users, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.userRepository.find({
                                select: ['id', 'username', 'email', 'fullName', 'phone', 'role', 'isActive', 'lastLoginDate', 'lastLoginIp', 'createdAt', 'updatedAt', 'imagePath']
                            })];
                    case 1:
                        users = _a.sent();
                        res.json(users);
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error al obtener usuarios:', error_5);
                        res.status(500).json({ message: 'Error al obtener usuarios' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UserController.prototype.getUserById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, user, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, this.userRepository.findOne({
                                where: { id: parseInt(id) },
                                select: ['id', 'username', 'email', 'fullName', 'phone', 'role', 'isActive', 'lastLoginDate', 'lastLoginIp', 'createdAt', 'updatedAt', 'imagePath']
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, res.status(404).json({ message: 'Usuario no encontrado' })];
                        }
                        res.json(user);
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Error al obtener usuario:', error_6);
                        res.status(500).json({ message: 'Error al obtener usuario' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return UserController;
}());
exports.UserController = UserController;
