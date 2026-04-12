"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import StatusPill from "@/components/ui/StatusPill";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import s from "@/components/layout/DetailView/DetailView.module.scss";

interface TxnItem { reference: string; type: string; amount: number; date: string; }
interface SettlementData {
	id: string; organization: string; periodStart: string; periodEnd: string;
	totalTransactions: number; totalAmount: number; totalFees: number; netAmount: number;
	status: string; settledAt: string; settlementReference: string;
	bankAccount: string; bankName: string; bankCode: string; createdAt: string;
	transactions: TxnItem[];
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmt = (v: number) => `₦${v.toLocaleString("en-US")}`;
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

const fetchSettlement = async (id: string): Promise<SettlementData> => {
	await delay(800);
	return {
		id, organization: "Lendsqr HQ", periodStart: "2026-04-01", periodEnd: "2026-04-07",
		totalTransactions: 342, totalAmount: 45000000, totalFees: 675000, netAmount: 44325000,
		status: "Completed", settledAt: "2026-04-08T06:00:00", settlementReference: "SET-2026-W14",
		bankAccount: "0123456789", bankName: "GTBank", bankCode: "058", createdAt: "2026-04-08T00:00:00",
		transactions: [
			{ reference: "TXN-001", type: "Loan Repayment", amount: 250000, date: "2026-04-07T16:00:00" },
			{ reference: "TXN-002", type: "Savings Deposit", amount: 100000, date: "2026-04-07T14:00:00" },
			{ reference: "TXN-003", type: "Loan Disbursement", amount: 500000, date: "2026-04-06T10:00:00" },
			{ reference: "TXN-004", type: "Fee Charge", amount: 3750, date: "2026-04-06T10:00:00" },
			{ reference: "TXN-005", type: "Loan Repayment", amount: 47917, date: "2026-04-05T09:00:00" },
		],
	};
};

interface SettlementDetailProps { settlementId?: string; className?: string; }

const SettlementDetail: React.FC<SettlementDetailProps> = ({ settlementId = "1", className = "" }) => {
	const [data, setData] = useState<SettlementData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("breakdown");
	const [modal, setModal] = useState<{ open: boolean; action: string; title: string; message: string; variant: "danger" | "primary" | "success" }>({ open: false, action: "", title: "", message: "", variant: "primary" });
	const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({ show: false, message: "", variant: "success" });

	const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchSettlement(settlementId)); } catch { setError("Failed to load"); } finally { setLoading(false); } }, [settlementId]);
	useEffect(() => { load(); }, [load]);
	const showToast = (msg: string, v = "success") => { setToast({ show: true, message: msg, variant: v }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };
	const handleAction = async () => { if (!data) return; await delay(500); if (modal.action === "process") { setData({ ...data, status: "Completed", settledAt: new Date().toISOString() }); showToast("Settlement processed"); } setModal(m => ({ ...m, open: false })); };

	const tabs = [{ id: "breakdown", label: "Breakdown" }, { id: "bank", label: "Bank Details" }, { id: "txns", label: "Transactions" }];

	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !data) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Not found"}</span><button onClick={load}>Retry</button></div></div>;

	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.settlements}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to Settlements</span></Link>
			<div className={s.headerRow}>
				<h1 className={s.pageTitle}>Settlement Details</h1>
				<div className={s.actionButtons}>
					{data.status === "Pending" && <button className={s.btnPrimary} onClick={() => setModal({ open: true, action: "process", title: "Process Settlement", message: `Process settlement of ${fmt(data.netAmount)} to ${data.bankName}?`, variant: "primary" })}>PROCESS</button>}
					<button className={s.btnSecondary} onClick={() => showToast("Report exported")}>EXPORT REPORT</button>
				</div>
			</div>

			<div className={s.summaryCard}>
				<div className={s.summaryHeader}>
					<div className={s.avatarSmall}>S</div>
					<div className={s.nameSection}><h2 className={s.entityName}>{data.settlementReference}</h2><span className={s.entityId}>{fmtDate(data.periodStart)} – {fmtDate(data.periodEnd)}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Status</span><StatusPill status={data.status} /></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Net Amount</span><span className={s.metaValueLarge}>{fmt(data.netAmount)}</span></div>
				</div>
				<div className={s.tabs}>{tabs.map(t => (<button key={t.id} className={`${s.tab} ${activeTab === t.id ? s.tabActive : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}{activeTab === t.id && <div className={s.tabIndicator} />}</button>))}</div>
			</div>

			<div className={s.detailsCard}>
				{activeTab === "breakdown" && (<>
					<div className={s.statRow}>
						<div className={s.statItem}><span className={s.statValue}>{data.totalTransactions}</span><span className={s.statLabel}>Total Transactions</span></div>
						<div className={s.statItem}><span className={s.statValue}>{fmt(data.totalAmount)}</span><span className={s.statLabel}>Gross Amount</span></div>
						<div className={s.statItem}><span className={s.statValue}>{fmt(data.totalFees)}</span><span className={s.statLabel}>Total Fees</span></div>
						<div className={s.statItem}><span className={s.statValue}>{fmt(data.netAmount)}</span><span className={s.statLabel}>Net Amount</span></div>
					</div>
					<section className={s.section}><h3 className={s.sectionTitle}>Period</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Period Start</span><span className={s.infoValue}>{fmtDate(data.periodStart)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Period End</span><span className={s.infoValue}>{fmtDate(data.periodEnd)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Settled At</span><span className={s.infoValue}>{fmtDate(data.settledAt)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Organization</span><span className={s.infoValue}>{data.organization}</span></div>
						</div>
					</section>
				</>)}

				{activeTab === "bank" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Settlement Bank</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Bank</span><span className={s.infoValue}>{data.bankName}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Account</span><span className={s.infoValue}>{data.bankAccount}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Bank Code</span><span className={s.infoValue}>{data.bankCode}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Reference</span><span className={s.infoValue}>{data.settlementReference}</span></div>
						</div>
					</section>
				)}

				{activeTab === "txns" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Included Transactions</h3>
						<table className={s.miniTable}>
							<thead><tr><th>Reference</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
							<tbody>{data.transactions.map((t, i) => (<tr key={i}><td>{t.reference}</td><td>{t.type}</td><td>{fmt(t.amount)}</td><td>{fmtDate(t.date)}</td></tr>))}</tbody>
						</table>
					</section>
				)}
			</div>

			<ConfirmModal open={modal.open} title={modal.title} message={modal.message} variant={modal.variant} confirmLabel="Process" onConfirm={handleAction} onCancel={() => setModal(m => ({ ...m, open: false }))} />
			{toast.show && <div className={`${s.toast} ${s[toast.variant]}`}>{toast.message}</div>}
		</div>
	);
};
export default SettlementDetail;
