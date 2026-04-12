import DecisionModelDetail from "@/components/layout/DecisionModelDetail/DecisionModelDetail";
type Props = { params: Promise<{ id: string }> };
export default async function DecisionModelDetailPage({ params }: Props) { const { id } = await params; return <DecisionModelDetail modelId={id} className="p-32" />; }
