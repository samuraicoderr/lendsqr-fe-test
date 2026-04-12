import LoanProductDetail from "@/components/layout/LoanProductDetail/LoanProductDetail";
type Props = { params: Promise<{ id: string }> };
export default async function LoanProductDetailPage({ params }: Props) { const { id } = await params; return <LoanProductDetail productId={id} className="p-32" />; }
