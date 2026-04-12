"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import StatusPill from "@/components/ui/StatusPill";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import s from "@/components/layout/DetailView/DetailView.module.scss";

interface SavingsProductData {
	id: string; name: string; code: string; description: string; productType: string; organization: string; status: string;
	interestRate: string; interestCalcMethod: string; interestPayoutFreq: string;
	minBalance: number; minDeposit: number; maxDeposit: number; maxBalance: number;
	withdrawalRestricted: boolean; withdrawalNoticeDays: number; earlyWithdrawalPenalty: string;
	allowsTarget: boolean; minTargetAmount: number; maxTargetDurationMonths: number;
	createdAt: string;
	activeAccounts: number; totalDeposits: number; totalInterestPaid: number;
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmt = (v: number) => `₦${v.toLocaleString("en-US")}`;
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

const fetchProduct = async (id: string): Promise<SavingsProductData> => {
	await delay(800);
	return {
		id, name: "Flex Save", code: "FS-001", description: "A flexible regular savings account with competitive interest rates. No lock-in period with unlimited withdrawals.", productType: "Regular", organization: "Lendsqr HQ", status: "Active",
		interestRate: "4%", interestCalcMethod: "Daily Balance", interestPayoutFreq: "Monthly",
		minBalance: 1000, minDeposit: 500, maxDeposit: 10000000, maxBalance: 50000000,
		withdrawalRestricted: false, withdrawalNoticeDays: 0, earlyWithdrawalPenalty: "0%",
		allowsTarget: true, minTargetAmount: 5000, maxTargetDurationMonths: 36,
		createdAt: "2022-01-01T00:00:00",
		activeAccounts: 1267, totalDeposits: 890000000, totalInterestPaid: 18500000,
	};
};

interface SavingsProductDetailProps { productId?: string; className?: string; }

const SavingsProductDetail: React.FC<SavingsProductDetailProps> = ({ productId = "1", className = "" }) => {
	const [data, setData] = useState<SavingsProductData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("config");
	const [modal, setModal] = useState<{ open: boolean; action: string; title: string; message: string; variant: "danger" | "primary" | "success" }>({ open: false, action: "", title: "", message: "", variant: "primary" });
	const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({ show: false, message: "", variant: "success" });

	const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchProduct(productId)); } catch { setError("Failed to load"); } finally { setLoading(false); } }, [productId]);
	useEffect(() => { load(); }, [load]);
	const showToast = (msg: string, v = "success") => { setToast({ show: true, message: msg, variant: v }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };
	const handleAction = async () => { if (!data) return; await delay(500); if (modal.action === "deactivate") { setData({ ...data, status: "Inactive" }); showToast("Product deactivated", "warning"); } else if (modal.action === "activate") { setData({ ...data, status: "Active" }); showToast("Product activated"); } setModal(m => ({ ...m, open: false })); };

	const tabs = [{ id: "config", label: "Configuration" }, { id: "stats", label: "Active Accounts" }, { id: "target", label: "Target Settings" }];

	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !data) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Not found"}</span><button onClick={load}>Retry</button></div></div>;

	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.savingsProducts}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to Savings Products</span></Link>
			<div className={s.headerRow}>
				<h1 className={s.pageTitle}>Savings Product</h1>
				<div className={s.actionButtons}>
					<button className={s.btnSecondary} onClick={() => showToast("Edit form would open here")}>EDIT PRODUCT</button>
					{data.status === "Active" ? <button className={s.btnDanger} onClick={() => setModal({ open: true, action: "deactivate", title: "Deactivate Product", message: `Deactivate ${data.name}? No new accounts can be opened.`, variant: "danger" })}>DEACTIVATE</button> : <button className={s.btnSuccess} onClick={() => setModal({ open: true, action: "activate", title: "Activate Product", message: `Reactivate ${data.name}?`, variant: "success" })}>ACTIVATE</button>}
					<button className={s.btnOutlinePrimary} onClick={() => showToast("Product cloned successfully")}>CLONE</button>
				</div>
			</div>

			<div className={s.summaryCard}>
				<div className={s.summaryHeader}>
					<div className={s.avatarSmall}>{data.code.slice(0, 2)}</div>
					<div className={s.nameSection}><h2 className={s.entityName}>{data.name}</h2><span className={s.entityId}>{data.code} • {data.productType}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Status</span><StatusPill status={data.status} /></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Interest</span><span className={s.metaValueLarge}>{data.interestRate}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Accounts</span><span className={s.metaValueLarge}>{data.activeAccounts.toLocaleString()}</span></div>
				</div>
				<div className={s.tabs}>{tabs.map(t => (<button key={t.id} className={`${s.tab} ${activeTab === t.id ? s.tabActive : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}{activeTab === t.id && <div className={s.tabIndicator} />}</button>))}</div>
			</div>

			<div className={s.detailsCard}>
				{activeTab === "config" && (<>
					<section className={s.section}><h3 className={s.sectionTitle}>Description</h3><div className={s.contentBlock}>{data.description}</div></section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Interest Configuration</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Interest Rate</span><span className={s.infoValue}>{data.interestRate}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Calculation Method</span><span className={s.infoValue}>{data.interestCalcMethod}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Payout Frequency</span><span className={s.infoValue}>{data.interestPayoutFreq}</span></div>
						</div>
					</section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Limits</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Min Balance</span><span className={s.infoValue}>{fmt(data.minBalance)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Min Deposit</span><span className={s.infoValue}>{fmt(data.minDeposit)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Max Deposit</span><span className={s.infoValue}>{fmt(data.maxDeposit)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Max Balance</span><span className={s.infoValue}>{fmt(data.maxBalance)}</span></div>
						</div>
					</section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Withdrawal Rules</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Restricted</span><span className={s.infoValue}>{data.withdrawalRestricted ? "Yes" : "No"}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Notice Period</span><span className={s.infoValue}>{data.withdrawalNoticeDays} days</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Early Withdrawal Penalty</span><span className={s.infoValue}>{data.earlyWithdrawalPenalty}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Created</span><span className={s.infoValue}>{fmtDate(data.createdAt)}</span></div>
						</div>
					</section>
				</>)}

				{activeTab === "stats" && (
					<div className={s.statRow}>
						<div className={s.statItem}><span className={s.statValue}>{data.activeAccounts.toLocaleString()}</span><span className={s.statLabel}>Active Accounts</span></div>
						<div className={s.statItem}><span className={s.statValue}>{fmt(data.totalDeposits)}</span><span className={s.statLabel}>Total Deposits</span></div>
						<div className={s.statItem}><span className={s.statValue}>{fmt(data.totalInterestPaid)}</span><span className={s.statLabel}>Interest Paid</span></div>
					</div>
				)}

				{activeTab === "target" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Target Savings Settings</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Allows Target</span><span className={s.infoValue}>{data.allowsTarget ? "Yes" : "No"}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Min Target Amount</span><span className={s.infoValue}>{fmt(data.minTargetAmount)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Max Duration</span><span className={s.infoValue}>{data.maxTargetDurationMonths} months</span></div>
						</div>
					</section>
				)}
			</div>

			<ConfirmModal open={modal.open} title={modal.title} message={modal.message} variant={modal.variant} confirmLabel={modal.action === "deactivate" ? "Deactivate" : "Activate"} onConfirm={handleAction} onCancel={() => setModal(m => ({ ...m, open: false }))} />
			{toast.show && <div className={`${s.toast} ${s[toast.variant]}`}>{toast.message}</div>}
		</div>
	);
};
export default SavingsProductDetail;
