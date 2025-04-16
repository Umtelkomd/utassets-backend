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
exports.__esModule = true;
var data_source_1 = require("../config/data-source");
var Inventory_1 = require("../entity/Inventory");
var items = [
    // Equipos de Medición y Prueba
    {
        itemName: "OTDR Fujikura FTB-1",
        itemCode: "OTDR-FTB1-001",
        category: "Equipos de Medición",
        quantity: 2,
        condition: "Nuevo",
        location: "Almacén Principal",
        acquisitionDate: new Date("2023-01-15"),
        notes: "Equipo de medición de alta precisión para fibra óptica"
    },
    {
        itemName: "Power Meter EXFO FPM-300",
        itemCode: "PWR-EXFO-001",
        category: "Equipos de Medición",
        quantity: 3,
        condition: "Nuevo",
        location: "Almacén Principal",
        acquisitionDate: new Date("2023-02-20"),
        notes: "Medidor de potencia óptica de alta precisión"
    },
    {
        itemName: "Visual Fault Locator AFL",
        itemCode: "VFL-AFL-001",
        category: "Equipos de Medición",
        quantity: 5,
        condition: "Nuevo",
        location: "Almacén Principal",
        acquisitionDate: new Date("2023-03-10"),
        notes: "Localizador visual de fallas en fibra óptica"
    },
    {
        itemName: "Identificador de Fibra Óptica AFL",
        itemCode: "IDF-AFL-001",
        category: "Equipos de Medición",
        quantity: 4,
        condition: "Nuevo",
        location: "Almacén Principal",
        acquisitionDate: new Date("2023-04-05"),
        notes: "Identificador de fibra óptica con detección de señal"
    },
    {
        itemName: "Kit de Pruebas de Continuidad",
        itemCode: "KIT-CONT-001",
        category: "Equipos de Medición",
        quantity: 6,
        condition: "Nuevo",
        location: "Almacén Principal",
        acquisitionDate: new Date("2023-05-12"),
        notes: "Kit completo para pruebas de continuidad en fibra óptica"
    },
    {
        itemName: "Analizador de Red Óptica",
        itemCode: "ANA-RED-001",
        category: "Equipos de Medición",
        quantity: 2,
        condition: "Nuevo",
        location: "Almacén Principal",
        acquisitionDate: new Date("2023-06-18"),
        notes: "Analizador completo para redes de fibra óptica"
    },
    {
        itemName: "Reflectómetro Óptico",
        itemCode: "REF-OPT-001",
        category: "Equipos de Medición",
        quantity: 3,
        condition: "Nuevo",
        location: "Almacén Principal",
        acquisitionDate: new Date("2023-07-22"),
        notes: "Reflectómetro para medición de pérdidas en fibra óptica"
    },
    {
        itemName: "Medidor de Atenuación",
        itemCode: "MED-ATT-001",
        category: "Equipos de Medición",
        quantity: 4,
        condition: "Nuevo",
        location: "Almacén Principal",
        acquisitionDate: new Date("2023-08-30"),
        notes: "Medidor de atenuación para fibra óptica"
    },
    // Herramientas de Instalación
    {
        itemName: "Bobina FO 12 Fibras SM (1km)",
        itemCode: "BOB-12F-001",
        category: "Material de Fibra",
        quantity: 10,
        condition: "Nuevo",
        location: "Almacén de Materiales",
        acquisitionDate: new Date("2023-09-15"),
        notes: "Bobina de fibra óptica monomodo 12 fibras"
    },
    {
        itemName: "Bobina FO 8 Fibras SM (500m)",
        itemCode: "BOB-8F-001",
        category: "Material de Fibra",
        quantity: 15,
        condition: "Nuevo",
        location: "Almacén de Materiales",
        acquisitionDate: new Date("2023-10-20"),
        notes: "Bobina de fibra óptica monomodo 8 fibras"
    },
    {
        itemName: "Bobina FO 24 Fibras SM (2km)",
        itemCode: "BOB-24F-001",
        category: "Material de Fibra",
        quantity: 8,
        condition: "Nuevo",
        location: "Almacén de Materiales",
        acquisitionDate: new Date("2023-11-05"),
        notes: "Bobina de fibra óptica monomodo 24 fibras"
    },
    {
        itemName: "Bobina FO 48 Fibras SM (1km)",
        itemCode: "BOB-48F-001",
        category: "Material de Fibra",
        quantity: 6,
        condition: "Nuevo",
        location: "Almacén de Materiales",
        acquisitionDate: new Date("2023-12-10"),
        notes: "Bobina de fibra óptica monomodo 48 fibras"
    },
    {
        itemName: "Bobina FO 96 Fibras SM (1km)",
        itemCode: "BOB-96F-001",
        category: "Material de Fibra",
        quantity: 4,
        condition: "Nuevo",
        location: "Almacén de Materiales",
        acquisitionDate: new Date("2024-01-15"),
        notes: "Bobina de fibra óptica monomodo 96 fibras"
    },
    {
        itemName: "Bobina FO 144 Fibras SM (1km)",
        itemCode: "BOB-144F-001",
        category: "Material de Fibra",
        quantity: 3,
        condition: "Nuevo",
        location: "Almacén de Materiales",
        acquisitionDate: new Date("2024-02-20"),
        notes: "Bobina de fibra óptica monomodo 144 fibras"
    },
    {
        itemName: "Bobina FO 12 Fibras MM (1km)",
        itemCode: "BOB-12F-MM-001",
        category: "Material de Fibra",
        quantity: 8,
        condition: "Nuevo",
        location: "Almacén de Materiales",
        acquisitionDate: new Date("2024-03-05"),
        notes: "Bobina de fibra óptica multimodo 12 fibras"
    },
    {
        itemName: "Bobina FO 24 Fibras MM (1km)",
        itemCode: "BOB-24F-MM-001",
        category: "Material de Fibra",
        quantity: 6,
        condition: "Nuevo",
        location: "Almacén de Materiales",
        acquisitionDate: new Date("2024-04-10"),
        notes: "Bobina de fibra óptica multimodo 24 fibras"
    },
    // Equipos de Fusión y Terminación
    {
        itemName: "Fusionadora Fujikura 70S",
        itemCode: "FUS-FUJ-001",
        category: "Equipos de Fusión",
        quantity: 2,
        condition: "Nuevo",
        location: "Laboratorio de Fusión",
        acquisitionDate: new Date("2024-05-15"),
        notes: "Fusionadora de alta precisión para fibra óptica"
    },
    {
        itemName: "Fusionadora Sumitomo Type-81C",
        itemCode: "FUS-SUM-001",
        category: "Equipos de Fusión",
        quantity: 2,
        condition: "Nuevo",
        location: "Laboratorio de Fusión",
        acquisitionDate: new Date("2024-06-20"),
        notes: "Fusionadora profesional para fibra óptica"
    },
    {
        itemName: "Peladora de Fibra Óptica AFL",
        itemCode: "PEL-AFL-001",
        category: "Herramientas",
        quantity: 5,
        condition: "Nuevo",
        location: "Laboratorio de Fusión",
        acquisitionDate: new Date("2024-07-05"),
        notes: "Peladora de alta precisión para fibra óptica"
    },
    {
        itemName: "Cortadora de Fibra Óptica Fujikura",
        itemCode: "COR-FUJ-001",
        category: "Herramientas",
        quantity: 4,
        condition: "Nuevo",
        location: "Laboratorio de Fusión",
        acquisitionDate: new Date("2024-08-10"),
        notes: "Cortadora de precisión para fibra óptica"
    },
    {
        itemName: "Kit de Terminación de Conectores SC",
        itemCode: "KIT-SC-001",
        category: "Kits de Terminación",
        quantity: 8,
        condition: "Nuevo",
        location: "Laboratorio de Terminación",
        acquisitionDate: new Date("2024-09-15"),
        notes: "Kit completo para terminación de conectores SC"
    },
    {
        itemName: "Kit de Terminación de Conectores LC",
        itemCode: "KIT-LC-001",
        category: "Kits de Terminación",
        quantity: 8,
        condition: "Nuevo",
        location: "Laboratorio de Terminación",
        acquisitionDate: new Date("2024-10-20"),
        notes: "Kit completo para terminación de conectores LC"
    },
    {
        itemName: "Kit de Empalme de Fibra Óptica",
        itemCode: "KIT-EMP-001",
        category: "Kits de Empalme",
        quantity: 6,
        condition: "Nuevo",
        location: "Laboratorio de Empalme",
        acquisitionDate: new Date("2024-11-05"),
        notes: "Kit completo para empalme de fibra óptica"
    },
    {
        itemName: "Kit de Terminación de Conectores FC",
        itemCode: "KIT-FC-001",
        category: "Kits de Terminación",
        quantity: 6,
        condition: "Nuevo",
        location: "Laboratorio de Terminación",
        acquisitionDate: new Date("2024-12-10"),
        notes: "Kit completo para terminación de conectores FC"
    },
    // Equipos de Laboratorio y Mantenimiento
    {
        itemName: "Microscopio de Inspección de Fibra Óptica",
        itemCode: "MIC-INS-001",
        category: "Equipos de Laboratorio",
        quantity: 3,
        condition: "Nuevo",
        location: "Laboratorio de Inspección",
        acquisitionDate: new Date("2025-01-15"),
        notes: "Microscopio para inspección de conectores ópticos"
    },
    {
        itemName: "Limpiador de Conectores Ópticos",
        itemCode: "LIM-CON-001",
        category: "Herramientas de Limpieza",
        quantity: 10,
        condition: "Nuevo",
        location: "Laboratorio de Limpieza",
        acquisitionDate: new Date("2025-02-20"),
        notes: "Kit de limpieza para conectores ópticos"
    },
    {
        itemName: "Kit de Reparación de Fibra Óptica",
        itemCode: "KIT-REP-001",
        category: "Kits de Reparación",
        quantity: 5,
        condition: "Nuevo",
        location: "Laboratorio de Reparación",
        acquisitionDate: new Date("2025-03-05"),
        notes: "Kit completo para reparación de fibra óptica"
    },
    {
        itemName: "Estación de Trabajo para Fibra Óptica",
        itemCode: "EST-TRB-001",
        category: "Equipos de Laboratorio",
        quantity: 2,
        condition: "Nuevo",
        location: "Laboratorio Principal",
        acquisitionDate: new Date("2025-04-10"),
        notes: "Estación de trabajo completa para fibra óptica"
    },
    {
        itemName: "Kit de Pruebas de Pérdida de Inserción",
        itemCode: "KIT-PER-001",
        category: "Kits de Pruebas",
        quantity: 4,
        condition: "Nuevo",
        location: "Laboratorio de Pruebas",
        acquisitionDate: new Date("2025-05-15"),
        notes: "Kit para medición de pérdidas de inserción"
    },
    {
        itemName: "Kit de Limpieza de Conectores",
        itemCode: "KIT-LIM-001",
        category: "Kits de Limpieza",
        quantity: 8,
        condition: "Nuevo",
        location: "Laboratorio de Limpieza",
        acquisitionDate: new Date("2025-06-20"),
        notes: "Kit completo para limpieza de conectores"
    },
    {
        itemName: "Kit de Herramientas de Fibra Óptica",
        itemCode: "KIT-HER-001",
        category: "Kits de Herramientas",
        quantity: 6,
        condition: "Nuevo",
        location: "Almacén de Herramientas",
        acquisitionDate: new Date("2025-07-05"),
        notes: "Kit completo de herramientas para fibra óptica"
    },
    {
        itemName: "Estación de Trabajo Portátil",
        itemCode: "EST-POR-001",
        category: "Equipos de Campo",
        quantity: 4,
        condition: "Nuevo",
        location: "Almacén de Equipos",
        acquisitionDate: new Date("2025-08-10"),
        notes: "Estación de trabajo portátil para campo"
    },
    // Accesorios y Consumibles
    {
        itemName: "Conectores SC/UPC (Caja 100)",
        itemCode: "CON-SC-001",
        category: "Conectores",
        quantity: 20,
        condition: "Nuevo",
        location: "Almacén de Conectores",
        acquisitionDate: new Date("2025-09-15"),
        notes: "Caja de 100 conectores SC/UPC"
    },
    {
        itemName: "Conectores LC/UPC (Caja 100)",
        itemCode: "CON-LC-001",
        category: "Conectores",
        quantity: 20,
        condition: "Nuevo",
        location: "Almacén de Conectores",
        acquisitionDate: new Date("2025-10-20"),
        notes: "Caja de 100 conectores LC/UPC"
    },
    {
        itemName: "Conectores FC/UPC (Caja 100)",
        itemCode: "CON-FC-001",
        category: "Conectores",
        quantity: 15,
        condition: "Nuevo",
        location: "Almacén de Conectores",
        acquisitionDate: new Date("2025-11-05"),
        notes: "Caja de 100 conectores FC/UPC"
    },
    {
        itemName: "Cajas de Empalme 12 Fibras",
        itemCode: "CAJ-12F-001",
        category: "Cajas de Empalme",
        quantity: 30,
        condition: "Nuevo",
        location: "Almacén de Cajas",
        acquisitionDate: new Date("2025-12-10"),
        notes: "Cajas de empalme para 12 fibras"
    },
    {
        itemName: "Cajas de Empalme 24 Fibras",
        itemCode: "CAJ-24F-001",
        category: "Cajas de Empalme",
        quantity: 25,
        condition: "Nuevo",
        location: "Almacén de Cajas",
        acquisitionDate: new Date("2026-01-15"),
        notes: "Cajas de empalme para 24 fibras"
    },
    {
        itemName: "Cajas de Empalme 48 Fibras",
        itemCode: "CAJ-48F-001",
        category: "Cajas de Empalme",
        quantity: 20,
        condition: "Nuevo",
        location: "Almacén de Cajas",
        acquisitionDate: new Date("2026-02-20"),
        notes: "Cajas de empalme para 48 fibras"
    },
    {
        itemName: "Tubos Termorretráctiles",
        itemCode: "TUB-TER-001",
        category: "Materiales de Empalme",
        quantity: 50,
        condition: "Nuevo",
        location: "Almacén de Materiales",
        acquisitionDate: new Date("2026-03-05"),
        notes: "Tubos termorretráctiles para protección de empalmes"
    },
    {
        itemName: "Cinta de Empalme",
        itemCode: "CIN-EMP-001",
        category: "Materiales de Empalme",
        quantity: 40,
        condition: "Nuevo",
        location: "Almacén de Materiales",
        acquisitionDate: new Date("2026-04-10"),
        notes: "Cinta especial para empalmes de fibra óptica"
    }
];
function insertItems() {
    return __awaiter(this, void 0, void 0, function () {
        var inventoryRepository, _i, items_1, item, newItem, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, 7, 9]);
                    return [4 /*yield*/, data_source_1.AppDataSource.initialize()];
                case 1:
                    _a.sent();
                    inventoryRepository = data_source_1.AppDataSource.getRepository(Inventory_1.Inventory);
                    _i = 0, items_1 = items;
                    _a.label = 2;
                case 2:
                    if (!(_i < items_1.length)) return [3 /*break*/, 5];
                    item = items_1[_i];
                    newItem = inventoryRepository.create(item);
                    return [4 /*yield*/, inventoryRepository.save(newItem)];
                case 3:
                    _a.sent();
                    console.log("Item creado: " + item.itemName);
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('Todos los items han sido creados exitosamente');
                    return [3 /*break*/, 9];
                case 6:
                    error_1 = _a.sent();
                    console.error('Error al crear los items:', error_1);
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, data_source_1.AppDataSource.destroy()];
                case 8:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
insertItems();
