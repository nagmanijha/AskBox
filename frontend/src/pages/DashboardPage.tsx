<<<<<<< HEAD
import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { OverviewMetrics, CallLog } from '../types';
import DemoCallTracker from '../components/DemoCallTracker';
import VoiceDemoModal from '../components/VoiceDemoModal';
import { DEMO_SCENARIOS } from '../constants/demoScenarios';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
    Activity, Shield, Zap, Globe, MessageSquare, BookOpen, 
    Settings, Phone, Mic, Languages, TrendingUp, AlertCircle, CheckCircle, X
} from 'lucide-react';

// --- MOCK DATA FOR HACKATHON ---
const INITIAL_ADMIN_METRICS = {
    computeUsage: '4.2 TFlops',
    sttAccuracy: '99.4%',
    avgLatency: '112ms',
    errorRate: '2.1%',
    totalQueries: 14209,
    telecomCircles: [
        { name: 'Maharashtra', stability: '99.9%', status: 'stable' },
        { name: 'Karnataka', stability: '99.8%', status: 'stable' },
        { name: 'Tamil Nadu', stability: '99.9%', status: 'stable' },
        { name: 'Delhi NCR', stability: '82.4%', status: 'congestion' },
        { name: 'UP East', stability: '97.2%', status: 'stable' },
        { name: 'Bihar', stability: '98.5%', status: 'stable' },
    ],
    languagePerformance: [
        { name: 'Hindi', volume: 45000, growth: '+12%' },
        { name: 'Kannada', volume: 28000, growth: '+8%' },
        { name: 'Marathi', volume: 15000, growth: '+15%' },
        { name: 'Tamil', volume: 12000, growth: '+5%' },
        { name: 'Bengali', volume: 9000, growth: '+20%' },
        { name: 'Gujarati', volume: 7500, growth: '+10%' },
    ],
    recurringTopics: [
        { name: 'Weather', count: 1240, color: '#4F46E5' },
        { name: 'Agriculture', count: 850, color: '#10B981' },
        { name: 'Medical Help', count: 720, color: '#F59E0B' },
        { name: 'Education', count: 420, color: '#EF4444' },
    ]
};

const USER_MOCK_PROFILE = {
    name: 'Ramesh K.',
    role: 'Regional Officer',
    location: 'Karnataka',
    language: 'Kannada',
    totalCalls: 128,
};

const USER_MOCK_HISTORY: CallLog[] = [
    { id: 'CH-8821', phoneNumber: '+91 98XXX XXX01', language: 'Kannada', duration: 312, status: 'completed', startedAt: new Date(Date.now() - 600000).toISOString(), transcriptSummary: 'Farmer asking about Paddy MSP rates for 2025.' },
    { id: 'CH-8819', phoneNumber: '+91 98XXX XXX01', language: 'Kannada', duration: 225, status: 'completed', startedAt: new Date(Date.now() - 3600000).toISOString(), transcriptSummary: 'Query regarding Solar Pump scheme eligibility.' },
    { id: 'CH-8815', phoneNumber: '+91 98XXX XXX01', language: 'Kannada', duration: 440, status: 'completed', startedAt: new Date(Date.now() - 86400000).toISOString(), transcriptSummary: 'Discussion on crop insurance claim process.' },
];

export default function DashboardPage() {
    const { isDemoMode, user } = useAuth();
    const { designSystem } = useTheme();
    const isAdmin = user?.role === 'admin';
    const isModern = designSystem === 'modern';

    const [activeScenario, setActiveScenario] = useState(DEMO_SCENARIOS[0]);
    const [adminMetrics, setAdminMetrics] = useState(INITIAL_ADMIN_METRICS);
    const [userHistory, setUserHistory] = useState(USER_MOCK_HISTORY);
    const [loading, setLoading] = useState(false);
    const [showCallModal, setShowCallModal] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

    const handleCallComplete = (callData: any) => {
        // Update User History if User
        if (!isAdmin) {
            setUserHistory(prev => [callData, ...prev]);
        }
        
        // Update Admin Metrics (Mock increment)
        setAdminMetrics(prev => ({
            ...prev,
            totalQueries: prev.totalQueries + 1,
            computeUsage: iisAdmin ? '4.8 TFlops' : prev.computeUsage,
        }));

        setToast({ message: `Call ${callData.id} completed successfully! Dashboard updated.`, type: 'success' });
        setTimeout(() => setToast(null), 5000);
    };

    const iisAdmin = isAdmin; // alias for closure

    // Filter call logs for display
    const recentCalls = isAdmin ? [] : USER_MOCK_HISTORY;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
            </div>
        );
    }

    return (
        <div className={`p-6 lg:p-8 space-y-8 min-h-[calc(100vh-80px)] text-skin-base transition-colors duration-300 animate-in fade-in zoom-in-95 duration-700`}>
            {/* Header with Role & Action */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isModern ? 'bg-indigo-600' : 'bg-primary'}`}>
                            {isAdmin ? <Shield className="text-white size-5" /> : <Phone className="text-white size-5" />}
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">
                            {isAdmin ? 'Operation Control' : 'Officer Workspace'}
                        </h1>
                    </div>
                    <p className="text-skin-muted text-sm font-medium">
                        {isAdmin ? 'Strategic Command Center • Global Fleet Telemetry' : `District Field Ops • Welcome back, ${USER_MOCK_PROFILE.name}`}
                    </p>
                </div>

                <button 
                    onClick={() => setShowCallModal(true)}
                    className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg ${
                        isModern 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' 
                        : 'bg-primary text-background-dark hover:bg-primary-light shadow-primary/20'
                    }`}
                >
                    <Mic className="size-5 group-hover:animate-pulse" />
                    Start Voice Call
                </button>
            </header>

            {isAdmin ? <AdminView isModern={isModern} metrics={adminMetrics} activeScenario={activeScenario} setActiveScenario={setActiveScenario} /> 
                    : <UserView isModern={isModern} profile={USER_MOCK_PROFILE} history={userHistory} />}
            
            <VoiceDemoModal 
                isOpen={showCallModal} 
                onClose={() => setShowCallModal(false)} 
                onCallComplete={handleCallComplete}
            />

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-8 right-8 z-[60] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 ${
                    isModern ? 'bg-white border-slate-200' : 'bg-[#151518] border-white/10'
                }`}>
                    <div className={`size-10 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-black">{toast.message}</p>
                    </div>
                    <button onClick={() => setToast(null)} className="ml-4 opacity-50 hover:opacity-100">
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

// --- SUBVIEWS ---

function AdminView({ isModern, metrics, activeScenario, setActiveScenario }: any) {
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
            {/* 1. System Health (4 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Compute Usage', value: metrics.computeUsage, icon: Zap, color: 'text-indigo-600', trend: 'STABLE' },
                    { label: 'STT Accuracy', value: metrics.sttAccuracy, icon: Languages, color: 'text-emerald-600', trend: 'NOMINAL' },
                    { label: 'Avg. Latency', value: metrics.avgLatency, icon: Activity, color: 'text-amber-600', trend: 'LOW' },
                    { label: 'Error Rate', value: metrics.errorRate, icon: AlertCircle, color: 'text-red-500', trend: '0.01% DEC' },
                ].map((stat, i) => (
                    <div key={i} className="ds-card relative group overflow-hidden">
                        <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity ${stat.color}`}>
                            <stat.icon size={120} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">{stat.label}</p>
                        <h4 className="text-3xl font-black tracking-tighter tabular-nums">{stat.value}</h4>
                        <div className="mt-4 flex items-center gap-2">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${isModern ? 'bg-slate-100' : 'bg-white/5'}`}>
                                Status: {stat.trend}
                             </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 2. Telecom Connectivity & Infrastructure Pulse */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="ds-card">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Globe className="text-indigo-500" />
                                <h3 className="text-xl font-black">Telecom Connectivity Cluster</h3>
                            </div>
                            <span className="text-[10px] font-bold text-skin-muted uppercase tracking-widest">Live: 28 Circles</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                            {metrics.telecomCircles.map((circle: any, i: number) => (
                                <div key={i} className={`p-4 rounded-2xl border transition-all ${
                                    circle.status === 'congestion' 
                                    ? (isModern ? 'bg-red-50 border-red-100 text-red-700' : 'bg-red-500/10 border-red-500/20 text-red-400')
                                    : (isModern ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5')
                                }`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold">{circle.name}</span>
                                        <div className={`size-2 rounded-full ${circle.status === 'congestion' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                    </div>
                                    <div className="text-xl font-black">{circle.stability}</div>
                                    <div className="text-[9px] uppercase font-black opacity-60">{circle.status}</div>
                                </div>
                            ))}
                        </div>
                        {/* Static Infrastructure Pulse Wave */}
                        <div className={`h-32 w-full rounded-2xl border overflow-hidden relative ${isModern ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <Activity className="size-48" />
                            </div>
                            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                <path 
                                    d="M0 60 Q 50 10, 100 60 T 200 60 T 300 60 T 400 60 T 500 60 T 600 60 T 700 60 T 800 60 T 900 60 T 1000 60" 
                                    fill="none" 
                                    stroke={isModern ? '#4F46E5' : '#f4ab25'} 
                                    strokeWidth="3"
                                    className="animate-[dash_10s_linear_infinite]"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* 3. Language Performance (Bar Chart) */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="ds-card h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="text-emerald-500" />
                            <h3 className="text-xl font-black">Regional Spread</h3>
                        </div>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.languagePerformance}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isModern ? '#e2e8f0' : '#2d2d30'} />
                                    <XAxis dataKey="name" stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: isModern ? '#fff' : '#1a1a1e', borderColor: '#333', borderRadius: '12px' }}
                                        itemStyle={{ color: isModern ? '#4F46E5' : '#f4ab25' }}
                                    />
                                    <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                                        {metrics.languagePerformance.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={isModern ? '#4F46E5' : '#f4ab25'} fillOpacity={1 - (index * 0.1)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-8 space-y-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold opacity-60 uppercase">Top Performer</span>
                                <span className="font-black text-emerald-500">Hindi (94%)</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold opacity-60 uppercase">Fastest Growth</span>
                                <span className="font-black text-indigo-500">Bengali (+20%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Knowledge Insights & Infrapulse */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="ds-card">
                    <div className="flex items-center gap-3 mb-8">
                        <BookOpen className="text-amber-500" />
                        <h3 className="text-xl font-black">Knowledge Insights</h3>
                    </div>
                    <div className="space-y-6">
                        {metrics.recurringTopics.map((topic: any, i: number) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase">
                                    <span>{topic.name}</span>
                                    <span className="opacity-60">{topic.count} mentions</span>
                                </div>
                                <div className={`h-2 w-full rounded-full overflow-hidden ${isModern ? 'bg-slate-100' : 'bg-white/5'}`}>
                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(topic.count / 1240) * 100}%`, backgroundColor: topic.color }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ds-card flex flex-col items-center justify-center space-y-6 text-center group">
                    <div className={`size-32 rounded-full flex items-center justify-center transition-all group-hover:scale-110 duration-500 ${isModern ? 'bg-indigo-50 text-indigo-600' : 'bg-primary/10 text-primary'}`}>
                         <Activity size={56} className="animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black">Global LLM Health</h4>
                        <p className="text-skin-muted text-sm mt-2 max-w-xs mx-auto">
                            Average processing speed across Azure clusters: <span className="text-skin-base font-bold">142 tok/sec</span>. 
                            Active shards: <span className="text-skin-base font-bold">12/12</span>.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-bold uppercase">Secure</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                            <span className="text-[10px] font-bold uppercase">Optimized</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UserView({ isModern, profile, history }: any) {
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. My Profile & Summary */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="ds-card">
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`size-16 rounded-3xl flex items-center justify-center text-3xl transition-transform hover:rotate-6 duration-300 ${isModern ? 'bg-indigo-600 text-white' : 'bg-primary text-background-dark'}`}>
                                {profile.name[0]}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{profile.name}</h3>
                                <p className="text-xs text-skin-muted uppercase font-black tracking-widest">{profile.role || 'Regional Officer'}</p>
                            </div>
                        </div>
                        <div className="space-y-4 pt-6 border-t border-white/5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-skin-muted">Location</span>
                                <span className="font-bold">{profile.location}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-skin-muted">Pref. Language</span>
                                <span className="font-bold text-indigo-500">{profile.language}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-skin-muted">Total Calls</span>
                                <span className="font-bold tabular-nums">{profile.totalCalls}</span>
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/5">
                             <div className="ds-card bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1">Knowledge Coverage</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-indigo-500/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-[65%]"></div>
                                    </div>
                                    <span className="text-xs font-black text-indigo-500">65%</span>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* 3. Topics I Explored (Simple Chart) */}
                    <div className="ds-card">
                         <h4 className="text-lg font-black mb-6 flex items-center gap-2">
                             <TrendingUp size={18} className="text-emerald-500" />
                             Topic Breakdown
                         </h4>
                         <div className="h-[200px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Weather', value: 45 },
                                            { name: 'Agri', value: 30 },
                                            { name: 'Other', value: 25 },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#4F46E5" />
                                        <Cell fill="#10B981" />
                                        <Cell fill="#F59E0B" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                         </div>
                         <div className="flex justify-center gap-4 text-[10px] font-bold uppercase tracking-widest mt-4">
                            <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-indigo-500"></div> Weather</div>
                            <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-emerald-500"></div> Agri</div>
                            <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-amber-500"></div> Medical</div>
                         </div>
                    </div>
                </div>

                {/* 2. My Call History & Recent AI Responses */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="ds-card">
                        <div className="flex items-center justify-between mb-8">
                             <div className="flex items-center gap-3">
                                <Activity className="text-indigo-500" />
                                <h3 className="text-xl font-black">My Call History</h3>
                             </div>
                             <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                            {history.map((call: any, i: number) => (
                                <div key={i} className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${isModern ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`size-12 rounded-2xl flex items-center justify-center ${isModern ? 'bg-indigo-100 text-indigo-600' : 'bg-primary/20 text-primary'}`}>
                                                <Phone size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black uppercase tracking-wider">{call.id}</span>
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${isModern ? 'bg-indigo-50 text-indigo-600' : 'bg-primary/10 text-primary'}`}>{call.language}</span>
                                                </div>
                                                <p className="text-sm font-bold mt-1 line-clamp-1">{call.transcriptSummary}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-right">
                                            <div>
                                                <p className="text-[10px] font-bold text-skin-muted uppercase mb-1">Duration</p>
                                                <p className="text-xs font-black">{Math.floor(call.duration/60)}m {call.duration%60}s</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-skin-muted uppercase mb-1">Time</p>
                                                <p className="text-xs font-black">2h ago</p>
                                            </div>
                                            <button className="p-2 rounded-lg bg-indigo-500/5 text-indigo-500 hover:bg-indigo-500/10 transition-all">
                                                <MessageSquare size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="ds-card">
                        <div className="flex items-center gap-3 mb-8">
                            <Zap className="text-amber-500" />
                            <h3 className="text-xl font-black">Recent AI Responses</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { question: 'What is the MSP for Paddy 2025?', answer: 'The government has fixed the Minimum Support Price (MSP) for Paddy at ₹2,300 per quintal for the 2025-26 season.' },
                                { question: 'Eligibility for PM-Kisan?', answer: 'Small and marginal farmers holding cultivable land up to 2 hectares are eligible for ₹6,000 annual support.' },
                            ].map((qa, i) => (
                                <div key={i} className={`p-6 rounded-2xl border ${isModern ? 'bg-amber-50/50 border-amber-100' : 'bg-amber-500/5 border-amber-500/10'}`}>
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="size-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                                            <Mic size={14} />
                                        </div>
                                        <p className="text-sm font-black">{qa.question}</p>
                                    </div>
                                    <div className="flex items-start gap-3 pl-9">
                                        <p className="text-xs text-skin-muted leading-relaxed italic">"{qa.answer}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
=======
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { OverviewMetrics } from '../types';
import DemoCallTracker from '../components/DemoCallTracker';

const DEMO_SCENARIOS = [
    {
        id: 'hi',
        language: 'Hindi',
        state: 'Uttar Pradesh',
        activeCalls: '6.8M',
        accuracy: '99.4%',
        errorRate: '1.2%',
        compute: '5.4 TFlops',
        load: '82%',
        nodes: '52/52',
        labels: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra'],
        query: 'कल का मौसम कैसा रहेगा?',
        translation: 'How will the weather be tomorrow?',
        color: 'primary'
    },
    {
        id: 'mr',
        language: 'Marathi',
        state: 'Maharashtra',
        activeCalls: '5.2M',
        accuracy: '98.5%',
        errorRate: '2.5%',
        compute: '4.2 TFlops',
        load: '72%',
        nodes: '45/45',
        labels: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
        query: 'आजचे मार्केट भाव काय आहेत?',
        translation: "What are today's market prices?",
        color: 'accent-teal'
    },
    {
        id: 'ta',
        language: 'Tamil',
        state: 'Tamil Nadu',
        activeCalls: '4.4M',
        accuracy: '99.2%',
        errorRate: '1.8%',
        compute: '3.8 TFlops',
        load: '65%',
        nodes: '32/32',
        labels: ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
        query: 'பயிர் நோய்கள் பற்றி சொல்லுங்கள்',
        translation: 'Tell me about crop diseases',
        color: 'primary'
    }
];

export default function DashboardPage() {
    const { isDemoMode } = useAuth();

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
                activeCalls: isDemoMode ? 12402 + Math.floor(Math.random() * 50) : Math.floor(Math.random() * 500) + 12000,
            });
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

    return (
        <div className="p-6 lg:p-12 space-y-8 bg-background-dark min-h-[calc(100vh-80px)] text-slate-100">
            {isDemoMode && (
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">explore</span>
                        <div>
                            <p className="text-sm font-bold text-slate-100 italic">DEMO_CLUSTER_{activeScenario.id.toUpperCase()} ACTIVE</p>
                            <p className="text-[10px] text-slate-400">Viewing simulated telemetry for {activeScenario.language} region.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
                        {DEMO_SCENARIOS.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setActiveScenario(s)}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeScenario.id === s.id ? 'bg-primary text-background-dark' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {s.language}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Header handled by Layout, so we just start with the Hero Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Global Compute */}
                <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-5xl text-primary">memory</span>
                    </div>
                    <p className="text-xs font-bold text-primary/60 uppercase tracking-widest">Global Compute</p>
                    <h3 className="text-3xl font-black mt-1 text-slate-100">{isDemoMode ? activeScenario.compute : '88.4%'}</h3>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full w-[88%]"></div>
                        </div>
                        <span className="text-[10px] font-bold text-accent-teal">+2.1%</span>
                    </div>
                </div>

                {/* STT Accuracy */}
                <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-5xl text-accent-teal">translate</span>
                    </div>
                    <p className="text-xs font-bold text-accent-teal/60 uppercase tracking-widest">STT Accuracy</p>
                    <h3 className="text-3xl font-black mt-1 text-slate-100">{isDemoMode ? activeScenario.accuracy : '99.12%'}<span className="text-lg font-normal text-slate-500"></span></h3>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-accent-teal/10 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-teal rounded-full w-[99%]"></div>
                        </div>
                        <span className="text-[10px] font-bold text-accent-teal">STABLE</span>
                    </div>
                </div>

                {/* Active Threads */}
                <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-5xl text-primary">call</span>
                    </div>
                    <p className="text-xs font-bold text-primary/60 uppercase tracking-widest">Active Threads</p>
                    <h3 className="text-3xl font-black mt-1 text-slate-100">{isDemoMode ? activeScenario.activeCalls : (metrics?.activeCalls?.toLocaleString() || '12,402')}</h3>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full w-[65%]"></div>
                        </div>
                        <span className="text-[10px] font-bold text-red-500">PEAK</span>
                    </div>
                </div>

                {/* State Nodes */}
                <div className="glass-panel p-6 rounded-xl relative overflow-hidden group border-accent-teal/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-5xl text-accent-teal">hub</span>
                    </div>
                    <p className="text-xs font-bold text-accent-teal/60 uppercase tracking-widest">State Nodes</p>
                    <h3 className="text-3xl font-black mt-1 text-slate-100">{isDemoMode ? activeScenario.nodes : '28/28'}</h3>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-accent-teal/10 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-teal rounded-full w-full"></div>
                        </div>
                        <span className="text-[10px] font-bold text-accent-teal">ACTIVE</span>
                    </div>
                </div>
            </div>

            {/* Main Grid Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: AI Engine & Connectivity */}
                <div className="lg:col-span-8 space-y-8">
                    {/* AI Engine Health (Waveforms) */}
                    <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">settings_voice</span>
                                <h3 className="text-xl font-bold">AI Engine Health Pulse</h3>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">LLM V5.2</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-accent-teal"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">STT Nexus</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {/* LLM Pulse */}
                            <div className="relative">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-400">LLM Processing Pulse</span>
                                    <span className={`text-xs font-bold text-${isDemoMode ? activeScenario.color : 'primary'} tracking-widest`}>{isDemoMode ? activeScenario.accuracy : '99.4%'} OPS</span>
                                </div>
                                <div className={`h-24 w-full bg-${isDemoMode ? activeScenario.color : 'primary'}/5 rounded-lg border border-${isDemoMode ? activeScenario.color : 'primary'}/10 overflow-hidden relative`}>
                                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                        <path className="opacity-50" d="M0 50 Q 50 10, 100 50 T 200 50 T 300 50 T 400 50 T 500 50 T 600 50 T 700 50 T 800 50 T 900 50 T 1000 50" fill="none" stroke={isDemoMode ? (activeScenario.color === 'primary' ? '#f4ab25' : '#2dd4bf') : '#f4ab25'} strokeWidth="2"></path>
                                        <path d="M0 50 Q 50 80, 100 50 T 200 50 T 300 50 T 400 50 T 500 50 T 600 50 T 700 50 T 800 50 T 900 50 T 1000 50" fill="none" stroke={isDemoMode ? (activeScenario.color === 'primary' ? '#f4ab25' : '#2dd4bf') : '#f4ab25'} strokeWidth="3"></path>
                                    </svg>
                                    <div className="scanning-line absolute top-0 left-0 animate-[move_5s_infinite]"></div>
                                </div>
                            </div>

                            {/* STT Pulse */}
                            <div className="relative">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-400">STT Waveform Accuracy</span>
                                    <span className="text-xs font-bold text-accent-teal tracking-widest">{isDemoMode ? '0.08ms' : '0.12ms'} LAG</span>
                                </div>
                                <div className="h-24 w-full bg-accent-teal/5 rounded-lg border border-accent-teal/10 overflow-hidden relative">
                                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                        <path d="M0 50 L 20 45 L 40 55 L 60 30 L 80 70 L 100 40 L 120 60 L 140 20 L 160 80 L 180 40 L 200 50 L 220 30 L 240 70 L 260 40 L 280 60 L 300 20 L 320 80 L 340 40 L 360 50 L 380 30 L 400 70" fill="none" stroke="#2dd4bf" strokeWidth="2"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Connectivity Pulse */}
                    <div className="glass-panel rounded-2xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">cell_tower</span>
                                <h3 className="text-xl font-bold">Connectivity Pulse</h3>
                            </div>
                            <div className="text-xs text-slate-500">Live feed from 28 telecom circles</div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* States */}
                            {(isDemoMode ? activeScenario.labels : ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi NCR']).map((label, idx) => (
                                <div key={label} className={`p-4 rounded-xl border border-primary/10 bg-primary/5 flex flex-col gap-2 ${idx === 3 && !isDemoMode ? 'ring-1 ring-primary/40' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold">{label}</span>
                                        <span className={`h-2 w-2 rounded-full ${idx === 3 && !isDemoMode ? 'bg-primary glow-primary animate-ping' : 'bg-accent-teal glow-teal'}`}></span>
                                    </div>
                                    <div className={`text-lg font-black ${idx === 3 && !isDemoMode ? 'text-primary' : 'text-slate-200'}`}>
                                        {idx === 3 && !isDemoMode ? '82.4%' : '99.9%'}
                                    </div>
                                    <div className={`text-[10px] tracking-tighter uppercase ${idx === 3 && !isDemoMode ? 'text-primary/70 font-bold' : 'text-slate-500'}`}>
                                        {idx === 3 && !isDemoMode ? 'NODE CONGESTION' : 'SIGNAL STABLE'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 relative h-64 w-full bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-center overflow-hidden">
                            {/* Map Mock */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
                            <div className="z-10 text-center">
                                <span className="material-symbols-outlined text-6xl text-primary/40 mb-2">map</span>
                                <p className="text-sm font-bold text-slate-400">Interactive Connectivity Mesh</p>
                                <p className="text-xs text-slate-500 mt-1">Overlaying 45,000+ Signal Towers</p>
                            </div>
                            <div className="absolute top-1/4 left-1/3 p-2 bg-accent-teal text-background-dark rounded shadow-lg text-[8px] font-bold">NODE_01: STABLE</div>
                            <div className="absolute bottom-1/3 right-1/4 p-2 bg-primary text-background-dark rounded shadow-lg text-[8px] font-bold">NODE_24: REROUTING</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Clusters & Allocation */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Dialect Clusters */}
                    <div className="glass-panel rounded-2xl p-8 h-fit">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-red-500">error_med</span>
                            <h3 className="text-xl font-bold">Dialect Clusters</h3>
                        </div>
                        <div className="space-y-6">
                            <p className="text-xs text-slate-400 leading-relaxed">STT performance degradation identified in specific regional pockets.</p>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                        <span>Current Dialect</span>
                                        <span className="text-accent-teal">{isDemoMode ? activeScenario.language : 'Hindi'}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-accent-teal rounded-full w-[94%]"></div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                        <span>Error Rate</span>
                                        <span className="text-red-400">{isDemoMode ? activeScenario.errorRate : '2.1%'}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 rounded-full w-[15%]"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-primary/10">
                                <button className="w-full py-3 rounded-lg bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20">
                                    Optimize Dataset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* NEW: Demo Call Tracker */}
                    <DemoCallTracker scenario={isDemoMode ? activeScenario : undefined} />

                    {/* Resource Allocation */}
                    <div className="glass-panel rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-accent-teal">analytics</span>
                            <h3 className="text-xl font-bold">Resource Allocation</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div className="flex-1 glass-panel p-4 rounded-xl border-l-4 border-l-accent-teal">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Compute</p>
                                    <p className="text-xl font-black text-slate-200">{isDemoMode ? activeScenario.compute : '4.2 TFlops'}</p>
                                </div>
                                <div className="w-1/3 glass-panel p-4 rounded-xl border-l-4 border-l-primary">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Load</p>
                                    <p className="text-xl font-black text-slate-200">{isDemoMode ? activeScenario.load : '72%'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-2/5 glass-panel p-4 rounded-xl border-l-4 border-l-primary">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">RAM</p>
                                    <p className="text-xl font-black text-slate-200">1.2 TB</p>
                                </div>
                                <div className="flex-1 glass-panel p-4 rounded-xl border-l-4 border-l-accent-teal">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Bandwidth</p>
                                    <p className="text-xl font-black text-slate-200">420 Gbps</p>
                                </div>
                            </div>
                            <div className="glass-panel p-4 rounded-xl border-l-4 border-l-slate-600 bg-slate-900/40">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Cluster: {isDemoMode ? `DEMO_${activeScenario.id.toUpperCase()}_01` : 'MUMBAI_WEST_A2'}</p>
                                        <p className="text-sm font-bold text-slate-300">Autoscaling Triggered</p>
                                    </div>
                                    <span className="material-symbols-outlined text-accent-teal animate-spin text-sm">settings</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Log Overlay */}
                    <div className="bg-black/80 rounded-2xl p-6 font-mono border border-primary/20">
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
>>>>>>> pr-3
