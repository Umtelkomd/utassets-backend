import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPasswordResetFields1751720000000 implements MigrationInterface {
    name = 'AddPasswordResetFields1751720000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('user', new TableColumn({
            name: 'password_reset_token',
            type: 'varchar',
            isNullable: true
        }));

        await queryRunner.addColumn('user', new TableColumn({
            name: 'password_reset_token_expires',
            type: 'timestamp',
            isNullable: true
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('user', 'password_reset_token_expires');
        await queryRunner.dropColumn('user', 'password_reset_token');
    }
}