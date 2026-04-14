"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";

type WhitelistRecord = {
	id: string;
	entity_type: string;
	entity_value: string;
	reason: string;
	added_by: string;
	organization: string;
	expires_at: string;
	date: string;
};

type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: WhitelistRecord[]; totalPages: number; totalItems: number };

const PAGE_SIZE = 10;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const seed: WhitelistRecord[] = [
	{ id: "1", entity_type: "Email", entity_value: "vip.client@company.ng", reason: "Strategic partner", added_by: "Admin User", organization: "Lendsqr HQ", expires_at: "2027-12-31", date: "2024-01-15" },
	{ id: "2", entity_type: "BVN", entity_value: "22345678901", reason: "Pre-approved customer", added_by: "Jane Okafor", organization: "Lendsqr Finance", expires_at: "2026-06-30", date: "2024-02-20" },
	{ id: "3", entity_type: "Phone", entity_value: "+234 801 234 5678", reason: "Staff member", added_by: "Admin User", organization: "Lendsqr HQ", expires_at: "", date: "2024-03-10" },
	{ id: "4", entity_type: "Email", entity_value: "premium@enterprise.com", reason: "Corporate account", added_by: "Chidi Anekwe", organization: "Lendsqr Labs", expires_at: "2027-03-31", date: "2024-04-05" },
	{ id: "5", entity_type: "BVN", entity_value: "33456789012", reason: "Government official", added_by: "Admin User", organization: "Lendsqr HQ", expires_at: "2026-12-31", date: "2024-05-12" },
	{ id: "6", entity_type: "Email", entity_value: "trusted@bank.ng", reason: "Banking partner referral", added_by: "Favour Adichie", organization: "Lendsqr Finance", expires_at: "2027-06-30", date: "2024-06-01" },
	{ id: "7", entity_type: "Phone", entity_value: "+234 802 345 6789", reason: "Early adopter program", added_by: "Admin User", organization: "Lendsqr HQ", expires_at: "2026-09-30", date: "2024-07-18" },
	{ id: "8", entity_type: "Email", entity_value: "founding@member.ng", reason: "Founding member", added_by: "Kingsley Obi", organization: "Lendsqr Labs", expires_at: "", date: "2024-08-22" },
	{ id: "9", entity_type: "BVN", entity_value: "44567890123", reason: "Investor referral", added_by: "Admin User", organization: "Lendsqr Finance", expires_at: "2027-01-31", date: "2024-09-05" },
	{ id: "10", entity_type: "Phone", entity_value: "+234 803 456 7890", reason: "Staff referral", added_by: "Gloria Osei", organization: "Lendsqr HQ", expires_at: "2026-11-30", date: "2024-10-14" },
];

let db: WhitelistRecord[] = [...seed];

const listWhitelist = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((item) => {
		const matchesType = !filters.entity_type || item.entity_type === filters.entity_type;
		const matchesValue = !filters.entity_value || item.entity_value.toLowerCase().includes(filters.entity_value.toLowerCase());
		const matchesOrg = !filters.organization || item.organization === filters.organization;
		return matchesType && matchesValue && matchesOrg;
	});
	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const currentPage = Math.min(page, totalPages);
	const start = (currentPage - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages, totalItems: filtered.length };
};

const fmtDate = (v: string) => {
	if (!v) return "Never";
	const d = new Date(v);
	return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function WhitelistTable() {
	const router = useRouter();
	const [rows, setRows] = useState<WhitelistRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [filters, setFilters] = useState<FilterValues>({});

	const runList = useCallback(async () => {
		setLoading(true);
		try {
			const res = await listWhitelist({ filters, page, pageSize: itemsPerPage });
			setRows(res.rows);
			setTotalPages(res.totalPages);
			setTotalItems(res.totalItems);
		} finally { setLoading(false); }
	}, [filters, itemsPerPage, page]);

	useEffect(() => { runList(); }, [runList]);

	const columns: Column<WhitelistRecord>[] = useMemo(() => [
		{ key: "entity_type", title: "TYPE", sortable: true, filterable: true },
		{ key: "entity_value", title: "VALUE", sortable: true, filterable: true },
		{ key: "reason", title: "REASON", sortable: true },
		{ key: "added_by", title: "ADDED BY", sortable: true },
		{ key: "organization", title: "ORGANIZATION", sortable: true, filterable: true },
		{ key: "expires_at", title: "EXPIRES", sortable: true, render: (v: string) => fmtDate(v) },
		{ key: "date", title: "DATE ADDED", sortable: true, render: (v: string) => fmtDate(v) },
	], []);

	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "entity_type", label: "Type", type: "select", options: [{ label: "Email", value: "Email" }, { label: "BVN", value: "BVN" }, { label: "Phone", value: "Phone" }] },
		{ key: "entity_value", label: "Value", type: "text", placeholder: "Search value" },
		{ key: "organization", label: "Organization", type: "select", options: [{ label: "Lendsqr HQ", value: "Lendsqr HQ" }, { label: "Lendsqr Finance", value: "Lendsqr Finance" }, { label: "Lendsqr Labs", value: "Lendsqr Labs" }] },
	], []);

	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);

	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: WhitelistRecord) => { router.push(FrontendLinks.whitelistDetails(row.id)); } },
		{ id: "remove", label: "Remove", icon: <img src="/media/icons/user-times.svg" alt="" width={16} height={16} />, onClick: async (row: WhitelistRecord) => { setLoading(true); db = db.filter((w) => w.id !== row.id); await runList(); } },
	], [runList, router]);

	return (
		<GenericTable<WhitelistRecord>
			columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions
			onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No whitelist entries found"
			onRowClick={(row) => router.push(FrontendLinks.whitelistDetails(row.id))}
			pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }}
		/>
	);
}
