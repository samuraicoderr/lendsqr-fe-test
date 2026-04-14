import FrontendLinks from "@/lib/FrontendLinks";
import RecordDetail from "@/components/layout/RecordDetail/RecordDetail";

type Props = { params: Promise<{ id: string }> };

export default async function WhitelistDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <RecordDetail
      title="Whitelist Entry"
      subtitle="Entry details and metadata"
      backHref={FrontendLinks.whitelist}
      backLabel="Back to Whitelist"
      recordId={id}
      className="p-32"
      items={[
        { label: "Entry Type", value: "Email / BVN / Phone" },
        { label: "Organization", value: "Lendsqr HQ" },
        { label: "Added By", value: "Admin User" },
        { label: "Status", value: "Active" },
        { label: "Created On", value: "14 Apr 2026" },
        { label: "Notes", value: "Priority whitelist entry with enhanced routing enabled." },
      ]}
    />
  );
}
