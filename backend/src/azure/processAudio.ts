import { WebSocket } from 'ws';
import { logger } from '../config/logger';

// ── Service Imports ──
import { CallSession } from './callSession';
import { redisService } from './redisClient';
import { sttService, STTController, STTResult } from './sttService';
import { ragService } from './ragService';
import { llmService } from './llmService';
import { ttsService } from './ttsService';
import { telemetryService } from './telemetryService';

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║            AskBox — Real-Time Voice Pipeline Orchestrator          ║
 * ║                                                                    ║
 * ║  Phase 1: Ingress   → WebSocket init, audio decode, buffering     ║
 * ║  Phase 2: Intellect → STT + Lang ID, RAG retrieval, LLM stream   ║
 * ║  Phase 3: Output    → Semantic TTS chunking, audio playback       ║
 * ║  Phase 4: Teardown  → Graceful disconnect, async Cosmos logging   ║
 * ║                                                                    ║
 * ║  Team Node — Nagmani Jha — AI for Social Good Hackathon          ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export class AudioPipeline {
    private sessions: Map<string, CallSession> = new Map();
    private sttControllers: Map<string, STTController> = new Map();

    constructor() { }

    public handleConnection(ws: WebSocket, req: any) {
        const callId = this.extractCallId(req);
        const url = req.url || '';
        const languageMatch = url.match(/[?&]language=([^&]+)/);
        const detectedLanguage = languageMatch ? languageMatch[1] : 'en-IN';
        
        const session = new CallSession(callId, ws);
        session.language = detectedLanguage; // Set early so Azure STT picks it up
        this.sessions.set(callId, session);

        logger.info(`[Pipeline] New call connected: ${callId} (${detectedLanguage})`);

        const sttController = sttService.createRecognizer(
            session,
            (result: STTResult) => {
                const now = Date.now();
                if (now - session.lastSpeechTimestamp < 2000) {
                    logger.debug(`[Pipeline:${session.sessionId}] Azure STT skipped (already handled by browser)`);
                    return;
                }
                session.lastSpeechTimestamp = now;
                this.onSpeechRecognized(session, result);
            },
            () => this.onSpeechStarted(session)
        );
        this.sttControllers.set(callId, sttController);

        ws.on('message', (data: any, isBinary?: boolean) => {
            try {
                const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
                
                // First byte 123 is '{' in ASCII - high probability it's JSON text
                if (buffer.length > 0 && buffer[0] === 123) {
                    const text = buffer.toString('utf8');
                    logger.debug(`[Pipeline:${callId}] Received JSON msg: ${text}`);
                    const payload = JSON.parse(text);
                    
                    if (payload.kind === 'Transcript' && payload.text) {
                    // DE-DUPLICATION: If Azure STT just triggered (within 2s), ignore browser fallback
                    const now = Date.now();
                    if (now - session.lastSpeechTimestamp < 2000) {
                        logger.info(`[Pipeline:${callId}] Ignoring redundant browser transcript`);
                        return;
                    }
                    session.lastSpeechTimestamp = now;
                    logger.info(`[Pipeline:${callId}] Browser transcript marker: "${payload.text}"`);
                    this.onSpeechRecognized(session, {
                        text: payload.text,
                        language: payload.language || session.language || 'en-IN',
                        confidence: 0.95
                    }).catch(err => logger.error('STT Handle Error', err));
                } else if (payload.kind === 'EndOfStream') {
                        logger.info(`[Pipeline:${callId}] Received EndOfStream marker`);
                        // Optional: trigger manual endpointing or fallback
                    } else if (payload.kind === 'AudioData' && payload.audioData?.data) {
                        const pcmBuffer = Buffer.from(payload.audioData.data, 'base64');
                        sttController.pushAudio(pcmBuffer);
                    } else {
                        logger.warn(`[Pipeline:${callId}] Unknown JSON payload kind: ${payload.kind}`);
                    }
                } else {
                    // It's raw binary PCM
                    if (session.totalAudioBytes === 0) {
                        logger.info(`[Pipeline:${callId}] First incoming PCM audio packet received. Size: ${buffer.length} bytes`);
                    }
                    session.pushAudio(buffer); // track in session
                    sttController.pushAudio(buffer);
                }
            } catch (error) {
                logger.error(`[Pipeline:${callId}] WebSocket Msg Error:`, error);
            }
        });

        ws.on('close', () => this.teardownSession(callId));
        ws.on('error', () => this.teardownSession(callId));
    }

    private onSpeechStarted(session: CallSession): void {
        if (!session.isProcessing) return;
        session.sendStopAudio();
        session.abortCurrentTurn();
        session.endTurn();
    }

    private async onSpeechRecognized(session: CallSession, result: STTResult): Promise<void> {
        if (!result.text || result.text.trim().length === 0) return;
        logger.info(`[Pipeline:${session.sessionId}] STT: "${result.text}"`);
        session.addTurn('user', result.text);
        await this.executeAIWorkflow(session, result.text);
    }

    private async executeAIWorkflow(session: CallSession, userQuery: string): Promise<void> {
        const turnController = session.startNewTurn();
        const signal = turnController.signal;

        try {
            const { messages } = await ragService.retrieveAndAssemble(
                userQuery,
                session.language,
                session.conversationHistory.slice(0, -1)
            );

            if (signal.aborted) return;

            const llmStream = llmService.streamCompletion({
                messages,
                signal,
                temperature: 1,
                maxTokens: 800,
            });

            const chunker = ttsService.createChunker();
            let assistantResponse = '';

            for await (const token of llmStream) {
                if (signal.aborted) break;
                assistantResponse += token;
                const chunk = chunker.addToken(token);
                if (chunk && chunk.trim()) {
                    // Strip Markdown formatting (like **, _, etc.) before sending to TTS
                    const cleanChunk = chunk.replace(/[*_#`]/g, '').trim();
                    if (!cleanChunk) continue; // Skip if it was only markdown

                    const audioBuffer = await ttsService.synthesize(cleanChunk, session.language);
                    if (signal.aborted) break;
                    logger.debug(`[Pipeline:${session.callId}] Sending AudioData chunk: ${audioBuffer.length} bytes`);
                    session.sendAudio(audioBuffer);
                }
            }

            if (!signal.aborted) {
                const remaining = chunker.flush();
                if (remaining && remaining.trim()) {
                    const cleanRemaining = remaining.replace(/[*_#`]/g, '').trim();
                    if (cleanRemaining) {
                        const audioBuffer = await ttsService.synthesize(cleanRemaining, session.language);
                        session.sendAudio(audioBuffer);
                    }
                }
            }

            if (assistantResponse.trim()) {
                session.addTurn('assistant', assistantResponse.trim());
                if (session.isAlive()) {
                    // Send the full text (with Markdown) back to the UI for display
                    session.ws.send(JSON.stringify({
                        kind: 'TextResponse',
                        text: assistantResponse.trim(),
                        language: session.language,
                    }));
                }
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') logger.error(`AI Error`, error);
        } finally {
            session.endTurn();
        }
    }

    private async teardownSession(callId: string): Promise<void> {
        const session = this.sessions.get(callId);
        if (!session) return;
        const sttController = this.sttControllers.get(callId);
        if (sttController) await sttController.stop();
        session.destroy();
        this.sessions.delete(callId);
        this.sttControllers.delete(callId);
    }

    private extractCallId(req: any): string {
        const url = req.url || '';
        const queryMatch = url.match(/[?&]callId=([^&]+)/);
        if (queryMatch) return queryMatch[1];
        return `call_${Date.now()}`;
    }

    public getActiveSessionCount(): number {
        return this.sessions.size;
    }
}

export const audioPipeline = new AudioPipeline();
