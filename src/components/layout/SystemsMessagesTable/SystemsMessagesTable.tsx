"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";

type MsgRecord = { id: string; title: string; message_type: string; priority: string; target_audience: string; channels: string; status: string; scheduled_at: string; sent_at: string; date: string };
type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: MsgRecord[]; totalPages: number; totalItems: number };
const PAGE_SIZE = 10; const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); };
const seed: MsgRecord[] = [
	{ id: "1", title: "Scheduled Maintenance Notice", message_type: "Maintenance", priority: "High", target_audience: "All Users", channels: "Email, Push", status: "Sent", scheduled_at: "2026-04-10T22:00:00", sent_at: "2026-04-10T22:00:00", date: "2026-04-09T10:00:00" },
	{ id: "2", title: "New Loan Product Available", message_type: "Promotional", priority: "Medium", target_audience: "Active Users", channels: "Email, SMS", status: "Sent", scheduled_at: "", sent_at: "2026-04-08T09:00:00", date: "2026-04-07T14:30:00" },
	{ id: "3", title: "Security Update Required", message_type: "Security", priority: "Critical", target_audience: "All Users", channels: "Email, Push, SMS", status: "Sent", scheduled_at: "", sent_at: "2026-04-06T08:00:00", date: "2026-04-06T07:30:00" },
	{ id: "4", title: "Easter Holiday Hours", message_type: "Informational", priority: "Low", target_audience: "All Users", channels: "Email", status: "Scheduled", scheduled_at: "2026-04-18T06:00:00", sent_at: "", date: "2026-04-05T16:00:00" },
	{ id: "5", title: "Repayment Reminder", message_type: "Transactional", priority: "High", target_audience: "Borrowers", channels: "SMS, Push", status: "Sent", scheduled_at: "", sent_at: "2026-04-05T08:00:00", date: "2026-04-04T12:00:00" },
	{ id: "6", title: "Savings Rate Increase", message_type: "Promotional", priority: "Medium", target_audience: "Savers", channels: "Email", status: "Draft", scheduled_at: "", sent_at: "", date: "2026-04-04T10:00:00" },
	{ id: "7", title: "Referral Program Launch", message_type: "Promotional", priority: "Medium", target_audience: "Active Users", channels: "Email, SMS, Push", status: "Scheduled", scheduled_at: "2026-04-15T09:00:00", sent_at: "", date: "2026-04-03T14:00:00" },
	{ id: "8", title: "Service Disruption Alert", message_type: "Maintenance", priority: "Critical", target_audience: "All Users", channels: "Push, SMS", status: "Sent", scheduled_at: "", sent_at: "2026-04-02T15:30:00", date: "2026-04-02T15:20:00" },
	{ id: "9", title: "Monthly Statement Available", message_type: "Transactional", priority: "Low", target_audience: "All Users", channels: "Email", status: "Sent", scheduled_at: "", sent_at: "2026-04-01T06:00:00", date: "2026-03-31T22:00:00" },
	{ id: "10", title: "Compliance Policy Update", message_type: "Informational", priority: "High", target_audience: "Organization Admins", channels: "Email", status: "Draft", scheduled_at: "", sent_at: "", date: "2026-03-30T09:00:00" },
];
let db: MsgRecord[] = [...seed];
const listMsg = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((i) => { const t = !filters.title || i.title.toLowerCase().includes(filters.title.toLowerCase()); const mt = !filters.message_type || i.message_type === filters.message_type; const p = !filters.priority || i.priority === filters.priority; const s = !filters.status || i.status.toLowerCase() === filters.status.toLowerCase(); return t && mt && p && s; });
	const tp = Math.max(1, Math.ceil(filtered.length / pageSize)); const cp = Math.min(page, tp); const start = (cp - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages: tp, totalItems: filtered.length };
};
export default function SystemsMessagesTable() {
	const router = useRouter();
	const [rows, setRows] = useState<MsgRecord[]>([]); const [loading, setLoading] = useState(true); const [page, setPage] = useState(1); const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE); const [totalPages, setTotalPages] = useState(1); const [totalItems, setTotalItems] = useState(0); const [filters, setFilters] = useState<FilterValues>({});
	const runList = useCallback(async () => { setLoading(true); try { const res = await listMsg({ filters, page, pageSize: itemsPerPage }); setRows(res.rows); setTotalPages(res.totalPages); setTotalItems(res.totalItems); } finally { setLoading(false); } }, [filters, itemsPerPage, page]);
	useEffect(() => { runList(); }, [runList]);
	const renderPriority = (v: string) => {
		const colors: Record<string, string> = { Critical: '#E4033B', High: '#F55F44', Medium: '#E9B200', Low: '#39CD62' };
		return <span style={{ fontWeight: 600, color: colors[v] || '#545F7D' }}>{v}</span>;
	};
	const columns: Column<MsgRecord>[] = useMemo(() => [
		{ key: "title", title: "TITLE", sortable: true, filterable: true },
		{ key: "message_type", title: "TYPE", sortable: true, filterable: true },
		{ key: "priority", title: "PRIORITY", sortable: true, filterable: true, render: renderPriority },
		{ key: "target_audience", title: "AUDIENCE", sortable: true },
		{ key: "channels", title: "CHANNELS", sortable: false },
		{ key: "status", title: "STATUS", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v} /> },
		{ key: "scheduled_at", title: "SCHEDULED", sortable: true, render: (v: string) => fmtDate(v) },
		{ key: "sent_at", title: "SENT AT", sortable: true, render: (v: string) => fmtDate(v) },
	], []);
	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "title", label: "Title", type: "text", placeholder: "Search messages" },
		{ key: "message_type", label: "Type", type: "select", options: Array.from(new Set(seed.map((s) => s.message_type))).map((t) => ({ label: t, value: t })) },
		{ key: "priority", label: "Priority", type: "select", options: [{ label: "Critical", value: "Critical" }, { label: "High", value: "High" }, { label: "Medium", value: "Medium" }, { label: "Low", value: "Low" }] },
		{ key: "status", label: "Status", type: "select", options: [{ label: "Draft", value: "Draft" }, { label: "Scheduled", value: "Scheduled" }, { label: "Sent", value: "Sent" }] },
	], []);
	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);
	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Message", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: MsgRecord) => { router.push(FrontendLinks.systemMessageDetails(row.id)); } },
		{ id: "send", label: "Send Now", icon: <img src="/media/icons/bell.svg" alt="" width={16} height={16} />, onClick: async (row: MsgRecord) => { setLoading(true); db = db.map((m) => m.id === row.id ? { ...m, status: "Sent", sent_at: new Date().toISOString() } : m); await runList(); } },
	], [runList]);
	return (<GenericTable<MsgRecord> columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No system messages found" pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }} />);
}
