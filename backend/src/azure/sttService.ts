import { logger } from '../config/logger';
import { config } from '../config';
import { CallSession } from './callSession';
const { DeepgramClient } = require('@deepgram/sdk');

/**
 * Phase 2 — Checkpoint 3: Real-Time STT & Language Identification
 *
 * Deepgram integration for:
 * 1. Real-time Speech-to-Text using Deepgram WebSockets
 * 2. Automatic Language Identification
 * 3. Event-driven endpointing (silence detection → trigger pipeline)
 *
 * ARCHITECTURE:
 * - Uses Deepgram Live API so we can feed raw PCM bytes from ACS WebSocket
 * - Detects language automatically via the `detect_language` param
 * - "SpeechFinal" event fires when user finishes speaking (endpointing)
 *
 * Falls back to mock STT when Deepgram API key is not configured.
 */

// Supported Indian languages for AutoDetect Language ID
const SUPPORTED_LANGUAGES = [
    'en-IN',  // English (India)
    'hi-IN',  // Hindi
    'ta-IN',  // Tamil
    'te-IN',  // Telugu
    'kn-IN',  // Kannada
    'ml-IN',  // Malayalam
    'bn-IN',  // Bengali
    'mr-IN',  // Marathi
];

export interface STTResult {
    text: string;
    language: string;
    confidence: number;
}

export type STTCallback = (result: STTResult) => void;
export type SpeechStartCallback = () => void;

class STTService {
    private speechKey: string;
    private speechRegion: string;

    constructor() {
        this.speechKey = config.speech.key;
        this.speechRegion = config.speech.region;
    }

    /**
     * Create a real-time STT recognizer bound to a CallSession.
     *
     * Prefers Azure AI Speech, falls back to Deepgram if configured,
     * or Mock for local development.
     */
    createRecognizer(
        session: CallSession,
        onRecognized: STTCallback,
        onSpeechStart?: SpeechStartCallback
    ): STTController {
        if (this.speechKey && this.speechRegion) {
            logger.info('[STT] Using Azure Neural STT recognizer');
            return new AzureSTTController(
                this.speechKey,
                this.speechRegion,
                session,
                onRecognized,
                onSpeechStart
            );
        }

        const deepgramKey = process.env.DEEPGRAM_API_KEY;
        if (deepgramKey) {
            logger.info('[STT] Using Deepgram STT recognizer');
            return new DeepgramSTTController(
                deepgramKey,
                session,
                onRecognized,
                onSpeechStart
            );
        }

        logger.warn('[STT] No STT provider configured — using mock recognizer');
        return new MockSTTController(session, onRecognized, onSpeechStart);
    }
}

/**
 * Interface for STT controllers (real and mock).
 */
export interface STTController {
    /** Feed raw PCM audio bytes (16kHz, 16-bit, mono) */
    pushAudio(pcmBuffer: Buffer): void;
    /** Stop the recognizer and release resources */
    stop(): Promise<void>;
}

/**
 * Azure AI Speech STT controller.
 * Uses microsoft-cognitiveservices-speech-sdk.
 */
class AzureSTTController implements STTController {
    private recognizer: any = null;
    private audioStream: any = null;

    constructor(
        apiKey: string,
        region: string,
        session: CallSession,
        onRecognized: STTCallback,
        onSpeechStart?: SpeechStartCallback
    ) {
        try {
            const sdk = require('microsoft-cognitiveservices-speech-sdk');
            
            // 1. Setup Audio Input (Push Stream)
            this.audioStream = sdk.AudioInputStream.createPushStream(
                sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1)
            );
            const audioConfig = sdk.AudioConfig.fromStreamInput(this.audioStream);

            // 2. Setup Speech Config
            const speechConfig = sdk.SpeechConfig.fromSubscription(apiKey, region);
            speechConfig.speechRecognitionLanguage = session.language || 'en-IN';
            // Enable continuous language ID if needed, but for the demo we use the session lang
            
            // 3. Initialize Recognizer
            this.recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

            // 4. Bind Events
            this.recognizer.recognizing = (_s: any, e: any) => {
                if (e.result.text && onSpeechStart) onSpeechStart();
            };

            this.recognizer.recognized = (_s: any, e: any) => {
                if (e.result.reason === sdk.ResultReason.RecognizedSpeech && e.result.text) {
                    onRecognized({
                        text: e.result.text,
                        language: session.language || 'en-IN',
                        confidence: 0.95
                    });
                }
            };

            this.recognizer.canceled = (_s: any, e: any) => {
                logger.warn(`[STT:Azure] Canceled: ${e.reason}`, e.errorDetails);
            };

            // 5. Start continuous recognition
            this.recognizer.startContinuousRecognitionAsync();
            logger.debug(`[STT:Azure] Started continuous recognition for ${session.sessionId}`);

        } catch (error) {
            logger.error('[STT:Azure] Initialization failed', error);
        }
    }

    pushAudio(pcmBuffer: Buffer): void {
        if (this.audioStream) {
            this.audioStream.write(pcmBuffer);
        }
    }

    async stop(): Promise<void> {
        return new Promise((resolve) => {
            if (this.recognizer) {
                this.recognizer.stopContinuousRecognitionAsync(
                    () => {
                        this.recognizer.close();
                        if (this.audioStream) this.audioStream.close();
                        resolve();
                    },
                    (err: any) => {
                        logger.error('[STT:Azure] Error stopping recognizer', err);
                        resolve();
                    }
                );
            } else {
                resolve();
            }
        });
    }
}
/**
 * Production Deepgram STT controller.
 * Uses the @deepgram/sdk package (v5 syntax).
 */
class DeepgramSTTController implements STTController {
    private dgConnection: any = null;
    private session: CallSession;
    private isReady: boolean = false;
    private currentTranscript: string = '';
    private silenceTimer: NodeJS.Timeout | null = null;
    private readonly SILENCE_TIMEOUT = 3000;
    private audioQueue: Buffer[] = [];

    constructor(
        apiKey: string,
        session: CallSession,
        onRecognized: STTCallback,
        onSpeechStart?: (text?: string) => void
    ) {
        this.session = session;
        this.initialize(apiKey, onRecognized, onSpeechStart);
    }

    private async initialize(
        apiKey: string, 
        onRecognized: STTCallback, 
        onSpeechStart?: (text?: string) => void
    ) {
        try {
            const deepgram = new DeepgramClient(apiKey);

            // In v5, connect returns a connection object
            this.dgConnection = await deepgram.listen.v1.connect({
                model: 'nova-2',
                punctuate: true,
                language: 'hi', 
                encoding: 'linear16',
                sample_rate: 16000,
                channels: 1,
                interim_results: true,
            });

            this.dgConnection.on('open', () => {
                logger.info(`[STT] Deepgram connection opened for session ${this.session.sessionId}`);
                this.isReady = true;
                // Flush queued audio
                while (this.audioQueue.length > 0) {
                    const buf = this.audioQueue.shift();
                    if (buf) this.dgConnection.send(buf);
                }
            });

            // v5 uses 'message' event for all data
            this.dgConnection.on('message', (data: any) => {
                if (data.type !== 'Results') return;

                const transcript = data.channel.alternatives[0].transcript;
                const isFinal = data.is_final;
                const speechFinal = data.speech_final;

                if (transcript && onSpeechStart) {
                    onSpeechStart();
                }

                if (isFinal && transcript) {
                    this.currentTranscript += ' ' + transcript;
                }

                // Reset silence timer on every chunk we get
                if (this.silenceTimer) clearTimeout(this.silenceTimer);

                // Deepgram endpointing fires speech_final 
                if (speechFinal && this.currentTranscript.trim()) {
                    this.finalizeUtterance(onRecognized, data);
                } else if (this.currentTranscript.trim()) {
                    // Start absolute silence timer for fallback in case speech_final gets delayed
                    this.silenceTimer = setTimeout(() => {
                        this.finalizeUtterance(onRecognized, data);
                    }, this.SILENCE_TIMEOUT);
                }
            });

            this.dgConnection.on('error', (err: any) => {
                logger.error('[STT] Deepgram connection error', err);
            });

            this.dgConnection.on('close', () => {
                logger.info(`[STT] Deepgram connection closed for session ${this.session.sessionId}`);
                this.isReady = false;
            });

            // Trigger the actual connection
            this.dgConnection.connect();
            await this.dgConnection.waitForOpen();

        } catch (error) {
            logger.error('[STT] Failed to initialize Deepgram SDK', error);
            this.dgConnection = null;
        }
    }

    private finalizeUtterance(onRecognized: STTCallback, lastData: any) {
        if (!this.currentTranscript.trim()) return;

        const langArray = lastData?.channel?.alternatives?.[0]?.languages;
        const detectedLang = langArray?.[0]?.language || this.session.language;

        onRecognized({
            text: this.currentTranscript.trim(),
            language: detectedLang,
            confidence: lastData?.channel?.alternatives?.[0]?.confidence || 0.9,
        });

        this.currentTranscript = '';
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
    }

    pushAudio(pcmBuffer: Buffer): void {
        if (this.isReady && this.dgConnection) {
            this.dgConnection.send(pcmBuffer);
        } else {
            // Buffer audio until connection is ready
            this.audioQueue.push(pcmBuffer);
            if (this.audioQueue.length > 100) {
                this.audioQueue.shift(); // Prevent memory leak
            }
        }
    }

    async stop(): Promise<void> {
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        this.audioQueue = [];
        
        if (this.dgConnection) {
            this.dgConnection.finish();
            this.dgConnection = null;
        }
        this.isReady = false;
    }
}
/**
 * Mock STT controller for local development.
 *
 * Simulates endpointing by detecting silence (no audio for 2 seconds after
 * receiving at least 50 packets). Returns pre-defined responses that match
 * the curriculum/scheme context.
 */
class MockSTTController implements STTController {
    private session: CallSession;
    private onRecognized: STTCallback;
    private onSpeechStart?: SpeechStartCallback;
    private packetCount: number = 0;
    private silenceTimer: NodeJS.Timeout | null = null;
    private speechStarted: boolean = false;

    private mockResponses: Array<{ text: string; language: string }> = [
        { text: 'What is photosynthesis?', language: 'en-IN' },
        { text: 'Pradhan Mantri Awas Yojana ke baare mein batao', language: 'hi-IN' },
        { text: 'Newton\'s third law explain karo', language: 'hi-IN' },
        { text: 'Solar system mein kitne planets hain?', language: 'en-IN' },
        { text: 'Pani ka cycle kya hota hai?', language: 'hi-IN' },
    ];
    private responseIndex: number = 0;

    constructor(session: CallSession, onRecognized: STTCallback, onSpeechStart?: SpeechStartCallback) {
        this.session = session;
        this.onRecognized = onRecognized;
        this.onSpeechStart = onSpeechStart;
    }

    pushAudio(pcmBuffer: Buffer): void {
        this.packetCount++;

        // Simulate "speech start" after first few packets
        if (this.packetCount === 3 && !this.speechStarted && this.onSpeechStart) {
            this.speechStarted = true;
            this.onSpeechStart();
        }

        // Reset silence timer on every packet
        if (this.silenceTimer) clearTimeout(this.silenceTimer);

        // After enough packets, start a silence timer
        if (this.packetCount > 30) {
            this.silenceTimer = setTimeout(() => {
                // Endpointing — user stopped speaking
                const mock = this.mockResponses[this.responseIndex % this.mockResponses.length];
                this.responseIndex++;
                this.packetCount = 0;
                this.speechStarted = false;

                this.onRecognized({
                    text: mock.text,
                    language: mock.language,
                    confidence: 0.92,
                });
            }, 1500); // 1.5s silence = endpointing
        }
    }

    async stop(): Promise<void> {
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        this.packetCount = 0;
    }
}

export const sttService = new STTService();
