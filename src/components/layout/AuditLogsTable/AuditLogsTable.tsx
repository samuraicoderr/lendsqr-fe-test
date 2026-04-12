"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";

type AuditRecord = { id: string; actor_email: string; action: string; entity_type: string; entity_id: string; ip_address: string; user_agent: string; changes_summary: string; date: string };
type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: AuditRecord[]; totalPages: number; totalItems: number };
const PAGE_SIZE = 10; const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const seed: AuditRecord[] = [
	{ id: "1", actor_email: "admin@lendsqr.com", action: "USER_STATUS_CHANGED", entity_type: "User", entity_id: "USR-001", ip_address: "102.89.23.45", user_agent: "Chrome/120", changes_summary: "Status changed from Active to Blacklisted", date: "2026-04-12T04:30:00" },
	{ id: "2", actor_email: "jane.okafor@lendsqr.com", action: "LOAN_APPROVED", entity_type: "Loan Request", entity_id: "LR-045", ip_address: "102.89.23.46", user_agent: "Firefox/115", changes_summary: "Loan request approved for ₦250,000", date: "2026-04-12T04:15:00" },
	{ id: "3", actor_email: "admin@lendsqr.com", action: "PRODUCT_UPDATED", entity_type: "Loan Product", entity_id: "LP-003", ip_address: "102.89.23.45", user_agent: "Chrome/120", changes_summary: "Interest rate changed from 15% to 12%", date: "2026-04-12T03:45:00" },
	{ id: "4", actor_email: "david.n@lendsqr.com", action: "SETTLEMENT_PROCESSED", entity_type: "Settlement", entity_id: "SET-012", ip_address: "102.89.23.47", user_agent: "Chrome/120", changes_summary: "Settlement of ₦45,000,000 processed", date: "2026-04-12T02:30:00" },
	{ id: "5", actor_email: "admin@lendsqr.com", action: "USER_CREATED", entity_type: "User", entity_id: "USR-2454", ip_address: "102.89.23.45", user_agent: "Chrome/120", changes_summary: "New user account created", date: "2026-04-12T01:00:00" },
	{ id: "6", actor_email: "favour.a@lendsqr.com", action: "ORGANIZATION_SUSPENDED", entity_type: "Organization", entity_id: "ORG-007", ip_address: "102.89.23.48", user_agent: "Safari/17", changes_summary: "Organization TrustBridge suspended due to compliance", date: "2026-04-11T22:15:00" },
	{ id: "7", actor_email: "system@lendsqr.com", action: "REPORT_GENERATED", entity_type: "Report", entity_id: "RPT-001", ip_address: "10.0.0.1", user_agent: "System/Scheduler", changes_summary: "Monthly Loan Portfolio report generated", date: "2026-04-11T00:01:00" },
	{ id: "8", actor_email: "admin@lendsqr.com", action: "FEE_STRUCTURE_MODIFIED", entity_type: "Fee", entity_id: "FEE-003", ip_address: "102.89.23.45", user_agent: "Chrome/120", changes_summary: "Late payment fee changed from ₦2,000 to ₦2,500", date: "2026-04-10T16:30:00" },
	{ id: "9", actor_email: "kingsley.o@lendsqr.com", action: "SERVICE_DISABLED", entity_type: "Service", entity_id: "SVC-009", ip_address: "102.89.23.49", user_agent: "Chrome/120", changes_summary: "USSD Gateway service disabled", date: "2026-04-10T14:00:00" },
	{ id: "10", actor_email: "system@lendsqr.com", action: "KARMA_UPDATED", entity_type: "Karma", entity_id: "KRM-003", ip_address: "10.0.0.1", user_agent: "System/Auto", changes_summary: "Karma score decreased by 30 due to loan default", date: "2026-04-10T12:00:00" },
	{ id: "11", actor_email: "admin@lendsqr.com", action: "WHITELIST_ADDED", entity_type: "Whitelist", entity_id: "WL-010", ip_address: "102.89.23.45", user_agent: "Chrome/120", changes_summary: "Phone +234 803 456 7890 added to whitelist", date: "2026-04-10T10:00:00" },
	{ id: "12", actor_email: "gloria.o@lendsqr.com", action: "GUARANTOR_VERIFIED", entity_type: "Guarantor", entity_id: "GRT-008", ip_address: "102.89.23.50", user_agent: "Firefox/115", changes_summary: "Guarantor Kunle Ajayi verified", date: "2026-04-09T16:45:00" },
];
const db: AuditRecord[] = [...seed];
const listAudit = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((i) => { const a = !filters.actor_email || i.actor_email.toLowerCase().includes(filters.actor_email.toLowerCase()); const ac = !filters.action || i.action === filters.action; const e = !filters.entity_type || i.entity_type === filters.entity_type; return a && ac && e; });
	const tp = Math.max(1, Math.ceil(filtered.length / pageSize)); const cp = Math.min(page, tp); const start = (cp - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages: tp, totalItems: filtered.length };
};
export default function AuditLogsTable() {
	const router = useRouter();
	const [rows, setRows] = useState<AuditRecord[]>([]); const [loading, setLoading] = useState(true); const [page, setPage] = useState(1); const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE); const [totalPages, setTotalPages] = useState(1); const [totalItems, setTotalItems] = useState(0); const [filters, setFilters] = useState<FilterValues>({});
	const runList = useCallback(async () => { setLoading(true); try { const res = await listAudit({ filters, page, pageSize: itemsPerPage }); setRows(res.rows); setTotalPages(res.totalPages); setTotalItems(res.totalItems); } finally { setLoading(false); } }, [filters, itemsPerPage, page]);
	useEffect(() => { runList(); }, [runList]);
	const columns: Column<AuditRecord>[] = useMemo(() => [
		{ key: "actor_email", title: "ACTOR", sortable: true, filterable: true },
		{ key: "action", title: "ACTION", sortable: true, filterable: true },
		{ key: "entity_type", title: "ENTITY TYPE", sortable: true, filterable: true },
		{ key: "entity_id", title: "ENTITY ID", sortable: true },
		{ key: "changes_summary", title: "SUMMARY", sortable: false },
		{ key: "ip_address", title: "IP ADDRESS", sortable: true },
		{ key: "date", title: "DATE", sortable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); } },
	], []);
	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "actor_email", label: "Actor Email", type: "text", placeholder: "Enter email" },
		{ key: "action", label: "Action", type: "select", options: Array.from(new Set(seed.map((s) => s.action))).map((a) => ({ label: a.replace(/_/g, " "), value: a })) },
		{ key: "entity_type", label: "Entity Type", type: "select", options: Array.from(new Set(seed.map((s) => s.entity_type))).map((e) => ({ label: e, value: e })) },
	], []);
	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);
	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: AuditRecord) => { router.push(FrontendLinks.auditLogDetails(row.id)); } },
	], [router]);
	return (<GenericTable<AuditRecord> columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No audit logs found" pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }} />);
}
