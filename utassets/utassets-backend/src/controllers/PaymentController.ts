import { Request, Response } from 'express';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { FinancingRepository } from '../repositories/FinancingRepository';
import { Payment, PaymentStatus } from '../entity/Payment';

export class PaymentController {
    private paymentRepository: PaymentRepository;
    private financingRepository: FinancingRepository;

    constructor() {
        this.paymentRepository = new PaymentRepository();
        this.financingRepository = new FinancingRepository();
    }

    // Obtener todos los pagos
    getPayments = async (req: Request, res: Response) => {
        try {
            const { financingId, status, startDate, endDate } = req.query;
            let payments: Payment[];

            if (financingId) {
                payments = await this.paymentRepository.findByFinancing(parseInt(financingId as string));
            } else if (status) {
                payments = await this.paymentRepository.findByStatus(status as PaymentStatus);
            } else if (startDate && endDate) {
                payments = await this.paymentRepository.findByDateRange(
                    new Date(startDate as string),
                    new Date(endDate as string)
                );
            } else {
                payments = await this.paymentRepository.findAll();
            }

            res.json(payments);
        } catch (error) {
            console.error('Error getting payments:', error);
            res.status(500).json({ message: 'Error al obtener los pagos' });
        }
    };

    // Obtener un pago por ID
    getPaymentById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const payment = await this.paymentRepository.findById(parseInt(id));

            if (!payment) {
                return res.status(404).json({ message: 'Pago no encontrado' });
            }

            res.json(payment);
        } catch (error) {
            console.error('Error getting payment:', error);
            res.status(500).json({ message: 'Error al obtener el pago' });
        }
    };

    // Registrar un pago
    recordPayment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { actualAmount, actualDate, paymentMethod, reference, notes } = req.body;

            const payment = await this.paymentRepository.findById(parseInt(id));
            if (!payment) {
                return res.status(404).json({ message: 'Pago no encontrado' });
            }

            if (payment.status === PaymentStatus.PAID) {
                return res.status(400).json({ message: 'Este pago ya ha sido registrado' });
            }

            // Marcar el pago como pagado
            const updatedPayment = await this.paymentRepository.markAsPaid(
                parseInt(id),
                actualAmount || payment.scheduledAmount,
                actualDate ? new Date(actualDate) : new Date(),
                req.user as any,
                paymentMethod,
                reference
            );

            // Actualizar el financiamiento
            const financing = await this.financingRepository.findById(payment.financing.id);
            if (financing) {
                // ✅ Asegurar que todos los valores sean números válidos
                const currentTotalPaid = parseFloat(financing.totalPaid?.toString() || '0') || 0;
                const paymentAmount = parseFloat((actualAmount || payment.scheduledAmount)?.toString() || '0') || 0;
                const loanAmount = parseFloat(financing.loanAmount?.toString() || '0') || 0;
                const downPayment = parseFloat(financing.downPayment?.toString() || '0') || 0;
                const currentPaymentsMade = parseInt(financing.paymentsMade?.toString() || '0') || 0;

                const newTotalPaid = currentTotalPaid + paymentAmount;
                const newPaymentsMade = currentPaymentsMade + 1;
                const newCurrentBalance = loanAmount - downPayment - newTotalPaid;

                console.log('💰 Payment Update Debug:', {
                    financingId: financing.id,
                    currentTotalPaid,
                    paymentAmount,
                    newTotalPaid,
                    newPaymentsMade,
                    newCurrentBalance: Math.max(0, newCurrentBalance)
                });

                await this.financingRepository.update(financing.id, {
                    totalPaid: newTotalPaid,
                    paymentsMade: newPaymentsMade,
                    currentBalance: Math.max(0, newCurrentBalance)
                });
            }

            if (updatedPayment) {
                updatedPayment.notes = notes || updatedPayment.notes;
                await this.paymentRepository.update(updatedPayment.id, { notes });
            }

            res.json(updatedPayment);
        } catch (error) {
            console.error('Error recording payment:', error);
            res.status(500).json({ message: 'Error al registrar el pago' });
        }
    };

    // Actualizar un pago
    updatePayment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const payment = await this.paymentRepository.findById(parseInt(id));
            if (!payment) {
                return res.status(404).json({ message: 'Pago no encontrado' });
            }

            const updatedPayment = await this.paymentRepository.update(parseInt(id), updateData);
            res.json(updatedPayment);
        } catch (error) {
            console.error('Error updating payment:', error);
            res.status(500).json({ message: 'Error al actualizar el pago' });
        }
    };

    // Obtener pagos vencidos
    getOverduePayments = async (req: Request, res: Response) => {
        try {
            const overduePayments = await this.paymentRepository.findOverduePayments();
            res.json(overduePayments);
        } catch (error) {
            console.error('Error getting overdue payments:', error);
            res.status(500).json({ message: 'Error al obtener los pagos vencidos' });
        }
    };

    // Obtener próximos pagos
    getUpcomingPayments = async (req: Request, res: Response) => {
        try {
            const { days = 7 } = req.query;
            const upcomingPayments = await this.paymentRepository.findUpcomingPayments(parseInt(days as string));
            res.json(upcomingPayments);
        } catch (error) {
            console.error('Error getting upcoming payments:', error);
            res.status(500).json({ message: 'Error al obtener los próximos pagos' });
        }
    };

    // Obtener resumen de pagos por financiamiento
    getPaymentSummary = async (req: Request, res: Response) => {
        try {
            const { financingId } = req.params;
            const summary = await this.paymentRepository.getPaymentSummaryByFinancing(parseInt(financingId));
            res.json(summary);
        } catch (error) {
            console.error('Error getting payment summary:', error);
            res.status(500).json({ message: 'Error al obtener el resumen de pagos' });
        }
    };

    // Marcar pagos como vencidos (tarea programada)
    markOverduePayments = async (req: Request, res: Response) => {
        try {
            const today = new Date();
            const overduePayments = await this.paymentRepository.findOverduePayments();

            const overdueIds = overduePayments
                .filter(payment => payment.scheduledDate < today && payment.status === PaymentStatus.PENDING)
                .map(payment => payment.id);

            if (overdueIds.length > 0) {
                await this.paymentRepository.markAsOverdue(overdueIds);
            }

            res.json({
                message: `${overdueIds.length} pagos marcados como vencidos`,
                markedCount: overdueIds.length
            });
        } catch (error) {
            console.error('Error marking overdue payments:', error);
            res.status(500).json({ message: 'Error al marcar pagos vencidos' });
        }
    };

    // Obtener resumen mensual de pagos
    getMonthlyPaymentSummary = async (req: Request, res: Response) => {
        try {
            const { year, month } = req.query;
            const currentDate = new Date();
            const targetYear = year ? parseInt(year as string) : currentDate.getFullYear();
            const targetMonth = month ? parseInt(month as string) : currentDate.getMonth() + 1;

            const summary = await this.paymentRepository.getMonthlyPaymentSummary(targetYear, targetMonth);
            res.json(summary);
        } catch (error) {
            console.error('Error getting monthly payment summary:', error);
            res.status(500).json({ message: 'Error al obtener el resumen mensual de pagos' });
        }
    };

    // Registrar múltiples pagos
    recordMultiplePayments = async (req: Request, res: Response) => {
        try {
            const { payments } = req.body;

            if (!Array.isArray(payments) || payments.length === 0) {
                return res.status(400).json({ message: 'Se requiere un array de pagos' });
            }

            const results = [];
            const errors = [];

            for (const paymentData of payments) {
                try {
                    const { paymentId, actualAmount, actualDate, paymentMethod, reference } = paymentData;

                    const payment = await this.paymentRepository.findById(paymentId);
                    if (!payment) {
                        errors.push({ paymentId, error: 'Pago no encontrado' });
                        continue;
                    }

                    if (payment.status === PaymentStatus.PAID) {
                        errors.push({ paymentId, error: 'Pago ya registrado' });
                        continue;
                    }

                    const updatedPayment = await this.paymentRepository.markAsPaid(
                        paymentId,
                        actualAmount || payment.scheduledAmount,
                        actualDate ? new Date(actualDate) : new Date(),
                        req.user as any,
                        paymentMethod,
                        reference
                    );

                    // Actualizar financiamiento
                    const financing = await this.financingRepository.findById(payment.financing.id);
                    if (financing) {
                        // ✅ Asegurar que todos los valores sean números válidos
                        const currentTotalPaid = parseFloat(financing.totalPaid?.toString() || '0') || 0;
                        const paymentAmount = parseFloat((actualAmount || payment.scheduledAmount)?.toString() || '0') || 0;
                        const loanAmount = parseFloat(financing.loanAmount?.toString() || '0') || 0;
                        const downPayment = parseFloat(financing.downPayment?.toString() || '0') || 0;
                        const currentPaymentsMade = parseInt(financing.paymentsMade?.toString() || '0') || 0;

                        const newTotalPaid = currentTotalPaid + paymentAmount;
                        const newPaymentsMade = currentPaymentsMade + 1;
                        const newCurrentBalance = loanAmount - downPayment - newTotalPaid;

                        await this.financingRepository.update(financing.id, {
                            totalPaid: newTotalPaid,
                            paymentsMade: newPaymentsMade,
                            currentBalance: Math.max(0, newCurrentBalance)
                        });
                    }

                    results.push(updatedPayment);
                } catch (error) {
                    errors.push({ paymentId: paymentData.paymentId, error: 'Error al procesar pago' });
                }
            }

            res.json({
                message: `${results.length} pagos registrados correctamente`,
                successCount: results.length,
                errorCount: errors.length,
                results,
                errors
            });
        } catch (error) {
            console.error('Error recording multiple payments:', error);
            res.status(500).json({ message: 'Error al registrar múltiples pagos' });
        }
    };
} 