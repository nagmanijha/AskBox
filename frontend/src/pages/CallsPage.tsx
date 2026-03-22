<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CallMetrics } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function CallsPage() {
    const { user, isDemoMode } = useAuth();
    const { designSystem } = useTheme();
    const isModern = designSystem === 'modern';
    const isAdmin = user?.role === 'admin';
    const [calls, setCalls] = useState<CallMetrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCalls();
    }, []);

    const loadCalls = async () => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (isDemoMode) {
                // Return high-quality mock transcripts for demo/mock-auth mode
                const mockCalls = [
                    {
                        id: 'c1',
                        language: 'Hindi',
                        timestamp: new Date().toISOString(),
                        duration: 45,
                        transcript: 'Khet mein keede lag gaye hain, kaunsi dawa daalein?',
                        aiResponse: 'Based on your description, it looks like a pest infestation. I recommend using organic neem oil or consulting the nearest Krishi Vigyan Kendra.'
                    },
                    {
                        id: 'c2',
                        language: 'Bhojpuri',
                        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                        duration: 32,
                        transcript: 'Barish kab hoyi? Dhan ke ropai kare ke ba.',
                        aiResponse: 'The regional forecast predicts moderate rainfall in the next 48 hours. You can proceed with the transplantation.'
                    },
                    {
                        id: 'c3',
                        language: 'Tamil',
                        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                        duration: 112,
                        transcript: 'PM-Kisan scheme status eppadi check pannuvathu?',
                        aiResponse: 'You can check your status on the PM-Kisan portal using your Aadhaar number or mobile number. Would you like me to guide you through the steps?'
                    },
                    {
                        id: 'c4',
                        language: 'Kannada',
                        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
                        duration: 88,
                        transcript: 'Ragi MSP rate enthu?',
                        aiResponse: 'Namaste! The Minimum Support Price (MSP) for Ragi for the 2024-25 season is ₹4,290 per quintal.'
                    }
                ];

                // Filter for user if not admin
                data = isAdmin ? mockCalls : mockCalls.filter(c => ['Hindi', 'Kannada'].includes(c.language));
            } else {
                data = await api.getRecentCalls();
            }
            setCalls(data);
        } catch (err: any) {
            const errorMsg = err?.response?.data?.error || 'Failed to load calls';
            setError(errorMsg);
            console.error('Failed to load calls', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        try {
            window.location.href = api.getExportUrl('calls');
        } catch (err) {
            console.error('Export failed', err);
            setError('Failed to export CSV');
        }
    };

    return (
        <div className="flex bg-background-dark min-h-[calc(100vh-80px)] text-skin-base overflow-hidden font-display audio-wave-bg transition-colors duration-300">
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">

                {/* Header Setup */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black mb-2 text-skin-base">{isAdmin ? 'Global Query Explorer' : 'My Call History'}</h1>
                        <p className="text-skin-muted text-sm">{isAdmin ? 'Analyze raw dialect interactions across the global network.' : 'Review your previous interactions and AI responses.'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`p-1 border flex rounded-xl ${isModern ? 'bg-white border-slate-200 shadow-sm' : 'bg-surface-dark border-border-dark'}`}>
                            <button className={`px-4 py-2 rounded-lg text-xs font-bold shadow-md transition-colors ${isModern ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-custom text-white'}`}>24h</button>
                            <button className="px-4 py-2 text-skin-muted rounded-lg text-xs font-bold hover:text-skin-base transition-colors">7d</button>
                            <button className="px-4 py-2 text-skin-muted rounded-lg text-xs font-bold hover:text-skin-base transition-colors">30d</button>
                        </div>
                        <button className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${isModern ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'}`} onClick={handleExportCSV}>
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Top Mini Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className={`${isModern ? 'ds-card' : 'glass-panel'} p-6 rounded-2xl flex items-center justify-between`}>
                        <div>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Total Queries (24h)</p>
                            <h3 className="text-2xl font-black text-skin-base">14,209</h3>
                        </div>
                        <div className={`size-10 rounded-xl flex items-center justify-center text-primary ${isModern ? 'bg-indigo-50 border border-indigo-100' : 'bg-primary/10'}`}>
                            <span className="material-symbols-outlined">forum</span>
                        </div>
                    </div>
                    <div className={`${isModern ? 'ds-card' : 'glass-panel'} p-6 rounded-2xl flex items-center justify-between`}>
                        <div>
                            <p className="text-[10px] text-accent-teal font-bold uppercase tracking-widest mb-1">Avg. Latency</p>
                            <h3 className="text-2xl font-black text-skin-base">112ms</h3>
                        </div>
                        <div className={`size-10 rounded-xl flex items-center justify-center text-accent-teal ${isModern ? 'bg-emerald-50 border border-emerald-100' : 'bg-accent-teal/10'}`}>
                            <span className="material-symbols-outlined">speed</span>
                        </div>
                    </div>
                    <div className={`${isModern ? 'ds-card' : 'glass-panel'} p-6 rounded-2xl flex items-center justify-between`}>
                        <div>
                            <p className="text-[10px] text-skin-muted font-bold uppercase tracking-widest mb-1">Dialect Spread</p>
                            <h3 className="text-2xl font-black text-skin-base">16</h3>
                        </div>
                        <div className={`size-10 rounded-xl flex items-center justify-center text-skin-muted ${isModern ? 'bg-slate-100 border border-slate-200' : 'bg-slate-800'}`}>
                            <span className="material-symbols-outlined">language</span>
                        </div>
                    </div>
                </div>

                {/* Explorer List */}
                <div className={`${isModern ? 'ds-card indent-0 p-0 overflow-hidden' : 'glass-panel rounded-3xl overflow-hidden border border-border-dark flex flex-col'}`}>
                    {error && (
                        <div className="p-4 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                    <div className={`p-4 border-b flex items-center justify-between ${isModern ? 'bg-slate-50/50 border-slate-200' : 'bg-surface-dark/50 border-border-dark'}`}>
                        <h3 className="font-bold text-sm text-skin-base">Recent Transcripts</h3>
                        <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded text-[10px] border font-mono ${isModern ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>1-50 of 14,209</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                            </div>
                        ) : calls.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                                <div className={`size-16 rounded-full flex items-center justify-center ${isModern ? 'bg-gray-100 text-gray-400' : 'bg-slate-800 text-slate-500'}`}>
                                    <span className="material-symbols-outlined text-4xl">search_off</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">No calls found</h4>
                                    <p className="text-skin-muted text-sm max-w-xs mx-auto mt-1">Try adjusting your filters or time range to see more results.</p>
                                </div>
                            </div>
                        ) : (
                            <div className={`divide-y ${isModern ? 'divide-slate-100' : 'divide-border-dark'}`}>
                                {calls.map((call) => (
                                    <div key={call.id} className={`p-6 transition-all group cursor-pointer border-l-4 border-transparent hover:border-indigo-600 flex flex-col md:flex-row gap-6 ${isModern ? 'hover:bg-slate-50/80' : 'hover:bg-slate-custom/20'}`}>
                                        {/* Meta */}
                                        <div className="w-full md:w-56 shrink-0 flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${isModern ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                                    {call.language}
                                                </span>
                                                <span className="text-xs text-skin-muted font-mono font-medium">
                                                    {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-skin-muted font-medium">
                                                <span className="material-symbols-outlined text-[16px]">schedule</span>
                                                {call.duration}s call duration
                                            </div>
                                        </div>

                                        {/* Transcript Thread */}
                                        <div className="flex-1 space-y-4">
                                            {/* User Bubble */}
                                            <div className="flex gap-4">
                                                <div className={`size-9 rounded-full flex items-center justify-center shrink-0 border ${isModern ? 'bg-white text-gray-400 border-gray-200' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                                    <span className="material-symbols-outlined text-xl">person</span>
                                                </div>
                                                <div className={`border p-4 rounded-2xl rounded-tl-none text-sm transition-all ${isModern ? 'bg-white border-gray-200 text-gray-700 shadow-sm group-hover:shadow-md' : 'bg-surface-dark border-border-dark text-slate-300'}`}>
                                                    <span className="block mb-1 text-[10px] font-bold uppercase tracking-wider opacity-50">Caller Query</span>
                                                    "{call.transcript || 'Audio snippet being processed...'}"
                                                </div>
                                            </div>

                                            {/* AI Bubble */}
                                            <div className="flex gap-4">
                                                <div className={`size-9 rounded-full flex items-center justify-center shrink-0 border transition-all ${isModern ? 'bg-indigo-600 text-white border-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.2)]' : 'bg-primary/20 border-primary/30 glow-saffron text-primary'}`}>
                                                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                                                </div>
                                                <div className={`p-4 rounded-2xl rounded-tl-none border text-sm transition-all ${isModern ? 'bg-indigo-50/50 border-indigo-100 text-indigo-950' : 'bg-slate-custom border-slate-700 text-slate-200'}`}>
                                                    <span className="block mb-1 text-[10px] font-bold uppercase tracking-wider opacity-50">AI Response</span>
                                                    <p>
                                                        {call.aiResponse || 'Processing response formulation and knowledge retrieval...'}
                                                    </p>
                                                    <div className="mt-3 pt-3 border-t border-indigo-200/30 text-[10px] text-emerald-600 font-mono flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <span className="material-symbols-outlined text-[14px]">bolt</span> Latency: 104ms • Accuracy: 99.1%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
=======
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CallMetrics } from '../types';

export default function CallsPage() {
    const [calls, setCalls] = useState<CallMetrics[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCalls();
    }, []);

    const loadCalls = async () => {
        try {
            const data = await api.getRecentCalls();
            setCalls(data);
        } catch (err) {
            console.error('Failed to load calls', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-background-dark min-h-[calc(100vh-80px)] text-slate-100 overflow-hidden font-display audio-wave-bg">
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">

                {/* Header Setup */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black mb-2">Query Explorer</h1>
                        <p className="text-slate-400 text-sm">Analyze raw dialect interactions across the network.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-1 bg-surface-dark border flex border-border-dark rounded-xl">
                            <button className="px-4 py-2 bg-slate-custom rounded-lg text-xs font-bold shadow-md text-white">24h</button>
                            <button className="px-4 py-2 text-slate-400 rounded-lg text-xs font-bold hover:text-white transition-colors">7d</button>
                            <button className="px-4 py-2 text-slate-400 rounded-lg text-xs font-bold hover:text-white transition-colors">30d</button>
                        </div>
                        <button className="px-4 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/20 transition-all">
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Top Mini Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Total Queries (24h)</p>
                            <h3 className="text-2xl font-black">14,209</h3>
                        </div>
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">forum</span>
                        </div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-accent-teal font-bold uppercase tracking-widest mb-1">Avg. Latency</p>
                            <h3 className="text-2xl font-black">112ms</h3>
                        </div>
                        <div className="size-10 rounded-xl bg-accent-teal/10 flex items-center justify-center text-accent-teal">
                            <span className="material-symbols-outlined">speed</span>
                        </div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Dialect Spread</p>
                            <h3 className="text-2xl font-black">16</h3>
                        </div>
                        <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined">language</span>
                        </div>
                    </div>
                </div>

                {/* Explorer List */}
                <div className="glass-panel rounded-3xl overflow-hidden border border-border-dark flex flex-col">
                    <div className="p-4 border-b border-border-dark flex items-center justify-between bg-surface-dark/50">
                        <h3 className="font-bold text-sm">Recent Transcripts</h3>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700 font-mono">1-50 of 14,209</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                            </div>
                        ) : calls.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">No calls found in this timeframe.</div>
                        ) : (
                            <div className="divide-y divide-border-dark">
                                {calls.map((call) => (
                                    <div key={call.id} className="p-6 hover:bg-slate-custom/20 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-primary flex flex-col md:flex-row gap-6">
                                        {/* Meta */}
                                        <div className="w-full md:w-1/4 shrink-0 flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                                                    {call.language}
                                                </span>
                                                <span className="text-xs text-slate-500 font-mono">
                                                    {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                <span className="material-symbols-outlined text-[14px]">timer</span>
                                                {call.duration}s
                                            </div>
                                        </div>

                                        {/* Transcript Thread */}
                                        <div className="flex-1 space-y-4">
                                            {/* User Bubble */}
                                            <div className="flex gap-3">
                                                <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                                    <span className="material-symbols-outlined text-sm text-slate-400">person</span>
                                                </div>
                                                <div className="bg-surface-dark border border-border-dark p-3 rounded-2xl rounded-tl-none text-sm text-slate-300">
                                                    "{call.transcript || 'Audio snippet being processed...'}"
                                                </div>
                                            </div>

                                            {/* AI Bubble */}
                                            <div className="flex gap-3">
                                                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 glow-saffron">
                                                    <span className="material-symbols-outlined text-sm text-primary">graphic_eq</span>
                                                </div>
                                                <div className="bg-slate-custom p-3 rounded-2xl rounded-tl-none border border-slate-700 text-sm">
                                                    <p className="text-slate-200">
                                                        {call.aiResponse || 'Processing response formulation and knowledge retrieval...'}
                                                    </p>
                                                    <div className="mt-2 text-[10px] text-accent-teal font-mono flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="material-symbols-outlined text-[12px]">done_all</span> Latency: 104ms
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Fallback mock data if API is empty for demonstration */}
                        {calls.length === 0 && !loading && (
                            <div className="divide-y divide-border-dark">
                                <div className="p-6 hover:bg-slate-custom/20 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-primary flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-1/4 shrink-0 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                                                HINDI
                                            </span>
                                            <span className="text-xs text-slate-500 font-mono">14:12</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <span className="material-symbols-outlined text-[14px]">timer</span>45s
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex gap-3">
                                            <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                                <span className="material-symbols-outlined text-sm text-slate-400">person</span>
                                            </div>
                                            <div className="bg-surface-dark border border-border-dark p-3 rounded-2xl rounded-tl-none text-sm text-slate-300">
                                                "Mausam kaisa rahega agle do din?"
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 glow-saffron">
                                                <span className="material-symbols-outlined text-sm text-primary">graphic_eq</span>
                                            </div>
                                            <div className="bg-slate-custom p-3 rounded-2xl rounded-tl-none border border-slate-700 text-sm">
                                                <p className="text-slate-200">
                                                    "Agle do din mausam saaf rahega, baarish ki koi sambhavna nahi hai."
                                                </p>
                                                <div className="mt-2 text-[10px] text-accent-teal font-mono flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="material-symbols-outlined text-[12px]">done_all</span> Latency: 84ms
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
>>>>>>> pr-3
