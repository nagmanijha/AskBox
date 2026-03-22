<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CallsPage from './pages/CallsPage';
import KnowledgePage from './pages/KnowledgePage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import { LoadingSpinner } from './components/LoadingSpinner';

/** Protected route wrapper — redirects to login if not authenticated */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/** Admin route wrapper — redirects to dashboard if not an admin */
function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    return user?.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

/** Public route — redirects to dashboard if already authenticated */
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Index */}
                        <Route
                            path="/"
                            element={
                                <PublicRoute>
                                    <LandingPage />
                                </PublicRoute>
                            }
                        />

                        {/* Login */}
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <LoginPage />
                                </PublicRoute>
                            }
                        />

                        {/* Protected — inside Layout with sidebar */}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/admin/dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
                            <Route path="/user/dashboard" element={<DashboardPage />} />
                            <Route path="/calls" element={<CallsPage />} />
                            <Route path="/knowledge" element={<AdminRoute><KnowledgePage /></AdminRoute>} />
                            <Route path="/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>} />
                            <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
                        </Route>

                        {/* Catch-all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
            </BrowserRouter>
        </AuthProvider>
    </ThemeProvider>
    );
}
=======
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CallsPage from './pages/CallsPage';
import KnowledgePage from './pages/KnowledgePage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import UserPortalPage from './pages/UserPortalPage';

/** Protected route wrapper — redirects to login if not authenticated */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/** Public route — redirects to dashboard if already authenticated */
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Index */}
                    <Route path="/" element={<LandingPage />} />
                    
                    {/* User Portal */}
                    <Route path="/portal" element={<UserPortalPage />} />

                    {/* Login */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />

                    {/* Protected — inside Layout with sidebar */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/calls" element={<CallsPage />} />
                        <Route path="/knowledge" element={<KnowledgePage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Route>

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
>>>>>>> pr-3
