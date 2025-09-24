"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HousingRentalStrategy = void 0;
class HousingRentalStrategy {
    calculateTotal(rental) {
        var _a;
        const days = rental.days || this.calculateDays(rental.startDate, rental.endDate);
        const guestCount = ((_a = rental.metadata) === null || _a === void 0 ? void 0 : _a.guestCount) || 1;
        const total = rental.dailyCost * days * guestCount;
        return Number(total.toFixed(2));
    }
    validate(rental) {
        const validations = [
            this.validateDates(rental),
            this.validateHousingInfo(rental)
        ];
        const failedValidation = validations.find(v => !v.isValid);
        return failedValidation || { isValid: true };
    }
    getRequiredFields() {
        return [
            'housingId',
            'startDate',
            'endDate',
            'days',
            'dailyCost',
            'guestCount'
        ];
    }
    getSpecificFields() {
        return {
            guestCount: {
                type: 'number',
                required: true,
                min: 1,
                description: 'Número de huéspedes'
            }
        };
    }
    prepareMetadata(data) {
        return {
            guestCount: data.guestCount ? parseInt(data.guestCount, 10) : 1
        };
    }
    validateDates(rental) {
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
    validateHousingInfo(rental) {
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
    calculateDays(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('Fechas inválidas');
        }
        return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    }
}
exports.HousingRentalStrategy = HousingRentalStrategy;
