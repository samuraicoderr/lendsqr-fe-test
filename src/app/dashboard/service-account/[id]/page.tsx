import FrontendLinks from "@/lib/FrontendLinks";
import RecordDetail from "@/components/layout/RecordDetail/RecordDetail";

type Props = { params: Promise<{ id: string }> };

export default async function ServiceAccountDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <RecordDetail
      title="Service Account"
      subtitle="Integration account details"
      backHref={FrontendLinks.serviceAccount}
      backLabel="Back to Service Accounts"
      recordId={id}
      className="p-32"
      items={[
        { label: "Provider", value: "Paystack" },
        { label: "Account Type", value: "Payment" },
        { label: "Owner", value: "Operations Team" },
        { label: "Status", value: "Active" },
        { label: "Last Synced", value: "14 Apr 2026, 10:45" },
        { label: "Sync Health", value: "Healthy" },
      ]}
    />
  );
}
