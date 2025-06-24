import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailConfirmationFields1750791289312 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar campo is_email_confirmed con valor por defecto false
        await queryRunner.query(`
            ALTER TABLE "user" 
            ADD COLUMN "is_email_confirmed" boolean NOT NULL DEFAULT false
        `);

        // Agregar campo email_confirmation_token
        await queryRunner.query(`
            ALTER TABLE "user" 
            ADD COLUMN "email_confirmation_token" varchar
        `);

        // Agregar campo email_confirmation_token_expires
        await queryRunner.query(`
            ALTER TABLE "user" 
            ADD COLUMN "email_confirmation_token_expires" timestamp
        `);

        // Confirmar automáticamente los usuarios existentes
        await queryRunner.query(`
            UPDATE "user" 
            SET "is_email_confirmed" = true 
            WHERE "is_email_confirmed" = false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar las columnas en orden inverso
        await queryRunner.query(`
            ALTER TABLE "user" 
            DROP COLUMN "email_confirmation_token_expires"
        `);

        await queryRunner.query(`
            ALTER TABLE "user" 
            DROP COLUMN "email_confirmation_token"
        `);

        await queryRunner.query(`
            ALTER TABLE "user" 
            DROP COLUMN "is_email_confirmed"
        `);
    }

}
