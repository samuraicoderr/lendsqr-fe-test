"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";
import TransactionService from "@/lib/api/services/Transaction.Service";
import type { TransactionsListRow } from "@/lib/api/types/transaction.types";
import { transactionsListData } from "@/app/mock-api/transactions/data";

const PAGE_SIZE = 10;
const fmtCurrency = (v: number, c: string) => `${c === "NGN" ? "₦" : c}${v.toLocaleString("en-US")}`;

export default function TransactionsTable() {
	const router = useRouter();
	const [rows, setRows] = useState<TransactionsListRow[]>([]); const [loading, setLoading] = useState(true); const [page, setPage] = useState(1); const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE); const [totalPages, setTotalPages] = useState(1); const [totalItems, setTotalItems] = useState(0); const [filters, setFilters] = useState<FilterValues>({});
	const runList = useCallback(async () => { setLoading(true); try { const res = await TransactionService.getTransactions({ page, limit: itemsPerPage, user: filters.user || undefined, transaction_type: filters.transaction_type || undefined, channel: filters.channel || undefined, status: (filters.status as TransactionsListRow["status"]) || undefined }, { staleTimeMs: 30_000 }); setRows(res.results); setTotalPages(Math.max(1, Math.ceil(res.count / itemsPerPage))); setTotalItems(res.count); } finally { setLoading(false); } }, [filters, itemsPerPage, page]);
	useEffect(() => { runList(); }, [runList]);
	const columns: Column<TransactionsListRow>[] = useMemo(() => [
		{ key: "reference", title: "REFERENCE", sortable: true },
		{ key: "user", title: "USER", sortable: true, filterable: true },
		{ key: "transaction_type", title: "TYPE", sortable: true, filterable: true },
		{ key: "amount", title: "AMOUNT", sortable: true, render: (v: number, row: TransactionsListRow) => fmtCurrency(v, row.currency) },
		{ key: "channel", title: "CHANNEL", sortable: true, filterable: true },
		{ key: "description", title: "DESCRIPTION", sortable: false },
		{ key: "status", title: "STATUS", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v} /> },
		{ key: "date", title: "DATE", sortable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); } },
	], []);
	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "user", label: "User", type: "text", placeholder: "Enter name" },
		{ key: "transaction_type", label: "Type", type: "select", options: Array.from(new Set(transactionsListData.map((s) => s.transaction_type))).map((t) => ({ label: t, value: t })) },
		{ key: "channel", label: "Channel", type: "select", options: Array.from(new Set(transactionsListData.map((s) => s.channel))).map((c) => ({ label: c, value: c })) },
		{ key: "status", label: "Status", type: "select", options: [{ label: "Completed", value: "Completed" }, { label: "Processing", value: "Processing" }, { label: "Pending", value: "Pending" }, { label: "Failed", value: "Failed" }] },
	], []);
	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);
	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: TransactionsListRow) => { router.push(FrontendLinks.transactionDetails(row.id)); } },
		{ id: "retry", label: "Retry", icon: <img src="/media/icons/sliders.svg" alt="" width={16} height={16} />, onClick: async (row: TransactionsListRow) => { setLoading(true); try { await TransactionService.patchTransaction(row.id, { status: "Processing" }); await runList(); } finally { setLoading(false); } } },
	], [runList]);
	return (<GenericTable<TransactionsListRow> columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No transactions found" onRowClick={(row) => router.push(FrontendLinks.transactionDetails(row.id))} pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }} />);
}
