"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";

type SvcRecord = { id: string; name: string; service_type: string; provider: string; base_url: string; status: string; last_health_check: string; uptime: string; date: string };
type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: SvcRecord[]; totalPages: number; totalItems: number };
const PAGE_SIZE = 10; const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const seed: SvcRecord[] = [
	{ id: "1", name: "BVN Verification", service_type: "KYC", provider: "NIBSS", base_url: "https://api.nibss.ng/bvn", status: "Active", last_health_check: "2026-04-12T04:00:00", uptime: "99.9%", date: "2021-06-15" },
	{ id: "2", name: "NIN Verification", service_type: "KYC", provider: "NIMC", base_url: "https://api.nimc.gov.ng", status: "Active", last_health_check: "2026-04-12T04:00:00", uptime: "98.5%", date: "2022-01-10" },
	{ id: "3", name: "Bank Transfer", service_type: "Payment", provider: "Paystack", base_url: "https://api.paystack.co", status: "Active", last_health_check: "2026-04-12T04:00:00", uptime: "99.8%", date: "2021-03-20" },
	{ id: "4", name: "Card Processing", service_type: "Payment", provider: "Flutterwave", base_url: "https://api.flutterwave.com", status: "Active", last_health_check: "2026-04-12T04:00:00", uptime: "99.7%", date: "2021-06-01" },
	{ id: "5", name: "Credit Bureau", service_type: "Credit Scoring", provider: "CRC Credit Bureau", base_url: "https://api.creditbureau.ng", status: "Active", last_health_check: "2026-04-12T03:55:00", uptime: "97.2%", date: "2022-03-15" },
	{ id: "6", name: "SMS Gateway", service_type: "Communication", provider: "Termii", base_url: "https://api.ng.termii.com", status: "Active", last_health_check: "2026-04-12T04:00:00", uptime: "99.4%", date: "2021-09-01" },
	{ id: "7", name: "Email Service", service_type: "Communication", provider: "SendGrid", base_url: "https://api.sendgrid.com", status: "Active", last_health_check: "2026-04-12T04:00:00", uptime: "99.9%", date: "2021-03-01" },
	{ id: "8", name: "Address Verification", service_type: "KYC", provider: "Veriff", base_url: "https://api.veriff.me", status: "Maintenance", last_health_check: "2026-04-11T22:00:00", uptime: "95.1%", date: "2023-01-20" },
	{ id: "9", name: "USSD Gateway", service_type: "Payment", provider: "Africa's Talking", base_url: "https://api.africastalking.com", status: "Inactive", last_health_check: "2026-04-10T12:00:00", uptime: "0%", date: "2022-08-15" },
	{ id: "10", name: "Push Notification", service_type: "Communication", provider: "Firebase", base_url: "https://fcm.googleapis.com", status: "Active", last_health_check: "2026-04-12T04:00:00", uptime: "99.9%", date: "2022-05-10" },
];
let db: SvcRecord[] = [...seed];
const listSvc = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((i) => { const n = !filters.name || i.name.toLowerCase().includes(filters.name.toLowerCase()); const t = !filters.service_type || i.service_type === filters.service_type; const s = !filters.status || i.status.toLowerCase() === filters.status.toLowerCase(); return n && t && s; });
	const tp = Math.max(1, Math.ceil(filtered.length / pageSize)); const cp = Math.min(page, tp); const start = (cp - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages: tp, totalItems: filtered.length };
};
export default function ServicesTable() {
	const router = useRouter();
	const [rows, setRows] = useState<SvcRecord[]>([]); const [loading, setLoading] = useState(true); const [page, setPage] = useState(1); const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE); const [totalPages, setTotalPages] = useState(1); const [totalItems, setTotalItems] = useState(0); const [filters, setFilters] = useState<FilterValues>({});
	const runList = useCallback(async () => { setLoading(true); try { const res = await listSvc({ filters, page, pageSize: itemsPerPage }); setRows(res.rows); setTotalPages(res.totalPages); setTotalItems(res.totalItems); } finally { setLoading(false); } }, [filters, itemsPerPage, page]);
	useEffect(() => { runList(); }, [runList]);
	const columns: Column<SvcRecord>[] = useMemo(() => [
		{ key: "name", title: "SERVICE NAME", sortable: true, filterable: true },
		{ key: "service_type", title: "TYPE", sortable: true, filterable: true },
		{ key: "provider", title: "PROVIDER", sortable: true },
		{ key: "uptime", title: "UPTIME", sortable: true },
		{ key: "status", title: "STATUS", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v} /> },
		{ key: "last_health_check", title: "LAST CHECK", sortable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); } },
		{ key: "date", title: "INTEGRATED", sortable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } },
	], []);
	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "name", label: "Service Name", type: "text", placeholder: "Enter name" },
		{ key: "service_type", label: "Type", type: "select", options: Array.from(new Set(seed.map((s) => s.service_type))).map((t) => ({ label: t, value: t })) },
		{ key: "status", label: "Status", type: "select", options: [{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }, { label: "Maintenance", value: "Maintenance" }, { label: "Error", value: "Error" }] },
	], []);
	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);
	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: SvcRecord) => { router.push(FrontendLinks.serviceDetails(row.id)); } },
		{ id: "test", label: "Test Connection", icon: <img src="/media/icons/sliders.svg" alt="" width={16} height={16} />, onClick: async (row: SvcRecord) => { setLoading(true); await delay(500); db = db.map((s) => s.id === row.id ? { ...s, last_health_check: new Date().toISOString() } : s); await runList(); } },
	], [runList]);
	return (<GenericTable<SvcRecord> columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No services found" onRowClick={(row) => router.push(FrontendLinks.serviceDetails(row.id))} pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }} />);
}
