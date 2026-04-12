"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";
import FrontendLinks from "@/lib/FrontendLinks";

type LoanRecord = {
	id: string;
	loan_number: string;
	borrower: string;
	organization: string;
	principal: number;
	interest_rate: string;
	tenure: string;
	total_repaid: number;
	status: string;
	next_due_date: string;
	date: string;
};

type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: LoanRecord[]; totalPages: number; totalItems: number };

const PAGE_SIZE = 10;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const seed: LoanRecord[] = [
	{ id: "1", loan_number: "LN-2023-001", borrower: "Adeyemi Okafor", organization: "Lendsqr HQ", principal: 250000, interest_rate: "15%", tenure: "6 months", total_repaid: 125000, status: "Active", next_due_date: "2026-05-01", date: "2023-06-15" },
	{ id: "2", loan_number: "LN-2023-002", borrower: "Tolani Bakare", organization: "Lendsqr Finance", principal: 500000, interest_rate: "12%", tenure: "12 months", total_repaid: 500000, status: "Completed", next_due_date: "", date: "2023-03-20" },
	{ id: "3", loan_number: "LN-2023-003", borrower: "Obinna Chukwu", organization: "Lendsqr HQ", principal: 100000, interest_rate: "18%", tenure: "3 months", total_repaid: 0, status: "Defaulted", next_due_date: "2024-01-15", date: "2023-10-01" },
	{ id: "4", loan_number: "LN-2023-004", borrower: "Khadija Ibrahim", organization: "Lendsqr Labs", principal: 750000, interest_rate: "10%", tenure: "24 months", total_repaid: 200000, status: "Active", next_due_date: "2026-04-20", date: "2024-01-10" },
	{ id: "5", loan_number: "LN-2023-005", borrower: "David Nwankwo", organization: "Lendsqr HQ", principal: 300000, interest_rate: "15%", tenure: "6 months", total_repaid: 0, status: "Pending", next_due_date: "", date: "2024-02-05" },
	{ id: "6", loan_number: "LN-2024-006", borrower: "Favour Adichie", organization: "Lendsqr Finance", principal: 1000000, interest_rate: "8%", tenure: "36 months", total_repaid: 450000, status: "Active", next_due_date: "2026-04-25", date: "2024-03-12" },
	{ id: "7", loan_number: "LN-2024-007", borrower: "Kingsley Obi", organization: "Lendsqr HQ", principal: 150000, interest_rate: "20%", tenure: "3 months", total_repaid: 150000, status: "Completed", next_due_date: "", date: "2024-04-01" },
	{ id: "8", loan_number: "LN-2024-008", borrower: "Gloria Osei", organization: "Lendsqr Labs", principal: 400000, interest_rate: "14%", tenure: "12 months", total_repaid: 100000, status: "Active", next_due_date: "2026-05-10", date: "2024-05-20" },
	{ id: "9", loan_number: "LN-2024-009", borrower: "Samuel Ogundipe", organization: "Lendsqr Finance", principal: 200000, interest_rate: "16%", tenure: "6 months", total_repaid: 0, status: "Disbursed", next_due_date: "2026-04-30", date: "2024-06-08" },
	{ id: "10", loan_number: "LN-2024-010", borrower: "Josephine Nwosu", organization: "Lendsqr HQ", principal: 80000, interest_rate: "22%", tenure: "3 months", total_repaid: 80000, status: "Completed", next_due_date: "", date: "2024-07-15" },
	{ id: "11", loan_number: "LN-2024-011", borrower: "Ibrahim Bello", organization: "Lendsqr Labs", principal: 600000, interest_rate: "11%", tenure: "18 months", total_repaid: 150000, status: "Active", next_due_date: "2026-05-05", date: "2024-08-22" },
	{ id: "12", loan_number: "LN-2024-012", borrower: "Mary Johnson", organization: "Lendsqr Finance", principal: 350000, interest_rate: "13%", tenure: "12 months", total_repaid: 0, status: "Rejected", next_due_date: "", date: "2024-09-10" },
	{ id: "13", loan_number: "LN-2024-013", borrower: "Chidi Anekwe", organization: "Lendsqr HQ", principal: 450000, interest_rate: "15%", tenure: "12 months", total_repaid: 50000, status: "Active", next_due_date: "2026-04-18", date: "2024-10-05" },
	{ id: "14", loan_number: "LN-2025-014", borrower: "Queen Adeleke", organization: "Lendsqr Labs", principal: 120000, interest_rate: "19%", tenure: "6 months", total_repaid: 0, status: "Written Off", next_due_date: "", date: "2025-01-20" },
];

let db: LoanRecord[] = [...seed];

const listLoans = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((item) => {
		const matchesLoan = !filters.loan_number || item.loan_number.toLowerCase().includes(filters.loan_number.toLowerCase());
		const matchesBorrower = !filters.borrower || item.borrower.toLowerCase().includes(filters.borrower.toLowerCase());
		const matchesOrg = !filters.organization || item.organization === filters.organization;
		const matchesStatus = !filters.status || item.status.toLowerCase() === filters.status.toLowerCase();
		const matchesDate = !filters.date || item.date === filters.date;
		return matchesLoan && matchesBorrower && matchesOrg && matchesStatus && matchesDate;
	});
	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const currentPage = Math.min(page, totalPages);
	const start = (currentPage - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages, totalItems: filtered.length };
};

const fmtCurrency = (v: number) => `₦${v.toLocaleString("en-US")}`;

export default function LoansTable() {
	const router = useRouter();
	const [rows, setRows] = useState<LoanRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [filters, setFilters] = useState<FilterValues>({});

	const runList = useCallback(async () => {
		setLoading(true);
		try {
			const res = await listLoans({ filters, page, pageSize: itemsPerPage });
			setRows(res.rows);
			setTotalPages(res.totalPages);
			setTotalItems(res.totalItems);
		} finally { setLoading(false); }
	}, [filters, itemsPerPage, page]);

	useEffect(() => { runList(); }, [runList]);

	const columns: Column<LoanRecord>[] = useMemo(() => [
		{ key: "loan_number", title: "LOAN NUMBER", sortable: true, filterable: true },
		{ key: "borrower", title: "BORROWER", sortable: true, filterable: true },
		{ key: "organization", title: "ORGANIZATION", sortable: true, filterable: true },
		{ key: "principal", title: "PRINCIPAL", sortable: true, render: (v: number) => fmtCurrency(v) },
		{ key: "interest_rate", title: "INTEREST", sortable: true },
		{ key: "tenure", title: "TENURE", sortable: true },
		{ key: "total_repaid", title: "REPAID", sortable: true, render: (v: number) => fmtCurrency(v) },
		{ key: "status", title: "STATUS", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v} /> },
		{ key: "date", title: "DATE ISSUED", sortable: true, filterable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } },
	], []);

	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "loan_number", label: "Loan Number", type: "text", placeholder: "Enter loan number" },
		{ key: "borrower", label: "Borrower", type: "text", placeholder: "Enter borrower name" },
		{ key: "organization", label: "Organization", type: "select", options: [{ label: "Lendsqr HQ", value: "Lendsqr HQ" }, { label: "Lendsqr Finance", value: "Lendsqr Finance" }, { label: "Lendsqr Labs", value: "Lendsqr Labs" }] },
		{ key: "status", label: "Status", type: "select", options: [{ label: "Active", value: "Active" }, { label: "Pending", value: "Pending" }, { label: "Completed", value: "Completed" }, { label: "Defaulted", value: "Defaulted" }, { label: "Disbursed", value: "Disbursed" }, { label: "Rejected", value: "Rejected" }] },
		{ key: "date", label: "Date Issued", type: "date" },
	], []);

	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);

	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: LoanRecord) => { router.push(FrontendLinks.loanDetails(row.id)); } },
		{ id: "mark-defaulted", label: "Mark Defaulted", icon: <img src="/media/icons/user-times.svg" alt="" width={16} height={16} />, onClick: async (row: LoanRecord) => { setLoading(true); db = db.map((l) => l.id === row.id ? { ...l, status: "Defaulted" } : l); await runList(); } },
	], [runList]);

	return (
		<GenericTable<LoanRecord>
			columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions
			onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No loans found"
			pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }}
		/>
	);
}
