"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GenericTable, {
	Column,
	FilterConfig,
	FilterValues,
	RowAction,
} from "@/components/layout/GenericTable/GenericTable";

type UserStatus = "Active" | "Inactive" | "Pending" | "Blacklisted";

type UserRecord = {
	id: string;
	organization: string;
	username: string;
	email: string;
	phone_number: string;
	date: string;
	status: UserStatus;
};

type ListUsersParams = {
	filters: FilterValues;
	page: number;
	pageSize: number;
};

type ListUsersResponse = {
	rows: UserRecord[];
	totalPages: number;
	totalItems: number;
};

const PAGE_SIZE = 10;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const usersSeed: UserRecord[] = [
	{ id: "1", organization: "Lendsqr HQ", username: "adeyemi", email: "adeyemi@lendsqr.com", phone_number: "+234 803 000 0001", date: "2021-03-14", status: "Active" },
	{ id: "2", organization: "Lendsqr Finance", username: "ifedayo", email: "ifedayo@lendsqr.com", phone_number: "+234 803 000 0002", date: "2021-06-19", status: "Inactive" },
	{ id: "3", organization: "Lendsqr Labs", username: "mhassan", email: "mhassan@lendsqr.com", phone_number: "+234 803 000 0003", date: "2022-01-07", status: "Pending" },
	{ id: "4", organization: "Lendsqr HQ", username: "obinna", email: "obinna@lendsqr.com", phone_number: "+234 803 000 0004", date: "2022-02-01", status: "Blacklisted" },
	{ id: "5", organization: "Lendsqr Finance", username: "tolani", email: "tolani@lendsqr.com", phone_number: "+234 803 000 0005", date: "2022-04-27", status: "Active" },
	{ id: "6", organization: "Lendsqr Labs", username: "nkiru", email: "nkiru@lendsqr.com", phone_number: "+234 803 000 0006", date: "2022-05-15", status: "Inactive" },
	{ id: "7", organization: "Lendsqr HQ", username: "bassey", email: "bassey@lendsqr.com", phone_number: "+234 803 000 0007", date: "2022-07-03", status: "Pending" },
	{ id: "8", organization: "Lendsqr Finance", username: "zion", email: "zion@lendsqr.com", phone_number: "+234 803 000 0008", date: "2022-08-10", status: "Active" },
	{ id: "9", organization: "Lendsqr Labs", username: "favour", email: "favour@lendsqr.com", phone_number: "+234 803 000 0009", date: "2022-09-30", status: "Active" },
	{ id: "10", organization: "Lendsqr HQ", username: "jerry", email: "jerry@lendsqr.com", phone_number: "+234 803 000 0010", date: "2022-11-11", status: "Inactive" },
	{ id: "11", organization: "Lendsqr Finance", username: "khadija", email: "khadija@lendsqr.com", phone_number: "+234 803 000 0011", date: "2023-01-19", status: "Pending" },
	{ id: "12", organization: "Lendsqr Labs", username: "davidx", email: "davidx@lendsqr.com", phone_number: "+234 803 000 0012", date: "2023-02-02", status: "Blacklisted" },
	{ id: "13", organization: "Lendsqr HQ", username: "gloria", email: "gloria@lendsqr.com", phone_number: "+234 803 000 0013", date: "2023-03-09", status: "Active" },
	{ id: "14", organization: "Lendsqr Finance", username: "chidi", email: "chidi@lendsqr.com", phone_number: "+234 803 000 0014", date: "2023-04-25", status: "Inactive" },
	{ id: "15", organization: "Lendsqr Labs", username: "maryj", email: "maryj@lendsqr.com", phone_number: "+234 803 000 0015", date: "2023-06-17", status: "Pending" },
	{ id: "16", organization: "Lendsqr HQ", username: "kingsley", email: "kingsley@lendsqr.com", phone_number: "+234 803 000 0016", date: "2023-07-01", status: "Active" },
	{ id: "17", organization: "Lendsqr Finance", username: "queen", email: "queen@lendsqr.com", phone_number: "+234 803 000 0017", date: "2023-08-14", status: "Blacklisted" },
	{ id: "18", organization: "Lendsqr Labs", username: "samuel", email: "samuel@lendsqr.com", phone_number: "+234 803 000 0018", date: "2023-09-09", status: "Active" },
	{ id: "19", organization: "Lendsqr HQ", username: "josephine", email: "josephine@lendsqr.com", phone_number: "+234 803 000 0019", date: "2023-10-27", status: "Inactive" },
	{ id: "20", organization: "Lendsqr Finance", username: "ibrahim", email: "ibrahim@lendsqr.com", phone_number: "+234 803 000 0020", date: "2023-12-04", status: "Pending" },
];

let usersDb: UserRecord[] = [...usersSeed];

const normalizePhone = (value: string) => value.replace(/[^\d+]/g, "").toLowerCase();

const listUsers = async ({ filters, page, pageSize }: ListUsersParams): Promise<ListUsersResponse> => {
	await delay(300);

	const filtered = usersDb.filter((user) => {
		const matchesOrganization = !filters.organization || user.organization === filters.organization;
		const matchesUsername =
			!filters.username || user.username.toLowerCase().includes(filters.username.toLowerCase());
		const matchesEmail = !filters.email || user.email.toLowerCase().includes(filters.email.toLowerCase());
		const matchesDate = !filters.date || user.date === filters.date;
		const matchesPhone =
			!filters.phone_number || normalizePhone(user.phone_number).includes(normalizePhone(filters.phone_number));
		const matchesStatus = !filters.status || user.status.toLowerCase() === filters.status.toLowerCase();

		return (
			matchesOrganization &&
			matchesUsername &&
			matchesEmail &&
			matchesDate &&
			matchesPhone &&
			matchesStatus
		);
	});

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const currentPage = Math.min(page, totalPages);
	const start = (currentPage - 1) * pageSize;
	const end = start + pageSize;

	return {
		rows: filtered.slice(start, end),
		totalPages,
		totalItems: filtered.length,
	};
};

const updateUserStatus = async (id: string, status: UserStatus): Promise<void> => {
	await delay(250);
	usersDb = usersDb.map((user) => (user.id === id ? { ...user, status } : user));
};

export default function UserTable() {
  const router = useRouter();
	const [rows, setRows] = useState<UserRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [filters, setFilters] = useState<FilterValues>({});

	const organizations = useMemo(
		() => Array.from(new Set(usersSeed.map((user) => user.organization))),
		[]
	);

	const runListUsers = useCallback(async () => {
		setLoading(true);
		try {
			const response = await listUsers({
				filters,
				page,
				pageSize: itemsPerPage,
			});
			setRows(response.rows);
			setTotalPages(response.totalPages);
			setTotalItems(response.totalItems);
		} finally {
			setLoading(false);
		}
	}, [filters, itemsPerPage, page]);

	useEffect(() => {
		runListUsers();
	}, [runListUsers]);

	const columns: Column<UserRecord>[] = useMemo(
		() => [
			{ key: "organization", title: "ORGANIZATION", sortable: true, filterable: true },
			{ key: "username", title: "USERNAME", sortable: true, filterable: true },
			{
				key: "email",
				title: "EMAIL",
				sortable: true,
				filterable: true,
				render: (value: string) => (
					<a
						href={`mailto:${value}`}
						className="inline-link"
						onClick={(event) => event.stopPropagation()}
					>
						{value}
					</a>
				),
			},
			{
				key: "phone_number",
				title: "PHONE NUMBER",
				sortable: true,
				filterable: true,
				render: (value: string) => (
					<a
						href={`tel:${value.replace(/\s+/g, "")}`}
						className="inline-link"
						onClick={(event) => event.stopPropagation()}
					>
						{value}
					</a>
				),
			},
			{
				key: "date",
				title: "DATE JOINED",
				sortable: true,
				filterable: true,
				render: (value: string) => {
					const parsed = new Date(value);
					return Number.isNaN(parsed.getTime())
						? value
						: parsed.toLocaleDateString("en-GB", {
								day: "2-digit",
								month: "short",
								year: "numeric",
							});
				},
			},
			{ key: "status", title: "STATUS", sortable: true, filterable: true },
		],
		[]
	);

	const filterConfig: FilterConfig[] = useMemo(
		() => [
			{
				key: "organization",
				label: "Organization",
				type: "select",
				options: organizations.map((organization) => ({ label: organization, value: organization })),
			},
			{ key: "username", label: "Username", type: "text", placeholder: "Enter username" },
			{ key: "email", label: "Email", type: "email", placeholder: "Enter email" },
			{ key: "date", label: "Date", type: "date" },
			{ key: "phone_number", label: "Phone Number", type: "phone", placeholder: "Enter phone number" },
			{
				key: "status",
				label: "Status",
				type: "select",
				options: [
					{ label: "Active", value: "Active" },
					{ label: "Inactive", value: "Inactive" },
					{ label: "Pending", value: "Pending" },
					{ label: "Blacklisted", value: "Blacklisted" },
				],
			},
		],
		[organizations]
	);

	const handleFilter = useCallback((nextFilters: FilterValues) => {
		setPage(1);
		setFilters(nextFilters);
	}, []);

	const handleReset = useCallback(() => {
		setPage(1);
		setFilters({});
	}, []);

	const handleItemsPerPageChange = useCallback((nextItemsPerPage: number) => {
		setItemsPerPage(nextItemsPerPage);
		setPage(1);
	}, []);

	const rowActions: RowAction[] = useMemo(
		() => [
			{
				id: "view-details",
				label: "View Details",
				icon: <img src="/media/icons/eye.svg" alt="" width={16} height={16} />,
				onClick: (row: UserRecord) => {
					router.push(`/dashboard/users/${row.id}`);
				},
			},
			{
				id: "blacklist-user",
				label: "Blacklist User",
				icon: <img src="/media/icons/userx.svg" alt="" width={16} height={16} />,
				onClick: async (row: UserRecord) => {
					setLoading(true);
					await updateUserStatus(row.id, "Blacklisted");
					await runListUsers();
				},
			},
			{
				id: "activate-user",
				label: "Activate User",
				icon: <img src="/media/icons/user-activate.svg" alt="" width={16} height={16} />,
				onClick: async (row: UserRecord) => {
					setLoading(true);
					await updateUserStatus(row.id, "Active");
					await runListUsers();
				},
			},
		],
		[router, runListUsers]
	);

	return (
		<GenericTable<UserRecord>
			columns={columns}
			data={rows}
			filters={filterConfig}
			rowActions={rowActions}
			showRowActions
			onFilter={handleFilter}
			onReset={handleReset}
			onRowClick={(row) => router.push(`/dashboard/users/${row.id}`)}
			loading={loading}
			emptyMessage="No users found"
			pagination={{
				currentPage: page,
				totalPages,
				totalItems,
				itemsPerPage,
				onPageChange: setPage,
				onItemsPerPageChange: handleItemsPerPageChange,
			}}
		/>
	);
}
