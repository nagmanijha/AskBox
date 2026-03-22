import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
    const navigate = useNavigate();
    const { setDemoRole } = useAuth();
    const { designSystem } = useTheme();

    const handleRoleSelect = (role: 'admin' | 'user') => {
        setDemoRole(role);
        navigate(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    };

    const isModern = designSystem === 'modern';

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${isModern ? 'bg-slate-50' : 'bg-[#0a0a0c]'}`}>
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 ${isModern ? 'bg-indigo-300' : 'bg-primary'}`}></div>
                <div className={`absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 ${isModern ? 'bg-emerald-300' : 'bg-accent-teal'}`}></div>
            </div>

            <div className="relative z-10 max-w-4xl w-full text-center space-y-12">
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className={`material-symbols-outlined text-5xl ${isModern ? 'text-indigo-600' : 'text-primary animate-pulse'}`}>settings_voice</span>
                        <h1 className={`text-5xl font-black tracking-tighter ${isModern ? 'text-slate-900' : 'text-white'}`}>
                            ASK<span className={isModern ? 'text-indigo-600' : 'text-primary'}>BOX</span>
                        </h1>
                    </div>
                    <p className={`text-xl font-medium max-w-2xl mx-auto ${isModern ? 'text-slate-600' : 'text-slate-400'}`}>
                        Multilingual AI Voice Assistant for Rural Empowerment & Governance.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    {/* Admin Entry */}
                    <button
                        onClick={() => handleRoleSelect('admin')}
                        className={`group relative p-8 rounded-3xl border-2 transition-all duration-500 text-left overflow-hidden ${
                            isModern 
                            ? 'bg-white border-slate-100 hover:border-indigo-500 hover:shadow-2xl shadow-slate-200/50' 
                            : 'bg-[#151518] border-white/5 hover:border-primary/50 hover:shadow-[0_0_50px_-12px_rgba(244,171,37,0.3)]'
                        }`}
                    >
                        <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity ${isModern ? 'text-indigo-600' : 'text-primary'}`}>
                            <span className="material-symbols-outlined text-9xl">admin_panel_settings</span>
                        </div>
                        
                        <div className={`size-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${
                            isModern ? 'bg-indigo-50 text-indigo-600' : 'bg-primary/10 text-primary'
                        }`}>
                            <span className="material-symbols-outlined text-3xl">monitoring</span>
                        </div>

                        <h3 className={`text-2xl font-bold mb-2 ${isModern ? 'text-slate-900' : 'text-white'}`}>Admin Dashboard</h3>
                        <p className={`text-sm leading-relaxed ${isModern ? 'text-slate-500' : 'text-slate-400'}`}>
                            Infrastructure telemetry, global analytics, and knowledge management for system controllers.
                        </p>
                        
                        <div className={`mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${isModern ? 'text-indigo-600' : 'text-primary'}`}>
                            Enter Control Room <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                        </div>
                    </button>

                    {/* User Entry */}
                    <button
                        onClick={() => handleRoleSelect('user')}
                        className={`group relative p-8 rounded-3xl border-2 transition-all duration-500 text-left overflow-hidden ${
                            isModern 
                            ? 'bg-white border-slate-100 hover:border-emerald-500 hover:shadow-2xl shadow-slate-200/50' 
                            : 'bg-[#151518] border-white/5 hover:border-accent-teal/50 hover:shadow-[0_0_50px_-12px_rgba(45,212,191,0.3)]'
                        }`}
                    >
                        <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity ${isModern ? 'text-emerald-600' : 'text-accent-teal'}`}>
                            <span className="material-symbols-outlined text-9xl">support_agent</span>
                        </div>

                        <div className={`size-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${
                            isModern ? 'bg-emerald-50 text-emerald-600' : 'bg-accent-teal/10 text-accent-teal'
                        }`}>
                            <span className="material-symbols-outlined text-3xl">perm_contact_calendar</span>
                        </div>

                        <h3 className={`text-2xl font-bold mb-2 ${isModern ? 'text-slate-900' : 'text-white'}`}>User Dashboard</h3>
                        <p className={`text-sm leading-relaxed ${isModern ? 'text-slate-500' : 'text-slate-400'}`}>
                            Personal call history, transcripts, and AI-assisted knowledge lookup for field officers.
                        </p>

                        <div className={`mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${isModern ? 'text-emerald-600' : 'text-accent-teal'}`}>
                            Enter Workspace <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                        </div>
                    </button>
                </div>

                <div className={`pt-12 border-t border-dashed flex flex-col md:flex-row items-center justify-center gap-8 ${isModern ? 'border-slate-200' : 'border-white/10'}`}>
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full bg-emerald-500 animate-pulse`}></span>
                        <span className={`text-xs font-bold uppercase tracking-widest ${isModern ? 'text-slate-500' : 'text-slate-400'}`}>AI Engine Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full bg-indigo-500`}></span>
                        <span className={`text-xs font-bold uppercase tracking-widest ${isModern ? 'text-slate-500' : 'text-slate-400'}`}>Node v18.4 Stable</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full bg-amber-500`}></span>
                        <span className={`text-xs font-bold uppercase tracking-widest ${isModern ? 'text-slate-500' : 'text-slate-400'}`}>Real-time Sync Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
