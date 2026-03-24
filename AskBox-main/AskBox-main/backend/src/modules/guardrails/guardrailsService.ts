import { logger } from '../../config/logger';

export class GuardrailsService {
    /**
     * Checks if a user query contains a prompt injection attack.
     */
    async checkPromptInjection(query: string): Promise<boolean> {
        const triggers = ['ignore previous', 'system prompt', 'you are now', 'sudo'];
        const isInjection = triggers.some(t => query.toLowerCase().includes(t));
        if (isInjection) {
            logger.warn(`[Guardrails] Prompt injection detected: ${query}`);
        }
        return isInjection;
    }

    /**
     * Checks output for toxicity or hallucinated links.
     */
    async filterToxicity(response: string): Promise<{ clean: boolean, sanitized: string }> {
        // Mock toxicity filter
        const toxicWords = ['idiot', 'stupid', 'curseword'];
        let clean = true;
        let sanitized = response;
        for (const word of toxicWords) {
            if (response.toLowerCase().includes(word)) {
                clean = false;
                sanitized = sanitized.replace(new RegExp(word, 'gi'), '[REDACTED]');
            }
        }
        if (!clean) {
            logger.warn(`[Guardrails] Toxicity filtered from response.`);
        }
        return { clean, sanitized };
    }
}

export const guardrailsService = new GuardrailsService();
