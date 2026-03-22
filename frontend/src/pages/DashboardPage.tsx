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
