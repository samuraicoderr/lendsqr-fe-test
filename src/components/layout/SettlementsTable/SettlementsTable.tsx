"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";

type SetRecord = { id: string; period_start: string; period_end: string; organization: string; total_transactions: number; total_amount: number; total_fees: number; net_amount: number; status: string; settled_at: string };
type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: SetRecord[]; totalPages: number; totalItems: number };
const PAGE_SIZE = 10; const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtCurrency = (v: number) => `₦${v.toLocaleString("en-US")}`;
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };
const seed: SetRecord[] = [
	{ id: "1", period_start: "2026-04-01", period_end: "2026-04-07", organization: "Lendsqr HQ", total_transactions: 342, total_amount: 45000000, total_fees: 675000, net_amount: 44325000, status: "Completed", settled_at: "2026-04-09" },
	{ id: "2", period_start: "2026-03-25", period_end: "2026-03-31", organization: "Lendsqr Finance", total_transactions: 218, total_amount: 28000000, total_fees: 420000, net_amount: 27580000, status: "Completed", settled_at: "2026-04-02" },
	{ id: "3", period_start: "2026-04-08", period_end: "2026-04-14", organization: "Lendsqr HQ", total_transactions: 156, total_amount: 32000000, total_fees: 480000, net_amount: 31520000, status: "Processing", settled_at: "" },
	{ id: "4", period_start: "2026-03-18", period_end: "2026-03-24", organization: "Lendsqr Labs", total_transactions: 89, total_amount: 12500000, total_fees: 187500, net_amount: 12312500, status: "Completed", settled_at: "2026-03-26" },
	{ id: "5", period_start: "2026-03-11", period_end: "2026-03-17", organization: "Lendsqr HQ", total_transactions: 401, total_amount: 52000000, total_fees: 780000, net_amount: 51220000, status: "Completed", settled_at: "2026-03-19" },
	{ id: "6", period_start: "2026-04-08", period_end: "2026-04-14", organization: "Lendsqr Finance", total_transactions: 134, total_amount: 18000000, total_fees: 270000, net_amount: 17730000, status: "Pending", settled_at: "" },
	{ id: "7", period_start: "2026-03-04", period_end: "2026-03-10", organization: "Lendsqr Labs", total_transactions: 67, total_amount: 8500000, total_fees: 127500, net_amount: 8372500, status: "Completed", settled_at: "2026-03-12" },
	{ id: "8", period_start: "2026-02-25", period_end: "2026-03-03", organization: "Lendsqr HQ", total_transactions: 389, total_amount: 48000000, total_fees: 720000, net_amount: 47280000, status: "Completed", settled_at: "2026-03-05" },
];
let db: SetRecord[] = [...seed];
const listSet = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((i) => { const o = !filters.organization || i.organization === filters.organization; const s = !filters.status || i.status.toLowerCase() === filters.status.toLowerCase(); return o && s; });
	const tp = Math.max(1, Math.ceil(filtered.length / pageSize)); const cp = Math.min(page, tp); const start = (cp - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages: tp, totalItems: filtered.length };
};
export default function SettlementsTable() {
	const router = useRouter();
	const [rows, setRows] = useState<SetRecord[]>([]); const [loading, setLoading] = useState(true); const [page, setPage] = useState(1); const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE); const [totalPages, setTotalPages] = useState(1); const [totalItems, setTotalItems] = useState(0); const [filters, setFilters] = useState<FilterValues>({});
	const runList = useCallback(async () => { setLoading(true); try { const res = await listSet({ filters, page, pageSize: itemsPerPage }); setRows(res.rows); setTotalPages(res.totalPages); setTotalItems(res.totalItems); } finally { setLoading(false); } }, [filters, itemsPerPage, page]);
	useEffect(() => { runList(); }, [runList]);
	const columns: Column<SetRecord>[] = useMemo(() => [
		{ key: "period_start", title: "PERIOD START", sortable: true, render: (v: string) => fmtDate(v) },
		{ key: "period_end", title: "PERIOD END", sortable: true, render: (v: string) => fmtDate(v) },
		{ key: "organization", title: "ORGANIZATION", sortable: true, filterable: true },
		{ key: "total_transactions", title: "TRANSACTIONS", sortable: true },
		{ key: "total_amount", title: "TOTAL AMOUNT", sortable: true, render: (v: number) => fmtCurrency(v) },
		{ key: "total_fees", title: "FEES", sortable: true, render: (v: number) => fmtCurrency(v) },
		{ key: "net_amount", title: "NET AMOUNT", sortable: true, render: (v: number) => fmtCurrency(v) },
		{ key: "status", title: "STATUS", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v} /> },
		{ key: "settled_at", title: "SETTLED ON", sortable: true, render: (v: string) => fmtDate(v) },
	], []);
	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "organization", label: "Organization", type: "select", options: [{ label: "Lendsqr HQ", value: "Lendsqr HQ" }, { label: "Lendsqr Finance", value: "Lendsqr Finance" }, { label: "Lendsqr Labs", value: "Lendsqr Labs" }] },
		{ key: "status", label: "Status", type: "select", options: [{ label: "Completed", value: "Completed" }, { label: "Processing", value: "Processing" }, { label: "Pending", value: "Pending" }] },
	], []);
	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);
	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: SetRecord) => { router.push(FrontendLinks.settlementDetails(row.id)); } },
	], []);
	return (<GenericTable<SetRecord> columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No settlements found" pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }} />);
}
