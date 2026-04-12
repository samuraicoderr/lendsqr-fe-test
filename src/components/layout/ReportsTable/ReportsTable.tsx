"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";

type RptRecord = { id: string; name: string; report_type: string; schedule: string; format: string; generated_by: string; last_generated: string; file_size: string; status: string; date: string };
type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: RptRecord[]; totalPages: number; totalItems: number };
const PAGE_SIZE = 10; const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };
const seed: RptRecord[] = [
	{ id: "1", name: "Monthly Loan Portfolio", report_type: "Loan", schedule: "Monthly", format: "PDF", generated_by: "System", last_generated: "2026-04-01", file_size: "2.4 MB", status: "Active", date: "2022-01-01" },
	{ id: "2", name: "Weekly Transaction Summary", report_type: "Transaction", schedule: "Weekly", format: "Excel", generated_by: "System", last_generated: "2026-04-07", file_size: "1.8 MB", status: "Active", date: "2022-01-01" },
	{ id: "3", name: "User Growth Analytics", report_type: "User", schedule: "Monthly", format: "PDF", generated_by: "Admin User", last_generated: "2026-04-01", file_size: "3.1 MB", status: "Active", date: "2022-06-15" },
	{ id: "4", name: "Savings Deposit Report", report_type: "Savings", schedule: "Daily", format: "CSV", generated_by: "System", last_generated: "2026-04-12", file_size: "0.8 MB", status: "Active", date: "2023-01-10" },
	{ id: "5", name: "Delinquency Report", report_type: "Loan", schedule: "Weekly", format: "PDF", generated_by: "System", last_generated: "2026-04-07", file_size: "1.2 MB", status: "Active", date: "2022-03-20" },
	{ id: "6", name: "KYC Compliance Report", report_type: "Compliance", schedule: "Monthly", format: "PDF", generated_by: "Compliance Officer", last_generated: "2026-04-01", file_size: "4.5 MB", status: "Active", date: "2022-09-01" },
	{ id: "7", name: "Settlement Reconciliation", report_type: "Settlement", schedule: "Daily", format: "Excel", generated_by: "System", last_generated: "2026-04-12", file_size: "0.5 MB", status: "Active", date: "2023-06-01" },
	{ id: "8", name: "Revenue Analysis", report_type: "Financial", schedule: "Quarterly", format: "PDF", generated_by: "Finance Team", last_generated: "2026-03-31", file_size: "5.2 MB", status: "Active", date: "2022-01-01" },
	{ id: "9", name: "Dormant Accounts Report", report_type: "Savings", schedule: "Monthly", format: "CSV", generated_by: "System", last_generated: "2026-04-01", file_size: "0.3 MB", status: "Inactive", date: "2023-09-15" },
	{ id: "10", name: "Audit Trail Export", report_type: "Audit", schedule: "On Demand", format: "CSV", generated_by: "Admin User", last_generated: "2026-04-10", file_size: "12.1 MB", status: "Active", date: "2022-01-01" },
];
let db: RptRecord[] = [...seed];
const listRpt = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((i) => { const n = !filters.name || i.name.toLowerCase().includes(filters.name.toLowerCase()); const t = !filters.report_type || i.report_type === filters.report_type; const s = !filters.schedule || i.schedule === filters.schedule; const st = !filters.status || i.status.toLowerCase() === filters.status.toLowerCase(); return n && t && s && st; });
	const tp = Math.max(1, Math.ceil(filtered.length / pageSize)); const cp = Math.min(page, tp); const start = (cp - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages: tp, totalItems: filtered.length };
};
export default function ReportsTable() {
	const router = useRouter();
	const [rows, setRows] = useState<RptRecord[]>([]); const [loading, setLoading] = useState(true); const [page, setPage] = useState(1); const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE); const [totalPages, setTotalPages] = useState(1); const [totalItems, setTotalItems] = useState(0); const [filters, setFilters] = useState<FilterValues>({});
	const runList = useCallback(async () => { setLoading(true); try { const res = await listRpt({ filters, page, pageSize: itemsPerPage }); setRows(res.rows); setTotalPages(res.totalPages); setTotalItems(res.totalItems); } finally { setLoading(false); } }, [filters, itemsPerPage, page]);
	useEffect(() => { runList(); }, [runList]);
	const columns: Column<RptRecord>[] = useMemo(() => [
		{ key: "name", title: "REPORT NAME", sortable: true, filterable: true },
		{ key: "report_type", title: "TYPE", sortable: true, filterable: true },
		{ key: "schedule", title: "SCHEDULE", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v === "On Demand" ? "On Demand" : v} /> },
		{ key: "format", title: "FORMAT", sortable: true },
		{ key: "generated_by", title: "GENERATED BY", sortable: true },
		{ key: "last_generated", title: "LAST GENERATED", sortable: true, render: (v: string) => fmtDate(v) },
		{ key: "file_size", title: "SIZE", sortable: true },
		{ key: "status", title: "STATUS", sortable: true, filterable: true },
	], []);
	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "name", label: "Report Name", type: "text", placeholder: "Enter name" },
		{ key: "report_type", label: "Type", type: "select", options: Array.from(new Set(seed.map((s) => s.report_type))).map((t) => ({ label: t, value: t })) },
		{ key: "schedule", label: "Schedule", type: "select", options: [{ label: "Daily", value: "Daily" }, { label: "Weekly", value: "Weekly" }, { label: "Monthly", value: "Monthly" }, { label: "Quarterly", value: "Quarterly" }, { label: "On Demand", value: "On Demand" }] },
		{ key: "status", label: "Status", type: "select", options: [{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }] },
	], []);
	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);
	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Report", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: RptRecord) => { router.push(FrontendLinks.reportDetails(row.id)); } },
		{ id: "run", label: "Run Now", icon: <img src="/media/icons/sliders.svg" alt="" width={16} height={16} />, onClick: async (row: RptRecord) => { setLoading(true); db = db.map((r) => r.id === row.id ? { ...r, last_generated: new Date().toISOString().slice(0, 10) } : r); await runList(); } },
	], [runList]);
	return (<GenericTable<RptRecord> columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No reports found" pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }} />);
}
