import { Request, Response } from 'express';
import { FinancingRepository } from '../repositories/FinancingRepository';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { FinancingCalculationService } from '../services/FinancingCalculationService';
import { Financing, AssetType, FinancingStatus } from '../entity/Financing';
import { PaymentStatus } from '../entity/Payment';

export class FinancingController {
    private financingRepository: FinancingRepository;
    private paymentRepository: PaymentRepository;

    constructor() {
        this.financingRepository = new FinancingRepository();
        this.paymentRepository = new PaymentRepository();
    }

    // Obtener todos los financiamientos
    getFinancings = async (req: Request, res: Response) => {
        try {
            const { status, assetType, assetId } = req.query;
            let financings: Financing[];

            if (assetType && assetId) {
                financings = await this.financingRepository.findByAsset(
                    assetType as AssetType,
                    parseInt(assetId as string)
                );
            } else if (status) {
                financings = await this.financingRepository.findByStatus(status as FinancingStatus);
            } else {
                financings = await this.financingRepository.findAll();
            }

            // Calcular resúmenes para cada financiamiento
            const financingsWithSummary = await Promise.all(
                financings.map(async (financing) => {
                    const summary = FinancingCalculationService.calculateFinancingSummary(
                        financing.loanAmount,
                        financing.interestRate,
                        financing.termMonths,
                        financing.startDate,
                        financing.paymentsMade,
                        financing.totalPaid,
                        financing.downPayment
                    );

                    return {
                        ...financing,
                        summary
                    };
                })
            );

            res.json(financingsWithSummary);
        } catch (error) {
            console.error('Error getting financings:', error);
            res.status(500).json({ message: 'Error al obtener los financiamientos' });
        }
    };

    // Obtener un financiamiento por ID
    getFinancingById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const financing = await this.financingRepository.findById(parseInt(id));

            if (!financing) {
                return res.status(404).json({ message: 'Financiamiento no encontrado' });
            }

            // Calcular resumen y tabla de amortización
            const summary = FinancingCalculationService.calculateFinancingSummary(
                financing.loanAmount,
                financing.interestRate,
                financing.termMonths,
                financing.startDate,
                financing.paymentsMade,
                financing.totalPaid,
                financing.downPayment
            );

            const calculation = FinancingCalculationService.generatePaymentSchedule(
                financing.loanAmount,
                financing.interestRate,
                financing.termMonths,
                financing.startDate,
                financing.downPayment
            );

            // Calcular TODOS los valores en el backend
            const calculatedTotals = {
                totalToPay: calculation.totalAmount,
                totalInterest: calculation.totalInterest,
                monthlyPayment: calculation.monthlyPayment,
                netLoanAmount: financing.loanAmount - (financing.downPayment || 0),
                downPayment: financing.downPayment || 0,
                grossLoanAmount: financing.loanAmount
            };

            // Debug logging
            console.log('🔍 Backend Calculations Complete:', {
                id: financing.id,
                calculatedTotals,
                amortizationTableLength: calculation.paymentSchedule.length,
                firstPayment: calculation.paymentSchedule[0]
            });

            const response = {
                ...financing,
                summary,
                calculations: calculatedTotals,           // ✅ Todos los cálculos listos
                amortizationTable: calculation.paymentSchedule
            };

            console.log('📤 Backend Response - Ready to use calculations:', {
                totalToPay: response.calculations.totalToPay,
                totalInterest: response.calculations.totalInterest,
                monthlyPayment: response.calculations.monthlyPayment
            });

            res.json(response);
        } catch (error) {
            console.error('Error getting financing:', error);
            res.status(500).json({ message: 'Error al obtener el financiamiento' });
        }
    };

    // Crear un nuevo financiamiento
    createFinancing = async (req: Request, res: Response) => {
        try {
            const {
                assetType,
                assetId,
                loanAmount,
                downPayment = 0,
                interestRate,
                termMonths,
                startDate,
                lender,
                notes,
                assetName,
                assetReference
            } = req.body;

            // Validar parámetros
            const validation = FinancingCalculationService.validateFinancingParameters(
                loanAmount,
                interestRate,
                termMonths,
                downPayment
            );

            if (!validation.isValid) {
                return res.status(400).json({
                    message: 'Datos de financiamiento inválidos',
                    errors: validation.errors
                });
            }

            // Verificar si ya existe un financiamiento activo para este activo
            const existingFinancing = await this.financingRepository.findActiveByAsset(
                assetType,
                assetId
            );

            if (existingFinancing) {
                return res.status(400).json({
                    message: 'Ya existe un financiamiento activo para este activo'
                });
            }

            // Calcular valores
            const calculation = FinancingCalculationService.generatePaymentSchedule(
                loanAmount,
                interestRate,
                termMonths,
                new Date(startDate),
                downPayment
            );

            // ✅ CORREGIDO: Usar método seguro para fechas
            const endDate = new Date(startDate);
            const endDateMonth = endDate.getMonth() + termMonths;
            const endDateYear = endDate.getFullYear() + Math.floor(endDateMonth / 12);
            endDate.setFullYear(endDateYear, endDateMonth % 12, endDate.getDate());

            // Crear financiamiento
            const financing = await this.financingRepository.create({
                assetType,
                assetId,
                loanAmount,
                downPayment,
                interestRate,
                termMonths,
                monthlyPayment: calculation.monthlyPayment,
                startDate: new Date(startDate),
                endDate,
                lender,
                notes,
                assetName,
                assetReference,
                currentBalance: loanAmount - downPayment,
                totalPaid: 0,
                paymentsMade: 0,
                status: FinancingStatus.ACTIVE,
                createdBy: req.user as any
            });

            // Crear tabla de pagos
            const paymentsData = calculation.paymentSchedule.map(payment => ({
                financing,
                paymentNumber: payment.paymentNumber,
                scheduledDate: payment.scheduledDate,
                scheduledAmount: payment.scheduledAmount,
                principalAmount: payment.principalAmount,
                interestAmount: payment.interestAmount,
                remainingBalance: payment.remainingBalance,
                status: PaymentStatus.PENDING
            }));

            await this.paymentRepository.createMany(paymentsData);

            // Obtener el financiamiento completo con pagos
            const completeFinancing = await this.financingRepository.findById(financing.id);

            res.status(201).json(completeFinancing);
        } catch (error) {
            console.error('Error creating financing:', error);
            res.status(500).json({ message: 'Error al crear el financiamiento' });
        }
    };

    // Actualizar un financiamiento
    updateFinancing = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const existingFinancing = await this.financingRepository.findById(parseInt(id));
            if (!existingFinancing) {
                return res.status(404).json({ message: 'Financiamiento no encontrado' });
            }

            // No permitir cambiar ciertos campos críticos si ya se han hecho pagos
            if (existingFinancing.paymentsMade > 0) {
                const restrictedFields = ['loanAmount', 'interestRate', 'termMonths', 'startDate'];
                const hasRestrictedChanges = restrictedFields.some(field =>
                    updateData[field] !== undefined && updateData[field] !== (existingFinancing as any)[field]
                );

                if (hasRestrictedChanges) {
                    return res.status(400).json({
                        message: 'No se pueden modificar los términos del financiamiento después de realizar pagos'
                    });
                }
            }

            const updatedFinancing = await this.financingRepository.update(parseInt(id), updateData);
            res.json(updatedFinancing);
        } catch (error) {
            console.error('Error updating financing:', error);
            res.status(500).json({ message: 'Error al actualizar el financiamiento' });
        }
    };

    // Eliminar un financiamiento
    deleteFinancing = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const financing = await this.financingRepository.findById(parseInt(id));
            if (!financing) {
                return res.status(404).json({ message: 'Financiamiento no encontrado' });
            }

            // No permitir eliminar si ya se han hecho pagos
            if (financing.paymentsMade > 0) {
                return res.status(400).json({
                    message: 'No se puede eliminar un financiamiento con pagos realizados'
                });
            }

            await this.financingRepository.delete(parseInt(id));
            res.json({ message: 'Financiamiento eliminado correctamente' });
        } catch (error) {
            console.error('Error deleting financing:', error);
            res.status(500).json({ message: 'Error al eliminar el financiamiento' });
        }
    };

    // Obtener resumen de financiamientos
    getFinancingSummary = async (req: Request, res: Response) => {
        try {
            const summary = await this.financingRepository.getFinancingSummary();
            const overdueFinancings = await this.financingRepository.findOverdueFinancings();
            const dueSoon = await this.financingRepository.findFinancingsDueSoon(7);
            const assetTypeDistribution = await this.financingRepository.findByAssetTypeGrouped();

            res.json({
                ...summary,
                overdueCount: overdueFinancings.length,
                dueSoonCount: dueSoon.length,
                assetTypeDistribution
            });
        } catch (error) {
            console.error('Error getting financing summary:', error);
            res.status(500).json({ message: 'Error al obtener el resumen de financiamientos' });
        }
    };

    // Obtener financiamientos vencidos
    getOverdueFinancings = async (req: Request, res: Response) => {
        try {
            const overdueFinancings = await this.financingRepository.findOverdueFinancings();
            res.json(overdueFinancings);
        } catch (error) {
            console.error('Error getting overdue financings:', error);
            res.status(500).json({ message: 'Error al obtener los financiamientos vencidos' });
        }
    };

    // Obtener financiamientos próximos a vencer
    getFinancingsDueSoon = async (req: Request, res: Response) => {
        try {
            const { days = 7 } = req.query;
            const dueSoon = await this.financingRepository.findFinancingsDueSoon(parseInt(days as string));
            res.json(dueSoon);
        } catch (error) {
            console.error('Error getting financings due soon:', error);
            res.status(500).json({ message: 'Error al obtener los financiamientos próximos a vencer' });
        }
    };

    // Calcular escenarios de financiamiento
    calculateFinancingScenarios = async (req: Request, res: Response) => {
        try {
            const { loanAmount, interestRate, termMonths, downPayment = 0, startDate } = req.body;

            // Validar parámetros
            const validation = FinancingCalculationService.validateFinancingParameters(
                loanAmount,
                interestRate,
                termMonths,
                downPayment
            );

            if (!validation.isValid) {
                return res.status(400).json({
                    message: 'Parámetros inválidos',
                    errors: validation.errors
                });
            }

            const calculation = FinancingCalculationService.generatePaymentSchedule(
                loanAmount,
                interestRate,
                termMonths,
                new Date(startDate),
                downPayment
            );

            // Calcular escenarios con pagos extra
            const extraPaymentScenarios = [100, 200, 500, 1000].map(extra => {
                const savings = FinancingCalculationService.calculateEarlyPaymentSavings(
                    loanAmount,
                    interestRate,
                    termMonths,
                    new Date(startDate),
                    extra,
                    0,
                    downPayment
                );
                return {
                    extraPayment: extra,
                    ...savings
                };
            });

            res.json({
                baseCalculation: calculation,
                extraPaymentScenarios
            });
        } catch (error) {
            console.error('Error calculating scenarios:', error);
            res.status(500).json({ message: 'Error al calcular escenarios' });
        }
    };
} 