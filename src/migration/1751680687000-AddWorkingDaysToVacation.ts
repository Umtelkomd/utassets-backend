import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWorkingDaysToVacation1751680687000 implements MigrationInterface {
    name = 'AddWorkingDaysToVacation1751680687000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`vacation\` ADD \`working_days\` integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`vacation\` DROP COLUMN \`working_days\``);
    }
} 