<<<<<<< HEAD
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sttService = void 0;
const logger_1 = require("../config/logger");
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
    'en-IN', // English (India)
    'hi-IN', // Hindi
    'ta-IN', // Tamil
    'te-IN', // Telugu
    'kn-IN', // Kannada
    'ml-IN', // Malayalam
    'bn-IN', // Bengali
    'mr-IN', // Marathi
];
class STTService {
    constructor() {
        this.speechKey = process.env.DEEPGRAM_API_KEY || '';
        this.speechRegion = ''; // Not used by deepgram
    }
    /**
     * Create a real-time STT recognizer bound to a CallSession.
     *
     * When Deepgram SDK is available:
     *   - Creates a WebSocket connection to feed PCM from ACS
     *   - Configures language detection
     *
     * Returns a controller object with methods to push audio and stop.
     */
    createRecognizer(session, onRecognized, onSpeechStart) {
        if (!this.speechKey) {
            logger_1.logger.warn('[STT] Deepgram API key not configured — using mock recognizer');
            return new MockSTTController(session, onRecognized, onSpeechStart);
        }
        return new DeepgramSTTController(this.speechKey, session, onRecognized, onSpeechStart);
    }
}
/**
 * Production Deepgram STT controller.
 * Uses the @deepgram/sdk package (v5 syntax).
 */
class DeepgramSTTController {
    constructor(apiKey, session, onRecognized, onSpeechStart) {
        this.dgConnection = null;
        this.isReady = false;
        this.currentTranscript = '';
        this.silenceTimer = null;
        this.SILENCE_TIMEOUT = 3000;
        this.audioQueue = [];
        this.session = session;
        this.initialize(apiKey, onRecognized, onSpeechStart);
    }
    async initialize(apiKey, onRecognized, onSpeechStart) {
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
                logger_1.logger.info(`[STT] Deepgram connection opened for session ${this.session.sessionId}`);
                this.isReady = true;
                // Flush queued audio
                while (this.audioQueue.length > 0) {
                    const buf = this.audioQueue.shift();
                    if (buf)
                        this.dgConnection.send(buf);
                }
            });
            // v5 uses 'message' event for all data
            this.dgConnection.on('message', (data) => {
                if (data.type !== 'Results')
                    return;
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
                if (this.silenceTimer)
                    clearTimeout(this.silenceTimer);
                // Deepgram endpointing fires speech_final 
                if (speechFinal && this.currentTranscript.trim()) {
                    this.finalizeUtterance(onRecognized, data);
                }
                else if (this.currentTranscript.trim()) {
                    // Start absolute silence timer for fallback in case speech_final gets delayed
                    this.silenceTimer = setTimeout(() => {
                        this.finalizeUtterance(onRecognized, data);
                    }, this.SILENCE_TIMEOUT);
                }
            });
            this.dgConnection.on('error', (err) => {
                logger_1.logger.error('[STT] Deepgram connection error', err);
            });
            this.dgConnection.on('close', () => {
                logger_1.logger.info(`[STT] Deepgram connection closed for session ${this.session.sessionId}`);
                this.isReady = false;
            });
            // Trigger the actual connection
            this.dgConnection.connect();
            await this.dgConnection.waitForOpen();
        }
        catch (error) {
            logger_1.logger.error('[STT] Failed to initialize Deepgram SDK', error);
            this.dgConnection = null;
        }
    }
    finalizeUtterance(onRecognized, lastData) {
        if (!this.currentTranscript.trim())
            return;
        const langArray = lastData?.channel?.alternatives?.[0]?.languages;
        const detectedLang = langArray?.[0]?.language || this.session.language;
        onRecognized({
            text: this.currentTranscript.trim(),
            language: detectedLang,
            confidence: lastData?.channel?.alternatives?.[0]?.confidence || 0.9,
        });
        this.currentTranscript = '';
        if (this.silenceTimer)
            clearTimeout(this.silenceTimer);
    }
    pushAudio(pcmBuffer) {
        if (this.isReady && this.dgConnection) {
            this.dgConnection.send(pcmBuffer);
        }
        else {
            // Buffer audio until connection is ready
            this.audioQueue.push(pcmBuffer);
            if (this.audioQueue.length > 100) {
                this.audioQueue.shift(); // Prevent memory leak
            }
        }
    }
    async stop() {
        if (this.silenceTimer)
            clearTimeout(this.silenceTimer);
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
class MockSTTController {
    constructor(session, onRecognized, onSpeechStart) {
        this.packetCount = 0;
        this.silenceTimer = null;
        this.speechStarted = false;
        this.mockResponses = [
            { text: 'What is photosynthesis?', language: 'en-IN' },
            { text: 'Pradhan Mantri Awas Yojana ke baare mein batao', language: 'hi-IN' },
            { text: 'Newton\'s third law explain karo', language: 'hi-IN' },
            { text: 'Solar system mein kitne planets hain?', language: 'en-IN' },
            { text: 'Pani ka cycle kya hota hai?', language: 'hi-IN' },
        ];
        this.responseIndex = 0;
        this.session = session;
        this.onRecognized = onRecognized;
        this.onSpeechStart = onSpeechStart;
    }
    pushAudio(pcmBuffer) {
        this.packetCount++;
        // Simulate "speech start" after first few packets
        if (this.packetCount === 3 && !this.speechStarted && this.onSpeechStart) {
            this.speechStarted = true;
            this.onSpeechStart();
        }
        // Reset silence timer on every packet
        if (this.silenceTimer)
            clearTimeout(this.silenceTimer);
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
    async stop() {
        if (this.silenceTimer)
            clearTimeout(this.silenceTimer);
        this.packetCount = 0;
    }
}
exports.sttService = new STTService();
=======
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sttService = void 0;
const logger_1 = require("../config/logger");
const config_1 = require("../config");
/**
 * Phase 2 — Checkpoint 3: Real-Time STT & Language Identification
 *
 * Azure AI Speech SDK integration for:
 * 1. Real-time Speech-to-Text using PushAudioInputStream
 * 2. Automatic Language Identification for 8 Indian languages
 * 3. Event-driven endpointing (silence detection → trigger pipeline)
 *
 * ARCHITECTURE:
 * - Uses PushAudioInputStream so we can feed raw PCM bytes from ACS WebSocket
 * - AutoDetectSourceLanguageConfig dynamically switches the STT model
 * - "recognized" event fires when user finishes speaking (endpointing)
 *
 * Falls back to mock STT when Azure Speech credentials are not configured.
 */
// Supported Indian languages for AutoDetect Language ID
const SUPPORTED_LANGUAGES = [
    'en-IN', // English (India)
    'hi-IN', // Hindi
    'ta-IN', // Tamil
    'te-IN', // Telugu
    'kn-IN', // Kannada
    'ml-IN', // Malayalam
    'bn-IN', // Bengali
    'mr-IN', // Marathi
];
class STTService {
    constructor() {
        this.speechKey = config_1.config.speech?.key || '';
        this.speechRegion = config_1.config.speech?.region || '';
    }
    /**
     * Create a real-time STT recognizer bound to a CallSession.
     *
     * When Azure Speech SDK is available:
     *   - Creates a PushAudioInputStream for feeding PCM from ACS
     *   - Configures AutoDetectSourceLanguage for all 8 languages
     *   - Attaches "recognizing" (interim) and "recognized" (final) events
     *
     * Returns a controller object with methods to push audio and stop.
     */
    createRecognizer(session, onRecognized, onSpeechStart) {
        if (!this.speechKey || !this.speechRegion) {
            logger_1.logger.warn('[STT] Azure Speech not configured — using mock recognizer');
            return new MockSTTController(session, onRecognized, onSpeechStart);
        }
        return new AzureSTTController(this.speechKey, this.speechRegion, session, onRecognized, onSpeechStart);
    }
}
/**
 * Production Azure Speech SDK controller.
 * Uses the microsoft-cognitiveservices-speech-sdk package.
 */
class AzureSTTController {
    constructor(speechKey, speechRegion, session, onRecognized, onSpeechStart) {
        this.audioStream = null;
        this.recognizer = null;
        this.session = session;
        try {
            // Dynamic import to avoid crash if SDK not installed
            const sdk = require('microsoft-cognitiveservices-speech-sdk');
            // Create push stream for feeding PCM audio
            const format = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
            this.audioStream = sdk.AudioInputStream.createPushStream(format);
            const audioConfig = sdk.AudioConfig.fromStreamInput(this.audioStream);
            const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
            speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_LanguageIdMode, 'Continuous');
            // Auto-detect from all 8 supported Indian languages
            const autoDetectConfig = sdk.AutoDetectSourceLanguageConfig.fromLanguages(SUPPORTED_LANGUAGES);
            this.recognizer = sdk.SpeechRecognizer.FromConfig(speechConfig, autoDetectConfig, audioConfig);
            // ── Event: Interim results (user is speaking) ──
            this.recognizer.recognizing = (_sender, event) => {
                if (event.result.text && onSpeechStart) {
                    onSpeechStart();
                }
            };
            // ── Event: Final result (endpointing — user stopped speaking) ──
            this.recognizer.recognized = (_sender, event) => {
                const result = event.result;
                if (result.reason === sdk.ResultReason.RecognizedSpeech && result.text) {
                    const langResult = sdk.AutoDetectSourceLanguageResult.fromResult(result);
                    const detectedLang = langResult?.language || session.language;
                    onRecognized({
                        text: result.text,
                        language: detectedLang,
                        confidence: result.properties?.getProperty('SpeechServiceResponse_JsonResult')
                            ? 0.9 : 0.8,
                    });
                }
            };
            // Start continuous recognition
            this.recognizer.startContinuousRecognitionAsync(() => logger_1.logger.info(`[STT] Started continuous recognition for session ${session.sessionId}`), (err) => logger_1.logger.error('[STT] Failed to start recognition', err));
        }
        catch (error) {
            logger_1.logger.error('[STT] Failed to initialize Azure Speech SDK', error);
            // Degrade to a no-op controller
            this.recognizer = null;
        }
    }
    pushAudio(pcmBuffer) {
        if (this.audioStream) {
            // Feed raw PCM bytes directly to the push stream
            // ACS sends 16kHz, 16-bit, mono PCM — exactly what Speech SDK expects
            this.audioStream.write(pcmBuffer.buffer.slice(pcmBuffer.byteOffset, pcmBuffer.byteOffset + pcmBuffer.byteLength));
        }
    }
    async stop() {
        return new Promise((resolve) => {
            if (this.recognizer) {
                this.recognizer.stopContinuousRecognitionAsync(() => {
                    this.audioStream?.close();
                    this.recognizer?.close();
                    this.recognizer = null;
                    this.audioStream = null;
                    resolve();
                }, (err) => {
                    logger_1.logger.error('[STT] Error stopping recognition', err);
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
}
/**
 * Mock STT controller for local development.
 *
 * Simulates endpointing by detecting silence (no audio for 2 seconds after
 * receiving at least 50 packets). Returns pre-defined responses that match
 * the curriculum/scheme context.
 */
class MockSTTController {
    constructor(session, onRecognized, onSpeechStart) {
        this.packetCount = 0;
        this.silenceTimer = null;
        this.speechStarted = false;
        this.mockResponses = [
            { text: 'What is photosynthesis?', language: 'en-IN' },
            { text: 'Pradhan Mantri Awas Yojana ke baare mein batao', language: 'hi-IN' },
            { text: 'Newton\'s third law explain karo', language: 'hi-IN' },
            { text: 'Solar system mein kitne planets hain?', language: 'en-IN' },
            { text: 'Pani ka cycle kya hota hai?', language: 'hi-IN' },
        ];
        this.responseIndex = 0;
        this.session = session;
        this.onRecognized = onRecognized;
        this.onSpeechStart = onSpeechStart;
    }
    pushAudio(pcmBuffer) {
        this.packetCount++;
        // Simulate "speech start" after first few packets
        if (this.packetCount === 3 && !this.speechStarted && this.onSpeechStart) {
            this.speechStarted = true;
            this.onSpeechStart();
        }
        // Reset silence timer on every packet
        if (this.silenceTimer)
            clearTimeout(this.silenceTimer);
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
    async stop() {
        if (this.silenceTimer)
            clearTimeout(this.silenceTimer);
        this.packetCount = 0;
    }
}
exports.sttService = new STTService();
>>>>>>> pr-3
//# sourceMappingURL=sttService.js.map