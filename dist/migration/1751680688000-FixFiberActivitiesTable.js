"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixFiberActivitiesTable1751680688000 = void 0;
const typeorm_1 = require("typeorm");
class FixFiberActivitiesTable1751680688000 {
    async up(queryRunner) {
        // Drop the table if it exists with wrong structure
        await queryRunner.query(`DROP TABLE IF EXISTS fiber_activities`);
        // Create the table with correct structure
        await queryRunner.createTable(new typeorm_1.Table({
            name: "fiber_activities",
            columns: [
                {
                    name: "id",
                    type: "varchar",
                    length: "50",
                    isPrimary: true
                },
                {
                    name: "description",
                    type: "varchar",
                    length: "255"
                },
                {
                    name: "unit",
                    type: "varchar",
                    length: "100"
                },
                {
                    name: "price",
                    type: "decimal",
                    precision: 10,
                    scale: 2
                },
                {
                    name: "createdAt",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updatedAt",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP",
                    onUpdate: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable("fiber_activities");
    }
}
exports.FixFiberActivitiesTable1751680688000 = FixFiberActivitiesTable1751680688000;
