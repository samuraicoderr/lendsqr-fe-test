import GuarantorDetail from "@/components/layout/GuarantorDetail/GuarantorDetail";
type Props = { params: Promise<{ id: string }> };
export default async function GuarantorDetailPage({ params }: Props) { const { id } = await params; return <GuarantorDetail guarantorId={id} className="p-32" />; }
