"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";

type FCRecord = { id: string; name: string; fee_type: string; calculation_method: string; amount: string; scope: string; applies_to: string; status: string; effective_from: string };
type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: FCRecord[]; totalPages: number; totalItems: number };
const PAGE_SIZE = 10;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const seed: FCRecord[] = [
	{ id: "1", name: "Processing Fee", fee_type: "Origination", calculation_method: "Percentage", amount: "1.5%", scope: "Loan", applies_to: "All Products", status: "Active", effective_from: "2022-01-01" },
	{ id: "2", name: "Insurance Premium", fee_type: "Insurance", calculation_method: "Percentage", amount: "0.5%", scope: "Loan", applies_to: "Business Loan", status: "Active", effective_from: "2022-01-01" },
	{ id: "3", name: "Late Payment Fee", fee_type: "Penalty", calculation_method: "Flat", amount: "₦2,500", scope: "Loan", applies_to: "All Products", status: "Active", effective_from: "2022-01-01" },
	{ id: "4", name: "Early Repayment Fee", fee_type: "Penalty", calculation_method: "Percentage", amount: "2%", scope: "Loan", applies_to: "Fixed Term Loans", status: "Active", effective_from: "2022-06-01" },
	{ id: "5", name: "Savings Withdrawal Fee", fee_type: "Transaction", calculation_method: "Flat", amount: "₦100", scope: "Savings", applies_to: "Fixed Deposit", status: "Active", effective_from: "2022-03-01" },
	{ id: "6", name: "Transfer Fee", fee_type: "Transaction", calculation_method: "Flat", amount: "₦50", scope: "Transfer", applies_to: "All", status: "Active", effective_from: "2022-01-01" },
	{ id: "7", name: "Maintenance Fee", fee_type: "Maintenance", calculation_method: "Flat", amount: "₦500/month", scope: "Account", applies_to: "Dormant Accounts", status: "Active", effective_from: "2023-01-01" },
	{ id: "8", name: "Guarantor Verification Fee", fee_type: "Verification", calculation_method: "Flat", amount: "₦1,000", scope: "Loan", applies_to: "Loans with Guarantor", status: "Inactive", effective_from: "2023-06-01" },
	{ id: "9", name: "Document Processing Fee", fee_type: "Processing", calculation_method: "Flat", amount: "₦3,000", scope: "Account", applies_to: "New Accounts", status: "Active", effective_from: "2024-01-01" },
	{ id: "10", name: "Loan Restructuring Fee", fee_type: "Origination", calculation_method: "Percentage", amount: "1%", scope: "Loan", applies_to: "Restructured Loans", status: "Active", effective_from: "2024-03-01" },
];
let db: FCRecord[] = [...seed];
const listFC = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((i) => { const n = !filters.name || i.name.toLowerCase().includes(filters.name.toLowerCase()); const t = !filters.fee_type || i.fee_type === filters.fee_type; const m = !filters.calculation_method || i.calculation_method === filters.calculation_method; const s = !filters.status || i.status.toLowerCase() === filters.status.toLowerCase(); return n && t && m && s; });
	const tp = Math.max(1, Math.ceil(filtered.length / pageSize)); const cp = Math.min(page, tp); const start = (cp - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages: tp, totalItems: filtered.length };
};
export default function FeesChargesTable() {
	const router = useRouter();
	const [rows, setRows] = useState<FCRecord[]>([]); const [loading, setLoading] = useState(true); const [page, setPage] = useState(1); const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE); const [totalPages, setTotalPages] = useState(1); const [totalItems, setTotalItems] = useState(0); const [filters, setFilters] = useState<FilterValues>({});
	const runList = useCallback(async () => { setLoading(true); try { const res = await listFC({ filters, page, pageSize: itemsPerPage }); setRows(res.rows); setTotalPages(res.totalPages); setTotalItems(res.totalItems); } finally { setLoading(false); } }, [filters, itemsPerPage, page]);
	useEffect(() => { runList(); }, [runList]);
	const columns: Column<FCRecord>[] = useMemo(() => [
		{ key: "name", title: "FEE NAME", sortable: true, filterable: true },
		{ key: "fee_type", title: "TYPE", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v} /> },
		{ key: "calculation_method", title: "METHOD", sortable: true, filterable: true },
		{ key: "amount", title: "AMOUNT/RATE", sortable: true },
		{ key: "scope", title: "SCOPE", sortable: true },
		{ key: "applies_to", title: "APPLIES TO", sortable: true },
		{ key: "status", title: "STATUS", sortable: true, filterable: true },
		{ key: "effective_from", title: "EFFECTIVE FROM", sortable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } },
	], []);
	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "name", label: "Fee Name", type: "text", placeholder: "Enter name" },
		{ key: "fee_type", label: "Type", type: "select", options: Array.from(new Set(seed.map((s) => s.fee_type))).map((t) => ({ label: t, value: t })) },
		{ key: "calculation_method", label: "Method", type: "select", options: [{ label: "Flat", value: "Flat" }, { label: "Percentage", value: "Percentage" }] },
		{ key: "status", label: "Status", type: "select", options: [{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }] },
	], []);
	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);
	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: FCRecord) => { router.push(FrontendLinks.feeDetails(row.id)); } },
		{ id: "toggle", label: "Toggle Status", icon: <img src="/media/icons/sliders.svg" alt="" width={16} height={16} />, onClick: async (row: FCRecord) => { setLoading(true); db = db.map((f) => f.id === row.id ? { ...f, status: f.status === "Active" ? "Inactive" : "Active" } : f); await runList(); } },
	], [runList]);
	return (<GenericTable<FCRecord> columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No fees or charges found" onRowClick={(row) => router.push(FrontendLinks.feeDetails(row.id))} pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }} />);
}
