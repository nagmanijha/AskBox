import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { OverviewMetrics } from '../types';
import DemoCallTracker from '../components/DemoCallTracker';
import { DEMO_SCENARIOS } from '../constants/demoScenarios';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

export default function DashboardPage() {
    const { isDemoMode } = useAuth();
    const { designSystem } = useTheme();

    const [activeScenario, setActiveScenario] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const lang = params.get('lang');
        return DEMO_SCENARIOS.find(s => s.id === lang) || DEMO_SCENARIOS[0];
    });

    const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [latencyData, setLatencyData] = useState(() => {
        return Array.from({ length: 30 }).map((_, i) => ({
            time: i,
            latency: Math.floor(Math.random() * 200) + 700
        }));
    });

    useEffect(() => {
        loadMetrics();
        const interval = setInterval(loadMetrics, 10000);
        return () => clearInterval(interval);
    }, []);

    // Update latency chart data dynamically
    useEffect(() => {
        const interval = setInterval(() => {
            setLatencyData(prev => {
                const newData = [...prev.slice(1)];
                const isSpike = Math.random() > 0.9;
                newData.push({
                    time: prev[prev.length - 1].time + 1,
                    latency: isSpike ? Math.floor(Math.random() * 800) + 1200 : Math.floor(Math.random() * 200) + 700
                });
                return newData;
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);


    const loadMetrics = async () => {
        try {
            let data;
            if (isDemoMode) {
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
                activeCalls: isDemoMode ? 1402 + Math.floor(Math.random() * 15) : Math.floor(Math.random() * 50) + 1400,
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
                 <h2 className={`text-sm font-bold uppercase tracking-widest ${isModern ? 'text-indigo-600' : 'text-primary'}`}>Operational Telemetry</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Active Calls */}
                    <div className="ds-card relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className={`material-symbols-outlined text-4xl ${isModern ? 'text-indigo-600' : 'text-primary'}`}>call</span>
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-widest ${isModern ? 'text-gray-500' : 'text-primary/60'}`}>Active Calls</p>
                        <h3 className="text-3xl font-semibold mt-2 tabular-nums">{isDemoMode ? metrics?.activeCalls : (metrics?.activeCallsCount?.toLocaleString() || '1,402')}</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px] text-emerald-500">trending_up</span>
                            <span className="text-[10px] font-bold text-emerald-500">+14% vs yesterday</span>
                        </div>
                    </div>

                     {/* Avg Latency */}
                    <div className="ds-card relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className={`material-symbols-outlined text-4xl ${isModern ? 'text-emerald-500' : 'text-accent-teal'}`}>speed</span>
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-widest ${isModern ? 'text-gray-500' : 'text-accent-teal/60'}`}>Avg Response Latency</p>
                        <h3 className="text-3xl font-semibold mt-2 tabular-nums">1.12s</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
                            <span className={`text-[10px] font-bold uppercase ${isModern ? 'text-emerald-600' : 'text-accent-teal'}`}>Stable (P95: 1.4s)</span>
                        </div>
                    </div>

                    {/* Resolution Rate */}
                    <div className="ds-card relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className={`material-symbols-outlined text-4xl ${isModern ? 'text-indigo-600' : 'text-primary'}`}>task_alt</span>
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-widest ${isModern ? 'text-gray-500' : 'text-primary/60'}`}>Successful Resolutions</p>
                        <h3 className="text-3xl font-semibold mt-2 tabular-nums">88.5%</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px] text-red-400">trending_down</span>
                            <span className="text-[10px] font-bold text-red-400">-1.2% (Failed STT spikes)</span>
                        </div>
                    </div>

                    {/* Escalation Rate */}
                    <div className="ds-card relative overflow-hidden group border-l-4 border-l-amber-500">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className={`material-symbols-outlined text-4xl ${isModern ? 'text-amber-500' : 'text-amber-400'}`}>support_agent</span>
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-widest ${isModern ? 'text-gray-500' : 'text-amber-400/60'}`}>Human Escalation Rate</p>
                        <h3 className="text-3xl font-semibold mt-2 tabular-nums">4.2%</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px] text-amber-500">warning</span>
                            <span className={`text-[10px] font-bold uppercase ${isModern ? 'text-amber-600' : 'text-amber-400'}`}>14 Calls in Queue</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: AI Engine & Connectivity */}
                <div className="lg:col-span-8 space-y-8">
                    {/* ---- RAG Knowledge Hub ---- */}
                    <section className={`rounded-2xl p-8 relative overflow-hidden group ${isModern ? 'bg-white border border-slate-200 shadow-sm' : 'bg-slate-900/60 border border-primary/10'}`}>
                        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl ${isModern ? 'bg-indigo-50/50' : 'bg-primary/5'}`}></div>
                        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10'>
                            <div className='flex items-center gap-4'>
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${isModern ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-primary text-background-dark shadow-primary/20'}`}>
                                    <span className='material-symbols-outlined text-2xl'>database</span>
                                </div>
                                <div>
                                    <h3 className={`text-xl font-black tracking-tight ${isModern ? 'text-slate-900' : 'text-slate-100'}`}>Knowledge Ingestion Pipeline</h3>
                                    <p className='text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5'>12.4M Embeddings • 3 Sources Active</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3'>
                                <button className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 ${isModern ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-primary text-background-dark hover:bg-primary/90'}`}>
                                    <span className='material-symbols-outlined text-base'>cloud_upload</span>Sync Source
                                </button>
                            </div>
                        </div>
                        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10'>
                            <div className='lg:col-span-7 space-y-3'>
                                <header className={`flex items-center justify-between border-b pb-3 ${isModern ? 'border-slate-100' : 'border-white/10'}`}>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Vault</h4>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isModern ? 'text-indigo-500' : 'text-primary'}`}>3 Active</span>
                                </header>
                                {[
                                    { title: 'PM_Kisan_Guidelines_2026.pdf', size: '2.4 MB', chunks: '1,420', status: 'Active', sc: 'text-emerald-600', sb: 'bg-emerald-50', icon: 'check_circle' },
                                    { title: 'Farmer_Assistance_Schemes.docx', size: '840 KB', chunks: '890', status: 'Indexing (12%)', sc: 'text-amber-600', sb: 'bg-amber-50', icon: 'sync' },
                                    { title: 'UP_Agricultural_Bylaws.pdf', size: '12.1 MB', chunks: '5,120', status: 'Failed', sc: 'text-red-600', sb: 'bg-red-50', icon: 'error' },
                                ].map((doc, i) => (
                                    <div key={i} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${isModern ? 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-slate-200/50' : 'bg-black/20 border-white/5 hover:bg-black/40 hover:border-primary/20'}`}>
                                        <div className='flex items-center gap-3'>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isModern ? 'bg-white border border-slate-200 text-slate-400 group-hover:text-indigo-600' : 'bg-white/5 border border-white/10 text-slate-500 group-hover:text-primary'}`}>
                                                <span className='material-symbols-outlined text-xl'>description</span>
                                            </div>
                                            <div>
                                                <p className={`text-sm font-black truncate max-w-[200px] ${isModern ? 'text-slate-900' : 'text-slate-100'}`}>{doc.title}</p>
                                                <p className='text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5'>{doc.size} • {doc.chunks} Chunks</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${doc.sb} ${doc.sc} text-[10px] font-black uppercase tracking-widest`}>
                                            <span className={`material-symbols-outlined text-[12px] ${doc.icon === 'sync' ? 'animate-spin' : ''}`}>{doc.icon}</span>
                                            {doc.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className='lg:col-span-5'>
                                <div className='bg-slate-900 rounded-xl p-5 text-white h-full relative overflow-hidden flex flex-col min-h-[280px]'>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/20 rounded-full blur-[60px]"></div>
                                    <div className='flex items-center gap-2 mb-4'>
                                        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <span className='material-symbols-outlined text-sm'>search</span>
                                        </div>
                                        <h4 className='text-xs font-black uppercase tracking-widest text-indigo-100'>Vector Retrieval Simulation</h4>
                                    </div>
                                    <div className='flex-1 space-y-3 mb-4 text-xs'>
                                        <div className='bg-white/5 p-3 rounded-xl border border-white/10 italic text-slate-300'>Testing query: "Fertilizer subsidy limits"</div>
                                        <div className='bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20'>
                                            <div className='flex items-center gap-2 mb-2'>
                                                <span className='material-symbols-outlined text-sm text-emerald-400'>verified</span>
                                                <p className='text-[10px] font-black uppercase tracking-widest text-emerald-300'>High Confidence (0.89)</p>
                                            </div>
                                            <p className='text-slate-200 font-medium text-xs leading-relaxed mb-2'>"...subsidies are capped at ₹15,000 per hectare for organic fertilizers under the new initiative..."</p>
                                            <p className='text-[9px] text-emerald-400/80 uppercase tracking-widest font-mono'>Source: PM_Kisan_Guidelines_2026.pdf (Chunk #402)</p>
                                        </div>
                                    </div>
                                    <div className='relative'>
                                        <input type='text' placeholder='Simulate semantic query...' className='w-full bg-white/10 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none pr-12 placeholder:text-slate-500' />
                                        <button className='absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center shadow-lg'>
                                            <span className='material-symbols-outlined text-sm'>arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* AI Engine Observability */}
                    <div className={`${isModern ? 'ds-card' : 'glass-panel'} rounded-2xl p-8 relative overflow-hidden`}>
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">monitoring</span>
                                <h3 className="text-xl font-bold text-skin-base">Model Observability</h3>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                2 API Failures Detected
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className={`p-4 rounded-xl border ${isModern ? 'bg-slate-50 border-slate-200' : 'bg-surface-dark border-border-dark'}`}>
                                <p className="text-[10px] uppercase font-bold text-skin-muted mb-1 tracking-widest">Token Throughput</p>
                                <p className="text-xl font-black tabular-nums">4.2k <span className="text-[10px] text-skin-muted font-medium">tokens/s</span></p>
                            </div>
                            <div className={`p-4 rounded-xl border ${isModern ? 'bg-slate-50 border-slate-200' : 'bg-surface-dark border-border-dark'}`}>
                                <p className="text-[10px] uppercase font-bold text-skin-muted mb-1 tracking-widest">Queue Depth</p>
                                <p className="text-xl font-black tabular-nums">14 <span className="text-[10px] text-skin-muted font-medium">reqs</span></p>
                            </div>
                            <div className={`p-4 rounded-xl border ${isModern ? 'bg-slate-50 border-slate-200' : 'bg-surface-dark border-border-dark'}`}>
                                <p className="text-[10px] uppercase font-bold text-skin-muted mb-1 tracking-widest">GPU Utilization</p>
                                <p className="text-xl font-black tabular-nums">82.4% <span className="text-emerald-500 text-[10px] font-medium">Optimal</span></p>
                            </div>
                            <div className={`p-4 rounded-xl border ${isModern ? 'bg-red-50 border-red-100' : 'bg-red-500/10 border-red-500/20'}`}>
                                <p className="text-[10px] uppercase font-bold text-red-500 mb-1 tracking-widest">STT Fallbacks</p>
                                <p className="text-xl font-black text-red-600 tabular-nums">2.1% <span className="text-red-400 text-[10px] font-medium">Elevated</span></p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Generation Time Chart */}
                            <div className="relative">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold text-skin-muted uppercase tracking-widest">LLM Generation Time (Rolling Window)</span>
                                </div>
                                <div className={`h-32 w-full ${isModern ? 'bg-indigo-50/50 border-indigo-100' : 'bg-surface-dark/50 border-border-dark'} rounded-lg border p-2`}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={latencyData}>
                                            <defs>
                                                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={isModern ? '#6366f1' : '#f4ab25'} stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor={isModern ? '#6366f1' : '#f4ab25'} stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorLatencySpike" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                                                </linearGradient>
                                            </defs>
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: isModern ? '#fff' : '#1e293b', 
                                                    borderColor: isModern ? '#e2e8f0' : '#334155',
                                                    fontSize: '12px',
                                                    borderRadius: '8px'
                                                }}
                                                labelStyle={{ color: isModern ? '#64748b' : '#94a3b8' }}
                                                itemStyle={{ color: isModern ? '#0f172a' : '#f8fafc', fontWeight: 'bold' }}
                                                formatter={(value: number) => [`${value}ms`, 'Latency']}
                                            />
                                            <YAxis hide domain={[0, 2000]} />
                                            <Area 
                                                type="monotone" 
                                                dataKey="latency" 
                                                stroke={isModern ? '#6366f1' : '#f4ab25'} 
                                                fillOpacity={1} 
                                                fill="url(#colorLatency)" 
                                                strokeWidth={2}
                                                animationDuration={500}
                                                isAnimationActive={true}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="absolute top-8 left-4 px-2 py-1 bg-background-dark/80 backdrop-blur-md rounded border border-border-dark text-[9px] font-mono text-skin-base">Live TTM: ~850ms</div>
                            </div>
                        </div>
                    </div>

                </div>
                {/* Right Column: Clusters & Allocation */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Demo Call Tracker */}
                    <DemoCallTracker scenario={isDemoMode ? activeScenario : undefined} />
                </div>
            </div>
        </div>
    );
}
