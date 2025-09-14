const { AppDataSource } = require('../data-source');
const { Pago } = require('../entities/Pago');
const { CentroCosto } = require('../entities/CentroCosto');
const { Budget } = require('../entities/Budget');
const PaymentService = require('../services/PaymentService');
const { asyncHandler } = require('../middleware/errorHandler');
const { createAuditLog } = require('../middleware/auditLog');

const paymentService = new PaymentService();

// Enhanced payment creation with business logic
exports.create = asyncHandler(async (req, res) => {
  const result = await paymentService.createPayment(
    req.validatedData,
    req.user.id,
    req
  );

  res.status(201).json({
    success: true,
    data: result.payment,
    meta: {
      budgetStatus: result.budgetStatus,
      requiresApproval: result.requiresApproval,
      message: result.requiresApproval 
        ? 'Payment created and pending approval'
        : 'Payment created and auto-approved'
    }
  });
});

// Enhanced payment approval
exports.approve = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const payment = await paymentService.approvePayment(
    parseInt(id),
    req.validatedData,
    req.user.id,
    req
  );

  res.json({
    success: true,
    data: payment,
    message: 'Payment approved successfully'
  });
});

// Enhanced payment deferral
exports.defer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const payment = await paymentService.deferPayment(
    parseInt(id),
    req.validatedData,
    req.user.id,
    req
  );

  res.json({
    success: true,
    data: payment,
    message: 'Payment deferred successfully'
  });
});

// Enhanced payment listing with advanced filtering
exports.getAll = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    centroCostoId,
    proyectoId,
    fechaInicio,
    fechaFin,
    montoMin,
    montoMax,
    proveedor,
    metodoPago,
    sortBy = 'fecha',
    sortOrder = 'DESC'
  } = req.query;

  const pagoRepo = AppDataSource.getRepository(Pago);
  
  let queryBuilder = pagoRepo.createQueryBuilder('pago')
    .leftJoinAndSelect('pago.centroCosto', 'centroCosto')
    .leftJoinAndSelect('centroCosto.proyecto', 'proyecto')
    .leftJoinAndSelect('pago.createdByUser', 'createdBy')
    .leftJoinAndSelect('pago.reviewedByUser', 'reviewedBy');

  // Apply filters
  if (status) {
    queryBuilder.andWhere('pago.status = :status', { status });
  }

  if (centroCostoId) {
    queryBuilder.andWhere('pago.centroCostoId = :centroCostoId', { centroCostoId });
  }

  if (proyectoId) {
    queryBuilder.andWhere('centroCosto.proyectoId = :proyectoId', { proyectoId });
  }

  if (fechaInicio && fechaFin) {
    queryBuilder.andWhere('pago.fecha BETWEEN :fechaInicio AND :fechaFin', {
      fechaInicio,
      fechaFin
    });
  }

  if (montoMin) {
    queryBuilder.andWhere('pago.monto >= :montoMin', { montoMin });
  }

  if (montoMax) {
    queryBuilder.andWhere('pago.monto <= :montoMax', { montoMax });
  }

  if (proveedor) {
    queryBuilder.andWhere('pago.proveedor LIKE :proveedor', { 
      proveedor: `%${proveedor}%` 
    });
  }

  if (metodoPago) {
    queryBuilder.andWhere('pago.metodoPago = :metodoPago', { metodoPago });
  }

  // Apply sorting
  const validSortFields = ['fecha', 'monto', 'proveedor', 'createdAt'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'fecha';
  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  queryBuilder.orderBy(`pago.${sortField}`, order);

  // Apply pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  queryBuilder.skip(offset).take(parseInt(limit));

  const [payments, total] = await queryBuilder.getManyAndCount();

  // Calculate summary statistics
  const summaryQuery = pagoRepo.createQueryBuilder('pago')
    .leftJoin('pago.centroCosto', 'centroCosto')
    .select('SUM(pago.monto)', 'totalAmount')
    .addSelect('COUNT(pago.id)', 'totalCount')
    .addSelect('AVG(pago.monto)', 'averageAmount');

  // Apply same filters for summary
  if (status) summaryQuery.andWhere('pago.status = :status', { status });
  if (centroCostoId) summaryQuery.andWhere('pago.centroCostoId = :centroCostoId', { centroCostoId });
  if (proyectoId) summaryQuery.andWhere('centroCosto.proyectoId = :proyectoId', { proyectoId });
  if (fechaInicio && fechaFin) {
    summaryQuery.andWhere('pago.fecha BETWEEN :fechaInicio AND :fechaFin', {
      fechaInicio, fechaFin
    });
  }

  const summary = await summaryQuery.getRawOne();

  res.json({
    success: true,
    data: payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    },
    summary: {
      totalAmount: parseFloat(summary.totalAmount || 0),
      averageAmount: parseFloat(summary.averageAmount || 0),
      totalCount: parseInt(summary.totalCount || 0)
    },
    filters: {
      status,
      centroCostoId,
      proyectoId,
      fechaInicio,
      fechaFin,
      montoMin,
      montoMax,
      proveedor,
      metodoPago
    }
  });
});

// Enhanced metrics with budget analysis
exports.getMetrics = asyncHandler(async (req, res) => {
  const { fechaInicio, fechaFin, centroCostoId, proyectoId } = req.query;

  const pagoRepo = AppDataSource.getRepository(Pago);
  const budgetRepo = AppDataSource.getRepository(Budget);

  // Base metrics query
  let metricsQuery = pagoRepo.createQueryBuilder('pago')
    .leftJoin('pago.centroCosto', 'centroCosto')
    .select('COUNT(pago.id)', 'totalPayments')
    .addSelect('SUM(CASE WHEN pago.status = "approved" THEN pago.monto ELSE 0 END)', 'totalApproved')
    .addSelect('SUM(CASE WHEN pago.status = "pending" THEN pago.monto ELSE 0 END)', 'totalPending')
    .addSelect('SUM(CASE WHEN pago.status = "deferred" THEN pago.monto ELSE 0 END)', 'totalDeferred')
    .addSelect('COUNT(CASE WHEN pago.status = "approved" THEN 1 END)', 'approvedCount')
    .addSelect('COUNT(CASE WHEN pago.status = "pending" THEN 1 END)', 'pendingCount')
    .addSelect('COUNT(CASE WHEN pago.status = "deferred" THEN 1 END)', 'deferredCount');

  // Apply filters
  if (fechaInicio && fechaFin) {
    metricsQuery.andWhere('pago.fecha BETWEEN :fechaInicio AND :fechaFin', {
      fechaInicio, fechaFin
    });
  }
  if (centroCostoId) {
    metricsQuery.andWhere('pago.centroCostoId = :centroCostoId', { centroCostoId });
  }
  if (proyectoId) {
    metricsQuery.andWhere('centroCosto.proyectoId = :proyectoId', { proyectoId });
  }

  const metrics = await metricsQuery.getRawOne();

  // Budget analysis
  let budgetQuery = budgetRepo.createQueryBuilder('budget')
    .leftJoin('budget.centroCosto', 'centroCosto')
    .select('SUM(budget.montoAprobado)', 'totalBudget')
    .addSelect('SUM(budget.montoGastado)', 'totalSpent')
    .addSelect('SUM(budget.montoComprometido)', 'totalCommitted')
    .addSelect('COUNT(budget.id)', 'budgetCount');

  if (centroCostoId) {
    budgetQuery.andWhere('budget.centroCostoId = :centroCostoId', { centroCostoId });
  }
  if (proyectoId) {
    budgetQuery.andWhere('centroCosto.proyectoId = :proyectoId', { proyectoId });
  }

  // Filter by period if provided
  if (fechaInicio && fechaFin) {
    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);
    const startPeriod = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    const endPeriod = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
    
    budgetQuery.andWhere('budget.periodo BETWEEN :startPeriod AND :endPeriod', {
      startPeriod, endPeriod
    });
  }

  const budgetMetrics = await budgetQuery.getRawOne();

  // Calculate utilization percentages
  const totalBudget = parseFloat(budgetMetrics.totalBudget || 0);
  const totalSpent = parseFloat(budgetMetrics.totalSpent || 0);
  const totalCommitted = parseFloat(budgetMetrics.totalCommitted || 0);
  
  const budgetUtilization = totalBudget > 0 
    ? ((totalSpent + totalCommitted) / totalBudget) * 100 
    : 0;

  res.json({
    success: true,
    data: {
      payments: {
        total: parseInt(metrics.totalPayments || 0),
        approved: {
          count: parseInt(metrics.approvedCount || 0),
          amount: parseFloat(metrics.totalApproved || 0)
        },
        pending: {
          count: parseInt(metrics.pendingCount || 0),
          amount: parseFloat(metrics.totalPending || 0)
        },
        deferred: {
          count: parseInt(metrics.deferredCount || 0),
          amount: parseFloat(metrics.totalDeferred || 0)
        }
      },
      budget: {
        totalBudget,
        totalSpent,
        totalCommitted,
        remainingBudget: Math.max(0, totalBudget - totalSpent - totalCommitted),
        utilizationPercentage: Math.round(budgetUtilization * 100) / 100,
        status: budgetUtilization > 100 ? 'over_budget' : 
               budgetUtilization > 90 ? 'warning' : 
               budgetUtilization > 75 ? 'caution' : 'healthy'
      }
    },
    meta: {
      generatedAt: new Date().toISOString(),
      filters: { fechaInicio, fechaFin, centroCostoId, proyectoId }
    }
  });
});

// Budget check endpoint for frontend validation
exports.checkBudget = asyncHandler(async (req, res) => {
  const { centroCostoId, monto, fecha } = req.query;

  if (!centroCostoId || !monto || !fecha) {
    return res.status(400).json({
      success: false,
      error: 'centroCostoId, monto, and fecha are required'
    });
  }

  const budgetCheck = await paymentService.checkBudgetAvailability(
    parseInt(centroCostoId),
    parseFloat(monto),
    fecha
  );

  res.json({
    success: true,
    data: budgetCheck
  });
});

// Bulk operations for admin users
exports.bulkApprove = asyncHandler(async (req, res) => {
  const { paymentIds, reviewComments } = req.body;

  if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'paymentIds array is required'
    });
  }

  const results = [];
  const errors = [];

  for (const paymentId of paymentIds) {
    try {
      const payment = await paymentService.approvePayment(
        paymentId,
        { reviewComments },
        req.user.id,
        req
      );
      results.push({ paymentId, status: 'approved', payment });
    } catch (error) {
      errors.push({ paymentId, error: error.message });
    }
  }

  res.json({
    success: true,
    data: {
      approved: results.length,
      failed: errors.length,
      results,
      errors
    }
  });
});

// Export enhanced controller methods
module.exports = {
  ...exports,
  // Keep original methods for backward compatibility
  getAll: exports.getAll,
  create: exports.create,
  approve: exports.approve,
  defer: exports.defer,
  getMetrics: exports.getMetrics,
  checkBudget: exports.checkBudget,
  bulkApprove: exports.bulkApprove
};