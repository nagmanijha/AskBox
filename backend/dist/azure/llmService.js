<<<<<<< HEAD
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmService = void 0;
const logger_1 = require("../config/logger");
const config_1 = require("../config");
class LLMService {
    constructor() {
        this.apiKey = config_1.config.azureOpenAI.apiKey;
        this.endpoint = config_1.config.azureOpenAI.endpoint;
        this.deployment = config_1.config.azureOpenAI.deployment;
        this.apiVersion = config_1.config.azureOpenAI.apiVersion;
        if (this.apiKey && this.endpoint) {
            logger_1.logger.info(`[LLM] Azure OpenAI initialized (Deployment: ${this.deployment})`);
        }
        else {
            logger_1.logger.warn('[LLM] Azure OpenAI credentials missing — falling back to Gemini/Mock');
        }
    }
    /**
     * Stream tokens from Azure OpenAI (Primary) or Gemini/Mock (Fallback).
     */
    async *streamCompletion(options) {
        const { messages, signal, temperature = 0.7, maxTokens = 800 } = options;
        // 1. Try Azure OpenAI
        if (this.apiKey && this.endpoint) {
            try {
                // Remove trailing slash from endpoint if present
                const cleanEndpoint = this.endpoint.replace(/\/$/, '');
                const url = `${cleanEndpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': this.apiKey
                    },
                    body: JSON.stringify({
                        messages,
                        max_tokens: maxTokens,
                        temperature,
                        stream: true
                    }),
                    signal
                });
                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`Azure OpenAI error ${response.status}: ${errText}`);
                }
                const reader = response.body?.getReader();
                if (!reader)
                    throw new Error('No body reader');
                const decoder = new TextDecoder();
                let buffer = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() ?? '';
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed.startsWith('data: '))
                            continue;
                        const jsonStr = trimmed.slice(6);
                        if (jsonStr === '[DONE]')
                            continue;
                        try {
                            const json = JSON.parse(jsonStr);
                            const content = json.choices?.[0]?.delta?.content;
                            if (content)
                                yield content;
                        }
                        catch (e) {
                            // ignore partial json
                        }
                    }
                }
                return;
            }
            catch (error) {
                if (error.name === 'AbortError') {
                    logger_1.logger.info('[LLM] Azure OpenAI stream aborted (barge-in)');
                    return;
                }
                logger_1.logger.error('[LLM] Azure OpenAI streaming failed', error);
            }
        }
        // 2. Try Google Gemini Fallback
        if (config_1.config.gemini.apiKey) {
            try {
                logger_1.logger.info('[LLM] Falling back to Google Gemini');
                yield* this.streamGemini(options);
                return;
            }
            catch (error) {
                logger_1.logger.error('[LLM] Gemini fallback failed', error);
            }
        }
        // 3. Absolute Fallback: Local Mock Stream
        logger_1.logger.warn('[LLM] All providers failed — using mock stream');
        yield* this.mockStream(messages, signal);
    }
    async *streamGemini(options) {
        const { messages, signal, temperature, maxTokens } = options;
        const apiKey = config_1.config.gemini.apiKey;
        const model = config_1.config.gemini.model;
        const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        const turns = messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));
        const systemMsg = messages.find(m => m.role === 'system')?.content;
        const body = {
            contents: turns,
            generationConfig: { temperature, maxOutputTokens: maxTokens }
        };
        if (systemMsg)
            body.systemInstruction = { parts: [{ text: systemMsg }] };
        const url = `${baseUrl}/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal
            });
            if (!response.ok)
                throw new Error(`Gemini API error: ${response.status}`);
            const reader = response.body?.getReader();
            if (!reader)
                throw new Error('No body reader');
            const decoder = new TextDecoder();
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ')) {
                        const json = JSON.parse(trimmed.slice(6));
                        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text)
                            yield text;
                    }
                }
            }
        }
        catch (err) {
            throw err;
        }
    }
    async *mockStream(messages, signal) {
        const response = 'I am sorry, I am currently operating in limited mode. Please check my configuration.';
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
            if (signal?.aborted)
                return;
            yield words[i] + (i < words.length - 1 ? ' ' : '');
            await new Promise(r => setTimeout(r, 50));
        }
    }
}
exports.llmService = new LLMService();
=======
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmService = void 0;
const logger_1 = require("../config/logger");
const config_1 = require("../config");
class LLMService {
    constructor() {
        this.endpoint = config_1.config.openai?.endpoint || '';
        this.apiKey = config_1.config.openai?.key || '';
        this.deployment = config_1.config.openai?.deployment || 'gpt-4o';
    }
    /**
     * Stream tokens from Azure OpenAI GPT-4o.
     *
     * Returns an AsyncGenerator that yields text chunks as they are generated.
     * The caller can abort mid-stream via the AbortSignal (barge-in).
     */
    async *streamCompletion(options) {
        const { messages, signal, temperature = 0.7, maxTokens = 800 } = options;
        if (!this.endpoint || !this.apiKey) {
            logger_1.logger.warn('[LLM] Azure OpenAI not configured — using mock stream');
            yield* this.mockStream(messages, signal);
            return;
        }
        // ── Real Azure OpenAI streaming call ──
        try {
            const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-02-01`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiKey,
                },
                body: JSON.stringify({
                    messages,
                    temperature,
                    max_tokens: maxTokens,
                    stream: true, // CRITICAL: stream=True for real-time TTFB
                }),
                signal,
            });
            if (!response.ok) {
                throw new Error(`Azure OpenAI returned ${response.status}: ${response.statusText}`);
            }
            const reader = response.body?.getReader();
            if (!reader)
                throw new Error('No response body reader');
            const decoder = new TextDecoder();
            let buffer = '';
            while (true) {
                // Check for barge-in abort
                if (signal?.aborted) {
                    logger_1.logger.info('[LLM] Stream aborted (barge-in)');
                    reader.cancel();
                    return;
                }
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                // Parse SSE lines
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed === 'data: [DONE]')
                        continue;
                    if (!trimmed.startsWith('data: '))
                        continue;
                    try {
                        const json = JSON.parse(trimmed.slice(6));
                        const delta = json.choices?.[0]?.delta?.content;
                        if (delta) {
                            yield delta;
                        }
                    }
                    catch {
                        // Skip malformed JSON chunks
                    }
                }
            }
        }
        catch (error) {
            if (error.name === 'AbortError') {
                logger_1.logger.info('[LLM] Stream aborted by AbortSignal');
                return;
            }
            logger_1.logger.error('[LLM] Streaming failed', error);
            // Yield a fallback error message so the user doesn't hear silence
            yield 'I apologize, I am having trouble answering right now. Please try again.';
        }
    }
    /**
     * Mock streaming generator for local development.
     *
     * Generates educational responses word-by-word with realistic delays
     * to simulate GPT-4o token generation timing (~50ms per token).
     */
    async *mockStream(messages, signal) {
        // Extract the user's last question
        const userMessage = messages[messages.length - 1]?.content || '';
        const lower = userMessage.toLowerCase();
        // Choose a context-aware mock response
        let response;
        if (lower.includes('photosynthesis')) {
            response = 'Photosynthesis is the process by which green plants convert sunlight, water, and carbon dioxide into glucose and oxygen. It happens in the chloroplast of plant cells. This is how plants make their own food!';
        }
        else if (lower.includes('newton')) {
            response = 'Newton\'s third law states that for every action, there is an equal and opposite reaction. For example, when you push a wall, the wall pushes back on you with the same force.';
        }
        else if (lower.includes('pradhan mantri') || lower.includes('yojana') || lower.includes('scheme')) {
            response = 'Pradhan Mantri Awas Yojana provides affordable housing to economically weaker sections. If your family income is below three lakh rupees per year, you can apply at your nearest Common Service Centre or the panchayat office.';
        }
        else if (lower.includes('solar') || lower.includes('planet')) {
            response = 'Our solar system has eight planets. The four inner planets are Mercury, Venus, Earth, and Mars. The four outer planets are Jupiter, Saturn, Uranus, and Neptune. Earth is the only planet known to support life.';
        }
        else if (lower.includes('water') || lower.includes('pani') || lower.includes('cycle')) {
            response = 'The water cycle has four stages. First, water evaporates from rivers and oceans. Then, it condenses into clouds. Next, it falls back as rain or snow. Finally, it collects in rivers, lakes, and oceans, and the cycle repeats.';
        }
        else {
            response = 'That is a great question! Based on your curriculum, this topic is covered in detail in your NCERT textbook. I recommend reviewing the chapter carefully and practicing the exercises at the end.';
        }
        // Stream word by word with realistic timing
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
            if (signal?.aborted) {
                logger_1.logger.info('[LLM:Mock] Stream aborted (barge-in)');
                return;
            }
            // Yield word with trailing space (except last word)
            yield words[i] + (i < words.length - 1 ? ' ' : '');
            // Simulate token generation delay (~40-60ms per token)
            await new Promise(r => setTimeout(r, 30 + Math.random() * 30));
        }
    }
}
exports.llmService = new LLMService();
>>>>>>> pr-3
//# sourceMappingURL=llmService.js.map