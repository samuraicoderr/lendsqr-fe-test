import { apiClient } from "../ApiClient";
import type { TransactionDetailData, TransactionsListRow, TransactionStatus } from "../types/transaction.types";

export interface TransactionListQuery {
  page?: number;
  limit?: number;
  user?: string;
  transaction_type?: string;
  channel?: string;
  status?: TransactionStatus;
}

export interface PaginatedTransactions {
  count: number;
  next: string | null;
  previous: string | null;
  results: TransactionsListRow[];
}

type CacheEntry<T> = { expiresAt: number; value: T };
const DEFAULT_STALE_TIME_MS = 30_000;

export class TransactionService {
  private static cache = new Map<string, CacheEntry<any>>();
  private static inflight = new Map<string, Promise<any>>();

  private static key(scope: string, value: unknown) { return `${scope}:${JSON.stringify(value ?? {})}`; }
  private static read<T>(key: string, staleTimeMs: number): T | null { const entry = this.cache.get(key) as CacheEntry<T> | undefined; if (!entry) return null; if (entry.expiresAt < Date.now()) { this.cache.delete(key); return null; } return entry.value; }
  private static write<T>(key: string, value: T, staleTimeMs: number) { this.cache.set(key, { expiresAt: Date.now() + staleTimeMs, value }); }
  private static invalidate(scope: string) { for (const cacheKey of this.cache.keys()) { if (cacheKey.startsWith(`${scope}:`)) this.cache.delete(cacheKey); } }

  static async getTransactions(query: TransactionListQuery = {}, options: { staleTimeMs?: number; forceRefresh?: boolean } = {}): Promise<PaginatedTransactions> {
    const staleTimeMs = options.staleTimeMs ?? DEFAULT_STALE_TIME_MS;
    const cacheKey = this.key("transactions:list", query);
    if (!options.forceRefresh) {
      const cached = this.read<PaginatedTransactions>(cacheKey, staleTimeMs);
      if (cached) return cached;
      const pending = this.inflight.get(cacheKey) as Promise<PaginatedTransactions> | undefined;
      if (pending) return pending;
    }

    const request = apiClient.get<PaginatedTransactions>("/mock-api/transactions", { requiresAuth: true, params: query })
      .then((res) => { this.write(cacheKey, res.data, staleTimeMs); return res.data; })
      .finally(() => { this.inflight.delete(cacheKey); });

    this.inflight.set(cacheKey, request);
    return request;
  }

  static async getTransactionById(id: string | number, options: { staleTimeMs?: number; forceRefresh?: boolean } = {}): Promise<TransactionDetailData> {
    const staleTimeMs = options.staleTimeMs ?? DEFAULT_STALE_TIME_MS;
    const cacheKey = this.key("transactions:detail", id);
    if (!options.forceRefresh) {
      const cached = this.read<TransactionDetailData>(cacheKey, staleTimeMs);
      if (cached) return cached;
      const pending = this.inflight.get(cacheKey) as Promise<TransactionDetailData> | undefined;
      if (pending) return pending;
    }

    const request = apiClient.get<TransactionDetailData>(`/mock-api/transactions/${id}`, { requiresAuth: true })
      .then((res) => { this.write(cacheKey, res.data, staleTimeMs); return res.data; })
      .finally(() => { this.inflight.delete(cacheKey); });

    this.inflight.set(cacheKey, request);
    return request;
  }

  static async patchTransaction(id: string | number, data: Partial<TransactionDetailData>): Promise<TransactionDetailData> {
    const res = await apiClient.patch<TransactionDetailData>(`/mock-api/transactions/${id}`, data, { requiresAuth: true });
    this.invalidate("transactions:list");
    this.cache.delete(this.key("transactions:detail", id));
    return res.data;
  }
}

export default TransactionService;
