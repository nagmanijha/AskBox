import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SecretariatUI, { SECTIONS, SectionType, WeatherPanel, RoadmapSection, NewsSection, CHIPS } from '../components/SecretariatUI';
import PhoneUI from '../components/PhoneUI';

export default function UserPortalPage() {
    const [portalView, setPortalView] = useState<'home' | 'calling' | 'voice-apply'>('home');
    const [desktopSection, setDesktopSection] = useState<SectionType>('farmers');

    const activeData = SECTIONS[desktopSection];

    return (
        <div className="h-screen bg-surface-container-lowest text-on-surface font-display flex flex-col md:flex-row overflow-hidden">
            
            {/* =========================================
                MOBILE VIEW: NATIVE APP (md:hidden)
                ========================================= */}
            <div className="md:hidden flex-1 relative w-full h-screen bg-surface overflow-hidden">
                {portalView === 'home' ? (
                    <SecretariatUI 
                        onStartCall={() => setPortalView('calling')} 
                        onVoiceApply={() => setPortalView('voice-apply')} 
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-black h-full relative w-full pb-10">
                        <button 
                            onClick={() => setPortalView('home')}
                            className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 z-50 backdrop-blur-md"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back
                        </button>
                        <PhoneUI autoStartMode={portalView === 'voice-apply' ? 'form' : undefined} />
                    </div>
                )}
            </div>

            {/* =========================================
                DESKTOP VIEW: PRO DASHBOARD (hidden md:flex)
                ========================================= */}
            
            {/* Sidebar (Fixed, High Density) */}
            <aside className="w-[260px] h-screen bg-surface border-r border-outline-variant/20 flex-col hidden md:flex shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-outline-variant/20 shrink-0">
                    <h1 className="text-lg font-black tracking-tight text-on-surface flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-[14px]">bolt</span>
                        </div>
                        JanVani OS
                    </h1>
                </div>

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
                    <div>
                        <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3 px-2">Demographics</h3>
                        <div className="space-y-1">
                            {(Object.keys(SECTIONS) as SectionType[]).map((s) => (
                                <button 
                                    key={s} 
                                    onClick={() => setDesktopSection(s)} 
                                    className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-sm font-bold ${
                                        desktopSection === s 
                                        ? 'bg-primary/10 text-primary' 
                                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        {s === 'farmers' ? 'agriculture' : s === 'ladies' ? 'woman_2' : s === 'students' ? 'school' : 'elderly'}
                                    </span>
                                    {SECTIONS[s].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3 px-2">Navigation</h3>
                        <div className="space-y-1">
                            <Link to="/login" className="w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-sm font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest">
                                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                                Admin Console
                            </Link>
                            <button className="w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-sm font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest">
                                <span className="material-symbols-outlined text-[18px]">account_circle</span>
                                Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* User Profile */}
                <div className="p-4 mx-3 mb-4 mt-auto rounded-xl bg-surface-container border border-outline-variant/30 hover:bg-surface-container-high transition-colors cursor-pointer group shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={activeData.avatar} alt="Avatar" className="w-9 h-9 rounded-full bg-surface-variant object-cover ring-2 ring-surface group-hover:ring-primary/20 transition-all" />
                        <div>
                            <p className="text-xs font-black text-on-surface group-hover:text-primary transition-colors">{activeData.userName}</p>
                            <p className="text-[10px] font-medium text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                                Online Status
                            </p>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-sm group-hover:text-primary transition-colors">more_vert</span>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-screen flex-col hidden md:flex bg-surface-container-lowest relative overflow-hidden">
                {/* Header (Sticky) */}
                <header className="h-16 border-b border-outline-variant/20 bg-surface/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-20">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-on-surface-variant text-lg">space_dashboard</span>
                        <span className="text-on-surface-variant font-medium">Dashboard</span>
                        <span className="text-on-surface-variant mx-1">/</span>
                        <span className="font-bold text-on-surface">{activeData.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1.5 rounded-md bg-surface-container border border-outline-variant/20 flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* Dashboard Grid (Scrollable) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="max-w-[1400px] mx-auto space-y-6">
                        
                        {/* ROW 1: Hero & Weather */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            <div className={`xl:col-span-8 rounded-2xl p-6 py-5 shadow-sm flex flex-col justify-center text-white relative overflow-hidden ${activeData.themeColor} border border-white/10`}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div>
                                        <span className="inline-block px-2 py-1 rounded-md bg-white/20 backdrop-blur-md text-[9px] font-black uppercase tracking-widest mb-3">
                                            {activeData.hero.tag}
                                        </span>
                                        <h2 className="text-2xl font-black mb-1 whitespace-pre-wrap leading-tight drop-shadow-sm">{activeData.hero.title}</h2>
                                        <p className="text-xs font-medium opacity-90 max-w-lg leading-relaxed">{activeData.hero.desc}</p>
                                    </div>
                                    <div className="flex gap-2 mt-5 flex-wrap">
                                        {CHIPS[desktopSection].map((chip, i) => (
                                            <button key={i} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95">
                                                <span className="material-symbols-outlined text-[14px]">{chip.icon}</span>
                                                {chip.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="xl:col-span-4 flex flex-col gap-4">
                                <div className="flex-1 [&>section]:!m-0 [&>section]:!rounded-2xl [&>section]:!h-full [&>section]:!shadow-sm">
                                    <WeatherPanel themeColor={activeData.themeColor} />
                                </div>
                                <div className="bg-surface border border-outline-variant/30 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-primary/30 transition-colors cursor-default">
                                    <div>
                                        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">Community Engagement</p>
                                        <div className="flex items-end gap-2">
                                            <p className="text-lg font-black text-on-surface leading-none">68.4%</p>
                                            <p className="text-[10px] text-emerald-600 font-bold leading-none mb-0.5">+4.2%</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                                        <span className="material-symbols-outlined text-[18px]">monitoring</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ROW 2: Voice Dashboard */}
                        <div className="w-full">
                            <PhoneUI isWidget={true} autoStartMode={undefined} />
                        </div>

                        {/* ROW 3: Schemes, Roadmap, News (Equal 4|4|4 balance) */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                            
                            {/* Schemes List */}
                            <div className="bg-surface border border-outline-variant/30 rounded-2xl shadow-sm p-5 flex flex-col">
                                <div className="flex items-center justify-between mb-4 border-b border-outline-variant/10 pb-3">
                                    <h3 className="text-[11px] font-black text-on-surface uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] text-secondary">workspace_premium</span>
                                        Recommendations
                                    </h3>
                                    <button className="text-[10px] font-bold text-primary hover:underline">View All</button>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {activeData.schemes.map((scheme, idx) => (
                                        <div key={idx} className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 flex flex-col hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-[9px] px-2 py-0.5 rounded-md ${activeData.themeColor} text-white font-black uppercase tracking-widest shadow-sm`}>{scheme.id}</span>
                                                <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1 duration-300">arrow_forward</span>
                                            </div>
                                            <h4 className="font-bold text-sm text-on-surface leading-tight mb-1">{scheme.title}</h4>
                                            <p className="text-[11px] font-medium text-on-surface-variant line-clamp-2 leading-relaxed">{scheme.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Roadmap */}
                            <div className="bg-surface border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden flex flex-col [&>section]:!m-0 [&>section]:!rounded-none [&>section]:!border-none [&>section]:!shadow-none [&_h2]:!text-[11px] [&_h2]:!uppercase [&_h2]:!tracking-widest">
                                <RoadmapSection section={desktopSection} themeColor={activeData.themeColor} onOpenAI={() => {}} />
                            </div>

                            {/* News */}
                            <div className="bg-surface border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden flex flex-col [&>section]:!m-0 [&>section]:!rounded-none [&>section]:!border-none [&>section]:!shadow-none [&_h2]:!text-[11px] [&_h2]:!uppercase [&_h2]:!tracking-widest">
                                <NewsSection section={desktopSection} themeColor={activeData.themeColor} lightThemeColor={activeData.lightThemeColor} />
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
