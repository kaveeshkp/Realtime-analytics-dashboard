interface CacheEntry<T> {
  data:      T;
  expiresAt: number;
}

const MAX_SIZE = 500; // safety cap — prevents unbounded memory growth

class TtlCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlSeconds: number): void {
    // Evict oldest (first) entry when at capacity
    if (this.store.size >= MAX_SIZE && !this.store.has(key)) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) this.store.delete(firstKey);
    }
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

export const cache = new TtlCache();
