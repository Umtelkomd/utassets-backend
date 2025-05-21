import { Rental } from '../entity/Rental';

export interface ValidationResult {
    isValid: boolean;
    message?: string;
    status?: number;
}

export interface RentalStrategy {
    calculateTotal(rental: Rental): number;
    validate(rental: Rental): ValidationResult;
    getRequiredFields(): string[];
    getSpecificFields(): Record<string, any>;
    prepareMetadata(data: any): Record<string, any>;
} 