"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FrontendLinks from "@/lib/FrontendLinks";
import GenericTable, { Column, FilterConfig, FilterValues, RowAction } from "@/components/layout/GenericTable/GenericTable";
import StatusPill from "@/components/ui/StatusPill";

type GuarantorRecord = {
	id: string;
	full_name: string;
	email: string;
	phone_number: string;
	relationship: string;
	employer: string;
	verification_status: string;
	active_guarantees: number;
	total_guaranteed: string;
	date: string;
};

type ListParams = { filters: FilterValues; page: number; pageSize: number };
type ListResponse = { rows: GuarantorRecord[]; totalPages: number; totalItems: number };

const PAGE_SIZE = 10;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const seed: GuarantorRecord[] = [
	{ id: "1", full_name: "Debby Ogana", email: "debby@gmail.com", phone_number: "+234 803 100 0001", relationship: "Sister", employer: "Sterling Bank", verification_status: "Verified", active_guarantees: 2, total_guaranteed: "₦450,000", date: "2023-01-15" },
	{ id: "2", full_name: "Emeka Okafor", email: "emeka.o@yahoo.com", phone_number: "+234 803 100 0002", relationship: "Brother", employer: "MTN Nigeria", verification_status: "Verified", active_guarantees: 1, total_guaranteed: "₦200,000", date: "2023-02-20" },
	{ id: "3", full_name: "Funke Adeyemi", email: "funke.a@outlook.com", phone_number: "+234 803 100 0003", relationship: "Friend", employer: "Access Bank", verification_status: "Pending", active_guarantees: 0, total_guaranteed: "₦0", date: "2023-03-10" },
	{ id: "4", full_name: "Gbenga Babatunde", email: "gbenga.b@gmail.com", phone_number: "+234 803 100 0004", relationship: "Colleague", employer: "Dangote Group", verification_status: "Verified", active_guarantees: 3, total_guaranteed: "₦780,000", date: "2023-04-05" },
	{ id: "5", full_name: "Halima Yusuf", email: "halima.y@gmail.com", phone_number: "+234 803 100 0005", relationship: "Spouse", employer: "NNPC", verification_status: "Rejected", active_guarantees: 0, total_guaranteed: "₦0", date: "2023-05-12" },
	{ id: "6", full_name: "Ikechukwu Nwosu", email: "ike.nwosu@gmail.com", phone_number: "+234 803 100 0006", relationship: "Uncle", employer: "Zenith Bank", verification_status: "Verified", active_guarantees: 1, total_guaranteed: "₦150,000", date: "2023-06-01" },
	{ id: "7", full_name: "Janet Omoruyi", email: "janet.o@hotmail.com", phone_number: "+234 803 100 0007", relationship: "Mother", employer: "Edo State Civil Service", verification_status: "Pending", active_guarantees: 0, total_guaranteed: "₦0", date: "2023-06-18" },
	{ id: "8", full_name: "Kunle Ajayi", email: "kunle.a@gmail.com", phone_number: "+234 803 100 0008", relationship: "Friend", employer: "Flutterwave", verification_status: "Verified", active_guarantees: 2, total_guaranteed: "₦520,000", date: "2023-07-22" },
	{ id: "9", full_name: "Lola Bakare", email: "lola.b@gmail.com", phone_number: "+234 803 100 0009", relationship: "Sister", employer: "Interswitch", verification_status: "Expired", active_guarantees: 0, total_guaranteed: "₦100,000", date: "2023-08-11" },
	{ id: "10", full_name: "Musa Abdullahi", email: "musa.a@gmail.com", phone_number: "+234 803 100 0010", relationship: "Father", employer: "BUA Group", verification_status: "Verified", active_guarantees: 1, total_guaranteed: "₦300,000", date: "2023-09-05" },
	{ id: "11", full_name: "Ngozi Eze", email: "ngozi.e@gmail.com", phone_number: "+234 803 100 0011", relationship: "Colleague", employer: "GTBank", verification_status: "Verified", active_guarantees: 2, total_guaranteed: "₦600,000", date: "2023-10-14" },
	{ id: "12", full_name: "Olumide Fashanu", email: "olu.f@gmail.com", phone_number: "+234 803 100 0012", relationship: "Brother", employer: "Paystack", verification_status: "Pending", active_guarantees: 0, total_guaranteed: "₦0", date: "2023-11-03" },
];

let db: GuarantorRecord[] = [...seed];

const listGuarantors = async ({ filters, page, pageSize }: ListParams): Promise<ListResponse> => {
	await delay(300);
	const filtered = db.filter((item) => {
		const matchesName = !filters.full_name || item.full_name.toLowerCase().includes(filters.full_name.toLowerCase());
		const matchesEmail = !filters.email || item.email.toLowerCase().includes(filters.email.toLowerCase());
		const matchesRelationship = !filters.relationship || item.relationship === filters.relationship;
		const matchesStatus = !filters.verification_status || item.verification_status.toLowerCase() === filters.verification_status.toLowerCase();
		const matchesDate = !filters.date || item.date === filters.date;
		return matchesName && matchesEmail && matchesRelationship && matchesStatus && matchesDate;
	});
	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const currentPage = Math.min(page, totalPages);
	const start = (currentPage - 1) * pageSize;
	return { rows: filtered.slice(start, start + pageSize), totalPages, totalItems: filtered.length };
};

export default function GuarantorsTable() {
	const router = useRouter();
	const [rows, setRows] = useState<GuarantorRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [filters, setFilters] = useState<FilterValues>({});

	const runList = useCallback(async () => {
		setLoading(true);
		try {
			const res = await listGuarantors({ filters, page, pageSize: itemsPerPage });
			setRows(res.rows);
			setTotalPages(res.totalPages);
			setTotalItems(res.totalItems);
		} finally {
			setLoading(false);
		}
	}, [filters, itemsPerPage, page]);

	useEffect(() => { runList(); }, [runList]);

	const columns: Column<GuarantorRecord>[] = useMemo(() => [
		{ key: "full_name", title: "FULL NAME", sortable: true, filterable: true },
		{ key: "email", title: "EMAIL", sortable: true, filterable: true, render: (v: string) => <a href={`mailto:${v}`} className="inline-link" onClick={(e) => e.stopPropagation()}>{v}</a> },
		{ key: "phone_number", title: "PHONE NUMBER", sortable: true },
		{ key: "relationship", title: "RELATIONSHIP", sortable: true, filterable: true },
		{ key: "employer", title: "EMPLOYER", sortable: true },
		{ key: "verification_status", title: "STATUS", sortable: true, filterable: true, render: (v: string) => <StatusPill status={v} /> },
		{ key: "active_guarantees", title: "ACTIVE GUARANTEES", sortable: true },
		{ key: "date", title: "DATE ADDED", sortable: true, filterable: true, render: (v: string) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } },
	], []);

	const filterConfig: FilterConfig[] = useMemo(() => [
		{ key: "full_name", label: "Full Name", type: "text", placeholder: "Enter name" },
		{ key: "email", label: "Email", type: "email", placeholder: "Enter email" },
		{ key: "relationship", label: "Relationship", type: "select", options: [{ label: "Sister", value: "Sister" }, { label: "Brother", value: "Brother" }, { label: "Friend", value: "Friend" }, { label: "Colleague", value: "Colleague" }, { label: "Spouse", value: "Spouse" }, { label: "Parent", value: "Parent" }] },
		{ key: "verification_status", label: "Status", type: "select", options: [{ label: "Verified", value: "Verified" }, { label: "Pending", value: "Pending" }, { label: "Rejected", value: "Rejected" }, { label: "Expired", value: "Expired" }] },
		{ key: "date", label: "Date Added", type: "date" },
	], []);

	const handleFilter = useCallback((f: FilterValues) => { setPage(1); setFilters(f); }, []);
	const handleReset = useCallback(() => { setPage(1); setFilters({}); }, []);
	const handleItemsPerPageChange = useCallback((n: number) => { setItemsPerPage(n); setPage(1); }, []);

	const rowActions: RowAction[] = useMemo(() => [
		{ id: "view", label: "View Details", icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />, onClick: (row: GuarantorRecord) => { router.push(FrontendLinks.guarantorDetails(row.id)); } },
		{ id: "verify", label: "Verify", icon: <img src="/media/icons/user-check.svg" alt="" width={16} height={16} />, onClick: async (row: GuarantorRecord) => { setLoading(true); db = db.map((g) => g.id === row.id ? { ...g, verification_status: "Verified" } : g); await runList(); } },
		{ id: "deactivate", label: "Deactivate", icon: <img src="/media/icons/user-times.svg" alt="" width={16} height={16} />, onClick: async (row: GuarantorRecord) => { setLoading(true); db = db.map((g) => g.id === row.id ? { ...g, verification_status: "Expired" } : g); await runList(); } },
	], [runList]);

	return (
		<GenericTable<GuarantorRecord>
			columns={columns} data={rows} filters={filterConfig} rowActions={rowActions} showRowActions
			onFilter={handleFilter} onReset={handleReset} loading={loading} emptyMessage="No guarantors found"
			onRowClick={(row) => router.push(FrontendLinks.guarantorDetails(row.id))}
			pagination={{ currentPage: page, totalPages, totalItems, itemsPerPage, onPageChange: setPage, onItemsPerPageChange: handleItemsPerPageChange }}
		/>
	);
}
