const Joi = require('joi');
const { AppDataSource } = require('../data-source');
const { CentroCosto } = require('../entities/CentroCosto');
const { Proyecto } = require('../entities/Proyecto');

// Validation schemas
const schemas = {
  pago: Joi.object({
    fecha: Joi.date().max('now').required().messages({
      'date.max': 'La fecha no puede ser futura',
      'any.required': 'La fecha es obligatoria'
    }),
    proveedor: Joi.string().min(1).max(255).required().messages({
      'string.min': 'El proveedor es obligatorio',
      'string.max': 'El proveedor no puede tener más de 255 caracteres'
    }),
    concepto: Joi.string().min(1).max(500).required().messages({
      'string.min': 'El concepto es obligatorio',
      'string.max': 'El concepto no puede tener más de 500 caracteres'
    }),
    monto: Joi.number().positive().precision(2).max(999999999.99).required().messages({
      'number.positive': 'El monto debe ser positivo',
      'number.precision': 'El monto puede tener máximo 2 decimales',
      'number.max': 'El monto excede el límite permitido',
      'any.required': 'El monto es obligatorio'
    }),
    centroCostoId: Joi.number().integer().positive().required(),
    metodoPago: Joi.string().valid('transferencia', 'cheque', 'efectivo', 'tarjeta').required(),
    referencia: Joi.string().max(100).allow('', null),
    comentarios: Joi.string().max(1000).allow('', null)
  }),

  proyecto: Joi.object({
    nombre: Joi.string().min(1).max(255).required(),
    descripcion: Joi.string().max(1000).allow('', null),
    codigo: Joi.string().min(1).max(50).pattern(/^[A-Z0-9-_]+$/).required().messages({
      'string.pattern.base': 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos'
    }),
    fechaInicio: Joi.date().required(),
    fechaFin: Joi.date().greater(Joi.ref('fechaInicio')).allow(null).messages({
      'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio'
    }),
    presupuesto: Joi.number().positive().precision(2).max(999999999.99).allow(null),
    estado: Joi.string().valid('activo', 'pausado', 'finalizado', 'cancelado').default('activo'),
    responsableId: Joi.number().integer().positive().allow(null),
    cliente: Joi.string().max(255).allow('', null)
  }),

  centroCosto: Joi.object({
    nombre: Joi.string().min(1).max(255).required(),
    descripcion: Joi.string().max(1000).allow('', null),
    proyectoId: Joi.number().integer().positive().allow(null)
  }),

  paymentReview: Joi.object({
    reviewComments: Joi.string().max(1000).allow('', null),
    action: Joi.string().valid('approve', 'defer').required()
  })
};

// Generic validation middleware
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ 
        error: 'Invalid validation schema',
        code: 'VALIDATION_SCHEMA_ERROR' 
      });
    }

    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return res.status(400).json({ 
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details
      });
    }
    
    req.validatedData = value;
    next();
  };
};

// Business logic validations
const validateCentroCostoExists = async (req, res, next) => {
  try {
    if (req.validatedData.centroCostoId) {
      const centroCostoRepo = AppDataSource.getRepository(CentroCosto);
      const centroCosto = await centroCostoRepo.findOneBy({ id: req.validatedData.centroCostoId });
      
      if (!centroCosto) {
        return res.status(400).json({ 
          error: 'Centro de costo no encontrado',
          code: 'CENTRO_COSTO_NOT_FOUND' 
        });
      }
      
      req.centroCosto = centroCosto;
    }
    next();
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error validating centro de costo',
      code: 'VALIDATION_DB_ERROR' 
    });
  }
};

const validateProyectoExists = async (req, res, next) => {
  try {
    if (req.validatedData.proyectoId) {
      const proyectoRepo = AppDataSource.getRepository(Proyecto);
      const proyecto = await proyectoRepo.findOneBy({ id: req.validatedData.proyectoId });
      
      if (!proyecto) {
        return res.status(400).json({ 
          error: 'Proyecto no encontrado',
          code: 'PROYECTO_NOT_FOUND' 
        });
      }
      
      if (proyecto.estado !== 'activo') {
        return res.status(400).json({ 
          error: 'No se puede asignar a un proyecto inactivo',
          code: 'PROYECTO_INACTIVE' 
        });
      }
      
      req.proyecto = proyecto;
    }
    next();
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error validating proyecto',
      code: 'VALIDATION_DB_ERROR' 
    });
  }
};

const validateUniqueProyectoCodigo = async (req, res, next) => {
  try {
    if (req.validatedData.codigo) {
      const proyectoRepo = AppDataSource.getRepository(Proyecto);
      const existingProyecto = await proyectoRepo.findOneBy({ codigo: req.validatedData.codigo });
      
      // If updating, exclude current project from uniqueness check
      if (existingProyecto && (!req.params.id || existingProyecto.id !== parseInt(req.params.id))) {
        return res.status(400).json({ 
          error: 'El código del proyecto ya existe',
          code: 'PROYECTO_CODIGO_EXISTS' 
        });
      }
    }
    next();
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error validating proyecto codigo',
      code: 'VALIDATION_DB_ERROR' 
    });
  }
};

module.exports = {
  validate,
  validateCentroCostoExists,
  validateProyectoExists,
  validateUniqueProyectoCodigo,
  schemas
};