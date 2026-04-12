"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import StatusPill from "@/components/ui/StatusPill";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import s from "@/components/layout/DetailView/DetailView.module.scss";

interface LoanProductData {
	id: string; name: string; code: string; description: string; organization: string; status: string;
	minAmount: number; maxAmount: number; interestRate: string; interestType: string;
	tenureMinMonths: number; tenureMaxMonths: number;
	processingFeeRate: string; insuranceFeeRate: string; lateFeeRate: string; lateFeeGraceDays: number;
	minKycLevel: string; minCreditScore: number; requiresCollateral: boolean; requiresGuarantor: boolean;
	decisionModel: string; createdAt: string;
	activeLoans: number; totalDisbursed: number; defaultRate: string; avgRepaymentDays: number;
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmt = (v: number) => `₦${v.toLocaleString("en-US")}`;
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

const fetchProduct = async (id: string): Promise<LoanProductData> => {
	await delay(800);
	return {
		id, name: "Micro Loan", code: "ML-001", description: "Short-term microfinance loan designed for small business owners and salaried employees. Quick disbursement with flexible repayment options.", organization: "Lendsqr HQ", status: "Active",
		minAmount: 10000, maxAmount: 500000, interestRate: "15%", interestType: "Flat",
		tenureMinMonths: 1, tenureMaxMonths: 12,
		processingFeeRate: "1.5%", insuranceFeeRate: "0.5%", lateFeeRate: "2%", lateFeeGraceDays: 3,
		minKycLevel: "Level 2", minCreditScore: 40, requiresCollateral: false, requiresGuarantor: true,
		decisionModel: "Standard Credit Scorecard v2.1", createdAt: "2022-01-01T00:00:00",
		activeLoans: 487, totalDisbursed: 145000000, defaultRate: "3.2%", avgRepaymentDays: 28,
	};
};

interface LoanProductDetailProps { productId?: string; className?: string; }

const LoanProductDetail: React.FC<LoanProductDetailProps> = ({ productId = "1", className = "" }) => {
	const [data, setData] = useState<LoanProductData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("config");
	const [modal, setModal] = useState<{ open: boolean; action: string; title: string; message: string; variant: "danger" | "primary" | "success" }>({ open: false, action: "", title: "", message: "", variant: "primary" });
	const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({ show: false, message: "", variant: "success" });

	const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchProduct(productId)); } catch { setError("Failed to load"); } finally { setLoading(false); } }, [productId]);
	useEffect(() => { load(); }, [load]);
	const showToast = (msg: string, v = "success") => { setToast({ show: true, message: msg, variant: v }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };
	const handleAction = async () => { if (!data) return; await delay(500); if (modal.action === "deactivate") { setData({ ...data, status: "Inactive" }); showToast("Product deactivated", "warning"); } else if (modal.action === "activate") { setData({ ...data, status: "Active" }); showToast("Product activated"); } setModal(m => ({ ...m, open: false })); };

	const tabs = [{ id: "config", label: "Configuration" }, { id: "performance", label: "Performance" }, { id: "model", label: "Decision Model" }];

	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !data) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Not found"}</span><button onClick={load}>Retry</button></div></div>;

	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.loanProducts}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to Loan Products</span></Link>
			<div className={s.headerRow}>
				<h1 className={s.pageTitle}>Loan Product</h1>
				<div className={s.actionButtons}>
					<button className={s.btnSecondary} onClick={() => showToast("Edit product form would open here")}>EDIT PRODUCT</button>
					{data.status === "Active" ? <button className={s.btnDanger} onClick={() => setModal({ open: true, action: "deactivate", title: "Deactivate Product", message: `Deactivate ${data.name}? New loans cannot use this product.`, variant: "danger" })}>DEACTIVATE</button> : <button className={s.btnSuccess} onClick={() => setModal({ open: true, action: "activate", title: "Activate Product", message: `Reactivate ${data.name}?`, variant: "success" })}>ACTIVATE</button>}
					<button className={s.btnOutlinePrimary} onClick={() => showToast("Product cloned successfully")}>CLONE</button>
				</div>
			</div>

			<div className={s.summaryCard}>
				<div className={s.summaryHeader}>
					<div className={s.avatarSmall}>{data.code.slice(0, 2)}</div>
					<div className={s.nameSection}><h2 className={s.entityName}>{data.name}</h2><span className={s.entityId}>{data.code} • {data.organization}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Status</span><StatusPill status={data.status} /></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Interest</span><span className={s.metaValueLarge}>{data.interestRate}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Range</span><span className={s.metaValue}>{fmt(data.minAmount)} – {fmt(data.maxAmount)}</span></div>
				</div>
				<div className={s.tabs}>{tabs.map(t => (<button key={t.id} className={`${s.tab} ${activeTab === t.id ? s.tabActive : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}{activeTab === t.id && <div className={s.tabIndicator} />}</button>))}</div>
			</div>

			<div className={s.detailsCard}>
				{activeTab === "config" && (<>
					<section className={s.section}><h3 className={s.sectionTitle}>Description</h3><div className={s.contentBlock}>{data.description}</div></section>
					<div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Loan Terms</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Min Amount</span><span className={s.infoValue}>{fmt(data.minAmount)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Max Amount</span><span className={s.infoValue}>{fmt(data.maxAmount)}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Interest Rate</span><span className={s.infoValue}>{data.interestRate}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Interest Type</span><span className={s.infoValue}>{data.interestType}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Tenure</span><span className={s.infoValue}>{data.tenureMinMonths}–{data.tenureMaxMonths} months</span></div>
						</div>
					</section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Fees</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Processing Fee</span><span className={s.infoValue}>{data.processingFeeRate}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Insurance Fee</span><span className={s.infoValue}>{data.insuranceFeeRate}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Late Fee</span><span className={s.infoValue}>{data.lateFeeRate}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Grace Period</span><span className={s.infoValue}>{data.lateFeeGraceDays} days</span></div>
						</div>
					</section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Requirements</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Min KYC Level</span><span className={s.infoValue}>{data.minKycLevel}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Min Credit Score</span><span className={s.infoValue}>{data.minCreditScore}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Requires Collateral</span><span className={s.infoValue}>{data.requiresCollateral ? "Yes" : "No"}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Requires Guarantor</span><span className={s.infoValue}>{data.requiresGuarantor ? "Yes" : "No"}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Created</span><span className={s.infoValue}>{fmtDate(data.createdAt)}</span></div>
						</div>
					</section>
				</>)}

				{activeTab === "performance" && (<>
					<div className={s.statRow}>
						<div className={s.statItem}><span className={s.statValue}>{data.activeLoans.toLocaleString()}</span><span className={s.statLabel}>Active Loans</span></div>
						<div className={s.statItem}><span className={s.statValue}>{fmt(data.totalDisbursed)}</span><span className={s.statLabel}>Total Disbursed</span></div>
						<div className={s.statItem}><span className={s.statValue} style={{ color: parseFloat(data.defaultRate) > 5 ? "#E4033B" : "#39CD62" }}>{data.defaultRate}</span><span className={s.statLabel}>Default Rate</span></div>
						<div className={s.statItem}><span className={s.statValue}>{data.avgRepaymentDays} days</span><span className={s.statLabel}>Avg. Repayment</span></div>
					</div>
				</>)}

				{activeTab === "model" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Decision Model</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Model Name</span><span className={s.infoValue}>{data.decisionModel}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Min Score Required</span><span className={s.infoValue}>{data.minCreditScore}</span></div>
						</div>
					</section>
				)}
			</div>

			<ConfirmModal open={modal.open} title={modal.title} message={modal.message} variant={modal.variant} confirmLabel={modal.action === "deactivate" ? "Deactivate" : "Activate"} onConfirm={handleAction} onCancel={() => setModal(m => ({ ...m, open: false }))} />
			{toast.show && <div className={`${s.toast} ${s[toast.variant]}`}>{toast.message}</div>}
		</div>
	);
};
export default LoanProductDetail;
