-- Esquema de la base de datos para el sistema de inventario
-- Crear la tabla principal para el inventario

CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    item_code VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    condition VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    acquisition_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    responsible_person VARCHAR(100) NOT NULL,
    notes TEXT,
    image_path VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento de las búsquedas
CREATE INDEX idx_inventory_item_code ON inventory(item_code);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_location ON inventory(location);
CREATE INDEX idx_inventory_responsible_person ON inventory(responsible_person);

-- Tabla para registrar el historial de mantenimiento
CREATE TABLE maintenance_history (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL,
    description TEXT,
    performed_by VARCHAR(100) NOT NULL,
    cost DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para registrar los movimientos (préstamos, devoluciones, asignaciones)
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, -- 'Préstamo', 'Devolución', 'Asignación', etc.
    from_location VARCHAR(100),
    to_location VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expected_return_date DATE,
    actual_return_date DATE,
    person_responsible VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Función para actualizar automáticamente el timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el timestamp cuando se modifica un registro
CREATE TRIGGER update_inventory_timestamp
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Tabla para categorías predefinidas (para facilitar la gestión de categorías)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunas categorías predefinidas
INSERT INTO categories (name, description) VALUES
('Equipo Electrónico', 'Computadoras, tabletas, teléfonos, etc.'),
('Herramienta Manual', 'Martillos, destornilladores, llaves, etc.'),
('Maquinaria', 'Equipos grandes como generadores, compresores, etc.'),
('Equipo de Seguridad', 'Cascos, chalecos, gafas de protección, etc.'),
('Equipo de Medición', 'Metros, niveles, multímetros, etc.'),
('Otro', 'Otros equipos y herramientas no clasificados anteriormente');

-- Tabla para proyectos (para asociar equipos a proyectos específicos)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    project_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) NOT NULL, -- 'Activo', 'Completado', 'Suspendido', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para actualizar el timestamp de proyectos
CREATE TRIGGER update_projects_timestamp
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Tabla de relación entre inventario y proyectos (muchos a muchos)
CREATE TABLE inventory_projects (
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    returned_date TIMESTAMP WITH TIME ZONE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    notes TEXT,
    PRIMARY KEY (inventory_id, project_id, assigned_date)
);

-- Función para verificar la disponibilidad antes de asignar a un proyecto
CREATE OR REPLACE FUNCTION check_inventory_availability()
RETURNS TRIGGER AS $$
DECLARE
    available_qty INTEGER;
BEGIN
    -- Obtener la cantidad disponible del item
    SELECT quantity INTO available_qty FROM inventory WHERE id = NEW.inventory_id;
    
    -- Verificar si hay suficiente cantidad disponible
    IF available_qty < NEW.quantity THEN
        RAISE EXCEPTION 'No hay suficiente cantidad disponible del item con ID %', NEW.inventory_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar disponibilidad antes de asignar a un proyecto
CREATE TRIGGER check_inventory_availability_trigger
BEFORE INSERT ON inventory_projects
FOR EACH ROW
EXECUTE FUNCTION check_inventory_availability();