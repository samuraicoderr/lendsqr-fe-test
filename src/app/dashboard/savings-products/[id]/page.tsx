import SavingsProductDetail from "@/components/layout/SavingsProductDetail/SavingsProductDetail";
type Props = { params: Promise<{ id: string }> };
export default async function SavingsProductDetailPage({ params }: Props) { const { id } = await params; return <SavingsProductDetail productId={id} className="p-32" />; }
