"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddImagePathToUser1712434567893 = void 0;
class AddImagePathToUser1712434567893 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user" 
            ADD COLUMN IF NOT EXISTS image_path varchar
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user" 
            DROP COLUMN IF EXISTS image_path
        `);
    }
}
exports.AddImagePathToUser1712434567893 = AddImagePathToUser1712434567893;
