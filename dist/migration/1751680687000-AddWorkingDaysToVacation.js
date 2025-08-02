"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddWorkingDaysToVacation1751680687000 = void 0;
class AddWorkingDaysToVacation1751680687000 {
    constructor() {
        this.name = 'AddWorkingDaysToVacation1751680687000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`vacation\` ADD \`working_days\` integer NOT NULL DEFAULT 0`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`vacation\` DROP COLUMN \`working_days\``);
    }
}
exports.AddWorkingDaysToVacation1751680687000 = AddWorkingDaysToVacation1751680687000;
