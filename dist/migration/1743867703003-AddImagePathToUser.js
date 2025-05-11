"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddImagePathToUser1743867703003 = void 0;
class AddImagePathToUser1743867703003 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN "image_path" varchar(255) NULL
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "user"
            DROP COLUMN "image_path"
        `);
    }
}
exports.AddImagePathToUser1743867703003 = AddImagePathToUser1743867703003;
