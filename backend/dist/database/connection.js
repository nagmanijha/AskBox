<<<<<<< HEAD
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testConnection = testConnection;
const pg_1 = require("pg");
const config_1 = require("../config");
const logger_1 = require("../config/logger");
/** PostgreSQL connection pool — reused across all requests */
exports.pool = new pg_1.Pool({
    connectionString: config_1.config.databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
exports.pool.on('error', (err) => {
    logger_1.logger.error('Unexpected PostgreSQL pool error', { error: err.message });
});
/** Test database connectivity — non-fatal in dev mode */
async function testConnection() {
    try {
        const client = await exports.pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        logger_1.logger.info('PostgreSQL connection established successfully');
    }
    catch (error) {
        logger_1.logger.warn('PostgreSQL not available — running in mock/limited mode. Knowledge base, auth and settings endpoints will not work until Postgres is running.', { error });
        // Do NOT throw — let the server start so the voice pipeline and mock APIs still work
    }
}
=======
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.testConnection = testConnection;
const pg_1 = require("pg");
const config_1 = require("../config");
const logger_1 = require("../config/logger");
/** PostgreSQL connection pool — reused across all requests */
exports.pool = new pg_1.Pool({
    connectionString: config_1.config.databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
exports.pool.on('error', (err) => {
    logger_1.logger.error('Unexpected PostgreSQL pool error', { error: err.message });
});
/** Test database connectivity */
async function testConnection() {
    try {
        const client = await exports.pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        logger_1.logger.info('PostgreSQL connection established successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to PostgreSQL', { error });
        throw error;
    }
}
>>>>>>> pr-3
//# sourceMappingURL=connection.js.map