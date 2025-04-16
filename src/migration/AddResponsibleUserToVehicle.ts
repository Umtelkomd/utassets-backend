import { MigrationInterface, QueryRunner } from "typeorm"

export class AddResponsibleUserToVehicle1712434567892 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar la columna para el responsable
        await queryRunner.query(`
            ALTER TABLE vehicle 
            ADD COLUMN IF NOT EXISTS responsible_user_id integer
        `);

        // Agregar la restricción de clave foránea para el responsable
        await queryRunner.query(`
            ALTER TABLE vehicle 
            ADD CONSTRAINT "FK_vehicle_responsible_user" 
            FOREIGN KEY (responsible_user_id) 
            REFERENCES "user" (id)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
    }
} 