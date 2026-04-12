import TransactionDetail from "@/components/layout/TransactionDetail/TransactionDetail";
type Props = { params: Promise<{ id: string }> };
export default async function TransactionDetailPage({ params }: Props) { const { id } = await params; return <TransactionDetail txnId={id} className="p-32" />; }
