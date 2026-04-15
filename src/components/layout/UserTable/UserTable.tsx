"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GenericTable, {
  Column,
  FilterConfig,
  FilterValues,
  RowAction,
} from "@/components/layout/GenericTable/GenericTable";
import UserService, { type UserListQuery } from "@/lib/api/services/User.Service";
import type { UserListRow, UserStatus } from "@/lib/api/types/user.types";

const PAGE_SIZE = 10;
const ORGANIZATION_CACHE_TTL = 5 * 60 * 1000;
const USERS_CACHE_TTL = 30 * 1000;

function toFilterQuery(filters: FilterValues): UserListQuery {
  return {
    organization: filters.organization || undefined,
    username: filters.username || undefined,
    email: filters.email || undefined,
    phone_number: filters.phone_number || undefined,
    date: filters.date || undefined,
    status: (filters.status as UserStatus) || undefined,
  };
}

export default function UserTable() {
  const router = useRouter();
  const [rows, setRows] = useState<UserListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<FilterValues>({});
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadOrganizations = useCallback(async () => {
    try {
      const response = await UserService.getUsers(
        { page: 1, limit: 1000 },
        { staleTimeMs: ORGANIZATION_CACHE_TTL }
      );
      const nextOrganizations = Array.from(
        new Set(response.results.map((user) => user.organization))
      ).sort((left, right) => left.localeCompare(right));
      setOrganizations(nextOrganizations);
    } catch (organizationError) {
      console.error("[UserTable] Failed to load organizations:", organizationError);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await UserService.getUsers(
        {
          page,
          limit: itemsPerPage,
          ...toFilterQuery(filters),
        },
        { staleTimeMs: USERS_CACHE_TTL }
      );

      setRows(response.results);
      setTotalItems(response.count);
      setTotalPages(Math.max(1, Math.ceil(response.count / itemsPerPage)));
    } catch (userError) {
      console.error("[UserTable] Failed to load users:", userError);
      setRows([]);
      setTotalItems(0);
      setTotalPages(1);
      setError(userError instanceof Error ? userError.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage, page]);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const columns: Column<UserListRow>[] = useMemo(
    () => [
      { key: "organization", title: "ORGANIZATION", sortable: true, filterable: true },
      { key: "username", title: "USERNAME", sortable: true, filterable: true },
      {
        key: "email",
        title: "EMAIL",
        sortable: true,
        filterable: true,
        render: (value: string) => (
          <a
            href={`mailto:${value}`}
            className="inline-link"
            onClick={(event) => event.stopPropagation()}
          >
            {value}
          </a>
        ),
      },
      {
        key: "phone_number",
        title: "PHONE NUMBER",
        sortable: true,
        filterable: true,
        render: (value: string) => (
          <a
            href={`tel:${value.replace(/\s+/g, "")}`}
            className="inline-link"
            onClick={(event) => event.stopPropagation()}
          >
            {value}
          </a>
        ),
      },
      {
        key: "date",
        title: "DATE JOINED",
        sortable: true,
        filterable: true,
        render: (value: string) => {
          const parsed = new Date(value);
          return Number.isNaN(parsed.getTime())
            ? value
            : parsed.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
        },
      },
      { key: "status", title: "STATUS", sortable: true, filterable: true },
    ],
    []
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "organization",
        label: "Organization",
        type: "select",
        options: organizations.map((organization) => ({ label: organization, value: organization })),
      },
      { key: "username", label: "Username", type: "text", placeholder: "Enter username" },
      { key: "email", label: "Email", type: "email", placeholder: "Enter email" },
      { key: "date", label: "Date", type: "date" },
      { key: "phone_number", label: "Phone Number", type: "phone", placeholder: "Enter phone number" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "Active" },
          { label: "Inactive", value: "Inactive" },
          { label: "Pending", value: "Pending" },
          { label: "Blacklisted", value: "Blacklisted" },
        ],
      },
    ],
    [organizations]
  );

  const handleFilter = useCallback((nextFilters: FilterValues) => {
    setPage(1);
    setFilters(nextFilters);
  }, []);

  const handleReset = useCallback(() => {
    setPage(1);
    setFilters({});
  }, []);

  const handleItemsPerPageChange = useCallback((nextItemsPerPage: number) => {
    setItemsPerPage(nextItemsPerPage);
    setPage(1);
  }, []);

  const reloadUsers = useCallback(async () => {
    await loadUsers();
  }, [loadUsers]);

  const rowActions: RowAction[] = useMemo(
    () => [
      {
        id: "view-details",
        label: "View Details",
        icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />,
        onClick: (row: UserListRow) => {
          router.push(`/dashboard/users/${row.id}`);
        },
      },
      {
        id: "blacklist-user",
        label: "Blacklist User",
        icon: <img src="/media/icons/userx.svg" alt="" width={16} height={16} />,
        onClick: async (row: UserListRow) => {
          setLoading(true);
          try {
            await UserService.patchUser(row.id, { status: "Blacklisted" });
            await reloadUsers();
          } finally {
            setLoading(false);
          }
        },
      },
      {
        id: "activate-user",
        label: "Activate User",
        icon: <img src="/media/icons/user-activate.svg" alt="" width={16} height={16} />,
        onClick: async (row: UserListRow) => {
          setLoading(true);
          try {
            await UserService.patchUser(row.id, { status: "Active" });
            await reloadUsers();
          } finally {
            setLoading(false);
          }
        },
      },
    ],
    [reloadUsers, router]
  );

  return (
    <div>
      {error ? (
        <div style={{ marginBottom: 16, color: "#E4033B" }} role="alert">
          {error}
        </div>
      ) : null}

      <GenericTable<UserListRow>
        columns={columns}
        data={rows}
        filters={filterConfig}
        rowActions={rowActions}
        showRowActions
        onFilter={handleFilter}
        onReset={handleReset}
        onRowClick={(row) => router.push(`/dashboard/users/${row.id}`)}
        loading={loading}
        emptyMessage="No users found"
        pagination={{
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setPage,
          onItemsPerPageChange: handleItemsPerPageChange,
        }}
      />
    </div>
  );
}
