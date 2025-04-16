"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVehicleAssignmentTable1743935893103 = void 0;
const typeorm_1 = require("typeorm");
class CreateVehicleAssignmentTable1743935893103 {
    async up(queryRunner) {
        // Crear la tabla de asignaciones de vehículos
        await queryRunner.createTable(new typeorm_1.Table({
            name: "vehicle_assignment",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "vehicle_id",
                    type: "int",
                    isNullable: false
                },
                {
                    name: "user_id",
                    type: "int",
                    isNullable: false
                },
                {
                    name: "assignment_type",
                    type: "enum",
                    enum: ["Responsable", "Conductor", "Mantenimiento"],
                    isNullable: false
                },
                {
                    name: "assignment_status",
                    type: "enum",
                    enum: ["Activa", "Finalizada", "Pendiente"],
                    default: "'Activa'",
                    isNullable: false
                },
                {
                    name: "start_date",
                    type: "timestamp",
                    isNullable: false
                },
                {
                    name: "end_date",
                    type: "timestamp",
                    isNullable: true
                },
                {
                    name: "notes",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                    isNullable: false
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                    onUpdate: "CURRENT_TIMESTAMP",
                    isNullable: false
                }
            ]
        }), true);
        // Crear clave foránea para vehicle_id
        await queryRunner.createForeignKey("vehicle_assignment", new typeorm_1.TableForeignKey({
            columnNames: ["vehicle_id"],
            referencedColumnNames: ["inventory_id"],
            referencedTableName: "vehicle",
            onDelete: "CASCADE"
        }));
        // Crear clave foránea para user_id
        await queryRunner.createForeignKey("vehicle_assignment", new typeorm_1.TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
            onDelete: "CASCADE"
        }));
    }
    async down(queryRunner) {
        // Eliminar claves foráneas primero
        const table = await queryRunner.getTable("vehicle_assignment");
        if (table) {
            const foreignKeyVehicle = table.foreignKeys.find(fk => fk.columnNames.indexOf("vehicle_id") !== -1);
            if (foreignKeyVehicle) {
                await queryRunner.dropForeignKey("vehicle_assignment", foreignKeyVehicle);
            }
            const foreignKeyUser = table.foreignKeys.find(fk => fk.columnNames.indexOf("user_id") !== -1);
            if (foreignKeyUser) {
                await queryRunner.dropForeignKey("vehicle_assignment", foreignKeyUser);
            }
        }
        // Eliminar la tabla
        await queryRunner.dropTable("vehicle_assignment");
    }
}
exports.CreateVehicleAssignmentTable1743935893103 = CreateVehicleAssignmentTable1743935893103;
