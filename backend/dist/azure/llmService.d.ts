/**
 * Phase 2 — Checkpoint 6: Asynchronous LLM Streaming
 *
 * Azure OpenAI streaming client using REST API.
 * Uses fetch for maximum stability and compatibility.
 */
export interface LLMStreamOptions {
    messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>;
    signal?: AbortSignal;
    temperature?: number;
    maxTokens?: number;
}
declare class LLMService {
    private apiKey;
    private endpoint;
    private deployment;
    private apiVersion;
    constructor();
    /**
     * Stream tokens from Azure OpenAI (Primary) or Gemini/Mock (Fallback).
     */
    streamCompletion(options: LLMStreamOptions): AsyncGenerator<string, void, undefined>;
    private streamGemini;
    private mockStream;
}
export declare const llmService: LLMService;
export {};
//# sourceMappingURL=llmService.d.ts.map