<<<<<<< HEAD
import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

export default function LoginPage() {
    const { login } = useAuth();
    const { designSystem, toggleDesignSystem } = useTheme();
    const isModern = designSystem === 'modern';
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('admin');
    const [showSuccess, setShowSuccess] = useState(false);

    // Auto-trigger demo if redirected from Landing Page demo button
    // Auto-trigger demo if redirected from Landing Page demo button removed as requested

    // Removed handleDemoLogin as requested for "proper" authentication

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await api.register(email, password, name);
                await login(email, password);
            }
            setShowSuccess(true);
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err: any) {
            setError(err.response?.data?.error || (isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please check your details.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex relative overflow-hidden transition-colors ${
            isModern ? 'bg-indigo-50' : 'bg-background-dark'
        }`}>
            {/* Floating Theme Toggle */}
            <button
                onClick={toggleDesignSystem}
                className={`absolute top-6 right-6 z-[60] size-10 rounded-full flex items-center justify-center transition-all ${
                    isModern 
                    ? 'bg-white text-indigo-600 shadow-lg border border-indigo-100 hover:bg-indigo-50' 
                    : 'bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(244,171,37,0.4)]'
                }`}
                title="Switch Theme"
            >
                <span className="material-symbols-outlined text-xl">
                    {isModern ? 'dark_mode' : 'light_mode'}
                </span>
            </button>
            {/* Left — Branding panel */}
            <div className={`hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative ${
                isModern ? 'bg-white shadow-xl z-10' : ''
            }`}>
                {/* Decorative animated waveform bars */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 flex items-end gap-1.5 opacity-20">
                    {[40, 65, 30, 80, 50, 70, 35, 90, 45, 60, 25, 75, 55].map((h, i) => (
                        <div
                            key={i}
                            className={`w-1.5 rounded-full ${isModern ? 'bg-indigo-600' : 'bg-primary'}`}
                            style={{
                                height: `${h}px`,
                                animation: `pulse ${1.5 + i * 0.15}s ease-in-out infinite alternate`,
                            }}
                        />
                    ))}
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-1.5 rounded-lg ${isModern ? 'bg-indigo-600 text-white' : 'bg-primary text-background-dark'}`}>
                            <span className="material-symbols-outlined text-2xl font-bold">graphic_eq</span>
                        </div>
                        <h2 className={`text-xl font-extrabold tracking-tight ${isModern ? 'text-slate-900' : 'text-slate-100'}`}>AskBox</h2>
                    </div>
                    <p className={`text-xs uppercase font-bold tracking-widest ${isModern ? 'text-indigo-400' : 'text-primary/50'}`}>AI for Social Good</p>
                </div>

                <div className="max-w-md">
                    <h1 className={`text-5xl font-black tracking-tight leading-tight mb-6 ${isModern ? 'text-slate-900' : 'text-slate-100'}`}>
                        Knowledge for
                        <br />
                        <span className={isModern ? 'text-indigo-600' : 'text-primary'}>Every Voice.</span>
                    </h1>
                    <p className={`leading-relaxed ${isModern ? 'text-slate-600' : 'text-slate-400'}`}>
                        Empowering rural India with AI-powered voice intelligence on any basic phone.
                        No internet required, just a simple phone call to access the world's knowledge.
                    </p>

                    {/* Impact counters */}
                    <div className="flex gap-8 mt-10">
                        <div>
                            <div className={`text-2xl font-black ${isModern ? 'text-indigo-600' : 'text-primary'}`}>120k+</div>
                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Questions Answered</div>
                        </div>
                        <div>
                            <div className={`text-2xl font-black ${isModern ? 'text-teal-600' : 'text-accent-teal'}`}>9</div>
                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Languages</div>
                        </div>
                        <div>
                            <div className={`text-2xl font-black ${isModern ? 'text-slate-800' : 'text-slate-100'}`}>45k</div>
                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Users</div>
                        </div>
                    </div>
                </div>

                <p className={`text-[10px] ${isModern ? 'text-slate-400' : 'text-slate-600'}`}>© 2024 AskBox Intelligence Systems. Team Node — Nagmani Jha</p>
            </div>

            {/* Right — Login form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className={`w-full max-w-sm p-8 rounded-3xl ${
                    isModern ? 'bg-white shadow-xl lg:shadow-none lg:bg-transparent' : ''
                }`}>
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className={`p-1.5 rounded-lg ${
                            isModern ? 'bg-indigo-600 text-white' : 'bg-primary text-background-dark'
                        }`}>
                            <span className="material-symbols-outlined text-2xl font-bold">graphic_eq</span>
                        </div>
                        <h2 className={`text-xl font-extrabold tracking-tight ${
                             isModern ? 'text-slate-900' : 'text-slate-100' 
                        }`}>AskBox</h2>
                    </div>

                    <h3 className={`text-2xl font-black tracking-tight mb-1 ${
                        isModern ? 'text-slate-900' : 'text-slate-100'
                    }`}>{isLogin ? 'Sign In' : 'Create an account'}</h3>
                    <p className="text-sm text-slate-500 mb-8">
                        {selectedRole === 'admin' 
                            ? 'Administrator Access Only' 
                            : (isLogin ? 'Sign in to your regional dashboard' : 'Register for standard access')}
                    </p>

                    {error && (
                        <div className={`mb-4 px-4 py-3 rounded-xl border text-sm ${
                            isModern ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block">Name</label>
                                <input
                                    id="register-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`w-full rounded-xl px-4 py-3 pr-10 text-sm outline-none transition-all focus:ring-1 ${
                                        isModern 
                                        ? 'bg-[#F3F4FB] border border-slate-300 text-slate-950 placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500' 
                                        : 'bg-[#f4ab25]/10 border border-[#f4ab25]/30 text-white placeholder-slate-500 focus:ring-primary focus:border-primary'
                                    }`}
                                    placeholder="John Doe"
                                    required={!isLogin}
                                    autoFocus={!isLogin}
                                />
                            </div>
                        )}
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 ${
                                        isModern 
                                        ? 'bg-[#F3F4FB] border border-slate-300 text-slate-950 placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500' 
                                        : 'bg-[#f4ab25]/10 border border-[#f4ab25]/30 text-white placeholder-slate-500 focus:ring-primary focus:border-primary'
                                    }`}
                                placeholder="admin@askbox.in"
                                required
                                autoFocus={isLogin}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block">Password</label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full rounded-xl px-4 py-3 pr-10 text-sm outline-none transition-all focus:ring-1 ${
                                        isModern 
                                        ? 'bg-[#F3F4FB] border border-slate-300 text-slate-950 placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500' 
                                        : 'bg-[#f4ab25]/10 border border-[#f4ab25]/30 text-white placeholder-slate-500 focus:ring-primary focus:border-primary'
                                    }`}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1 block text-center">Assign Role For This Session</label>
                            <div className={`flex p-1.5 rounded-2xl border-2 ${
                                isModern ? 'bg-slate-100 border-slate-200' : 'bg-primary/5 border-primary/20'
                            }`}>
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('admin')}
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-tighter rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        selectedRole === 'admin' 
                                        ? (isModern ? 'bg-indigo-600 text-white shadow-md' : 'bg-primary text-background-dark shadow-[0_0_10px_rgba(244,171,37,0.4)]') 
                                        : 'text-slate-500 hover:text-slate-600'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                                    Administrator
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('user')}
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-tighter rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        selectedRole === 'user' 
                                        ? (isModern ? 'bg-indigo-600 text-white shadow-md' : 'bg-primary text-background-dark shadow-[0_0_10px_rgba(244,171,37,0.4)]') 
                                        : 'text-slate-500 hover:text-slate-600'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">person</span>
                                    Standard User
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                                isModern 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg' 
                                : 'bg-primary text-background-dark hover:bg-primary/90'
                            }`}
                        >
                            {loading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                            {loading ? (isLogin ? 'Signing in...' : 'Signing up...') : (isLogin ? `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} →` : 'Sign Up →')}
                        </button>

                        {/* Demo login removed */}
                    </form>

                    {!(selectedRole === 'admin') && (
                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-400">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                    }}
                                    className={`font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer ${
                                        isModern ? 'text-indigo-600' : 'text-primary'
                                    }`}
                                >
                                    {isLogin ? 'Sign Up' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    )}

                    <p className={`text-center text-[10px] mt-8 ${
                        isModern ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                        Empowering rural education through AI-powered voice assistance
                    </p>
                </div>
            </div>

            {/* Success Animation Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background-dark/90 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-none">
                    <div className={`p-10 rounded-3xl max-w-sm w-full text-center transform scale-100 animate-in zoom-in-95 duration-300 shadow-2xl ${
                        isModern ? 'bg-white text-slate-800' : 'bg-surface-dark text-white border border-primary/20'
                    }`}>
                        <div className={`size-20 rounded-full mx-auto mb-6 flex items-center justify-center ${isModern ? 'bg-indigo-100 text-indigo-600' : 'bg-primary/20 text-primary'}`}>
                            <span className="material-symbols-outlined text-5xl animate-bounce">verified</span>
                        </div>
                        <h2 className="text-2xl font-black mb-2">Welcome Back!</h2>
                        <p className={`text-sm font-medium ${isModern ? 'text-slate-500' : 'text-slate-100/60'}`}>
                            Successfully signed in as <span className={`font-bold uppercase tracking-widest ${isModern ? 'text-indigo-600' : 'text-primary'}`}>{selectedRole}</span>
                        </p>
                        <div className="mt-8 flex justify-center">
                            <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
=======
import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto-trigger demo if redirected from Landing Page demo button
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('demo') === 'true') {
            handleDemoLogin();
        }
    }, []);

    const handleDemoLogin = async () => {
        setLoading(true);
        setError('');
        try {
            // Attempt a demo login with pre-configured developer credentials
            await login('demo@askbox.in', 'askbox1234');
            navigate('/dashboard');
        } catch (err: any) {
            setError('Demo account not yet initialized. Please Register or contact the developer.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await api.register(email, password, name);
                await login(email, password);
            }
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || (isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please check your details.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background-dark relative overflow-hidden">
            {/* Left — Branding panel */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative">
                {/* Decorative animated waveform bars */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 flex items-end gap-1.5 opacity-20">
                    {[40, 65, 30, 80, 50, 70, 35, 90, 45, 60, 25, 75, 55].map((h, i) => (
                        <div
                            key={i}
                            className="w-1.5 rounded-full bg-primary"
                            style={{
                                height: `${h}px`,
                                animation: `pulse ${1.5 + i * 0.15}s ease-in-out infinite alternate`,
                            }}
                        />
                    ))}
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-background-dark text-2xl font-bold">graphic_eq</span>
                        </div>
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-100">AskBox</h2>
                    </div>
                    <p className="text-xs text-primary/50 uppercase font-bold tracking-widest">AI for Social Good</p>
                </div>

                <div className="max-w-md">
                    <h1 className="text-5xl font-black tracking-tight text-slate-100 leading-tight mb-6">
                        Knowledge for
                        <br />
                        <span className="text-primary">Every Voice.</span>
                    </h1>
                    <p className="text-slate-400 leading-relaxed">
                        Empowering rural India with AI-powered voice intelligence on any basic phone.
                        No internet required, just a simple phone call to access the world's knowledge.
                    </p>

                    {/* Impact counters */}
                    <div className="flex gap-8 mt-10">
                        <div>
                            <div className="text-2xl font-black text-primary">120k+</div>
                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Questions Answered</div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-accent-teal">9</div>
                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Languages</div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-100">45k</div>
                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Users</div>
                        </div>
                    </div>
                </div>

                <p className="text-[10px] text-slate-600">© 2024 AskBox Intelligence Systems. Team Node — Nagmani Jha</p>
            </div>

            {/* Right — Login form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-background-dark text-2xl font-bold">graphic_eq</span>
                        </div>
                        <h2 className="text-xl font-extrabold tracking-tight">AskBox</h2>
                    </div>

                    <h3 className="text-2xl font-black tracking-tight mb-1">{isLogin ? 'Welcome back' : 'Create an account'}</h3>
                    <p className="text-sm text-slate-500 mb-8">{isLogin ? 'Sign in to the admin console' : 'Register to manage AskBox'}</p>

                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block">Name</label>
                                <input
                                    id="register-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                    placeholder="John Doe"
                                    required={!isLogin}
                                    autoFocus={!isLogin}
                                />
                            </div>
                        )}
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="admin@askbox.in"
                                required
                                autoFocus={isLogin}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block">Password</label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 pr-10 text-sm text-slate-100 placeholder-slate-600 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-background-dark py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {loading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                            {loading ? (isLogin ? 'Signing in...' : 'Signing up...') : (isLogin ? 'Sign In →' : 'Sign Up →')}
                        </button>

                        {isLogin && (
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleDemoLogin}
                                    className="w-full bg-slate-800 text-slate-300 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors border border-slate-700"
                                >
                                    <span className="material-symbols-outlined text-sm">explore</span>
                                    Explore Demo →
                                </button>
                                <p className="text-[10px] text-slate-600 text-center mt-2">No registration required for demo access</p>
                            </div>
                        )}
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-400">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="text-primary font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>

                    <p className="text-center text-[10px] text-slate-600 mt-8">
                        Empowering rural education through AI-powered voice assistance
                    </p>
                </div>
            </div>

            {/* Inline keyframes */}
            <style>{`
        @keyframes pulse {
          0% { transform: scaleY(0.6); }
          100% { transform: scaleY(1); }
        }
      `}</style>
        </div>
    );
}
>>>>>>> pr-3
