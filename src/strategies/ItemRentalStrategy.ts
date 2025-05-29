import { Rental, RentalType } from '../entity/Rental';
import { RentalStrategy, ValidationResult } from './RentalStrategy';

export class ItemRentalStrategy implements RentalStrategy {
    calculateTotal(rental: Rental): number {
        // Usar el campo days almacenado, o calcularlo como fallback
        const days = rental.days || this.calculateDays(rental.startDate, rental.endDate);
        const baseCost = rental.dailyCost * days;

        // Lógica específica para items (descuento por grupo)
        const peopleCount = rental.metadata?.peopleCount || 1;
        const groupDiscount = peopleCount > 5 ? 0.9 : 1;

        return baseCost * groupDiscount;
    }

    validate(rental: Rental): ValidationResult {
        const validations: ValidationResult[] = [
            this.validateDates(rental),
            this.validatePeopleCount(rental)
        ];

        const failedValidation = validations.find(v => !v.isValid);
        return failedValidation || { isValid: true };
    }

    getRequiredFields(): string[] {
        return ['inventoryId', 'startDate', 'endDate', 'days', 'dailyCost', 'peopleCount'];
    }

    getSpecificFields(): Record<string, any> {
        return {
            peopleCount: {
                type: 'number',
                required: true,
                min: 1,
                description: 'Número de personas que usarán el item'
            }
        };
    }

    prepareMetadata(data: any): Record<string, any> {
        return {
            peopleCount: data.peopleCount ? parseInt(data.peopleCount, 10) : 1
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

    private validatePeopleCount(rental: Rental): ValidationResult {
        const peopleCount = rental.metadata?.peopleCount;

        if (!peopleCount || peopleCount < 1) {
            return {
                isValid: false,
                message: 'El número de personas debe ser mayor a 0',
                status: 400
            };
        }

        return { isValid: true };
    }

    private calculateDays(start: Date, end: Date): number {
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
} 