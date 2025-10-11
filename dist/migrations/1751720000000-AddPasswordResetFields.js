"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPasswordResetFields1751720000000 = void 0;
const typeorm_1 = require("typeorm");
class AddPasswordResetFields1751720000000 {
    constructor() {
        this.name = 'AddPasswordResetFields1751720000000';
    }
    async up(queryRunner) {
        await queryRunner.addColumn('user', new typeorm_1.TableColumn({
            name: 'password_reset_token',
            type: 'varchar',
            isNullable: true
        }));
        await queryRunner.addColumn('user', new typeorm_1.TableColumn({
            name: 'password_reset_token_expires',
            type: 'timestamp',
            isNullable: true
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('user', 'password_reset_token_expires');
        await queryRunner.dropColumn('user', 'password_reset_token');
    }
}
exports.AddPasswordResetFields1751720000000 = AddPasswordResetFields1751720000000;
