"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVehicleRelations1712434567891 = void 0;
class UpdateVehicleRelations1712434567891 {
    async up(queryRunner) {
        // Eliminar la restricción de clave foránea de inventory si existe
        await queryRunner.query(`
            ALTER TABLE vehicle 
            DROP CONSTRAINT IF EXISTS "FK_vehicle_inventory_id"
        `);
        // Eliminar la columna inventory_id
        await queryRunner.query(`
            ALTER TABLE vehicle 
            DROP COLUMN IF EXISTS inventory_id
        `);
        // Agregar la columna para el responsable
        await queryRunner.query(`
            ALTER TABLE vehicle 
            ADD COLUMN responsible_user_id integer
        `);
        // Agregar la restricción de clave foránea para el responsable
        await queryRunner.query(`
            ALTER TABLE vehicle 
            ADD CONSTRAINT "FK_vehicle_responsible_user" 
            FOREIGN KEY (responsible_user_id) 
            REFERENCES "user"(id)
        `);
    }
    async down(queryRunner) {
        // Eliminar la restricción de clave foránea del responsable
        await queryRunner.query(`
            ALTER TABLE vehicle 
            DROP CONSTRAINT IF EXISTS "FK_vehicle_responsible_user"
        `);
        // Eliminar la columna del responsable
        await queryRunner.query(`
            ALTER TABLE vehicle 
            DROP COLUMN IF EXISTS responsible_user_id
        `);
        // Restaurar la columna inventory_id
        await queryRunner.query(`
            ALTER TABLE vehicle 
            ADD COLUMN inventory_id integer
        `);
        // Restaurar la restricción de clave foránea de inventory
        await queryRunner.query(`
            ALTER TABLE vehicle 
            ADD CONSTRAINT "FK_vehicle_inventory_id" 
            FOREIGN KEY (inventory_id) 
            REFERENCES inventory(id)
        `);
    }
}
exports.UpdateVehicleRelations1712434567891 = UpdateVehicleRelations1712434567891;
