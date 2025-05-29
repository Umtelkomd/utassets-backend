"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleRentalStrategy = void 0;
const RentalStrategy_1 = require("./RentalStrategy");
class VehicleRentalStrategy extends RentalStrategy_1.BaseRentalStrategy {
    calculateTotal(rental) {
        var _a;
        const days = this.calculateDays(rental.startDate, rental.endDate);
        console.log('Fechas recibidas:', {
            startDate: rental.startDate,
            endDate: rental.endDate,
            daysCalculated: days
        });
        // Aseguramos que el costo diario sea exactamente 200.00
        const dailyCost = Math.round(rental.dailyCost * 100) / 100;
        console.log('Costos:', {
            dailyCostReceived: rental.dailyCost,
            dailyCostRounded: dailyCost
        });
        const baseCost = Math.round(dailyCost * days * 100) / 100;
        console.log('Cálculo base:', {
            dailyCost,
            days,
            baseCost
        });
        // Lógica específica para vehículos (cargo por kilometraje)
        const mileage = ((_a = rental.metadata) === null || _a === void 0 ? void 0 : _a.mileage) || 0;
        const mileageCharge = Math.round(mileage * 0.1 * 100) / 100; // $0.10 por kilómetro
        const total = Math.round((baseCost + mileageCharge) * 100) / 100;
        console.log('Total final:', {
            baseCost,
            mileageCharge,
            total
        });
        return total;
    }
    validate(rental) {
        var _a, _b, _c;
        const errors = [];
        if (!rental.vehicleId) {
            errors.push('Se requiere un vehículo');
        }
        if (!rental.startDate || !rental.endDate) {
            errors.push('Se requieren fechas de inicio y fin');
        }
        else if (rental.startDate > rental.endDate) {
            errors.push('La fecha de inicio no puede ser posterior a la fecha de fin');
        }
        if (!rental.dailyCost || rental.dailyCost <= 0) {
            errors.push('El costo diario debe ser mayor a 0');
        }
        if (!((_a = rental.metadata) === null || _a === void 0 ? void 0 : _a.dealerName)) {
            errors.push('Se requiere el nombre del concesionario');
        }
        if (!((_b = rental.metadata) === null || _b === void 0 ? void 0 : _b.dealerAddress)) {
            errors.push('Se requiere la dirección del concesionario');
        }
        if (!((_c = rental.metadata) === null || _c === void 0 ? void 0 : _c.dealerPhone)) {
            errors.push('Se requiere el teléfono del concesionario');
        }
        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }
    getRequiredFields() {
        return ['vehicleId', 'startDate', 'endDate', 'dailyCost', 'dealerName', 'dealerAddress', 'dealerPhone'];
    }
    getSpecificFields() {
        return {
            mileage: 0
        };
    }
    prepareMetadata(data) {
        return {
            dealerName: data.dealerName,
            dealerAddress: data.dealerAddress,
            dealerPhone: data.dealerPhone,
            mileage: data.mileage || 0
        };
    }
}
exports.VehicleRentalStrategy = VehicleRentalStrategy;
