"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBatchIdToVacations1750095011109 = void 0;
const typeorm_1 = require("typeorm");
class AddBatchIdToVacations1750095011109 {
    async up(queryRunner) {
        await queryRunner.addColumn("vacation", new typeorm_1.TableColumn({
            name: "batch_id",
            type: "varchar",
            length: "255",
            isNullable: true,
            comment: "Identificador para agrupar solicitudes de múltiples días que pertenecen a la misma solicitud original"
        }));
        // Crear índice para mejorar el rendimiento de las consultas agrupadas
        await queryRunner.query(`CREATE INDEX IDX_vacation_batch_id ON vacation (batch_id)`);
    }
    async down(queryRunner) {
        // Eliminar índice
        await queryRunner.query(`DROP INDEX IDX_vacation_batch_id ON vacation`);
        // Eliminar columna
        await queryRunner.dropColumn("vacation", "batch_id");
    }
}
exports.AddBatchIdToVacations1750095011109 = AddBatchIdToVacations1750095011109;
