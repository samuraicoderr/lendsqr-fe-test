"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import StatusPill from "@/components/ui/StatusPill";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import s from "@/components/layout/DetailView/DetailView.module.scss";

interface GuaranteeItem { loanNumber: string; borrower: string; amount: number; status: string; dueDate: string; }
interface VerificationEvent { action: string; by: string; date: string; notes: string; }
interface GuarantorData {
	id: string; fullName: string; email: string; phone: string; relationship: string;
	address: string; occupation: string; employer: string; bvn: string;
	verificationStatus: string; verifiedAt: string;
	maxGuaranteeAmount: number; activeGuaranteesCount: number; totalGuaranteedAmount: number;
	createdAt: string;
	guarantees: GuaranteeItem[]; verificationHistory: VerificationEvent[];
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmt = (v: number) => `₦${v.toLocaleString("en-US")}`;
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

const fetchGuarantor = async (id: string): Promise<GuarantorData> => {
	await delay(800);
	return {
		id, fullName: "Debby Ogana", email: "debby@gmail.com", phone: "+234 803 100 0001", relationship: "Sister",
		address: "14 Admiralty Way, Lekki Phase 1, Lagos", occupation: "Senior Banker", employer: "Sterling Bank",
		bvn: "22345678901", verificationStatus: "Verified", verifiedAt: "2023-02-01T10:30:00",
		maxGuaranteeAmount: 1000000, activeGuaranteesCount: 2, totalGuaranteedAmount: 450000, createdAt: "2023-01-15T08:00:00",
		guarantees: [
			{ loanNumber: "LN-2023-001", borrower: "Adeyemi Okafor", amount: 125000, status: "Active", dueDate: "2023-12-15" },
			{ loanNumber: "LN-2024-008", borrower: "Gloria Osei", amount: 200000, status: "Active", dueDate: "2025-05-20" },
			{ loanNumber: "LN-2023-002", borrower: "Tolani Bakare", amount: 125000, status: "Released", dueDate: "2024-03-20" },
		],
		verificationHistory: [
			{ action: "Document Submitted", by: "System", date: "2023-01-20T09:00:00", notes: "BVN verification initiated" },
			{ action: "BVN Verified", by: "NIBSS API", date: "2023-01-20T09:02:00", notes: "BVN matches NIN records" },
			{ action: "Manual Review", by: "Jane Okafor", date: "2023-01-25T14:00:00", notes: "Employment letter verified with Sterling Bank HR" },
			{ action: "Approved", by: "Jane Okafor", date: "2023-02-01T10:30:00", notes: "Guarantor verified and approved" },
		],
	};
};

interface GuarantorDetailProps { guarantorId?: string; className?: string; }

const GuarantorDetail: React.FC<GuarantorDetailProps> = ({ guarantorId = "1", className = "" }) => {
	const [data, setData] = useState<GuarantorData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("personal");
	const [modal, setModal] = useState<{ open: boolean; action: string; title: string; message: string; variant: "danger" | "primary" | "success" }>({ open: false, action: "", title: "", message: "", variant: "primary" });
	const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({ show: false, message: "", variant: "success" });

	const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchGuarantor(guarantorId)); } catch { setError("Failed to load"); } finally { setLoading(false); } }, [guarantorId]);
	useEffect(() => { load(); }, [load]);
	const showToast = (message: string, variant = "success") => { setToast({ show: true, message, variant }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };
	const handleAction = async () => { if (!data) return; await delay(500); if (modal.action === "verify") { setData({ ...data, verificationStatus: "Verified", verifiedAt: new Date().toISOString() }); showToast("Guarantor verified"); } else if (modal.action === "deactivate") { setData({ ...data, verificationStatus: "Expired" }); showToast("Guarantor deactivated", "warning"); } setModal(m => ({ ...m, open: false })); };

	const tabs = [{ id: "personal", label: "Personal Information" }, { id: "guarantees", label: "Active Guarantees" }, { id: "verification", label: "Verification History" }];

	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !data) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Not found"}</span><button onClick={load}>Retry</button></div></div>;

	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.guarantors}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to Guarantors</span></Link>
			<div className={s.headerRow}>
				<h1 className={s.pageTitle}>Guarantor Details</h1>
				<div className={s.actionButtons}>
					{data.verificationStatus !== "Verified" && <button className={s.btnSuccess} onClick={() => setModal({ open: true, action: "verify", title: "Verify Guarantor", message: `Confirm verification of ${data.fullName}?`, variant: "success" })}>VERIFY</button>}
					{data.verificationStatus === "Verified" && <button className={s.btnDanger} onClick={() => setModal({ open: true, action: "deactivate", title: "Deactivate Guarantor", message: `Deactivate ${data.fullName}? Active guarantees will enter review.`, variant: "danger" })}>DEACTIVATE</button>}
					<button className={s.btnSecondary} onClick={() => { window.location.href = `mailto:${data.email}`; }}>CONTACT</button>
				</div>
			</div>

			<div className={s.summaryCard}>
				<div className={s.summaryHeader}>
					<div className={s.avatar}><div className={s.avatarPlaceholder}><img src="/media/icons/default-user.svg" alt="" className={s.avatarIcon} /></div></div>
					<div className={s.nameSection}><h2 className={s.entityName}>{data.fullName}</h2><span className={s.entityId}>{data.relationship} • {data.employer}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Status</span><StatusPill status={data.verificationStatus} /></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Active Guarantees</span><span className={s.metaValueLarge}>{data.activeGuaranteesCount}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Total Guaranteed</span><span className={s.metaValueLarge}>{fmt(data.totalGuaranteedAmount)}</span></div>
				</div>
				<div className={s.tabs}>{tabs.map(t => (<button key={t.id} className={`${s.tab} ${activeTab === t.id ? s.tabActive : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}{activeTab === t.id && <div className={s.tabIndicator} />}</button>))}</div>
			</div>

			<div className={s.detailsCard}>
				{activeTab === "personal" && (<>
					<section className={s.section}><h3 className={s.sectionTitle}>Contact Information</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Full Name</span><span className={s.infoValue}>{data.fullName}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Email</span><span className={s.infoValue}>{data.email}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Phone</span><span className={s.infoValue}>{data.phone}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Relationship</span><span className={s.infoValue}>{data.relationship}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Address</span><span className={s.infoValue}>{data.address}</span></div>
						</div>
					</section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Employment</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Occupation</span><span className={s.infoValue}>{data.occupation}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Employer</span><span className={s.infoValue}>{data.employer}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>BVN</span><span className={s.infoValue}>{data.bvn}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Max Guarantee</span><span className={s.infoValue}>{fmt(data.maxGuaranteeAmount)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Date Added</span><span className={s.infoValue}>{fmtDate(data.createdAt)}</span></div>
						</div>
					</section>
				</>)}

				{activeTab === "guarantees" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Loan Guarantees</h3>
						{data.guarantees.length === 0 ? <div className={s.emptyState}>No guarantees found.</div> : (
							<table className={s.miniTable}>
								<thead><tr><th>Loan #</th><th>Borrower</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
								<tbody>{data.guarantees.map((g, i) => (<tr key={i}><td>{g.loanNumber}</td><td>{g.borrower}</td><td>{fmt(g.amount)}</td><td>{fmtDate(g.dueDate)}</td><td><StatusPill status={g.status} /></td></tr>))}</tbody>
							</table>
						)}
					</section>
				)}

				{activeTab === "verification" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Verification Timeline</h3>
						<ul className={s.timeline}>{data.verificationHistory.map((ev, i) => (
							<li key={i} className={s.timelineItem}>
								<div className={`${s.timelineDot} ${ev.action === "Approved" ? s.success : ev.action.includes("Rejected") ? s.danger : ""}`} />
								<div className={s.timelineLine} />
								<div className={s.timelineContent}><p className={s.timelineTitle}>{ev.action}</p><p className={s.timelineDescription}>{ev.notes}</p><span className={s.timelineDate}>By {ev.by} • {fmtDate(ev.date)}</span></div>
							</li>
						))}</ul>
					</section>
				)}
			</div>

			<ConfirmModal open={modal.open} title={modal.title} message={modal.message} variant={modal.variant} confirmLabel={modal.action === "verify" ? "Verify" : "Deactivate"} onConfirm={handleAction} onCancel={() => setModal(m => ({ ...m, open: false }))} />
			{toast.show && <div className={`${s.toast} ${s[toast.variant]}`}>{toast.message}</div>}
		</div>
	);
};
export default GuarantorDetail;
