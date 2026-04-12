"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import StatusPill from "@/components/ui/StatusPill";
import s from "@/components/layout/DetailView/DetailView.module.scss";

interface ExecutionItem { id: string; status: string; startedAt: string; completedAt: string; triggeredBy: string; resultUrl: string; }
interface ReportData {
	id: string; name: string; reportType: string; description: string; organization: string; status: string;
	parameters: string; schedule: string; nextRunAt: string; format: string;
	lastGeneratedAt: string; lastGeneratedUrl: string;
	createdBy: string; createdAt: string;
	executions: ExecutionItem[];
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); };

const fetchReport = async (id: string): Promise<ReportData> => {
	await delay(800);
	return {
		id, name: "Monthly Loan Portfolio", reportType: "Loan Portfolio", description: "Comprehensive monthly report of all active loans, repayment status, delinquency rates, and portfolio performance metrics.", organization: "Lendsqr HQ", status: "Active",
		parameters: "{ period: 'monthly', include_closed: false, group_by: 'product' }", schedule: "Monthly", nextRunAt: "2026-05-01T00:01:00", format: "PDF",
		lastGeneratedAt: "2026-04-01T00:01:00", lastGeneratedUrl: "/reports/loan-portfolio-apr-2026.pdf",
		createdBy: "Jane Okafor", createdAt: "2022-01-01T00:00:00",
		executions: [
			{ id: "e1", status: "Completed", startedAt: "2026-04-01T00:01:00", completedAt: "2026-04-01T00:03:22", triggeredBy: "Scheduler", resultUrl: "/reports/loan-portfolio-apr-2026.pdf" },
			{ id: "e2", status: "Completed", startedAt: "2026-03-01T00:01:00", completedAt: "2026-03-01T00:02:58", triggeredBy: "Scheduler", resultUrl: "/reports/loan-portfolio-mar-2026.pdf" },
			{ id: "e3", status: "Completed", startedAt: "2026-02-01T00:01:00", completedAt: "2026-02-01T00:03:15", triggeredBy: "Scheduler", resultUrl: "/reports/loan-portfolio-feb-2026.pdf" },
			{ id: "e4", status: "Failed", startedAt: "2026-01-01T00:01:00", completedAt: "2026-01-01T00:01:45", triggeredBy: "Scheduler", resultUrl: "" },
			{ id: "e5", status: "Completed", startedAt: "2025-12-15T14:00:00", completedAt: "2025-12-15T14:02:30", triggeredBy: "Jane Okafor", resultUrl: "/reports/loan-portfolio-dec-2025-adhoc.pdf" },
		],
	};
};

interface ReportDetailProps { reportId?: string; className?: string; }

const ReportDetail: React.FC<ReportDetailProps> = ({ reportId = "1", className = "" }) => {
	const [data, setData] = useState<ReportData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("config");
	const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({ show: false, message: "", variant: "success" });

	const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchReport(reportId)); } catch { setError("Failed to load"); } finally { setLoading(false); } }, [reportId]);
	useEffect(() => { load(); }, [load]);
	const showToast = (msg: string, v = "success") => { setToast({ show: true, message: msg, variant: v }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };

	const tabs = [{ id: "config", label: "Configuration" }, { id: "history", label: "Execution History" }];

	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !data) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Not found"}</span><button onClick={load}>Retry</button></div></div>;

	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.reports}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to Reports</span></Link>
			<div className={s.headerRow}>
				<h1 className={s.pageTitle}>Report Details</h1>
				<div className={s.actionButtons}>
					<button className={s.btnPrimary} onClick={async () => { setLoading(true); await delay(500); setLoading(false); showToast("Report generation started"); }}>RUN NOW</button>
					<button className={s.btnSecondary} onClick={() => showToast("Schedule editor would open")}>EDIT SCHEDULE</button>
					{data.lastGeneratedUrl && <button className={s.btnOutlinePrimary} onClick={() => showToast("Downloading last report...")}>DOWNLOAD LAST</button>}
				</div>
			</div>

			<div className={s.summaryCard}>
				<div className={s.summaryHeader}>
					<div className={s.avatarSmall}>📊</div>
					<div className={s.nameSection}><h2 className={s.entityName}>{data.name}</h2><span className={s.entityId}>{data.reportType} • {data.format}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Schedule</span><span className={s.metaValue}>{data.schedule}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Last Run</span><span className={s.metaValue}>{fmtDate(data.lastGeneratedAt)}</span></div>
				</div>
				<div className={s.tabs}>{tabs.map(t => (<button key={t.id} className={`${s.tab} ${activeTab === t.id ? s.tabActive : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}{activeTab === t.id && <div className={s.tabIndicator} />}</button>))}</div>
			</div>

			<div className={s.detailsCard}>
				{activeTab === "config" && (<>
					<section className={s.section}><h3 className={s.sectionTitle}>Description</h3><div className={s.contentBlock}>{data.description}</div></section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Configuration</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Report Type</span><span className={s.infoValue}>{data.reportType}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Schedule</span><span className={s.infoValue}>{data.schedule}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Next Run</span><span className={s.infoValue}>{fmtDate(data.nextRunAt)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Format</span><span className={s.infoValue}>{data.format}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Created By</span><span className={s.infoValue}>{data.createdBy}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Created</span><span className={s.infoValue}>{fmtDate(data.createdAt)}</span></div>
						</div>
					</section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Parameters</h3><div className={s.contentBlock}>{data.parameters}</div></section>
				</>)}

				{activeTab === "history" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Execution History</h3>
						<table className={s.miniTable}>
							<thead><tr><th>Started</th><th>Completed</th><th>Triggered By</th><th>Status</th><th>Download</th></tr></thead>
							<tbody>{data.executions.map((e) => (<tr key={e.id}><td>{fmtDate(e.startedAt)}</td><td>{fmtDate(e.completedAt)}</td><td>{e.triggeredBy}</td><td><StatusPill status={e.status} /></td><td>{e.resultUrl ? <button className={s.btnSecondary} style={{ height: 28, fontSize: 12, padding: "0 12px" }} onClick={() => showToast("Downloading...")}>Download</button> : "—"}</td></tr>))}</tbody>
						</table>
					</section>
				)}
			</div>

			{toast.show && <div className={`${s.toast} ${s[toast.variant]}`}>{toast.message}</div>}
		</div>
	);
};
export default ReportDetail;
