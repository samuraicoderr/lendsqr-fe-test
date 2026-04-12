import LoanRequestDetail from "@/components/layout/LoanRequestDetail/LoanRequestDetail";
type Props = { params: Promise<{ id: string }> };
export default async function LoanRequestDetailPage({ params }: Props) { const { id } = await params; return <LoanRequestDetail requestId={id} className="p-32" />; }
