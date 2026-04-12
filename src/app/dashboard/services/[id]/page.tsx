import ServiceDetail from "@/components/layout/ServiceDetail/ServiceDetail";
type Props = { params: Promise<{ id: string }> };
export default async function ServiceDetailPage({ params }: Props) { const { id } = await params; return <ServiceDetail serviceId={id} className="p-32" />; }
