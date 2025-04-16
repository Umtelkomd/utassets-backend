"use strict";
exports.__esModule = true;
exports.AppDataSource = void 0;
var typeorm_1 = require("typeorm");
var User_1 = require("../entity/User");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: true,
    entities: [User_1.User],
    migrations: ['src/migration/*.ts'],
    subscribers: []
});
