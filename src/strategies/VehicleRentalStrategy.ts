import { Rental, RentalType } from '../entity/Rental';
import { BaseRentalStrategy, ValidationResult } from './RentalStrategy';

export class VehicleRentalStrategy extends BaseRentalStrategy {
    calculateTotal(rental: Rental): number {
        const days = this.calculateDays(rental.startDate, rental.endDate);
        console.log('Fechas recibidas:', {
            startDate: rental.startDate,
            endDate: rental.endDate,
            daysCalculated: days
        });

        // Aseguramos que el costo diario sea exactamente 200.00
        const dailyCost = Math.round(rental.dailyCost * 100) / 100;
        console.log('Costos:', {
            dailyCostReceived: rental.dailyCost,
            dailyCostRounded: dailyCost
        });

        const baseCost = Math.round(dailyCost * days * 100) / 100;
        console.log('Cálculo base:', {
            dailyCost,
            days,
            baseCost
        });

        // Lógica específica para vehículos (cargo por kilometraje)
        const mileage = rental.metadata?.mileage || 0;
        const mileageCharge = Math.round(mileage * 0.1 * 100) / 100; // $0.10 por kilómetro

        const total = Math.round((baseCost + mileageCharge) * 100) / 100;
        console.log('Total final:', {
            baseCost,
            mileageCharge,
            total
        });

        return total;
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
        return ['vehicleId', 'startDate', 'endDate', 'dailyCost', 'dealerName', 'dealerAddress', 'dealerPhone'];
    }

    getSpecificFields(): Record<string, any> {
        return {
            mileage: 0
        };
    }

    prepareMetadata(data: any): Record<string, any> {
        return {
            dealerName: data.dealerName,
            dealerAddress: data.dealerAddress,
            dealerPhone: data.dealerPhone,
            mileage: data.mileage || 0
        };
    }
} 