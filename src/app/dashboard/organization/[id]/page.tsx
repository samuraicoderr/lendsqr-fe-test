import OrganizationDetail from "@/components/layout/OrganizationDetail/OrganizationDetail";
type Props = { params: Promise<{ id: string }> };
export default async function OrganizationDetailPage({ params }: Props) { const { id } = await params; return <OrganizationDetail orgId={id} className="p-32" />; }
