"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddVacationDaysToUser1751628344959 = void 0;
class AddVacationDaysToUser1751628344959 {
    constructor() {
        this.name = 'AddVacationDaysToUser1751628344959';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`vacation_days\` integer NOT NULL DEFAULT 25`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`vacation_days\``);
    }
}
exports.AddVacationDaysToUser1751628344959 = AddVacationDaysToUser1751628344959;
