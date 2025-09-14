import { Rental, RentalType } from '../entity/Rental';
import { BaseRentalStrategy, ValidationResult } from './RentalStrategy';

export class VehicleRentalStrategy extends BaseRentalStrategy {
    calculateTotal(rental: Rental): number {
        // Usar el campo days almacenado, o calcularlo como fallback
        const days = rental.days || this.calculateDays(rental.startDate, rental.endDate);
        const baseCost = rental.dailyCost * days;

        return Number(baseCost.toFixed(2));
    }

    validate(rental: Rental): ValidationResult {
        const errors: string[] = [];

        if (!rental.vehicleId) {
            errors.push('Se requiere un vehículo');
        }

        if (!rental.startDate || !rental.endDate) {
            errors.push('Se requieren fechas de inicio y fin');
        } else if (rental.startDate > rental.endDate) {
            errors.push('La fecha de inicio no puede ser posterior a la fecha de fin');
        }

        if (!rental.dailyCost || rental.dailyCost <= 0) {
            errors.push('El costo diario debe ser mayor a 0');
        }

        if (!rental.metadata?.dealerName) {
            errors.push('Se requiere el nombre del concesionario');
        }

        if (!rental.metadata?.dealerAddress) {
            errors.push('Se requiere la dirección del concesionario');
        }

        if (!rental.metadata?.dealerPhone) {
            errors.push('Se requiere el teléfono del concesionario');
        }

        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    getRequiredFields(): string[] {
        return ['vehicleId', 'startDate', 'endDate', 'days', 'dailyCost', 'dealerName', 'dealerAddress', 'dealerPhone'];
    }

    getSpecificFields(): Record<string, any> {
        return {};
    }

    prepareMetadata(data: any): Record<string, any> {
        return {
            dealerName: data.dealerName,
            dealerAddress: data.dealerAddress,
            dealerPhone: data.dealerPhone
        };
    }
} 