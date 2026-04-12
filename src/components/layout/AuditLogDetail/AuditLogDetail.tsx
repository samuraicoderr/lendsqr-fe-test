"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import s from "@/components/layout/DetailView/DetailView.module.scss";

interface AuditLogData {
	id: string; actorType: string; actorEmail: string; action: string;
	entityType: string; entityId: string;
	oldValues: Record<string, string>; newValues: Record<string, string>;
	ipAddress: string; userAgent: string; requestId: string; createdAt: string;
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); };

const fetchLog = async (id: string): Promise<AuditLogData> => {
	await delay(800);
	return {
		id, actorType: "Staff", actorEmail: "admin@lendsqr.com", action: "USER_STATUS_CHANGED",
		entityType: "User", entityId: "USR-001",
		oldValues: { status: "Active", updated_at: "2026-04-11T22:00:00" },
		newValues: { status: "Blacklisted", updated_at: "2026-04-12T04:30:00" },
		ipAddress: "102.89.23.45", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
		requestId: "req_8f2a3b4c5d6e7f8a", createdAt: "2026-04-12T04:30:00",
	};
};

interface AuditLogDetailProps { logId?: string; className?: string; }

const AuditLogDetail: React.FC<AuditLogDetailProps> = ({ logId = "1", className = "" }) => {
	const [data, setData] = useState<AuditLogData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchLog(logId)); } catch { setError("Failed to load"); } finally { setLoading(false); } }, [logId]);
	useEffect(() => { load(); }, [load]);

	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !data) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Not found"}</span><button onClick={load}>Retry</button></div></div>;

	const changedKeys = Array.from(new Set([...Object.keys(data.oldValues), ...Object.keys(data.newValues)]));

	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.auditLogs}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to Audit Logs</span></Link>
			<div className={s.headerRow}><h1 className={s.pageTitle}>Audit Log Entry</h1></div>

			<div className={s.detailsCard}>
				<section className={s.section}><h3 className={s.sectionTitle}>Action Details</h3>
					<div className={s.infoGrid}>
						<div className={s.infoItem}><span className={s.infoLabel}>Action</span><span className={s.infoValue}>{data.action.replace(/_/g, " ")}</span></div>
						<div className={s.infoItem}><span className={s.infoLabel}>Actor</span><span className={s.infoValue}>{data.actorEmail}</span></div>
						<div className={s.infoItem}><span className={s.infoLabel}>Actor Type</span><span className={s.infoValue}>{data.actorType}</span></div>
						<div className={s.infoItem}><span className={s.infoLabel}>Entity Type</span><span className={s.infoValue}>{data.entityType}</span></div>
						<div className={s.infoItem}><span className={s.infoLabel}>Entity ID</span><span className={s.infoValue}>{data.entityId}</span></div>
						<div className={s.infoItem}><span className={s.infoLabel}>Timestamp</span><span className={s.infoValue}>{fmtDate(data.createdAt)}</span></div>
					</div>
				</section>
				<div className={s.sectionDivider} />

				<section className={s.section}><h3 className={s.sectionTitle}>Changes</h3>
					{changedKeys.length === 0 ? <div className={s.emptyState}>No field changes recorded.</div> : (
						<table className={s.miniTable}>
							<thead><tr><th>Field</th><th>Old Value</th><th>New Value</th></tr></thead>
							<tbody>{changedKeys.map((key) => {
								const old = data.oldValues[key] || "—";
								const nv = data.newValues[key] || "—";
								const changed = old !== nv;
								return (<tr key={key}><td>{key}</td><td style={{ color: changed ? "#E4033B" : undefined }}>{old}</td><td style={{ color: changed ? "#39CD62" : undefined, fontWeight: changed ? 600 : 400 }}>{nv}</td></tr>);
							})}</tbody>
						</table>
					)}
				</section>
				<div className={s.sectionDivider} />

				<section className={s.section}><h3 className={s.sectionTitle}>Context</h3>
					<div className={s.infoGrid}>
						<div className={s.infoItem}><span className={s.infoLabel}>IP Address</span><span className={s.infoValue}>{data.ipAddress}</span></div>
						<div className={s.infoItem}><span className={s.infoLabel}>User Agent</span><span className={s.infoValue}>{data.userAgent}</span></div>
						<div className={s.infoItem}><span className={s.infoLabel}>Request ID</span><span className={s.infoValue}>{data.requestId}</span></div>
					</div>
				</section>
			</div>
		</div>
	);
};
export default AuditLogDetail;
