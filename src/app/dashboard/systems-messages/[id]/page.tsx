import SystemMessageDetail from "@/components/layout/SystemMessageDetail/SystemMessageDetail";
type Props = { params: Promise<{ id: string }> };
export default async function SystemMessageDetailPage({ params }: Props) { const { id } = await params; return <SystemMessageDetail messageId={id} className="p-32" />; }
