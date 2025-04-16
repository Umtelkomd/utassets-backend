"use strict";

var __createBinding = void 0 && (void 0).__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);

  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function get() {
        return m[k];
      }
    };
  }

  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = void 0 && (void 0).__importStar || function () {
  var _ownKeys = function ownKeys(o) {
    _ownKeys = Object.getOwnPropertyNames || function (o) {
      var ar = [];

      for (var k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
      }

      return ar;
    };

    return _ownKeys(o);
  };

  return function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k = _ownKeys(mod), i = 0; i < k.length; i++) {
      if (k[i] !== "default") __createBinding(result, mod, k[i]);
    }

    __setModuleDefault(result, mod);

    return result;
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialize = exports.AppDataSource = void 0;

require("reflect-metadata");

var typeorm_1 = require("typeorm");

var dotenv = __importStar(require("dotenv")); // Cargar variables de entorno


dotenv.config();
var _process$env = process.env,
    DB_HOST = _process$env.DB_HOST,
    DB_PORT = _process$env.DB_PORT,
    DB_USERNAME = _process$env.DB_USERNAME,
    DB_PASSWORD = _process$env.DB_PASSWORD,
    DB_DATABASE = _process$env.DB_DATABASE,
    NODE_ENV = _process$env.NODE_ENV;
exports.AppDataSource = new typeorm_1.DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'utassets',
  synchronize: true,
  // Deshabilitado para evitar cambios accidentales
  logging: true,
  entities: ['src/entity/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

var initialize = function initialize() {
  return regeneratorRuntime.async(function initialize$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(exports.AppDataSource.initialize());

        case 3:
          console.log('Base de datos conectada con TypeORM');
          _context.next = 10;
          break;

        case 6:
          _context.prev = 6;
          _context.t0 = _context["catch"](0);
          console.error('Error al conectar la base de datos:', _context.t0);
          process.exit(1);

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 6]]);
};

exports.initialize = initialize;