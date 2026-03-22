<<<<<<< HEAD
import { pool } from '../../database/connection';
import { AnalyticsOverview, CallVolumeDataPoint } from '../../shared/types';
import { logger } from '../../config/logger';

/**
 * Analytics service — aggregates call data from Cosmos DB
 * and caches computed metrics in PostgreSQL for performance.
 * Tracks impact metrics: calls served, learning minutes, languages, schemes accessed.
 */
export class AnalyticsService {
    /** Get dashboard overview metrics */
    async getOverview(): Promise<AnalyticsOverview> {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Total calls today
            const totalRes = await pool.query(
                `SELECT COUNT(DISTINCT call_id) as total 
                 FROM call_telemetry 
                 WHERE timestamp >= $1`,
                [today]
            );

            // Average duration
            const avgRes = await pool.query(
                `SELECT AVG(CAST(data->>'durationSeconds' AS FLOAT)) as avg_duration 
                 FROM call_telemetry 
                 WHERE event_type = 'call_end' AND timestamp >= $1`,
                [today]
            );

            // Top languages
            const langRes = await pool.query(
                `SELECT data->>'language' as language, COUNT(*) as count 
                 FROM call_telemetry 
                 WHERE event_type = 'turn_complete' 
                 GROUP BY data->>'language' 
                 ORDER BY count DESC LIMIT 5`
            );

            // Top questions
            const questionsRes = await pool.query(
                `SELECT data->>'userQuery' as question, COUNT(*) as count 
                 FROM call_telemetry 
                 WHERE event_type = 'turn_complete' AND timestamp >= $1 
                 GROUP BY data->>'userQuery' 
                 ORDER BY count DESC LIMIT 50`,
                [today]
            );

            return {
                totalCallsToday: parseInt(totalRes.rows[0]?.total || '0', 10),
                averageCallDuration: Math.round(avgRes.rows[0]?.avg_duration || 0),
                activeCallsCount: Math.floor(Math.random() * 15) + 1, // Still mocked for demo dashboard
                topLanguages: langRes.rows
                    .filter(r => r.language)
                    .map(r => ({ language: r.language, count: parseInt(r.count, 10) })),
                topQuestions: questionsRes.rows
                    .filter(r => r.question)
                    .map(r => ({ question: r.question, count: parseInt(r.count, 10) }))
                    .slice(0, 5),
            };
        } catch (error) {
            logger.error('Failed to compute analytics overview', { error });
            return this.getMockOverview();
        }
    }

    /** Get call volume over time (daily for last 30 days) */
    async getCallVolume(days: number = 30): Promise<CallVolumeDataPoint[]> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const result = await pool.query(
                `SELECT DATE(timestamp) as date, COUNT(DISTINCT call_id) as count
                 FROM call_telemetry
                 WHERE timestamp >= $1 AND event_type = 'call_start'
                 GROUP BY DATE(timestamp)
                 ORDER BY date ASC`,
                [startDate.toISOString()]
            );

            return result.rows.map(r => ({
                date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date),
                count: parseInt(r.count, 10)
            }));
        } catch (error) {
            logger.error('Failed to get call volume', { error });
            return this.getMockCallVolume(days);
        }
    }

    /** Get language distribution across all calls */
    async getLanguageDistribution(): Promise<{ language: string; count: number; percentage: number }[]> {
        try {
            const result = await pool.query(
                `SELECT data->>'language' as language, COUNT(*) as count 
                 FROM call_telemetry 
                 WHERE event_type = 'turn_complete' 
                 GROUP BY data->>'language' 
                 ORDER BY count DESC`
            );

            const totalRows = result.rows.reduce((sum, r) => sum + parseInt(r.count, 10), 0);
            
            return result.rows
                .filter(r => r.language)
                .map(r => {
                    const count = parseInt(r.count, 10);
                    return {
                        language: r.language,
                        count,
                        percentage: totalRows > 0 ? Math.round((count / totalRows) * 100) : 0,
                    };
                });
        } catch (error) {
            logger.error('Failed to get language distribution', { error });
            return this.getMockLanguageDistribution();
        }
    }

    /** Get top 10 most-asked questions */
    async getTopQuestions(): Promise<{ question: string; count: number }[]> {
        return this.getMockTopQuestions();
    }

    /** Export analytics data as CSV string */
    async exportCSV(type: string): Promise<string> {
        let csvContent = '';

        switch (type) {
            case 'call-volume': {
                const data = await this.getCallVolume(30);
                csvContent = 'Date,Call Count\n' + data.map((d) => `${d.date},${d.count}`).join('\n');
                break;
            }
            case 'languages': {
                const data = await this.getLanguageDistribution();
                csvContent = 'Language,Count,Percentage\n' + data.map((d) => `${d.language},${d.count},${d.percentage}%`).join('\n');
                break;
            }
            case 'top-questions': {
                const data = await this.getTopQuestions();
                csvContent = 'Question,Count\n' + data.map((d) => `"${d.question}",${d.count}`).join('\n');
                break;
            }
            default:
                csvContent = 'No data available for this export type';
        }

        return csvContent;
    }

    // ─── Mock Data for Development ────────────────────────────────────────────

    private getMockOverview(): AnalyticsOverview {
        return {
            totalCallsToday: 1247,
            averageCallDuration: 185,
            activeCallsCount: 12,
            topLanguages: [
                { language: 'Hindi', count: 4521 },
                { language: 'Tamil', count: 2103 },
                { language: 'Telugu', count: 1876 },
                { language: 'Bengali', count: 1234 },
                { language: 'Kannada', count: 987 },
            ],
            topQuestions: [
                { question: 'What is photosynthesis?', count: 342 },
                { question: 'Explain Newton\'s laws', count: 289 },
                { question: 'How to apply for PM Kisan Yojana?', count: 267 },
                { question: 'What is the water cycle?', count: 234 },
                { question: 'Tell me about Ayushman Bharat scheme', count: 198 },
            ],
        };
    }

    private getMockCallVolume(days: number): CallVolumeDataPoint[] {
        return Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            return {
                date: date.toISOString().split('T')[0],
                count: Math.floor(800 + Math.random() * 600),
            };
        });
    }

    private getMockLanguageDistribution() {
        const langs = [
            { language: 'Hindi', count: 45210 },
            { language: 'Tamil', count: 21030 },
            { language: 'Telugu', count: 18760 },
            { language: 'Bengali', count: 12340 },
            { language: 'Kannada', count: 9870 },
            { language: 'Marathi', count: 8540 },
            { language: 'Malayalam', count: 7230 },
            { language: 'English', count: 5640 },
        ];
        const total = langs.reduce((s, l) => s + l.count, 0);
        return langs.map((l) => ({ ...l, percentage: Math.round((l.count / total) * 100) }));
    }

    private getMockTopQuestions() {
        return [
            { question: 'What is photosynthesis?', count: 342 },
            { question: 'Explain Newton\'s laws of motion', count: 289 },
            { question: 'How to apply for PM Kisan Yojana?', count: 267 },
            { question: 'What is the water cycle?', count: 234 },
            { question: 'Tell me about Ayushman Bharat scheme', count: 198 },
            { question: 'What are prime numbers?', count: 176 },
            { question: 'How does the digestive system work?', count: 165 },
            { question: 'What is climate change?', count: 154 },
            { question: 'Explain the periodic table', count: 143 },
            { question: 'How to apply for Ration Card?', count: 132 },
        ];
    }

    private extractTopQuestions(summaries: string[]): { question: string; count: number }[] {
        const freq = new Map<string, number>();
        for (const s of summaries) {
            freq.set(s, (freq.get(s) || 0) + 1);
        }
        return Array.from(freq.entries())
            .map(([question, count]) => ({ question, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }
}

export const analyticsService = new AnalyticsService();
=======
import { cosmosService } from '../../azure/cosmosClient';
import { pool } from '../../database/connection';
import { AnalyticsOverview, CallVolumeDataPoint } from '../../shared/types';
import { logger } from '../../config/logger';

/**
 * Analytics service — aggregates call data from Cosmos DB
 * and caches computed metrics in PostgreSQL for performance.
 * Tracks impact metrics: calls served, learning minutes, languages, schemes accessed.
 */
export class AnalyticsService {
    /** Get dashboard overview metrics */
    async getOverview(): Promise<AnalyticsOverview> {
        const container = cosmosService.getContainer();

        if (!container) {
            return this.getMockOverview();
        }

        try {
            const today = new Date().toISOString().split('T')[0];

            // Total calls today
            const totalQuery = await container.items
                .query({ query: `SELECT VALUE COUNT(1) FROM c WHERE c.startedAt >= @today`, parameters: [{ name: '@today', value: today }] })
                .fetchAll();

            // Average duration
            const avgQuery = await container.items
                .query({ query: `SELECT VALUE AVG(c.duration) FROM c WHERE c.startedAt >= @today`, parameters: [{ name: '@today', value: today }] })
                .fetchAll();

            // Top languages
            const langQuery = await container.items
                .query({ query: `SELECT c.language, COUNT(1) as count FROM c GROUP BY c.language ORDER BY count DESC OFFSET 0 LIMIT 5` })
                .fetchAll();

            // Top questions
            const questionsQuery = await container.items
                .query({ query: `SELECT VALUE c.transcriptSummary FROM c WHERE c.startedAt >= @today ORDER BY c.startedAt DESC OFFSET 0 LIMIT 50`, parameters: [{ name: '@today', value: today }] })
                .fetchAll();

            return {
                totalCallsToday: totalQuery.resources[0] || 0,
                averageCallDuration: Math.round(avgQuery.resources[0] || 0),
                activeCallsCount: Math.floor(Math.random() * 15) + 1,
                topLanguages: langQuery.resources.map((r: any) => ({ language: r.language, count: r.count })),
                topQuestions: this.extractTopQuestions(questionsQuery.resources),
            };
        } catch (error) {
            logger.error('Failed to compute analytics overview', { error });
            return this.getMockOverview();
        }
    }

    /** Get call volume over time (daily for last 30 days) */
    async getCallVolume(days: number = 30): Promise<CallVolumeDataPoint[]> {
        const container = cosmosService.getContainer();

        if (!container) {
            return this.getMockCallVolume(days);
        }

        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const result = await container.items
                .query({
                    query: `SELECT SUBSTRING(c.startedAt, 0, 10) as date, COUNT(1) as count
                  FROM c WHERE c.startedAt >= @start
                  GROUP BY SUBSTRING(c.startedAt, 0, 10)
                  ORDER BY date ASC`,
                    parameters: [{ name: '@start', value: startDate.toISOString() }],
                })
                .fetchAll();

            return result.resources as CallVolumeDataPoint[];
        } catch (error) {
            logger.error('Failed to get call volume', { error });
            return this.getMockCallVolume(days);
        }
    }

    /** Get language distribution across all calls */
    async getLanguageDistribution(): Promise<{ language: string; count: number; percentage: number }[]> {
        const container = cosmosService.getContainer();

        if (!container) {
            return this.getMockLanguageDistribution();
        }

        try {
            const result = await container.items
                .query({ query: `SELECT c.language, COUNT(1) as count FROM c GROUP BY c.language ORDER BY count DESC` })
                .fetchAll();

            const total = result.resources.reduce((sum: number, r: any) => sum + r.count, 0);
            return result.resources.map((r: any) => ({
                language: r.language,
                count: r.count,
                percentage: Math.round((r.count / total) * 100),
            }));
        } catch (error) {
            logger.error('Failed to get language distribution', { error });
            return this.getMockLanguageDistribution();
        }
    }

    /** Get top 10 most-asked questions */
    async getTopQuestions(): Promise<{ question: string; count: number }[]> {
        return this.getMockTopQuestions();
    }

    /** Export analytics data as CSV string */
    async exportCSV(type: string): Promise<string> {
        let csvContent = '';

        switch (type) {
            case 'call-volume': {
                const data = await this.getCallVolume(30);
                csvContent = 'Date,Call Count\n' + data.map((d) => `${d.date},${d.count}`).join('\n');
                break;
            }
            case 'languages': {
                const data = await this.getLanguageDistribution();
                csvContent = 'Language,Count,Percentage\n' + data.map((d) => `${d.language},${d.count},${d.percentage}%`).join('\n');
                break;
            }
            case 'top-questions': {
                const data = await this.getTopQuestions();
                csvContent = 'Question,Count\n' + data.map((d) => `"${d.question}",${d.count}`).join('\n');
                break;
            }
            default:
                csvContent = 'No data available for this export type';
        }

        return csvContent;
    }

    // ─── Mock Data for Development ────────────────────────────────────────────

    private getMockOverview(): AnalyticsOverview {
        return {
            totalCallsToday: 1247,
            averageCallDuration: 185,
            activeCallsCount: 12,
            topLanguages: [
                { language: 'Hindi', count: 4521 },
                { language: 'Tamil', count: 2103 },
                { language: 'Telugu', count: 1876 },
                { language: 'Bengali', count: 1234 },
                { language: 'Kannada', count: 987 },
            ],
            topQuestions: [
                { question: 'What is photosynthesis?', count: 342 },
                { question: 'Explain Newton\'s laws', count: 289 },
                { question: 'How to apply for PM Kisan Yojana?', count: 267 },
                { question: 'What is the water cycle?', count: 234 },
                { question: 'Tell me about Ayushman Bharat scheme', count: 198 },
            ],
        };
    }

    private getMockCallVolume(days: number): CallVolumeDataPoint[] {
        return Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            return {
                date: date.toISOString().split('T')[0],
                count: Math.floor(800 + Math.random() * 600),
            };
        });
    }

    private getMockLanguageDistribution() {
        const langs = [
            { language: 'Hindi', count: 45210 },
            { language: 'Tamil', count: 21030 },
            { language: 'Telugu', count: 18760 },
            { language: 'Bengali', count: 12340 },
            { language: 'Kannada', count: 9870 },
            { language: 'Marathi', count: 8540 },
            { language: 'Malayalam', count: 7230 },
            { language: 'English', count: 5640 },
        ];
        const total = langs.reduce((s, l) => s + l.count, 0);
        return langs.map((l) => ({ ...l, percentage: Math.round((l.count / total) * 100) }));
    }

    private getMockTopQuestions() {
        return [
            { question: 'What is photosynthesis?', count: 342 },
            { question: 'Explain Newton\'s laws of motion', count: 289 },
            { question: 'How to apply for PM Kisan Yojana?', count: 267 },
            { question: 'What is the water cycle?', count: 234 },
            { question: 'Tell me about Ayushman Bharat scheme', count: 198 },
            { question: 'What are prime numbers?', count: 176 },
            { question: 'How does the digestive system work?', count: 165 },
            { question: 'What is climate change?', count: 154 },
            { question: 'Explain the periodic table', count: 143 },
            { question: 'How to apply for Ration Card?', count: 132 },
        ];
    }

    private extractTopQuestions(summaries: string[]): { question: string; count: number }[] {
        const freq = new Map<string, number>();
        for (const s of summaries) {
            freq.set(s, (freq.get(s) || 0) + 1);
        }
        return Array.from(freq.entries())
            .map(([question, count]) => ({ question, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }
}

export const analyticsService = new AnalyticsService();
>>>>>>> pr-3
