import UserTable from "@/components/layout/UserTable/UserTable";
import UserStatistics from "@/components/layout/UserStatistics/UserStatistics";

export default function UsersPage() {
	return (
		<main style={{ padding: "32px" }}>
            <h1 className="main-title">Users</h1>
            <UserStatistics className="mb-40" />
			<UserTable />
		</main>
	);
}
