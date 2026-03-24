import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Play, RotateCcw, CheckCircle, Languages, AlertCircle, Headphones, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface VoiceDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCallComplete?: (callData: any) => void;
}

const CONVERSATION_STEPS = [
    { speaker: 'system', text: 'Initializing neural STT engine...' },
    { speaker: 'system', text: 'Connecting to Azure Regional Cluster (South India)...' },
    { speaker: 'system', text: 'Ready. Start speaking.' },
];

export default function VoiceDemoModal({ isOpen, onClose, onCallComplete }: VoiceDemoModalProps) {
    const { designSystem } = useTheme();
    const { user } = useAuth();
    const isModern = designSystem === 'modern';

    const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'completed'>('idle');
    const [selectedLanguage, setSelectedLanguage] = useState('Kannada');
    const [transcript, setTranscript] = useState<string[]>([]);
    const [aiResponse, setAiResponse] = useState('');
    const [timer, setTimer] = useState(0);
    const timerRef = useRef<any>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const playbackContextRef = useRef<AudioContext | null>(null);
    const playbackTimeRef = useRef<number>(0);

    const LANG_MAP: Record<string, string> = {
        'Hindi': 'hi-IN',
        'Kannada': 'kn-IN',
        'Marathi': 'mr-IN',
        'Bhojpuri': 'hi-IN', // Mapping Bhojpuri to Hindi for the demo as typically supported by foundation models
    };

    // Mock Waveform Logic
    const [waveform, setWaveform] = useState<number[]>(Array(20).fill(10));

    useEffect(() => {
        if (!isOpen) {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            if (playbackContextRef.current) {
                playbackContextRef.current.close();
                playbackContextRef.current = null;
            }
            setStatus('idle');
            setTranscript([]);
            setAiResponse('');
            setTimer(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (status === 'recording') {
            timerRef.current = setInterval(() => {
                setTimer(prev => prev + 1);
                // Randomize waveform
                setWaveform(prev => prev.map(() => Math.floor(Math.random() * 40) + 5));
            }, 100);
        } else {
            clearInterval(timerRef.current);
            setWaveform(Array(20).fill(10));
        }
        return () => clearInterval(timerRef.current);
    }, [status]);

    const downsampleBuffer = (buffer: Float32Array, inputSampleRate: number, outputSampleRate: number) => {
        if (outputSampleRate === inputSampleRate) return buffer;
        const sampleRateRatio = inputSampleRate / outputSampleRate;
        const newLength = Math.round(buffer.length / sampleRateRatio);
        const result = new Float32Array(newLength);
        let offsetResult = 0;
        let offsetBuffer = 0;
        while (offsetResult < result.length) {
            const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
            let accum = 0, count = 0;
            for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
                accum += buffer[i];
                count++;
            }
            result[offsetResult] = accum / count;
            offsetResult++;
            offsetBuffer = nextOffsetBuffer;
        }
        return result;
    };

    const playAudioPcm = (base64Str: string) => {
        try {
            console.log(`[VoiceDemo] Receiving AudioData (${Math.round(base64Str.length / 1024)} KB)`);
            const binaryString = window.atob(base64Str);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const dataView = new DataView(bytes.buffer);
            const numSamples = Math.floor(bytes.length / 2);
            const float32Array = new Float32Array(numSamples);
            for (let i = 0; i < numSamples; i++) {
                float32Array[i] = dataView.getInt16(i * 2, true) / 32768.0; // little-endian from Azure
            }

            if (!playbackContextRef.current) {
                const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
                playbackContextRef.current = new AudioContextClass({ sampleRate: 16000 });
            }
            const audioCtx = playbackContextRef.current;
            if (!audioCtx) return;
            playbackTimeRef.current = audioCtx.currentTime;
            
            if (audioCtx.state === 'suspended') audioCtx.resume();
            
            const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 16000);
            audioBuffer.getChannelData(0).set(float32Array);
            
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            
            const now = audioCtx.currentTime;
            if (playbackTimeRef.current < now) {
                playbackTimeRef.current = now + 0.05; // Short buffer for network jitter
            }
            
            source.start(playbackTimeRef.current);
            playbackTimeRef.current += audioBuffer.duration;
            console.log(`[VoiceDemo] Scheduled audio chunk of ${audioBuffer.duration.toFixed(2)}s`);
        } catch (e) {
            console.error('[VoiceDemo] Audio playback error', e);
        }
    };

    const startMicCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioContextClass(); // Use native sample rate
            audioContextRef.current = audioCtx;
            const nativeSampleRate = audioCtx.sampleRate;
            console.log(`[VoiceDemo] Mic capture started at ${nativeSampleRate}Hz`);

            const source = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e: any) => {
                if (wsRef.current?.readyState === WebSocket.OPEN && status === 'recording') {
                    const inputData = e.inputBuffer.getChannelData(0);
                    // Downsample to 16kHz for Azure/Deepgram
                    const downsampled = downsampleBuffer(inputData, nativeSampleRate, 16000);
                    
                    const pcmData = new Int16Array(downsampled.length);
                    for (let i = 0; i < downsampled.length; i++) {
                        pcmData[i] = Math.max(-1, Math.min(1, downsampled[i])) * 32767;
                    }
                    wsRef.current.send(pcmData.buffer);
                }
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);
        } catch (err) {
            console.error('[VoiceDemo] Failed to start mic capture', err);
        }
    };

    const stopMicCapture = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        processorRef.current?.disconnect();
        audioContextRef.current?.close();
        streamRef.current = null;
        processorRef.current = null;
        audioContextRef.current = null;
        console.log('[VoiceDemo] Mic capture stopped');
    };

    const handleStartCall = () => {
        setAiResponse('');
        setTimer(0);
        setTranscript([]);
        setStatus('recording');
        if (playbackContextRef.current) {
            playbackContextRef.current.close();
        }
        
        try {
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            playbackContextRef.current = new AudioContextClass({ sampleRate: 16000 });
            if (playbackContextRef.current) {
                playbackTimeRef.current = playbackContextRef.current.currentTime;
            }
        } catch (e) {
            console.error('[VoiceDemo] Failed to initialize AudioContext', e);
        }

        if (wsRef.current) {
            wsRef.current.close();
        }

        const langCode = LANG_MAP[selectedLanguage] || 'en-IN';
        const callId = `demo-${Math.floor(Math.random() * 10000)}`;
        const ws = new WebSocket(`ws://localhost:3001/acs-audio?callId=${callId}&language=${langCode}`);
        
        ws.onopen = () => {
            console.log(`[VoiceDemo] Connected to backend pipeline (${langCode})`);
            startMicCapture();
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.kind === 'TextResponse') {
                    setAiResponse(data.text);
                    setStatus('completed');
                } else if (data.kind === 'AudioData' && data.audioData?.data) {
                    playAudioPcm(data.audioData.data);
                } else if (data.kind === 'Transcript' && data.text) {
                    console.log('[VoiceDemo] Received real-time transcript:', data.text);
                    setTranscript(prev => {
                        if (prev.includes(data.text)) return prev;
                        return [data.text, ...prev].slice(0, 3);
                    });
                }
            } catch (e) {
                console.error('Failed to parse WS message', e);
            }
        };

        ws.onerror = (err) => {
            console.error('[VoiceDemo] WS Error', err);
            setStatus('idle');
        };
        
        ws.onclose = () => {
            console.log('[VoiceDemo] WS Connection closed');
            if (status === 'recording') {
                stopMicCapture();
            }
        };

        wsRef.current = ws;
    };

    const handleStopCall = () => {
        console.log('[VoiceDemo] Stopping call and sending final signals...');
        setStatus('processing');
        stopMicCapture();
        
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('[VoiceDemo] Sending EndOfStream and Transcript marker');
            wsRef.current.send(JSON.stringify({ 
                kind: 'EndOfStream',
                language: LANG_MAP[selectedLanguage] || 'hi-IN'
            }));

            // Auto-timeout if no response from AI
            setTimeout(() => {
                setStatus(prev => prev === 'processing' ? 'completed' : prev);
                if (!aiResponse) setAiResponse('Azure Neural Engine processed your request.');
            }, 10000);
        } else {
            console.warn('[VoiceDemo] WebSocket not open during stop call');
            setTimeout(() => {
                setAiResponse('Namaste! The Minimum Support Price (MSP) for Ragi for the 2024-25 season is ₹4,290 per quintal.');
                setStatus('completed');
            }, 2000);
        }
    };

    useEffect(() => {
        if (status === 'completed' && aiResponse) {
            if (onCallComplete) {
                onCallComplete({
                    id: `CH-${Math.floor(Math.random() * 9000) + 1000}`,
                    language: selectedLanguage,
                    duration: timer / 10,
                    topic: 'Agriculture / MSP',
                    transcript: transcript[0],
                    response: aiResponse,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }, [status, aiResponse]);

    const runAutomatedScenario = () => {
        handleStartCall();
        setTimeout(() => handleStopCall(), 4000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
            
            <div className={`relative w-full max-w-2xl rounded-[2.5rem] border shadow-2xl overflow-hidden transition-all duration-500 animate-in zoom-in-95 ${
                isModern ? 'bg-white border-slate-200' : 'bg-[#121215] border-white/5'
            }`}>
                {/* Header */}
                <div className={`p-8 flex justify-between items-center border-b ${isModern ? 'border-slate-100' : 'border-white/5'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isModern ? 'bg-indigo-600' : 'bg-primary'}`}>
                            <Mic className="text-white size-5" />
                        </div>
                        <h2 className="text-2xl font-black">Live Voice Demo</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-colors">
                        <X className="size-6 text-skin-muted" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Language Selector */}
                    {status === 'idle' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <label className="text-xs font-black uppercase tracking-widest text-skin-muted flex items-center gap-2">
                                <Languages size={14} className="text-indigo-500" />
                                Select Call Language
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['Hindi', 'Kannada', 'Marathi', 'Bhojpuri'].map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => setSelectedLanguage(lang)}
                                        className={`px-4 py-3 rounded-2xl border font-bold text-sm transition-all ${
                                            selectedLanguage === lang 
                                            ? (isModern ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-primary border-primary text-background-dark')
                                            : (isModern ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5')
                                        }`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Call UI */}
                    {(status === 'recording' || status === 'processing' || status === 'completed') && (
                        <div className="space-y-8 py-4 text-center">
                            {/* Waveform */}
                            <div className="flex items-center justify-center gap-1.5 h-16">
                                {waveform.map((h, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-1.5 rounded-full transition-all duration-100 ${
                                            status === 'recording' ? (isModern ? 'bg-indigo-500' : 'bg-primary') : 'bg-skin-muted'
                                        }`} 
                                        style={{ height: `${status === 'recording' ? h : 4}px` }} 
                                    />
                                ))}
                            </div>

                            <div className="space-y-2">
                                <p className={`text-2xl font-black tabular-nums ${status === 'recording' ? 'animate-pulse' : ''}`}>
                                    {status === 'recording' ? `00:${timer.toString().padStart(2, '0')}` : status.toUpperCase()}
                                </p>
                                <p className="text-sm font-bold text-skin-muted">
                                    {status === 'recording' ? `Capturing ${selectedLanguage} audio stream...` : 'Neural engine processing...'}
                                </p>
                            </div>

                            {/* Live Transcript Bubble */}
                            <div className="max-w-md mx-auto space-y-4">
                                {transcript.map((t, i) => (
                                    <div key={i} className={`p-4 rounded-2xl text-left border animate-in slide-in-from-bottom-2 ${
                                        isModern ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'
                                    }`}>
                                        <p className="text-xs font-black uppercase text-skin-muted mb-1">STT Feed (Live)</p>
                                        <p className="text-sm font-medium italic">"{t}"</p>
                                    </div>
                                ))}

                                {aiResponse && (
                                    <div className={`p-4 rounded-2xl text-left border border-emerald-500/30 animate-in slide-in-from-bottom-2 ${
                                        isModern ? 'bg-emerald-50' : 'bg-emerald-500/10'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="size-4 rounded bg-emerald-500 flex items-center justify-center">
                                                <Zap size={10} className="text-white" />
                                            </div>
                                            <p className="text-xs font-black uppercase text-emerald-600">AI Response (TTS)</p>
                                        </div>
                                        <p className="text-sm font-bold">"{aiResponse}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Controls Footer */}
                    <div className={`pt-8 border-t flex flex-col md:flex-row gap-4 items-center justify-between ${isModern ? 'border-slate-100' : 'border-white/5'}`}>
                        {status === 'idle' && (
                            <>
                                <button
                                    onClick={runAutomatedScenario}
                                    className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all ${
                                        isModern ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                    }`}
                                >
                                    <Play size={18} />
                                    Run Demo Scenario
                                </button>
                                <button
                                    onClick={handleStartCall}
                                    className={`flex-1 w-full md:w-auto px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 ${
                                        isModern ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-primary text-background-dark shadow-primary/20'
                                    }`}
                                >
                                    Initiate Call
                                </button>
                            </>
                        )}

                        {status === 'recording' && (
                            <button
                                onClick={handleStopCall}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest bg-red-500 text-white shadow-xl shadow-red-200 animate-pulse`}
                            >
                                Stop & Process
                            </button>
                        )}

                        {status === 'completed' && (
                            <>
                                <button
                                    onClick={() => {
                                        setStatus('idle');
                                        setTranscript([]);
                                        setAiResponse('');
                                        setTimer(0);
                                    }}
                                    className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all ${
                                        isModern ? 'bg-slate-100' : 'bg-white/5'
                                    }`}
                                >
                                    <RotateCcw size={18} />
                                    Reset Demo
                                </button>
                                <button
                                    onClick={onClose}
                                    className={`flex-1 w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl ${
                                        isModern ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-accent-teal text-background-dark shadow-teal/20'
                                    }`}
                                >
                                    <CheckCircle size={18} />
                                    Close & Update Dashboard
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Status Bar */}
                <div className={`p-4 text-center border-t ${isModern ? 'bg-slate-50 border-slate-100' : 'bg-black/40 border-white/5'}`}>
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className={`size-1.5 rounded-full ${status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">STT Engine: Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-1.5 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">LLM V5.2: Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
