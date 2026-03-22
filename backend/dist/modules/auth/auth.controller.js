"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
/** Authentication controller — handles HTTP request/response for auth endpoints */
class AuthController {
    /** POST /api/auth/login */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.authService.login(email, password);
            const response = {
                success: true,
                data: result,
                message: 'Login successful',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    /** POST /api/auth/register */
    async register(req, res, next) {
        try {
            const { email, password, name } = req.body;
            const user = await auth_service_1.authService.register(email, password, name);
            const response = {
                success: true,
                data: user,
                message: 'User registered successfully',
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    /** GET /api/auth/me */
    async getProfile(req, res, next) {
        try {
            const user = await auth_service_1.authService.getUserById(req.user.userId);
            const response = {
                success: true,
                data: user,
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map