"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
exports.optionalAuth = optionalAuth;
const passport_1 = __importDefault(require("passport"));
const types_1 = require("../types");
function authenticate(req, res, next) {
    passport_1.default.authenticate('jwt', { session: false }, (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new types_1.AppError('Authentication required', 401));
        }
        req.user = user;
        next();
    })(req, res, next);
}
function authorize(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new types_1.AppError('Authentication required', 401));
        }
        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return next(new types_1.AppError('Insufficient permissions', 403));
        }
        next();
    };
}
function optionalAuth(req, res, next) {
    passport_1.default.authenticate('jwt', { session: false }, (_err, user) => {
        if (user) {
            req.user = user;
        }
        next();
    })(req, res, next);
}
//# sourceMappingURL=auth.js.map