import { MigrationInterface, QueryRunner } from "typeorm"

export class FixVehicleUserRelations1743935893104 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminar la columna responsible_user_id si existe
        await queryRunner.query(`
            ALTER TABLE vehicle 
            DROP COLUMN IF EXISTS responsible_user_id
        `);

        // Eliminar la restricción de clave foránea si existe
        await queryRunner.query(`
            ALTER TABLE vehicle 
            DROP CONSTRAINT IF EXISTS "FK_vehicle_responsible_user"
        `);

        // Asegurarse de que la tabla vehicle_responsibles existe
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "vehicle_responsibles" (
                "vehicle_id" integer NOT NULL,
                "user_id" integer NOT NULL,
                CONSTRAINT "PK_vehicle_responsibles" PRIMARY KEY ("vehicle_id", "user_id"),
                CONSTRAINT "FK_vehicle_responsibles_vehicle" FOREIGN KEY ("vehicle_id") REFERENCES "vehicle"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_vehicle_responsibles_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
            )
        `);

        // Crear índices si no existen
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_vehicle_responsibles_vehicle_id" ON "vehicle_responsibles" ("vehicle_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_vehicle_responsibles_user_id" ON "vehicle_responsibles" ("user_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No revertimos los cambios ya que esto es una corrección
    }
} 