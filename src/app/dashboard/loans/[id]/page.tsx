import LoanDetail from "@/components/layout/LoanDetail/LoanDetail";
type Props = { params: Promise<{ id: string }> };
export default async function LoanDetailPage({ params }: Props) { const { id } = await params; return <LoanDetail loanId={id} className="p-32" />; }
