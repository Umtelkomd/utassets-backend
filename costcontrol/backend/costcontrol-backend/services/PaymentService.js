const { AppDataSource } = require('../data-source');
const { Pago } = require('../entities/Pago');
const { Budget } = require('../entities/Budget');
const { ApprovalWorkflow, ApprovalStep } = require('../entities/ApprovalWorkflow');
const { CentroCosto } = require('../entities/CentroCosto');
const { createAuditLog } = require('../middleware/auditLog');

class PaymentService {
  constructor() {
    this.pagoRepo = AppDataSource.getRepository(Pago);
    this.budgetRepo = AppDataSource.getRepository(Budget);
    this.centroCostoRepo = AppDataSource.getRepository(CentroCosto);
    this.workflowRepo = AppDataSource.getRepository(ApprovalWorkflow);
    this.stepRepo = AppDataSource.getRepository(ApprovalStep);
  }

  async createPayment(paymentData, userId, req) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validate centro de costo exists
      const centroCosto = await queryRunner.manager.findOneBy(CentroCosto, { 
        id: paymentData.centroCostoId 
      });
      
      if (!centroCosto) {
        throw new Error('Centro de costo no encontrado');
      }

      // 2. Check budget availability
      const budgetCheck = await this.checkBudgetAvailability(
        paymentData.centroCostoId,
        paymentData.monto,
        paymentData.fecha,
        queryRunner
      );

      // 3. Create payment record
      const payment = queryRunner.manager.create(Pago, {
        ...paymentData,
        createdByUserId: userId,
        status: 'pending'
      });

      const savedPayment = await queryRunner.manager.save(payment);

      // 4. Create approval workflow if amount exceeds threshold
      const approvalRequired = await this.requiresApproval(paymentData.monto, centroCosto);
      
      if (approvalRequired) {
        await this.createApprovalWorkflow(savedPayment.id, paymentData.monto, queryRunner);
      } else {
        // Auto-approve small amounts
        savedPayment.status = 'approved';
        savedPayment.reviewedByUserId = userId;
        savedPayment.reviewDate = new Date();
        savedPayment.reviewComments = 'Auto-approved (below threshold)';
        await queryRunner.manager.save(savedPayment);
      }

      // 5. Update budget committed amount
      if (budgetCheck.budget) {
        budgetCheck.budget.montoComprometido = 
          parseFloat(budgetCheck.budget.montoComprometido) + parseFloat(paymentData.monto);
        await queryRunner.manager.save(budgetCheck.budget);
      }

      await queryRunner.commitTransaction();

      // 6. Create audit log
      await createAuditLog('Pago', savedPayment.id, 'CREATE', null, savedPayment, userId, req);

      return {
        payment: savedPayment,
        budgetStatus: budgetCheck,
        requiresApproval: approvalRequired
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async approvePayment(paymentId, reviewData, userId, req) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Get payment with workflow
      const payment = await queryRunner.manager.findOne(Pago, {
        where: { id: paymentId },
        relations: ['workflow']
      });

      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      if (payment.status !== 'pending') {
        throw new Error('El pago no está en estado pendiente');
      }

      const oldValues = { ...payment };

      // 2. Process approval workflow or direct approval
      if (payment.workflow) {
        const workflowComplete = await this.processApprovalStep(
          payment.workflow.id, 
          userId, 
          'approved',
          reviewData.reviewComments,
          queryRunner
        );

        if (workflowComplete) {
          payment.status = 'approved';
        }
      } else {
        payment.status = 'approved';
      }

      // 3. Update payment
      payment.reviewedByUserId = userId;
      payment.reviewDate = new Date();
      payment.reviewComments = reviewData.reviewComments;
      
      const updatedPayment = await queryRunner.manager.save(payment);

      // 4. Update budget - move from committed to spent
      await this.updateBudgetOnApproval(payment, queryRunner);

      await queryRunner.commitTransaction();

      // 5. Create audit log
      await createAuditLog('Pago', paymentId, 'APPROVE', oldValues, updatedPayment, userId, req);

      return updatedPayment;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deferPayment(paymentId, reviewData, userId, req) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await queryRunner.manager.findOneBy(Pago, { id: paymentId });
      
      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      const oldValues = { ...payment };

      // Update payment status
      payment.status = 'deferred';
      payment.reviewedByUserId = userId;
      payment.reviewDate = new Date();
      payment.reviewComments = reviewData.reviewComments;

      const updatedPayment = await queryRunner.manager.save(payment);

      // Release committed budget
      await this.releaseBudgetCommitment(payment, queryRunner);

      await queryRunner.commitTransaction();

      await createAuditLog('Pago', paymentId, 'DEFER', oldValues, updatedPayment, userId, req);

      return updatedPayment;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async checkBudgetAvailability(centroCostoId, amount, paymentDate, queryRunner = null) {
    const manager = queryRunner ? queryRunner.manager : AppDataSource.manager;
    
    const paymentMonth = new Date(paymentDate);
    const periodo = `${paymentMonth.getFullYear()}-${String(paymentMonth.getMonth() + 1).padStart(2, '0')}`;

    const budget = await manager.findOne(Budget, {
      where: {
        centroCostoId,
        periodo,
        estado: 'active'
      }
    });

    if (!budget) {
      return {
        hasAvailableBudget: false,
        budget: null,
        message: 'No hay presupuesto definido para este período',
        recommendedAction: 'create_budget'
      };
    }

    const availableAmount = parseFloat(budget.montoAprobado) - 
                           parseFloat(budget.montoGastado) - 
                           parseFloat(budget.montoComprometido);

    const exceedsBudget = parseFloat(amount) > availableAmount;

    return {
      hasAvailableBudget: !exceedsBudget,
      budget,
      availableAmount,
      requestedAmount: parseFloat(amount),
      exceedsBy: exceedsBudget ? parseFloat(amount) - availableAmount : 0,
      utilizationPercentage: ((parseFloat(budget.montoGastado) + parseFloat(budget.montoComprometido)) / parseFloat(budget.montoAprobado)) * 100,
      message: exceedsBudget ? 'El monto excede el presupuesto disponible' : 'Presupuesto disponible',
      recommendedAction: exceedsBudget ? 'requires_approval' : 'proceed'
    };
  }

  async requiresApproval(amount, centroCosto) {
    // Define approval thresholds
    const thresholds = {
      small: 1000,    // < €1,000 - auto-approve
      medium: 5000,   // €1,000-€5,000 - supervisor approval
      large: 20000,   // €5,000-€20,000 - manager approval
      xlarge: 50000   // > €50,000 - CFO approval
    };

    return parseFloat(amount) >= thresholds.small;
  }

  async createApprovalWorkflow(paymentId, amount, queryRunner) {
    const workflow = queryRunner.manager.create(ApprovalWorkflow, {
      pagoId: paymentId,
      currentStep: 1,
      totalSteps: this.determineApprovalSteps(amount),
      estado: 'pending'
    });

    const savedWorkflow = await queryRunner.manager.save(workflow);

    // Create approval steps based on amount
    const steps = this.getApprovalSteps(amount);
    for (let i = 0; i < steps.length; i++) {
      const step = queryRunner.manager.create(ApprovalStep, {
        workflowId: savedWorkflow.id,
        stepNumber: i + 1,
        approverRole: steps[i].role,
        estado: i === 0 ? 'pending' : 'waiting'
      });
      await queryRunner.manager.save(step);
    }

    return savedWorkflow;
  }

  determineApprovalSteps(amount) {
    if (amount < 5000) return 1;      // Supervisor only
    if (amount < 20000) return 2;     // Supervisor + Manager
    if (amount < 50000) return 3;     // Supervisor + Manager + Finance
    return 4;                         // Full approval chain
  }

  getApprovalSteps(amount) {
    const baseSteps = [{ role: 'supervisor' }];
    
    if (amount >= 5000) baseSteps.push({ role: 'manager' });
    if (amount >= 20000) baseSteps.push({ role: 'finance' });
    if (amount >= 50000) baseSteps.push({ role: 'cfo' });

    return baseSteps;
  }

  async processApprovalStep(workflowId, userId, action, comments, queryRunner) {
    // Implementation for processing individual approval steps
    // Returns true if workflow is complete, false if more steps needed
    
    const workflow = await queryRunner.manager.findOne(ApprovalWorkflow, {
      where: { id: workflowId },
      relations: ['steps']
    });

    const currentStep = workflow.steps.find(step => 
      step.stepNumber === workflow.currentStep && step.estado === 'pending'
    );

    if (currentStep) {
      currentStep.approverUserId = userId;
      currentStep.estado = action;
      currentStep.comentarios = comments;
      currentStep.fechaAprobacion = new Date();
      
      await queryRunner.manager.save(currentStep);

      if (action === 'approved' && workflow.currentStep < workflow.totalSteps) {
        workflow.currentStep += 1;
        await queryRunner.manager.save(workflow);
        return false; // More steps needed
      } else {
        workflow.estado = action;
        await queryRunner.manager.save(workflow);
        return true; // Workflow complete
      }
    }

    return false;
  }

  async updateBudgetOnApproval(payment, queryRunner) {
    const paymentDate = new Date(payment.fecha);
    const periodo = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;

    const budget = await queryRunner.manager.findOne(Budget, {
      where: {
        centroCostoId: payment.centroCostoId,
        periodo
      }
    });

    if (budget) {
      budget.montoGastado = parseFloat(budget.montoGastado) + parseFloat(payment.monto);
      budget.montoComprometido = parseFloat(budget.montoComprometido) - parseFloat(payment.monto);
      await queryRunner.manager.save(budget);
    }
  }

  async releaseBudgetCommitment(payment, queryRunner) {
    const paymentDate = new Date(payment.fecha);
    const periodo = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;

    const budget = await queryRunner.manager.findOne(Budget, {
      where: {
        centroCostoId: payment.centroCostoId,
        periodo
      }
    });

    if (budget) {
      budget.montoComprometido = parseFloat(budget.montoComprometido) - parseFloat(payment.monto);
      await queryRunner.manager.save(budget);
    }
  }
}

module.exports = PaymentService;