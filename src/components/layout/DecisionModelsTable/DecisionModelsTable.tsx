"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";

type DecisionModelRecord = {
	id: string;
	name: string;
	version: string;
	model_type: string;
	organization: string;
	is_default: string;
	required_data_points: number;
	status: string;
	created_by: string;
	date: string;
};

type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: DecisionModelRecord[]; totalPages: number; totalItems: number };

const PAGE_SIZE = 10;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const seed: DecisionModelRecord[] = [
	{ id: "1", name: "Standard Credit Scorecard", version: "2.1", model_type: "Scorecard", organization: "Lendsqr HQ", is_default: "Yes", required_data_points: 12, status: "Active", created_by: "Admin User", date: "2022-06-15" },
	{ id: "2", name: "Quick Loan Assessment", version: "1.0", model_type: "Rule Based", organization: "Lendsqr HQ", is_default: "No", required_data_points: 6, status: "Active", created_by: "Jane Okafor", date: "2022-09-20" },
	{ id: "3", name: "Premium Loan Model", version: "3.0", model_type: "Machine Learning", organization: "Lendsqr Finance", is_default: "Yes", required_data_points: 24, status: "Active", created_by: "David Nwankwo", date: "2023-01-10" },
	{ id: "4", name: "SME Risk Assessment", version: "1.2", model_type: "Hybrid", organization: "Lendsqr Labs", is_default: "No", required_data_points: 18, status: "Active", created_by: "Chidi Anekwe", date: "2023-03-05" },
	{ id: "5", name: "Micro Loan Evaluator", version: "1.0", model_type: "Rule Based", organization: "Lendsqr HQ", is_default: "No", required_data_points: 4, status: "Inactive", created_by: "Admin User", date: "2023-04-18" },
	{ id: "6", name: "Salary Advance Model", version: "2.0", model_type: "Scorecard", organization: "Lendsqr Finance", is_default: "No", required_data_points: 8, status: "Active", created_by: "Favour Adichie", date: "2023-06-22" },
	{ id: "7", name: "High-Risk Detector v2", version: "2.0", model_type: "Machine Learning", organization: "Lendsqr Labs", is_default: "No", required_data_points: 32, status: "Active", created_by: "Samuel Ogundipe", date: "2023-08-14" },
	{ id: "8", name: "Basic Eligibility Check", version: "1.0", model_type: "Rule Based", organization: "Lendsqr HQ", is_default: "No", required_data_points: 3, status: "Inactive", created_by: "Admin User", date: "2023-10-01" },
	{ id: "9", name: "Group Loan Assessment", version: "1.1", model_type: "Hybrid", organization: "Lendsqr Finance", is_default: "No", required_data_points: 15, status: "Active", created_by: "Tolani Bakare", date: "2024-01-09" },
	{ id: "10", name: "Agricultural Loan Model", version: "1.0", model_type: "Scorecard", organization: "Lendsqr Labs", is_default: "No", required_data_points: 10, status: "Active", created_by: "Gloria Osei", date: "2024-03-17" },
];

let db: DecisionModelRecord[] = [...seed];

const listDecisionModels = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((item) => {
		const matchesName = !filters.name || item.name.toLowerCase().includes(filters.name.toLowerCase());
		const matchesType = !filters.model_type || item.model_type === filters.model_type;
		const matchesOrg = !filters.organization || item.organization === filters.organization;
		const matchesStatus = !filters.status || item.status.toLowerCase() === filters.status.toLowerCase();
		return matchesName && matchesType && matchesOrg && matchesStatus;
	});
	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const currentPage = Math.min(page, totalPages);
	const start = (currentPage - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages, totalItems: filtered.length };
};

export default function DecisionModelsTable() {
	const router = useRouter();
	const [rows, setRows] = useState<DecisionModelRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [filters, setFilters] = useState<FilterValues>({});

	const runList = useCallback(async () => {
		setLoading(true);
		try {
			const res = await listDecisionModels({ filters, page, pageSize: itemsPerPage });
			setRows(res.rows);
			setTotalPages(res.totalPages);
			setTotalItems(res.totalItems);
		} finally { setLoading(false); }
	}, [filters, itemsPerPage, page]);

	useEffect(() => { runList(); }, [runList]);

	const columns: Column<DecisionModelRecord>[] = useMemo(() => [
		{ key: "name", title: "MODEL NAME", sortable: true, filterable: true },
		{ key: "version", title: "VERSION", sortable: true },
		{ key: "model_type", title: "TYPE", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v} /> },
		{ key: "organization", title: "ORGANIZATION", sortable: true, filterable: true },
		{ key: "is_default", title: "DEFAULT", sortable: true },
		{ key: "required_data_points", title: "DATA POINTS", sortable: true },
		{ key: "status", title: "STATUS", sortable: true, filterable: true },
		{ key: "created_by", title: "CREATED BY", sortable: true },
		{ key: "date", title: "DATE CREATED", sortable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } },
	], []);

	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "name", label: "Model Name", type: "text", placeholder: "Enter model name" },
		{ key: "model_type", label: "Model Type", type: "select", options: [{ label: "Rule Based", value: "Rule Based" }, { label: "Scorecard", value: "Scorecard" }, { label: "Machine Learning", value: "Machine Learning" }, { label: "Hybrid", value: "Hybrid" }] },
		{ key: "organization", label: "Organization", type: "select", options: [{ label: "Lendsqr HQ", value: "Lendsqr HQ" }, { label: "Lendsqr Finance", value: "Lendsqr Finance" }, { label: "Lendsqr Labs", value: "Lendsqr Labs" }] },
		{ key: "status", label: "Status", type: "select", options: [{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }] },
	], []);

	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);

	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: DecisionModelRecord) => { router.push(FrontendLinks.decisionModelDetails(row.id)); } },
		{ id: "toggle", label: "Toggle Status", icon: <img src="/media/icons/sliders.svg" alt="" width={16} height={16} />, onClick: async (row: DecisionModelRecord) => { setLoading(true); db = db.map((m) => m.id === row.id ? { ...m, status: m.status === "Active" ? "Inactive" : "Active" } : m); await runList(); } },
	], [runList]);

	return (
		<GenericTable<DecisionModelRecord>
			columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions
			onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No decision models found"
			pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }}
		/>
	);
}
