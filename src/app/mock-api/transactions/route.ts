import { NextRequest, NextResponse } from "next/server";
import { transactionsListData } from "./data";
import type { TransactionStatus } from "@/lib/api/types/transaction.types";

const DEFAULT_PAGE_SIZE = 10;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(Number(params.get("page") ?? 1) || 1, 1);
  const limit = Math.max(Number(params.get("limit") ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE, 1);
  const user = params.get("user");
  const transactionType = params.get("transaction_type");
  const channel = params.get("channel");
  const status = params.get("status") as TransactionStatus | null;

  const filtered = transactionsListData.filter((item) => {
    const matchesUser = !user || item.user.toLowerCase().includes(normalize(user));
    const matchesType = !transactionType || item.transaction_type === transactionType;
    const matchesChannel = !channel || item.channel === channel;
    const matchesStatus = !status || normalize(item.status) === normalize(status);
    return matchesUser && matchesType && matchesChannel && matchesStatus;
  });

  const count = filtered.length;
  const totalPages = Math.max(1, Math.ceil(count / limit));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * limit;
  const results = filtered.slice(start, start + limit);

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

  return NextResponse.json({ count, next: next?.toString() ?? null, previous: previous?.toString() ?? null, results });
}
