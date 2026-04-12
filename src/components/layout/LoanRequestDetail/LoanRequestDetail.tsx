"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import StatusPill from "@/components/ui/StatusPill";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import s from "@/components/layout/DetailView/DetailView.module.scss";

interface DecisionEvent { action: string; by: string; date: string; notes: string; }
interface LoanRequestData {
	id: string; user: string; email: string; product: string; requestedAmount: number; requestedTenure: string; purpose: string; status: string;
	decisionStatus: string; decisionAt: string; decisionBy: string; decisionReason: string; approvedAmount: number; approvedTenure: string;
	creditScore: number; riskLevel: string; decisionModel: string; factors: { label: string; value: string; impact: string }[];
	createdAt: string; timeline: DecisionEvent[];
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmt = (v: number) => v > 0 ? `₦${v.toLocaleString("en-US")}` : "—";
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

const fetchRequest = async (id: string): Promise<LoanRequestData> => {
	await delay(800);
	return {
		id, user: "Adeyemi Okafor", email: "adeyemi@lendsqr.com", product: "Micro Loan", requestedAmount: 250000, requestedTenure: "6 months", purpose: "Business expansion — purchase of additional inventory for retail shop in Ikeja market.", status: "Pending",
		decisionStatus: "Pending", decisionAt: "", decisionBy: "", decisionReason: "", approvedAmount: 0, approvedTenure: "",
		creditScore: 72, riskLevel: "Medium", decisionModel: "Standard Credit Scorecard v2.1",
		factors: [
			{ label: "Repayment History", value: "Good", impact: "+15" },
			{ label: "Income Level", value: "₦200k–₦400k", impact: "+10" },
			{ label: "Employment Duration", value: "2 years", impact: "+5" },
			{ label: "Existing Debt Ratio", value: "32%", impact: "-8" },
			{ label: "Account Age", value: "3 years", impact: "+12" },
		],
		createdAt: "2026-04-10T09:30:00",
		timeline: [
			{ action: "Application Submitted", by: "Adeyemi Okafor", date: "2026-04-10T09:30:00", notes: "Loan request submitted via mobile app" },
			{ action: "Credit Check Initiated", by: "System", date: "2026-04-10T09:31:00", notes: "Standard Credit Scorecard v2.1 applied — Score: 72 (Medium risk)" },
			{ action: "Documents Uploaded", by: "Adeyemi Okafor", date: "2026-04-10T10:00:00", notes: "Bank statement and employment letter uploaded" },
			{ action: "Under Review", by: "System", date: "2026-04-10T10:05:00", notes: "Assigned to review queue — medium risk applications require manual review" },
		],
	};
};

interface LoanRequestDetailProps { requestId?: string; className?: string; }

const LoanRequestDetail: React.FC<LoanRequestDetailProps> = ({ requestId = "1", className = "" }) => {
	const [data, setData] = useState<LoanRequestData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("application");
	const [modal, setModal] = useState<{ open: boolean; action: string; title: string; message: string; variant: "danger" | "primary" | "success" }>({ open: false, action: "", title: "", message: "", variant: "primary" });
	const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({ show: false, message: "", variant: "success" });

	const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchRequest(requestId)); } catch { setError("Failed to load"); } finally { setLoading(false); } }, [requestId]);
	useEffect(() => { load(); }, [load]);
	const showToast = (msg: string, v = "success") => { setToast({ show: true, message: msg, variant: v }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };
	const handleAction = async () => {
		if (!data) return; await delay(500);
		if (modal.action === "approve") { setData({ ...data, status: "Approved", decisionStatus: "Approved", approvedAmount: data.requestedAmount, approvedTenure: data.requestedTenure, decisionAt: new Date().toISOString(), decisionBy: "Admin User" }); showToast("Request approved"); }
		else if (modal.action === "reject") { setData({ ...data, status: "Rejected", decisionStatus: "Rejected", decisionAt: new Date().toISOString(), decisionBy: "Admin User", decisionReason: "Does not meet minimum criteria" }); showToast("Request rejected", "danger"); }
		else if (modal.action === "convert") { setData({ ...data, status: "Converted" }); showToast("Converted to active loan"); }
		setModal(m => ({ ...m, open: false }));
	};

	const tabs = [{ id: "application", label: "Application Info" }, { id: "credit", label: "Credit Assessment" }, { id: "timeline", label: "Decision History" }];

	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !data) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Not found"}</span><button onClick={load}>Retry</button></div></div>;

	const scoreColor = data.creditScore >= 70 ? "#39CD62" : data.creditScore >= 40 ? "#E9B200" : "#E4033B";

	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.loanRequests}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to Loan Requests</span></Link>
			<div className={s.headerRow}>
				<h1 className={s.pageTitle}>Loan Request</h1>
				<div className={s.actionButtons}>
					{data.status === "Pending" && (<>
						<button className={s.btnSuccess} onClick={() => setModal({ open: true, action: "approve", title: "Approve Request", message: `Approve ${fmt(data.requestedAmount)} loan request from ${data.user}?`, variant: "success" })}>APPROVE</button>
						<button className={s.btnDanger} onClick={() => setModal({ open: true, action: "reject", title: "Reject Request", message: `Reject loan request from ${data.user}? A rejection reason will be recorded.`, variant: "danger" })}>REJECT</button>
						<button className={s.btnSecondary} onClick={() => showToast("Request for more info sent to applicant")}>REQUEST INFO</button>
					</>)}
					{data.status === "Approved" && <button className={s.btnPrimary} onClick={() => setModal({ open: true, action: "convert", title: "Convert to Loan", message: `Create an active loan of ${fmt(data.approvedAmount)} for ${data.user}?`, variant: "primary" })}>CONVERT TO LOAN</button>}
				</div>
			</div>

			<div className={s.summaryCard}>
				<div className={s.summaryHeader}>
					<div className={s.avatarSmall}>{data.user.split(" ").map(n => n[0]).join("")}</div>
					<div className={s.nameSection}><h2 className={s.entityName}>{data.user}</h2><span className={s.entityId}>{data.product} • Applied {fmtDate(data.createdAt)}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Status</span><StatusPill status={data.status} /></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Requested</span><span className={s.metaValueLarge}>{fmt(data.requestedAmount)}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Credit Score</span><span className={s.metaValueLarge} style={{ color: scoreColor }}>{data.creditScore}</span></div>
				</div>
				<div className={s.tabs}>{tabs.map(t => (<button key={t.id} className={`${s.tab} ${activeTab === t.id ? s.tabActive : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}{activeTab === t.id && <div className={s.tabIndicator} />}</button>))}</div>
			</div>

			<div className={s.detailsCard}>
				{activeTab === "application" && (<>
					<section className={s.section}><h3 className={s.sectionTitle}>Request Details</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Applicant</span><span className={s.infoValue}>{data.user}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Email</span><span className={s.infoValue}>{data.email}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Product</span><span className={s.infoValue}>{data.product}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Requested Amount</span><span className={s.infoValue}>{fmt(data.requestedAmount)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Tenure</span><span className={s.infoValue}>{data.requestedTenure}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Date Applied</span><span className={s.infoValue}>{fmtDate(data.createdAt)}</span></div>
						</div>
					</section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Purpose</h3><div className={s.contentBlock}>{data.purpose}</div></section>
					{data.approvedAmount > 0 && (<><div className={s.sectionDivider} /><section className={s.section}><h3 className={s.sectionTitle}>Decision</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Decision</span><span className={s.infoValue}><StatusPill status={data.decisionStatus} /></span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Decision By</span><span className={s.infoValue}>{data.decisionBy}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Decision Date</span><span className={s.infoValue}>{fmtDate(data.decisionAt)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Approved Amount</span><span className={s.infoValue}>{fmt(data.approvedAmount)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Approved Tenure</span><span className={s.infoValue}>{data.approvedTenure}</span></div>
						</div>
					</section></>)}
				</>)}

				{activeTab === "credit" && (<>
					<div className={s.statRow}>
						<div className={s.statItem}><span className={s.statValue} style={{ color: scoreColor }}>{data.creditScore}</span><span className={s.statLabel}>Credit Score</span></div>
						<div className={s.statItem}><span className={s.statValue}><StatusPill status={data.riskLevel} /></span><span className={s.statLabel}>Risk Level</span></div>
						<div className={s.statItem}><span className={s.statValue} style={{ fontSize: 16 }}>{data.decisionModel}</span><span className={s.statLabel}>Model Used</span></div>
					</div>
					<section className={s.section}><h3 className={s.sectionTitle}>Score Factors</h3>
						<table className={s.miniTable}>
							<thead><tr><th>Factor</th><th>Value</th><th>Impact</th></tr></thead>
							<tbody>{data.factors.map((f, i) => (<tr key={i}><td>{f.label}</td><td>{f.value}</td><td style={{ color: f.impact.startsWith("+") ? "#39CD62" : "#E4033B", fontWeight: 600 }}>{f.impact}</td></tr>))}</tbody>
						</table>
					</section>
				</>)}

				{activeTab === "timeline" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Decision Timeline</h3>
						<ul className={s.timeline}>{data.timeline.map((ev, i) => (
							<li key={i} className={s.timelineItem}>
								<div className={`${s.timelineDot} ${ev.action.includes("Approved") ? s.success : ev.action.includes("Rejected") ? s.danger : ""}`} />
								<div className={s.timelineLine} />
								<div className={s.timelineContent}><p className={s.timelineTitle}>{ev.action}</p><p className={s.timelineDescription}>{ev.notes}</p><span className={s.timelineDate}>By {ev.by} • {fmtDate(ev.date)}</span></div>
							</li>
						))}</ul>
					</section>
				)}
			</div>

			<ConfirmModal open={modal.open} title={modal.title} message={modal.message} variant={modal.variant} confirmLabel={modal.action === "approve" ? "Approve" : modal.action === "reject" ? "Reject" : "Convert"} onConfirm={handleAction} onCancel={() => setModal(m => ({ ...m, open: false }))} />
			{toast.show && <div className={`${s.toast} ${s[toast.variant]}`}>{toast.message}</div>}
		</div>
	);
};
export default LoanRequestDetail;
