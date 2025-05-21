"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentalStrategyFactory = void 0;
const Rental_1 = require("../entity/Rental");
const ItemRentalStrategy_1 = require("./ItemRentalStrategy");
const VehicleRentalStrategy_1 = require("./VehicleRentalStrategy");
const HousingRentalStrategy_1 = require("./HousingRentalStrategy");
class RentalStrategyFactory {
    constructor() {
        this.strategies = new Map();
        this.initializeStrategies();
    }
    static getInstance() {
        if (!RentalStrategyFactory.instance) {
            RentalStrategyFactory.instance = new RentalStrategyFactory();
        }
        return RentalStrategyFactory.instance;
    }
    initializeStrategies() {
        this.strategies.set(Rental_1.RentalType.ITEM, new ItemRentalStrategy_1.ItemRentalStrategy());
        this.strategies.set(Rental_1.RentalType.VEHICLE, new VehicleRentalStrategy_1.VehicleRentalStrategy());
        this.strategies.set(Rental_1.RentalType.HOUSING, new HousingRentalStrategy_1.HousingRentalStrategy());
    }
    getStrategy(type) {
        const strategy = this.strategies.get(type);
        if (!strategy) {
            throw new Error(`No existe estrategia para el tipo de rental: ${type}`);
        }
        return strategy;
    }
}
exports.RentalStrategyFactory = RentalStrategyFactory;
