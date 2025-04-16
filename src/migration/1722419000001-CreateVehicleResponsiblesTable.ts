import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateVehicleResponsiblesTable1722419000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "vehicle_responsibles" (
                "vehicle_id" integer NOT NULL,
                "user_id" integer NOT NULL,
                CONSTRAINT "PK_vehicle_responsibles" PRIMARY KEY ("vehicle_id", "user_id"),
                CONSTRAINT "FK_vehicle_responsibles_vehicle" FOREIGN KEY ("vehicle_id") REFERENCES "vehicle"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_vehicle_responsibles_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_vehicle_responsibles_vehicle_id" ON "vehicle_responsibles" ("vehicle_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_vehicle_responsibles_user_id" ON "vehicle_responsibles" ("user_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_vehicle_responsibles_user_id"`);
        await queryRunner.query(`DROP INDEX "IDX_vehicle_responsibles_vehicle_id"`);
        await queryRunner.query(`DROP TABLE "vehicle_responsibles"`);
    }
} 