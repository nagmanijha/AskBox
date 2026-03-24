import { WebSocket } from 'ws';
import { logger } from '../config/logger';
import * as fs from 'fs';
import * as path from 'path';
import { wrapPcmToWav } from './wavHelper';
import { v4 as uuidv4 } from 'uuid';

// ── Service Imports ──
import { CallSession, ConversationTurn } from './callSession';
import { redisService } from './redisClient';
import { sttService, STTController, STTResult } from './sttService';
import { ragService } from './ragService';
import { llmService } from './llmService';
import { ttsService } from './ttsService';
import { telemetryService } from './telemetryService';
import { eventBus } from '../shared/eventBus';
import { llmCircuitBreaker } from '../shared/circuitBreaker';
import { guardrailsService } from '../modules/guardrails/guardrailsService';
import { escalationQueue } from '../modules/calls/escalationQueue';
import { tracer, TraceContext } from '../shared/observability';
import { semanticCache } from '../modules/knowledge/semanticCache';
import { AsyncQueue } from '../shared/queue';

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
    private activeTraces: Map<string, TraceContext> = new Map();
    
    // Connection pool limits for edge backpressure
    private readonly MAX_CONCURRENT_CALLS = 500;
    private activeCalls = 0;
    private isDraining = false;
    
    // Durable Worker Queue for async tasks like Summarization
    private summaryQueue = new AsyncQueue('PostCallSummarization', async (payload) => {
        await this.generateSummary(payload.callId, payload.session);
    });

    constructor() { }

    public handleConnection(ws: WebSocket, req: any) {
        if (this.isDraining) {
            logger.warn(`[Pipeline] 🚫 Connection rejected: Server is shutting down (Draining)`);
            ws.close(1012, 'Service Restarting (Graceful Shutdown)');
            return;
        }

        if (this.activeCalls >= this.MAX_CONCURRENT_CALLS) {
            logger.warn(`[Pipeline] 🚫 Connection rejected: Max capacity reached (${this.activeCalls}/${this.MAX_CONCURRENT_CALLS})`);
            ws.close(1013, 'Try Again Later (Edge Backpressure)');
            return;
        }
        
        this.activeCalls++;
        const callId = this.extractCallId(req);

        // OTel Tracing
        const trace = tracer.startTrace(`SIP_Call_${callId}`);
        this.activeTraces.set(callId, trace);

        const session = new CallSession(callId, ws);
        this.sessions.set(callId, session);

        const callerPhone = req.headers?.['x-acs-caller'] || 'unknown';

        const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const langParam = urlObj.searchParams.get('lang');
        if (langParam) {
            session.setLanguage(langParam, true);
        }
        session.callerPhoneNumber = callerPhone;

        logger.info(`[Pipeline] ══════ New call connected ══════`);
        logger.info(`[Pipeline] Call ID: ${callId}`);
        logger.info(`[Pipeline] Session ID: ${session.sessionId}`);
        
        eventBus.publish('telephony.call_started', { callId, callerPhone });
        telemetryService.logCallStart(session);

        const sttController = sttService.createRecognizer(
            session,
            (result: STTResult) => this.onSpeechRecognized(session, result),
            () => this.onSpeechStarted(session)
        );
        this.sttControllers.set(callId, sttController);

        ws.on('message', (data: Buffer | string) => {
            try {
                const dataString = Buffer.isBuffer(data) ? data.toString('utf8') : data;

                if (typeof dataString === 'string' && dataString.trim().startsWith('{')) {
                    const payload = JSON.parse(dataString);
                    if (payload.kind === 'AudioData') {
                        const pcmBuffer = Buffer.from(payload.audioData.data, 'base64');
                        session.pushAudio(pcmBuffer);
                        sttController.pushAudio(pcmBuffer);
                    } else if (payload.kind === 'SetFormMode') {
                        session.formMode = payload.enabled;
                        if (session.formMode) {
                            this.executeFormInitialization(session);
                        }
                    } else if (payload.kind === 'TextData' && payload.text) {
                        session.addTurn('user', payload.text);
                        this.executeAIWorkflow(session, payload.text);
                    }
                } else if (Buffer.isBuffer(data)) {
                    session.pushAudio(data);
                    sttController.pushAudio(data);
                }
            } catch (error) {
                logger.error(`[Pipeline] Error decoding audio packet`, { error: (error as Error).message, callId });
            }
        });

        ws.on('close', (code: number, reason: Buffer) => {
            logger.info(`[Pipeline] ══════ Call disconnected ══════ Call ID: ${callId}`);
            eventBus.publish('telephony.call_ended', { callId, code });
            
            const trace = this.activeTraces.get(callId);
            if (trace) {
                tracer.endSpan(trace, `SIP_Call_${callId}`);
                this.activeTraces.delete(callId);
            }
            
            this.teardownSession(callId);
        });

        ws.on('error', (err) => {
            logger.error(`[Pipeline] WebSocket error — Call ID: ${callId}`, err);
            try {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        kind: 'CallTerminated',
                        callTerminated: { reason: 'BackendError', message: err?.message || 'Internal server error' },
                    }));
                }
            } catch (sendErr) { } finally {
                this.teardownSession(callId);
            }
        });

        let lastActivityTime = Date.now();
        const heartbeatInterval = setInterval(() => {
            const silenceMs = Date.now() - lastActivityTime;
            if (silenceMs > 60_000) {
                clearInterval(heartbeatInterval);
                this.teardownSession(callId);
                try { ws.close(1000, 'Timeout'); } catch { }
            }
        }, 15_000);

        ws.on('message', () => { lastActivityTime = Date.now(); });
        ws.on('close', () => { clearInterval(heartbeatInterval); });
    }

    private onSpeechStarted(session: CallSession): void {
        if (!session.isProcessing) return;
        logger.info(`[Pipeline:${session.sessionId}] 🔴 BARGE-IN — User interrupted AI`);
        session.sendStopAudio();
        const controller = session.startNewTurn();
        controller.abort();
        session.endTurn();
    }

    private async onSpeechRecognized(session: CallSession, result: STTResult): Promise<void> {
        if (!result.text || result.text.trim().length === 0) return;

        const trace = this.activeTraces.get(session.callId);
        if (trace) tracer.startChildSpan(trace, 'STT_Processing');

        logger.info(`[Pipeline:${session.sessionId}] 🎤 STT: "${result.text}" [lang=${result.language}, conf=${result.confidence}]`);
        eventBus.publish('audio.stt_done', { callId: session.callId, text: result.text, conf: result.confidence });

        session.setLanguage(result.language);
        session.addTurn('user', result.text);
        redisService.saveSessionState(session.callId, session.conversationHistory).catch(() => { });
        
        if (result.confidence < 0.4 || result.text.toLowerCase().includes('talk to a human')) {
            await escalationQueue.escalate(session.callId, 'Low STT confidence or manual request', session.conversationHistory);
            const fallbackMsg = "I'm transferring you to a human agent now. Please hold.";
            const audioBuffer = await ttsService.synthesize(fallbackMsg, session.language);
            session.sendText(fallbackMsg);
            session.sendAudio(audioBuffer);
            return;
        }
        
        const isInjection = await guardrailsService.checkPromptInjection(result.text);
        if (isInjection) {
            const blockMsg = "I cannot process that request.";
            const audioBuffer = await ttsService.synthesize(blockMsg, session.language);
            session.sendText(blockMsg);
            session.sendAudio(audioBuffer);
            return;
        }

        await this.executeAIWorkflow(session, result.text);
    }

    private async executeAIWorkflow(session: CallSession, userQuery: string): Promise<void> {
        const trace = this.activeTraces.get(session.callId);
        const workflowSpan = trace ? tracer.startChildSpan(trace, 'AI_Workflow_Execution') : undefined;

        const turnStartTime = Date.now();
        const turnController = session.startNewTurn();
        const signal = turnController.signal;

        let sttLatencyMs = 0;
        let ragLatencyMs = 0;
        let ragSource = 'fallback';
        let llmFirstTokenMs = 0;
        let ttfbMs = 0;
        let assistantResponse = '';

        try {
            // ── NEW: Semantic Cache Lookup ──
            if (trace) tracer.startChildSpan(trace, 'Semantic_Cache_Check');
            const cachedResponse = await semanticCache.get(userQuery, trace);
            
            if (cachedResponse) {
                logger.info(`[Pipeline:${session.sessionId}] Serving from Redis Semantic Cache. Bypassing LLM.`);
                assistantResponse = cachedResponse;
                
                // Jump straight to TTS
                const audioBuffer = await ttsService.synthesize(cachedResponse, session.language);
                session.sendText(cachedResponse);
                session.sendAudio(audioBuffer);
                ttfbMs = Date.now() - turnStartTime;
                logger.info(`[Pipeline:${session.sessionId}] ⚡ CACHE TTFB: ${ttfbMs}ms`);
                
                session.addTurn('assistant', assistantResponse);
                if (workflowSpan) tracer.endSpan(workflowSpan, 'AI_Workflow_Execution');
                return;
            }

            const ragStartTime = Date.now();

            const { messages: baseMessages, context, retrievalSource, retrievalLatencyMs: retrievalLatency } =
                await ragService.retrieveAndAssemble(
                    userQuery,
                    session.language,
                    session.conversationHistory.slice(0, -1) // exclude current turn
                );

            ragLatencyMs = retrievalLatency;
            ragSource = retrievalSource;
            sttLatencyMs = ragStartTime - turnStartTime;
            eventBus.publish('ai.rag_complete', { callId: session.callId, source: ragSource, latency: ragLatencyMs });

            let messages = baseMessages;

            // ── NEW: Form Pre-processing (Instant Extraction) ──
            if (session.formMode) {
                try {
                    const extracted = await this.extractFormDataFromUtterance(userQuery, session);
                    if (extracted && Object.keys(extracted).length > 0) {
                        session.formData = { ...session.formData, ...extracted };
                        session.sendText(`FORM_UPDATE:${JSON.stringify(session.formData)}`);
                        logger.info(`[Pipeline:${session.sessionId}] 📥 Pre-extracted form data: ${JSON.stringify(extracted)}`);
                    }
                } catch (err) {
                    logger.error(`[Pipeline:${session.sessionId}] Form extraction error`, err);
                }
            }

            // Specialized Form Filling Logic
            if (session.formMode) {
                const missingFields = Object.entries(session.formData)
                    .filter(([_, val]) => !val)
                    .map(([key, _]) => key);

                const formStatusDescription = Object.entries(session.formData)
                    .map(([key, val]) => `- ${key}: ${val || 'MISSING'}`)
                    .join('\n');

                const formPrompt = `
You are a STRICTOR FORM FILLER agent. Your ONLY job is to complete the 5-field registration form for the user.
DO NOT answer general questions. DO NOT provide advice. ONLY collect the missing data.

Fields to collect: Name, Age, Gender, Location, Occupation.

CURRENT FORM STATUS:
${formStatusDescription}

SPECIFIC RULES:
1. If there are missing fields, ask the user to provide ALL of them at once (List: [${missingFields.join(', ')}]).
2. If the user provides partial data, acknowledge it and ask for the remaining missing fields.
3. Keep your responses short and focused on completing the form.
4. Once ALL fields are filled, say: "Thank you, your registration is now complete. Have a nice day!"
5. ALWAYS append the update tag <FORM_STATE>{"field": "value", ...}</FORM_STATE> with the full current state at the end.
6. Speak in ${session.language}.
`;
                messages = [
                    { role: 'system', content: formPrompt },
                    ...baseMessages.filter(m => m.role !== 'system') // Remove RAG system prompt entirely
                ];
            }

            // Track schemes accessed for telemetry
            if (context.toLowerCase().includes('pradhan mantri') ||
                context.toLowerCase().includes('yojana') ||
                context.toLowerCase().includes('scheme')) {
                session.metrics.schemesAccessed.push(userQuery.slice(0, 50));
            }

            if (signal.aborted) return; // Barge-in check

            // ── PHASE 2 — CHECKPOINT 6: Asynchronous LLM Streaming ──
            logger.info(`[Pipeline:${session.sessionId}] 🤖 Starting LLM stream (${ragSource} context)...`);
            eventBus.publish('ai.llm_start', { callId: session.callId, status: llmCircuitBreaker.getState() });

            const llmStream = await llmCircuitBreaker.execute(
                async () => {
                    return llmService.streamCompletion({
                        messages,
                        signal,
                        temperature: 0.7,
                        maxTokens: 800,
                    });
                },
                async () => {
                    // Fallback Stream on Circuit Breaker OPEN/DEGRADED
                    async function* fallbackStream() {
                        yield "I am currently experiencing high network latency. ";
                        yield "Please try your request again in a few moments.";
                    }
                    return fallbackStream();
                }
            );

            // ── PHASE 3 — CHECKPOINT 7: Semantic TTS Chunking ──
            const chunker = ttsService.createChunker();
            let firstByteSent = false;
            const llmStartTime = Date.now();
            let fullTurnAudio = Buffer.alloc(0);

            for await (const token of llmStream) {
                if (signal.aborted) {
                    logger.info(`[Pipeline:${session.sessionId}] ⚡ Barge-in — aborting LLM+TTS`);
                    break;
                }

                if (!firstByteSent) {
                    llmFirstTokenMs = Date.now() - llmStartTime;
                }

                assistantResponse += token;

                // Feed token to the semantic chunker
                const rawChunk = chunker.addToken(token);

                if (rawChunk) {
                    // Guardrails: Toxicity / PII Filter
                    const { sanitized } = await guardrailsService.filterToxicity(rawChunk);
                    const chunk = sanitized;

                    session.sendText(chunk);
                    
                    // ── PHASE 3 — CHECKPOINT 8: Audio Stream Playback to ACS ──
                    const audioBuffer = await ttsService.synthesize(chunk, session.language);
                    fullTurnAudio = Buffer.concat([fullTurnAudio, audioBuffer]);

                    if (signal.aborted) break; // Check again after TTS

                    const sent = session.sendAudio(audioBuffer);

                    if (sent && !firstByteSent) {
                        ttfbMs = Date.now() - turnStartTime;
                        firstByteSent = true;
                        logger.info(`[Pipeline:${session.sessionId}] ⚡ TTFB: ${ttfbMs}ms`);
                    }
                }
            }

            // ── Flush remaining text in the chunker ──
            if (!signal.aborted) {
                const remaining = chunker.flush();
                if (remaining) {
                    const { sanitized } = await guardrailsService.filterToxicity(remaining);
                    const audioBuffer = await ttsService.synthesize(sanitized, session.language);
                    fullTurnAudio = Buffer.concat([fullTurnAudio, audioBuffer]);
                    session.sendAudio(audioBuffer);
                }
            }

            // Save the audio to disk
            if (fullTurnAudio.length > 0) {
                try {
                    const outputDir = path.join(process.cwd(), 'output');
                    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
                    const wavBuffer = wrapPcmToWav(fullTurnAudio);
                    const filename = `response_call-${session.callId}_turn-${session.metrics.totalTurns}.wav`;
                    fs.writeFileSync(path.join(outputDir, filename), wavBuffer);
                    logger.info(`[Pipeline:${session.sessionId}] 💾 Saved turn audio to output/${filename}`);
                } catch (err) {
                    logger.error(`[Pipeline:${session.sessionId}] Failed to save WAV output`, err);
                }
            }

            // Add assistant response to conversation history
            if (assistantResponse.trim()) {
                session.addTurn('assistant', assistantResponse.trim());
                // Sync to Redis
                redisService.saveSessionState(session.callId, session.conversationHistory).catch(() => { });
                // Populate Semantic Cache for future identical queries
                semanticCache.set(userQuery, assistantResponse.trim());
            }

            const totalTurnLatencyMs = Date.now() - turnStartTime;
            session.metrics.totalLatencyMs += totalTurnLatencyMs;

            logger.info(`[Pipeline:${session.sessionId}] ✅ Turn complete — total: ${totalTurnLatencyMs}ms, TTFB: ${ttfbMs}ms, RAG: ${ragLatencyMs}ms (${ragSource})`);

            // ── PHASE 4 — CHECKPOINT 10: Non-blocking telemetry ──
            telemetryService.logTurnComplete(session, {
                turnNumber: session.metrics.totalTurns,
                userQuery,
                language: session.language,
                sttLatencyMs,
                ragLatencyMs,
                ragSource,
                llmFirstTokenMs,
                ttfbMs,
                totalTurnLatencyMs,
                assistantResponse: assistantResponse.slice(0, 200), // Truncate for storage
            });

            if (workflowSpan) tracer.endSpan(workflowSpan, 'AI_Workflow_Execution');

        } catch (error: any) {
            if (error.name === 'AbortError' || signal.aborted) {
                logger.info(`[Pipeline:${session.sessionId}] Turn aborted (barge-in)`);
            } else {
                logger.error(`[Pipeline:${session.sessionId}] AI workflow error`, error);
                telemetryService.logError(session, error, 'executeAIWorkflow');
                if (workflowSpan) tracer.endSpan(workflowSpan, 'AI_Workflow_Execution', 'ERROR');
            }
        } finally {
            // Post-processing to extract form state if it was returned by LLM
            if (session.formMode && assistantResponse.includes('<FORM_STATE>')) {
                try {
                    const match = assistantResponse.match(/<FORM_STATE>(.*?)<\/FORM_STATE>/s);
                    if (match && match[1]) {
                        const newState = JSON.parse(match[1]);
                        session.formData = { ...session.formData, ...newState };
                        
                        // Clean up assistant response for the user (don't show them the JSON tag)
                        const cleanedResponse = assistantResponse.replace(/<FORM_STATE>.*?<\/FORM_STATE>/s, '').trim();
                        // Note: assistantResponse is updated locally here, but the historical turn was already added.
                        // We might need to update the history too if we want it to be clean.
                        const lastTurn = session.conversationHistory[session.conversationHistory.length - 1];
                        if (lastTurn && lastTurn.role === 'assistant') {
                            lastTurn.content = cleanedResponse;
                        }
                        
                        // Let the frontend know the updated form status
                        session.sendText(`FORM_UPDATE:${JSON.stringify(session.formData)}`);
                    }
                } catch (err) {
                    logger.error(`[Pipeline] Failed to parse form state:`, err);
                }
            }
            session.endTurn();
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════════
     * PHASE 4 — CHECKPOINT 10: Graceful Disconnect & Async Logging
     * ═══════════════════════════════════════════════════════════════════
     *
     * Full teardown when a call ends:
     * 1. Stop the STT recognizer and release audio resources
     * 2. Log call end metrics to Cosmos DB (non-blocking)
     * 3. Clean up Redis session state
     * 4. Free all memory (audio buffers, history, session map entry)
     */
    private async teardownSession(callId: string): Promise<void> {
        const session = this.sessions.get(callId);
        if (!session) return;

        logger.info(`[Pipeline] Tearing down session for Call ID: ${callId}`);

        // Stop STT recognizer
        const sttController = this.sttControllers.get(callId);
        if (sttController) {
            await sttController.stop();
            this.sttControllers.delete(callId);
        }

        // Log call end metrics (non-blocking)
        telemetryService.logCallEnd(session);

        // Disconnect from UI
        this.sessions.delete(callId);
        if (this.activeCalls > 0) this.activeCalls--;

        // Trigger LLM to summarize the entire conversation via Durable Worker Queue
        if (session.conversationHistory.length >= 2) {
            this.summaryQueue.enqueue({ callId, session }).catch(err => {
                logger.error(`[Pipeline] Failed to enqueue call summary task:`, err);
            });
        }

        if (session.formMode) {
            this.generateFormFile(callId, session).catch(err => {
                logger.error(`[Pipeline] Failed to generate form file:`, err);
            });
        }

        // Clean up Redis session state
        redisService.deleteSessionState(callId).catch(() => { });

        // Destroy the session (frees all memory)
        session.destroy();

        logger.info(`[Pipeline] Session destroyed — active sessions: ${this.sessions.size}`);
    }

    /**
     * Non-blocking background task to generate a text summary of the call
     * and save it to the public backend output directory for the User Portal.
     */
    private async generateSummary(callId: string, session: CallSession): Promise<void> {
        logger.info(`[Pipeline] Generating summary for call ${callId}...`);
        
        let transcript = session.conversationHistory.map(t => `${t.role.toUpperCase()}: ${t.content}`).join('\n\n');
        let prompt = `Analyze the following telephone conversation transcript and provide a concise, readable summary. Include the caller's main intent and the final resolution.\n\nTranscript:\n${transcript}`;
        
        try {
            const summaryText = await llmService.generateCompletion({
                messages: [{ role: 'user', content: prompt }]
            });

            const outputDir = path.join(process.cwd(), 'public', 'summaries');
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

            const filename = `summary_${callId}.txt`;
            const filepath = path.join(outputDir, filename);

            // Format for readability
            const fileContent = `Call ID: ${callId}\nTime: ${new Date().toLocaleString()}\nTurns: ${session.metrics.totalTurns}\n\n=== CALL SUMMARY ===\n${summaryText.trim()}\n\n=== VERBATIM TRANSCRIPT ===\n${transcript}`;
            
            fs.writeFileSync(filepath, fileContent);
            logger.info(`[Pipeline] ✅ Call summary successfully saved to ${filepath}`);
        } catch (err) {
            logger.error(`[Pipeline] Failed to generate summary:`, err);
        }
    }

    /**
     * Save the collected form data as a separate text file.
     */
    private async generateFormFile(callId: string, session: CallSession): Promise<void> {
        logger.info(`[Pipeline] Generating form file for call ${callId}...`);
        
        try {
            const outputDir = path.join(process.cwd(), 'public', 'summaries');
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

            const filename = `form_${callId}.txt`;
            const filepath = path.join(outputDir, filename);

            const formContent = `
========================================
    AI FORM SUBMISSION - ASKBOX
========================================
Call ID: ${callId}
Date: ${new Date().toLocaleString()}
Phone: ${session.callerPhoneNumber}

COLLECTED FIELDS:
-----------------
Full Name: ${session.formData.name || 'NOT PROVIDED'}
Age:       ${session.formData.age || 'NOT PROVIDED'}
Gender:    ${session.formData.gender || 'NOT PROVIDED'}
Location:  ${session.formData.location || 'NOT PROVIDED'}
Occupation: ${session.formData.occupation || 'NOT PROVIDED'}

Verification Status: ${Object.values(session.formData).every(v => !!v) ? 'COMPLETE' : 'INCOMPLETE'}
========================================
`;
            
            fs.writeFileSync(filepath, formContent);
            logger.info(`[Pipeline] ✅ Form file successfully saved to ${filepath}`);
        } catch (err) {
            logger.error(`[Pipeline] Failed to generate form file:`, err);
        }
    }

    /**
     * Specialized LLM call to extract known fields from a user utterance.
     * This runs before the main AI response to update the UI instantly.
     */
    private async extractFormDataFromUtterance(text: string, session: CallSession): Promise<Record<string, string> | null> {
        const prompt = `
Extract form fields from the user's text. 
Fields: name, age, gender, location, occupation.
Return ONLY a valid JSON object with the found fields. If none found, return {}.
Current context: User is speaking in a phone call (possibly in Hindi, Telugu, or Marathi). 
Convert non-English values to English for the final JSON.

User text: "${text}"
JSON:`;

        try {
            const response = await llmService.generateCompletion({
                messages: [{ role: 'system', content: prompt }],
                maxTokens: 100,
                temperature: 0
            });
            const match = response.match(/\{.*\}/s);
            if (match) {
                const data = JSON.parse(match[0]);
                // Clean up data to ensure keys match
                const cleaned: Record<string, string> = {};
                for (const k of ['name', 'age', 'gender', 'location', 'occupation']) {
                    if (data[k]) cleaned[k] = String(data[k]);
                }
                return cleaned;
            }
        } catch (err) {
            logger.error(`[Pipeline] Extraction failed`, err);
        }
        return null;
    }

    /**
     * Initial greeting when entering form mode manually.
     */
    private async executeFormInitialization(session: CallSession): Promise<void> {
        const greeting = session.language === 'en-IN' ? 
            "I'm now in form mode. Please provide your full name, age, gender, location, and occupation to complete your registration." :
            "मैं अब फॉर्म मोड में हूँ। कृपया अपना पूरा नाम, आयु, लिंग, स्थान और व्यवसाय बताएं ताकि आपका पंजीकरण पूरा हो सके।";
        
        session.addTurn('assistant', greeting);
        const audioBuffer = await ttsService.synthesize(greeting, session.language);
        session.sendText(greeting);
        session.sendAudio(audioBuffer);
    }

    /**
     * Extract Call ID from the ACS WebSocket request.
     */
    private extractCallId(req: any): string {
        const url = req.url || '';

        // Try query params first (e.g. /acs-audio?callId=demo-call-001)
        const queryMatch = url.match(/[?&]callId=([^&]+)/);
        if (queryMatch) return queryMatch[1];

        // Try path segments (e.g. /acs-audio/<callId>)
        const pathParts = url.split('?')[0].split('/').filter(Boolean);
        const callIdFromPath = pathParts[pathParts.length - 1];
        if (callIdFromPath && callIdFromPath !== 'acs-audio') {
            return callIdFromPath;
        }

        // Fallback: generate a unique call ID
        return `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    /**
     * Get count of active sessions (for health checks / dashboard).
     */
    public getActiveSessionCount(): number {
        return this.sessions.size;
    }

    /**
     * Get session details for a specific call (for admin dashboard).
     */
    public getSessionInfo(callId: string): object | null {
        const session = this.sessions.get(callId);
        if (!session) return null;

        return {
            sessionId: session.sessionId,
            callId: session.callId,
            language: session.language,
            isProcessing: session.isProcessing,
            durationSeconds: session.getDurationSeconds(),
            totalTurns: session.metrics.totalTurns,
            languagesDetected: Array.from(session.metrics.languagesDetected),
        };
    }

    /**
     * Graceful Shutdown Drain logic.
     * Prevents new connections and waits for active calls to complete up to a deadline.
     */
    public async drain(timeoutMs: number = 30000): Promise<void> {
        logger.warn(`[Pipeline] 🛑 Drain initiated. Stopping new connections.`);
        this.isDraining = true;
        
        const startTime = Date.now();
        
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.activeCalls === 0) {
                    logger.info(`[Pipeline] ✅ Drain complete. No active calls remaining.`);
                    clearInterval(checkInterval);
                    resolve();
                } else if (Date.now() - startTime > timeoutMs) {
                    logger.warn(`[Pipeline] ⚠️ Drain timeout reached (${timeoutMs}ms). Force closing ${this.activeCalls} active calls.`);
                    clearInterval(checkInterval);
                    
                    // Force terminate remaining WebSockets
                    for (const session of this.sessions.values()) {
                        try {
                            session.sendText("System is shutting down for maintenance. Goodbye.");
                            session.ws.close(1012, 'Service Restart');
                        } catch(e) {}
                    }
                    resolve();
                } else {
                    logger.info(`[Pipeline] ⏳ Draining... Waiting for ${this.activeCalls} active calls to finish.`);
                }
            }, 1000);
        });
    }
}

export const audioPipeline = new AudioPipeline();
