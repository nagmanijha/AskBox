import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { OverviewMetrics } from '../types';
import DemoCallTracker from '../components/DemoCallTracker';
import { DEMO_SCENARIOS } from '../constants/demoScenarios';

export default function DashboardPage() {
    const { isDemoMode } = useAuth();
    const { designSystem } = useTheme();

    // Initialize based on URL param if present
    const [activeScenario, setActiveScenario] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const lang = params.get('lang');
        return DEMO_SCENARIOS.find(s => s.id === lang) || DEMO_SCENARIOS[0];
    });

    const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMetrics();
        // Simulate real-time updates
        const interval = setInterval(loadMetrics, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadMetrics = async () => {
        try {
            let data;
            if (isDemoMode) {
                // Return high-quality mock data for demo purposes
                data = {
                    totalCallsToday: 1245,
                    averageCallDuration: 184,
                    activeCallsCount: 12402,
                    topLanguages: [
                        { language: 'Hindi', count: 45000 },
                        { language: 'Bhojpuri', count: 28000 },
                        { language: 'Maithili', count: 12000 }
                    ],
                    topQuestions: [
                        { question: 'Crop diseases', count: 1200 },
                        { question: 'Weather forecast', count: 850 },
                        { question: 'Market prices', count: 720 }
                    ]
                };
            } else {
                data = await api.getAnalyticsOverview();
            }

            setMetrics({
                ...data,
                // fix type error
                activeCalls: isDemoMode ? 12402 + Math.floor(Math.random() * 50) : Math.floor(Math.random() * 500) + 12000,
            } as any);
        } catch (err) {
            console.error('Failed to load metrics', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !metrics) {
        return (
            <div className="flex items-center justify-center h-96">
                <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
            </div>
        );
    }

    const isModern = designSystem === 'modern';

    return (
        <div className="p-6 lg:p-8 space-y-8 min-h-[calc(100vh-80px)] text-skin-base transition-colors duration-300">
            {isDemoMode && (
                <div className={`p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 ${isModern ? 'bg-indigo-50 border border-indigo-100' : 'bg-primary/10 border border-primary/20'}`}>
                    <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined ${isModern ? 'text-indigo-600' : 'text-primary'}`}>explore</span>
                        <div>
                            <p className="text-sm font-bold text-skin-base italic">DEMO_CLUSTER_{activeScenario.id.toUpperCase()} ACTIVE</p>
                            <p className="text-xs text-skin-muted">Viewing simulated telemetry for {activeScenario.language} region.</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 p-1 rounded-lg ${isModern ? 'bg-white border border-slate-200' : 'bg-black/40 border border-white/5'}`}>
                        {DEMO_SCENARIOS.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setActiveScenario(s)}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeScenario.id === s.id 
                                    ? (isModern ? 'bg-indigo-600 text-white shadow-sm' : 'bg-primary text-background-dark') 
                                    : 'text-skin-muted hover:text-skin-base'
                                    }`}
                            >
                                {s.language}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Primary KPIs Area */}
            <div className="space-y-4">
                 <h2 className={`text-sm font-bold uppercase tracking-widest ${isModern ? 'text-indigo-600' : 'text-primary'}`}>Critical Metrics</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Active Threads - Moved to primary */}
                    <div className="ds-card relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className={`material-symbols-outlined text-4xl ${isModern ? 'text-indigo-600' : 'text-primary'}`}>call</span>
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-widest ${isModern ? 'text-gray-500' : 'text-primary/60'}`}>Active Threads</p>
                        <h3 className="text-3xl font-semibold mt-2 tabular-nums">{isDemoMode ? activeScenario.activeCalls : (metrics?.activeCallsCount?.toLocaleString() || '12,402')}</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isModern ? 'bg-gray-100' : 'bg-primary/10'}`}>
                                <div className={`h-full rounded-full w-[65%] ${isModern ? 'bg-indigo-600' : 'bg-primary'}`}></div>
                            </div>
                            <span className="text-[10px] font-bold text-red-500 uppercase">Peak</span>
                        </div>
                    </div>

                     {/* STT Accuracy */}
                    <div className="ds-card relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className={`material-symbols-outlined text-4xl ${isModern ? 'text-emerald-500' : 'text-accent-teal'}`}>translate</span>
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-widest ${isModern ? 'text-gray-500' : 'text-accent-teal/60'}`}>STT Accuracy</p>
                        <h3 className="text-3xl font-semibold mt-2 tabular-nums">{isDemoMode ? activeScenario.accuracy : '99.12%'}</h3>
                        <div className="mt-4 flex items-center gap-2">
                             <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isModern ? 'bg-gray-100' : 'bg-accent-teal/10'}`}>
                                <div className={`h-full rounded-full w-[99%] ${isModern ? 'bg-emerald-500' : 'bg-accent-teal'}`}></div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase ${isModern ? 'text-emerald-600' : 'text-accent-teal'}`}>Stable</span>
                        </div>
                    </div>

                    {/* Global Compute */}
                    <div className="ds-card relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className={`material-symbols-outlined text-4xl ${isModern ? 'text-indigo-600' : 'text-primary'}`}>memory</span>
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-widest ${isModern ? 'text-gray-500' : 'text-primary/60'}`}>Compute Load</p>
                        <h3 className="text-3xl font-semibold mt-2 tabular-nums">{isDemoMode ? activeScenario.compute : '88.4%'}</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isModern ? 'bg-gray-100' : 'bg-primary/10'}`}>
                                <div className={`h-full rounded-full w-[88%] ${isModern ? 'bg-indigo-600' : 'bg-primary'}`}></div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-500">+2.1%</span>
                        </div>
                    </div>

                    {/* State Nodes */}
                    <div className="ds-card relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className={`material-symbols-outlined text-4xl ${isModern ? 'text-emerald-500' : 'text-accent-teal'}`}>hub</span>
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-widest ${isModern ? 'text-gray-500' : 'text-accent-teal/60'}`}>State Nodes</p>
                        <h3 className="text-3xl font-semibold mt-2 tabular-nums">{isDemoMode ? activeScenario.nodes : '28/28'}</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isModern ? 'bg-gray-100' : 'bg-accent-teal/10'}`}>
                                <div className={`h-full rounded-full w-full ${isModern ? 'bg-emerald-500' : 'bg-accent-teal'}`}></div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase ${isModern ? 'text-emerald-600' : 'text-accent-teal'}`}>Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: AI Engine & Connectivity */}
                <div className="lg:col-span-8 space-y-8">
                    {/* AI Engine Health (Waveforms) */}
                    <div className={`${isModern ? 'ds-card' : 'glass-panel'} rounded-2xl p-8 relative overflow-hidden`}>
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">settings_voice</span>
                                <h3 className="text-xl font-bold text-skin-base">AI Engine Health Pulse</h3>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-skin-muted">LLM V5.2</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-accent-teal"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-skin-muted">STT Nexus</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {/* LLM Pulse */}
                            <div className="relative">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold text-skin-muted">LLM Processing Pulse</span>
                                    <span className={`text-xs font-bold text-${isDemoMode ? activeScenario.color : 'primary'} tracking-widest`}>{isDemoMode ? activeScenario.accuracy : '99.4%'} OPS</span>
                                </div>
                                <div className={`h-24 w-full ${isModern ? 'bg-indigo-50 border-indigo-100' : `bg-${isDemoMode ? activeScenario.color : 'primary'}/5 border-${isDemoMode ? activeScenario.color : 'primary'}/10`} rounded-lg border overflow-hidden relative`}>
                                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                        <path className="opacity-50" d="M0 50 Q 50 10, 100 50 T 200 50 T 300 50 T 400 50 T 500 50 T 600 50 T 700 50 T 800 50 T 900 50 T 1000 50" fill="none" stroke={isDemoMode ? (activeScenario.color === 'primary' ? (isModern ? '#4F46E5' : '#f4ab25') : (isModern ? '#059669' : '#2dd4bf')) : (isModern ? '#4F46E5' : '#f4ab25')} strokeWidth="2"></path>
                                        <path d="M0 50 Q 50 80, 100 50 T 200 50 T 300 50 T 400 50 T 500 50 T 600 50 T 700 50 T 800 50 T 900 50 T 1000 50" fill="none" stroke={isDemoMode ? (activeScenario.color === 'primary' ? (isModern ? '#4F46E5' : '#f4ab25') : (isModern ? '#059669' : '#2dd4bf')) : (isModern ? '#4F46E5' : '#f4ab25')} strokeWidth="3"></path>
                                    </svg>
                                    <div className="scanning-line absolute top-0 left-0 animate-[move_5s_infinite]"></div>
                                </div>
                            </div>

                            {/* STT Pulse */}
                            <div className="relative">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold text-skin-muted">STT Waveform Accuracy</span>
                                    <span className="text-xs font-bold text-accent-teal tracking-widest">{isDemoMode ? '0.08ms' : '0.12ms'} LAG</span>
                                </div>
                                <div className={`h-24 w-full ${isModern ? 'bg-emerald-50 border-emerald-100' : 'bg-accent-teal/5 border-accent-teal/10'} rounded-lg border overflow-hidden relative`}>
                                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                        <path d="M0 50 L 20 45 L 40 55 L 60 30 L 80 70 L 100 40 L 120 60 L 140 20 L 160 80 L 180 40 L 200 50 L 220 30 L 240 70 L 260 40 L 280 60 L 300 20 L 320 80 L 340 40 L 360 50 L 380 30 L 400 70" fill="none" stroke={isModern ? '#059669' : '#2dd4bf'} strokeWidth="2"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Connectivity Pulse */}
                    <div className={`${isModern ? 'ds-card' : 'glass-panel'} rounded-2xl p-8`}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">cell_tower</span>
                                <h3 className="text-xl font-bold text-skin-base">Connectivity Pulse</h3>
                            </div>
                            <div className="text-xs text-skin-muted">Live feed from 28 telecom circles</div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* States */}
                            {(isDemoMode ? activeScenario.labels : ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi NCR']).map((label, idx) => (
                                <div key={label} className={`p-4 rounded-xl flex flex-col gap-2 ${idx === 3 && !isDemoMode 
                                    ? (isModern ? 'ring-1 ring-indigo-400 bg-indigo-50' : 'ring-1 ring-primary/40 bg-primary/5 border border-primary/10') 
                                    : (isModern ? 'bg-slate-50 border border-slate-100' : 'bg-primary/5 border border-primary/10')}`}>
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-skin-base">{label}</span>
                                        <span className={`h-2 w-2 rounded-full ${idx === 3 && !isDemoMode ? 'bg-primary glow-primary animate-ping' : 'bg-accent-teal glow-teal'}`}></span>
                                    </div>
                                    <div className={`text-lg font-black ${idx === 3 && !isDemoMode ? 'text-primary' : 'text-skin-base'}`}>
                                        {idx === 3 && !isDemoMode ? '82.4%' : '99.9%'}
                                    </div>
                                    <div className={`text-[10px] tracking-tighter uppercase ${idx === 3 && !isDemoMode ? 'text-primary' : 'text-skin-muted'}`}>
                                        {idx === 3 && !isDemoMode ? 'NODE CONGESTION' : 'SIGNAL STABLE'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`mt-8 relative h-64 w-full rounded-xl border flex items-center justify-center overflow-hidden ${isModern ? 'bg-indigo-50 border-indigo-100' : 'bg-primary/5 border-primary/10'}`}>
                            {/* Map Mock */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
                            <div className="z-10 text-center">
                                <span className="material-symbols-outlined text-6xl text-primary/40 mb-2">map</span>
                                <p className="text-sm font-bold text-skin-muted">Interactive Connectivity Mesh</p>
                                <p className="text-xs text-skin-muted mt-1">Overlaying 45,000+ Signal Towers</p>
                            </div>
                            <div className="absolute top-1/4 left-1/3 p-2 bg-accent-teal text-background-dark rounded shadow-lg text-[8px] font-bold">NODE_01: STABLE</div>
                            <div className="absolute bottom-1/3 right-1/4 p-2 bg-primary text-background-dark rounded shadow-lg text-[8px] font-bold">NODE_24: REROUTING</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Clusters & Allocation */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Dialect Clusters */}
                    <div className={`${isModern ? 'ds-card' : 'glass-panel'} rounded-2xl p-8 h-fit`}>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-red-500">error_med</span>
                            <h3 className="text-xl font-bold text-skin-base">Dialect Clusters</h3>
                        </div>
                        <div className="space-y-6">
                            <p className="text-xs text-skin-muted leading-relaxed">STT performance degradation identified in specific regional pockets.</p>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                        <span className="text-skin-base">Current Dialect</span>
                                        <span className="text-accent-teal">{isDemoMode ? activeScenario.language : 'Hindi'}</span>
                                    </div>
                                    <div className={`h-2 w-full rounded-full overflow-hidden ${isModern ? 'bg-gray-200' : 'bg-slate-800'}`}>
                                        <div className="h-full bg-accent-teal rounded-full w-[94%]"></div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                        <span className="text-skin-base">Error Rate</span>
                                        <span className="text-red-400">{isDemoMode ? activeScenario.errorRate : '2.1%'}</span>
                                    </div>
                                    <div className={`h-2 w-full rounded-full overflow-hidden ${isModern ? 'bg-gray-200' : 'bg-slate-800'}`}>
                                        <div className="h-full bg-red-500 rounded-full w-[15%]"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-primary/10">
                                <button className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border ${isModern ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' : 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'}`}>
                                    Optimize Dataset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Demo Call Tracker */}
                    <DemoCallTracker scenario={isDemoMode ? activeScenario : undefined} />

                    {/* Resource Allocation */}
                    <div className={`${isModern ? 'ds-card' : 'glass-panel'} rounded-2xl p-8`}>
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-accent-teal">analytics</span>
                            <h3 className="text-xl font-bold text-skin-base">Resource Allocation</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div className={`flex-1 p-4 rounded-xl border-l-4 border-l-accent-teal ${isModern ? 'bg-slate-50' : 'glass-panel'}`}>
                                    <p className="text-[10px] font-bold text-skin-muted uppercase">Compute</p>
                                    <p className="text-xl font-black text-skin-base">{isDemoMode ? activeScenario.compute : '4.2 TFlops'}</p>
                                </div>
                                <div className={`w-1/3 p-4 rounded-xl border-l-4 border-l-primary ${isModern ? 'bg-slate-50' : 'glass-panel'}`}>
                                    <p className="text-[10px] font-bold text-skin-muted uppercase">Load</p>
                                    <p className="text-xl font-black text-skin-base">{isDemoMode ? activeScenario.load : '72%'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className={`w-2/5 p-4 rounded-xl border-l-4 border-l-primary ${isModern ? 'bg-slate-50' : 'glass-panel'}`}>
                                    <p className="text-[10px] font-bold text-skin-muted uppercase">RAM</p>
                                    <p className="text-xl font-black text-skin-base">1.2 TB</p>
                                </div>
                                <div className={`flex-1 p-4 rounded-xl border-l-4 border-l-accent-teal ${isModern ? 'bg-slate-50' : 'glass-panel'}`}>
                                    <p className="text-[10px] font-bold text-skin-muted uppercase">Bandwidth</p>
                                    <p className="text-xl font-black text-skin-base">420 Gbps</p>
                                </div>
                            </div>
                            <div className={`p-4 rounded-xl border-l-4 border-l-slate-600 ${isModern ? 'bg-slate-100' : 'glass-panel bg-slate-900/40'}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-skin-muted uppercase">Cluster: {isDemoMode ? `DEMO_${activeScenario.id.toUpperCase()}_01` : 'MUMBAI_WEST_A2'}</p>
                                        <p className="text-sm font-bold text-skin-base">Autoscaling Triggered</p>
                                    </div>
                                    <span className="material-symbols-outlined text-accent-teal animate-spin text-sm">settings</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Log Overlay */}
                    <div className={`rounded-2xl p-6 font-mono border ${isModern ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-black/80 border-primary/20'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-primary/80 uppercase">Live System Logs</span>
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                        </div>
                        <div className="space-y-2 overflow-hidden h-40">
                            <p className="text-[10px] text-accent-teal/70">[14:22:01] HANDSHAKE: NODE_DELHI_04_INIT</p>
                            <p className="text-[10px] text-slate-500">[14:22:04] STT_STREAM: PACKET_LOSS_0.02%</p>
                            <p className="text-[10px] text-primary/70">[14:22:12] AUTH: USER_ID_4492_SUCCESS</p>
                            <p className="text-[10px] text-slate-500">[14:22:15] LLM_PROC: TOKENS_SEC_45.2</p>
                            <p className="text-[10px] text-red-500/70">[14:22:20] WARN: LATENCY_THRESHOLD_MUMBAI</p>
                            <p className="text-[10px] text-accent-teal/70">[14:22:25] RECOVERY: AUTO_REROUTE_SUCCESS</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
