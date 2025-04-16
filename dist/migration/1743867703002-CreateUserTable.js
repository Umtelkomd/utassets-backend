"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserTable1743867703002 = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../entity/User");
class CreateUserTable1743867703002 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: "user",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "username",
                    type: "varchar",
                    length: "100",
                    isUnique: true
                },
                {
                    name: "email",
                    type: "varchar",
                    length: "100",
                    isUnique: true
                },
                {
                    name: "password",
                    type: "varchar",
                    length: "255"
                },
                {
                    name: "role",
                    type: "enum",
                    enum: [User_1.UserRole.ADMIN, User_1.UserRole.TECH],
                    default: `'${User_1.UserRole.TECH}'`
                },
                {
                    name: "fullName",
                    type: "varchar",
                    length: "100"
                },
                {
                    name: "phone",
                    type: "varchar",
                    length: "20",
                    isNullable: true
                },
                {
                    name: "isActive",
                    type: "boolean",
                    default: true
                },
                {
                    name: "lastLoginIp",
                    type: "varchar",
                    length: "255",
                    isNullable: true
                },
                {
                    name: "lastLoginDate",
                    type: "timestamp",
                    isNullable: true
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                    onUpdate: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable("user");
    }
}
exports.CreateUserTable1743867703002 = CreateUserTable1743867703002;
