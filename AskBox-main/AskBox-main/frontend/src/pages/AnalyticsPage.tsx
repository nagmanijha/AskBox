import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { LanguageDistribution } from '../types';

export default function AnalyticsPage() {
    const { designSystem } = useTheme();
    const { isDemoMode } = useAuth();
    const isModern = designSystem === 'modern';
    const [languages, setLanguages] = useState<LanguageDistribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            let lang;
            if (isDemoMode) {
                // Return high-quality mock language distribution for demo/mock-auth mode
                lang = [
                    { language: 'Hindi', count: 4500, percentage: 42, growth: 12 },
                    { language: 'Tamil', count: 2100, percentage: 18, growth: 22 },
                    { language: 'Bengali', count: 1800, percentage: 15, growth: 8 },
                    { language: 'Telugu', count: 1200, percentage: 10, growth: 15 },
                    { language: 'Marathi', count: 900, percentage: 8, growth: 10 },
                    { language: 'Others', count: 500, percentage: 7, growth: 5 }
                ];
            } else {
                lang = await api.getLanguageDistribution();
            }
            setLanguages(lang);
        } catch (err: any) {
            const errorMsg = err?.response?.data?.error || 'Failed to load analytics';
            setError(errorMsg);
            console.error('Failed to load analytics', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        try {
            window.location.href = api.getExportUrl('analytics');
        } catch (err) {
            console.error('Export failed', err);
            setError('Failed to export dataset');
        }
    };

    const handleUpdateModels = () => {
        alert('Model update feature is coming soon. Please check back later.');
    };

    if (loading && languages.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
            </div>
        );
    }

    return (
        <div className={`p-6 lg:p-10 mx-auto w-full min-h-[calc(100vh-80px)] transition-colors ${
            isModern ? 'bg-slate-50 text-slate-800' : 'bg-background-dark text-slate-100 audio-wave-bg'
        }`}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-2">
                    <div className={`flex items-center gap-2 text-sm font-bold tracking-widest uppercase ${
                        isModern ? 'text-indigo-600' : 'text-primary'
                    }`}>
                        <span className={`size-1.5 rounded-full animate-pulse ${
                            isModern ? 'bg-indigo-600' : 'bg-primary'
                        }`}></span>
                        Cluster Analytics Engine
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
                        Platform <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                            isModern ? 'from-indigo-600 to-teal-500' : 'from-primary to-accent-teal'
                        }`}>Observability</span>
                    </h1>
                    <p className={`max-w-2xl font-medium ${isModern ? 'text-slate-500' : 'text-slate-400'}`}>
                        Deep-dive into dialect diversity, spatial density, and intent categorization across the subcontinent.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className={`px-6 py-3 rounded-xl border font-bold text-sm transition-all flex items-center gap-2 ${
                        isModern 
                        ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm' 
                        : 'bg-surface-dark border-border-dark hover:bg-border-dark'
                    }`} onClick={handleExport}>
                        <span className="material-symbols-outlined text-lg">download</span> Export Dataset
                    </button>
                    <button className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                        isModern 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' 
                        : 'bg-primary text-background-dark hover:shadow-[0_0_20px_rgba(244,171,37,0.4)]'
                    }`} onClick={handleUpdateModels}>
                        <span className="material-symbols-outlined text-lg">refresh</span> Update Models
                    </button>
                </div>
            </div>

            {/* Layered Grid Layout */}
            <div className="grid grid-cols-12 gap-6">

                {/* 1. Dialect Diversity Map (Large) */}
                <div className={`col-span-12 lg:col-span-8 ds-card relative overflow-hidden group border-none !p-0`}>
                    <div className="absolute top-0 right-0 p-6 flex gap-4 z-20">
                        <div className="flex flex-col items-end">
                            <span className={`text-2xl font-black ${isModern ? 'text-teal-600' : 'text-accent-teal'}`}>84.2%</span>
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Coverage Intensity</span>
                        </div>
                    </div>

                    <div className="absolute top-0 left-0 p-8 z-20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`size-12 rounded-2xl flex items-center justify-center ${
                                isModern ? 'bg-indigo-600 text-white shadow-lg' : 'bg-primary text-background-dark'
                            }`}>
                                <span className="material-symbols-outlined text-2xl">satellite_alt</span>
                            </div>
                            <div>
                                <h3 className={`text-xl font-black ${isModern ? 'text-slate-900' : 'text-slate-100'}`}>Spatial Telemetry</h3>
                                <p className="text-sm text-slate-500 font-bold tracking-wide">Live query distribution across nodes</p>
                            </div>
                        </div>
                    </div>

                    <div className={`relative w-full h-[500px] overflow-hidden transition-colors ${
                        isModern ? 'bg-slate-900' : 'bg-background-dark'
                    }`}>
                        {/* Grid Background */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-40"></div>

                        {/* Floating Data Points Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-full h-full">
                                {/* Regional Heat Nodes */}
                                <div className="absolute top-[40%] left-[35%] group/pin cursor-pointer z-10">
                                    <div className="relative">
                                        <div className={`absolute inset-0 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping opacity-20 ${isModern ? 'bg-indigo-400' : 'bg-primary'}`}></div>
                                        <div className={`size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${isModern ? 'bg-indigo-600 border-white shadow-lg shadow-indigo-500/50' : 'bg-primary border-background-dark shadow-[0_0_15px_#f4ab25]'}`}></div>
                                    </div>
                                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 p-3 rounded-xl opacity-0 group-hover/pin:opacity-100 transition-opacity backdrop-blur-md border ${
                                        isModern ? 'bg-white/90 border-slate-200 text-slate-800 shadow-xl' : 'bg-surface-dark/90 border-primary/30 text-slate-100'
                                    }`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isModern ? 'text-indigo-600' : 'text-primary'}`}>Node: UP-East</p>
                                            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                        </div>
                                        <p className="text-xl font-black">12.4k <span className="text-[10px] text-slate-500 uppercase">Req/hr</span></p>
                                        <p className="text-[10px] font-bold text-slate-500 mt-1">Dialect: Bhojpuri (94%)</p>
                                    </div>
                                </div>

                                <div className="absolute top-[65%] left-[55%] group/pin cursor-pointer z-10">
                                    <div className="relative">
                                        <div className={`absolute inset-0 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping opacity-20 delay-300 ${isModern ? 'bg-teal-400' : 'bg-accent-teal'}`}></div>
                                        <div className={`size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${isModern ? 'bg-teal-500 border-white shadow-lg shadow-teal-500/50' : 'bg-accent-teal border-background-dark shadow-[0_0_15px_#2dd4bf]'}`}></div>
                                    </div>
                                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 p-3 rounded-xl opacity-0 group-hover/pin:opacity-100 transition-opacity backdrop-blur-md border ${
                                        isModern ? 'bg-white/90 border-slate-200 text-slate-800 shadow-xl' : 'bg-surface-dark/90 border-accent-teal/30 text-slate-100'
                                    }`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isModern ? 'text-teal-600' : 'text-accent-teal'}`}>Node: TN-Central</p>
                                            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                        </div>
                                        <p className="text-xl font-black">8.2k <span className="text-[10px] text-slate-500 uppercase">Req/hr</span></p>
                                        <p className="text-[10px] font-bold text-slate-500 mt-1">Dialect: Tamil (91%)</p>
                                    </div>
                                </div>

                                <div className="absolute top-[35%] left-[70%] group/pin cursor-pointer z-10">
                                    <div className="relative">
                                        <div className={`absolute inset-0 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping opacity-20 delay-700 ${isModern ? 'bg-rose-400' : 'bg-red-500'}`}></div>
                                        <div className={`size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${isModern ? 'bg-rose-500 border-white shadow-lg shadow-rose-500/50' : 'bg-red-500 border-background-dark shadow-[0_0_15px_#ef4444]'}`}></div>
                                    </div>
                                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 p-3 rounded-xl opacity-0 group-hover/pin:opacity-100 transition-opacity backdrop-blur-md border ${
                                        isModern ? 'bg-white/90 border-slate-200 text-slate-800 shadow-xl' : 'bg-surface-dark/90 border-red-500/30 text-slate-100'
                                    }`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isModern ? 'text-rose-600' : 'text-red-500'}`}>Node: AS-West</p>
                                            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                                        </div>
                                        <p className="text-xl font-black">1.1k <span className="text-[10px] text-slate-500 uppercase">Req/hr</span></p>
                                        <p className="text-[10px] font-bold text-slate-500 mt-1 text-amber-500">High Latency Detected</p>
                                    </div>
                                </div>

                                {/* Abstract Network Lines connecting nodes */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 1000 500">
                                    <path d="M350,200 L550,325 L700,175" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5,5"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Top Intents (Replacing Accuracy vs Latency) */}
                <div className={`col-span-12 lg:col-span-4 ds-card !border-l-4 flex flex-col ${
                    isModern ? '!border-l-indigo-500' : '!border-l-primary/40'
                }`}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${
                             isModern ? 'bg-teal-50 text-teal-600' : 'bg-accent-teal/10 text-accent-teal'
                        }`}>
                            <span className="material-symbols-outlined text-3xl">pie_chart</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black">Intent Classification</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Topic Density (24H)</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        {[
                            { label: 'Agricultural Schemes', value: '42.8%', count: '24.1k', bg: isModern ? 'bg-indigo-600' : 'bg-primary' },
                            { label: 'Weather & Climate', value: '28.4%', count: '16.0k', bg: isModern ? 'bg-teal-500' : 'bg-accent-teal' },
                            { label: 'Pest Control / Disease', value: '15.2%', count: '8.5k', bg: isModern ? 'bg-blue-500' : 'bg-blue-400' },
                            { label: 'Market Prices (Mandi)', value: '8.6%', count: '4.8k', bg: isModern ? 'bg-rose-500' : 'bg-red-400' },
                            { label: 'Other Inquiries', value: '5.0%', count: '2.8k', bg: isModern ? 'bg-slate-400' : 'bg-slate-600' },
                        ].map((intent, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-bold">{intent.label}</span>
                                    <div className="text-right">
                                        <span className={`text-xs font-black mr-2 ${isModern ? 'text-slate-800' : 'text-slate-200'}`}>{intent.value}</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{intent.count} calls</span>
                                    </div>
                                </div>
                                <div className={`h-2 w-full rounded-full overflow-hidden ${isModern ? 'bg-slate-100' : 'bg-surface-dark'}`}>
                                    <div className={`h-full rounded-full ${intent.bg} transition-all duration-1000`} style={{ width: intent.value }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={`mt-8 p-4 rounded-xl border flex items-center justify-between ${isModern ? 'bg-slate-50 border-slate-200' : 'bg-surface-dark border-border-dark'}`}>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">trending_up</span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trending</span>
                        </div>
                        <span className="font-black text-sm">Pest Control (+4.2%)</span>
                    </div>
                </div>


                {/* 3. Performance Metrics (Replacing Knowledge Nodes) */}
                <div className={`col-span-12 lg:col-span-7 rounded-3xl p-8 ${
                    isModern ? 'bg-white border border-slate-200 shadow-sm' : 'glass-panel'
                }`}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`size-12 rounded-2xl flex items-center justify-center ${
                                isModern ? 'bg-indigo-50 text-indigo-600' : 'bg-primary/10 text-primary'
                            }`}>
                                <span className="material-symbols-outlined text-3xl">speed</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black">System Performance</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Latency & Accuracy by Dialect</p>
                            </div>
                        </div>
                        <select className={`rounded-lg text-xs font-bold focus:ring-1 outline-none p-2 ${
                            isModern ? 'bg-white border text-slate-600 border-slate-200 focus:ring-indigo-500' : 'bg-surface-dark border-border-dark text-slate-400 focus:ring-primary'
                        }`}>
                            <option>Last 24 Hours</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Fake Scatter Plot / Chart replacement */}
                        <div className={`relative h-[240px] rounded-2xl border p-4 flex flex-col justify-end ${isModern ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'}`}>
                             <div className="absolute top-4 left-4">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">End-to-End Latency</p>
                                <p className="text-2xl font-black mt-1">1.12s <span className="text-[10px] text-emerald-500 font-bold">AVG</span></p>
                             </div>
                             <div className="flex items-end h-32 gap-1 w-full mt-10">
                                {[...Array(30)].map((_, i) => (
                                    <div key={i} className={`flex-1 rounded-t-sm ${isModern ? 'bg-indigo-300' : 'bg-primary/40'} hover:bg-indigo-600 transition-colors`} style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
                                ))}
                             </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dialect Accuracy Breakdown</h4>
                            {[
                                { lang: 'Hindi (Standard)', acc: '98.4%', lat: '0.8s' },
                                { lang: 'Bhojpuri', acc: '92.1%', lat: '1.2s' },
                                { lang: 'Tamil', acc: '95.6%', lat: '1.0s' },
                                { lang: 'Maithili', acc: '88.2%', lat: '1.5s' },
                            ].map((d, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${isModern ? 'bg-white border-slate-100' : 'bg-surface-dark border-border-dark'}`}>
                                    <span className="text-sm font-bold">{d.lang}</span>
                                    <div className="flex gap-4">
                                        <div className="text-right">
                                            <p className={`text-xs font-black ${isModern ? 'text-emerald-600' : 'text-emerald-400'}`}>{d.acc}</p>
                                            <p className="text-[10px] font-bold text-slate-500">ACC</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs font-black ${isModern ? 'text-slate-700' : 'text-slate-300'}`}>{d.lat}</p>
                                            <p className="text-[10px] font-bold text-slate-500">LAT</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Language Growth: Area Charts (Horizontal) */}
                <div className={`col-span-12 lg:col-span-5 rounded-3xl p-8 ${
                    isModern ? 'bg-white border border-slate-200 shadow-sm' : 'glass-panel'
                }`}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`size-12 rounded-2xl flex items-center justify-center ${
                            isModern ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-slate-400'
                        }`}>
                            <span className="material-symbols-outlined text-3xl">trending_up</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black">Adoption Velocity</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Growth by language family</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2 group/chart">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold">Indo-Aryan Languages</span>
                                <span className={`font-black ${isModern ? 'text-indigo-600' : 'text-primary'}`}>+14.2%</span>
                            </div>
                            <div className={`h-12 w-full rounded-xl relative overflow-hidden ${
                                isModern ? 'bg-slate-100' : 'bg-surface-dark'
                            }`}>
                                <div className={`absolute inset-0 bg-gradient-to-r rounded-xl ${
                                    isModern ? 'from-indigo-50 via-indigo-200 to-indigo-400' : 'from-primary/5 via-primary/20 to-primary/40'
                                }`} style={{ width: '82%' }}></div>
                                <svg className="absolute bottom-0 w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 20">
                                    <path d="M0,20 Q10,15 20,18 T40,10 T60,15 T80,5 T100,10 L100,20 L0,20 Z" fill={isModern ? 'rgba(79, 70, 229, 0.3)' : 'rgba(var(--color-primary)/0.3)'}></path>
                                </svg>
                            </div>
                        </div>
                        <div className="space-y-2 group/chart">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold">Dravidian Languages</span>
                                <span className={`font-black ${isModern ? 'text-teal-600' : 'text-accent-teal'}`}>+22.8%</span>
                            </div>
                            <div className={`h-12 w-full rounded-xl relative overflow-hidden ${
                                isModern ? 'bg-slate-100' : 'bg-surface-dark'
                            }`}>
                                <div className={`absolute inset-0 bg-gradient-to-r rounded-xl ${
                                    isModern ? 'from-teal-50 via-teal-200 to-teal-400' : 'from-accent-teal/5 via-accent-teal/20 to-accent-teal/40'
                                }`} style={{ width: '91%' }}></div>
                                <svg className="absolute bottom-0 w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 20">
                                    <path d="M0,20 Q15,10 30,15 T50,5 T70,12 T90,2 T100,8 L100,20 L0,20 Z" fill={isModern ? 'rgba(20, 184, 166, 0.3)' : 'rgba(var(--color-accent-teal)/0.3)'}></path>
                                </svg>
                            </div>
                        </div>
                        <div className="space-y-2 group/chart">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold">Tibeto-Burman Dialects</span>
                                <span className={`font-black ${isModern ? 'text-slate-500' : 'text-slate-400'}`}>+8.4%</span>
                            </div>
                            <div className={`h-12 w-full rounded-xl relative overflow-hidden ${
                                isModern ? 'bg-slate-100' : 'bg-surface-dark'
                            }`}>
                                <div className={`absolute inset-0 bg-gradient-to-r rounded-xl ${
                                    isModern ? 'from-slate-200 via-slate-300 to-slate-400' : 'from-slate-400/5 via-slate-400/20 to-slate-400/40'
                                }`} style={{ width: '45%' }}></div>
                                <svg className="absolute bottom-0 w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 20">
                                    <path d="M0,20 Q20,18 40,15 T60,18 T80,14 T100,16 L100,20 L0,20 Z" fill={isModern ? 'rgba(148,163,184,0.3)' : 'rgba(148,163,184,0.3)'}></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
