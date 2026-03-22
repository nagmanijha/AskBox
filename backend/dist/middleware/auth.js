<<<<<<< HEAD
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireRole = requireRole;
/**
 * JWT authentication middleware.
 * Extracts and verifies the Bearer token from the Authorization header.
 * Attaches decoded user info to req.user.
 */
function authMiddleware(req, _res, next) {
    // Disabled auth for now - always acting as an admin
    req.user = { userId: 'env-admin', email: 'admin@askbox.in', role: 'admin' };
    next();
    /*
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            next(error);
        } else {
            next(new UnauthorizedError('Invalid or expired token'));
        }
    }
    */
}
/**
 * Role-based access control middleware.
 * Must be used AFTER authMiddleware.
 */
function requireRole(...roles) {
    return (req, _res, next) => {
        // Disabled role checking
        next();
        /*
        if (!req.user) {
            next(new UnauthorizedError('Authentication required'));
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(new UnauthorizedError('Insufficient permissions'));
            return;
        }
        next();
        */
    };
}
=======
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const errors_1 = require("../shared/errors");
/**
 * JWT authentication middleware.
 * Extracts and verifies the Bearer token from the Authorization header.
 * Attaches decoded user info to req.user.
 */
function authMiddleware(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof errors_1.UnauthorizedError) {
            next(error);
        }
        else {
            next(new errors_1.UnauthorizedError('Invalid or expired token'));
        }
    }
}
/**
 * Role-based access control middleware.
 * Must be used AFTER authMiddleware.
 */
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            next(new errors_1.UnauthorizedError('Authentication required'));
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(new errors_1.UnauthorizedError('Insufficient permissions'));
            return;
        }
        next();
    };
}
>>>>>>> pr-3
//# sourceMappingURL=auth.js.map