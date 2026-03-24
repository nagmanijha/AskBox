import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

interface DemoCallTrackerProps {
    scenario?: {
        id: string;
        language: string;
        query: string;
        translation: string;
    };
}

// Extend Window for webkit SpeechRecognition
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}
declare const window: IWindow;

/** Map language codes to BCP-47 tags for SpeechRecognition & SpeechSynthesis */
const LANG_MAP: Record<string, string> = {
    'hi': 'hi-IN', 'en': 'en-IN', 'ta': 'ta-IN', 'te': 'te-IN',
    'kn': 'kn-IN', 'ml': 'ml-IN', 'bn': 'bn-IN', 'mr': 'mr-IN',
    'hi-IN': 'hi-IN', 'en-IN': 'en-IN', 'ta-IN': 'ta-IN', 'te-IN': 'te-IN',
};

export default function DemoCallTracker({ scenario }: DemoCallTrackerProps) {
    const { designSystem } = useTheme();
    const isModern = designSystem === 'modern';

    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'completed' | 'error'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [volume, setVolume] = useState(0);

    const wsRef = useRef<WebSocket | null>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animFrameRef = useRef<number | null>(null);

    const addLog = useCallback((msg: string) => {
        setLogs(prev => [...prev.slice(-49), `${new Date().toLocaleTimeString()} — ${msg}`]);
    }, []);

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    // Cleanup on unmount
    useEffect(() => {
        return () => { stopDemoCall(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** Get the language code for recognition */
    const getLang = () => {
        const id = scenario?.id || 'en';
        return LANG_MAP[id] || 'en-IN';
    };

    /** Start volume meter for visual feedback */
    const startVolumeMeter = (stream: MediaStream) => {
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setVolume(avg / 255);
            animFrameRef.current = requestAnimationFrame(tick);
        };
        tick();
    };

    /** Speak text using the browser's built-in SpeechSynthesis (free TTS) */
    const speakText = (text: string, language: string) => {
        if (!window.speechSynthesis) {
            addLog('⚠️ SpeechSynthesis not supported in this browser');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const langCode = LANG_MAP[language] || language || 'en-IN';
        utterance.lang = langCode;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        // Try to find an Indian voice
        const voices = window.speechSynthesis.getVoices();
        const match = voices.find(v => v.lang === langCode) ||
                      voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
        if (match) utterance.voice = match;

        utterance.onstart = () => {
            setStatus('speaking');
            addLog(`🔊 AI speaking (${langCode})...`);
        };
        utterance.onend = () => {
            setStatus('listening');
            addLog('✅ AI finished speaking. You can ask another question.');
            // Restart recognition for next turn
            startRecognition();
        };
        utterance.onerror = (e) => {
            addLog(`⚠️ TTS error: ${e.error}`);
            setStatus('listening');
            startRecognition();
        };

        window.speechSynthesis.speak(utterance);
    };

    /** Start the browser Speech Recognition */
    const startRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            addLog('❌ SpeechRecognition not supported. Use Chrome or Edge.');
            return;
        }

        // Don't re-create if already running
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch {}
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;      // One utterance at a time
        recognition.interimResults = true;   // Show partial results
        recognition.lang = getLang();
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += t;
                } else {
                    interimTranscript += t;
                }
            }

            if (interimTranscript) {
                setTranscript(interimTranscript);
            }

            if (finalTranscript) {
                setTranscript(finalTranscript);
                addLog(`🎤 You said: "${finalTranscript}"`);
                setStatus('processing');
                addLog('⏳ Sending to AI pipeline...');

                // Send transcript to backend via WebSocket
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                        kind: 'Transcript',
                        text: finalTranscript,
                        language: getLang(),
                    }));
                }
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'no-speech') {
                // Restart silently — user just hasn't spoken yet
                if (status === 'listening') {
                    setTimeout(() => startRecognition(), 300);
                }
                return;
            }
            addLog(`⚠️ Recognition error: ${event.error}`);
        };

        recognition.onend = () => {
            // Auto-restart if we're still in listening mode
            if (status === 'listening' && wsRef.current?.readyState === WebSocket.OPEN) {
                setTimeout(() => startRecognition(), 300);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    /** Main entry: start the demo call */
    const startDemoCall = async () => {
        if (wsRef.current) return;

        setStatus('connecting');
        setLogs([]);
        setTranscript('');
        setAiResponse('');
        setVolume(0);

        addLog(`Initializing ${scenario?.language || 'English'} live voice demo...`);

        // ── Step 1: Get microphone (for volume visualization) ──
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            startVolumeMeter(stream);
            addLog('🎤 Microphone access granted');
        } catch {
            setStatus('error');
            addLog('❌ Microphone access denied. Please allow mic permission.');
            return;
        }

        // ── Step 2: Load voices for SpeechSynthesis ──
        if (window.speechSynthesis) {
            window.speechSynthesis.getVoices(); // trigger lazy load
        }

        // ── Step 3: Connect WebSocket ──
        try {
            const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsHost = import.meta.env.VITE_WS_URL || 'localhost:3001';
            const callId = `demo-live-${Date.now().toString(36)}`;
            const url = `${proto}//${wsHost}/acs-audio?callId=${callId}`;
            addLog(`Connecting to ${url}...`);

            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                setStatus('listening');
                addLog('✅ Connected to AI pipeline');
                addLog('🎤 Speak now — ask any question...');
                startRecognition();
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);

                    if (msg.kind === 'TextResponse' && msg.text) {
                        // ── AI text response → speak it via browser TTS ──
                        setAiResponse(msg.text);
                        addLog(`🤖 AI: "${msg.text.slice(0, 80)}${msg.text.length > 80 ? '...' : ''}"`);

                        // Stop recognition while AI speaks
                        if (recognitionRef.current) {
                            try { recognitionRef.current.stop(); } catch {}
                        }

                        speakText(msg.text, msg.language || 'en-IN');

                    } else if (msg.kind === 'AudioData') {
                        addLog('🔊 Received audio chunk (Azure TTS)');
                    } else if (msg.kind === 'StopAudio') {
                        addLog('⏹️ Playback stop signal');
                    } else {
                        addLog(`📩 ${JSON.stringify(msg).substring(0, 80)}`);
                    }
                } catch {
                    addLog('📩 Received binary data');
                }
            };

            ws.onerror = () => {
                setStatus('error');
                addLog(`❌ WebSocket error! Is backend running?`);
                stopDemoCall();
            };

            ws.onclose = () => {
                if (status !== 'error') setStatus('completed');
                addLog('📞 Disconnected');
            };

            // Auto-stop after 120 seconds
            setTimeout(() => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    addLog('⏱️ Session timeout. Ending call.');
                    stopDemoCall();
                }
            }, 120000);

        } catch {
            setStatus('error');
            addLog('❌ Failed to connect');
        }
    };

    const stopDemoCall = () => {
        // Stop recognition
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch {}
            recognitionRef.current = null;
        }

        // Stop speech
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        // Stop volume meter
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }

        // Stop mic
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
        }

        // Close audio context
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
        }

        // Close WS
        if (wsRef.current) {
            try { wsRef.current.close(1000); } catch {}
            wsRef.current = null;
        }

        setVolume(0);
        setStatus(prev => (prev === 'error' ? 'error' : 'completed'));
    };

    const volumeWidth = Math.min(volume * 200, 100);
    const isActive = status === 'listening' || status === 'processing' || status === 'speaking';

    const statusLabel: Record<string, string> = {
        idle: 'Ready',
        connecting: 'Connecting...',
        listening: '🎤 Listening — speak your question',
        processing: '⏳ AI is thinking...',
        speaking: '🔊 AI is responding...',
        completed: 'Call ended',
        error: 'Error',
    };

    return (
        <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden transition-all duration-300 ${
            isModern ? 'bg-white border-indigo-100 shadow-sm' : 'border-primary/20'
        }`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${isModern ? 'text-indigo-600' : 'text-primary'}`}>campaign</span>
                    <h3 className={`text-xl font-bold ${isModern ? 'text-slate-800' : 'text-slate-100'}`}>Live Voice Demo</h3>
                </div>
                <div className="flex gap-2">
                    {!isActive && status !== 'connecting' ? (
                        <button
                            onClick={startDemoCall}
                            className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${
                                isModern 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg' 
                                : 'bg-primary text-background-dark hover:bg-primary/90'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">mic</span>
                            Start Voice Call
                        </button>
                    ) : (
                        <button
                            onClick={stopDemoCall}
                            className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-2 ${
                                isModern 
                                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                                : 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30'
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">call_end</span>
                            End Call
                        </button>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className={`text-sm font-bold mb-4 px-3 py-2 rounded-lg transition-colors ${
                status === 'listening' ? (isModern ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-green-500/10 text-green-400') :
                status === 'processing' ? (isModern ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-yellow-500/10 text-yellow-400') :
                status === 'speaking' ? (isModern ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-blue-500/10 text-blue-400') :
                status === 'error' ? (isModern ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-red-500/10 text-red-400') :
                (isModern ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-slate-800/50 text-slate-400')
            }`}>
                {statusLabel[status]}
            </div>

            {/* Volume Meter */}
            {isActive && (
                <div className="mb-4">
                    <div className={`h-2 rounded-full overflow-hidden ${isModern ? 'bg-slate-200' : 'bg-slate-800'}`}>
                        <div
                            className={`h-full rounded-full transition-all duration-75 ${
                                status === 'speaking' 
                                ? (isModern ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400') 
                                : (isModern ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-green-500 to-primary')
                            }`}
                            style={{ width: `${volumeWidth}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Transcript & Response */}
            {(transcript || aiResponse) && (
                <div className="mb-4 space-y-2">
                    {transcript && (
                        <div className={`rounded-lg p-3 ${isModern ? 'bg-slate-50 border border-slate-200' : 'bg-primary/5 border border-primary/20'}`}>
                            <p className={`text-[10px] uppercase font-bold mb-1 ${isModern ? 'text-indigo-600' : 'text-primary'}`}>Your Question</p>
                            <p className={`text-sm ${isModern ? 'text-slate-700' : 'text-slate-200'}`}>"{transcript}"</p>
                        </div>
                    )}
                    {aiResponse && (
                        <div className={`rounded-lg p-3 ${isModern ? 'bg-teal-50 border border-teal-100' : 'bg-accent-teal/5 border border-accent-teal/20'}`}>
                            <p className={`text-[10px] uppercase font-bold mb-1 ${isModern ? 'text-teal-700' : 'text-accent-teal'}`}>AI Response</p>
                            <p className={`text-sm ${isModern ? 'text-slate-700' : 'text-slate-200'}`}>{aiResponse.slice(0, 200)}{aiResponse.length > 200 ? '...' : ''}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Log Console */}
            <div className={`p-4 rounded-xl font-mono text-[11px] h-48 overflow-y-auto space-y-2 border ${
                isModern ? 'bg-slate-50 border-slate-200' : 'bg-black/90 border-slate-800'
            }`}>
                {logs.length === 0 ? (
                    <p className={`${isModern ? 'text-slate-400' : 'text-slate-600'} italic`}>Click "Start Voice Call" to begin a live AI conversation...</p>
                ) : (
                    logs.map((log, i) => (
                        <p key={i} className={
                            log.includes('❌') || log.includes('⚠️') ? (isModern ? 'text-red-600' : 'text-red-400') :
                                log.includes('✅') || log.includes('🔊') ? (isModern ? 'text-teal-600' : 'text-accent-teal') :
                                    log.includes('🎤') ? (isModern ? 'text-green-600' : 'text-green-400') :
                                        log.includes('🤖') ? (isModern ? 'text-blue-600' : 'text-blue-400') :
                                            log.includes('⏳') ? (isModern ? 'text-amber-600' : 'text-yellow-400') :
                                                (isModern ? 'text-slate-600' : 'text-slate-300')
                        }>{log}</p>
                    ))
                )}
                <div ref={logsEndRef} />
            </div>

            {isActive && (
                <div className={`absolute top-0 left-0 w-full h-1 ${isModern ? 'bg-indigo-100' : 'bg-primary/20'}`}>
                    <div className={`h-full animate-pulse w-full ${
                        status === 'speaking' ? 'bg-blue-500' :
                        status === 'processing' ? (isModern ? 'bg-amber-500' : 'bg-yellow-500') :
                        'bg-green-500'
                    }`}></div>
                </div>
            )}
        </div>
    );
}
