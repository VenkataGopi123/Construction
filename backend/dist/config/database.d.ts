import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
export declare const pool: Pool;
export declare function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
export declare function getClient(): Promise<PoolClient>;
export declare function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
export declare function testConnection(): Promise<boolean>;
//# sourceMappingURL=database.d.ts.map