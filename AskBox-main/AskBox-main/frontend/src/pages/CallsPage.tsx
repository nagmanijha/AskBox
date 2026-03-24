import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CallMetrics } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function CallsPage() {
    const { designSystem } = useTheme();
    const { isDemoMode } = useAuth();
    const isModern = designSystem === 'modern';
    const [calls, setCalls] = useState<CallMetrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Track flagged/improved state
    const [flaggedCalls, setFlaggedCalls] = useState<Set<string>>(new Set());
    const [improvedCalls, setImprovedCalls] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadCalls();
    }, []);

    const loadCalls = async () => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (isDemoMode) {
                data = [
                    { 
                        id: 'c1', 
                        language: 'Hindi', 
                        timestamp: new Date().toISOString(), 
                        duration: 45, 
                        transcript: 'Khet mein keede lag gaye hain, kaunsi dawa daalein?', 
                        aiResponse: 'Based on your description, it looks like a pest infestation. I recommend using organic neem oil or consulting the nearest Krishi Vigyan Kendra.',
                        intent: 'Pest Control',
                        confidence: 0.94,
                        latency: 104
                    },
                    { 
                        id: 'c2', 
                        language: 'Bhojpuri', 
                        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), 
                        duration: 32, 
                        transcript: 'Barish kab hoyi? Dhan ke ropai kare ke ba.', 
                        aiResponse: 'The regional forecast predicts moderate rainfall in the next 48 hours. You can proceed with the transplantation.',
                        intent: 'Weather Forecast',
                        confidence: 0.88,
                        latency: 112
                    },
                    { 
                        id: 'c3', 
                        language: 'Tamil', 
                        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), 
                        duration: 112, 
                        transcript: 'PM-Kisan scheme status eppadi check pannuvathu?', 
                        aiResponse: 'You can check your status on the PM-Kisan portal using your Aadhaar number or mobile number. Would you like me to guide you through the steps?',
                        intent: 'Govt Schemes',
                        confidence: 0.96,
                        latency: 98
                    }
                ];
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

    const toggleFlag = (id: string) => {
        setFlaggedCalls(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
        // In real app, call API to persist: await api.flagCall(id)
    };

    const toggleImprove = (id: string) => {
        setImprovedCalls(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
        // In real app, open modal to submit improvement: await api.improveCall(id, newText)
    };

    return (
        <div className="flex bg-background-dark min-h-[calc(100vh-80px)] text-skin-base overflow-hidden font-display audio-wave-bg transition-colors duration-300">
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">

                {/* Header Setup */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black mb-2 text-skin-base">Query Explorer</h1>
                        <p className="text-skin-muted text-sm">Analyze raw dialect interactions, intent classifications, and moderation queues.</p>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
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
                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">Avg. Confidence</p>
                            <h3 className="text-2xl font-black text-skin-base">92.4%</h3>
                        </div>
                        <div className={`size-10 rounded-xl flex items-center justify-center text-emerald-500 ${isModern ? 'bg-emerald-50 border border-emerald-100' : 'bg-emerald-500/10'}`}>
                            <span className="material-symbols-outlined">verified</span>
                        </div>
                    </div>
                    <div className={`${isModern ? 'ds-card' : 'glass-panel'} p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-amber-500`}>
                        <div>
                            <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-1">Escalation Queue</p>
                            <h3 className="text-2xl font-black text-skin-base">42</h3>
                        </div>
                        <div className={`size-10 rounded-xl flex items-center justify-center text-amber-500 ${isModern ? 'bg-amber-50 border border-amber-100' : 'bg-amber-500/10'}`}>
                            <span className="material-symbols-outlined">support_agent</span>
                        </div>
                    </div>
                    <div className={`${isModern ? 'ds-card' : 'glass-panel'} p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-red-500`}>
                        <div>
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1">Hallucination Flags</p>
                            <h3 className="text-2xl font-black text-skin-base">12</h3>
                        </div>
                        <div className={`size-10 rounded-xl flex items-center justify-center text-red-500 ${isModern ? 'bg-red-50 border border-red-100' : 'bg-red-500/10'}`}>
                            <span className="material-symbols-outlined">warning</span>
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
                        <div className="flex items-center gap-4">
                            <h3 className="font-bold text-sm text-skin-base">Recent Transcripts</h3>
                            <div className="flex gap-2">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase cursor-pointer transition-colors ${isModern ? 'bg-indigo-100 text-indigo-700' : 'bg-primary/20 text-primary'}`}>All Calls</span>
                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase cursor-pointer transition-colors ${isModern ? 'hover:bg-slate-200' : 'hover:bg-white/10'}`}>Flagged</span>
                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase cursor-pointer transition-colors ${isModern ? 'hover:bg-slate-200' : 'hover:bg-white/10'}`}>Escalated</span>
                            </div>
                        </div>
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
                                {calls.map((call) => {
                                    const isFlagged = flaggedCalls.has(call.id);
                                    const isImproved = improvedCalls.has(call.id);

                                    return (
                                    <div key={call.id} className={`p-6 transition-all group border-l-4 ${isFlagged ? 'border-red-500' : 'border-transparent'} hover:border-indigo-600 flex flex-col lg:flex-row gap-6 ${isModern ? 'hover:bg-slate-50/80' : 'hover:bg-slate-custom/20'}`}>
                                        
                                        {/* Audio & Meta Column */}
                                        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${isModern ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                                        {call.language}
                                                    </span>
                                                    <span className="text-xs text-skin-muted font-mono font-medium">
                                                        {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isModern ? 'bg-slate-100 text-slate-600' : 'bg-surface-dark text-slate-400'}`}>{call.duration}s</span>
                                            </div>
                                            
                                            {/* Audio Player Mock */}
                                            <div className={`p-3 rounded-xl border flex items-center gap-3 ${isModern ? 'bg-white border-slate-200' : 'bg-black/20 border-white/5'}`}>
                                                <button className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isModern ? 'bg-indigo-600 text-white shadow-md' : 'bg-primary text-background-dark'}`}>
                                                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                                                </button>
                                                <div className="flex-1 flex items-center gap-0.5 h-6 opacity-60">
                                                    {[...Array(12)].map((_, i) => (
                                                        <div key={i} className={`w-1 rounded-full ${isModern ? 'bg-indigo-400' : 'bg-primary'}`} style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Metadata */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest">
                                                    <span className="text-skin-muted">Intent</span>
                                                    <span className={isModern ? 'text-indigo-600' : 'text-primary'}>{(call as any).intent || 'General Inquiry'}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest">
                                                    <span className="text-skin-muted">Confidence</span>
                                                    <span className="text-emerald-500">{((call as any).confidence * 100).toFixed(1)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="hidden lg:block w-px bg-border-dark/50"></div>

                                        {/* Transcript Thread */}
                                        <div className="flex-1 space-y-4">
                                            {/* User Bubble */}
                                            <div className="flex gap-4">
                                                <div className={`size-9 rounded-full flex items-center justify-center shrink-0 border ${isModern ? 'bg-white text-gray-400 border-gray-200' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                                    <span className="material-symbols-outlined text-xl">person</span>
                                                </div>
                                                <div className={`border p-4 rounded-2xl rounded-tl-none text-sm transition-all w-full ${isModern ? 'bg-white border-gray-200 text-gray-700 shadow-sm group-hover:shadow-md' : 'bg-surface-dark border-border-dark text-slate-300'}`}>
                                                    <span className="block mb-2 text-[10px] font-bold uppercase tracking-wider opacity-50">Translated Caller Query</span>
                                                    <p className="text-base leading-relaxed">"{call.transcript || 'Audio snippet being processed...'}"</p>
                                                </div>
                                            </div>

                                            {/* AI Bubble */}
                                            <div className="flex gap-4">
                                                <div className={`size-9 rounded-full flex items-center justify-center shrink-0 border transition-all ${isModern ? 'bg-indigo-600 text-white border-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.2)]' : 'bg-primary/20 border-primary/30 glow-saffron text-primary'}`}>
                                                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                                                </div>
                                                <div className={`p-4 rounded-2xl rounded-tl-none border text-sm transition-all w-full ${isModern ? 'bg-indigo-50/50 border-indigo-100 text-indigo-950' : 'bg-slate-custom border-slate-700 text-slate-200'}`}>
                                                    <span className="block mb-2 text-[10px] font-bold uppercase tracking-wider opacity-50">AI Synthesized Response</span>
                                                    <p className="text-base leading-relaxed">
                                                        {call.aiResponse || 'Processing response formulation and knowledge retrieval...'}
                                                    </p>
                                                    
                                                    {isFlagged && (
                                                        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                                                            <span className="material-symbols-outlined text-sm">warning</span>
                                                            <p>This response has been flagged for hallucination or incorrect policy formulation. It has been routed to the model tuning queue.</p>
                                                        </div>
                                                    )}

                                                    {isImproved && (
                                                        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2">
                                                            <span className="material-symbols-outlined text-sm">edit_note</span>
                                                            <p>Moderator proposed an improved response. Vector embeddings have been updated in the RAG pipeline.</p>
                                                        </div>
                                                    )}

                                                    <div className="mt-4 pt-4 border-t border-indigo-200/30 flex flex-wrap items-center justify-between gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="text-[10px] text-emerald-600 font-mono flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-[14px]">bolt</span> Latency: {(call as any).latency || 104}ms
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={() => toggleImprove(call.id)}
                                                                className={`px-2 py-1 rounded border text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${
                                                                isImproved 
                                                                    ? (isModern ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400')
                                                                    : (isModern ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-surface-dark border-border-dark hover:bg-white/5')
                                                            }`}>
                                                                <span className="material-symbols-outlined text-[12px]">feedback</span> {isImproved ? 'Improved' : 'Improve'}
                                                            </button>
                                                            <button 
                                                                onClick={() => toggleFlag(call.id)}
                                                                className={`px-2 py-1 rounded border text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${
                                                                isFlagged 
                                                                    ? (isModern ? 'bg-red-600 border-red-700 text-white' : 'bg-red-500/20 border-red-500/30 text-red-500') 
                                                                    : (isModern ? 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20')
                                                            }`}>
                                                                <span className="material-symbols-outlined text-[12px]">flag</span> {isFlagged ? 'Flagged' : 'Flag Hallucination'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
