"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";
import FrontendLinks from "@/lib/FrontendLinks";

import LoanService from "@/lib/api/services/Loan.Service";
import type { LoansListRow } from "@/lib/api/types/loan.types";

const PAGE_SIZE = 10;

const fmtCurrency = (v: number) => `₦${v.toLocaleString("en-US")}`;

export default function LoansTable() {
	const router = useRouter();
	const [rows, setRows] = useState<LoansListRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [filters, setFilters] = useState<FilterValues>({});

	const runList = useCallback(async () => {
		setLoading(true);
		try {
			const res = await LoanService.getLoans(
				{
					page,
					limit: itemsPerPage,
					loan_number: filters.loan_number || undefined,
					borrower: filters.borrower || undefined,
					organization: filters.organization || undefined,
					status: (filters.status as LoansListRow["status"]) || undefined,
					date: filters.date || undefined,
				},
				{ staleTimeMs: 30_000 }
			);
			setRows(res.results);
			setTotalPages(Math.max(1, Math.ceil(res.count / itemsPerPage)));
			setTotalItems(res.count);
		} finally { setLoading(false); }
	}, [filters, itemsPerPage, page]);

	useEffect(() => { runList(); }, [runList]);

	const columns: Column<LoansListRow>[] = useMemo(() => [
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
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: LoansListRow) => { router.push(FrontendLinks.loanDetails(row.id)); } },
		{ id: "mark-defaulted", label: "Mark Defaulted", icon: <img src="/media/icons/user-times.svg" alt="" width={16} height={16} />, onClick: async (row: LoansListRow) => { setLoading(true); try { await LoanService.patchLoan(row.id, { status: "Defaulted" }); await runList(); } finally { setLoading(false); } } },
	], [runList]);

	return (
		<GenericTable<LoansListRow>
			columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions
			onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No loans found"
			onRowClick={(row) => router.push(FrontendLinks.loanDetails(row.id))}
			pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }}
		/>
	);
}
