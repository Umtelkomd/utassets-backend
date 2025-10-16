/**
 * Calcula el número de días laborables entre dos fechas (excluyendo sábados y domingos)
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns Número de días laborables
 */
export function calculateWorkingDays(startDate: Date, endDate: Date): number {
    if (startDate > endDate) {
        throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    }

    let count = 0;
    let currentDate = new Date(startDate);

    // Incluir el día de inicio si no es fin de semana
    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado

        // Solo contar si no es sábado (6) ni domingo (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }

        // Avanzar al siguiente día
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
}

/**
 * Calcula el número de días laborables en un rango, excluyendo los días especificados
 * Considera días de media jornada (24 y 31 de diciembre) como 0.5 días
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @param excludeDates - Array de fechas a excluir (ej: feriados)
 * @returns Número de días laborables (puede incluir decimales)
 */
export function calculateWorkingDaysExcluding(
    startDate: Date,
    endDate: Date,
    excludeDates: Date[] = []
): number {
    if (startDate > endDate) {
        throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    }

    let count = 0;
    let currentDate = new Date(startDate);

    // Convertir fechas a excluir a strings para comparación
    const excludeStrings = excludeDates.map(date => date.toDateString());

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const currentDateString = currentDate.toDateString();

        // Solo contar si no es fin de semana y no está en la lista de exclusión
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !excludeStrings.includes(currentDateString)) {
            // Verificar si es día de media jornada (24 o 31 de diciembre)
            if (isHalfWorkDay(currentDate)) {
                count += 0.5;
            } else {
                count += 1;
            }
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
}

/**
 * Verifica si una fecha es un día de media jornada (24 y 31 de diciembre)
 * @param date - Fecha a verificar
 * @returns true si es día de media jornada
 */
export function isHalfWorkDay(date: Date): boolean {
    const day = date.getDate();
    const month = date.getMonth(); // 0 = Enero, 11 = Diciembre

    // 24 de diciembre o 31 de diciembre
    return month === 11 && (day === 24 || day === 31);
}

/**
 * Verifica si una fecha es un día laborable (lunes a viernes)
 * @param date - Fecha a verificar
 * @returns true si es día laborable, false si es fin de semana
 */
export function isWorkingDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6; // No es domingo ni sábado
}

/**
 * Verifica si una fecha es sábado
 * @param date - Fecha a verificar
 * @returns true si es sábado
 */
export function isSaturday(date: Date): boolean {
    return date.getDay() === 6;
}

/**
 * Calcula el número de sábados entre dos fechas (inclusive)
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns Número de sábados en el rango
 */
export function calculateSaturdays(startDate: Date, endDate: Date): number {
    if (startDate > endDate) {
        throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    }

    let count = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        if (currentDate.getDay() === 6) { // Es sábado
            count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
} 