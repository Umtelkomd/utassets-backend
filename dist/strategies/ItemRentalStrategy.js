"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRentalStrategy = void 0;
class ItemRentalStrategy {
    calculateTotal(rental) {
        // Usar el campo days almacenado, o calcularlo como fallback
        const days = rental.days || this.calculateDays(rental.startDate, rental.endDate);
        const baseCost = rental.dailyCost * days;
        // Cálculo simple para items sin descuentos por grupo
        return baseCost;
    }
    validate(rental) {
        const validations = [
            this.validateDates(rental)
        ];
        const failedValidation = validations.find(v => !v.isValid);
        return failedValidation || { isValid: true };
    }
    getRequiredFields() {
        return ['inventoryId', 'startDate', 'endDate', 'days', 'dailyCost'];
    }
    getSpecificFields() {
        return {};
    }
    prepareMetadata(data) {
        return {};
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
    calculateDays(start, end) {
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
}
exports.ItemRentalStrategy = ItemRentalStrategy;
