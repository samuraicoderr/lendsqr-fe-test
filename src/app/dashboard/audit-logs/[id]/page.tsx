import AuditLogDetail from "@/components/layout/AuditLogDetail/AuditLogDetail";
type Props = { params: Promise<{ id: string }> };
export default async function AuditLogDetailPage({ params }: Props) { const { id } = await params; return <AuditLogDetail logId={id} className="p-32" />; }
