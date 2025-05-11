"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddImagePathToUser1743867703004 = void 0;
class AddImagePathToUser1743867703004 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS "image_path" varchar(255) NULL
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user"
            DROP COLUMN IF EXISTS "image_path"
        `);
    }
}
exports.AddImagePathToUser1743867703004 = AddImagePathToUser1743867703004;
