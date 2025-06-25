export interface PaymentScheduleItem {
    paymentNumber: number;
    scheduledDate: Date;
    scheduledAmount: number;
    principalAmount: number;
    interestAmount: number;
    remainingBalance: number;
}

export interface FinancingCalculation {
    monthlyPayment: number;
    totalInterest: number;
    totalAmount: number;
    paymentSchedule: PaymentScheduleItem[];
}

export interface FinancingSummary {
    totalFinanced: number;
    totalPaid: number;
    remainingBalance: number;
    paymentsMade: number;
    paymentsRemaining: number;
    percentageComplete: number;
    nextPaymentDate: Date | null;
    nextPaymentAmount: number;
    daysUntilNextPayment: number;
    monthsRemaining: number;
    isOverdue: boolean;
    overdueAmount: number;
}

export class FinancingCalculationService {
    /**
     * Calcula la cuota mensual usando la fórmula de amortización francesa
     */
    static calculateMonthlyPayment(
        loanAmount: number,
        interestRate: number,
        termMonths: number
    ): number {
        if (interestRate === 0) {
            return loanAmount / termMonths;
        }

        const monthlyRate = interestRate / 100 / 12;
        const monthlyPayment = loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
            (Math.pow(1 + monthlyRate, termMonths) - 1);

        return Math.round(monthlyPayment * 100) / 100;
    }

    /**
     * Genera la tabla de amortización completa
     */
    static generatePaymentSchedule(
        loanAmount: number,
        interestRate: number,
        termMonths: number,
        startDate: Date,
        downPayment: number = 0
    ): FinancingCalculation {
        const netLoanAmount = loanAmount - downPayment;
        const monthlyPayment = this.calculateMonthlyPayment(netLoanAmount, interestRate, termMonths);
        const monthlyRate = interestRate / 100 / 12;

        let remainingBalance = netLoanAmount;
        const paymentSchedule: PaymentScheduleItem[] = [];
        let totalInterest = 0;

        for (let i = 1; i <= termMonths; i++) {
            const interestAmount = remainingBalance * monthlyRate;
            let principalAmount = monthlyPayment - interestAmount;

            // Ajustar último pago si hay diferencia por redondeo
            if (i === termMonths) {
                principalAmount = remainingBalance;
            }

            remainingBalance -= principalAmount;
            totalInterest += interestAmount;

            // ✅ CORREGIDO: Manejo seguro de fechas
            const scheduledDate = this.addMonthsToDate(startDate, i);

            paymentSchedule.push({
                paymentNumber: i,
                scheduledDate,
                scheduledAmount: Math.round((principalAmount + interestAmount) * 100) / 100,
                principalAmount: Math.round(principalAmount * 100) / 100,
                interestAmount: Math.round(interestAmount * 100) / 100,
                remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100)
            });
        }

        // Calcular el total a pagar sumando todas las cuotas (más preciso)
        const totalToPay = paymentSchedule.reduce((sum, payment) => sum + payment.scheduledAmount, 0);

        return {
            monthlyPayment: Math.round(monthlyPayment * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100,
            totalAmount: Math.round(totalToPay * 100) / 100,
            paymentSchedule
        };
    }

    /**
     * Calcula el resumen actual del financiamiento
     */
    static calculateFinancingSummary(
        loanAmount: number,
        interestRate: number,
        termMonths: number,
        startDate: Date,
        paymentsMade: number,
        totalPaid: number,
        downPayment: number = 0
    ): FinancingSummary {
        const calculation = this.generatePaymentSchedule(
            loanAmount,
            interestRate,
            termMonths,
            startDate,
            downPayment
        );

        const netLoanAmount = loanAmount - downPayment;
        const remainingBalance = Math.max(0, netLoanAmount - totalPaid);
        const paymentsRemaining = Math.max(0, termMonths - paymentsMade);
        const percentageComplete = paymentsMade > 0 ? (paymentsMade / termMonths) * 100 : 0;

        // Calcular próximo pago
        let nextPaymentDate: Date | null = null;
        let nextPaymentAmount = 0;
        let daysUntilNextPayment = 0;

        if (paymentsRemaining > 0 && paymentsMade < calculation.paymentSchedule.length) {
            const nextPayment = calculation.paymentSchedule[paymentsMade];
            nextPaymentDate = nextPayment.scheduledDate;
            nextPaymentAmount = nextPayment.scheduledAmount;

            const today = new Date();
            const timeDiff = nextPaymentDate.getTime() - today.getTime();
            daysUntilNextPayment = Math.ceil(timeDiff / (1000 * 3600 * 24));
        }

        // Verificar si está vencido
        const today = new Date();
        const isOverdue = nextPaymentDate ? nextPaymentDate < today : false;
        const overdueAmount = isOverdue ? nextPaymentAmount : 0;

        // Calcular meses restantes
        const monthsRemaining = Math.ceil(paymentsRemaining);

        return {
            totalFinanced: netLoanAmount,
            totalPaid,
            remainingBalance,
            paymentsMade,
            paymentsRemaining,
            percentageComplete: Math.round(percentageComplete * 100) / 100,
            nextPaymentDate,
            nextPaymentAmount,
            daysUntilNextPayment,
            monthsRemaining,
            isOverdue,
            overdueAmount
        };
    }

    /**
     * Calcula el ahorro por pago anticipado
     */
    static calculateEarlyPaymentSavings(
        loanAmount: number,
        interestRate: number,
        termMonths: number,
        startDate: Date,
        extraPayment: number,
        paymentsMade: number = 0,
        downPayment: number = 0
    ): {
        monthsSaved: number;
        interestSaved: number;
        newEndDate: Date;
    } {
        const netLoanAmount = loanAmount - downPayment;
        const originalCalculation = this.generatePaymentSchedule(loanAmount, interestRate, termMonths, startDate, downPayment);

        // Simular pagos con monto extra
        const monthlyRate = interestRate / 100 / 12;
        let remainingBalance = netLoanAmount; // ✅ CORREGIDO: Usar monto neto
        let monthsWithExtra = 0;
        let totalInterestWithExtra = 0;

        // Descontar pagos ya realizados
        for (let i = 0; i < paymentsMade; i++) {
            const payment = originalCalculation.paymentSchedule[i];
            remainingBalance -= payment.principalAmount;
        }

        while (remainingBalance > 0.01) {
            const interestAmount = remainingBalance * monthlyRate;
            const basePayment = originalCalculation.monthlyPayment;
            const totalPayment = basePayment + extraPayment;
            const principalAmount = Math.min(totalPayment - interestAmount, remainingBalance);

            remainingBalance -= principalAmount;
            totalInterestWithExtra += interestAmount;
            monthsWithExtra++;

            if (monthsWithExtra > termMonths) break; // Protección contra loops infinitos
        }

        const monthsSaved = (termMonths - paymentsMade) - monthsWithExtra;
        const interestSaved = originalCalculation.totalInterest - totalInterestWithExtra;

        const newEndDate = this.addMonthsToDate(startDate, paymentsMade + monthsWithExtra);

        return {
            monthsSaved: Math.max(0, monthsSaved),
            interestSaved: Math.max(0, Math.round(interestSaved * 100) / 100),
            newEndDate
        };
    }

    /**
     * Valida los parámetros del financiamiento
     */
    static validateFinancingParameters(
        loanAmount: number,
        interestRate: number,
        termMonths: number,
        downPayment: number = 0
    ): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (loanAmount <= 0) {
            errors.push('El monto del préstamo debe ser mayor a 0');
        }

        if (interestRate < 0 || interestRate > 50) {
            errors.push('La tasa de interés debe estar entre 0% y 50%');
        }

        if (termMonths <= 0 || termMonths > 600) {
            errors.push('El plazo debe estar entre 1 y 600 meses');
        }

        if (downPayment < 0 || downPayment > loanAmount) {
            errors.push('La cuota inicial debe ser mayor o igual a 0 y menor al monto del préstamo');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Añade meses a una fecha de forma segura
     */
    private static addMonthsToDate(date: Date, months: number): Date {
        const result = new Date(date);
        const originalDay = result.getDate();

        result.setMonth(result.getMonth() + months);

        // Si el día cambió (ej: 31 enero + 1 mes = 3 marzo), ajustar al último día del mes correcto
        if (result.getDate() !== originalDay) {
            result.setDate(0); // Último día del mes anterior
        }

        return result;
    }
} 