// Client-side and server-safe local cache helper with TTL support

interface CachePayload<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

// In-memory fallback if sessionStorage / localStorage is unavailable
const memoryCache = new Map<string, CachePayload<unknown>>();

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function getLocalCache<T>(key: string): T | null {
  const now = Date.now();

  // Try window.sessionStorage first if in browser
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      const raw = window.sessionStorage.getItem(`tr_cache_${key}`);
      if (raw) {
        const payload = JSON.parse(raw) as CachePayload<T>;
        if (now - payload.timestamp < payload.ttlMs) {
          return payload.data;
        }
        window.sessionStorage.removeItem(`tr_cache_${key}`);
      }
    } catch {
      // Fall through to memoryCache on storage error or quota restrictions
    }
  }

  // Fallback to memory cache
  const mem = memoryCache.get(key) as CachePayload<T> | undefined;
  if (mem) {
    if (now - mem.timestamp < mem.ttlMs) {
      return mem.data;
    }
    memoryCache.delete(key);
  }

  return null;
}

export function setLocalCache<T>(
  key: string,
  data: T,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  const payload: CachePayload<T> = {
    data,
    timestamp: Date.now(),
    ttlMs,
  };

  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(`tr_cache_${key}`, JSON.stringify(payload));
    } catch {
      // Fallback to memoryCache if quota exceeded
    }
  }

  memoryCache.set(key, payload as CachePayload<unknown>);
}

export function clearLocalCache(prefix?: string): void {
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      if (prefix) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const k = window.sessionStorage.key(i);
          if (k && k.startsWith(`tr_cache_${prefix}`)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
      } else {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const k = window.sessionStorage.key(i);
          if (k && k.startsWith("tr_cache_")) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
      }
    } catch {
      // Ignore sessionStorage cleanup failure
    }
  }

  if (prefix) {
    for (const k of memoryCache.keys()) {
      if (k.startsWith(prefix)) {
        memoryCache.delete(k);
      }
    }
  } else {
    memoryCache.clear();
  }
}
