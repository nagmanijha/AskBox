<<<<<<< HEAD
import { User } from '../../shared/types';
/** Authentication service — handles user signup, login, and token generation */
export declare class AuthService {
    /** Register a new user */
    register(email: string, password: string, name: string): Promise<User>;
    /** Authenticate user and return JWT */
    login(email: string, password: string): Promise<{
        user: User;
        token: string;
    }>;
    /** Get user by ID */
    getUserById(id: string): Promise<User>;
    /** Map a database row to User type */
    private mapRow;
}
export declare const authService: AuthService;
=======
import { AdminUser } from '../../shared/types';
/** Authentication service — handles user signup, login, and token generation */
export declare class AuthService {
    /** Register a new admin user */
    register(email: string, password: string, name: string, role?: string): Promise<AdminUser>;
    /** Authenticate user and return JWT */
    login(email: string, password: string): Promise<{
        user: AdminUser;
        token: string;
    }>;
    /** Get user by ID */
    getUserById(id: string): Promise<AdminUser>;
    /** Map a database row to AdminUser type */
    private mapRow;
}
export declare const authService: AuthService;
>>>>>>> pr-3
//# sourceMappingURL=auth.service.d.ts.map