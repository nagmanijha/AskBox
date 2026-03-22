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
//# sourceMappingURL=llmService.js.map