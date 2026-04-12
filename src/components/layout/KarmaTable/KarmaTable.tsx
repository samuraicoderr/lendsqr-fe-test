"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";

type KarmaRecord = {
	id: string;
	user: string;
	email: string;
	karma_score: number;
	event_type: string;
	points_change: number;
	reference_type: string;
	blacklist_status: string;
	date: string;
};

type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: KarmaRecord[]; totalPages: number; totalItems: number };

const PAGE_SIZE = 10;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const seed: KarmaRecord[] = [
	{ id: "1", user: "Adeyemi Okafor", email: "adeyemi@lendsqr.com", karma_score: 85, event_type: "Loan Repaid On Time", points_change: 10, reference_type: "Loan", blacklist_status: "Clean", date: "2026-04-10" },
	{ id: "2", user: "Tolani Bakare", email: "tolani@lendsqr.com", karma_score: 72, event_type: "Profile Completed", points_change: 5, reference_type: "Profile", blacklist_status: "Clean", date: "2026-04-09" },
	{ id: "3", user: "Obinna Chukwu", email: "obinna@lendsqr.com", karma_score: 15, event_type: "Loan Defaulted", points_change: -30, reference_type: "Loan", blacklist_status: "Blacklisted", date: "2026-04-08" },
	{ id: "4", user: "Khadija Ibrahim", email: "khadija@lendsqr.com", karma_score: 92, event_type: "Loan Repaid Early", points_change: 15, reference_type: "Loan", blacklist_status: "Clean", date: "2026-04-07" },
	{ id: "5", user: "David Nwankwo", email: "david@lendsqr.com", karma_score: 8, event_type: "Fraudulent Activity", points_change: -50, reference_type: "System", blacklist_status: "Blacklisted", date: "2026-04-06" },
	{ id: "6", user: "Favour Adichie", email: "favour@lendsqr.com", karma_score: 78, event_type: "Document Verified", points_change: 5, reference_type: "KYC", blacklist_status: "Clean", date: "2026-04-05" },
	{ id: "7", user: "Kingsley Obi", email: "kingsley@lendsqr.com", karma_score: 65, event_type: "Late Payment", points_change: -10, reference_type: "Loan", blacklist_status: "Clean", date: "2026-04-04" },
	{ id: "8", user: "Gloria Osei", email: "gloria@lendsqr.com", karma_score: 88, event_type: "Referral Signed Up", points_change: 8, reference_type: "Referral", blacklist_status: "Clean", date: "2026-04-03" },
	{ id: "9", user: "Samuel Ogundipe", email: "samuel@lendsqr.com", karma_score: 45, event_type: "Late Payment", points_change: -15, reference_type: "Loan", blacklist_status: "Clean", date: "2026-04-02" },
	{ id: "10", user: "Josephine Nwosu", email: "josephine@lendsqr.com", karma_score: 55, event_type: "Loan Repaid On Time", points_change: 10, reference_type: "Loan", blacklist_status: "Clean", date: "2026-04-01" },
	{ id: "11", user: "Ibrahim Bello", email: "ibrahim@lendsqr.com", karma_score: 30, event_type: "Loan Defaulted", points_change: -25, reference_type: "Loan", blacklist_status: "Blacklisted", date: "2026-03-30" },
	{ id: "12", user: "Mary Johnson", email: "mary@lendsqr.com", karma_score: 95, event_type: "Loan Repaid Early", points_change: 15, reference_type: "Loan", blacklist_status: "Clean", date: "2026-03-29" },
];

let db: KarmaRecord[] = [...seed];

const listKarma = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((item) => {
		const matchesUser = !filters.user || item.user.toLowerCase().includes(filters.user.toLowerCase());
		const matchesEvent = !filters.event_type || item.event_type === filters.event_type;
		const matchesBl = !filters.blacklist_status || item.blacklist_status === filters.blacklist_status;
		return matchesUser && matchesEvent && matchesBl;
	});
	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const currentPage = Math.min(page, totalPages);
	const start = (currentPage - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages, totalItems: filtered.length };
};

export default function KarmaTable() {
	const router = useRouter();
	const [rows, setRows] = useState<KarmaRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [filters, setFilters] = useState<FilterValues>({});

	const runList = useCallback(async () => {
		setLoading(true);
		try {
			const res = await listKarma({ filters, page, pageSize: itemsPerPage });
			setRows(res.rows);
			setTotalPages(res.totalPages);
			setTotalItems(res.totalItems);
		} finally { setLoading(false); }
	}, [filters, itemsPerPage, page]);

	useEffect(() => { runList(); }, [runList]);

	const renderScore = (v: number) => {
		const color = v >= 70 ? '#39CD62' : v >= 40 ? '#E9B200' : '#E4033B';
		return <span style={{ fontWeight: 600, color }}>{v}</span>;
	};

	const renderChange = (v: number) => {
		const color = v > 0 ? '#39CD62' : v < 0 ? '#E4033B' : '#545F7D';
		return <span style={{ fontWeight: 600, color }}>{v > 0 ? `+${v}` : v}</span>;
	};

	const columns: Column<KarmaRecord>[] = useMemo(() => [
		{ key: "user", title: "USER", sortable: true, filterable: true },
		{ key: "email", title: "EMAIL", sortable: true, render: (v: string) => <a href={`mailto:${v}`} className="inline-link" onClick={(e) => e.stopPropagation()}>{v}</a> },
		{ key: "karma_score", title: "KARMA SCORE", sortable: true, render: renderScore },
		{ key: "event_type", title: "LAST EVENT", sortable: true, filterable: true },
		{ key: "points_change", title: "CHANGE", sortable: true, render: renderChange },
		{ key: "reference_type", title: "REFERENCE", sortable: true },
		{ key: "blacklist_status", title: "STATUS", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v === "Blacklisted" ? "Blacklisted" : "Active"} /> },
		{ key: "date", title: "DATE", sortable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } },
	], []);

	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "user", label: "User", type: "text", placeholder: "Enter name" },
		{ key: "event_type", label: "Event Type", type: "select", options: [{ label: "Loan Repaid On Time", value: "Loan Repaid On Time" }, { label: "Loan Repaid Early", value: "Loan Repaid Early" }, { label: "Late Payment", value: "Late Payment" }, { label: "Loan Defaulted", value: "Loan Defaulted" }, { label: "Profile Completed", value: "Profile Completed" }, { label: "Document Verified", value: "Document Verified" }, { label: "Fraudulent Activity", value: "Fraudulent Activity" }] },
		{ key: "blacklist_status", label: "Status", type: "select", options: [{ label: "Clean", value: "Clean" }, { label: "Blacklisted", value: "Blacklisted" }] },
	], []);

	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);

	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Profile", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: KarmaRecord) => { router.push(FrontendLinks.userDetails(row.id)); } },
		{ id: "blacklist", label: "Blacklist User", icon: <img src="/media/icons/userx.svg" alt="" width={16} height={16} />, onClick: async (row: KarmaRecord) => { setLoading(true); db = db.map((k) => k.id === row.id ? { ...k, blacklist_status: "Blacklisted", karma_score: 0 } : k); await runList(); } },
	], [runList]);

	return (
		<GenericTable<KarmaRecord>
			columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions
			onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No karma records found"
			pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }}
		/>
	);
}
