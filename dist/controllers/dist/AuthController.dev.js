"use strict";

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authController = exports.AuthController = void 0;

var UserRepository_1 = require("../repositories/UserRepository");

var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));

var User_1 = require("../entity/User");

var JWT_SECRET = process.env.JWT_SECRET || 'utassets_secret_key_2024_secure_token';
var JWT_EXPIRES_IN = '24h';

var AuthController =
/*#__PURE__*/
function () {
  function AuthController() {
    _classCallCheck(this, AuthController);
  }

  _createClass(AuthController, [{
    key: "login",
    value: function login(req, res) {
      var _req$body, email, password, username, user, isValidPassword, ip, token, _user, _, userWithoutPassword;

      return regeneratorRuntime.async(function login$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _req$body = req.body, email = _req$body.email, password = _req$body.password;
              username = email;
              console.log('Datos recibidos:', {
                email: email,
                password: password
              }); // Validar que se proporcionaron las credenciales

              if (!(!email || !password)) {
                _context.next = 8;
                break;
              }

              console.log('Faltan credenciales:', {
                email: email,
                password: password
              });
              res.status(400).json({
                message: 'Se requiere correo y contraseña'
              });
              return _context.abrupt("return");

            case 8:
              // Buscar el usuario por nombre de usuario o email
              console.log('Buscando usuario por username:', username);
              _context.next = 11;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.getUserByUsername(username));

            case 11:
              user = _context.sent;

              if (user) {
                _context.next = 17;
                break;
              }

              console.log('Usuario no encontrado por username, intentando por email:', username);
              _context.next = 16;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.getUserByEmail(username));

            case 16:
              user = _context.sent;

            case 17:
              if (user) {
                _context.next = 21;
                break;
              }

              console.log('Usuario no encontrado ni por username ni por email');
              res.status(401).json({
                message: 'Credenciales inválidas'
              });
              return _context.abrupt("return");

            case 21:
              console.log('Usuario encontrado:', {
                id: user.id,
                username: user.username,
                email: user.email,
                isActive: user.isActive
              }); // Verificar si el usuario está activo

              if (user.isActive) {
                _context.next = 26;
                break;
              }

              console.log('Usuario inactivo');
              res.status(401).json({
                message: 'Usuario desactivado. Contacte al administrador.'
              });
              return _context.abrupt("return");

            case 26:
              // Verificar la contraseña
              console.log('Verificando contraseña...');
              _context.next = 29;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.verifyPassword(user, password));

            case 29:
              isValidPassword = _context.sent;

              if (isValidPassword) {
                _context.next = 34;
                break;
              }

              console.log('Contraseña inválida');
              res.status(401).json({
                message: 'Credenciales inválidas'
              });
              return _context.abrupt("return");

            case 34:
              console.log('Contraseña válida, generando token...'); // Actualizar último inicio de sesión

              ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
              _context.next = 38;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.updateLastLogin(user.id, ip === null || ip === void 0 ? void 0 : ip.toString()));

            case 38:
              // Generar token JWT
              token = jsonwebtoken_1["default"].sign({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
              }, JWT_SECRET, {
                expiresIn: JWT_EXPIRES_IN
              }); // Responder con el token y datos del usuario (excluyendo la contraseña)

              _user = user, _ = _user.password, userWithoutPassword = _objectWithoutProperties(_user, ["password"]);
              res.status(200).json({
                message: 'Inicio de sesión exitoso',
                token: token,
                user: userWithoutPassword
              });
              _context.next = 47;
              break;

            case 43:
              _context.prev = 43;
              _context.t0 = _context["catch"](0);
              console.error('Error en el inicio de sesión:', _context.t0);
              res.status(500).json({
                message: 'Error en el servidor durante el inicio de sesión',
                error: _context.t0.message
              });

            case 47:
            case "end":
              return _context.stop();
          }
        }
      }, null, null, [[0, 43]]);
    }
  }, {
    key: "register",
    value: function register(req, res) {
      var userData, existingUsername, existingEmail, newUser, _, userWithoutPassword;

      return regeneratorRuntime.async(function register$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              userData = req.body;
              console.log('Datos recibidos:', userData); // Validar datos de entrada básicos

              if (!(!userData.username || !userData.email || !userData.password || !userData.fullName)) {
                _context2.next = 6;
                break;
              }

              res.status(400).json({
                message: 'Datos incompletos. Se requiere nombre de usuario, email, contraseña y nombre completo'
              });
              return _context2.abrupt("return");

            case 6:
              _context2.next = 8;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.getUserByUsername(userData.username));

            case 8:
              existingUsername = _context2.sent;

              if (!existingUsername) {
                _context2.next = 12;
                break;
              }

              res.status(400).json({
                message: 'El nombre de usuario ya está en uso'
              });
              return _context2.abrupt("return");

            case 12:
              _context2.next = 14;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.getUserByEmail(userData.email));

            case 14:
              existingEmail = _context2.sent;

              if (!existingEmail) {
                _context2.next = 18;
                break;
              }

              res.status(400).json({
                message: 'El email ya está registrado'
              });
              return _context2.abrupt("return");

            case 18:
              // Por defecto, los usuarios nuevos se registran como técnicos
              // Solo un administrador puede cambiar este valor posteriormente
              userData.role = User_1.UserRole.TECH;
              _context2.next = 21;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.createUser(userData));

            case 21:
              newUser = _context2.sent;
              // Excluir la contraseña de la respuesta
              _ = newUser.password, userWithoutPassword = _objectWithoutProperties(newUser, ["password"]);
              res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user: userWithoutPassword
              });
              _context2.next = 30;
              break;

            case 26:
              _context2.prev = 26;
              _context2.t0 = _context2["catch"](0);
              console.error('Error en el registro de usuario:', _context2.t0);
              res.status(500).json({
                message: 'Error en el servidor durante el registro',
                error: _context2.t0.message
              });

            case 30:
            case "end":
              return _context2.stop();
          }
        }
      }, null, null, [[0, 26]]);
    }
  }, {
    key: "getCurrentUser",
    value: function getCurrentUser(req, res) {
      var userId, user, _, userWithoutPassword;

      return regeneratorRuntime.async(function getCurrentUser$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              // El middleware debe haber añadido el userId a la request
              userId = req.userId;

              if (userId) {
                _context3.next = 5;
                break;
              }

              res.status(401).json({
                message: 'No autenticado'
              });
              return _context3.abrupt("return");

            case 5:
              _context3.next = 7;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.getUserById(userId));

            case 7:
              user = _context3.sent;

              if (user) {
                _context3.next = 11;
                break;
              }

              res.status(404).json({
                message: 'Usuario no encontrado'
              });
              return _context3.abrupt("return");

            case 11:
              // Excluir la contraseña de la respuesta
              _ = user.password, userWithoutPassword = _objectWithoutProperties(user, ["password"]);
              res.status(200).json(userWithoutPassword);
              _context3.next = 19;
              break;

            case 15:
              _context3.prev = 15;
              _context3.t0 = _context3["catch"](0);
              console.error('Error al obtener usuario actual:', _context3.t0);
              res.status(500).json({
                message: 'Error en el servidor',
                error: _context3.t0.message
              });

            case 19:
            case "end":
              return _context3.stop();
          }
        }
      }, null, null, [[0, 15]]);
    }
  }, {
    key: "getAllUsers",
    value: function getAllUsers(req, res) {
      var users, roleFilter, roleValues, matchingRole, usersWithoutPasswords;
      return regeneratorRuntime.async(function getAllUsers$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              // Esta ruta debería estar protegida y solo accesible por administradores
              // Verificar si hay un filtro de rol en la consulta
              roleFilter = req.query.role;
              console.log('Filtro de rol recibido:', roleFilter);
              console.log('Todos los valores posibles de UserRole:', Object.values(User_1.UserRole));

              if (!roleFilter) {
                _context4.next = 29;
                break;
              }

              console.log("Intentando filtrar por rol: ".concat(roleFilter)); // Verificar si el valor del rol coincide exactamente con alguno de los enum

              if (!Object.values(User_1.UserRole).includes(roleFilter)) {
                _context4.next = 13;
                break;
              }

              console.log("Rol v\xE1lido encontrado: ".concat(roleFilter, ", obteniendo usuarios..."));
              _context4.next = 10;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.getUsersByRole(roleFilter));

            case 10:
              users = _context4.sent;
              _context4.next = 27;
              break;

            case 13:
              console.log("Rol ".concat(roleFilter, " no coincide exactamente con ning\xFAn valor del enum. Buscando coincidencias parciales...")); // Intentar encontrar una coincidencia aproximada

              roleValues = Object.values(User_1.UserRole);
              matchingRole = roleValues.find(function (role) {
                return role.toLowerCase() === roleFilter.toLowerCase();
              });

              if (!matchingRole) {
                _context4.next = 23;
                break;
              }

              console.log("Coincidencia parcial encontrada para el rol ".concat(roleFilter, " -> ").concat(matchingRole));
              _context4.next = 20;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.getUsersByRole(matchingRole));

            case 20:
              users = _context4.sent;
              _context4.next = 27;
              break;

            case 23:
              console.log("No se encontr\xF3 ninguna coincidencia para el rol ".concat(roleFilter, ", devolviendo todos los usuarios"));
              _context4.next = 26;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.getAllUsers());

            case 26:
              users = _context4.sent;

            case 27:
              _context4.next = 33;
              break;

            case 29:
              console.log('No se especificó filtro de rol, devolviendo todos los usuarios');
              _context4.next = 32;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.getAllUsers());

            case 32:
              users = _context4.sent;

            case 33:
              console.log("Usuarios encontrados: ".concat(users.length)); // Excluir las contraseñas de todos los usuarios

              usersWithoutPasswords = users.map(function (user) {
                var _ = user.password,
                    userWithoutPassword = _objectWithoutProperties(user, ["password"]);

                return userWithoutPassword;
              });
              res.status(200).json(usersWithoutPasswords);
              _context4.next = 42;
              break;

            case 38:
              _context4.prev = 38;
              _context4.t0 = _context4["catch"](0);
              console.error('Error al obtener usuarios:', _context4.t0);
              res.status(500).json({
                message: 'Error en el servidor',
                error: _context4.t0.message
              });

            case 42:
            case "end":
              return _context4.stop();
          }
        }
      }, null, null, [[0, 38]]);
    }
  }, {
    key: "getUserById",
    value: function getUserById(req, res) {
      var id, user, _, userWithoutPassword;

      return regeneratorRuntime.async(function getUserById$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              id = parseInt(req.params.id, 10);

              if (!isNaN(id)) {
                _context5.next = 5;
                break;
              }

              res.status(400).json({
                message: 'ID inválido'
              });
              return _context5.abrupt("return");

            case 5:
              _context5.next = 7;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.getUserById(id));

            case 7:
              user = _context5.sent;

              if (user) {
                _context5.next = 11;
                break;
              }

              res.status(404).json({
                message: 'Usuario no encontrado'
              });
              return _context5.abrupt("return");

            case 11:
              // Excluir la contraseña de la respuesta
              _ = user.password, userWithoutPassword = _objectWithoutProperties(user, ["password"]);
              res.status(200).json(userWithoutPassword);
              _context5.next = 19;
              break;

            case 15:
              _context5.prev = 15;
              _context5.t0 = _context5["catch"](0);
              console.error('Error al obtener usuario:', _context5.t0);
              res.status(500).json({
                message: 'Error en el servidor',
                error: _context5.t0.message
              });

            case 19:
            case "end":
              return _context5.stop();
          }
        }
      }, null, null, [[0, 15]]);
    }
  }, {
    key: "updateUser",
    value: function updateUser(req, res) {
      var id, existingUser, userData, existingUsername, existingEmail, updatedUser, _, userWithoutPassword;

      return regeneratorRuntime.async(function updateUser$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.prev = 0;
              id = parseInt(req.params.id, 10);

              if (!isNaN(id)) {
                _context6.next = 5;
                break;
              }

              res.status(400).json({
                message: 'ID inválido'
              });
              return _context6.abrupt("return");

            case 5:
              _context6.next = 7;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.getUserById(id));

            case 7:
              existingUser = _context6.sent;

              if (existingUser) {
                _context6.next = 11;
                break;
              }

              res.status(404).json({
                message: 'Usuario no encontrado'
              });
              return _context6.abrupt("return");

            case 11:
              // Obtener los datos a actualizar
              userData = req.body; // Si se intenta cambiar el username, verificar que no exista otro usuario con ese username

              if (!(userData.username && userData.username !== existingUser.username)) {
                _context6.next = 19;
                break;
              }

              _context6.next = 15;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.getUserByUsername(userData.username));

            case 15:
              existingUsername = _context6.sent;

              if (!existingUsername) {
                _context6.next = 19;
                break;
              }

              res.status(400).json({
                message: 'El nombre de usuario ya está en uso'
              });
              return _context6.abrupt("return");

            case 19:
              if (!(userData.email && userData.email !== existingUser.email)) {
                _context6.next = 26;
                break;
              }

              _context6.next = 22;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.getUserByEmail(userData.email));

            case 22:
              existingEmail = _context6.sent;

              if (!existingEmail) {
                _context6.next = 26;
                break;
              }

              res.status(400).json({
                message: 'El email ya está registrado'
              });
              return _context6.abrupt("return");

            case 26:
              _context6.next = 28;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.updateUser(id, userData));

            case 28:
              updatedUser = _context6.sent;

              if (updatedUser) {
                _context6.next = 32;
                break;
              }

              res.status(500).json({
                message: 'Error al actualizar el usuario'
              });
              return _context6.abrupt("return");

            case 32:
              // Excluir la contraseña de la respuesta
              _ = updatedUser.password, userWithoutPassword = _objectWithoutProperties(updatedUser, ["password"]);
              res.status(200).json({
                message: 'Usuario actualizado exitosamente',
                user: userWithoutPassword
              });
              _context6.next = 40;
              break;

            case 36:
              _context6.prev = 36;
              _context6.t0 = _context6["catch"](0);
              console.error('Error al actualizar usuario:', _context6.t0);
              res.status(500).json({
                message: 'Error en el servidor',
                error: _context6.t0.message
              });

            case 40:
            case "end":
              return _context6.stop();
          }
        }
      }, null, null, [[0, 36]]);
    }
  }, {
    key: "deleteUser",
    value: function deleteUser(req, res) {
      var id, deletedUser, _, userWithoutPassword;

      return regeneratorRuntime.async(function deleteUser$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              id = parseInt(req.params.id, 10);

              if (!isNaN(id)) {
                _context7.next = 5;
                break;
              }

              res.status(400).json({
                message: 'ID inválido'
              });
              return _context7.abrupt("return");

            case 5:
              _context7.next = 7;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.deleteUser(id));

            case 7:
              deletedUser = _context7.sent;

              if (deletedUser) {
                _context7.next = 11;
                break;
              }

              res.status(404).json({
                message: 'Usuario no encontrado'
              });
              return _context7.abrupt("return");

            case 11:
              // Excluir la contraseña de la respuesta
              _ = deletedUser.password, userWithoutPassword = _objectWithoutProperties(deletedUser, ["password"]);
              res.status(200).json({
                message: 'Usuario eliminado exitosamente',
                user: userWithoutPassword
              });
              _context7.next = 19;
              break;

            case 15:
              _context7.prev = 15;
              _context7.t0 = _context7["catch"](0);
              console.error('Error al eliminar usuario:', _context7.t0);
              res.status(500).json({
                message: 'Error en el servidor',
                error: _context7.t0.message
              });

            case 19:
            case "end":
              return _context7.stop();
          }
        }
      }, null, null, [[0, 15]]);
    }
  }, {
    key: "changePassword",
    value: function changePassword(req, res) {
      var userId, _req$body2, currentPassword, newPassword, user, isValidPassword;

      return regeneratorRuntime.async(function changePassword$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.prev = 0;
              // El middleware debe haber añadido el userId a la request
              userId = req.userId;

              if (userId) {
                _context8.next = 5;
                break;
              }

              res.status(401).json({
                message: 'No autenticado'
              });
              return _context8.abrupt("return");

            case 5:
              _req$body2 = req.body, currentPassword = _req$body2.currentPassword, newPassword = _req$body2.newPassword;

              if (!(!currentPassword || !newPassword)) {
                _context8.next = 9;
                break;
              }

              res.status(400).json({
                message: 'Se requieren las contraseñas actual y nueva'
              });
              return _context8.abrupt("return");

            case 9:
              _context8.next = 11;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.getUserById(userId));

            case 11:
              user = _context8.sent;

              if (user) {
                _context8.next = 15;
                break;
              }

              res.status(404).json({
                message: 'Usuario no encontrado'
              });
              return _context8.abrupt("return");

            case 15:
              _context8.next = 17;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.verifyPassword(user, currentPassword));

            case 17:
              isValidPassword = _context8.sent;

              if (isValidPassword) {
                _context8.next = 21;
                break;
              }

              res.status(401).json({
                message: 'Contraseña actual incorrecta'
              });
              return _context8.abrupt("return");

            case 21:
              _context8.next = 23;
              return regeneratorRuntime.awrap(UserRepository_1.userRepository.updateUser(userId, {
                password: newPassword
              }));

            case 23:
              res.status(200).json({
                message: 'Contraseña actualizada exitosamente'
              });
              _context8.next = 30;
              break;

            case 26:
              _context8.prev = 26;
              _context8.t0 = _context8["catch"](0);
              console.error('Error al cambiar contraseña:', _context8.t0);
              res.status(500).json({
                message: 'Error en el servidor',
                error: _context8.t0.message
              });

            case 30:
            case "end":
              return _context8.stop();
          }
        }
      }, null, null, [[0, 26]]);
    }
  }]);

  return AuthController;
}();

exports.AuthController = AuthController;
exports.authController = new AuthController();