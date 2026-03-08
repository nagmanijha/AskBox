import { logger } from '../config/logger';
import { config } from '../config';

/**
 * Phase 2 — Checkpoint 6: Asynchronous LLM Streaming
 *
 * Azure OpenAI GPT-4o streaming client.
 *
 * KEY DESIGN: Returns an AsyncIterable<string> of tokens so the caller
 * can pipe them directly into the TTS chunker without waiting for the
 * full paragraph to generate. Supports AbortSignal for barge-in cancellation.
 *
 * Falls back to a mock streaming generator when Azure OpenAI is not configured.
 */

export interface LLMStreamOptions {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    signal?: AbortSignal;
    temperature?: number;
    maxTokens?: number;
}

class LLMService {
    private endpoint: string;
    private apiKey: string;
    private deployment: string;

    constructor() {
        this.endpoint = config.openai?.endpoint || '';
        this.apiKey = config.openai?.key || '';
        this.deployment = config.openai?.deployment || 'gpt-4o';
    }

    /**
     * Stream tokens from Azure OpenAI GPT-4o.
     *
     * Returns an AsyncGenerator that yields text chunks as they are generated.
     * The caller can abort mid-stream via the AbortSignal (barge-in).
     */
    async *streamCompletion(options: LLMStreamOptions): AsyncGenerator<string, void, undefined> {
        const { messages, signal, temperature = 0.7, maxTokens = 800 } = options;

        if (!this.endpoint || !this.apiKey) {
            logger.warn('[LLM] Azure OpenAI not configured — using mock stream');
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
                    stream: true,  // CRITICAL: stream=True for real-time TTFB
                }),
                signal,
            });

            if (!response.ok) {
                throw new Error(`Azure OpenAI returned ${response.status}: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body reader');

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                // Check for barge-in abort
                if (signal?.aborted) {
                    logger.info('[LLM] Stream aborted (barge-in)');
                    reader.cancel();
                    return;
                }

                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Parse SSE lines
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed === 'data: [DONE]') continue;
                    if (!trimmed.startsWith('data: ')) continue;

                    try {
                        const json = JSON.parse(trimmed.slice(6));
                        const delta = json.choices?.[0]?.delta?.content;
                        if (delta) {
                            yield delta;
                        }
                    } catch {
                        // Skip malformed JSON chunks
                    }
                }
            }

        } catch (error: any) {
            if (error.name === 'AbortError') {
                logger.info('[LLM] Stream aborted by AbortSignal');
                return;
            }
            logger.error('[LLM] Streaming failed', error);
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
    private async *mockStream(
        messages: Array<{ role: string; content: string }>,
        signal?: AbortSignal
    ): AsyncGenerator<string, void, undefined> {
        // Extract the user's last question
        const userMessage = messages[messages.length - 1]?.content || '';
        const lower = userMessage.toLowerCase();

        // Choose a context-aware mock response
        let response: string;

        if (lower.includes('photosynthesis')) {
            response = 'Photosynthesis is the process by which green plants convert sunlight, water, and carbon dioxide into glucose and oxygen. It happens in the chloroplast of plant cells. This is how plants make their own food!';
        } else if (lower.includes('newton')) {
            response = 'Newton\'s third law states that for every action, there is an equal and opposite reaction. For example, when you push a wall, the wall pushes back on you with the same force.';
        } else if (lower.includes('pradhan mantri') || lower.includes('yojana') || lower.includes('scheme')) {
            response = 'Pradhan Mantri Awas Yojana provides affordable housing to economically weaker sections. If your family income is below three lakh rupees per year, you can apply at your nearest Common Service Centre or the panchayat office.';
        } else if (lower.includes('solar') || lower.includes('planet')) {
            response = 'Our solar system has eight planets. The four inner planets are Mercury, Venus, Earth, and Mars. The four outer planets are Jupiter, Saturn, Uranus, and Neptune. Earth is the only planet known to support life.';
        } else if (lower.includes('water') || lower.includes('pani') || lower.includes('cycle')) {
            response = 'The water cycle has four stages. First, water evaporates from rivers and oceans. Then, it condenses into clouds. Next, it falls back as rain or snow. Finally, it collects in rivers, lakes, and oceans, and the cycle repeats.';
        } else {
            response = 'That is a great question! Based on your curriculum, this topic is covered in detail in your NCERT textbook. I recommend reviewing the chapter carefully and practicing the exercises at the end.';
        }

        // Stream word by word with realistic timing
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
            if (signal?.aborted) {
                logger.info('[LLM:Mock] Stream aborted (barge-in)');
                return;
            }

            // Yield word with trailing space (except last word)
            yield words[i] + (i < words.length - 1 ? ' ' : '');

            // Simulate token generation delay (~40-60ms per token)
            await new Promise(r => setTimeout(r, 30 + Math.random() * 30));
        }
    }
}

export const llmService = new LLMService();
