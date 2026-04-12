"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import StatusPill from "@/components/ui/StatusPill";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import s from "@/components/layout/DetailView/DetailView.module.scss";

interface MsgData {
	id: string; title: string; messageType: string; priority: string;
	content: string; targetAudience: string; channels: string[];
	scheduledAt: string; expiresAt: string; sentAt: string; sentCount: number;
	status: string; createdBy: string; createdAt: string;
	deliveryStats: { channel: string; sent: number; delivered: number; read: number; failed: number }[];
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); };
const priorityColor: Record<string, string> = { Critical: "#E4033B", High: "#F55F44", Medium: "#E9B200", Low: "#39CD62" };

const fetchMsg = async (id: string): Promise<MsgData> => {
	await delay(800);
	return {
		id, title: "Scheduled Maintenance Notice", messageType: "Maintenance", priority: "High",
		content: "Dear valued users,\n\nWe will be performing scheduled system maintenance on Saturday, April 19th from 11:00 PM to 3:00 AM WAT.\n\nDuring this window, the following services will be temporarily unavailable:\n• Loan disbursements\n• Savings withdrawals\n• Card transactions\n\nAll other features including account viewing will remain accessible.\n\nWe apologize for any inconvenience and appreciate your patience.\n\n— The Lendsqr Team",
		targetAudience: "All Users", channels: ["Email", "Push", "SMS"],
		scheduledAt: "2026-04-19T22:00:00", expiresAt: "2026-04-20T04:00:00", sentAt: "", sentCount: 0,
		status: "Scheduled", createdBy: "Jane Okafor", createdAt: "2026-04-10T10:00:00",
		deliveryStats: [
			{ channel: "Email", sent: 0, delivered: 0, read: 0, failed: 0 },
			{ channel: "Push", sent: 0, delivered: 0, read: 0, failed: 0 },
			{ channel: "SMS", sent: 0, delivered: 0, read: 0, failed: 0 },
		],
	};
};

interface SystemMessageDetailProps { messageId?: string; className?: string; }

const SystemMessageDetail: React.FC<SystemMessageDetailProps> = ({ messageId = "1", className = "" }) => {
	const [data, setData] = useState<MsgData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("content");
	const [modal, setModal] = useState<{ open: boolean; action: string; title: string; message: string; variant: "danger" | "primary" | "success" }>({ open: false, action: "", title: "", message: "", variant: "primary" });
	const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({ show: false, message: "", variant: "success" });

	const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchMsg(messageId)); } catch { setError("Failed to load"); } finally { setLoading(false); } }, [messageId]);
	useEffect(() => { load(); }, [load]);
	const showToast = (msg: string, v = "success") => { setToast({ show: true, message: msg, variant: v }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };
	const handleAction = async () => {
		if (!data) return; await delay(500);
		if (modal.action === "send") { setData({ ...data, status: "Sent", sentAt: new Date().toISOString(), sentCount: 2453, deliveryStats: data.deliveryStats.map(d => ({ ...d, sent: 820, delivered: 810, read: 450, failed: 10 })) }); showToast("Message sent to all recipients"); }
		else if (modal.action === "cancel") { setData({ ...data, status: "Cancelled" }); showToast("Schedule cancelled", "warning"); }
		setModal(m => ({ ...m, open: false }));
	};

	const tabs = [{ id: "content", label: "Content" }, { id: "delivery", label: "Delivery Stats" }];

	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !data) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Not found"}</span><button onClick={load}>Retry</button></div></div>;

	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.systemsMessages}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to System Messages</span></Link>
			<div className={s.headerRow}>
				<h1 className={s.pageTitle}>System Message</h1>
				<div className={s.actionButtons}>
					{(data.status === "Draft" || data.status === "Scheduled") && <button className={s.btnPrimary} onClick={() => setModal({ open: true, action: "send", title: "Send Now", message: `Send "${data.title}" to ${data.targetAudience} now?`, variant: "primary" })}>SEND NOW</button>}
					{data.status === "Draft" && <button className={s.btnSecondary} onClick={() => showToast("Edit form would open")}>EDIT DRAFT</button>}
					{data.status === "Scheduled" && <button className={s.btnDanger} onClick={() => setModal({ open: true, action: "cancel", title: "Cancel Schedule", message: `Cancel the scheduled send for "${data.title}"?`, variant: "danger" })}>CANCEL</button>}
					<button className={s.btnOutlinePrimary} onClick={() => showToast("Message duplicated")}>DUPLICATE</button>
				</div>
			</div>

			<div className={s.summaryCard}>
				<div className={s.summaryHeader}>
					<div className={s.avatarSmall}>✉</div>
					<div className={s.nameSection}><h2 className={s.entityName}>{data.title}</h2><span className={s.entityId}>{data.messageType} • By {data.createdBy}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Priority</span><span className={s.metaValue} style={{ color: priorityColor[data.priority], fontWeight: 600 }}>{data.priority}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Status</span><StatusPill status={data.status} /></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Audience</span><span className={s.metaValue}>{data.targetAudience}</span></div>
				</div>
				<div className={s.tabs}>{tabs.map(t => (<button key={t.id} className={`${s.tab} ${activeTab === t.id ? s.tabActive : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}{activeTab === t.id && <div className={s.tabIndicator} />}</button>))}</div>
			</div>

			<div className={s.detailsCard}>
				{activeTab === "content" && (<>
					<section className={s.section}><h3 className={s.sectionTitle}>Message Content</h3><div className={s.contentBlock}>{data.content}</div></section>
					<div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Details</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Type</span><span className={s.infoValue}>{data.messageType}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Target Audience</span><span className={s.infoValue}>{data.targetAudience}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Channels</span><span className={s.infoValue}>{data.channels.join(", ")}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Scheduled At</span><span className={s.infoValue}>{fmtDate(data.scheduledAt)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Expires At</span><span className={s.infoValue}>{fmtDate(data.expiresAt)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Sent At</span><span className={s.infoValue}>{fmtDate(data.sentAt)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Recipients</span><span className={s.infoValue}>{data.sentCount.toLocaleString()}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Created</span><span className={s.infoValue}>{fmtDate(data.createdAt)}</span></div>
						</div>
					</section>
				</>)}

				{activeTab === "delivery" && (<>
					{data.sentCount === 0 ? <div className={s.emptyState}>No delivery data yet. Message has not been sent.</div> : (
						<section className={s.section}><h3 className={s.sectionTitle}>Delivery by Channel</h3>
							<table className={s.miniTable}>
								<thead><tr><th>Channel</th><th>Sent</th><th>Delivered</th><th>Read</th><th>Failed</th></tr></thead>
								<tbody>{data.deliveryStats.map((d, i) => (<tr key={i}><td>{d.channel}</td><td>{d.sent.toLocaleString()}</td><td>{d.delivered.toLocaleString()}</td><td>{d.read.toLocaleString()}</td><td style={{ color: d.failed > 0 ? "#E4033B" : undefined }}>{d.failed.toLocaleString()}</td></tr>))}</tbody>
							</table>
						</section>
					)}
				</>)}
			</div>

			<ConfirmModal open={modal.open} title={modal.title} message={modal.message} variant={modal.variant} confirmLabel={modal.action === "send" ? "Send Now" : "Cancel"} onConfirm={handleAction} onCancel={() => setModal(m => ({ ...m, open: false }))} />
			{toast.show && <div className={`${s.toast} ${s[toast.variant]}`}>{toast.message}</div>}
		</div>
	);
};
export default SystemMessageDetail;
