<<<<<<< HEAD
import { pool } from '../../database/connection';
import { CallLog, PaginatedResponse, AnalyticsOverview } from '../../shared/types';
import { logger } from '../../config/logger';

/**
 * Call logs service — reads call data from PostgreSQL telemetry table.
 * Falls back to mock data when database is empty.
 */
export class CallsService {
    /** Get paginated call logs with filters */
    async getCalls(
        page: number = 1,
        pageSize: number = 20,
        filters: {
            startDate?: string;
            endDate?: string;
            language?: string;
            status?: string;
        } = {}
    ): Promise<PaginatedResponse<CallLog>> {
        try {
            // Check if we have any data, otherwise return mock
            const countCheck = await pool.query('SELECT COUNT(*) FROM call_telemetry');
            if (parseInt(countCheck.rows[0].count, 10) === 0) {
                return this.getMockCalls(page, pageSize);
            }

            let whereClause = '1=1';
            const params: any[] = [];
            let paramIdx = 1;

            if (filters.startDate) {
                whereClause += ` AND timestamp >= $${paramIdx++}`;
                params.push(filters.startDate);
            }
            if (filters.endDate) {
                whereClause += ` AND timestamp <= $${paramIdx++}`;
                params.push(filters.endDate);
            }

            // We use a CTE to aggregate events per call ID
            const query = `
                WITH call_events AS (
                    SELECT 
                        call_id,
                        MIN(timestamp) as started_at,
                        MAX(timestamp) as ended_at,
                        MAX(CASE WHEN event_type = 'call_end' THEN CAST(data->>'durationSeconds' AS INTEGER) ELSE 0 END) as duration,
                        MAX(CASE WHEN event_type = 'turn_complete' THEN data->>'language' ELSE NULL END) as language,
                        MAX(CASE WHEN event_type = 'call_end' THEN 'completed' ELSE 'in-progress' END) as status
                    FROM call_telemetry
                    WHERE ${whereClause}
                    GROUP BY call_id
                )
                SELECT * FROM call_events
                ORDER BY started_at DESC
                OFFSET $${paramIdx++} LIMIT $${paramIdx++}
            `;

            // Pagination params
            const offset = (page - 1) * pageSize;
            const queryParams = [...params, offset, pageSize];

            const result = await pool.query(query, queryParams);

            // Total count for pagination
            const countQuery = `
                SELECT COUNT(DISTINCT call_id)
                FROM call_telemetry
                WHERE ${whereClause}
            `;
            const countResult = await pool.query(countQuery, params);
            const total = parseInt(countResult.rows[0].count, 10);

            const items: CallLog[] = result.rows.map(row => ({
                id: row.call_id,
                phoneNumber: 'Hidden',
                language: row.language || 'Unknown',
                duration: row.duration || 0,
                status: row.status as 'completed' | 'in-progress' | 'failed' | 'missed',
                transcriptSummary: 'View transcript for details',
                transcript: [],
                aiResponses: [],
                startedAt: row.started_at.toISOString(),
                endedAt: row.ended_at.toISOString(),
            }));

            return {
                items,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        } catch (error) {
            logger.error('Failed to query PostgreSQL for call logs', { error });
            return this.getMockCalls(page, pageSize);
        }
    }

    /** Get a single call by ID */
    async getCallById(id: string): Promise<CallLog | null> {
        try {
            const result = await pool.query(
                `SELECT event_type, timestamp, data 
                 FROM call_telemetry 
                 WHERE call_id = $1 
                 ORDER BY timestamp ASC`,
                [id]
            );

            if (result.rowCount === 0) {
                const mockCalls = this.generateMockCalls();
                return mockCalls.find((c) => c.id === id) || mockCalls[0];
            }

            const events = result.rows;
            const startEvent = events.find(e => e.event_type === 'call_start');
            const endEvent = events.find(e => e.event_type === 'call_end');
            const turnEvents = events.filter(e => e.event_type === 'turn_complete');

            return {
                id,
                phoneNumber: startEvent?.data?.callerPhoneNumber || 'Unknown',
                language: turnEvents[0]?.data?.language || startEvent?.data?.initialLanguage || 'Unknown',
                duration: endEvent?.data?.durationSeconds || 0,
                status: endEvent ? 'completed' : 'in-progress',
                transcriptSummary: turnEvents.map(t => t.data.userQuery).join(' | '),
                transcript: turnEvents.map(t => ({
                    speaker: 'caller',
                    text: t.data.userQuery,
                    timestamp: t.timestamp.toISOString()
                })),
                aiResponses: turnEvents.map(t => ({
                    query: t.data.userQuery,
                    response: t.data.assistantResponse,
                    confidence: 0.9,
                    timestamp: t.timestamp.toISOString()
                })),
                startedAt: (startEvent || events[0]).timestamp.toISOString(),
                endedAt: (endEvent || events[events.length - 1]).timestamp.toISOString(),
            };
        } catch (error) {
            logger.error('Failed to get call from PostgreSQL', { error, id });
            return null;
        }
    }

    /** Get active call count */
    async getActiveCallCount(): Promise<number> {
        try {
            // Count calls that have a start event in the last hour but no end event
            const result = await pool.query(`
                SELECT COUNT(DISTINCT call_id)
                FROM call_telemetry
                WHERE timestamp > NOW() - INTERVAL '1 hour'
                AND call_id NOT IN (
                    SELECT call_id FROM call_telemetry WHERE event_type = 'call_end' OR event_type = 'error'
                )
            `);
            const activeDbCalls = parseInt(result.rows[0].count, 10);
            return activeDbCalls > 0 ? activeDbCalls : Math.floor(Math.random() * 5) + 1; // Fallback mock
        } catch (error) {
            return Math.floor(Math.random() * 15) + 1;
        }
    }

    /** Generate mock calls for development */
    private generateMockCalls(): CallLog[] {
        const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Malayalam'];
        const statuses: CallLog['status'][] = ['completed', 'in-progress', 'failed', 'missed'];
        const questions = [
            'What is photosynthesis?',
            'Explain Newton\'s laws of motion',
            'What is the water cycle?',
            'Tell me about the solar system',
            'What are prime numbers?',
            'Explain cell division',
            'What is climate change?',
            'How does electricity work?',
            'What is democracy?',
            'Explain the periodic table',
        ];

        return Array.from({ length: 50 }, (_, i) => {
            const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
            const duration = Math.floor(Math.random() * 600) + 30;
            const lang = languages[Math.floor(Math.random() * languages.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const question = questions[Math.floor(Math.random() * questions.length)];

            return {
                id: `call-${String(i + 1).padStart(4, '0')}`,
                phoneNumber: `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`,
                language: lang,
                duration,
                status,
                transcriptSummary: `Student asked about: ${question}`,
                transcript: [
                    { speaker: 'assistant' as const, text: ['Hindi', 'Marathi', 'Bengali'].includes(lang) ? 'AskBox mein aapka swagat hai! Main aapki kaise madad kar sakti hoon?' : 'Welcome to AskBox! How can I help you today?', timestamp: startTime.toISOString() },
                    { speaker: 'caller' as const, text: question, timestamp: new Date(startTime.getTime() + 5000).toISOString() },
                    { speaker: 'assistant' as const, text: `Great question! Let me explain ${question.toLowerCase().replace('?', '')}...`, timestamp: new Date(startTime.getTime() + 8000).toISOString() },
                ],
                aiResponses: [
                    { query: question, response: `[AI response to: ${question}]`, confidence: 0.85 + Math.random() * 0.15, timestamp: new Date(startTime.getTime() + 8000).toISOString() },
                ],
                startedAt: startTime.toISOString(),
                endedAt: new Date(startTime.getTime() + duration * 1000).toISOString(),
            };
        });
    }

    /** Return paginated mock calls */
    private getMockCalls(page: number, pageSize: number): PaginatedResponse<CallLog> {
        const allCalls = this.generateMockCalls();
        const start = (page - 1) * pageSize;
        const items = allCalls.slice(start, start + pageSize);

        return {
            items,
            total: allCalls.length,
            page,
            pageSize,
            totalPages: Math.ceil(allCalls.length / pageSize),
        };
    }
}

export const callsService = new CallsService();
=======
import { cosmosService } from '../../azure/cosmosClient';
import { CallLog, PaginatedResponse, AnalyticsOverview } from '../../shared/types';
import { logger } from '../../config/logger';

/**
 * Call logs service — reads call data from Azure Cosmos DB.
 * Falls back to mock data when Cosmos DB is not configured.
 */
export class CallsService {
    /** Get paginated call logs with filters */
    async getCalls(
        page: number = 1,
        pageSize: number = 20,
        filters: {
            startDate?: string;
            endDate?: string;
            language?: string;
            status?: string;
        } = {}
    ): Promise<PaginatedResponse<CallLog>> {
        const container = cosmosService.getContainer();
        if (!container) return this.getMockCalls(page, pageSize);

        if (!container) {
            // Return mock data for development
            return this.getMockCalls(page, pageSize);
        }

        try {
            let query = 'SELECT * FROM c WHERE 1=1';
            const parameters: any[] = [];

            if (filters.startDate) {
                query += ` AND c.startedAt >= @startDate`;
                parameters.push({ name: '@startDate', value: filters.startDate });
            }
            if (filters.endDate) {
                query += ` AND c.startedAt <= @endDate`;
                parameters.push({ name: '@endDate', value: filters.endDate });
            }
            if (filters.language) {
                query += ` AND c.language = @language`;
                parameters.push({ name: '@language', value: filters.language });
            }
            if (filters.status) {
                query += ` AND c.status = @status`;
                parameters.push({ name: '@status', value: filters.status });
            }

            // Get total count
            const countQuery = query.replace('SELECT *', 'SELECT VALUE COUNT(1)');
            const countResult = await container.items.query({ query: countQuery, parameters }).fetchAll();
            const total = countResult.resources[0] || 0;

            // Get paginated results
            query += ` ORDER BY c.startedAt DESC OFFSET ${(page - 1) * pageSize} LIMIT ${pageSize}`;
            const result = await container.items.query({ query, parameters }).fetchAll();

            return {
                items: result.resources as CallLog[],
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        } catch (error) {
            logger.error('Failed to query Cosmos DB for call logs', { error });
            return this.getMockCalls(page, pageSize);
        }
    }

    /** Get a single call by ID */
    async getCallById(id: string): Promise<CallLog | null> {
        const container = cosmosService.getContainer();

        if (!container) {
            const mockCalls = this.generateMockCalls();
            return mockCalls.find((c) => c.id === id) || mockCalls[0];
        }

        try {
            const { resource } = await container.item(id, id).read();
            return resource as CallLog;
        } catch (error) {
            logger.error('Failed to get call from Cosmos DB', { error, id });
            return null;
        }
    }

    /** Get active call count (placeholder — uses ACS in production) */
    async getActiveCallCount(): Promise<number> {
        // In production, this would query Azure Communication Services
        // for currently active calls. Returning mock value for now.
        return Math.floor(Math.random() * 15) + 1;
    }

    /** Generate mock calls for development */
    private generateMockCalls(): CallLog[] {
        const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Malayalam'];
        const statuses: CallLog['status'][] = ['completed', 'in-progress', 'failed', 'missed'];
        const questions = [
            'What is photosynthesis?',
            'Explain Newton\'s laws of motion',
            'What is the water cycle?',
            'Tell me about the solar system',
            'What are prime numbers?',
            'Explain cell division',
            'What is climate change?',
            'How does electricity work?',
            'What is democracy?',
            'Explain the periodic table',
        ];

        return Array.from({ length: 50 }, (_, i) => {
            const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
            const duration = Math.floor(Math.random() * 600) + 30;
            const lang = languages[Math.floor(Math.random() * languages.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const question = questions[Math.floor(Math.random() * questions.length)];

            return {
                id: `call-${String(i + 1).padStart(4, '0')}`,
                phoneNumber: `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`,
                language: lang,
                duration,
                status,
                transcriptSummary: `Student asked about: ${question}`,
                transcript: [
                    { speaker: 'assistant' as const, text: ['Hindi', 'Marathi', 'Bengali'].includes(lang) ? 'AskBox mein aapka swagat hai! Main aapki kaise madad kar sakti hoon?' : 'Welcome to AskBox! How can I help you today?', timestamp: startTime.toISOString() },
                    { speaker: 'caller' as const, text: question, timestamp: new Date(startTime.getTime() + 5000).toISOString() },
                    { speaker: 'assistant' as const, text: `Great question! Let me explain ${question.toLowerCase().replace('?', '')}...`, timestamp: new Date(startTime.getTime() + 8000).toISOString() },
                ],
                aiResponses: [
                    { query: question, response: `[AI response to: ${question}]`, confidence: 0.85 + Math.random() * 0.15, timestamp: new Date(startTime.getTime() + 8000).toISOString() },
                ],
                startedAt: startTime.toISOString(),
                endedAt: new Date(startTime.getTime() + duration * 1000).toISOString(),
            };
        });
    }

    /** Return paginated mock calls */
    private getMockCalls(page: number, pageSize: number): PaginatedResponse<CallLog> {
        const allCalls = this.generateMockCalls();
        const start = (page - 1) * pageSize;
        const items = allCalls.slice(start, start + pageSize);

        return {
            items,
            total: allCalls.length,
            page,
            pageSize,
            totalPages: Math.ceil(allCalls.length / pageSize),
        };
    }
}

export const callsService = new CallsService();
>>>>>>> pr-3
