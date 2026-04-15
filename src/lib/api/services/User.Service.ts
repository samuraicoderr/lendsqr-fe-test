import { apiClient } from "../ApiClient";
import { BackendRoutes } from "../../BackendLinks";
import type { UserDetailsData, UserListRow, UserStatus } from "../types/user.types";

export interface UserListQuery {
  page?: number;
  limit?: number;
  organization?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  date?: string;
  status?: UserStatus;
  sortBy?: keyof UserListRow;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserListRow[];
}

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const DEFAULT_STALE_TIME_MS = 30_000;

export class UserService {
  private static readonly cache = new Map<string, CacheEntry<any>>();
  private static readonly inflight = new Map<string, Promise<any>>();

  private static buildCacheKey(scope: string, value: unknown): string {
    return `${scope}:${JSON.stringify(value ?? {})}`;
  }

  private static readCache<T>(key: string, staleTimeMs: number): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  private static writeCache<T>(key: string, value: T, staleTimeMs: number): void {
    this.cache.set(key, {
      expiresAt: Date.now() + staleTimeMs,
      value,
    });
  }

  private static invalidateScope(scope: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${scope}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /** Fetch paginated user list (admin) */
  static async getUsers(
    params: UserListQuery = {},
    options: { staleTimeMs?: number; forceRefresh?: boolean } = {}
  ): Promise<PaginatedUsers> {
    const staleTimeMs = options.staleTimeMs ?? DEFAULT_STALE_TIME_MS;
    const cacheKey = this.buildCacheKey("users:list", params);

    if (!options.forceRefresh) {
      const cached = this.readCache<PaginatedUsers>(cacheKey, staleTimeMs);
      if (cached) {
        return cached;
      }

      const cachedPromise = this.inflight.get(cacheKey) as Promise<PaginatedUsers> | undefined;
      if (cachedPromise) {
        return cachedPromise;
      }
    }

    const request = apiClient
      .get<PaginatedUsers>(BackendRoutes.getUsers, {
        requiresAuth: true,
        params,
      })
      .then((res) => {
        this.writeCache(cacheKey, res.data, staleTimeMs);
        return res.data;
      })
      .finally(() => {
        this.inflight.delete(cacheKey);
      });

    this.inflight.set(cacheKey, request);
    return request;
  }

  /** Fetch a user by ID */
  static async getUserById(
    id: string | number,
    options: { staleTimeMs?: number; forceRefresh?: boolean } = {}
  ): Promise<UserDetailsData> {
    const staleTimeMs = options.staleTimeMs ?? DEFAULT_STALE_TIME_MS;
    const cacheKey = this.buildCacheKey("users:detail", id);

    if (!options.forceRefresh) {
      const cached = this.readCache<UserDetailsData>(cacheKey, staleTimeMs);
      if (cached) {
        return cached;
      }

      const cachedPromise = this.inflight.get(cacheKey) as Promise<UserDetailsData> | undefined;
      if (cachedPromise) {
        return cachedPromise;
      }
    }

    const request = apiClient
      .get<UserDetailsData>(BackendRoutes.getUser(String(id)), {
        requiresAuth: true,
      })
      .then((res) => {
        this.writeCache(cacheKey, res.data, staleTimeMs);
        return res.data;
      })
      .finally(() => {
        this.inflight.delete(cacheKey);
      });

    this.inflight.set(cacheKey, request);
    return request;
  }

  /** Update a user by ID */
  static async updateUser(
    id: string | number,
    data: Partial<UserDetailsData>
  ): Promise<UserDetailsData> {
    const res = await apiClient.put<UserDetailsData>(BackendRoutes.getUser(String(id)), data, {
      requiresAuth: true,
    });

    this.invalidateScope("users:list");
    this.cache.delete(this.buildCacheKey("users:detail", id));

    return res.data;
  }

  /** Patch a user by ID */
  static async patchUser(
    id: string | number,
    data: Partial<UserDetailsData>
  ): Promise<UserDetailsData> {
    const res = await apiClient.patch<UserDetailsData>(BackendRoutes.getUser(String(id)), data, {
      requiresAuth: true,
    });

    this.invalidateScope("users:list");
    this.cache.delete(this.buildCacheKey("users:detail", id));

    return res.data;
  }
}

export default UserService;
