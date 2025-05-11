"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../config/data-source");
const Inventory_1 = require("../entity/Inventory");
const items = [
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
async function insertItems() {
    try {
        await data_source_1.AppDataSource.initialize();
        const inventoryRepository = data_source_1.AppDataSource.getRepository(Inventory_1.Inventory);
        for (const item of items) {
            const newItem = inventoryRepository.create(item);
            await inventoryRepository.save(newItem);
            console.log(`Item creado: ${item.itemName}`);
        }
        console.log('Todos los items han sido creados exitosamente');
    }
    catch (error) {
        console.error('Error al crear los items:', error);
    }
    finally {
        await data_source_1.AppDataSource.destroy();
    }
}
insertItems();
