import { NextRequest, NextResponse } from "next/server";
import { loansListData } from "./data";
import type { LoansListRow, LoanStatus } from "@/lib/api/types/loan.types";

const DEFAULT_PAGE_SIZE = 10;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(Number(params.get("page") ?? 1) || 1, 1);
  const limit = Math.max(Number(params.get("limit") ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE, 1);
  const loanNumber = params.get("loan_number");
  const borrower = params.get("borrower");
  const organization = params.get("organization");
  const status = params.get("status") as LoanStatus | null;
  const date = params.get("date");

  const filtered = loansListData.filter((item) => {
    const matchesLoan = !loanNumber || item.loan_number.toLowerCase().includes(normalize(loanNumber));
    const matchesBorrower = !borrower || item.borrower.toLowerCase().includes(normalize(borrower));
    const matchesOrg = !organization || normalize(item.organization) === normalize(organization);
    const matchesStatus = !status || normalize(item.status) === normalize(status);
    const matchesDate = !date || item.date === date;
    return matchesLoan && matchesBorrower && matchesOrg && matchesStatus && matchesDate;
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
