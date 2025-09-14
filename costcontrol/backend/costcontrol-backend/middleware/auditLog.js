const { AppDataSource } = require('../data-source');

// Store audit logs (we'll create the entity later)
const createAuditLog = async (entityName, entityId, action, oldValues, newValues, userId, req) => {
  try {
    // For now, just log to console - we'll implement database logging after creating AuditLog entity
    const auditEntry = {
      entityName,
      entityId,
      action,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      userId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    console.log('AUDIT LOG:', auditEntry);
    
    // TODO: Save to database when AuditLog entity is created
    // const auditRepo = AppDataSource.getRepository(AuditLog);
    // await auditRepo.save(auditEntry);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error - audit logging shouldn't break the main operation
  }
};

const auditMiddleware = (entityName, action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = req.params.id || (req.body && req.body.id) || 'unknown';
        const userId = req.user ? req.user.id : null;
        
        let oldValues = null;
        let newValues = null;
        
        if (action === 'UPDATE') {
          // For updates, we should have stored the old values before the operation
          oldValues = req.oldValues || null;
          newValues = req.validatedData || req.body;
        } else if (action === 'CREATE') {
          newValues = req.validatedData || req.body;
        } else if (action === 'DELETE') {
          oldValues = req.oldValues || null;
        }
        
        // Create audit log asynchronously
        setImmediate(() => {
          createAuditLog(entityName, entityId, action, oldValues, newValues, userId, req);
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware to capture old values before update/delete operations
const captureOldValues = (entityClass) => {
  return async (req, res, next) => {
    try {
      if (req.params.id && (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE')) {
        const repository = AppDataSource.getRepository(entityClass);
        const oldEntity = await repository.findOneBy({ id: parseInt(req.params.id) });
        
        if (oldEntity) {
          req.oldValues = { ...oldEntity };
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  auditMiddleware,
  captureOldValues,
  createAuditLog
};