"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import StatusPill from "@/components/ui/StatusPill";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import s from "@/components/layout/DetailView/DetailView.module.scss";

interface ChargeItem { date: string; entity: string; baseAmount: number; feeAmount: number; waived: boolean; waivedBy: string; }
interface FeeData {
	id: string; name: string; feeType: string; scope: string; organization: string; status: string;
	calcMethod: string; flatAmount: number; percentageRate: string; minAmount: number; maxAmount: number;
	minTxnAmount: number; maxTxnAmount: number; applicableProducts: string[];
	effectiveFrom: string; effectiveTo: string; createdAt: string;
	totalCharged: number; timesApplied: number; timesWaived: number;
	recentCharges: ChargeItem[];
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmt = (v: number) => v > 0 ? `₦${v.toLocaleString("en-US")}` : "—";
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

const fetchFee = async (id: string): Promise<FeeData> => {
	await delay(800);
	return {
		id, name: "Loan Processing Fee", feeType: "Processing", scope: "Loan", organization: "Lendsqr HQ", status: "Active",
		calcMethod: "Percentage", flatAmount: 0, percentageRate: "1.5%", minAmount: 100, maxAmount: 10000,
		minTxnAmount: 10000, maxTxnAmount: 5000000, applicableProducts: ["Micro Loan", "Salary Advance", "SME Loan"],
		effectiveFrom: "2024-01-01", effectiveTo: "", createdAt: "2023-11-15T10:00:00",
		totalCharged: 4500000, timesApplied: 1287, timesWaived: 43,
		recentCharges: [
			{ date: "2026-04-12T04:00:00", entity: "LN-2026-089", baseAmount: 250000, feeAmount: 3750, waived: false, waivedBy: "" },
			{ date: "2026-04-11T16:00:00", entity: "LN-2026-088", baseAmount: 100000, feeAmount: 1500, waived: false, waivedBy: "" },
			{ date: "2026-04-11T10:00:00", entity: "LN-2026-087", baseAmount: 500000, feeAmount: 7500, waived: false, waivedBy: "" },
			{ date: "2026-04-10T14:00:00", entity: "LN-2026-086", baseAmount: 200000, feeAmount: 3000, waived: true, waivedBy: "Jane Okafor" },
			{ date: "2026-04-10T09:00:00", entity: "LN-2026-085", baseAmount: 150000, feeAmount: 2250, waived: false, waivedBy: "" },
		],
	};
};

interface FeeDetailProps { feeId?: string; className?: string; }

const FeeDetail: React.FC<FeeDetailProps> = ({ feeId = "1", className = "" }) => {
	const [data, setData] = useState<FeeData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("config");
	const [modal, setModal] = useState<{ open: boolean; action: string; title: string; message: string; variant: "danger" | "primary" | "success" }>({ open: false, action: "", title: "", message: "", variant: "primary" });
	const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({ show: false, message: "", variant: "success" });

	const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchFee(feeId)); } catch { setError("Failed to load"); } finally { setLoading(false); } }, [feeId]);
	useEffect(() => { load(); }, [load]);
	const showToast = (msg: string, v = "success") => { setToast({ show: true, message: msg, variant: v }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };
	const handleAction = async () => { if (!data) return; await delay(500); if (modal.action === "deactivate") { setData({ ...data, status: "Inactive" }); showToast("Fee deactivated", "warning"); } else if (modal.action === "activate") { setData({ ...data, status: "Active" }); showToast("Fee activated"); } setModal(m => ({ ...m, open: false })); };

	const tabs = [{ id: "config", label: "Configuration" }, { id: "charges", label: "Applied Charges" }, { id: "waivers", label: "Waivers" }];

	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !data) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Not found"}</span><button onClick={load}>Retry</button></div></div>;

	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.feesCharges}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to Fees & Charges</span></Link>
			<div className={s.headerRow}>
				<h1 className={s.pageTitle}>Fee Structure</h1>
				<div className={s.actionButtons}>
					<button className={s.btnSecondary} onClick={() => showToast("Edit fee form would open")}>EDIT FEE</button>
					{data.status === "Active" ? <button className={s.btnDanger} onClick={() => setModal({ open: true, action: "deactivate", title: "Deactivate Fee", message: `Deactivate "${data.name}"? This fee will no longer be applied.`, variant: "danger" })}>DEACTIVATE</button> : <button className={s.btnSuccess} onClick={() => setModal({ open: true, action: "activate", title: "Activate Fee", message: `Reactivate "${data.name}"?`, variant: "success" })}>ACTIVATE</button>}
					<button className={s.btnOutlinePrimary} onClick={() => showToast("Fee cloned successfully")}>CLONE</button>
				</div>
			</div>

			<div className={s.summaryCard}>
				<div className={s.summaryHeader}>
					<div className={s.avatarSmall}>₦</div>
					<div className={s.nameSection}><h2 className={s.entityName}>{data.name}</h2><span className={s.entityId}>{data.feeType} • {data.scope}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Status</span><StatusPill status={data.status} /></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Rate</span><span className={s.metaValueLarge}>{data.percentageRate || fmt(data.flatAmount)}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Total Charged</span><span className={s.metaValueLarge}>{fmt(data.totalCharged)}</span></div>
				</div>
				<div className={s.tabs}>{tabs.map(t => (<button key={t.id} className={`${s.tab} ${activeTab === t.id ? s.tabActive : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}{activeTab === t.id && <div className={s.tabIndicator} />}</button>))}</div>
			</div>

			<div className={s.detailsCard}>
				{activeTab === "config" && (<>
					<div className={s.statRow}>
						<div className={s.statItem}><span className={s.statValue}>{data.timesApplied.toLocaleString()}</span><span className={s.statLabel}>Times Applied</span></div>
						<div className={s.statItem}><span className={s.statValue}>{fmt(data.totalCharged)}</span><span className={s.statLabel}>Total Revenue</span></div>
						<div className={s.statItem}><span className={s.statValue}>{data.timesWaived}</span><span className={s.statLabel}>Times Waived</span></div>
					</div>
					<section className={s.section}><h3 className={s.sectionTitle}>Calculation</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Method</span><span className={s.infoValue}>{data.calcMethod}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Rate</span><span className={s.infoValue}>{data.percentageRate}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Min Fee</span><span className={s.infoValue}>{fmt(data.minAmount)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Max Fee</span><span className={s.infoValue}>{fmt(data.maxAmount)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Min Transaction</span><span className={s.infoValue}>{fmt(data.minTxnAmount)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Max Transaction</span><span className={s.infoValue}>{fmt(data.maxTxnAmount)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Effective From</span><span className={s.infoValue}>{fmtDate(data.effectiveFrom)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Effective To</span><span className={s.infoValue}>{fmtDate(data.effectiveTo)}</span></div>
						</div>
					</section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Applicable Products</h3>
						<div className={s.cardGrid}>{data.applicableProducts.map((p, i) => (<div key={i} className={s.infoCard}><h4 className={s.infoCardTitle}>{p}</h4></div>))}</div>
					</section>
				</>)}

				{activeTab === "charges" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Recent Charges</h3>
						<table className={s.miniTable}>
							<thead><tr><th>Date</th><th>Entity</th><th>Base Amount</th><th>Fee</th><th>Waived</th></tr></thead>
							<tbody>{data.recentCharges.map((c, i) => (<tr key={i}><td>{fmtDate(c.date)}</td><td>{c.entity}</td><td>{fmt(c.baseAmount)}</td><td>{fmt(c.feeAmount)}</td><td>{c.waived ? <StatusPill status="Waived" /> : <StatusPill status="Active" />}</td></tr>))}</tbody>
						</table>
					</section>
				)}

				{activeTab === "waivers" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Waiver History</h3>
						{data.recentCharges.filter(c => c.waived).length === 0 ? <div className={s.emptyState}>No waivers recorded.</div> : (
							<table className={s.miniTable}>
								<thead><tr><th>Date</th><th>Entity</th><th>Amount Waived</th><th>Waived By</th></tr></thead>
								<tbody>{data.recentCharges.filter(c => c.waived).map((c, i) => (<tr key={i}><td>{fmtDate(c.date)}</td><td>{c.entity}</td><td>{fmt(c.feeAmount)}</td><td>{c.waivedBy}</td></tr>))}</tbody>
							</table>
						)}
					</section>
				)}
			</div>

			<ConfirmModal open={modal.open} title={modal.title} message={modal.message} variant={modal.variant} confirmLabel={modal.action === "deactivate" ? "Deactivate" : "Activate"} onConfirm={handleAction} onCancel={() => setModal(m => ({ ...m, open: false }))} />
			{toast.show && <div className={`${s.toast} ${s[toast.variant]}`}>{toast.message}</div>}
		</div>
	);
};
export default FeeDetail;
