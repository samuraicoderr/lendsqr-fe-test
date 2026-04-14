"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";

type LPRecord = { id: string; name: string; code: string; organization: string; interest_rate: string; min_amount: number; max_amount: number; tenure_range: string; requires_guarantor: string; status: string; date: string };
type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: LPRecord[]; totalPages: number; totalItems: number };
const PAGE_SIZE = 10;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtCurrency = (v: number) => `₦${v.toLocaleString("en-US")}`;
const seed: LPRecord[] = [
	{ id: "1", name: "Micro Loan", code: "ML-001", organization: "Lendsqr HQ", interest_rate: "15%", min_amount: 10000, max_amount: 500000, tenure_range: "1-6 months", requires_guarantor: "No", status: "Active", date: "2022-01-15" },
	{ id: "2", name: "Salary Advance", code: "SA-001", organization: "Lendsqr HQ", interest_rate: "10%", min_amount: 5000, max_amount: 200000, tenure_range: "1 month", requires_guarantor: "No", status: "Active", date: "2022-03-20" },
	{ id: "3", name: "Business Loan", code: "BL-001", organization: "Lendsqr Finance", interest_rate: "18%", min_amount: 500000, max_amount: 5000000, tenure_range: "6-36 months", requires_guarantor: "Yes", status: "Active", date: "2022-06-10" },
	{ id: "4", name: "Personal Loan", code: "PL-001", organization: "Lendsqr HQ", interest_rate: "20%", min_amount: 50000, max_amount: 1000000, tenure_range: "3-12 months", requires_guarantor: "No", status: "Active", date: "2022-09-01" },
	{ id: "5", name: "Agriculture Loan", code: "AL-001", organization: "Lendsqr Labs", interest_rate: "8%", min_amount: 100000, max_amount: 10000000, tenure_range: "12-36 months", requires_guarantor: "Yes", status: "Active", date: "2023-01-22" },
	{ id: "6", name: "Emergency Loan", code: "EL-001", organization: "Lendsqr Finance", interest_rate: "25%", min_amount: 5000, max_amount: 100000, tenure_range: "1-3 months", requires_guarantor: "No", status: "Active", date: "2023-04-15" },
	{ id: "7", name: "Education Loan", code: "ED-001", organization: "Lendsqr Labs", interest_rate: "12%", min_amount: 200000, max_amount: 3000000, tenure_range: "6-24 months", requires_guarantor: "Yes", status: "Inactive", date: "2023-07-08" },
	{ id: "8", name: "SME Growth Loan", code: "SG-001", organization: "Lendsqr HQ", interest_rate: "14%", min_amount: 1000000, max_amount: 20000000, tenure_range: "12-48 months", requires_guarantor: "Yes", status: "Active", date: "2024-02-11" },
];
let db: LPRecord[] = [...seed];
const listLP = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((i) => { const n = !filters.name || i.name.toLowerCase().includes(filters.name.toLowerCase()); const o = !filters.organization || i.organization === filters.organization; const s = !filters.status || i.status.toLowerCase() === filters.status.toLowerCase(); return n && o && s; });
	const tp = Math.max(1, Math.ceil(filtered.length / pageSize)); const cp = Math.min(page, tp); const start = (cp - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages: tp, totalItems: filtered.length };
};
export default function LoanProductsTable() {
	const router = useRouter();
	const [rows, setRows] = useState<LPRecord[]>([]); const [loading, setLoading] = useState(true); const [page, setPage] = useState(1); const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE); const [totalPages, setTotalPages] = useState(1); const [totalItems, setTotalItems] = useState(0); const [filters, setFilters] = useState<FilterValues>({});
	const runList = useCallback(async () => { setLoading(true); try { const res = await listLP({ filters, page, pageSize: itemsPerPage }); setRows(res.rows); setTotalPages(res.totalPages); setTotalItems(res.totalItems); } finally { setLoading(false); } }, [filters, itemsPerPage, page]);
	useEffect(() => { runList(); }, [runList]);
	const columns: Column<LPRecord>[] = useMemo(() => [
		{ key: "name", title: "PRODUCT NAME", sortable: true, filterable: true },
		{ key: "code", title: "CODE", sortable: true },
		{ key: "organization", title: "ORGANIZATION", sortable: true, filterable: true },
		{ key: "interest_rate", title: "INTEREST RATE", sortable: true },
		{ key: "min_amount", title: "MIN AMOUNT", sortable: true, render: (v: number) => fmtCurrency(v) },
		{ key: "max_amount", title: "MAX AMOUNT", sortable: true, render: (v: number) => fmtCurrency(v) },
		{ key: "tenure_range", title: "TENURE", sortable: true },
		{ key: "requires_guarantor", title: "GUARANTOR", sortable: true },
		{ key: "status", title: "STATUS", sortable: true, filterable: true },
		{ key: "date", title: "CREATED", sortable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } },
	], []);
	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "name", label: "Product Name", type: "text", placeholder: "Enter name" },
		{ key: "organization", label: "Organization", type: "select", options: [{ label: "Lendsqr HQ", value: "Lendsqr HQ" }, { label: "Lendsqr Finance", value: "Lendsqr Finance" }, { label: "Lendsqr Labs", value: "Lendsqr Labs" }] },
		{ key: "status", label: "Status", type: "select", options: [{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }] },
	], []);
	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);
	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: LPRecord) => { router.push(FrontendLinks.loanProductDetails(row.id)); } },
		{ id: "toggle", label: "Toggle Status", icon: <img src="/media/icons/sliders.svg" alt="" width={16} height={16} />, onClick: async (row: LPRecord) => { setLoading(true); db = db.map((p) => p.id === row.id ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p); await runList(); } },
	], [runList]);
	return (<GenericTable<LPRecord> columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No loan products found" onRowClick={(row) => router.push(FrontendLinks.loanProductDetails(row.id))} pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }} />);
}
