import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { LanguageDistribution } from '../types';

export default function AnalyticsPage() {
    const { designSystem } = useTheme();
    const { user, isDemoMode } = useAuth();
    const isModern = designSystem === 'modern';
    const isAdmin = user?.role === 'admin';
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

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-6 animate-in fade-in zoom-in-95">
                <div className={`size-24 rounded-full flex items-center justify-center ${isModern ? 'bg-red-50 text-red-500' : 'bg-red-500/10 text-red-400'}`}>
                    <span className="material-symbols-outlined text-5xl">monitoring</span>
                </div>
                <div>
                    <h2 className="text-2xl font-black mb-2">Access Restricted</h2>
                    <p className="text-skin-muted max-w-xs mx-auto">Detailed network telemetry is reserved for administrative roles only.</p>
                </div>
                <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${isModern ? 'bg-indigo-600 text-white' : 'bg-primary text-background-dark'}`}
                >
                    Return to Dashboard
                </button>
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
                        Live Regional Engine v4.0
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
                        Regional Language <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                            isModern ? 'from-indigo-600 to-teal-500' : 'from-primary to-accent-teal'
                        }`}>Analytics</span>
                    </h1>
                    <p className={`max-w-2xl font-medium ${isModern ? 'text-slate-500' : 'text-slate-400'}`}>
                        Deep-dive into dialect diversity and performance metrics across the Indian subcontinent. Real-time processing of 22+ official languages and 1,600+ dialects.
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
                <div className={`col-span-12 lg:col-span-8 ds-card relative overflow-hidden group border-none`}>
                    <div className="absolute top-0 right-0 p-6 flex gap-4">
                        <div className="flex flex-col items-end">
                            <span className={`text-2xl font-black ${isModern ? 'text-teal-600' : 'text-accent-teal'}`}>84.2%</span>
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Coverage Intensity</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className={`size-12 rounded-2xl flex items-center justify-center ${
                            isModern ? 'bg-indigo-50 text-indigo-600' : 'bg-primary/10 text-primary'
                        }`}>
                            <span className="material-symbols-outlined text-3xl">map</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Dialect Density Grid</h3>
                            <p className="text-sm text-slate-500 font-medium">Heatmap of conversational threads by region</p>
                        </div>
                    </div>

                    <div className={`relative w-full aspect-[16/9] rounded-2xl overflow-hidden transition-colors ${
                        isModern ? 'bg-slate-100 border border-slate-200 group-hover:border-indigo-300' : 'bg-background-dark/50 border border-border-dark group-hover:border-primary/30'
                    }`}>
                        {/* Map Placeholder Image */}
                        <div className={`w-full h-full opacity-40 mix-blend-luminosity flex items-center justify-center ${
                            isModern ? 'bg-white' : 'bg-surface-dark'
                        }`}>
                            <span className={`material-symbols-outlined text-8xl ${
                                isModern ? 'text-slate-300' : 'text-slate-600'
                            }`}>map</span>
                        </div>

                        {/* Floating Data Points Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-full h-full">
                                {/* Heat Markers */}
                                <div className={`absolute top-1/4 left-1/3 size-24 rounded-full blur-2xl animate-pulse ${
                                    isModern ? 'bg-indigo-200/50' : 'bg-primary/20'
                                }`}></div>
                                <div className={`absolute top-1/2 left-1/4 size-32 rounded-full blur-3xl animate-pulse delay-700 ${
                                    isModern ? 'bg-teal-200/50' : 'bg-accent-teal/10'
                                }`}></div>
                                <div className={`absolute bottom-1/3 right-1/4 size-40 rounded-full blur-3xl ${
                                    isModern ? 'bg-indigo-100/30' : 'bg-primary/15'
                                }`}></div>

                                {/* Stitched lines metaphor */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 800 500">
                                    <path d="M100,100 Q400,50 700,400" fill="none" stroke={isModern ? '#4f46e5' : '#f4ab25'} strokeDasharray="4,4" strokeWidth="1"></path>
                                    <path d="M150,400 Q300,200 650,150" fill="none" stroke={isModern ? '#0d9488' : '#2dd4bf'} strokeDasharray="4,4" strokeWidth="1"></path>
                                </svg>

                                {/* Interactive Pins */}
                                <div className="absolute top-[35%] left-[45%] group/pin cursor-pointer z-10">
                                    <div className={`size-3 rounded-full ${
                                        isModern ? 'bg-indigo-600 shadow-md' : 'bg-primary shadow-[0_0_10px_#f4ab25]'
                                    }`}></div>
                                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 rounded-lg opacity-0 group-hover/pin:opacity-100 transition-opacity ${
                                        isModern ? 'bg-white border border-indigo-200 text-slate-700 shadow-lg' : 'bg-surface-dark border border-primary/50 text-slate-100'
                                    }`}>
                                        <p className={`text-[10px] font-bold uppercase ${
                                            isModern ? 'text-indigo-600' : 'text-primary'
                                        }`}>Hindi (Standard)</p>
                                        <p className="text-xs font-medium">98.2% Accuracy</p>
                                    </div>
                                </div>

                                <div className="absolute top-[65%] left-[55%] group/pin cursor-pointer z-10">
                                    <div className={`size-3 rounded-full ${
                                        isModern ? 'bg-teal-500 shadow-md' : 'bg-accent-teal shadow-[0_0_10px_#2dd4bf]'
                                    }`}></div>
                                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 rounded-lg opacity-0 group-hover/pin:opacity-100 transition-opacity ${
                                        isModern ? 'bg-white border border-teal-200 text-slate-700 shadow-lg' : 'bg-surface-dark border border-accent-teal/50 text-slate-100'
                                    }`}>
                                        <p className={`text-[10px] font-bold uppercase ${
                                            isModern ? 'text-teal-600' : 'text-accent-teal'
                                        }`}>Tamil (Central)</p>
                                        <p className="text-xs font-medium">94.5% Accuracy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Scatter Plot: Accuracy vs Latency (Tall) */}
                <div className={`col-span-12 lg:col-span-4 ds-card !border-l-4 ${
                    isModern ? '!border-l-indigo-500' : '!border-l-primary/40'
                }`}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`size-12 rounded-2xl flex items-center justify-center ${
                             isModern ? 'bg-teal-50 text-teal-600' : 'bg-accent-teal/10 text-accent-teal'
                        }`}>
                            <span className="material-symbols-outlined text-3xl">bubble_chart</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Accuracy Index</h3>
                            <p className="text-sm text-slate-500 font-medium">Precision vs Response Time</p>
                        </div>
                    </div>

                    <div className={`h-[400px] w-full relative border-l border-b mt-10 ${
                        isModern ? 'border-slate-200' : 'border-border-dark'
                    }`}>
                        <span className="absolute -left-8 top-0 -rotate-90 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Accuracy (%)</span>
                        <span className="absolute -bottom-8 right-0 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Latency (ms)</span>

                        <div className="absolute inset-4">
                            <div className="absolute bottom-[92%] left-[15%] group/point">
                                <div className={`size-6 rounded-full flex items-center justify-center hover:scale-125 transition-transform cursor-pointer border-2 ${
                                    isModern ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-primary/20 border-primary text-slate-100'
                                }`}>
                                    <span className="text-[8px] font-bold">HI</span>
                                </div>
                            </div>
                            <div className="absolute bottom-[85%] left-[30%] group/point">
                                <div className={`size-8 rounded-full flex items-center justify-center hover:scale-125 transition-transform cursor-pointer border-2 ${
                                    isModern ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-accent-teal/20 border-accent-teal text-accent-teal'
                                }`}>
                                    <span className="text-[8px] font-bold">MA</span>
                                </div>
                            </div>
                            <div className="absolute bottom-[78%] left-[45%] group/point">
                                <div className={`size-10 rounded-full flex items-center justify-center hover:scale-125 transition-transform cursor-pointer border-2 ${
                                    isModern ? 'bg-slate-100 border-slate-400 text-slate-600' : 'bg-white/10 border-slate-400 text-slate-100'
                                }`}>
                                    <span className="text-[8px] font-bold">TA</span>
                                </div>
                            </div>
                            <div className="absolute bottom-[60%] left-[70%] group/point">
                                <div className={`size-5 rounded-full flex items-center justify-center hover:scale-125 transition-transform cursor-pointer border-2 ${
                                    isModern ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-primary/20 border-primary text-slate-100'
                                }`}>
                                    <span className="text-[8px] font-bold">BE</span>
                                </div>
                            </div>
                        </div>

                        <div className={`absolute bottom-[75%] inset-x-0 border-t border-dashed ${
                            isModern ? 'border-slate-300' : 'border-primary/20'
                        }`} style={{ bottom: '75%', position: 'absolute', width: '100%', borderTop: `1px dashed ${isModern ? '#cbd5e1' : 'rgba(var(--color-primary)/0.2)'}` }}>
                            <span className={`text-[8px] px-1 font-bold ml-4 relative -top-2 ${
                                isModern ? 'bg-slate-50 text-indigo-600' : 'bg-background-dark text-primary/60'
                            }`}>Target Accuracy (75%)</span>
                        </div>
                    </div>

                    <div className="mt-12 space-y-4">
                        <div className={`flex items-center justify-between p-3 rounded-xl ${
                            isModern ? 'bg-slate-50 border border-slate-100' : 'bg-surface-dark/50'
                        }`}>
                            <span className="text-sm font-semibold">Top Performer</span>
                            <span className={`font-bold ${isModern ? 'text-indigo-600' : 'text-primary'}`}>Hindi Standard</span>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-xl border ${
                            isModern ? 'bg-slate-50 border-teal-100' : 'bg-surface-dark/50 border-accent-teal/20'
                        }`}>
                            <span className="text-sm font-semibold">Fastest Growth</span>
                            <span className={`font-bold ${isModern ? 'text-teal-600' : 'text-accent-teal'}`}>Kannada (Dialect A)</span>
                        </div>
                    </div>
                </div>


                {/* 3. Top Recurring Topics: Staggered Knowledge Nodes */}
                <div className={`col-span-12 lg:col-span-7 rounded-3xl p-8 ${
                    isModern ? 'bg-white border border-slate-200 shadow-sm' : 'glass-panel'
                }`}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`size-12 rounded-2xl flex items-center justify-center ${
                                isModern ? 'bg-indigo-50 text-indigo-600' : 'bg-primary/10 text-primary'
                            }`}>
                                <span className="material-symbols-outlined text-3xl">psychology</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Recurring Knowledge Nodes</h3>
                                <p className="text-sm text-slate-500 font-medium">Contextual topics identified across languages</p>
                            </div>
                        </div>
                        <select className={`rounded-lg text-xs font-bold focus:ring-1 outline-none p-2 ${
                            isModern ? 'bg-white border text-slate-600 border-slate-200 focus:ring-indigo-500' : 'bg-surface-dark border-border-dark text-slate-400 focus:ring-primary'
                        }`}>
                            <option>Last 24 Hours</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>

                    <div className="relative h-[280px] w-full flex flex-wrap gap-4 items-center justify-center">
                        <div className={`p-4 border rounded-2xl flex flex-col items-center gap-1 hover:-translate-y-2 transition-transform cursor-pointer ${
                            isModern ? 'bg-indigo-50 border-indigo-200' : 'bg-primary/10 border-primary/40'
                        }`}>
                            <span className={`text-2xl font-black ${isModern ? 'text-indigo-900' : 'text-slate-100'}`}>Weather</span>
                            <span className={`text-[10px] font-bold uppercase ${isModern ? 'text-indigo-700' : 'text-primary'}`}>12.4k Mentions</span>
                        </div>
                        <div className={`p-6 border rounded-[2rem] flex flex-col items-center gap-1 hover:-translate-y-2 transition-transform cursor-pointer mt-8 ${
                            isModern ? 'bg-teal-50 border-teal-200' : 'bg-accent-teal/10 border-accent-teal/40'
                        }`}>
                            <span className={`text-3xl font-black ${isModern ? 'text-teal-900' : 'text-slate-100'}`}>Agriculture</span>
                            <span className={`text-[10px] font-bold uppercase ${isModern ? 'text-teal-700' : 'text-accent-teal'}`}>28.9k Mentions</span>
                        </div>
                        <div className={`p-3 border rounded-xl flex flex-col items-center gap-1 hover:-translate-y-2 transition-transform cursor-pointer mb-12 ${
                            isModern ? 'bg-slate-50 border-slate-200' : 'bg-surface-dark border-border-dark'
                        }`}>
                            <span className={`text-lg font-bold ${isModern ? 'text-slate-800' : 'text-slate-100'}`}>Payments</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">8.1k Mentions</span>
                        </div>
                        <div className={`p-5 border rounded-[1.5rem] flex flex-col items-center gap-1 hover:-translate-y-2 transition-transform cursor-pointer mt-4 ${
                            isModern ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/20'
                        }`}>
                            <span className={`text-xl font-black ${isModern ? 'text-slate-800' : 'text-slate-100'}`}>Medical Help</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">15.2k Mentions</span>
                        </div>
                        <div className={`p-4 border rounded-full flex flex-col items-center gap-1 hover:-translate-y-2 transition-transform cursor-pointer ml-4 ${
                            isModern ? 'bg-indigo-50 border-indigo-200' : 'bg-primary/10 border-primary/40'
                        }`}>
                            <span className={`text-xl font-bold ${isModern ? 'text-indigo-900' : 'text-slate-100'}`}>Education</span>
                            <span className={`text-[10px] font-bold uppercase ${isModern ? 'text-indigo-700' : 'text-primary'}`}>10.4k Mentions</span>
                        </div>

                        {/* Decorative Stitch Lines */}
                        <div className="absolute inset-0 -z-10 pointer-events-none">
                            <div className={`absolute top-1/2 left-1/4 w-32 h-[1px] bg-gradient-to-r rotate-12 ${
                                isModern ? 'from-transparent via-indigo-300 to-transparent' : 'from-transparent via-primary/30 to-transparent'
                            }`}></div>
                            <div className={`absolute bottom-1/3 right-1/4 w-48 h-[1px] bg-gradient-to-r -rotate-6 ${
                                isModern ? 'from-transparent via-teal-300 to-transparent' : 'from-transparent via-accent-teal/30 to-transparent'
                            }`}></div>
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
                            <h3 className="text-xl font-bold">Global Adoption</h3>
                            <p className="text-sm text-slate-500 font-medium">Volumetric growth by language group</p>
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
