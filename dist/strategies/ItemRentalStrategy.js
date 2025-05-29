"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRentalStrategy = void 0;
class ItemRentalStrategy {
    calculateTotal(rental) {
        var _a;
        // Usar el campo days almacenado, o calcularlo como fallback
        const days = rental.days || this.calculateDays(rental.startDate, rental.endDate);
        const baseCost = rental.dailyCost * days;
        // Lógica específica para items (descuento por grupo)
        const peopleCount = ((_a = rental.metadata) === null || _a === void 0 ? void 0 : _a.peopleCount) || 1;
        const groupDiscount = peopleCount > 5 ? 0.9 : 1;
        return baseCost * groupDiscount;
    }
    validate(rental) {
        const validations = [
            this.validateDates(rental),
            this.validatePeopleCount(rental)
        ];
        const failedValidation = validations.find(v => !v.isValid);
        return failedValidation || { isValid: true };
    }
    getRequiredFields() {
        return ['inventoryId', 'startDate', 'endDate', 'days', 'dailyCost', 'peopleCount'];
    }
    getSpecificFields() {
        return {
            peopleCount: {
                type: 'number',
                required: true,
                min: 1,
                description: 'Número de personas que usarán el item'
            }
        };
    }
    prepareMetadata(data) {
        return {
            peopleCount: data.peopleCount ? parseInt(data.peopleCount, 10) : 1
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
    validatePeopleCount(rental) {
        var _a;
        const peopleCount = (_a = rental.metadata) === null || _a === void 0 ? void 0 : _a.peopleCount;
        if (!peopleCount || peopleCount < 1) {
            return {
                isValid: false,
                message: 'El número de personas debe ser mayor a 0',
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
