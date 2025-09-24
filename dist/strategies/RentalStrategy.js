"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRentalStrategy = void 0;
class BaseRentalStrategy {
    calculateDays(start, end) {
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
    getRequiredFields() {
        throw new Error("Method not implemented.");
    }
    getSpecificFields() {
        throw new Error("Method not implemented.");
    }
    prepareMetadata(data) {
        throw new Error("Method not implemented.");
    }
}
exports.BaseRentalStrategy = BaseRentalStrategy;
