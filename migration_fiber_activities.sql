-- ========================================
-- MIGRACIÓN: Cambiar fiber_activities a usar ID personalizado
-- ========================================
-- Fecha: 2025-10-16
-- Descripción: Cambiar de UUID auto-generado a IDs personalizados tipo "DGF_ACT_001"
-- ========================================

USE u743347598_utassets;

-- 1. Crear tabla de respaldo
DROP TABLE IF EXISTS fiber_activities_backup;
CREATE TABLE fiber_activities_backup AS SELECT * FROM fiber_activities;

-- 2. Verificar respaldo
SELECT COUNT(*) as 'Registros respaldados' FROM fiber_activities_backup;

-- 3. Eliminar tabla original
DROP TABLE fiber_activities;

-- 4. Crear nueva tabla con estructura correcta
CREATE TABLE fiber_activities (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    unit VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Insertar datos de ejemplo (las actividades por defecto)
INSERT INTO fiber_activities (id, description, unit, price) VALUES
('DGF_ACT_001', 'HÜP-GFTA-ONT, FUSION + ACTIVAC.+ BOHRUNG', 'UDS', 230.00),
('DGF_ACT_003', 'HÜP-GFTA-ONT, FUSION + BOHRUNG', 'UDS', 184.00),
('DGF_ACT_004', 'HÜP-GFTA-ONT, ACTIVATION PART', 'UDS', 46.00),
('DGF_BLOW_001', 'Blow 6/12/24 Glasfaserkabel (RD)', 'ML', 0.43),
('DGF_BLOW_002', 'Blow 48/96/144 Glasfaserkabel (RA)', 'ML', 0.62),
('DGF_BLOW_003', 'DP INSTALLATIONDP (TRAY, ROUTING PIPES INCL.)', 'UDS', 705.00),
('DGF_BLOW_004', 'POP INSTALATION POP +CONECTING TRAYS', 'UDS', 1300.00),
('GVG_BLOW_004', 'POP INSTALATION POP +CONECTING TRAYS', 'UDS', 2500.00),
('DGF_CW_204', 'zusätzliche Kopflöcher Einblasen (ÜB)', 'M3', 78.00),
('DGF_CW_205', 'zusätz. Kopflöcher Einblasen (Pflaster)', 'M3', 110.00),
('DGF_CW_206', 'zusätz. Kopflöcher Einblasen (Asphalt)', 'M3', 136.00),
('ING_FIX_003', 'HAUSBEGEHUNG INDIVIDUELLER POP GEBIET', 'Units', 36.00),
('ING_FIX_010', 'HAUSANSCHLUSS TERMIN', 'Termin', 2.60),
('ING_FIX_011', 'HAUSBEGEHUNG POP GEBIET KOMPLETER PAKET 35-45', 'Termin', 21.00),
('ING_FIX_012', 'CLAUSULA PROTECCION EXCESO +45% HBG', 'Termin', 33.00),
('ING_FIX_015', 'HAUSBEGEHUNG POP GEBIET KOMPLETER PAKET 35-45 GF+', 'Termin', 26.00);

-- 6. Verificar datos insertados
SELECT COUNT(*) as 'Actividades insertadas' FROM fiber_activities;
SELECT * FROM fiber_activities ORDER BY id;

-- ========================================
-- INSTRUCCIONES DE USO:
-- ========================================
-- 1. Conectarse a MySQL:
--    mysql -u u743347598_utassets -p
--
-- 2. Ejecutar este script:
--    source /ruta/al/archivo/migration_fiber_activities.sql
--
-- 3. Verificar resultado:
--    SELECT * FROM fiber_activities;
--
-- 4. Si todo está bien, reiniciar el backend:
--    pm2 restart utassets-api
--
-- 5. Si hay problemas, restaurar desde backup:
--    DROP TABLE fiber_activities;
--    CREATE TABLE fiber_activities AS SELECT * FROM fiber_activities_backup;
-- ========================================
