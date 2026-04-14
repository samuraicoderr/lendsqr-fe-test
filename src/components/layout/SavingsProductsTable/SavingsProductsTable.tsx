"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";

type SPRecord = { id: string; name: string; code: string; product_type: string; organization: string; interest_rate: string; min_balance: number; withdrawal_limit: string; status: string; date: string };
type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: SPRecord[]; totalPages: number; totalItems: number };
const PAGE_SIZE = 10;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtCurrency = (v: number) => `₦${v.toLocaleString("en-US")}`;
const seed: SPRecord[] = [
	{ id: "1", name: "Flex Save", code: "FS-001", product_type: "Regular", organization: "Lendsqr HQ", interest_rate: "4%", min_balance: 1000, withdrawal_limit: "Anytime", status: "Active", date: "2022-01-10" },
	{ id: "2", name: "Fixed Deposit", code: "FD-001", product_type: "Fixed Deposit", organization: "Lendsqr Finance", interest_rate: "12%", min_balance: 100000, withdrawal_limit: "At maturity", status: "Active", date: "2022-03-15" },
	{ id: "3", name: "Target Save", code: "TS-001", product_type: "Target", organization: "Lendsqr HQ", interest_rate: "6%", min_balance: 5000, withdrawal_limit: "At target", status: "Active", date: "2022-06-20" },
	{ id: "4", name: "Regular Savings", code: "RS-001", product_type: "Regular", organization: "Lendsqr Labs", interest_rate: "3%", min_balance: 500, withdrawal_limit: "Anytime", status: "Active", date: "2022-09-01" },
	{ id: "5", name: "Premium Deposit", code: "PD-001", product_type: "Fixed Deposit", organization: "Lendsqr HQ", interest_rate: "15%", min_balance: 500000, withdrawal_limit: "At maturity", status: "Active", date: "2023-01-12" },
	{ id: "6", name: "Group Savings", code: "GS-001", product_type: "Group", organization: "Lendsqr Finance", interest_rate: "5%", min_balance: 2000, withdrawal_limit: "Weekly rotation", status: "Active", date: "2023-04-18" },
	{ id: "7", name: "Kids Save", code: "KS-001", product_type: "Regular", organization: "Lendsqr Labs", interest_rate: "7%", min_balance: 1000, withdrawal_limit: "At 18+", status: "Inactive", date: "2023-07-22" },
	{ id: "8", name: "Auto Save", code: "AS-001", product_type: "Target", organization: "Lendsqr HQ", interest_rate: "8%", min_balance: 1000, withdrawal_limit: "At target", status: "Active", date: "2024-02-05" },
];
let db: SPRecord[] = [...seed];
const listSP = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((i) => { const n = !filters.name || i.name.toLowerCase().includes(filters.name.toLowerCase()); const t = !filters.product_type || i.product_type === filters.product_type; const o = !filters.organization || i.organization === filters.organization; const s = !filters.status || i.status.toLowerCase() === filters.status.toLowerCase(); return n && t && o && s; });
	const tp = Math.max(1, Math.ceil(filtered.length / pageSize)); const cp = Math.min(page, tp); const start = (cp - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages: tp, totalItems: filtered.length };
};
export default function SavingsProductsTable() {
	const router = useRouter();
	const [rows, setRows] = useState<SPRecord[]>([]); const [loading, setLoading] = useState(true); const [page, setPage] = useState(1); const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE); const [totalPages, setTotalPages] = useState(1); const [totalItems, setTotalItems] = useState(0); const [filters, setFilters] = useState<FilterValues>({});
	const runList = useCallback(async () => { setLoading(true); try { const res = await listSP({ filters, page, pageSize: itemsPerPage }); setRows(res.rows); setTotalPages(res.totalPages); setTotalItems(res.totalItems); } finally { setLoading(false); } }, [filters, itemsPerPage, page]);
	useEffect(() => { runList(); }, [runList]);
	const columns: Column<SPRecord>[] = useMemo(() => [
		{ key: "name", title: "PRODUCT NAME", sortable: true, filterable: true },
		{ key: "code", title: "CODE", sortable: true },
		{ key: "product_type", title: "TYPE", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v} /> },
		{ key: "organization", title: "ORGANIZATION", sortable: true, filterable: true },
		{ key: "interest_rate", title: "INTEREST RATE", sortable: true },
		{ key: "min_balance", title: "MIN BALANCE", sortable: true, render: (v: number) => fmtCurrency(v) },
		{ key: "withdrawal_limit", title: "WITHDRAWAL LIMIT", sortable: true },
		{ key: "status", title: "STATUS", sortable: true, filterable: true },
		{ key: "date", title: "CREATED", sortable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } },
	], []);
	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "name", label: "Name", type: "text", placeholder: "Enter name" },
		{ key: "product_type", label: "Type", type: "select", options: [{ label: "Regular", value: "Regular" }, { label: "Fixed Deposit", value: "Fixed Deposit" }, { label: "Target", value: "Target" }, { label: "Group", value: "Group" }] },
		{ key: "organization", label: "Organization", type: "select", options: [{ label: "Lendsqr HQ", value: "Lendsqr HQ" }, { label: "Lendsqr Finance", value: "Lendsqr Finance" }, { label: "Lendsqr Labs", value: "Lendsqr Labs" }] },
		{ key: "status", label: "Status", type: "select", options: [{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }] },
	], []);
	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);
	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: SPRecord) => { router.push(FrontendLinks.savingsProductDetails(row.id)); } },
		{ id: "toggle", label: "Toggle Status", icon: <img src="/media/icons/sliders.svg" alt="" width={16} height={16} />, onClick: async (row: SPRecord) => { setLoading(true); db = db.map((p) => p.id === row.id ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p); await runList(); } },
	], [runList]);
	return (<GenericTable<SPRecord> columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No savings products found" onRowClick={(row) => router.push(FrontendLinks.savingsProductDetails(row.id))} pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }} />);
}
