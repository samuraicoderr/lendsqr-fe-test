"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import StatusPill from "@/components/ui/StatusPill";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import s from "@/components/layout/DetailView/DetailView.module.scss";

interface HealthCheck { date: string; status: string; latency: string; }
interface ServiceData {
	id: string; name: string; serviceType: string; provider: string; organization: string; status: string;
	baseUrl: string; apiVersion: string; credentialsStatus: string;
	lastHealthCheckAt: string; lastHealthCheckStatus: string; uptimePercent: string;
	linkedAccounts: number; createdAt: string;
	healthHistory: HealthCheck[];
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); };

const fetchService = async (id: string): Promise<ServiceData> => {
	await delay(800);
	return {
		id, name: "Paystack Payment Gateway", serviceType: "Payment Gateway", provider: "Paystack", organization: "Lendsqr HQ", status: "Active",
		baseUrl: "https://api.paystack.co", apiVersion: "v2", credentialsStatus: "Valid",
		lastHealthCheckAt: "2026-04-12T06:00:00", lastHealthCheckStatus: "Healthy", uptimePercent: "99.97%",
		linkedAccounts: 2453, createdAt: "2022-03-01T00:00:00",
		healthHistory: [
			{ date: "2026-04-12T06:00:00", status: "Healthy", latency: "45ms" },
			{ date: "2026-04-12T05:00:00", status: "Healthy", latency: "52ms" },
			{ date: "2026-04-12T04:00:00", status: "Healthy", latency: "38ms" },
			{ date: "2026-04-12T03:00:00", status: "Healthy", latency: "41ms" },
			{ date: "2026-04-11T22:00:00", status: "Degraded", latency: "320ms" },
			{ date: "2026-04-11T21:00:00", status: "Healthy", latency: "48ms" },
		],
	};
};

interface ServiceDetailProps { serviceId?: string; className?: string; }

const ServiceDetail: React.FC<ServiceDetailProps> = ({ serviceId = "1", className = "" }) => {
	const [data, setData] = useState<ServiceData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("config");
	const [modal, setModal] = useState<{ open: boolean; action: string; title: string; message: string; variant: "danger" | "primary" | "success" }>({ open: false, action: "", title: "", message: "", variant: "primary" });
	const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({ show: false, message: "", variant: "success" });

	const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchService(serviceId)); } catch { setError("Failed to load"); } finally { setLoading(false); } }, [serviceId]);
	useEffect(() => { load(); }, [load]);
	const showToast = (msg: string, v = "success") => { setToast({ show: true, message: msg, variant: v }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };
	const handleAction = async () => { if (!data) return; await delay(500); if (modal.action === "disable") { setData({ ...data, status: "Inactive" }); showToast("Service disabled", "warning"); } else if (modal.action === "enable") { setData({ ...data, status: "Active" }); showToast("Service enabled"); } else if (modal.action === "test") { showToast("Connection test passed — 42ms"); } setModal(m => ({ ...m, open: false })); };

	const tabs = [{ id: "config", label: "Configuration" }, { id: "health", label: "Health History" }];

	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !data) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Not found"}</span><button onClick={load}>Retry</button></div></div>;

	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.services}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to Services</span></Link>
			<div className={s.headerRow}>
				<h1 className={s.pageTitle}>Service Details</h1>
				<div className={s.actionButtons}>
					<button className={s.btnPrimary} onClick={() => setModal({ open: true, action: "test", title: "Test Connection", message: `Test connection to ${data.provider}?`, variant: "primary" })}>TEST CONNECTION</button>
					{data.status === "Active" ? <button className={s.btnDanger} onClick={() => setModal({ open: true, action: "disable", title: "Disable Service", message: `Disable ${data.name}? Features depending on this service will stop working.`, variant: "danger" })}>DISABLE</button> : <button className={s.btnSuccess} onClick={() => setModal({ open: true, action: "enable", title: "Enable Service", message: `Re-enable ${data.name}?`, variant: "success" })}>ENABLE</button>}
					<button className={s.btnSecondary} onClick={() => showToast("Config update form would open")}>UPDATE CONFIG</button>
				</div>
			</div>

			<div className={s.summaryCard}>
				<div className={s.summaryHeader}>
					<div className={s.avatarSmall}>{data.provider.slice(0, 2).toUpperCase()}</div>
					<div className={s.nameSection}><h2 className={s.entityName}>{data.name}</h2><span className={s.entityId}>{data.serviceType} • {data.provider}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Status</span><StatusPill status={data.status} /></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Uptime</span><span className={s.metaValueLarge}>{data.uptimePercent}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Linked Accounts</span><span className={s.metaValueLarge}>{data.linkedAccounts.toLocaleString()}</span></div>
				</div>
				<div className={s.tabs}>{tabs.map(t => (<button key={t.id} className={`${s.tab} ${activeTab === t.id ? s.tabActive : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}{activeTab === t.id && <div className={s.tabIndicator} />}</button>))}</div>
			</div>

			<div className={s.detailsCard}>
				{activeTab === "config" && (<>
					<section className={s.section}><h3 className={s.sectionTitle}>Service Configuration</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Provider</span><span className={s.infoValue}>{data.provider}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Service Type</span><span className={s.infoValue}>{data.serviceType}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Base URL</span><span className={s.infoValue}>{data.baseUrl}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>API Version</span><span className={s.infoValue}>{data.apiVersion}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Credentials</span><span className={s.infoValue}><StatusPill status={data.credentialsStatus === "Valid" ? "Active" : "Expired"} /></span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Last Health Check</span><span className={s.infoValue}>{fmtDate(data.lastHealthCheckAt)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Health Status</span><span className={s.infoValue}><StatusPill status={data.lastHealthCheckStatus === "Healthy" ? "Active" : "Error"} /></span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Created</span><span className={s.infoValue}>{fmtDate(data.createdAt)}</span></div>
						</div>
					</section>
				</>)}

				{activeTab === "health" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Health Check History</h3>
						<table className={s.miniTable}>
							<thead><tr><th>Date</th><th>Status</th><th>Latency</th></tr></thead>
							<tbody>{data.healthHistory.map((h, i) => (<tr key={i}><td>{fmtDate(h.date)}</td><td><StatusPill status={h.status === "Healthy" ? "Active" : h.status === "Degraded" ? "Pending" : "Error"} /></td><td>{h.latency}</td></tr>))}</tbody>
						</table>
					</section>
				)}
			</div>

			<ConfirmModal open={modal.open} title={modal.title} message={modal.message} variant={modal.variant} confirmLabel={modal.action === "test" ? "Test" : modal.action === "disable" ? "Disable" : "Enable"} onConfirm={handleAction} onCancel={() => setModal(m => ({ ...m, open: false }))} />
			{toast.show && <div className={`${s.toast} ${s[toast.variant]}`}>{toast.message}</div>}
		</div>
	);
};
export default ServiceDetail;
