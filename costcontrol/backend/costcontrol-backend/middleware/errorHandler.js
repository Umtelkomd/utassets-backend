const errorHandler = (error, req, res, next) => {
  // Log error for monitoring
  console.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let status = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized access';
    code = 'UNAUTHORIZED';
  } else if (error.name === 'ForbiddenError') {
    status = 403;
    message = 'Access forbidden';
    code = 'FORBIDDEN';
  } else if (error.name === 'NotFoundError') {
    status = 404;
    message = 'Resource not found';
    code = 'NOT_FOUND';
  } else if (error.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'Duplicate entry';
    code = 'DUPLICATE_ENTRY';
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    status = 400;
    message = 'Referenced resource not found';
    code = 'REFERENCE_ERROR';
  }

  // Don't leak internal details in production
  const response = {
    error: message,
    code,
    timestamp: new Date().toISOString()
  };

  // Add additional info in development
  if (process.env.NODE_ENV === 'development') {
    response.details = error.message;
    response.stack = error.stack;
  }

  res.status(status).json(response);
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'ENDPOINT_NOT_FOUND',
    url: req.originalUrl,
    method: req.method
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};