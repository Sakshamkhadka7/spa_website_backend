const multer = require('multer');
const ApiError = require('../utils/ApiError');

exports.notFound = (req, _res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
exports.errorHandler = (error, _req, res, _next) => {
  let status = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  if (error instanceof multer.MulterError) { status = 400; message = error.code === 'LIMIT_FILE_SIZE' ? 'Image exceeds maximum file size' : error.message; }
  if (error.name === 'ValidationError') { status = 422; message = 'Validation failed'; }
  if (error.code === 11000) { status = 409; message = `${Object.keys(error.keyPattern || {})[0] || 'Value'} already exists`; }
  if (process.env.NODE_ENV !== 'test' && status >= 500) console.error(error);
  res.status(status).json({ success: false, message, ...(error.details ? { errors: error.details } : {}), ...(process.env.NODE_ENV === 'development' && status >= 500 ? { stack: error.stack } : {}) });
};
