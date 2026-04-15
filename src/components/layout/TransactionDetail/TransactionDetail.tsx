"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import StatusPill from "@/components/ui/StatusPill";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import s from "@/components/layout/DetailView/DetailView.module.scss";
import TransactionService from "@/lib/api/services/Transaction.Service";

interface TimelineEvent { action: string; date: string; details: string; }
interface TransactionData {
	id: string; reference: string; type: string; user: string; userEmail: string; organization: string;
	amount: number; currency: string; status: string;
	sourceType: string; sourceAccount: string; destType: string; destAccount: string;
	processedAt: string; completedAt: string; failedAt: string; failureReason: string;
	ipAddress: string; userAgent: string; createdAt: string;
	timeline: TimelineEvent[];
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmt = (v: number) => `₦${v.toLocaleString("en-US")}`;
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); };

const fetchTxn = async (id: string): Promise<TransactionData> => {
	return TransactionService.getTransactionById(id);
};

interface TransactionDetailProps { txnId?: string; className?: string; }

const TransactionDetail: React.FC<TransactionDetailProps> = ({ txnId = "1", className = "" }) => {
	const [data, setData] = useState<TransactionData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("info");
	const [modal, setModal] = useState<{ open: boolean; action: string; title: string; message: string; variant: "danger" | "primary" | "success" }>({ open: false, action: "", title: "", message: "", variant: "primary" });
	const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({ show: false, message: "", variant: "success" });

	const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchTxn(txnId)); } catch { setError("Failed to load"); } finally { setLoading(false); } }, [txnId]);
	useEffect(() => { load(); }, [load]);
	const showToast = (msg: string, v = "success") => { setToast({ show: true, message: msg, variant: v }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };
	const handleAction = async () => { if (!data) return; if (modal.action === "refund") { const updated = await TransactionService.patchTransaction(data.id, { status: "Completed" as any }); setData(updated as any); showToast("Transaction refunded"); } else if (modal.action === "retry") { const updated = await TransactionService.patchTransaction(data.id, { status: "Processing" }); setData(updated as any); showToast("Transaction retried"); } setModal(m => ({ ...m, open: false })); };

	const tabs = [{ id: "info", label: "Transaction Info" }, { id: "timeline", label: "Timeline" }];

	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !data) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Not found"}</span><button onClick={load}>Retry</button></div></div>;

	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.transactions}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to Transactions</span></Link>
			<div className={s.headerRow}>
				<h1 className={s.pageTitle}>Transaction Details</h1>
				<div className={s.actionButtons}>
					{data.status === "Failed" && <button className={s.btnPrimary} onClick={() => setModal({ open: true, action: "retry", title: "Retry Transaction", message: `Retry ${data.reference}?`, variant: "primary" })}>RETRY</button>}
					{data.status === "Completed" && <button className={s.btnDanger} onClick={() => setModal({ open: true, action: "refund", title: "Refund Transaction", message: `Refund ${fmt(data.amount)} to ${data.user}?`, variant: "danger" })}>REFUND</button>}
					<button className={s.btnSecondary} onClick={() => showToast("Receipt exported")}>EXPORT RECEIPT</button>
				</div>
			</div>

			<div className={s.summaryCard}>
				<div className={s.summaryHeader}>
					<div className={s.avatarSmall}>₦</div>
					<div className={s.nameSection}><h2 className={s.entityName}>{data.reference}</h2><span className={s.entityId}>{data.type} • {data.user}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Status</span><StatusPill status={data.status} /></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Amount</span><span className={s.metaValueLarge}>{fmt(data.amount)}</span></div>
				</div>
				<div className={s.tabs}>{tabs.map(t => (<button key={t.id} className={`${s.tab} ${activeTab === t.id ? s.tabActive : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}{activeTab === t.id && <div className={s.tabIndicator} />}</button>))}</div>
			</div>

			<div className={s.detailsCard}>
				{activeTab === "info" && (<>
					<section className={s.section}><h3 className={s.sectionTitle}>Source & Destination</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Source Type</span><span className={s.infoValue}>{data.sourceType}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Source Account</span><span className={s.infoValue}>{data.sourceAccount}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Destination Type</span><span className={s.infoValue}>{data.destType}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Destination</span><span className={s.infoValue}>{data.destAccount}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Currency</span><span className={s.infoValue}>{data.currency}</span></div>
						</div>
					</section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Timestamps</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Created</span><span className={s.infoValue}>{fmtDate(data.createdAt)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Processed</span><span className={s.infoValue}>{fmtDate(data.processedAt)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Completed</span><span className={s.infoValue}>{fmtDate(data.completedAt)}</span></div>
							{data.failedAt && <div className={s.infoItem}><span className={s.infoLabel}>Failed At</span><span className={s.infoValue}>{fmtDate(data.failedAt)}</span></div>}
							{data.failureReason && <div className={s.infoItem}><span className={s.infoLabel}>Failure Reason</span><span className={s.infoValue}>{data.failureReason}</span></div>}
						</div>
					</section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Metadata</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>IP Address</span><span className={s.infoValue}>{data.ipAddress}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>User Agent</span><span className={s.infoValue}>{data.userAgent}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Organization</span><span className={s.infoValue}>{data.organization}</span></div>
						</div>
					</section>
				</>)}

				{activeTab === "timeline" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Processing Timeline</h3>
						<ul className={s.timeline}>{data.timeline.map((ev, i) => (
							<li key={i} className={s.timelineItem}>
								<div className={`${s.timelineDot} ${ev.action === "Completed" ? s.success : ev.action.includes("Failed") ? s.danger : ""}`} />
								<div className={s.timelineLine} />
								<div className={s.timelineContent}><p className={s.timelineTitle}>{ev.action}</p><p className={s.timelineDescription}>{ev.details}</p><span className={s.timelineDate}>{fmtDate(ev.date)}</span></div>
							</li>
						))}</ul>
					</section>
				)}
			</div>

			<ConfirmModal open={modal.open} title={modal.title} message={modal.message} variant={modal.variant} confirmLabel={modal.action === "refund" ? "Refund" : "Retry"} onConfirm={handleAction} onCancel={() => setModal(m => ({ ...m, open: false }))} />
			{toast.show && <div className={`${s.toast} ${s[toast.variant]}`}>{toast.message}</div>}
		</div>
	);
};
export default TransactionDetail;
