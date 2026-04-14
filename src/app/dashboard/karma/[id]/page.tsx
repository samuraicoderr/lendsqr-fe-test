import FrontendLinks from "@/lib/FrontendLinks";
import RecordDetail from "@/components/layout/RecordDetail/RecordDetail";

type Props = { params: Promise<{ id: string }> };

export default async function KarmaDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <RecordDetail
      title="Karma Record"
      subtitle="Risk signals and score movement"
      backHref={FrontendLinks.karma}
      backLabel="Back to Karma"
      recordId={id}
      className="p-32"
      items={[
        { label: "Score Band", value: "Medium Risk" },
        { label: "Last Event", value: "Loan Repaid On Time" },
        { label: "Points Delta", value: "+10" },
        { label: "Blacklist Status", value: "Clean" },
        { label: "Reviewed By", value: "Risk Ops" },
        { label: "Updated On", value: "14 Apr 2026" },
      ]}
    />
  );
}
