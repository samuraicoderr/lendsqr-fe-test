import { NextRequest, NextResponse } from "next/server";
import data from "./data";
import type { UserDetailsData, UserListRow, UserStatus } from "@/lib/api/types/user.types";

const PAGE_SIZE_DEFAULT = 10;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "").toLowerCase();
}

function toListRow(user: UserDetailsData): UserListRow {
  return {
    id: user.id,
    organization: user.organization ?? "Lendsqr",
    username: user.username ?? user.personalInfo.fullName,
    email: user.email ?? user.personalInfo.email,
    phone_number: user.phone_number ?? user.personalInfo.phoneNumber,
    date: user.date ?? "2023-01-01",
    status: (user.status ?? "Active") as UserStatus,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(Number(searchParams.get("page") ?? 1) || 1, 1);
  const limit = Math.max(Number(searchParams.get("limit") ?? PAGE_SIZE_DEFAULT) || PAGE_SIZE_DEFAULT, 1);
  const organization = searchParams.get("organization");
  const username = searchParams.get("username");
  const email = searchParams.get("email");
  const phoneNumber = searchParams.get("phone_number");
  const date = searchParams.get("date");
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy") as keyof UserListRow | null;
  const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc";

  const rows = data.map(toListRow);

  const filtered = rows.filter((user) => {
    const matchesOrganization = !organization || normalize(user.organization) === normalize(organization);
    const matchesUsername = !username || normalize(user.username).includes(normalize(username));
    const matchesEmail = !email || normalize(user.email).includes(normalize(email));
    const matchesPhone = !phoneNumber || normalizePhone(user.phone_number).includes(normalizePhone(phoneNumber));
    const matchesDate = !date || user.date === date;
    const matchesStatus = !status || normalize(user.status).includes(normalize(status));

    return (
      matchesOrganization &&
      matchesUsername &&
      matchesEmail &&
      matchesPhone &&
      matchesDate &&
      matchesStatus
    );
  });

  const sorted = sortBy
    ? [...filtered].sort((left, right) => {
        const leftValue = String(left[sortBy] ?? "").toLowerCase();
        const rightValue = String(right[sortBy] ?? "").toLowerCase();

        if (leftValue < rightValue) return sortOrder === "asc" ? -1 : 1;
        if (leftValue > rightValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      })
    : filtered;

  const count = sorted.length;
  const totalPages = Math.max(1, Math.ceil(count / limit));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * limit;
  const results = sorted.slice(start, start + limit);

  const next = currentPage < totalPages ? new URL(request.url) : null;
  if (next) {
    next.searchParams.set("page", String(currentPage + 1));
    next.searchParams.set("limit", String(limit));
  }

  const previous = currentPage > 1 ? new URL(request.url) : null;
  if (previous) {
    previous.searchParams.set("page", String(currentPage - 1));
    previous.searchParams.set("limit", String(limit));
  }

  return NextResponse.json({
    count,
    next: next?.toString() ?? null,
    previous: previous?.toString() ?? null,
    results,
  });
}
