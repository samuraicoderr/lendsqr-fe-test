"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";

type LoanRequestRecord = {
	id: string;
	user: string;
	email: string;
	product: string;
	requested_amount: number;
	requested_tenure: string;
	purpose: string;
	decision_status: string;
	approved_amount: number;
	date: string;
};

type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: LoanRequestRecord[]; totalPages: number; totalItems: number };

const PAGE_SIZE = 10;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtCurrency = (v: number) => v > 0 ? `₦${v.toLocaleString("en-US")}` : "—";

const seed: LoanRequestRecord[] = [
	{ id: "1", user: "Adeyemi Okafor", email: "adeyemi@lendsqr.com", product: "Micro Loan", requested_amount: 250000, requested_tenure: "6 months", purpose: "Business expansion", decision_status: "Pending", approved_amount: 0, date: "2026-04-10" },
	{ id: "2", user: "Tolani Bakare", email: "tolani@lendsqr.com", product: "Salary Advance", requested_amount: 100000, requested_tenure: "1 month", purpose: "Emergency medical", decision_status: "Approved", approved_amount: 100000, date: "2026-04-09" },
	{ id: "3", user: "Obinna Chukwu", email: "obinna@lendsqr.com", product: "Business Loan", requested_amount: 2000000, requested_tenure: "24 months", purpose: "Equipment purchase", decision_status: "Under Review", approved_amount: 0, date: "2026-04-08" },
	{ id: "4", user: "Khadija Ibrahim", email: "khadija@lendsqr.com", product: "Micro Loan", requested_amount: 150000, requested_tenure: "3 months", purpose: "Inventory restocking", decision_status: "Approved", approved_amount: 150000, date: "2026-04-07" },
	{ id: "5", user: "David Nwankwo", email: "david@lendsqr.com", product: "Personal Loan", requested_amount: 500000, requested_tenure: "12 months", purpose: "Rent payment", decision_status: "Rejected", approved_amount: 0, date: "2026-04-06" },
	{ id: "6", user: "Favour Adichie", email: "favour@lendsqr.com", product: "Salary Advance", requested_amount: 80000, requested_tenure: "1 month", purpose: "School fees", decision_status: "Converted", approved_amount: 80000, date: "2026-04-05" },
	{ id: "7", user: "Kingsley Obi", email: "kingsley@lendsqr.com", product: "Business Loan", requested_amount: 1500000, requested_tenure: "18 months", purpose: "Shop renovation", decision_status: "Pending", approved_amount: 0, date: "2026-04-04" },
	{ id: "8", user: "Gloria Osei", email: "gloria@lendsqr.com", product: "Micro Loan", requested_amount: 75000, requested_tenure: "3 months", purpose: "Working capital", decision_status: "Approved", approved_amount: 75000, date: "2026-04-03" },
	{ id: "9", user: "Samuel Ogundipe", email: "samuel@lendsqr.com", product: "Agriculture Loan", requested_amount: 3000000, requested_tenure: "36 months", purpose: "Farming equipment", decision_status: "Under Review", approved_amount: 0, date: "2026-04-02" },
	{ id: "10", user: "Josephine Nwosu", email: "josephine@lendsqr.com", product: "Personal Loan", requested_amount: 200000, requested_tenure: "6 months", purpose: "Travel expenses", decision_status: "Cancelled", approved_amount: 0, date: "2026-04-01" },
	{ id: "11", user: "Ibrahim Bello", email: "ibrahim@lendsqr.com", product: "Micro Loan", requested_amount: 180000, requested_tenure: "3 months", purpose: "Stock purchase", decision_status: "Pending", approved_amount: 0, date: "2026-03-30" },
	{ id: "12", user: "Mary Johnson", email: "mary@lendsqr.com", product: "Salary Advance", requested_amount: 120000, requested_tenure: "1 month", purpose: "Utility bills", decision_status: "Approved", approved_amount: 120000, date: "2026-03-29" },
];

let db: LoanRequestRecord[] = [...seed];

const listLoanRequests = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((item) => {
		const matchesUser = !filters.user || item.user.toLowerCase().includes(filters.user.toLowerCase());
		const matchesProduct = !filters.product || item.product === filters.product;
		const matchesStatus = !filters.decision_status || item.decision_status.toLowerCase() === filters.decision_status.toLowerCase();
		const matchesDate = !filters.date || item.date === filters.date;
		return matchesUser && matchesProduct && matchesStatus && matchesDate;
	});
	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const currentPage = Math.min(page, totalPages);
	const start = (currentPage - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages, totalItems: filtered.length };
};

export default function LoanRequestsTable() {
	const router = useRouter();
	const [rows, setRows] = useState<LoanRequestRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [filters, setFilters] = useState<FilterValues>({});

	const runList = useCallback(async () => {
		setLoading(true);
		try {
			const res = await listLoanRequests({ filters, page, pageSize: itemsPerPage });
			setRows(res.rows);
			setTotalPages(res.totalPages);
			setTotalItems(res.totalItems);
		} finally { setLoading(false); }
	}, [filters, itemsPerPage, page]);

	useEffect(() => { runList(); }, [runList]);

	const columns: Column<LoanRequestRecord>[] = useMemo(() => [
		{ key: "user", title: "APPLICANT", sortable: true, filterable: true },
		{ key: "email", title: "EMAIL", sortable: true, render: (v: string) => <a href={`mailto:${v}`} className="inline-link" onClick={(e) => e.stopPropagation()}>{v}</a> },
		{ key: "product", title: "PRODUCT", sortable: true, filterable: true },
		{ key: "requested_amount", title: "AMOUNT", sortable: true, render: (v: number) => fmtCurrency(v) },
		{ key: "requested_tenure", title: "TENURE", sortable: true },
		{ key: "purpose", title: "PURPOSE", sortable: true },
		{ key: "decision_status", title: "STATUS", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v} /> },
		{ key: "approved_amount", title: "APPROVED", sortable: true, render: (v: number) => fmtCurrency(v) },
		{ key: "date", title: "DATE", sortable: true, filterable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } },
	], []);

	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "user", label: "Applicant", type: "text", placeholder: "Enter name" },
		{ key: "product", label: "Product", type: "select", options: [{ label: "Micro Loan", value: "Micro Loan" }, { label: "Salary Advance", value: "Salary Advance" }, { label: "Business Loan", value: "Business Loan" }, { label: "Personal Loan", value: "Personal Loan" }, { label: "Agriculture Loan", value: "Agriculture Loan" }] },
		{ key: "decision_status", label: "Status", type: "select", options: [{ label: "Pending", value: "Pending" }, { label: "Under Review", value: "Under Review" }, { label: "Approved", value: "Approved" }, { label: "Rejected", value: "Rejected" }, { label: "Converted", value: "Converted" }, { label: "Cancelled", value: "Cancelled" }] },
		{ key: "date", label: "Date", type: "date" },
	], []);

	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);

	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: LoanRequestRecord) => { router.push(FrontendLinks.loanRequestDetails(row.id)); } },
		{ id: "approve", label: "Approve", icon: <img src="/media/icons/user-check.svg" alt="" width={16} height={16} />, onClick: async (row: LoanRequestRecord) => { setLoading(true); db = db.map((r) => r.id === row.id ? { ...r, decision_status: "Approved", approved_amount: r.requested_amount } : r); await runList(); } },
		{ id: "reject", label: "Reject", icon: <img src="/media/icons/user-times.svg" alt="" width={16} height={16} />, onClick: async (row: LoanRequestRecord) => { setLoading(true); db = db.map((r) => r.id === row.id ? { ...r, decision_status: "Rejected" } : r); await runList(); } },
	], [runList]);

	return (
		<GenericTable<LoanRequestRecord>
			columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions
			onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No loan requests found"
			onRowClick={(row) => router.push(FrontendLinks.loanRequestDetails(row.id))}
			pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }}
		/>
	);
}
