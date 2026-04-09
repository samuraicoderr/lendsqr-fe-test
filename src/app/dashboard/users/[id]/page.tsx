type UserDetailsPageProps = {
	params: Promise<{ id: string }>;
};

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
	const { id } = await params;

	return <main>User Details: {id}</main>;
}
