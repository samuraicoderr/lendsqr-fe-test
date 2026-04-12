"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import StatusPill from "@/components/ui/StatusPill";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import s from "@/components/layout/DetailView/DetailView.module.scss";

interface DecisionModelData {
	id: string; name: string; modelType: string; version: string; organization: string; status: string;
	description: string; minCreditScore: number; maxDebtRatio: number; minAccountAge: string;
	factors: { name: string; weight: string; description: string }[];
	linkedProducts: string[]; totalDecisions: number; approvalRate: string; avgProcessingTime: string;
	createdBy: string; createdAt: string; updatedAt: string;
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

const fetchModel = async (id: string): Promise<DecisionModelData> => {
	await delay(800);
	return {
		id, name: "Standard Credit Scorecard", modelType: "Scorecard", version: "v2.1", organization: "Lendsqr HQ", status: "Active",
		description: "A rule-based credit scoring model that evaluates borrower creditworthiness using weighted factors. This model is the primary decision engine for micro-loan products and is calibrated quarterly.",
		minCreditScore: 40, maxDebtRatio: 50, minAccountAge: "6 months",
		factors: [
			{ name: "Repayment History", weight: "30%", description: "Previous loan repayment behavior and timeliness" },
			{ name: "Income Level", weight: "20%", description: "Monthly income bracket and stability" },
			{ name: "Employment Duration", weight: "15%", description: "Length of current employment" },
			{ name: "Existing Debt Ratio", weight: "15%", description: "Current debt relative to income" },
			{ name: "Account Age", weight: "10%", description: "Duration since first account was opened" },
			{ name: "Transaction Volume", weight: "10%", description: "Average monthly transaction count" },
		],
		linkedProducts: ["Micro Loan", "Salary Advance"],
		totalDecisions: 4287, approvalRate: "68.5%", avgProcessingTime: "1.2s",
		createdBy: "Jane Okafor", createdAt: "2022-01-01T00:00:00", updatedAt: "2026-03-15T10:00:00",
	};
};

interface DecisionModelDetailProps { modelId?: string; className?: string; }

const DecisionModelDetail: React.FC<DecisionModelDetailProps> = ({ modelId = "1", className = "" }) => {
	const [data, setData] = useState<DecisionModelData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("config");
	const [modal, setModal] = useState<{ open: boolean; action: string; title: string; message: string; variant: "danger" | "primary" | "success" }>({ open: false, action: "", title: "", message: "", variant: "primary" });
	const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({ show: false, message: "", variant: "success" });

	const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchModel(modelId)); } catch { setError("Failed to load"); } finally { setLoading(false); } }, [modelId]);
	useEffect(() => { load(); }, [load]);
	const showToast = (msg: string, v = "success") => { setToast({ show: true, message: msg, variant: v }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };
	const handleAction = async () => { if (!data) return; await delay(500); if (modal.action === "deactivate") { setData({ ...data, status: "Inactive" }); showToast("Model deactivated", "warning"); } else if (modal.action === "activate") { setData({ ...data, status: "Active" }); showToast("Model activated"); } setModal(m => ({ ...m, open: false })); };

	const tabs = [{ id: "config", label: "Configuration" }, { id: "factors", label: "Score Factors" }, { id: "performance", label: "Performance" }];

	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !data) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Not found"}</span><button onClick={load}>Retry</button></div></div>;

	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.decisionModels}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to Decision Models</span></Link>
			<div className={s.headerRow}>
				<h1 className={s.pageTitle}>Decision Model</h1>
				<div className={s.actionButtons}>
					<button className={s.btnSecondary} onClick={() => showToast("Edit form would open")}>EDIT MODEL</button>
					{data.status === "Active" ? <button className={s.btnDanger} onClick={() => setModal({ open: true, action: "deactivate", title: "Deactivate Model", message: `Deactivate ${data.name}? Products using this model will need reassignment.`, variant: "danger" })}>DEACTIVATE</button> : <button className={s.btnSuccess} onClick={() => setModal({ open: true, action: "activate", title: "Activate Model", message: `Reactivate ${data.name}?`, variant: "success" })}>ACTIVATE</button>}
					<button className={s.btnOutlinePrimary} onClick={() => showToast("Model cloned")}>CLONE</button>
				</div>
			</div>

			<div className={s.summaryCard}>
				<div className={s.summaryHeader}>
					<div className={s.avatarSmall}>DM</div>
					<div className={s.nameSection}><h2 className={s.entityName}>{data.name}</h2><span className={s.entityId}>{data.modelType} • {data.version}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Status</span><StatusPill status={data.status} /></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Approval Rate</span><span className={s.metaValueLarge}>{data.approvalRate}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Total Decisions</span><span className={s.metaValueLarge}>{data.totalDecisions.toLocaleString()}</span></div>
				</div>
				<div className={s.tabs}>{tabs.map(t => (<button key={t.id} className={`${s.tab} ${activeTab === t.id ? s.tabActive : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}{activeTab === t.id && <div className={s.tabIndicator} />}</button>))}</div>
			</div>

			<div className={s.detailsCard}>
				{activeTab === "config" && (<>
					<section className={s.section}><h3 className={s.sectionTitle}>Description</h3><div className={s.contentBlock}>{data.description}</div></section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Thresholds</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Min Credit Score</span><span className={s.infoValue}>{data.minCreditScore}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Max Debt Ratio</span><span className={s.infoValue}>{data.maxDebtRatio}%</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Min Account Age</span><span className={s.infoValue}>{data.minAccountAge}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Version</span><span className={s.infoValue}>{data.version}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Created By</span><span className={s.infoValue}>{data.createdBy}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Last Updated</span><span className={s.infoValue}>{fmtDate(data.updatedAt)}</span></div>
						</div>
					</section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Linked Products</h3>
						<div className={s.cardGrid}>{data.linkedProducts.map((p, i) => (<div key={i} className={s.infoCard}><h4 className={s.infoCardTitle}>{p}</h4></div>))}</div>
					</section>
				</>)}

				{activeTab === "factors" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Score Factors ({data.factors.length})</h3>
						<table className={s.miniTable}>
							<thead><tr><th>Factor</th><th>Weight</th><th>Description</th></tr></thead>
							<tbody>{data.factors.map((f, i) => (<tr key={i}><td style={{ fontWeight: 600 }}>{f.name}</td><td>{f.weight}</td><td>{f.description}</td></tr>))}</tbody>
						</table>
					</section>
				)}

				{activeTab === "performance" && (
					<div className={s.statRow}>
						<div className={s.statItem}><span className={s.statValue}>{data.totalDecisions.toLocaleString()}</span><span className={s.statLabel}>Total Decisions</span></div>
						<div className={s.statItem}><span className={s.statValue}>{data.approvalRate}</span><span className={s.statLabel}>Approval Rate</span></div>
						<div className={s.statItem}><span className={s.statValue}>{data.avgProcessingTime}</span><span className={s.statLabel}>Avg. Processing</span></div>
					</div>
				)}
			</div>

			<ConfirmModal open={modal.open} title={modal.title} message={modal.message} variant={modal.variant} confirmLabel={modal.action === "deactivate" ? "Deactivate" : "Activate"} onConfirm={handleAction} onCancel={() => setModal(m => ({ ...m, open: false }))} />
			{toast.show && <div className={`${s.toast} ${s[toast.variant]}`}>{toast.message}</div>}
		</div>
	);
};
export default DecisionModelDetail;
