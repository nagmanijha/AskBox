import { Pool } from 'pg';
import { config } from '../config';
import { logger } from '../config/logger';

/** PostgreSQL connection pool — reused across all requests */
export const pool = new Pool({
    connectionString: config.databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    logger.error('Unexpected PostgreSQL pool error', { error: err.message });
});

/** Test database connectivity */
export async function testConnection(): Promise<void> {
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        logger.info('PostgreSQL connection established successfully');
    } catch (error) {
        logger.error('Failed to connect to PostgreSQL', { error });
        throw error;
    }
}
