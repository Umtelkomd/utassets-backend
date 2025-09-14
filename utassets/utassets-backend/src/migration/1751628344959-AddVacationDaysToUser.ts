import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVacationDaysToUser1751628344959 implements MigrationInterface {
    name = 'AddVacationDaysToUser1751628344959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`vacation_days\` integer NOT NULL DEFAULT 25`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`vacation_days\``);
    }
} 