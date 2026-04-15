import { apiClient } from "../ApiClient";
import type { LoanDetailData, LoansListRow, LoanStatus } from "../types/loan.types";

export interface LoanListQuery {
  page?: number;
  limit?: number;
  loan_number?: string;
  borrower?: string;
  organization?: string;
  status?: LoanStatus;
  date?: string;
}

export interface PaginatedLoans {
  count: number;
  next: string | null;
  previous: string | null;
  results: LoansListRow[];
}

type CacheEntry<T> = { expiresAt: number; value: T };

const DEFAULT_STALE_TIME_MS = 30_000;

export class LoanService {
  private static cache = new Map<string, CacheEntry<any>>();
  private static inflight = new Map<string, Promise<any>>();

  private static key(scope: string, value: unknown) {
    return `${scope}:${JSON.stringify(value ?? {})}`;
  }

  private static read<T>(key: string, staleTimeMs: number): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  private static write<T>(key: string, value: T, staleTimeMs: number) {
    this.cache.set(key, { expiresAt: Date.now() + staleTimeMs, value });
  }

  private static invalidate(scope: string) {
    for (const cacheKey of this.cache.keys()) {
      if (cacheKey.startsWith(`${scope}:`)) {
        this.cache.delete(cacheKey);
      }
    }
  }

  static async getLoans(query: LoanListQuery = {}, options: { staleTimeMs?: number; forceRefresh?: boolean } = {}): Promise<PaginatedLoans> {
    const staleTimeMs = options.staleTimeMs ?? DEFAULT_STALE_TIME_MS;
    const cacheKey = this.key("loans:list", query);
    if (!options.forceRefresh) {
      const cached = this.read<PaginatedLoans>(cacheKey, staleTimeMs);
      if (cached) return cached;
      const pending = this.inflight.get(cacheKey) as Promise<PaginatedLoans> | undefined;
      if (pending) return pending;
    }

    const request = apiClient.get<PaginatedLoans>("/mock-api/loans", { requiresAuth: true, params: query })
      .then((res) => { this.write(cacheKey, res.data, staleTimeMs); return res.data; })
      .finally(() => { this.inflight.delete(cacheKey); });

    this.inflight.set(cacheKey, request);
    return request;
  }

  static async getLoanById(id: string | number, options: { staleTimeMs?: number; forceRefresh?: boolean } = {}): Promise<LoanDetailData> {
    const staleTimeMs = options.staleTimeMs ?? DEFAULT_STALE_TIME_MS;
    const cacheKey = this.key("loans:detail", id);
    if (!options.forceRefresh) {
      const cached = this.read<LoanDetailData>(cacheKey, staleTimeMs);
      if (cached) return cached;
      const pending = this.inflight.get(cacheKey) as Promise<LoanDetailData> | undefined;
      if (pending) return pending;
    }

    const request = apiClient.get<LoanDetailData>(`/mock-api/loans/${id}`, { requiresAuth: true })
      .then((res) => { this.write(cacheKey, res.data, staleTimeMs); return res.data; })
      .finally(() => { this.inflight.delete(cacheKey); });

    this.inflight.set(cacheKey, request);
    return request;
  }

  static async patchLoan(id: string | number, data: Partial<LoanDetailData>): Promise<LoanDetailData> {
    const res = await apiClient.patch<LoanDetailData>(`/mock-api/loans/${id}`, data, { requiresAuth: true });
    this.invalidate("loans:list");
    this.cache.delete(this.key("loans:detail", id));
    return res.data;
  }
}

export default LoanService;
