import { Rental, RentalType } from '../entity/Rental';
import { RentalStrategy, ValidationResult } from './RentalStrategy';

export class ItemRentalStrategy implements RentalStrategy {
    calculateTotal(rental: Rental): number {
        // Usar el campo days almacenado, o calcularlo como fallback
        const days = rental.days || this.calculateDays(rental.startDate, rental.endDate);
        const baseCost = rental.dailyCost * days;

        // Cálculo simple para items sin descuentos por grupo
        return baseCost;
    }

    validate(rental: Rental): ValidationResult {
        const validations: ValidationResult[] = [
            this.validateDates(rental)
        ];

        const failedValidation = validations.find(v => !v.isValid);
        return failedValidation || { isValid: true };
    }

    getRequiredFields(): string[] {
        return ['inventoryId', 'startDate', 'endDate', 'days', 'dailyCost'];
    }

    getSpecificFields(): Record<string, any> {
        return {};
    }

    prepareMetadata(data: any): Record<string, any> {
        return {};
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

    private calculateDays(start: Date, end: Date): number {
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
} 