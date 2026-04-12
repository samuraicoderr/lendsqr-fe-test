import ReportDetail from "@/components/layout/ReportDetail/ReportDetail";
type Props = { params: Promise<{ id: string }> };
export default async function ReportDetailPage({ params }: Props) { const { id } = await params; return <ReportDetail reportId={id} className="p-32" />; }
