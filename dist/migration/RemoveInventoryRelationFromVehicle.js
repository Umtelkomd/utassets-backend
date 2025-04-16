"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveInventoryRelationFromVehicle1712434567890 = void 0;
class RemoveInventoryRelationFromVehicle1712434567890 {
    async up(queryRunner) {
        // Primero eliminamos la restricción de clave foránea si existe
        await queryRunner.query(`
            ALTER TABLE vehicle 
            DROP CONSTRAINT IF EXISTS "FK_vehicle_inventory_id"
        `);
        // Luego eliminamos la columna inventory_id
        await queryRunner.query(`
            ALTER TABLE vehicle 
            DROP COLUMN IF EXISTS inventory_id
        `);
    }
    async down(queryRunner) {
        // En caso de necesitar revertir, agregamos la columna y la restricción nuevamente
        await queryRunner.query(`
            ALTER TABLE vehicle 
            ADD COLUMN inventory_id integer
        `);
        await queryRunner.query(`
            ALTER TABLE vehicle 
            ADD CONSTRAINT "FK_vehicle_inventory_id" 
            FOREIGN KEY (inventory_id) 
            REFERENCES inventory(id)
        `);
    }
}
exports.RemoveInventoryRelationFromVehicle1712434567890 = RemoveInventoryRelationFromVehicle1712434567890;
