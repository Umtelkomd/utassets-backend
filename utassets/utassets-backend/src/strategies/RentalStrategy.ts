import { Rental, RentalType } from '../entity/Rental';

export interface ValidationResult {
    isValid: boolean;
    errors?: string[];
    status?: number;
    message?: string;
}

export interface RentalStrategy {
    validate(rental: Rental): ValidationResult;
    calculateTotal(rental: Rental): number;
    getRequiredFields(): string[];
    getSpecificFields(): Record<string, any>;
    prepareMetadata(data: any): Record<string, any>;
}

export abstract class BaseRentalStrategy implements RentalStrategy {
    protected calculateDays(start: Date, end: Date): number {
        // Aseguramos que las fechas sean objetos Date
        const startDate = new Date(start);
        const endDate = new Date(end);

        // Establecemos las horas a 0 para evitar problemas con zonas horarias
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        // Calculamos la diferencia en días y añadimos 1 para incluir el día final
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        console.log('Cálculo detallado de días:', {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            diffTime,
            diffDays
        });

        return diffDays;
    }

    abstract validate(rental: Rental): ValidationResult;
    abstract calculateTotal(rental: Rental): number;

    getRequiredFields(): string[] {
        throw new Error("Method not implemented.");
    }

    getSpecificFields(): Record<string, any> {
        throw new Error("Method not implemented.");
    }

    prepareMetadata(data: any): Record<string, any> {
        throw new Error("Method not implemented.");
    }
} 