import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddBatchIdToVacations1750095011109 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("vacation", new TableColumn({
            name: "batch_id",
            type: "varchar",
            length: "255",
            isNullable: true,
            comment: "Identificador para agrupar solicitudes de múltiples días que pertenecen a la misma solicitud original"
        }));

        // Crear índice para mejorar el rendimiento de las consultas agrupadas
        await queryRunner.query(`CREATE INDEX IDX_vacation_batch_id ON vacation (batch_id)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índice
        await queryRunner.query(`DROP INDEX IDX_vacation_batch_id ON vacation`);

        // Eliminar columna
        await queryRunner.dropColumn("vacation", "batch_id");
    }

}
