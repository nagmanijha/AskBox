<<<<<<< HEAD
import { Pool } from 'pg';
/** PostgreSQL connection pool — reused across all requests */
export declare const pool: Pool;
/** Test database connectivity — non-fatal in dev mode */
export declare function testConnection(): Promise<void>;
=======
import { Pool } from 'pg';
/** PostgreSQL connection pool — reused across all requests */
export declare const pool: Pool;
/** Test database connectivity */
export declare function testConnection(): Promise<void>;
>>>>>>> pr-3
//# sourceMappingURL=connection.d.ts.map