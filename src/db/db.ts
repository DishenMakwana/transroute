import "dotenv/config";
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

// Support both standard DATABASE_URL and Vercel Postgres POSTGRES_URL
const rawConnectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://postgres:postgres@localhost:5432/transport_db";

const connectionString = rawConnectionString.trim().replace(/^["']|["']$/g, "");

// Auto-detect cloud providers and parameters that mandate SSL
const isSslRequired =
  connectionString.includes("sslmode=require") ||
  connectionString.includes("neon.tech") ||
  connectionString.includes("supabase.co") ||
  connectionString.includes("vercel-storage.com") ||
  connectionString.includes("railway.app") ||
  connectionString.includes("render.com") ||
  connectionString.includes("aivencloud.com") ||
  process.env.DATABASE_SSL === "true";

const sslConfig = isSslRequired ? { rejectUnauthorized: false } : undefined;

if (process.env.NODE_ENV === "production") {
  // Conservative pool size for serverless lambda instances (e.g. Vercel)
  pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: sslConfig,
  });
  db = drizzle(pool, { schema });
} else {
  if (!globalWithPool.pgPool) {
    globalWithPool.pgPool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: sslConfig,
    });
    globalWithPool.drizzleDb = drizzle(globalWithPool.pgPool, { schema });
  }
  pool = globalWithPool.pgPool;
  db = globalWithPool.drizzleDb!;
}

export { pool, db };
