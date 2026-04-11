import UserDetails from '@/components/layout/UserDetail/UserDetails';

type UserDetailsPageProps = {
	params: Promise<{ id: string }>;
};

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
	const { id } = await params;

	return <UserDetails userId={id} className="p-32"/>;
}
