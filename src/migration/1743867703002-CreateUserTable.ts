import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { UserRole } from "../entity/User";

export class CreateUserTable1743867703002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
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
                    enum: [UserRole.ADMIN, UserRole.TECH],
                    default: `'${UserRole.TECH}'`
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

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("user");
    }

}
