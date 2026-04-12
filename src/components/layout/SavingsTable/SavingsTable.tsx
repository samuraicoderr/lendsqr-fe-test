"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";

type SavingsRecord = {
	id: string;
	account_number: string;
	account_name: string;
	product: string;
	organization: string;
	balance: number;
	target_amount: number;
	interest_earned: number;
	status: string;
	date: string;
};

type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: SavingsRecord[]; totalPages: number; totalItems: number };

const PAGE_SIZE = 10;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtCurrency = (v: number) => `₦${v.toLocaleString("en-US")}`;

const seed: SavingsRecord[] = [
	{ id: "1", account_number: "SAV-001-2023", account_name: "Adeyemi Okafor", product: "Flex Save", organization: "Lendsqr HQ", balance: 320000, target_amount: 500000, interest_earned: 8500, status: "Active", date: "2023-02-10" },
	{ id: "2", account_number: "SAV-002-2023", account_name: "Tolani Bakare", product: "Fixed Deposit", organization: "Lendsqr Finance", balance: 1500000, target_amount: 0, interest_earned: 95000, status: "Active", date: "2023-03-18" },
	{ id: "3", account_number: "SAV-003-2023", account_name: "Obinna Chukwu", product: "Target Save", organization: "Lendsqr HQ", balance: 45000, target_amount: 200000, interest_earned: 1200, status: "Active", date: "2023-05-22" },
	{ id: "4", account_number: "SAV-004-2023", account_name: "Khadija Ibrahim", product: "Flex Save", organization: "Lendsqr Labs", balance: 780000, target_amount: 1000000, interest_earned: 25600, status: "Active", date: "2023-06-01" },
	{ id: "5", account_number: "SAV-005-2023", account_name: "David Nwankwo", product: "Regular", organization: "Lendsqr HQ", balance: 0, target_amount: 0, interest_earned: 0, status: "Closed", date: "2023-07-14" },
	{ id: "6", account_number: "SAV-006-2023", account_name: "Favour Adichie", product: "Target Save", organization: "Lendsqr Finance", balance: 120000, target_amount: 120000, interest_earned: 4800, status: "Active", date: "2023-08-20" },
	{ id: "7", account_number: "SAV-007-2024", account_name: "Kingsley Obi", product: "Fixed Deposit", organization: "Lendsqr HQ", balance: 2000000, target_amount: 0, interest_earned: 180000, status: "Active", date: "2024-01-05" },
	{ id: "8", account_number: "SAV-008-2024", account_name: "Gloria Osei", product: "Regular", organization: "Lendsqr Labs", balance: 55000, target_amount: 0, interest_earned: 1100, status: "Dormant", date: "2024-02-11" },
	{ id: "9", account_number: "SAV-009-2024", account_name: "Samuel Ogundipe", product: "Flex Save", organization: "Lendsqr Finance", balance: 430000, target_amount: 600000, interest_earned: 12300, status: "Active", date: "2024-04-16" },
	{ id: "10", account_number: "SAV-010-2024", account_name: "Josephine Nwosu", product: "Target Save", organization: "Lendsqr HQ", balance: 88000, target_amount: 300000, interest_earned: 2200, status: "Frozen", date: "2024-05-20" },
	{ id: "11", account_number: "SAV-011-2024", account_name: "Ibrahim Bello", product: "Regular", organization: "Lendsqr Labs", balance: 190000, target_amount: 0, interest_earned: 5700, status: "Active", date: "2024-07-03" },
	{ id: "12", account_number: "SAV-012-2024", account_name: "Mary Johnson", product: "Fixed Deposit", organization: "Lendsqr Finance", balance: 950000, target_amount: 0, interest_earned: 47500, status: "Active", date: "2024-09-28" },
];

let db: SavingsRecord[] = [...seed];

const listSavings = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((item) => {
		const matchesAccount = !filters.account_name || item.account_name.toLowerCase().includes(filters.account_name.toLowerCase());
		const matchesProduct = !filters.product || item.product === filters.product;
		const matchesOrg = !filters.organization || item.organization === filters.organization;
		const matchesStatus = !filters.status || item.status.toLowerCase() === filters.status.toLowerCase();
		return matchesAccount && matchesProduct && matchesOrg && matchesStatus;
	});
	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const currentPage = Math.min(page, totalPages);
	const start = (currentPage - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages, totalItems: filtered.length };
};

export default function SavingsTable() {
	const router = useRouter();
	const [rows, setRows] = useState<SavingsRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [filters, setFilters] = useState<FilterValues>({});

	const runList = useCallback(async () => {
		setLoading(true);
		try {
			const res = await listSavings({ filters, page, pageSize: itemsPerPage });
			setRows(res.rows);
			setTotalPages(res.totalPages);
			setTotalItems(res.totalItems);
		} finally { setLoading(false); }
	}, [filters, itemsPerPage, page]);

	useEffect(() => { runList(); }, [runList]);

	const columns: Column<SavingsRecord>[] = useMemo(() => [
		{ key: "account_number", title: "ACCOUNT NO.", sortable: true },
		{ key: "account_name", title: "ACCOUNT NAME", sortable: true, filterable: true },
		{ key: "product", title: "PRODUCT", sortable: true, filterable: true },
		{ key: "organization", title: "ORGANIZATION", sortable: true, filterable: true },
		{ key: "balance", title: "BALANCE", sortable: true, render: (v: number) => fmtCurrency(v) },
		{ key: "target_amount", title: "TARGET", sortable: true, render: (v: number) => v > 0 ? fmtCurrency(v) : "—" },
		{ key: "interest_earned", title: "INTEREST EARNED", sortable: true, render: (v: number) => fmtCurrency(v) },
		{ key: "status", title: "STATUS", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v} /> },
		{ key: "date", title: "DATE OPENED", sortable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } },
	], []);

	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "account_name", label: "Account Name", type: "text", placeholder: "Enter name" },
		{ key: "product", label: "Product", type: "select", options: [{ label: "Flex Save", value: "Flex Save" }, { label: "Fixed Deposit", value: "Fixed Deposit" }, { label: "Target Save", value: "Target Save" }, { label: "Regular", value: "Regular" }] },
		{ key: "organization", label: "Organization", type: "select", options: [{ label: "Lendsqr HQ", value: "Lendsqr HQ" }, { label: "Lendsqr Finance", value: "Lendsqr Finance" }, { label: "Lendsqr Labs", value: "Lendsqr Labs" }] },
		{ key: "status", label: "Status", type: "select", options: [{ label: "Active", value: "Active" }, { label: "Dormant", value: "Dormant" }, { label: "Frozen", value: "Frozen" }, { label: "Closed", value: "Closed" }] },
	], []);

	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);

	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Account", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: SavingsRecord) => { router.push(FrontendLinks.savingsDetails(row.id)); } },
		{ id: "freeze", label: "Freeze Account", icon: <img src="/media/icons/user-times.svg" alt="" width={16} height={16} />, onClick: async (row: SavingsRecord) => { setLoading(true); db = db.map((s) => s.id === row.id ? { ...s, status: "Frozen" } : s); await runList(); } },
	], [runList]);

	return (
		<GenericTable<SavingsRecord>
			columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions
			onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No savings accounts found"
			pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }}
		/>
	);
}
