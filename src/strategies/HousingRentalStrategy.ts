import { Rental, RentalType } from '../entity/Rental';
import { RentalStrategy, ValidationResult } from './RentalStrategy';

export class HousingRentalStrategy implements RentalStrategy {
    calculateTotal(rental: Rental): number {
        const days = rental.days || this.calculateDays(rental.startDate, rental.endDate);
        const guestCount = rental.metadata?.guestCount || 1;
        const total = rental.dailyCost * days * guestCount;

        return Number(total.toFixed(2));
    }

    validate(rental: Rental): ValidationResult {
        const validations: ValidationResult[] = [
            this.validateDates(rental),
            this.validateHousingInfo(rental)
        ];

        const failedValidation = validations.find(v => !v.isValid);
        return failedValidation || { isValid: true };
    }

    getRequiredFields(): string[] {
        return [
            'housingId',
            'startDate',
            'endDate',
            'days',
            'dailyCost',
            'guestCount'
        ];
    }

    getSpecificFields(): Record<string, any> {
        return {
            guestCount: {
                type: 'number',
                required: true,
                min: 1,
                description: 'Número de huéspedes'
            }
        };
    }

    prepareMetadata(data: any): Record<string, any> {
        return {
            guestCount: data.guestCount ? parseInt(data.guestCount, 10) : 1
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

    private validateHousingInfo(rental: Rental): ValidationResult {
        const metadata = rental.metadata || {};

        if (!metadata.guestCount || metadata.guestCount < 1) {
            return {
                isValid: false,
                message: 'El número de huéspedes debe ser mayor a 0',
                status: 400
            };
        }

        return { isValid: true };
    }

    private calculateDays(start: Date | string, end: Date | string): number {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('Fechas inválidas');
        }

        return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    }
} 