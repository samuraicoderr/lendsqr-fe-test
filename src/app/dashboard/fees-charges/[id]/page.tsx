import FeeDetail from "@/components/layout/FeeDetail/FeeDetail";
type Props = { params: Promise<{ id: string }> };
export default async function FeeDetailPage({ params }: Props) { const { id } = await params; return <FeeDetail feeId={id} className="p-32" />; }
