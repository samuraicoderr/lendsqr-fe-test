"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";

type SARecord = { id: string; service: string; user: string; external_account_id: string; provider: string; account_type: string; status: string; last_synced: string; date: string };
type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: SARecord[]; totalPages: number; totalItems: number };
const PAGE_SIZE = 10; const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const seed: SARecord[] = [
	{ id: "1", service: "Paystack", user: "Adeyemi Okafor", external_account_id: "PSK-USR-001", provider: "Paystack", account_type: "Payment", status: "Active", last_synced: "2026-04-12T03:45:00", date: "2023-01-15" },
	{ id: "2", service: "BVN Verification", user: "Tolani Bakare", external_account_id: "BVN-22345678901", provider: "NIBSS", account_type: "KYC", status: "Active", last_synced: "2026-04-12T02:30:00", date: "2023-02-20" },
	{ id: "3", service: "Credit Bureau", user: "Obinna Chukwu", external_account_id: "CRC-CB-003", provider: "CRC Credit Bureau", account_type: "Credit", status: "Active", last_synced: "2026-04-11T22:00:00", date: "2023-03-10" },
	{ id: "4", service: "Flutterwave", user: "Khadija Ibrahim", external_account_id: "FLW-USR-004", provider: "Flutterwave", account_type: "Payment", status: "Inactive", last_synced: "2026-04-08T12:00:00", date: "2023-04-05" },
	{ id: "5", service: "Paystack", user: "David Nwankwo", external_account_id: "PSK-USR-005", provider: "Paystack", account_type: "Payment", status: "Suspended", last_synced: "2026-04-06T08:00:00", date: "2023-05-12" },
	{ id: "6", service: "BVN Verification", user: "Favour Adichie", external_account_id: "BVN-33456789012", provider: "NIBSS", account_type: "KYC", status: "Active", last_synced: "2026-04-12T03:50:00", date: "2023-06-01" },
	{ id: "7", service: "Termii", user: "Kingsley Obi", external_account_id: "TRM-USR-007", provider: "Termii", account_type: "Communication", status: "Active", last_synced: "2026-04-12T04:00:00", date: "2023-07-18" },
	{ id: "8", service: "SendGrid", user: "Gloria Osei", external_account_id: "SG-USR-008", provider: "SendGrid", account_type: "Communication", status: "Active", last_synced: "2026-04-12T03:55:00", date: "2023-08-22" },
	{ id: "9", service: "Credit Bureau", user: "Samuel Ogundipe", external_account_id: "CRC-CB-009", provider: "CRC Credit Bureau", account_type: "Credit", status: "Active", last_synced: "2026-04-12T01:30:00", date: "2023-09-05" },
	{ id: "10", service: "Paystack", user: "Josephine Nwosu", external_account_id: "PSK-USR-010", provider: "Paystack", account_type: "Payment", status: "Active", last_synced: "2026-04-12T03:40:00", date: "2023-10-14" },
];
let db: SARecord[] = [...seed];
const listSA = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((i) => { const u = !filters.user || i.user.toLowerCase().includes(filters.user.toLowerCase()); const s = !filters.service || i.service === filters.service; const st = !filters.status || i.status.toLowerCase() === filters.status.toLowerCase(); return u && s && st; });
	const tp = Math.max(1, Math.ceil(filtered.length / pageSize)); const cp = Math.min(page, tp); const start = (cp - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages: tp, totalItems: filtered.length };
};
export default function ServiceAccountTable() {
	const router = useRouter();
	const [rows, setRows] = useState<SARecord[]>([]); const [loading, setLoading] = useState(true); const [page, setPage] = useState(1); const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE); const [totalPages, setTotalPages] = useState(1); const [totalItems, setTotalItems] = useState(0); const [filters, setFilters] = useState<FilterValues>({});
	const runList = useCallback(async () => { setLoading(true); try { const res = await listSA({ filters, page, pageSize: itemsPerPage }); setRows(res.rows); setTotalPages(res.totalPages); setTotalItems(res.totalItems); } finally { setLoading(false); } }, [filters, itemsPerPage, page]);
	useEffect(() => { runList(); }, [runList]);
	const columns: Column<SARecord>[] = useMemo(() => [
		{ key: "service", title: "SERVICE", sortable: true, filterable: true },
		{ key: "user", title: "USER", sortable: true, filterable: true },
		{ key: "external_account_id", title: "EXTERNAL ID", sortable: true },
		{ key: "provider", title: "PROVIDER", sortable: true },
		{ key: "account_type", title: "TYPE", sortable: true },
		{ key: "status", title: "STATUS", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v} /> },
		{ key: "last_synced", title: "LAST SYNCED", sortable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); } },
		{ key: "date", title: "LINKED ON", sortable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } },
	], []);
	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "user", label: "User", type: "text", placeholder: "Enter name" },
		{ key: "service", label: "Service", type: "select", options: Array.from(new Set(seed.map((s) => s.service))).map((s) => ({ label: s, value: s })) },
		{ key: "status", label: "Status", type: "select", options: [{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }, { label: "Suspended", value: "Suspended" }] },
	], []);
	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);
	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: SARecord) => { router.push(FrontendLinks.serviceAccountDetails(row.id)); } },
		{ id: "sync", label: "Sync Now", icon: <img src="/media/icons/sliders.svg" alt="" width={16} height={16} />, onClick: async (row: SARecord) => { setLoading(true); db = db.map((s) => s.id === row.id ? { ...s, last_synced: new Date().toISOString() } : s); await runList(); } },
	], [runList, router]);
	return (<GenericTable<SARecord> columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No service accounts found" onRowClick={(row) => router.push(FrontendLinks.serviceAccountDetails(row.id))} pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }} />);
}
