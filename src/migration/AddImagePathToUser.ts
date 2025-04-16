import { MigrationInterface, QueryRunner } from "typeorm"

export class AddImagePathToUser1712434567893 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" 
            ADD COLUMN IF NOT EXISTS image_path varchar
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" 
            DROP COLUMN IF EXISTS image_path
        `);
    }
} 