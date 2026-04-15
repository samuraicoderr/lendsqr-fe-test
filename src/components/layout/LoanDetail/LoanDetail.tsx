"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import StatusPill from "@/components/ui/StatusPill";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import s from "@/components/layout/DetailView/DetailView.module.scss";
import LoanService from "@/lib/api/services/Loan.Service";

/* ── Types ── */
interface LoanScheduleItem { installment: number; dueDate: string; principal: number; interest: number; total: number; paid: number; status: string; }
interface LoanPaymentItem { id: string; amount: number; method: string; reference: string; principalPortion: number; interestPortion: number; paidAt: string; }
interface GuarantorItem { id: string; fullName: string; phone: string; email: string; relationship: string; guaranteedAmount: number; status: string; }
interface LoanData {
	id: string; loanNumber: string; borrower: string; borrowerEmail: string; organization: string;
	product: string; purpose: string; status: string;
	principalAmount: number; interestRate: string; interestType: string; tenureMonths: number;
	interestAmount: number; processingFee: number; insuranceFee: number; totalAmountDue: number;
	totalRepaid: number; totalOutstanding: number; nextDueDate: string; lastPaymentDate: string;
	disbursementStatus: string; disbursedAt: string; disbursedBy: string;
	disbursementAccount: string; disbursementBank: string; repaymentStatus: string;
	createdAt: string; schedule: LoanScheduleItem[]; payments: LoanPaymentItem[]; guarantors: GuarantorItem[];
}

/* ── Mock ── */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmt = (v: number) => `₦${v.toLocaleString("en-US")}`;
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

const fetchLoan = async (id: string): Promise<LoanData> => {
	return LoanService.getLoanById(id);
};

/* ── Component ── */
interface LoanDetailProps { loanId?: string; className?: string; }

const LoanDetail: React.FC<LoanDetailProps> = ({ loanId = "1", className = "" }) => {
	const [loan, setLoan] = useState<LoanData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("overview");
	const [modal, setModal] = useState<{ open: boolean; action: string; title: string; message: string; variant: "danger" | "primary" | "success" }>({ open: false, action: "", title: "", message: "", variant: "danger" });
	const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({ show: false, message: "", variant: "success" });

	const loadLoan = useCallback(async () => {
		try { setLoading(true); setError(null); const data = await fetchLoan(loanId); setLoan(data); } catch { setError("Failed to load loan details"); } finally { setLoading(false); }
	}, [loanId]);

	useEffect(() => { loadLoan(); }, [loadLoan]);

	const showToast = (message: string, variant = "success") => { setToast({ show: true, message, variant }); setTimeout(() => setToast({ show: false, message: "", variant: "" }), 3000); };

	const handleAction = async () => {
		if (!loan) return;
		await delay(500);
		if (modal.action === "disburse") { const updated = await LoanService.patchLoan(loan.id, { status: "Disbursed" }); setLoan(updated); showToast("Loan disbursed successfully"); }
		else if (modal.action === "default") { const updated = await LoanService.patchLoan(loan.id, { status: "Defaulted" }); setLoan(updated); showToast("Loan marked as defaulted", "danger"); }
		else if (modal.action === "writeoff") { const updated = await LoanService.patchLoan(loan.id, { status: "Written Off" }); setLoan(updated); showToast("Loan written off"); }
		setModal({ ...modal, open: false });
	};

	const tabs = [
		{ id: "overview", label: "Overview" },
		{ id: "schedule", label: "Repayment Schedule" },
		{ id: "payments", label: "Payments" },
		{ id: "guarantors", label: "Guarantors" },
	];

	/* ── Loading / Error ── */
	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !loan) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Loan not found"}</span><button onClick={loadLoan}>Retry</button></div></div>;

	const repaymentPct = Math.round((loan.totalRepaid / loan.totalAmountDue) * 100);

	/* ── Render ── */
	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.loans}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to Loans</span></Link>

			<div className={s.headerRow}>
				<h1 className={s.pageTitle}>Loan Details</h1>
				<div className={s.actionButtons}>
					{loan.status === "Pending" && <button className={s.btnPrimary} onClick={() => setModal({ open: true, action: "disburse", title: "Disburse Loan", message: `Disburse ${fmt(loan.principalAmount)} to ${loan.borrower}?`, variant: "primary" })}>DISBURSE</button>}
					{(loan.status === "Active" || loan.status === "Disbursed") && (
						<>
							<button className={s.btnDanger} onClick={() => setModal({ open: true, action: "default", title: "Mark as Defaulted", message: `This will mark loan ${loan.loanNumber} as defaulted. This action affects the borrower's karma score.`, variant: "danger" })}>MARK DEFAULTED</button>
							<button className={s.btnWarning} onClick={() => setModal({ open: true, action: "writeoff", title: "Write Off Loan", message: `Write off loan ${loan.loanNumber} with outstanding balance of ${fmt(loan.totalOutstanding)}?`, variant: "danger" })}>WRITE OFF</button>
						</>
					)}
					<button className={s.btnSecondary} onClick={() => showToast("Restructure flow would open here")}>RESTRUCTURE</button>
				</div>
			</div>

			{/* Summary Card */}
			<div className={s.summaryCard}>
				<div className={s.summaryHeader}>
					<div className={s.avatarSmall}>{loan.borrower.split(" ").map(n => n[0]).join("")}</div>
					<div className={s.nameSection}>
						<h2 className={s.entityName}>{loan.borrower}</h2>
						<span className={s.entityId}>{loan.loanNumber} • {loan.product}</span>
					</div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}>
						<span className={s.metaLabel}>Status</span>
						<StatusPill status={loan.status} />
					</div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}>
						<span className={s.metaLabel}>Principal</span>
						<span className={s.metaValueLarge}>{fmt(loan.principalAmount)}</span>
					</div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}>
						<span className={s.metaLabel}>Outstanding</span>
						<span className={s.metaValueLarge}>{fmt(loan.totalOutstanding)}</span>
					</div>
				</div>
				<div className={s.tabs}>{tabs.map(t => (<button key={t.id} className={`${s.tab} ${activeTab === t.id ? s.tabActive : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}{activeTab === t.id && <div className={s.tabIndicator} />}</button>))}</div>
			</div>

			{/* Details Card */}
			<div className={s.detailsCard}>
				{activeTab === "overview" && (
					<>
						{/* Progress */}
						<div className={s.progressContainer}>
							<div className={s.progressLabel}><span>Repayment Progress</span><span>{repaymentPct}% ({fmt(loan.totalRepaid)} of {fmt(loan.totalAmountDue)})</span></div>
							<div className={s.progressTrack}><div className={`${s.progressFill} ${repaymentPct >= 70 ? s.success : repaymentPct >= 40 ? s.warning : s.danger}`} style={{ width: `${repaymentPct}%` }} /></div>
						</div>
						<div className={s.sectionDivider} />

						<section className={s.section}>
							<h3 className={s.sectionTitle}>Loan Terms</h3>
							<div className={s.infoGrid}>
								<div className={s.infoItem}><span className={s.infoLabel}>Loan Number</span><span className={s.infoValue}>{loan.loanNumber}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Product</span><span className={s.infoValue}>{loan.product}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Principal Amount</span><span className={s.infoValue}>{fmt(loan.principalAmount)}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Interest Rate</span><span className={s.infoValue}>{loan.interestRate} ({loan.interestType})</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Tenure</span><span className={s.infoValue}>{loan.tenureMonths} months</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Interest Amount</span><span className={s.infoValue}>{fmt(loan.interestAmount)}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Processing Fee</span><span className={s.infoValue}>{fmt(loan.processingFee)}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Insurance Fee</span><span className={s.infoValue}>{fmt(loan.insuranceFee)}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Total Due</span><span className={s.infoValue}>{fmt(loan.totalAmountDue)}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Repayment Status</span><span className={s.infoValue}><StatusPill status={loan.repaymentStatus} /></span></div>
							</div>
						</section>
						<div className={s.sectionDivider} />

						<section className={s.section}>
							<h3 className={s.sectionTitle}>Disbursement</h3>
							<div className={s.infoGrid}>
								<div className={s.infoItem}><span className={s.infoLabel}>Disbursement Status</span><span className={s.infoValue}><StatusPill status={loan.disbursementStatus} /></span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Disbursed At</span><span className={s.infoValue}>{fmtDate(loan.disbursedAt)}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Disbursed By</span><span className={s.infoValue}>{loan.disbursedBy}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Bank Account</span><span className={s.infoValue}>{loan.disbursementAccount}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Bank</span><span className={s.infoValue}>{loan.disbursementBank}</span></div>
							</div>
						</section>
						<div className={s.sectionDivider} />

						<section className={s.section}>
							<h3 className={s.sectionTitle}>Key Dates</h3>
							<div className={s.infoGrid}>
								<div className={s.infoItem}><span className={s.infoLabel}>Application Date</span><span className={s.infoValue}>{fmtDate(loan.createdAt)}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Next Due Date</span><span className={s.infoValue}>{fmtDate(loan.nextDueDate)}</span></div>
								<div className={s.infoItem}><span className={s.infoLabel}>Last Payment</span><span className={s.infoValue}>{fmtDate(loan.lastPaymentDate)}</span></div>
							</div>
						</section>
						<div className={s.sectionDivider} />

						<section className={s.section}>
							<h3 className={s.sectionTitle}>Purpose</h3>
							<div className={s.contentBlock}>{loan.purpose}</div>
						</section>
					</>
				)}

				{activeTab === "schedule" && (
					<section className={s.section}>
						<h3 className={s.sectionTitle}>Repayment Schedule</h3>
						<table className={s.miniTable}>
							<thead><tr><th>#</th><th>Due Date</th><th>Principal</th><th>Interest</th><th>Total</th><th>Paid</th><th>Status</th></tr></thead>
							<tbody>{loan.schedule.map((row) => (<tr key={row.installment}><td>{row.installment}</td><td>{fmtDate(row.dueDate)}</td><td>{fmt(row.principal)}</td><td>{fmt(row.interest)}</td><td>{fmt(row.total)}</td><td>{fmt(row.paid)}</td><td><StatusPill status={row.status} /></td></tr>))}</tbody>
						</table>
					</section>
				)}

				{activeTab === "payments" && (
					<section className={s.section}>
						<h3 className={s.sectionTitle}>Payment History</h3>
						{loan.payments.length === 0 ? <div className={s.emptyState}>No payments recorded yet.</div> : (
							<table className={s.miniTable}>
								<thead><tr><th>Reference</th><th>Amount</th><th>Principal</th><th>Interest</th><th>Method</th><th>Date</th></tr></thead>
								<tbody>{loan.payments.map((p) => (<tr key={p.id}><td>{p.reference}</td><td>{fmt(p.amount)}</td><td>{fmt(p.principalPortion)}</td><td>{fmt(p.interestPortion)}</td><td>{p.method}</td><td>{fmtDate(p.paidAt)}</td></tr>))}</tbody>
							</table>
						)}
					</section>
				)}

				{activeTab === "guarantors" && (
					<section className={s.section}>
						<h3 className={s.sectionTitle}>Guarantors</h3>
						{loan.guarantors.length === 0 ? <div className={s.emptyState}>No guarantors linked to this loan.</div> : (
							<div className={s.cardGrid}>
								{loan.guarantors.map((g) => (
									<div key={g.id} className={s.infoCard}>
										<h4 className={s.infoCardTitle}>{g.fullName}</h4>
										<p className={s.infoCardMeta}>{g.relationship} • {g.phone}</p>
										<p className={s.infoCardMeta}>{g.email}</p>
										<p className={s.infoCardMeta}>Guaranteed: {fmt(g.guaranteedAmount)} • <StatusPill status={g.status} /></p>
									</div>
								))}
							</div>
						)}
					</section>
				)}
			</div>

			<ConfirmModal open={modal.open} title={modal.title} message={modal.message} variant={modal.variant} confirmLabel={modal.action === "disburse" ? "Disburse" : modal.action === "default" ? "Mark Defaulted" : "Write Off"} onConfirm={handleAction} onCancel={() => setModal({ ...modal, open: false })} />
			{toast.show && <div className={`${s.toast} ${s[toast.variant]}`}>{toast.message}</div>}
		</div>
	);
};

export default LoanDetail;
