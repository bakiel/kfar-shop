declare module 'pg' {
  export interface QueryResult<R = any> {
    rows: R[];
    rowCount: number | null;
  }

  export interface PoolConfig {
    connectionString?: string;
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
    keepAlive?: boolean;
    keepAliveInitialDelayMillis?: number;
    ssl?: boolean | { rejectUnauthorized?: boolean };
  }

  export interface PoolClient {
    query<R = any>(text: string, params?: any[]): Promise<QueryResult<R>>;
    release(): void;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<R = any>(text: string, params?: any[]): Promise<QueryResult<R>>;
    connect(): Promise<PoolClient>;
    on(event: 'connect' | 'error', listener: (...args: any[]) => void): this;
  }
}
