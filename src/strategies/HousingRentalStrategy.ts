import { Rental, RentalType } from '../entity/Rental';
import { RentalStrategy, ValidationResult } from './RentalStrategy';

export class HousingRentalStrategy implements RentalStrategy {
    calculateTotal(rental: Rental): number {
        const days = this.calculateDays(rental.startDate, rental.endDate);
        const baseCost = rental.dailyCost * days;

        // Lógica específica para viviendas (cargo por huésped adicional)
        const guestCount = rental.metadata?.guestCount || 1;
        const baseGuestCount = rental.metadata?.baseGuestCount || 2;
        const additionalGuestCharge = Math.max(0, guestCount - baseGuestCount) * 20; // $20 por huésped adicional

        return baseCost + (additionalGuestCharge * days);
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
            'dailyCost',
            'guestCount',
            'address',
            'bedrooms',
            'bathrooms'
        ];
    }

    getSpecificFields(): Record<string, any> {
        return {
            guestCount: {
                type: 'number',
                required: true,
                min: 1,
                description: 'Número de huéspedes'
            },
            address: {
                type: 'string',
                required: true,
                description: 'Dirección de la vivienda'
            },
            bedrooms: {
                type: 'number',
                required: true,
                min: 0,
                description: 'Número de habitaciones'
            },
            bathrooms: {
                type: 'number',
                required: true,
                min: 0,
                description: 'Número de baños'
            },
            baseGuestCount: {
                type: 'number',
                required: false,
                default: 2,
                description: 'Número base de huéspedes incluidos en el precio'
            },
            amenities: {
                type: 'array',
                required: false,
                items: { type: 'string' },
                description: 'Lista de amenidades disponibles'
            },
            rules: {
                type: 'string',
                required: false,
                description: 'Reglas de la vivienda'
            }
        };
    }

    prepareMetadata(data: any): Record<string, any> {
        return {
            guestCount: data.guestCount ? parseInt(data.guestCount, 10) : 1,
            address: data.address,
            bedrooms: data.bedrooms ? parseInt(data.bedrooms, 10) : 0,
            bathrooms: data.bathrooms ? parseInt(data.bathrooms, 10) : 0,
            baseGuestCount: data.baseGuestCount ? parseInt(data.baseGuestCount, 10) : 2,
            amenities: Array.isArray(data.amenities) ? data.amenities :
                data.amenities ? data.amenities.split(',').map((a: string) => a.trim()) : [],
            rules: data.rules
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

        if (!metadata.address) {
            return {
                isValid: false,
                message: 'La dirección es requerida',
                status: 400
            };
        }

        if (!metadata.bedrooms || metadata.bedrooms < 0) {
            return {
                isValid: false,
                message: 'El número de habitaciones no puede ser negativo',
                status: 400
            };
        }

        if (!metadata.bathrooms || metadata.bathrooms < 0) {
            return {
                isValid: false,
                message: 'El número de baños no puede ser negativo',
                status: 400
            };
        }

        return { isValid: true };
    }

    private calculateDays(start: Date, end: Date): number {
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
} 