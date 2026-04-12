import SettlementDetail from "@/components/layout/SettlementDetail/SettlementDetail";
type Props = { params: Promise<{ id: string }> };
export default async function SettlementDetailPage({ params }: Props) { const { id } = await params; return <SettlementDetail settlementId={id} className="p-32" />; }
