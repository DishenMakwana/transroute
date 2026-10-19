import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

interface GlobalWithPool {
  pgPool?: pg.Pool;
  drizzleDb?: NodePgDatabase<typeof schema>;
}

const globalWithPool = globalThis as unknown as GlobalWithPool;

let pool: pg.Pool;
let db: NodePgDatabase<typeof schema>;

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/transport_db";

if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: connectionString.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : undefined,
  });
  db = drizzle(pool, { schema });
} else {
  if (!globalWithPool.pgPool) {
    globalWithPool.pgPool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: connectionString.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined,
    });
    globalWithPool.drizzleDb = drizzle(globalWithPool.pgPool, { schema });
  }
  pool = globalWithPool.pgPool;
  db = globalWithPool.drizzleDb!;
}

export { pool, db };
