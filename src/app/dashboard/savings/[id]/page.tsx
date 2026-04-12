import SavingsDetail from "@/components/layout/SavingsDetail/SavingsDetail";
type Props = { params: Promise<{ id: string }> };
export default async function SavingsDetailPage({ params }: Props) { const { id } = await params; return <SavingsDetail savingsId={id} className="p-32" />; }
