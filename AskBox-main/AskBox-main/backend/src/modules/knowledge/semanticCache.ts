import { logger } from '../../config/logger';
import { tracer } from '../../shared/observability';

/**
 * Simulates a Redis-backed semantic cache layer for RAG.
 * If a similar question has been asked recently, it returns the cached response
 * to bypass the LLM and drop latency to <50ms.
 */
export class SemanticCache {
    private cache: Map<string, string> = new Map();

    async get(query: string, traceParent: any): Promise<string | null> {
        const span = tracer.startChildSpan(traceParent, 'SemanticCache.Lookup');
        
        // Simulating hash lookup / exact match logic
        const normalizedQuery = query.toLowerCase().trim();
        const hit = this.cache.get(normalizedQuery);
        
        if (hit) {
            logger.info(`[SemanticCache] 🟢 CACHE HIT for query: "${query}"`);
        } else {
            logger.info(`[SemanticCache] 🔴 CACHE MISS for query: "${query}"`);
        }
        
        tracer.endSpan(span, 'SemanticCache.Lookup');
        return hit || null;
    }

    async set(query: string, response: string): Promise<void> {
        const normalizedQuery = query.toLowerCase().trim();
        this.cache.set(normalizedQuery, response);
        logger.info(`[SemanticCache] Updated cache with new semantic pairing.`);
    }
}

export const semanticCache = new SemanticCache();
