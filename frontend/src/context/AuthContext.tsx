<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isDemoMode: boolean;
    isLoading: boolean;
    login: (email: string, password: string, isDemo?: boolean) => Promise<void>;
    logout: () => void;
    setDemoRole: (role: 'admin' | 'user') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load persisted auth state on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('askbox_token');
        const savedUser = localStorage.getItem('askbox_user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            setIsDemoMode(localStorage.getItem('askbox_demo') === 'true');
        }
        setIsLoading(false);
    }, []);

    const setDemoRole = (role: 'admin' | 'user') => {
        const isAdmin = role === 'admin';
        const mockUser: User = {
            id: isAdmin ? 'admin-uuid-001' : 'user-uuid-002',
            email: isAdmin ? 'admin@askbox.in' : 'user@askbox.in',
            name: isAdmin ? 'System Administrator' : 'Ramesh K.',
            role: role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const mockToken = 'verified-session-token-' + role;

        setToken(mockToken);
        setUser(mockUser);
        setIsDemoMode(true);
        localStorage.setItem('askbox_token', mockToken);
        localStorage.setItem('askbox_user', JSON.stringify(mockUser));
        localStorage.setItem('askbox_role', role);
        localStorage.setItem('askbox_demo', 'true');
    };

    const login = async (email: string, password: string, isDemo = false) => {
        // Hardcoded check from .env for "proper" mock authentication
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        const adminPass = import.meta.env.VITE_ADMIN_PASSWORD;
        const userEmail = import.meta.env.VITE_USER_EMAIL;
        const userPass = import.meta.env.VITE_USER_PASSWORD;

        if ((email === adminEmail && password === adminPass) || (email === userEmail && password === userPass)) {
            const isAdmin = email === adminEmail;
            setDemoRole(isAdmin ? 'admin' : 'user');
            return;
        }

        // Fallback to real API if not using hardcoded credentials
        try {
            const result = await api.login(email, password);
            setToken(result.token);
            setUser(result.user);
            setIsDemoMode(false);
            localStorage.setItem('askbox_token', result.token);
            localStorage.setItem('askbox_user', JSON.stringify(result.user));
            localStorage.setItem('askbox_role', result.user.role);
            localStorage.removeItem('askbox_demo');
        } catch (err) {
            console.error('Login failed', err);
            throw err;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsDemoMode(false);
        localStorage.removeItem('askbox_token');
        localStorage.removeItem('askbox_user');
        localStorage.removeItem('askbox_role');
        localStorage.removeItem('askbox_demo');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                isDemoMode,
                isLoading,
                login,
                logout,
                setDemoRole,
            }}
        >
            {children}
        </AuthContext.Provider >
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
=======
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isDemoMode: boolean;
    isLoading: boolean;
    login: (email: string, password: string, isDemo?: boolean) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load persisted auth state on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('askbox_token');
        const savedUser = localStorage.getItem('askbox_user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            setIsDemoMode(localStorage.getItem('askbox_demo') === 'true');
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string, isDemo = false) => {
        if (isDemo || email === 'demo@askbox.in') {
            const mockUser: User = {
                id: 'demo-uuid-001',
                email: 'demo@askbox.in',
                name: 'Demo Guest',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const mockToken = 'demo-jwt-token-pure-frontend';

            setToken(mockToken);
            setUser(mockUser);
            setIsDemoMode(true);
            localStorage.setItem('askbox_token', mockToken);
            localStorage.setItem('askbox_user', JSON.stringify(mockUser));
            localStorage.setItem('askbox_demo', 'true');
            return;
        }

        const result = await api.login(email, password);
        setToken(result.token);
        setUser(result.user);
        setIsDemoMode(false);
        localStorage.setItem('askbox_token', result.token);
        localStorage.setItem('askbox_user', JSON.stringify(result.user));
        localStorage.removeItem('askbox_demo');
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsDemoMode(false);
        localStorage.removeItem('askbox_token');
        localStorage.removeItem('askbox_user');
        localStorage.removeItem('askbox_demo');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                isDemoMode,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider >
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
>>>>>>> pr-3
