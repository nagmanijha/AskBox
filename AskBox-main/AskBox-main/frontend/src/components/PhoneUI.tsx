import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PhoneUI({ autoStartMode, isWidget }: { autoStartMode?: 'form' | 'standard', isWidget?: boolean }) {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');
    const [aiText, setAiText] = useState('');
    const [textInput, setTextInput] = useState('');
    const [language, setLanguage] = useState<'en-IN' | 'hi-IN' | 'te-IN' | 'mr-IN'>('en-IN');
    const [isFormMode, setIsFormMode] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({
        name: '', age: '', gender: '', location: '', occupation: ''
    });
    const [showModeSelection, setShowModeSelection] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

    // Playback queue reference to ensure smooth contiguous audio
    const nextPlayTimeRef = useRef<number>(0);

    const startCall = async (mode: boolean = false) => {
        if (wsRef.current) return;
        setStatus('connecting');
        setAiText('');
        setIsFormMode(mode);
        setShowModeSelection(false);
        setFormData({ name: '', age: '', gender: '', location: '', occupation: '' });
        nextPlayTimeRef.current = 0;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
            });
            mediaStreamRef.current = stream;

            const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            // Use current host to hit the Vite proxy, allowing it to work on IP/Tunnels
            const wsHost = import.meta.env.VITE_WS_URL || window.location.host;
            const url = `${proto}//${wsHost}/acs-audio?callId=demo-phone-ui-${Date.now()}&lang=${language}`;
            
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                setStatus('listening');

                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                audioContextRef.current = audioCtx;
                nextPlayTimeRef.current = audioCtx.currentTime;

                if (isFormMode) {
                    ws.send(JSON.stringify({ kind: 'SetFormMode', enabled: true }));
                }

                const source = audioCtx.createMediaStreamSource(stream);
                const processor = audioCtx.createScriptProcessor(4096, 1, 1);
                scriptProcessorRef.current = processor;

                processor.onaudioprocess = (e) => {
                    if (ws.readyState !== WebSocket.OPEN) return;
                    const float32Audio = e.inputBuffer.getChannelData(0);
                    const int16Audio = new Int16Array(float32Audio.length);
                    for (let i = 0; i < float32Audio.length; i++) {
                        let s = Math.max(-1, Math.min(1, float32Audio[i]));
                        int16Audio[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    }
                    const uint8Audio = new Uint8Array(int16Audio.buffer);
                    let binary = '';
                    for (let i = 0; i < uint8Audio.length; i++) binary += String.fromCharCode(uint8Audio[i]);
                    
                    ws.send(JSON.stringify({
                        kind: 'AudioData',
                        audioData: { data: btoa(binary), encoding: 'base64', sampleRate: 16000, channels: 1 }
                    }));
                };

                source.connect(processor);
                processor.connect(audioCtx.destination);
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    
                    if (msg.kind === 'AudioData') {
                        setStatus('speaking');
                        playAudioChunk(msg.audioData.data);
                    } else if (msg.kind === 'TextResponse') {
                        if (msg.text.startsWith('FORM_UPDATE:')) {
                            const data = JSON.parse(msg.text.replace('FORM_UPDATE:', ''));
                            setFormData(data);
                        } else {
                            setAiText(msg.text);
                        }
                    }
                } catch (err) {
                    console.error('WebSocket receive error', err);
                }
            };

            ws.onerror = () => stopCall('error');
            ws.onclose = () => stopCall('idle');

        } catch (error) {
            console.error(error);
            stopCall('error');
        }
    };

    // Auto-start logic when navigating from "Voice Apply"
    useEffect(() => {
        if (autoStartMode === 'form' && status === 'idle' && !wsRef.current) {
            setTimeout(() => {
                startCall(true); // Automatically jump to form mode
            }, 300); // Tiny delay to allow animation transition to PhoneUI before requesting mic
        }
    }, [autoStartMode]);

    const playAudioChunk = (base64Data: string) => {
        const audioCtx = audioContextRef.current;
        if (!audioCtx) return;

        // Decode Base64
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Convert Little-Endian Int16 PCM to Float32
        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
        }

        // Create buffer and source
        const buffer = audioCtx.createBuffer(1, float32Array.length, 16000);
        buffer.getChannelData(0).set(float32Array);

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);

        // Schedule strict contiguous playback
        if (nextPlayTimeRef.current < audioCtx.currentTime) {
            nextPlayTimeRef.current = audioCtx.currentTime;
        }
        
        source.start(nextPlayTimeRef.current);
        nextPlayTimeRef.current += buffer.duration;

        // Attach listener to flip state back to listening if this was the last queued chunk
        source.onended = () => {
            if (audioCtx.currentTime >= nextPlayTimeRef.current - 0.1) {
                setStatus(prev => prev === 'speaking' ? 'listening' : prev);
            }
        };
    };

    const stopCall = (finalStatus: 'idle' | 'error' = 'idle') => {
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close(1000, 'User ended call');
            wsRef.current = null;
        }
        setStatus(finalStatus);
        setIsFormMode(false);
        setFormData({ name: '', age: '', gender: '', location: '', occupation: '' });
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        if (!textInput.trim()) return;

        wsRef.current.send(JSON.stringify({ kind: 'TextData', text: textInput }));
        setTextInput('');
        setAiText('...'); // Loading indicator
    };

    // Desktop AI Panel Redesign
    const suggestedPrompts = [
        "What are the current market rates?",
        "Check my application status",
        "Explain the latest government scheme",
        "I need help with a local issue"
    ];

    if (isWidget) {
        return (
            <div className="w-full bg-surface border border-outline-variant/30 rounded-2xl shadow-sm flex flex-col relative overflow-hidden">
                {/* Desktop Header */}
                <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[18px]">temp_preferences_custom</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-on-surface tracking-tight leading-none">JanVani Copilot</h3>
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Interactive Voice Engine</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-md border border-outline-variant/20 shadow-sm">
                            <span className={`w-2 h-2 rounded-full ${status === 'listening' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : status === 'speaking' ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">
                                {status === 'idle' ? 'System Ready' : status === 'connecting' ? 'Connecting...' : status === 'listening' ? 'Listening...' : 'Speaking'}
                            </span>
                        </div>
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value as any)}
                            disabled={status !== 'idle' && status !== 'error'}
                            className="bg-surface border border-outline-variant/20 text-on-surface text-xs font-bold rounded-md px-3 py-1.5 outline-none appearance-none cursor-pointer hover:bg-surface-container transition-colors disabled:opacity-50 shadow-sm"
                        >
                            <option value="en-IN">English (India)</option>
                            <option value="hi-IN">Hindi</option>
                            <option value="mr-IN">Marathi</option>
                            <option value="te-IN">Telugu</option>
                            <option value="ta-IN">Tamil</option>
                        </select>
                    </div>
                </div>

                {/* Desktop Body */}
                <div className="flex flex-col md:flex-row bg-surface">
                    
                    {/* Left: Chat / Context Area */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col min-h-[320px] bg-surface-container-lowest/50 relative">
                        {status === 'idle' ? (
                            <div className="flex flex-col justify-center h-full max-w-xl animate-in fade-in duration-500">
                                <h3 className="text-2xl font-black text-on-surface mb-2 tracking-tight">How can I assist you today?</h3>
                                <p className="text-sm font-medium text-on-surface-variant mb-8">Select a quick action below or click the microphone to speak naturally.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {suggestedPrompts.map(p => (
                                        <button key={p} className="text-left p-4 rounded-xl border border-outline-variant/20 hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-bold text-on-surface-variant hover:text-on-surface group flex items-start gap-3 shadow-sm">
                                            <span className="material-symbols-outlined text-[16px] text-primary/50 group-hover:text-primary transition-colors mt-0.5">chat_bubble</span>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {/* Transcript View */}
                                <div className="flex-1 mb-6 flex flex-col gap-6">
                                    {/* User Query Bubble */}
                                    <div className="flex gap-4 items-start flex-row-reverse">
                                        <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center shrink-0 border border-outline-variant/20">
                                            <span className="material-symbols-outlined text-on-surface-variant text-[14px]">person</span>
                                        </div>
                                        <div className="bg-surface border border-outline-variant/20 py-3 px-5 rounded-2xl rounded-tr-sm shadow-sm max-w-[80%]">
                                            <p className="text-sm font-medium text-on-surface">
                                                {status === 'listening' ? 'Listening to your voice...' : 'Processing audio input...'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* AI Response Bubble */}
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-sm">
                                            <span className="material-symbols-outlined text-white text-[14px]">smart_toy</span>
                                        </div>
                                        <div className="bg-primary/10 border border-primary/20 py-3 px-5 rounded-2xl rounded-tl-sm shadow-sm max-w-[80%]">
                                            {isFormMode ? (
                                                <div className="grid grid-cols-2 gap-3 text-xs w-full min-w-[240px]">
                                                    {Object.entries(formData).map(([key, value]) => (
                                                        <div key={key} className="bg-surface/50 p-2 rounded-lg border border-primary/10 flex justify-between items-center">
                                                            <span className="text-[9px] text-primary font-black uppercase tracking-widest">{key}</span>
                                                            <span className={`font-bold ${value ? 'text-on-surface' : 'text-on-surface-variant/50 italic'}`}>{value || 'Pending'}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm font-medium text-on-surface leading-relaxed">
                                                    {aiText ? aiText : "Analyzing context and preparing response..."}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Text Fallback */}
                                <form onSubmit={handleTextSubmit} className="mt-auto flex items-center gap-3">
                                    <input 
                                        type="text" value={textInput} onChange={e => setTextInput(e.target.value)} 
                                        placeholder="Type a manual response..." 
                                        className="flex-1 bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface font-medium focus:outline-none focus:border-primary shadow-inner"
                                    />
                                    <button type="submit" disabled={!textInput.trim()} className="h-[46px] px-6 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-sm">
                                        Send
                                        <span className="material-symbols-outlined text-[16px]">send</span>
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Right: Telemetry & Controls */}
                    <div className="w-full md:w-[280px] border-t md:border-t-0 md:border-l border-outline-variant/10 bg-surface p-6 flex flex-col items-center justify-center shrink-0 relative">
                        
                        <div className="mb-8 flex flex-col items-center">
                            <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">Voice Control</h4>
                            
                            {/* Main Mic Button */}
                            <div className="relative">
                                {(status === 'listening' || status === 'speaking') && (
                                    <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-40 scale-[1.5]"></div>
                                )}
                                {status === 'idle' || status === 'error' ? (
                                    <button onClick={() => setShowModeSelection(true)} className="relative z-10 w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition-transform shadow-[0_8px_24px_rgba(var(--color-primary-rgb),0.3)]">
                                        <span className="material-symbols-outlined text-4xl">mic</span>
                                    </button>
                                ) : (
                                    <button onClick={() => stopCall('idle')} className="relative z-10 w-20 h-20 rounded-full bg-error text-white flex items-center justify-center hover:scale-105 transition-transform shadow-[0_8px_24px_rgba(var(--color-error-rgb),0.3)] group">
                                        <span className="material-symbols-outlined text-4xl group-hover:scale-90 transition-transform">stop</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Visualizer */}
                        <div className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 flex flex-col items-center justify-center h-24 shadow-inner">
                            {status === 'idle' ? (
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Awaiting Input</p>
                            ) : (
                                <div className="flex gap-1 h-full items-center justify-center w-full">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className={`w-1.5 rounded-full transition-all duration-150 ${status === 'listening' ? 'bg-emerald-500 animate-pulse' : 'bg-primary animate-pulse'}`} 
                                             style={{ height: `${Math.random() * 60 + 20}%`, animationDelay: `${i * 100}ms` }}>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Inline Mode Selection Modal */}
                {showModeSelection && (
                    <div className="absolute inset-0 bg-surface/90 backdrop-blur-md flex items-center justify-center z-30 p-6 animate-in fade-in">
                        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-8 shadow-2xl w-full max-w-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            
                            <h4 className="text-lg font-black mb-2 tracking-tight text-on-surface">Interaction Mode</h4>
                            <p className="text-xs font-medium text-on-surface-variant mb-6">Select how you want the AI to handle this session.</p>
                            
                            <div className="space-y-4 mb-8 relative z-10">
                                <button onClick={() => startCall(false)} className="w-full p-4 rounded-xl bg-surface hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 transition-all flex items-center gap-4 group shadow-sm">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                                        <span className="material-symbols-outlined text-[24px]">forum</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-black text-on-surface group-hover:text-primary transition-colors">Standard Conversation</p>
                                        <p className="text-[10px] font-medium text-on-surface-variant mt-0.5">Free-form questions and advice</p>
                                    </div>
                                    <span className="material-symbols-outlined text-on-surface-variant ml-auto opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                                </button>
                                
                                <button onClick={() => startCall(true)} className="w-full p-4 rounded-xl bg-surface hover:bg-surface-container border border-outline-variant/30 hover:border-secondary/50 transition-all flex items-center gap-4 group shadow-sm">
                                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors shadow-sm">
                                        <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-black text-on-surface group-hover:text-secondary transition-colors">Data Collection</p>
                                        <p className="text-[10px] font-medium text-on-surface-variant mt-0.5">Guided form-filling process</p>
                                    </div>
                                    <span className="material-symbols-outlined text-on-surface-variant ml-auto opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                                </button>
                            </div>
                            <button onClick={() => setShowModeSelection(false)} className="text-xs font-black text-on-surface-variant hover:text-on-surface w-full uppercase tracking-widest transition-colors">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[90vh] z-10">
            
            {/* 3D Glassmorphism Phone Frame */}
            <div className="relative w-[340px] h-[720px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl shadow-primary/20 ring-1 ring-white/10 before:absolute before:inset-0 before:rounded-[3rem] before:bg-gradient-to-b before:from-slate-700/50 before:to-slate-900/50">
                
                {/* Hardware details */}
                <div className="absolute top-0 inset-x-0 h-7 flex items-end justify-center z-20">
                    <div className="w-32 h-6 bg-black rounded-b-3xl"></div>
                </div>

                {/* Inner Screen */}
                <div className="relative w-full h-full bg-background-dark rounded-[2.25rem] overflow-hidden flex flex-col">
                    
                    {/* Animated Background */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        <div className={`absolute -top-[20%] -left-[50%] w-[200%] h-[100%] rounded-full opacity-30 blur-[100px] transition-all duration-1000 ${
                            status === 'listening' ? 'bg-primary scale-110 translate-y-20' : 
                            status === 'speaking' ? 'bg-accent-teal scale-125 translate-y-40 animate-pulse' : 
                            'bg-primary/20 scale-100'
                        }`} />
                    </div>

                    {/* App Header */}
                    <div className="relative z-10 px-6 pt-12 pb-4 flex justify-between items-center text-white">
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value as any)}
                            disabled={status !== 'idle' && status !== 'error'}
                            className="bg-white/10 border border-white/20 text-white text-xs rounded-full px-3 py-1 outline-none appearance-none cursor-pointer hover:bg-white/20 transition-colors disabled:opacity-50"
                        >
                            <option value="en-IN" className="text-black">English (India)</option>
                            <option value="hi-IN" className="text-black">Hindi</option>
                            <option value="mr-IN" className="text-black">Marathi</option>
                            <option value="te-IN" className="text-black">Telugu</option>
                            <option value="ta-IN" className="text-black">Tamil</option>
                            <option value="bn-IN" className="text-black">Bengali</option>
                            <option value="gu-IN" className="text-black">Gujarati</option>
                            <option value="kn-IN" className="text-black">Kannada</option>
                        </select>
                        <div className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                        </div>
                    </div>

                    {/* Main UI Area */}
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
                        
                        {/* Dynamic Avatar / Status Ring */}
                        <div className="relative mb-8">
                            {status === 'listening' && (
                                <>
                                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-40 scale-150"></div>
                                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse scale-125"></div>
                                </>
                            )}
                            {status === 'speaking' && (
                                <>
                                    <div className="absolute inset-0 rounded-full border-2 border-accent-teal animate-ping opacity-40 scale-[2.0]"></div>
                                    <div className="absolute inset-0 rounded-full border border-accent-teal animate-ping opacity-20 scale-[2.5]" style={{ animationDelay: '300ms' }}></div>
                                </>
                            )}
                            
                            <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 z-10 relative ${
                                status === 'idle' ? 'bg-slate-800' :
                                status === 'listening' ? 'bg-primary' :
                                status === 'speaking' ? 'bg-accent-teal' :
                                'bg-slate-800'
                            }`}>
                                <span className={`material-symbols-outlined text-6xl ${status === 'idle' ? 'text-slate-500' : 'text-background-dark'}`}>
                                    {status === 'idle' ? 'mic_off' : status === 'listening' ? 'mic' : status === 'speaking' ? 'graphic_eq' : 'error'}
                                </span>
                            </div>
                        </div>

                        {/* Text Status */}
                        <h2 className="text-2xl font-black text-white mb-2 transition-all">
                            {status === 'idle' ? 'Ready to Call' :
                             status === 'connecting' ? 'Connecting...' :
                             status === 'listening' ? 'Listening...' :
                             status === 'speaking' ? 'AI Responding' :
                             'Connection Error'}
                        </h2>

                        {/* AI Subtitle Captions */}
                        <div className="h-24 w-full flex items-center justify-center">
                            <p className="text-base text-slate-300 italic px-2 transition-all line-clamp-3">
                                {aiText ? `"${aiText}"` : (status === 'listening' && (isFormMode ? 'Fill in your details...' : 'Speak your question...'))}
                            </p>
                        </div>

                        {/* Form Progress Display */}
                        {isFormMode && status !== 'idle' && (
                            <div className="w-full mt-4 space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-4">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 text-left">Registration Form</p>
                                {Object.entries(formData).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400 uppercase">{key}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${value ? 'text-accent-teal' : 'text-slate-600 italic'}`}>
                                                {value || 'pending'}
                                            </span>
                                            {value && <span className="material-symbols-outlined text-accent-teal text-xs">check_circle</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bottom Controls */}
                    <div className="relative z-10 p-6 pb-12 w-full flex flex-col gap-6 mt-auto bg-gradient-to-t from-black via-black/80 to-transparent">
                        
                        {/* Action Switcher */}
                        {status === 'idle' || status === 'error' ? (
                            <button 
                                onClick={() => setShowModeSelection(true)}
                                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white mx-auto shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:scale-110 transition-transform"
                            >
                                <span className="material-symbols-outlined text-3xl">call</span>
                            </button>
                        ) : (
                            <button 
                                onClick={() => stopCall('idle')}
                                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white mx-auto shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:scale-110 transition-transform"
                            >
                                <span className="material-symbols-outlined text-3xl">call_end</span>
                            </button>
                        )}
                        
                        {/* Text Input Fallback (only visible during call) */}
                        <form onSubmit={handleTextSubmit} className={`transition-all duration-300 ${status === 'idle' ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                            <div className="relative flex items-center">
                                <input 
                                    type="text" 
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Or type a message..." 
                                    className="w-full bg-white/10 border border-white/20 rounded-full py-3 px-5 pr-12 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <button type="submit" className="absolute right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-background-dark hover:scale-105 transition-transform disabled:opacity-50" disabled={!textInput.trim()}>
                                    <span className="material-symbols-outlined text-sm">send</span>
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

                {/* Mode Selection Overlay */}
                {showModeSelection && (
                    <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                        <div className="w-16 h-1 bg-white/20 rounded-full mb-8"></div>
                        <h3 className="text-xl font-bold text-white mb-2">Select Call Mode</h3>
                        <p className="text-sm text-slate-400 mb-8 px-4">Choose how you'd like to interact with the AI assistant today.</p>
                        
                        <div className="w-full space-y-4">
                            <button 
                                onClick={() => startCall(false)}
                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-4 group"
                            >
                                <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background-dark transition-colors">
                                    <span className="material-symbols-outlined">chat</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white">Standard Query</p>
                                    <p className="text-[10px] text-slate-500">Ask any question or get advice.</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => startCall(true)}
                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-4 group"
                            >
                                <div className="size-10 rounded-xl bg-accent-teal/20 flex items-center justify-center text-accent-teal group-hover:bg-accent-teal group-hover:text-background-dark transition-colors">
                                    <span className="material-symbols-outlined">assignment</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white">Form Filling</p>
                                    <p className="text-[10px] text-slate-500">Register details for programs.</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setShowModeSelection(false)}
                                className="w-full py-4 text-xs font-bold text-slate-500 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
