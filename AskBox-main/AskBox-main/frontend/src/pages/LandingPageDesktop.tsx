import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { DEMO_SCENARIOS } from '../constants/demoScenarios';

export default function LandingPageDesktop() {
    const { designSystem, toggleDesignSystem } = useTheme();
    const isModern = designSystem === 'modern';
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [activeScenario, setActiveScenario] = useState(DEMO_SCENARIOS[0]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const launchDemo = () => {
        navigate(`/login?demo=true&lang=${activeScenario.id}`);
    };

    return (
        <div className={`font-display min-h-screen transition-colors duration-300 ${'bg-surface text-on-surface overflow-x-hidden'}`}>
            
            {/* Top Navigation */}
            <nav className={`fixed top-0 z-50 w-full transition-all duration-300 px-6 lg:px-20 ${
                scrolled ? 'bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20 py-4 shadow-sm' : 'bg-transparent py-6'
            }`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-sm">
                            <span className="material-symbols-outlined text-2xl">record_voice_over</span>
                        </div>
                        <span className={`text-2xl font-black tracking-tight uppercase tracking-widest ${'text-on-surface'}`}>JanVani</span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-10">
                        <div className="flex gap-8">
                            {['Platform', 'Impact', 'Mission'].map(item => (
                                <a key={item} href={`#${item.toLowerCase()}`} className={`text-xs font-black uppercase tracking-widest transition-colors ${
                                    'text-on-surface-variant hover:text-primary'
                                }`}>{item}</a>
                            ))}
                        </div>
                        <button 
                             onClick={toggleDesignSystem}
                             className="p-2 rounded-full transition-colors bg-surface-container text-on-surface hover:bg-surface-container-highest shadow-inner"
                        >
                             <span className="material-symbols-outlined text-sm">
                                 {isModern ? 'dark_mode' : 'light_mode'}
                             </span>
                        </button>
                        <Link to="/portal" className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all ${
                            'bg-surface text-on-surface border border-outline-variant/30 hover:border-primary/50'
                        }`}>
                            User Portal
                        </Link>
                        <Link to="/login" className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg ${
                            isModern ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-primary text-white hover:bg-primary/90 glow-saffron'
                        }`}>
                            Admin Console
                        </Link>
                    </div>
                    
                    <button className="md:hidden text-on-surface p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col justify-center px-6 lg:px-20 pt-20 overflow-hidden">
                {/* Background effects */}
                <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    
                    {/* Left: Copy */}
                    <div className="max-w-2xl animate-in slide-in-from-left-8 fade-in duration-700 mt-12 lg:mt-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-8">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">v2.4 Systems Online • 12ms Latency</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tighter mb-6 text-on-surface">
                            Voice Intelligence <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">For Rural India.</span>
                        </h1>
                        
                        <p className="text-lg md:text-xl font-medium text-on-surface-variant mb-10 leading-relaxed max-w-xl">
                            Call. Speak naturally. Get instant AI guidance in your language. JanVani transforms any basic phone into an advanced knowledge platform—no internet required.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => setShowDemoModal(true)} className="h-14 px-8 rounded-xl font-black text-sm uppercase tracking-widest text-white bg-primary hover:bg-primary/90 hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(var(--color-primary-rgb),0.4)]">
                                Try Live Demo
                                <span className="material-symbols-outlined text-lg">play_circle</span>
                            </button>
                            <Link to="/portal" className="h-14 px-8 rounded-xl font-bold text-sm uppercase tracking-widest text-on-surface bg-surface border border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container transition-all flex items-center justify-center gap-3">
                                Experience User Portal
                            </Link>
                        </div>
                    </div>

                    {/* Right: Interactive UI Mockup */}
                    <div className="relative w-full h-[600px] hidden lg:flex items-center justify-center perspective-1000">
                        <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-lowest to-surface-container-highest rounded-[3rem] border border-outline-variant/20 shadow-2xl rotate-y-12 rotate-x-6 scale-95 transform-gpu transition-transform hover:rotate-y-0 hover:rotate-x-0 duration-700 p-8 flex flex-col">
                            
                            {/* Mockup Header */}
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-error/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-secondary/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                                </div>
                                <div className="px-4 py-1.5 bg-surface-container rounded-full border border-outline-variant/20 flex items-center gap-2 shadow-inner">
                                    <span className="material-symbols-outlined text-[14px] text-primary">lock</span>
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Secure Voice Session</span>
                                </div>
                            </div>

                            {/* Mockup Body */}
                            <div className="flex-1 bg-surface rounded-2xl border border-outline-variant/20 shadow-inner p-6 flex flex-col relative overflow-hidden">
                                {/* Decor */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                                
                                {/* Status */}
                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <span className="material-symbols-outlined text-primary">record_voice_over</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-on-surface tracking-tight">Call Active</h3>
                                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">Translating from Hindi (hi-IN)</p>
                                    </div>
                                    <div className="ml-auto px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Live
                                    </div>
                                </div>

                                {/* Transcript */}
                                <div className="flex-1 space-y-5 relative z-10">
                                    <div className="flex gap-3 items-start flex-row-reverse">
                                        <div className="w-8 h-8 rounded-full bg-surface-variant flex shrink-0 items-center justify-center border border-outline-variant/20">
                                            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">person</span>
                                        </div>
                                        <div className="bg-surface-container-high border border-outline-variant/10 p-4 rounded-2xl rounded-tr-sm shadow-sm max-w-[80%]">
                                            <p className="text-xs font-medium text-on-surface">"PM Kisan योजना की अगली किस्त कब आएगी?"</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded-full bg-primary flex shrink-0 items-center justify-center text-white shadow-md glow-saffron">
                                            <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                                        </div>
                                        <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                            <p className="text-xs font-bold text-on-surface leading-relaxed">पीएम किसान सम्मान निधि की अगली 16वीं किस्त फरवरी 2024 के अंत तक आने की उम्मीद है। क्या आप अपना आवेदन स्टेटस चेक करना चाहते हैं?</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Visualizer */}
                                <div className="h-16 mt-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex items-center justify-center gap-1.5 p-2 shadow-inner">
                                    {[...Array(24)].map((_,i) => (
                                        <div key={i} className="w-1.5 bg-primary/80 rounded-full animate-pulse transition-all" style={{ height: `${Math.random()*80+20}%`, animationDelay: `${i*40}ms` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Now / Urgency */}
            <section id="mission" className="py-24 px-6 lg:px-20 bg-surface border-y border-outline-variant/10 relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-surface-container-lowest to-transparent pointer-events-none"></div>
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
                    <div className="lg:w-1/2 space-y-6">
                        <div className="size-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mb-8 border border-error/20">
                            <span className="material-symbols-outlined text-3xl">public_off</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-on-surface leading-tight tracking-tight">
                            500 Million Indians remain offline.
                        </h2>
                        <p className="text-lg text-on-surface-variant font-medium leading-relaxed">
                            While the world builds graphical apps, half a billion people in rural India still rely on basic feature phones and voice networks. JanVani bridges this digital chasm by bringing state-of-the-art LLMs directly to traditional phone lines.
                        </p>
                        <div className="pt-8 mt-4 border-t border-outline-variant/20 flex gap-12">
                            <div>
                                <p className="text-5xl font-black text-on-surface">15%</p>
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-2">Internet Pen. in Rural</p>
                            </div>
                            <div>
                                <p className="text-5xl font-black text-primary">85%</p>
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-2">Mobile Voice Reach</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Admin Dashboard Mockup */}
                    <div className="lg:w-1/2 w-full">
                        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-6 shadow-2xl relative group hover:border-primary/30 transition-all duration-500">
                            <div className="absolute top-0 right-10 -translate-y-1/2 bg-surface border border-outline-variant/20 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 group-hover:-translate-y-3/4 transition-transform duration-500">
                                <span className="material-symbols-outlined text-primary text-sm">security</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Platform Infrastructure</span>
                            </div>
                            {/* Faux Dashboard */}
                            <div className="space-y-4 pt-4">
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-surface border border-outline-variant/20 rounded-xl p-5 shadow-sm">
                                        <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-black mb-2">Active Calls</p>
                                        <div className="flex items-end gap-2"><p className="text-3xl font-black tracking-tighter">1,402</p><span className="text-emerald-500 material-symbols-outlined text-sm mb-1 bg-emerald-500/10 p-1 rounded-full">trending_up</span></div>
                                    </div>
                                    <div className="flex-1 bg-surface border border-outline-variant/20 rounded-xl p-5 shadow-sm">
                                        <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-black mb-2">P95 Latency</p>
                                        <div className="flex items-end gap-2"><p className="text-3xl font-black tracking-tighter">1.12s</p></div>
                                    </div>
                                </div>
                                <div className="h-40 bg-surface border border-outline-variant/20 rounded-xl p-5 flex items-end justify-between gap-2 shadow-inner">
                                    {[...Array(14)].map((_,i) => (
                                        <div key={i} className="flex-1 bg-primary/20 rounded-t-md hover:bg-primary transition-colors cursor-pointer relative group/bar" style={{ height: `${Math.random()*80+20}%`}}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-outline-variant/30 text-[9px] font-bold px-2 py-1 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity shadow-lg">Data</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Flow of Knowledge */}
            <section id="platform" className="py-24 px-6 lg:px-20 bg-surface-container-lowest relative overflow-hidden">
                <div className="max-w-7xl mx-auto text-center mb-20 relative z-10">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">Architecture</span>
                    <h2 className="text-4xl md:text-5xl font-black text-on-surface mb-6 tracking-tight">The Flow of Intelligence</h2>
                    <p className="text-lg text-on-surface-variant max-w-2xl mx-auto font-medium">From an analog phone call to an intelligent, localized response in under two seconds.</p>
                </div>
                
                <div className="max-w-6xl mx-auto relative">
                    {/* Connection Line */}
                    <div className="hidden md:block absolute top-[40%] left-[10%] w-[80%] h-0.5 bg-gradient-to-r from-outline-variant/10 via-primary/50 to-outline-variant/10 -translate-y-1/2 z-0">
                        <div className="absolute top-1/2 left-0 w-1/4 h-1.5 bg-primary rounded-full -translate-y-1/2 blur-[2px] animate-[shimmer_3s_infinite]"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        {/* Step 1 */}
                        <div className="bg-surface border border-outline-variant/20 p-8 rounded-3xl hover:border-primary/40 hover:shadow-xl transition-all group flex flex-col items-center text-center">
                            <div className="size-20 rounded-full bg-surface-container-highest border-4 border-surface shadow-lg flex items-center justify-center text-on-surface mb-8 group-hover:scale-110 transition-transform relative">
                                <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-0 group-hover:opacity-100"></div>
                                <span className="material-symbols-outlined text-3xl text-on-surface">phone_in_talk</span>
                            </div>
                            <h4 className="text-xl font-black mb-3">1. Analog Ingestion</h4>
                            <p className="text-sm font-medium text-on-surface-variant leading-relaxed">User dials a toll-free number from any feature phone. The voice stream is instantly digitized and routed to our edge nodes.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-surface border border-outline-variant/20 p-8 rounded-3xl hover:border-primary/40 hover:shadow-xl transition-all group flex flex-col items-center text-center relative md:-top-10">
                            <div className="size-20 rounded-full bg-primary border-4 border-surface shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">model_training</span>
                            </div>
                            <h4 className="text-xl font-black mb-3">2. LLM Processing</h4>
                            <p className="text-sm font-medium text-on-surface-variant leading-relaxed">Proprietary STT models transcribe local dialects. RAG pipelines retrieve context, and an LLM formulates an accurate response.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-surface border border-outline-variant/20 p-8 rounded-3xl hover:border-primary/40 hover:shadow-xl transition-all group flex flex-col items-center text-center">
                            <div className="size-20 rounded-full bg-surface-container-highest border-4 border-surface shadow-lg flex items-center justify-center text-on-surface mb-8 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">record_voice_over</span>
                            </div>
                            <h4 className="text-xl font-black mb-3">3. Native Synthesis</h4>
                            <p className="text-sm font-medium text-on-surface-variant leading-relaxed">The text is rapidly synthesized back into natural-sounding speech in the user's exact regional language and dialect.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Metrics */}
            <section id="impact" className="py-24 px-6 lg:px-20 bg-surface-container-low border-y border-outline-variant/20 relative">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/30 hover:shadow-lg transition-all text-center group cursor-default">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[18px]">call</span></div>
                        <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-3">Platform Uptake</p>
                        <h3 className="text-4xl md:text-5xl font-black text-on-surface mb-2">124k+</h3>
                        <p className="text-xs font-bold text-emerald-600">Active Daily Calls</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/30 hover:shadow-lg transition-all text-center group cursor-default">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[18px]">bolt</span></div>
                        <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-3">System Speed</p>
                        <h3 className="text-4xl md:text-5xl font-black text-primary mb-2">&lt;1.2s</h3>
                        <p className="text-xs font-bold text-on-surface-variant">Round-Trip Latency</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/30 hover:shadow-lg transition-all text-center group cursor-default">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[18px]">map</span></div>
                        <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-3">Reach</p>
                        <h3 className="text-4xl md:text-5xl font-black text-on-surface mb-2">18</h3>
                        <p className="text-xs font-bold text-on-surface-variant">Districts Covered</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/30 hover:shadow-lg transition-all text-center group cursor-default">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[18px]">translate</span></div>
                        <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-3">Inclusion</p>
                        <h3 className="text-4xl md:text-5xl font-black text-secondary mb-2">9</h3>
                        <p className="text-xs font-bold text-on-surface-variant">Regional Languages</p>
                    </div>
                </div>
            </section>

            {/* Voices from the Field (Testimonials) */}
            <section className="py-24 px-6 lg:px-20 bg-surface relative overflow-hidden">
                <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-surface-container-lowest to-transparent pointer-events-none"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-on-surface tracking-tight mb-4">Voices from the Field</h2>
                        <p className="text-lg text-on-surface-variant font-medium">Real impact across rural communities.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative group">
                            <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">volume_up</span>
                            </div>
                            <div className="flex gap-1 mb-8 text-primary">
                                {[...Array(5)].map((_,i) => <span key={i} className="material-symbols-outlined text-[18px]">star</span>)}
                            </div>
                            <p className="text-sm text-on-surface italic leading-relaxed font-medium mb-10 h-24">
                                "I used to travel 20km to ask the market clerk about crop prices. Now I just call JanVani from my old Nokia and I know exactly when to sell my harvest."
                            </p>
                            <div className="flex items-center gap-4 border-t border-outline-variant/20 pt-6">
                                <div className="w-12 h-12 rounded-full bg-surface border border-outline-variant/30 overflow-hidden flex items-center justify-center font-black text-primary text-lg shadow-sm">
                                    R
                                </div>
                                <div>
                                    <p className="text-sm font-black text-on-surface">Rajesh K.</p>
                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">Farmer • Bihar</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative group">
                            <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">volume_up</span>
                            </div>
                            <div className="flex gap-1 mb-8 text-secondary">
                                {[...Array(5)].map((_,i) => <span key={i} className="material-symbols-outlined text-[18px]">star</span>)}
                            </div>
                            <p className="text-sm text-on-surface italic leading-relaxed font-medium mb-10 h-24">
                                "During the monsoon, getting medical advice was impossible. Having this voice assistant helps me triage basic symptoms for my children instantly."
                            </p>
                            <div className="flex items-center gap-4 border-t border-outline-variant/20 pt-6">
                                <div className="w-12 h-12 rounded-full bg-surface border border-outline-variant/30 overflow-hidden flex items-center justify-center font-black text-secondary text-lg shadow-sm">
                                    M
                                </div>
                                <div>
                                    <p className="text-sm font-black text-on-surface">Meena S.</p>
                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">Mother • Odisha</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative group">
                            <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">volume_up</span>
                            </div>
                            <div className="flex gap-1 mb-8 text-primary">
                                {[...Array(5)].map((_,i) => <span key={i} className="material-symbols-outlined text-[18px]">star</span>)}
                            </div>
                            <p className="text-sm text-on-surface italic leading-relaxed font-medium mb-10 h-24">
                                "Understanding government schemes was so difficult. JanVani AI explained the application process in my own language. I finally got my business loan."
                            </p>
                            <div className="flex items-center gap-4 border-t border-outline-variant/20 pt-6">
                                <div className="w-12 h-12 rounded-full bg-surface border border-outline-variant/30 overflow-hidden flex items-center justify-center font-black text-primary text-lg shadow-sm">
                                    A
                                </div>
                                <div>
                                    <p className="text-sm font-black text-on-surface">Anita D.</p>
                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">Entrepreneur • Rajasthan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo Modal */}
            {showDemoModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-surface/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-3xl bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                        
                        <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined">science</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-on-surface tracking-tight">System Simulation</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Live Inference Engine</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDemoModal(false)} className="w-10 h-10 rounded-full bg-surface hover:bg-surface-container border border-outline-variant/20 flex items-center justify-center transition-all">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        <div className="p-8 space-y-8 relative z-10 bg-surface">
                            <div className="flex items-center justify-center gap-2">
                                {DEMO_SCENARIOS.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveScenario(s)}
                                        className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${activeScenario.id === s.id ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-surface border-outline-variant/30 text-on-surface hover:border-primary/50'
                                            }`}
                                    >
                                        {s.language}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/20 shadow-sm">
                                        <p className="text-[9px] uppercase font-black text-on-surface-variant tracking-widest mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">person</span> Simulated User Query ({activeScenario.language})</p>
                                        <p className="text-sm font-bold text-on-surface mb-2">"{activeScenario.query}"</p>
                                        <p className="text-[11px] font-medium text-on-surface-variant italic border-t border-outline-variant/10 pt-2">Translated: "{activeScenario.translation}"</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm relative overflow-hidden">
                                        <div className="absolute left-0 top-0 w-1 h-full bg-primary"></div>
                                        <p className="text-[9px] uppercase font-black text-primary tracking-widest mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">smart_toy</span> AI Response Stream</p>
                                        <p className="text-sm font-medium text-on-surface leading-relaxed">"{activeScenario.response}"</p>
                                    </div>
                                </div>
                                <div className="w-full md:w-56 flex flex-col items-center justify-center gap-6 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 shadow-inner">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-40 scale-[1.5]"></div>
                                        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg relative z-10">
                                            <span className="material-symbols-outlined text-white text-3xl">graphic_eq</span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[10px] font-black text-primary animate-pulse tracking-widest uppercase">Live Synthesis</span>
                                        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">~0.8s Latency</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 flex items-center justify-between">
                                <div>
                                    <h4 className="font-black text-on-surface text-sm mb-1">Access the Full Platform</h4>
                                    <p className="text-xs font-medium text-on-surface-variant max-w-sm">Monitor live calls, inspect telemetry, and manage knowledge.</p>
                                </div>
                                <button onClick={launchDemo} className="px-6 py-3 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-md">
                                    Enter Demo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-surface-container-lowest border-t border-outline-variant/20 pt-16 pb-8 px-6 lg:px-20 relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-2xl">record_voice_over</span>
                            <span className="text-2xl font-black tracking-tight text-on-surface uppercase">JanVani AI</span>
                        </div>
                        <p className="text-sm font-medium text-on-surface-variant max-w-sm leading-relaxed">
                            Bringing the intelligence of large language models to the half billion Indians who rely on voice-first communication.
                        </p>
                        <div className="flex gap-3">
                            {['public', 'language', 'mail'].map(icon => (
                                <div key={icon} className="w-10 h-10 rounded-xl bg-surface border border-outline-variant/30 flex items-center justify-center hover:border-primary hover:text-primary transition-all cursor-pointer shadow-sm">
                                    <span className="material-symbols-outlined text-sm">{icon}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-on-surface mb-6">Platform</h4>
                        <div className="flex flex-col gap-4 text-sm font-medium text-on-surface-variant">
                            <Link to="/portal" className="hover:text-primary transition-colors">User Portal</Link>
                            <Link to="/login" className="hover:text-primary transition-colors">Admin Console</Link>
                            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
                            <a href="#" className="hover:text-primary transition-colors">API Access</a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-on-surface mb-6">Company</h4>
                        <div className="flex flex-col gap-4 text-sm font-medium text-on-surface-variant">
                            <a href="#" className="hover:text-primary transition-colors">About Us</a>
                            <a href="#" className="hover:text-primary transition-colors">Impact Report</a>
                            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    <p>© 2024 JanVani Intelligence Systems. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        All Systems Operational
                    </div>
                </div>
            </footer>
        </div>
    );
}
