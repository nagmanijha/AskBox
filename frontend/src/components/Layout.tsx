<<<<<<< HEAD
import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/calls', label: 'Call Logs', icon: 'call' },
    { path: '/knowledge', label: 'Knowledge Base', icon: 'menu_book' },
    { path: '/analytics', label: 'Analytics', icon: 'analytics' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const { designSystem, toggleDesignSystem } = useTheme();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isModern = designSystem === 'modern';

    return (
        <div className={`relative flex h-screen w-full flex-col overflow-hidden ${isModern ? 'bg-gray-50 text-gray-900' : 'bg-background-dark text-slate-100'}`}>
            {/* Header / Top Navbar */}
            <header className={`flex items-center justify-between px-6 h-16 shrink-0 transition-colors duration-300 ${isModern
                    ? 'bg-white border-b border-gray-200'
                    : 'bg-background-dark border-b border-primary/20'
                }`}>
                <div className="flex items-center gap-4 md:w-64">
                    {/* Mobile hamburger */}
                    <button className="md:hidden text-inherit" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isModern ? 'bg-indigo-600 text-white' : 'bg-primary text-background-dark'}`}>
                            <span className="material-symbols-outlined text-2xl font-bold">graphic_eq</span>
                        </div>
                        <h2 className={`text-xl font-extrabold tracking-tight ${isModern ? 'text-gray-900' : 'text-slate-100'}`}>AskBox</h2>
                    </div>
                </div>

                {/* Global Search - Always Visible */}
                <div className="flex-1 max-w-2xl px-4 hidden md:block">
                    <div className="relative">
                        <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isModern ? 'text-gray-400' : 'text-slate-400'}`}>search</span>
                        <input
                            className={`w-full py-2 pl-10 pr-4 text-sm rounded-full outline-none transition-all ${isModern
                                    ? 'bg-gray-100 text-gray-900 focus:ring-2 focus:ring-indigo-500 placeholder-gray-500'
                                    : 'bg-primary/5 text-slate-100 focus:ring-1 focus:ring-primary placeholder-slate-500 border-none'
                                }`}
                            placeholder="Search calls, knowledge, settings..."
                            type="text"
                            disabled
                            title="Global search feature coming soon"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleDesignSystem}
                        className={`p-2 rounded-full transition-colors ${isModern ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-primary/10 text-slate-400'}`}
                        title={`Switch to ${isModern ? 'Legacy' : 'Modern'} Theme`}
                    >
                        <span className="material-symbols-outlined">{isModern ? 'dark_mode' : 'light_mode'}</span>
                    </button>

                    <div className={`size-9 rounded-full flex items-center justify-center border ${isModern ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-primary/20 border-primary/30 text-primary'}`}>
                        <span className="material-symbols-outlined text-xl">notifications</span>
                    </div>
                    
                    <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700">
                         <div
                            className={`size-9 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer ${isModern 
                                ? 'bg-indigo-600 text-white ring-2 ring-indigo-100' 
                                : 'bg-primary text-background-dark ring-2 ring-primary/20'}`}
                            title={user?.name || 'Admin'}
                        >
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <aside
                    className={`w-64 flex flex-col p-4 shrink-0 overflow-y-auto custom-scrollbar
                    fixed inset-y-[64px] left-0 z-50 md:static md:inset-auto transition-transform duration-300 border-r
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${isModern 
                        ? 'bg-white border-gray-200' 
                        : 'bg-background-dark/50 border-primary/10'
                    }`}
                >
                    <div className="flex-1 space-y-2 py-4">
                        {navItems
                            .filter(item => {
                                // RBAC Rule: Restricted pages for non-admins
                                const restrictedPaths = ['/analytics', '/settings', '/knowledge'];
                                if (restrictedPaths.includes(item.path)) {
                                    return user?.role === 'admin';
                                }
                                return true;
                            })
                            .map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                                        isActive
                                            ? isModern 
                                                ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm ring-1 ring-indigo-200/50' 
                                                : 'bg-primary/10 text-primary font-semibold'
                                            : isModern
                                                ? 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                : 'text-slate-400 hover:bg-primary/5 hover:text-slate-200'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${isActive ? '' : 'opacity-70'}`}>{item.icon}</span>
                                    <span>{item.label}</span>
                                    {isActive && isModern && <div className="ml-auto w-1 h-4 bg-indigo-600 rounded-full" />}
                                </Link>
                            );
                        })}
                    </div>
                    
                    <div className={`mt-auto pt-4 border-t ${isModern ? 'border-gray-100' : 'border-primary/10'}`}>
                        <div className="px-3 py-2 flex flex-col gap-3">
                             <div>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${isModern ? 'text-indigo-600' : 'text-primary'}`}>{user?.role}</p>
                                <p className={`text-xs font-semibold truncate ${isModern ? 'text-gray-900' : 'text-slate-200'}`}>{user?.email}</p>
                             </div>
                             <button 
                                onClick={logout}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                    isModern 
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">logout</span> Sign Out
                             </button>
                        </div>
                    </div>
                </aside>
                
                {/* Main Content */}
                <main className={`flex-1 overflow-y-auto custom-scrollbar relative p-6 lg:p-8 ${isModern ? 'bg-gray-50' : 'bg-background-dark'}`}>
                     <Outlet />
                </main>
            </div>
            
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
=======
import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/calls', label: 'Call Logs', icon: 'call' },
    { path: '/knowledge', label: 'Knowledge Base', icon: 'menu_book' },
    { path: '/analytics', label: 'Analytics', icon: 'analytics' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden">
            {/* Header / Top Navbar */}
            <header className="flex items-center justify-between border-b border-primary/20 bg-background-dark px-6 py-3 shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-background-dark text-2xl font-bold">graphic_eq</span>
                        </div>
                        <h2 className="text-xl font-extrabold tracking-tight">AskBox</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`text-sm font-medium transition-colors ${isActive
                                            ? 'text-primary font-semibold border-b-2 border-primary pb-1'
                                            : 'text-slate-400 hover:text-primary'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input
                            className="bg-primary/5 border-none rounded-full pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-primary min-w-[240px] outline-none"
                            placeholder="Global search..."
                            type="text"
                        />
                    </div>
                    <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                        <span className="material-symbols-outlined text-primary text-xl">notifications</span>
                    </div>
                    <div
                        className="size-9 rounded-full bg-primary flex items-center justify-center text-background-dark font-bold text-sm cursor-pointer ring-2 ring-primary/20"
                        title={user?.name || 'Admin'}
                    >
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>

                    {/* Mobile hamburger */}
                    <button className="md:hidden text-slate-400" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <aside
                    className={`w-64 border-r border-primary/10 bg-background-dark/50 flex flex-col p-6 shrink-0 overflow-y-auto custom-scrollbar
            fixed inset-y-[57px] left-0 z-50 md:static md:inset-auto transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                >
                    <div className="mb-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary/50 mb-4">Navigation</h3>
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                                ? 'bg-primary/10 text-primary font-semibold'
                                                : 'text-slate-400 hover:bg-primary/5'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                        <span className="text-sm">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* User & Logout at bottom */}
                    <div className="mt-auto pt-6 border-t border-primary/10">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent-teal/10 border border-primary/20">
                            <p className="text-xs font-bold text-primary mb-1">Team Node</p>
                            <p className="text-[10px] text-slate-400 mb-3">{user?.email || 'admin@askbox.in'}</p>
                            <button
                                onClick={logout}
                                className="w-full text-xs py-1.5 rounded bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">logout</span>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-background-dark">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
>>>>>>> pr-3
