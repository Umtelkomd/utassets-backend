"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancingController = void 0;
const FinancingRepository_1 = require("../repositories/FinancingRepository");
const PaymentRepository_1 = require("../repositories/PaymentRepository");
const FinancingCalculationService_1 = require("../services/FinancingCalculationService");
const Financing_1 = require("../entity/Financing");
const Payment_1 = require("../entity/Payment");
class FinancingController {
    constructor() {
        // Obtener todos los financiamientos
        this.getFinancings = async (req, res) => {
            try {
                const { status, assetType, assetId } = req.query;
                let financings;
                if (assetType && assetId) {
                    financings = await this.financingRepository.findByAsset(assetType, parseInt(assetId));
                }
                else if (status) {
                    financings = await this.financingRepository.findByStatus(status);
                }
                else {
                    financings = await this.financingRepository.findAll();
                }
                // Calcular resúmenes para cada financiamiento
                const financingsWithSummary = await Promise.all(financings.map(async (financing) => {
                    const summary = FinancingCalculationService_1.FinancingCalculationService.calculateFinancingSummary(financing.loanAmount, financing.interestRate, financing.termMonths, financing.startDate, financing.paymentsMade, financing.totalPaid, financing.downPayment);
                    return {
                        ...financing,
                        summary
                    };
                }));
                res.json(financingsWithSummary);
            }
            catch (error) {
                console.error('Error getting financings:', error);
                res.status(500).json({ message: 'Error al obtener los financiamientos' });
            }
        };
        // Obtener un financiamiento por ID
        this.getFinancingById = async (req, res) => {
            try {
                const { id } = req.params;
                const financing = await this.financingRepository.findById(parseInt(id));
                if (!financing) {
                    return res.status(404).json({ message: 'Financiamiento no encontrado' });
                }
                // Calcular resumen y tabla de amortización
                const summary = FinancingCalculationService_1.FinancingCalculationService.calculateFinancingSummary(financing.loanAmount, financing.interestRate, financing.termMonths, financing.startDate, financing.paymentsMade, financing.totalPaid, financing.downPayment);
                const calculation = FinancingCalculationService_1.FinancingCalculationService.generatePaymentSchedule(financing.loanAmount, financing.interestRate, financing.termMonths, financing.startDate, financing.downPayment);
                res.json({
                    ...financing,
                    summary,
                    amortizationTable: calculation.paymentSchedule
                });
            }
            catch (error) {
                console.error('Error getting financing:', error);
                res.status(500).json({ message: 'Error al obtener el financiamiento' });
            }
        };
        // Crear un nuevo financiamiento
        this.createFinancing = async (req, res) => {
            try {
                const { assetType, assetId, loanAmount, downPayment = 0, interestRate, termMonths, startDate, lender, notes, assetName, assetReference } = req.body;
                // Validar parámetros
                const validation = FinancingCalculationService_1.FinancingCalculationService.validateFinancingParameters(loanAmount, interestRate, termMonths, downPayment);
                if (!validation.isValid) {
                    return res.status(400).json({
                        message: 'Datos de financiamiento inválidos',
                        errors: validation.errors
                    });
                }
                // Verificar si ya existe un financiamiento activo para este activo
                const existingFinancing = await this.financingRepository.findActiveByAsset(assetType, assetId);
                if (existingFinancing) {
                    return res.status(400).json({
                        message: 'Ya existe un financiamiento activo para este activo'
                    });
                }
                // Calcular valores
                const calculation = FinancingCalculationService_1.FinancingCalculationService.generatePaymentSchedule(loanAmount, interestRate, termMonths, new Date(startDate), downPayment);
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + termMonths);
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
                    status: Financing_1.FinancingStatus.ACTIVE,
                    createdBy: req.user
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
                    status: Payment_1.PaymentStatus.PENDING
                }));
                await this.paymentRepository.createMany(paymentsData);
                // Obtener el financiamiento completo con pagos
                const completeFinancing = await this.financingRepository.findById(financing.id);
                res.status(201).json(completeFinancing);
            }
            catch (error) {
                console.error('Error creating financing:', error);
                res.status(500).json({ message: 'Error al crear el financiamiento' });
            }
        };
        // Actualizar un financiamiento
        this.updateFinancing = async (req, res) => {
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
                    const hasRestrictedChanges = restrictedFields.some(field => updateData[field] !== undefined && updateData[field] !== existingFinancing[field]);
                    if (hasRestrictedChanges) {
                        return res.status(400).json({
                            message: 'No se pueden modificar los términos del financiamiento después de realizar pagos'
                        });
                    }
                }
                const updatedFinancing = await this.financingRepository.update(parseInt(id), updateData);
                res.json(updatedFinancing);
            }
            catch (error) {
                console.error('Error updating financing:', error);
                res.status(500).json({ message: 'Error al actualizar el financiamiento' });
            }
        };
        // Eliminar un financiamiento
        this.deleteFinancing = async (req, res) => {
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
            }
            catch (error) {
                console.error('Error deleting financing:', error);
                res.status(500).json({ message: 'Error al eliminar el financiamiento' });
            }
        };
        // Obtener resumen de financiamientos
        this.getFinancingSummary = async (req, res) => {
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
            }
            catch (error) {
                console.error('Error getting financing summary:', error);
                res.status(500).json({ message: 'Error al obtener el resumen de financiamientos' });
            }
        };
        // Obtener financiamientos vencidos
        this.getOverdueFinancings = async (req, res) => {
            try {
                const overdueFinancings = await this.financingRepository.findOverdueFinancings();
                res.json(overdueFinancings);
            }
            catch (error) {
                console.error('Error getting overdue financings:', error);
                res.status(500).json({ message: 'Error al obtener los financiamientos vencidos' });
            }
        };
        // Obtener financiamientos próximos a vencer
        this.getFinancingsDueSoon = async (req, res) => {
            try {
                const { days = 7 } = req.query;
                const dueSoon = await this.financingRepository.findFinancingsDueSoon(parseInt(days));
                res.json(dueSoon);
            }
            catch (error) {
                console.error('Error getting financings due soon:', error);
                res.status(500).json({ message: 'Error al obtener los financiamientos próximos a vencer' });
            }
        };
        // Calcular escenarios de financiamiento
        this.calculateFinancingScenarios = async (req, res) => {
            try {
                const { loanAmount, interestRate, termMonths, downPayment = 0, startDate } = req.body;
                // Validar parámetros
                const validation = FinancingCalculationService_1.FinancingCalculationService.validateFinancingParameters(loanAmount, interestRate, termMonths, downPayment);
                if (!validation.isValid) {
                    return res.status(400).json({
                        message: 'Parámetros inválidos',
                        errors: validation.errors
                    });
                }
                const calculation = FinancingCalculationService_1.FinancingCalculationService.generatePaymentSchedule(loanAmount, interestRate, termMonths, new Date(startDate), downPayment);
                // Calcular escenarios con pagos extra
                const extraPaymentScenarios = [100, 200, 500, 1000].map(extra => {
                    const savings = FinancingCalculationService_1.FinancingCalculationService.calculateEarlyPaymentSavings(loanAmount - downPayment, interestRate, termMonths, new Date(startDate), extra);
                    return {
                        extraPayment: extra,
                        ...savings
                    };
                });
                res.json({
                    baseCalculation: calculation,
                    extraPaymentScenarios
                });
            }
            catch (error) {
                console.error('Error calculating scenarios:', error);
                res.status(500).json({ message: 'Error al calcular escenarios' });
            }
        };
        this.financingRepository = new FinancingRepository_1.FinancingRepository();
        this.paymentRepository = new PaymentRepository_1.PaymentRepository();
    }
}
exports.FinancingController = FinancingController;
