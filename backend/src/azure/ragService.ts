
import { logger } from '../config/logger';
import { config } from '../config';
import { redisService } from './redisClient';
import { searchService } from './searchClient';
import { ConversationTurn } from '../shared/types';

/**
 * Phase 2 — Checkpoint 4 & 5: RAG Retrieval & Prompt Assembly
 *
 * Two-tier retrieval:
 *   FAST PATH → Redis cache (< 5ms for frequently asked questions)
 *   SLOW PATH → Azure AI Search (50-200ms for curriculum/scheme lookup)
 *   FALLBACK  → Generic response if both timeout (> 3 seconds)
 *
 * After retrieval, assembles the full GPT-4o prompt with:
 *   1. System instructions (language, role, tone)
 *   2. Retrieved RAG context
 *   3. Conversation history (last N turns from Redis/memory)
 *   4. The current user query
 */

/** Maximum time to wait for RAG retrieval before falling back */
const RAG_TIMEOUT_MS = 3000;

/** Default system prompt template */
const SYSTEM_PROMPT_TEMPLATE = `You are AskBox, an educational and government services voice assistant for rural communities in India.

CRITICAL INSTRUCTIONS:
- You MUST reply in {{LANGUAGE}}.
- Keep responses concise (2-3 sentences max) — this is a phone call, not a chat.
- Use simple words suitable for students and rural citizens.
- If you don't know the answer, say so honestly in the caller's language.

CONTEXT FROM KNOWLEDGE BASE:
{{RAG_CONTEXT}}`;

export interface AssembledPrompt {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    context: string;
    retrievalSource: 'cache' | 'search' | 'fallback';
    retrievalLatencyMs: number;
}

class RAGService {
    /**
     * Full RAG pipeline: retrieve context → assemble prompt.
     *
     * @param query        The user's transcribed question
     * @param language     Detected language (e.g. "hi-IN")
     * @param history      Conversation history for multi-turn context
     */
    async retrieveAndAssemble(
        query: string,
        language: string,
        history: ConversationTurn[]
    ): Promise<AssembledPrompt> {
        const startTime = Date.now();

        // ── Step 1: Retrieve RAG context ──
        const { context, source } = await this.retrieveContext(query);
        const retrievalLatencyMs = Date.now() - startTime;

        logger.info(`[RAG] Retrieved context in ${retrievalLatencyMs}ms from ${source}`);

        // ── Step 2: Assemble prompt messages ──
        const languageName = this.getLanguageName(language);

        const systemPrompt = SYSTEM_PROMPT_TEMPLATE
            .replace('{{LANGUAGE}}', languageName)
            .replace('{{RAG_CONTEXT}}', context || 'No specific context available.');

        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: systemPrompt },
        ];

        // Add conversation history (multi-turn)
        for (const turn of history) {
            messages.push({
                role: turn.role === 'user' ? 'user' : 'assistant',
                content: turn.content,
            });
        }

        // Add the current query
        messages.push({ role: 'user', content: query });

        return {
            messages,
            context: context || '',
            retrievalSource: source,
            retrievalLatencyMs,
        };
    }

    /**
     * Two-tier context retrieval with timeout fallback.
     */
    private async retrieveContext(
        query: string
    ): Promise<{ context: string; source: 'cache' | 'search' | 'fallback' }> {

        // ── FAST PATH: Check Redis cache first ──
        try {
            const cached = await redisService.getCachedRAG(query);
            if (cached) {
                return { context: cached, source: 'cache' };
            }
        } catch (err) {
            logger.error('[RAG] Redis cache check failed', err);
        }

        // ── SLOW PATH: Azure AI Search with timeout ──
        try {
            const context = await this.searchWithTimeout(query, RAG_TIMEOUT_MS);
            if (context) {
                // Cache the result for next time
                redisService.cacheRAGResult(query, context).catch(() => { });
                return { context, source: 'search' };
            }
        } catch (err) {
            logger.error('[RAG] Azure AI Search failed or timed out', err);
        }

        // ── FALLBACK: No context available ──
        return {
            context: 'No specific knowledge base context found. Answer from your general knowledge.',
            source: 'fallback',
        };
    }

    /**
     * Query Azure AI Search with a strict timeout.
     * If the search takes too long, we abort and fall back to generic LLM response
     * rather than keeping the caller waiting in silence.
     */
    private async searchWithTimeout(query: string, timeoutMs: number): Promise<string | null> {
        const searchClient = searchService.getClient();

        if (!searchClient) {
            // AI Search not configured — return mock context for development
            return this.getMockContext(query);
        }

        return new Promise<string | null>((resolve) => {
            const timer = setTimeout(() => {
                logger.warn(`[RAG] Search timed out after ${timeoutMs}ms — falling back`);
                resolve(null);
            }, timeoutMs);

            searchClient.search(query, {
                top: 3,
                queryType: 'semantic',
                semanticSearchOptions: {
                    configurationName: 'default',
                },
            })
                .then(async (results: any) => {
                    clearTimeout(timer);
                    const documents: string[] = [];

                    for await (const result of results.results) {
                        if (result.document?.content) {
                            documents.push(result.document.content);
                        }
                    }

                    resolve(documents.length > 0 ? documents.join('\n\n---\n\n') : null);
                })
                .catch((err: any) => {
                    clearTimeout(timer);
                    logger.error('[RAG] Search query execution failed', err);
                    resolve(null);
                });
        });
    }

    /**
     * Mock context provider for local development.
     * Returns relevant educational or scheme content based on keywords.
     */
    private getMockContext(query: string): string {
        const lower = query.toLowerCase();

        const mockKnowledge: Record<string, string> = {
            // Science
            'photosynthesis': 'Photosynthesis is the process by which green plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar. It occurs in the chloroplasts of plant cells. The equation is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2.',
            'newton': 'Newton\'s Three Laws of Motion: 1) An object at rest stays at rest unless acted upon by a force. 2) Force = Mass × Acceleration (F=ma). 3) For every action, there is an equal and opposite reaction.',
            'solar': 'The solar system has 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Pluto was reclassified as a dwarf planet in 2006. The Sun is a star at the center.',
            'water cycle': 'The water cycle has 4 stages: Evaporation (water turns to vapor), Condensation (vapor forms clouds), Precipitation (rain/snow falls), Collection (water gathers in rivers/oceans).',
            'cell division': 'Cell division has two types: Mitosis (produces 2 identical cells for growth/repair) and Meiosis (produces 4 different cells for reproduction). Stages of mitosis: Prophase, Metaphase, Anaphase, Telophase.',
            'climate change': 'Climate change is the long-term shift in global temperatures caused by greenhouse gas emissions. Main causes: burning fossil fuels, deforestation. Effects: rising sea levels, extreme weather, crop failure.',
            'electricity': 'Electricity is the flow of electrons through a conductor. Key concepts: Voltage (V) = pressure, Current (I) = flow rate, Resistance (R) = opposition. Ohm\'s Law: V = I × R.',
            'periodic table': 'The periodic table organizes 118 elements by atomic number. Rows are called periods, columns are groups. Metals are on the left, nonmetals on the right. Noble gases (Group 18) are the most stable.',
            'atom': 'Atomic structure consists of protons (positive) and neutrons (neutral) in the nucleus, occupied by electrons (negative) in shells. Atomic number = number of protons. Mass number = protons + neutrons.',
            
            // Math
            'algebra': 'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. In x + 2 = 5, x is a variable. Key concepts: linear equations, quadratic equations, polynomials.',
            'pythagoras': 'Pythagoras theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides (a² + b² = c²).',
            'statistics': 'Statistics involves collecting, analyzing, interpreting, presenting, and organizing data. Key measures: Mean (average), Median (middle value), Mode (most frequent), Standard Deviation (spread).',

            // Social Science & History
            'democracy': 'Democracy is a system of government where citizens exercise power by voting. India is the world\'s largest democracy with a parliamentary system. Key features: universal adult suffrage, fundamental rights, independent judiciary.',
            'constitution': 'The Constitution of India is the supreme law of India. It was adopted on 26 November 1949 and came into effect on 26 January 1950. Dr. B.R. Ambedkar was the chairman of the drafting committee.',
            'freedom struggle': 'India\'s freedom struggle involved movements like Non-Cooperation (1920), Civil Disobedience (1930), and Quit India (1942). Leaders: Mahatma Gandhi, Subhas Chandra Bose, Bhagat Singh, Sardar Patel.',
            'geography': 'Geography is the study of places and the relationships between people and their environments. Physical geography covers landforms, climate, and ecosystems. Human geography covers culture, economy, and migration.',

            // Government Schemes
            'pradhan mantri': 'Pradhan Mantri Awas Yojana (PMAY) provides affordable housing. Eligibility: Annual income below ₹18 lakh for urban, ₹3 lakh for rural. Benefits: Interest subsidy of 3-6.5% on home loans up to ₹6 lakh.',
            'scholarship': 'PM Yasasvi Scholarship Scheme is for OBC, EBC, and DNT students studying in Class 9-12. Features: computer-based test, income limit ₹2.5 lakh/year. Benefits: ₹75,000 to ₹1,25,000 per year.',
            'farmer': 'PM-KISAN scheme provides ₹6,000 per year to landholding farmer families in three equal installments. Eligibility: Valid land ownership record. Exclusions: Institutional landholders, income tax payers.',
            'pension': 'Atal Pension Yojana (APY) provides a guaranteed minimum monthly pension of ₹1000-₹5000 at age 60. Eligibility: Citizens aged 18-40 with a savings bank account. Contribution depends on entry age and pension amount.',
        };

        for (const [keyword, content] of Object.entries(mockKnowledge)) {
            if (lower.includes(keyword)) {
                return content;
            }
        }

        return 'General educational and civic context: AskBox assists rural students (Classes 6-12) with curriculum topics (Science, Math, Social Studies) and citizens with government welfare schemes (housing, scholarships, farming). Please answer generally based on this role.';
    }

    /**
     * Map language codes to human-readable names for the system prompt.
     */
    private getLanguageName(langCode: string): string {
        const map: Record<string, string> = {
            'en-IN': 'English',
            'hi-IN': 'Hindi',
            'ta-IN': 'Tamil',
            'te-IN': 'Telugu',
            'kn-IN': 'Kannada',
            'ml-IN': 'Malayalam',
            'bn-IN': 'Bengali',
            'mr-IN': 'Marathi',
        };
        return map[langCode] || 'English';
    }
}

export const ragService = new RAGService();

