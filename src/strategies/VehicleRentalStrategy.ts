import { Rental, RentalType } from '../entity/Rental';
import { RentalStrategy, ValidationResult } from './RentalStrategy';

export class VehicleRentalStrategy implements RentalStrategy {
    calculateTotal(rental: Rental): number {
        const days = this.calculateDays(rental.startDate, rental.endDate);
        const baseCost = rental.dailyCost * days;

        // Lógica específica para vehículos (cargo por kilometraje)
        const mileage = rental.metadata?.mileage || 0;
        const mileageCharge = mileage * 0.1; // $0.10 por kilómetro

        return baseCost + mileageCharge;
    }

    validate(rental: Rental): ValidationResult {
        const validations: ValidationResult[] = [
            this.validateDates(rental),
            this.validateDealerInfo(rental)
        ];

        const failedValidation = validations.find(v => !v.isValid);
        return failedValidation || { isValid: true };
    }

    getRequiredFields(): string[] {
        return [
            'vehicleId',
            'startDate',
            'endDate',
            'dailyCost',
            'dealerName',
            'dealerAddress',
            'dealerPhone'
        ];
    }

    getSpecificFields(): Record<string, any> {
        return {
            dealerName: {
                type: 'string',
                required: true,
                description: 'Nombre del concesionario'
            },
            dealerAddress: {
                type: 'string',
                required: true,
                description: 'Dirección del concesionario'
            },
            dealerPhone: {
                type: 'string',
                required: true,
                description: 'Teléfono del concesionario'
            },
            mileage: {
                type: 'number',
                required: false,
                min: 0,
                description: 'Kilometraje del vehículo'
            }
        };
    }

    prepareMetadata(data: any): Record<string, any> {
        return {
            dealerName: data.dealerName,
            dealerAddress: data.dealerAddress,
            dealerPhone: data.dealerPhone,
            mileage: data.mileage ? parseFloat(data.mileage) : 0
        };
    }

    private validateDates(rental: Rental): ValidationResult {
        if (!rental.startDate || !rental.endDate) {
            return {
                isValid: false,
                message: 'Las fechas son requeridas',
                status: 400
            };
        }

        if (rental.startDate >= rental.endDate) {
            return {
                isValid: false,
                message: 'La fecha de inicio debe ser anterior a la fecha de fin',
                status: 400
            };
        }

        return { isValid: true };
    }

    private validateDealerInfo(rental: Rental): ValidationResult {
        const metadata = rental.metadata || {};

        if (!metadata.dealerName || !metadata.dealerAddress || !metadata.dealerPhone) {
            return {
                isValid: false,
                message: 'Se requiere información completa del concesionario',
                status: 400
            };
        }

        return { isValid: true };
    }

    private calculateDays(start: Date, end: Date): number {
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
} 