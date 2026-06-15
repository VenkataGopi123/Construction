"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
exports.asyncHandler = asyncHandler;
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
function notFoundHandler(req, _res, next) {
    next(new types_1.AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}
function errorHandler(err, _req, res, _next) {
    if (err instanceof types_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
        return;
    }
    if (err.name === 'UnauthorizedError' || err.message === 'Unauthorized') {
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
        return;
    }
    if (err.code === '23505') {
        res.status(409).json({ success: false, error: 'Duplicate entry - record already exists' });
        return;
    }
    if (err.code === '23503') {
        res.status(400).json({ success: false, error: 'Referenced record does not exist' });
        return;
    }
    logger_1.logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
    });
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
}
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=errorHandler.js.map