export type EntityId = string;
export type ISODateString = string;

// Allows known literal unions while remaining forward-compatible with new backend values.
export type ExtensibleStringUnion<T extends string> = T | (string & {});

export interface PaginatedListParams<TFilters extends Record<string, string> = Record<string, string>> {
  filters: TFilters;
  page: number;
  pageSize: number;
}

export interface PaginatedListResponse<TRow> {
  rows: TRow[];
  totalPages: number;
  totalItems: number;
}

export type EntityStateStatus = ExtensibleStringUnion<"Active" | "Inactive">;
