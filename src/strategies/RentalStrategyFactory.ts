import { RentalType } from '../entity/Rental';
import { RentalStrategy } from './RentalStrategy';
import { ItemRentalStrategy } from './ItemRentalStrategy';
import { VehicleRentalStrategy } from './VehicleRentalStrategy';
import { HousingRentalStrategy } from './HousingRentalStrategy';

export class RentalStrategyFactory {
    private static instance: RentalStrategyFactory;
    private strategies: Map<RentalType, RentalStrategy>;

    private constructor() {
        this.strategies = new Map();
        this.initializeStrategies();
    }

    public static getInstance(): RentalStrategyFactory {
        if (!RentalStrategyFactory.instance) {
            RentalStrategyFactory.instance = new RentalStrategyFactory();
        }
        return RentalStrategyFactory.instance;
    }

    private initializeStrategies(): void {
        this.strategies.set(RentalType.ITEM, new ItemRentalStrategy());
        this.strategies.set(RentalType.VEHICLE, new VehicleRentalStrategy());
        this.strategies.set(RentalType.HOUSING, new HousingRentalStrategy());
    }

    public getStrategy(type: RentalType): RentalStrategy {
        const strategy = this.strategies.get(type);
        if (!strategy) {
            throw new Error(`No existe estrategia para el tipo de rental: ${type}`);
        }
        return strategy;
    }
} 