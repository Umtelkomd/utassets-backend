import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateVehicleTable1722419000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "vehicle" (
                "id" SERIAL PRIMARY KEY,
                "license_plate" character varying NOT NULL,
                "brand" character varying NOT NULL,
                "model" character varying NOT NULL,
                "year" integer NOT NULL,
                "vin" character varying,
                "color" character varying,
                "vehicle_status" character varying NOT NULL,
                "mileage" integer,
                "fuel_type" character varying NOT NULL,
                "insurance_expiry_date" TIMESTAMP WITH TIME ZONE,
                "notes" text,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_vehicle_license_plate" ON "vehicle" ("license_plate")
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_vehicle_vin" ON "vehicle" ("vin") 
            WHERE "vin" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_vehicle_vin"`);
        await queryRunner.query(`DROP INDEX "idx_vehicle_license_plate"`);
        await queryRunner.query(`DROP TABLE "vehicle"`);
    }
} 