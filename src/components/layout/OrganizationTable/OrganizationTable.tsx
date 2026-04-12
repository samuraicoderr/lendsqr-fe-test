"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";

type OrgRecord = { id: string; name: string; email: string; phone: string; industry: string; registration_number: string; state: string; status: string; date: string };
type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: OrgRecord[]; totalPages: number; totalItems: number };

const PAGE_SIZE = 10;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const seed: OrgRecord[] = [
	{ id: "1", name: "Lendsqr HQ", email: "admin@lendsqr.com", phone: "+234 1 280 0000", industry: "Financial Technology", registration_number: "RC-123456", state: "Lagos", status: "Active", date: "2019-03-15" },
	{ id: "2", name: "Lendsqr Finance", email: "finance@lendsqr.com", phone: "+234 1 280 0001", industry: "Microfinance", registration_number: "RC-234567", state: "Lagos", status: "Active", date: "2020-01-10" },
	{ id: "3", name: "Lendsqr Labs", email: "labs@lendsqr.com", phone: "+234 1 280 0002", industry: "Software Development", registration_number: "RC-345678", state: "Lagos", status: "Active", date: "2021-06-20" },
	{ id: "4", name: "QuickCredit Nigeria", email: "info@quickcredit.ng", phone: "+234 1 300 4000", industry: "Consumer Lending", registration_number: "RC-456789", state: "Abuja", status: "Active", date: "2022-02-14" },
	{ id: "5", name: "Farmvest Capital", email: "hello@farmvest.ng", phone: "+234 1 400 5000", industry: "Agricultural Finance", registration_number: "RC-567890", state: "Ibadan", status: "Pending", date: "2023-04-01" },
	{ id: "6", name: "PayEase Microfinance", email: "contact@payease.ng", phone: "+234 1 500 6000", industry: "Microfinance", registration_number: "RC-678901", state: "Port Harcourt", status: "Active", date: "2023-07-18" },
	{ id: "7", name: "TrustBridge Finance", email: "admin@trustbridge.ng", phone: "+234 1 600 7000", industry: "Peer-to-Peer Lending", registration_number: "RC-789012", state: "Kano", status: "Suspended", date: "2023-09-05" },
	{ id: "8", name: "NaijaSave Ltd", email: "hello@naijasave.com", phone: "+234 1 700 8000", industry: "Savings & Investment", registration_number: "RC-890123", state: "Lagos", status: "Active", date: "2024-01-22" },
	{ id: "9", name: "CreditPro Services", email: "info@creditpro.ng", phone: "+234 1 800 9000", industry: "Credit Scoring", registration_number: "RC-901234", state: "Abuja", status: "Inactive", date: "2024-03-10" },
	{ id: "10", name: "WealthBridge Partners", email: "team@wealthbridge.ng", phone: "+234 1 900 1000", industry: "Wealth Management", registration_number: "RC-012345", state: "Lagos", status: "Active", date: "2024-06-14" },
];

let db: OrgRecord[] = [...seed];

const listOrganizations = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((item) => {
		const matchesName = !filters.name || item.name.toLowerCase().includes(filters.name.toLowerCase());
		const matchesIndustry = !filters.industry || item.industry === filters.industry;
		const matchesState = !filters.state || item.state === filters.state;
		const matchesStatus = !filters.status || item.status.toLowerCase() === filters.status.toLowerCase();
		return matchesName && matchesIndustry && matchesState && matchesStatus;
	});
	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const currentPage = Math.min(page, totalPages);
	const start = (currentPage - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages, totalItems: filtered.length };
};

export default function OrganizationTable() {
	const router = useRouter();
	const [rows, setRows] = useState<OrgRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [filters, setFilters] = useState<FilterValues>({});

	const runList = useCallback(async () => {
		setLoading(true);
		try { const res = await listOrganizations({ filters, page, pageSize: itemsPerPage }); setRows(res.rows); setTotalPages(res.totalPages); setTotalItems(res.totalItems); } finally { setLoading(false); }
	}, [filters, itemsPerPage, page]);

	useEffect(() => { runList(); }, [runList]);

	const columns: Column<OrgRecord>[] = useMemo(() => [
		{ key: "name", title: "ORGANIZATION", sortable: true, filterable: true },
		{ key: "email", title: "EMAIL", sortable: true, render: (v: string) => <a href={`mailto:${v}`} className="inline-link" onClick={(e) => e.stopPropagation()}>{v}</a> },
		{ key: "phone", title: "PHONE", sortable: true },
		{ key: "industry", title: "INDUSTRY", sortable: true, filterable: true },
		{ key: "registration_number", title: "REG. NO.", sortable: true },
		{ key: "state", title: "STATE", sortable: true, filterable: true },
		{ key: "status", title: "STATUS", sortable: true, filterable: true },
		{ key: "date", title: "DATE JOINED", sortable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } },
	], []);

	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "name", label: "Organization", type: "text", placeholder: "Enter name" },
		{ key: "industry", label: "Industry", type: "select", options: Array.from(new Set(seed.map((s) => s.industry))).map((i) => ({ label: i, value: i })) },
		{ key: "state", label: "State", type: "select", options: Array.from(new Set(seed.map((s) => s.state))).map((s) => ({ label: s, value: s })) },
		{ key: "status", label: "Status", type: "select", options: [{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }, { label: "Pending", value: "Pending" }, { label: "Suspended", value: "Suspended" }] },
	], []);

	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);

	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: OrgRecord) => { router.push(FrontendLinks.organizationDetails(row.id)); } },
		{ id: "suspend", label: "Suspend", icon: <img src="/media/icons/user-times.svg" alt="" width={16} height={16} />, onClick: async (row: OrgRecord) => { setLoading(true); db = db.map((o) => o.id === row.id ? { ...o, status: "Suspended" } : o); await runList(); } },
		{ id: "activate", label: "Activate", icon: <img src="/media/icons/user-activate.svg" alt="" width={16} height={16} />, onClick: async (row: OrgRecord) => { setLoading(true); db = db.map((o) => o.id === row.id ? { ...o, status: "Active" } : o); await runList(); } },
	], [runList]);

	return (
		<GenericTable<OrgRecord>
			columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions
			onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No organizations found"
			pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }}
		/>
	);
}
