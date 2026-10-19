# Memory — Backend Architecture

## Storage Engine (`src/db/storage.ts`)
- Implements hybrid fallback: tests active PostgreSQL connection; if unavailable, falls back to deeply-cloned in-memory seed dataset.
- Ultra-fast 60-second in-memory query cache (`CacheEntry<T>`) for sub-millisecond route searches.
- Parallel database queries via `Promise.all` — zero sequential query waterfalls.

## IST Business Hours Evaluation
- Calculates live time in UTC+5:30 (Indian Standard Time).
- Safely evaluates overnight facilities (e.g., 20:00 to 06:00).
