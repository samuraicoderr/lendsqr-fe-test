"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import StatusPill from "@/components/ui/StatusPill";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import s from "@/components/layout/DetailView/DetailView.module.scss";

interface SavingsTxn { id: string; type: string; amount: number; balanceBefore: number; balanceAfter: number; reference: string; date: string; }
interface SavingsData {
	id: string; accountNumber: string; accountName: string; product: string; productType: string; organization: string; status: string;
	balance: number; availableBalance: number; lockedAmount: number; interestEarned: number; interestPaid: number;
	interestRate: string; interestCalcMethod: string; interestPayoutFreq: string;
	minBalance: number; withdrawalRestricted: boolean; withdrawalNoticeDays: number;
	targetAmount: number; targetDate: string; targetName: string;
	openedAt: string; transactions: SavingsTxn[];
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmt = (v: number) => `₦${v.toLocaleString("en-US")}`;
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

const fetchSavings = async (id: string): Promise<SavingsData> => {
	await delay(800);
	return {
		id, accountNumber: "SAV-001-2023", accountName: "Adeyemi Okafor", product: "Flex Save", productType: "Regular", organization: "Lendsqr HQ", status: "Active",
		balance: 320000, availableBalance: 315000, lockedAmount: 5000, interestEarned: 8500, interestPaid: 6200,
		interestRate: "4%", interestCalcMethod: "Daily Balance", interestPayoutFreq: "Monthly",
		minBalance: 1000, withdrawalRestricted: false, withdrawalNoticeDays: 0,
		targetAmount: 500000, targetDate: "2026-12-31", targetName: "New Car Fund",
		openedAt: "2023-02-10T08:00:00",
		transactions: [
			{ id: "t1", type: "Deposit", amount: 50000, balanceBefore: 270000, balanceAfter: 320000, reference: "STX-001", date: "2026-04-10T09:30:00" },
			{ id: "t2", type: "Interest", amount: 1200, balanceBefore: 268800, balanceAfter: 270000, reference: "INT-APR-2026", date: "2026-04-01T00:00:00" },
			{ id: "t3", type: "Withdrawal", amount: 25000, balanceBefore: 293800, balanceAfter: 268800, reference: "STX-002", date: "2026-03-20T14:00:00" },
			{ id: "t4", type: "Deposit", amount: 100000, balanceBefore: 193800, balanceAfter: 293800, reference: "STX-003", date: "2026-03-05T10:00:00" },
			{ id: "t5", type: "Deposit", amount: 50000, balanceBefore: 143800, balanceAfter: 193800, reference: "STX-004", date: "2026-02-10T09:00:00" },
		],
	};
};

interface SavingsDetailProps { savingsId?: string; className?: string; }

const SavingsDetail: React.FC<SavingsDetailProps> = ({ savingsId = "1", className = "" }) => {
	const [data, setData] = useState<SavingsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("account");
	const [modal, setModal] = useState<{ open: boolean; action: string; title: string; message: string; variant: "danger" | "primary" | "success" }>({ open: false, action: "", title: "", message: "", variant: "danger" });
	const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({ show: false, message: "", variant: "success" });

	const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchSavings(savingsId)); } catch { setError("Failed to load"); } finally { setLoading(false); } }, [savingsId]);
	useEffect(() => { load(); }, [load]);
	const showToast = (msg: string, v = "success") => { setToast({ show: true, message: msg, variant: v }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };
	const handleAction = async () => { if (!data) return; await delay(500); if (modal.action === "freeze") { setData({ ...data, status: "Frozen" }); showToast("Account frozen", "warning"); } else if (modal.action === "close") { setData({ ...data, status: "Closed", balance: 0 }); showToast("Account closed"); } else if (modal.action === "credit") { setData({ ...data, interestPaid: data.interestEarned }); showToast("Interest credited"); } setModal(m => ({ ...m, open: false })); };

	const tabs = [{ id: "account", label: "Account Info" }, { id: "transactions", label: "Transactions" }, { id: "target", label: "Target Progress" }];

	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !data) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Not found"}</span><button onClick={load}>Retry</button></div></div>;

	const targetPct = data.targetAmount > 0 ? Math.min(100, Math.round((data.balance / data.targetAmount) * 100)) : 0;

	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.savings}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to Savings</span></Link>
			<div className={s.headerRow}>
				<h1 className={s.pageTitle}>Savings Account</h1>
				<div className={s.actionButtons}>
					{data.status === "Active" && <button className={s.btnWarning} onClick={() => setModal({ open: true, action: "freeze", title: "Freeze Account", message: `Freeze savings account ${data.accountNumber}? The holder will not be able to withdraw.`, variant: "danger" })}>FREEZE</button>}
					{data.status === "Active" && <button className={s.btnDanger} onClick={() => setModal({ open: true, action: "close", title: "Close Account", message: `Close account ${data.accountNumber}? Balance of ${fmt(data.balance)} will be transferred to the holder's bank.`, variant: "danger" })}>CLOSE ACCOUNT</button>}
					<button className={s.btnPrimary} onClick={() => setModal({ open: true, action: "credit", title: "Credit Interest", message: `Credit ${fmt(data.interestEarned - data.interestPaid)} accrued interest to ${data.accountName}?`, variant: "success" })}>CREDIT INTEREST</button>
				</div>
			</div>

			<div className={s.summaryCard}>
				<div className={s.summaryHeader}>
					<div className={s.avatarSmall}>{data.accountName.split(" ").map(n => n[0]).join("")}</div>
					<div className={s.nameSection}><h2 className={s.entityName}>{data.accountName}</h2><span className={s.entityId}>{data.accountNumber} • {data.product}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Status</span><StatusPill status={data.status} /></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Balance</span><span className={s.metaValueLarge}>{fmt(data.balance)}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Interest Earned</span><span className={s.metaValueLarge}>{fmt(data.interestEarned)}</span></div>
				</div>
				<div className={s.tabs}>{tabs.map(t => (<button key={t.id} className={`${s.tab} ${activeTab === t.id ? s.tabActive : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}{activeTab === t.id && <div className={s.tabIndicator} />}</button>))}</div>
			</div>

			<div className={s.detailsCard}>
				{activeTab === "account" && (<>
					<div className={s.statRow}>
						<div className={s.statItem}><span className={s.statValue}>{fmt(data.balance)}</span><span className={s.statLabel}>Total Balance</span></div>
						<div className={s.statItem}><span className={s.statValue}>{fmt(data.availableBalance)}</span><span className={s.statLabel}>Available</span></div>
						<div className={s.statItem}><span className={s.statValue}>{fmt(data.lockedAmount)}</span><span className={s.statLabel}>Locked</span></div>
						<div className={s.statItem}><span className={s.statValue}>{fmt(data.interestEarned)}</span><span className={s.statLabel}>Interest Earned</span></div>
					</div>
					<section className={s.section}><h3 className={s.sectionTitle}>Account Details</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Account Number</span><span className={s.infoValue}>{data.accountNumber}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Product</span><span className={s.infoValue}>{data.product}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Product Type</span><span className={s.infoValue}>{data.productType}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Organization</span><span className={s.infoValue}>{data.organization}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Date Opened</span><span className={s.infoValue}>{fmtDate(data.openedAt)}</span></div>
						</div>
					</section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Interest & Limits</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Interest Rate</span><span className={s.infoValue}>{data.interestRate}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Calculation Method</span><span className={s.infoValue}>{data.interestCalcMethod}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Payout Frequency</span><span className={s.infoValue}>{data.interestPayoutFreq}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Min Balance</span><span className={s.infoValue}>{fmt(data.minBalance)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Withdrawal Restricted</span><span className={s.infoValue}>{data.withdrawalRestricted ? "Yes" : "No"}</span></div>
						</div>
					</section>
				</>)}

				{activeTab === "transactions" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Transaction History</h3>
						<table className={s.miniTable}>
							<thead><tr><th>Reference</th><th>Type</th><th>Amount</th><th>Before</th><th>After</th><th>Date</th></tr></thead>
							<tbody>{data.transactions.map(t => (<tr key={t.id}><td>{t.reference}</td><td><StatusPill status={t.type} /></td><td style={{ color: t.type === "Withdrawal" ? "#E4033B" : "#39CD62", fontWeight: 600 }}>{t.type === "Withdrawal" ? "-" : "+"}{fmt(t.amount)}</td><td>{fmt(t.balanceBefore)}</td><td>{fmt(t.balanceAfter)}</td><td>{fmtDate(t.date)}</td></tr>))}</tbody>
						</table>
					</section>
				)}

				{activeTab === "target" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Target Savings</h3>
						{data.targetAmount > 0 ? (<>
							<div className={s.infoGrid}>
								<div className={s.infoItem}><span className={s.infoLabel}>Target Name</span><span className={s.infoValue}>{data.targetName}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Target Amount</span><span className={s.infoValue}>{fmt(data.targetAmount)}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Target Date</span><span className={s.infoValue}>{fmtDate(data.targetDate)}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Current Balance</span><span className={s.infoValue}>{fmt(data.balance)}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Remaining</span><span className={s.infoValue}>{fmt(data.targetAmount - data.balance)}</span></div>
							</div>
							<div className={s.progressContainer} style={{ marginTop: 24 }}>
								<div className={s.progressLabel}><span>Progress</span><span>{targetPct}%</span></div>
								<div className={s.progressTrack}><div className={`${s.progressFill} ${targetPct >= 80 ? s.success : targetPct >= 50 ? s.warning : ""}`} style={{ width: `${targetPct}%` }} /></div>
							</div>
						</>) : <div className={s.emptyState}>No target set for this savings account.</div>}
					</section>
				)}
			</div>

			<ConfirmModal open={modal.open} title={modal.title} message={modal.message} variant={modal.variant} confirmLabel={modal.action === "freeze" ? "Freeze" : modal.action === "close" ? "Close Account" : "Credit"} onConfirm={handleAction} onCancel={() => setModal(m => ({ ...m, open: false }))} />
			{toast.show && <div className={`${s.toast} ${s[toast.variant]}`}>{toast.message}</div>}
		</div>
	);
};
export default SavingsDetail;
