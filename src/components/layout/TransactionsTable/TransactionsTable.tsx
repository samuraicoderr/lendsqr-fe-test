"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";

type TxRecord = { id: string; reference: string; user: string; transaction_type: string; amount: number; currency: string; channel: string; description: string; status: string; date: string };
type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: TxRecord[]; totalPages: number; totalItems: number };
const PAGE_SIZE = 10;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtCurrency = (v: number, c: string) => `${c === "NGN" ? "₦" : c}${v.toLocaleString("en-US")}`;
const seed: TxRecord[] = [
	{ id: "1", reference: "TXN-20260410-001", user: "Adeyemi Okafor", transaction_type: "Loan Disbursement", amount: 250000, currency: "NGN", channel: "Bank Transfer", description: "Micro loan disbursement", status: "Completed", date: "2026-04-10T09:30:00" },
	{ id: "2", reference: "TXN-20260410-002", user: "Tolani Bakare", transaction_type: "Loan Repayment", amount: 45000, currency: "NGN", channel: "Card Payment", description: "Monthly repayment", status: "Completed", date: "2026-04-10T10:15:00" },
	{ id: "3", reference: "TXN-20260409-003", user: "Obinna Chukwu", transaction_type: "Savings Deposit", amount: 100000, currency: "NGN", channel: "Bank Transfer", description: "Fixed deposit", status: "Completed", date: "2026-04-09T14:20:00" },
	{ id: "4", reference: "TXN-20260409-004", user: "Khadija Ibrahim", transaction_type: "Savings Withdrawal", amount: 50000, currency: "NGN", channel: "Bank Transfer", description: "Partial withdrawal", status: "Processing", date: "2026-04-09T16:45:00" },
	{ id: "5", reference: "TXN-20260408-005", user: "David Nwankwo", transaction_type: "Loan Repayment", amount: 75000, currency: "NGN", channel: "USSD", description: "Overdue payment", status: "Failed", date: "2026-04-08T11:00:00" },
	{ id: "6", reference: "TXN-20260408-006", user: "Favour Adichie", transaction_type: "Fee Payment", amount: 2500, currency: "NGN", channel: "Auto Debit", description: "Late payment fee", status: "Completed", date: "2026-04-08T12:30:00" },
	{ id: "7", reference: "TXN-20260407-007", user: "Kingsley Obi", transaction_type: "Loan Disbursement", amount: 500000, currency: "NGN", channel: "Bank Transfer", description: "Business loan disbursement", status: "Completed", date: "2026-04-07T08:00:00" },
	{ id: "8", reference: "TXN-20260407-008", user: "Gloria Osei", transaction_type: "Savings Deposit", amount: 25000, currency: "NGN", channel: "Card Payment", description: "Regular savings", status: "Completed", date: "2026-04-07T09:45:00" },
	{ id: "9", reference: "TXN-20260406-009", user: "Samuel Ogundipe", transaction_type: "Loan Repayment", amount: 120000, currency: "NGN", channel: "Bank Transfer", description: "Quarterly repayment", status: "Completed", date: "2026-04-06T13:20:00" },
	{ id: "10", reference: "TXN-20260406-010", user: "Josephine Nwosu", transaction_type: "Savings Withdrawal", amount: 200000, currency: "NGN", channel: "Bank Transfer", description: "Target savings payout", status: "Completed", date: "2026-04-06T15:10:00" },
	{ id: "11", reference: "TXN-20260405-011", user: "Ibrahim Bello", transaction_type: "Fee Payment", amount: 1500, currency: "NGN", channel: "Auto Debit", description: "Processing fee", status: "Completed", date: "2026-04-05T10:45:00" },
	{ id: "12", reference: "TXN-20260405-012", user: "Mary Johnson", transaction_type: "Loan Disbursement", amount: 150000, currency: "NGN", channel: "Bank Transfer", description: "Salary advance", status: "Pending", date: "2026-04-05T11:30:00" },
];
let db: TxRecord[] = [...seed];
const listTx = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((i) => { const u = !filters.user || i.user.toLowerCase().includes(filters.user.toLowerCase()); const t = !filters.transaction_type || i.transaction_type === filters.transaction_type; const s = !filters.status || i.status.toLowerCase() === filters.status.toLowerCase(); const ch = !filters.channel || i.channel === filters.channel; return u && t && s && ch; });
	const tp = Math.max(1, Math.ceil(filtered.length / pageSize)); const cp = Math.min(page, tp); const start = (cp - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages: tp, totalItems: filtered.length };
};
export default function TransactionsTable() {
	const router = useRouter();
	const [rows, setRows] = useState<TxRecord[]>([]); const [loading, setLoading] = useState(true); const [page, setPage] = useState(1); const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE); const [totalPages, setTotalPages] = useState(1); const [totalItems, setTotalItems] = useState(0); const [filters, setFilters] = useState<FilterValues>({});
	const runList = useCallback(async () => { setLoading(true); try { const res = await listTx({ filters, page, pageSize: itemsPerPage }); setRows(res.rows); setTotalPages(res.totalPages); setTotalItems(res.totalItems); } finally { setLoading(false); } }, [filters, itemsPerPage, page]);
	useEffect(() => { runList(); }, [runList]);
	const columns: Column<TxRecord>[] = useMemo(() => [
		{ key: "reference", title: "REFERENCE", sortable: true },
		{ key: "user", title: "USER", sortable: true, filterable: true },
		{ key: "transaction_type", title: "TYPE", sortable: true, filterable: true },
		{ key: "amount", title: "AMOUNT", sortable: true, render: (v: number, row: TxRecord) => fmtCurrency(v, row.currency) },
		{ key: "channel", title: "CHANNEL", sortable: true, filterable: true },
		{ key: "description", title: "DESCRIPTION", sortable: false },
		{ key: "status", title: "STATUS", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v} /> },
		{ key: "date", title: "DATE", sortable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); } },
	], []);
	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "user", label: "User", type: "text", placeholder: "Enter name" },
		{ key: "transaction_type", label: "Type", type: "select", options: Array.from(new Set(seed.map((s) => s.transaction_type))).map((t) => ({ label: t, value: t })) },
		{ key: "channel", label: "Channel", type: "select", options: Array.from(new Set(seed.map((s) => s.channel))).map((c) => ({ label: c, value: c })) },
		{ key: "status", label: "Status", type: "select", options: [{ label: "Completed", value: "Completed" }, { label: "Processing", value: "Processing" }, { label: "Pending", value: "Pending" }, { label: "Failed", value: "Failed" }] },
	], []);
	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);
	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: TxRecord) => { router.push(FrontendLinks.transactionDetails(row.id)); } },
		{ id: "retry", label: "Retry", icon: <img src="/media/icons/sliders.svg" alt="" width={16} height={16} />, onClick: async (row: TxRecord) => { setLoading(true); db = db.map((t) => t.id === row.id ? { ...t, status: "Processing" } : t); await runList(); } },
	], [runList]);
	return (<GenericTable<TxRecord> columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No transactions found" onRowClick={(row) => router.push(FrontendLinks.transactionDetails(row.id))} pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }} />);
}
