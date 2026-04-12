"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import FrontendLinks from "@/lib/FrontendLinks";
import StatusPill from "@/components/ui/StatusPill";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import s from "@/components/layout/DetailView/DetailView.module.scss";

interface BranchItem { name: string; code: string; city: string; state: string; manager: string; isActive: boolean; }
interface StaffItem { name: string; email: string; role: string; department: string; lastLogin: string; isActive: boolean; }
interface OrgData {
	id: string; name: string; slug: string; email: string; phone: string; website: string;
	registrationNumber: string; taxId: string; industry: string;
	address: string; city: string; state: string; country: string;
	status: string; createdAt: string;
	totalUsers: number; totalLoans: number; totalSavingsAccounts: number; activeProducts: number;
	branches: BranchItem[]; staff: StaffItem[];
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtDate = (v: string) => { if (!v) return "—"; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

const fetchOrg = async (id: string): Promise<OrgData> => {
	await delay(800);
	return {
		id, name: "Lendsqr HQ", slug: "lendsqr-hq", email: "admin@lendsqr.com", phone: "+234 803 000 0000", website: "https://lendsqr.com",
		registrationNumber: "RC-1234567", taxId: "TIN-98765432", industry: "Financial Technology",
		address: "235 Ikorodu Road, Palmgrove", city: "Lagos", state: "Lagos", country: "Nigeria",
		status: "Active", createdAt: "2020-06-01T00:00:00",
		totalUsers: 2453, totalLoans: 1287, totalSavingsAccounts: 1890, activeProducts: 12,
		branches: [
			{ name: "Lagos Head Office", code: "LHO", city: "Lagos", state: "Lagos", manager: "Jane Okafor", isActive: true },
			{ name: "Abuja Branch", code: "ABJ", city: "Abuja", state: "FCT", manager: "David Nnaji", isActive: true },
			{ name: "Port Harcourt", code: "PHC", city: "Port Harcourt", state: "Rivers", manager: "Gloria Osei", isActive: true },
			{ name: "Kano Branch", code: "KAN", city: "Kano", state: "Kano", manager: "—", isActive: false },
		],
		staff: [
			{ name: "Jane Okafor", email: "jane.okafor@lendsqr.com", role: "Admin", department: "Operations", lastLogin: "2026-04-12T04:00:00", isActive: true },
			{ name: "David Nnaji", email: "david.n@lendsqr.com", role: "Manager", department: "Risk", lastLogin: "2026-04-11T18:00:00", isActive: true },
			{ name: "Favour Adeyemi", email: "favour.a@lendsqr.com", role: "Officer", department: "Collections", lastLogin: "2026-04-12T02:00:00", isActive: true },
			{ name: "Kingsley Obi", email: "kingsley.o@lendsqr.com", role: "Support", department: "Customer Service", lastLogin: "2026-04-10T09:00:00", isActive: true },
			{ name: "Gloria Osei", email: "gloria.o@lendsqr.com", role: "Auditor", department: "Finance", lastLogin: "2026-04-09T16:00:00", isActive: true },
		],
	};
};

interface OrganizationDetailProps { orgId?: string; className?: string; }

const OrganizationDetail: React.FC<OrganizationDetailProps> = ({ orgId = "1", className = "" }) => {
	const [data, setData] = useState<OrgData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("overview");
	const [modal, setModal] = useState<{ open: boolean; action: string; title: string; message: string; variant: "danger" | "primary" | "success" }>({ open: false, action: "", title: "", message: "", variant: "primary" });
	const [toast, setToast] = useState<{ show: boolean; message: string; variant: string }>({ show: false, message: "", variant: "success" });

	const load = useCallback(async () => { try { setLoading(true); setError(null); setData(await fetchOrg(orgId)); } catch { setError("Failed to load"); } finally { setLoading(false); } }, [orgId]);
	useEffect(() => { load(); }, [load]);
	const showToast = (msg: string, v = "success") => { setToast({ show: true, message: msg, variant: v }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };
	const handleAction = async () => { if (!data) return; await delay(500); if (modal.action === "suspend") { setData({ ...data, status: "Suspended" }); showToast("Organization suspended", "danger"); } else if (modal.action === "activate") { setData({ ...data, status: "Active" }); showToast("Organization activated"); } setModal(m => ({ ...m, open: false })); };

	const tabs = [{ id: "overview", label: "Overview" }, { id: "branches", label: "Branches" }, { id: "staff", label: "Staff" }, { id: "products", label: "Products" }];

	if (loading) return <div className={`${s.container} ${className}`}><div className={s.skeleton}><div className={s.skeletonHeader} /><div className={s.skeletonCard} /><div className={s.skeletonContent} /></div></div>;
	if (error || !data) return <div className={`${s.container} ${className}`}><div className={s.error}><span>{error || "Not found"}</span><button onClick={load}>Retry</button></div></div>;

	return (
		<div className={`${s.container} ${className}`}>
			<Link className={s.backButton} href={FrontendLinks.organization}><img src="/media/icons/long-left-arrow.svg" alt="Back" className={s.backIcon} /><span>Back to Organizations</span></Link>
			<div className={s.headerRow}>
				<h1 className={s.pageTitle}>Organization Details</h1>
				<div className={s.actionButtons}>
					{data.status === "Active" && <button className={s.btnDanger} onClick={() => setModal({ open: true, action: "suspend", title: "Suspend Organization", message: `Suspend ${data.name}? All operations will be paused.`, variant: "danger" })}>SUSPEND</button>}
					{data.status !== "Active" && <button className={s.btnSuccess} onClick={() => setModal({ open: true, action: "activate", title: "Activate Organization", message: `Reactivate ${data.name}?`, variant: "success" })}>ACTIVATE</button>}
					<button className={s.btnSecondary} onClick={() => showToast("Edit form would open here")}>EDIT DETAILS</button>
				</div>
			</div>

			<div className={s.summaryCard}>
				<div className={s.summaryHeader}>
					<div className={s.avatarSmall}>{data.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
					<div className={s.nameSection}><h2 className={s.entityName}>{data.name}</h2><span className={s.entityId}>{data.industry} • {data.registrationNumber}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Status</span><StatusPill status={data.status} /></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Users</span><span className={s.metaValueLarge}>{data.totalUsers.toLocaleString()}</span></div>
					<div className={s.verticalDivider} />
					<div className={s.summaryMeta}><span className={s.metaLabel}>Active Loans</span><span className={s.metaValueLarge}>{data.totalLoans.toLocaleString()}</span></div>
				</div>
				<div className={s.tabs}>{tabs.map(t => (<button key={t.id} className={`${s.tab} ${activeTab === t.id ? s.tabActive : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}{activeTab === t.id && <div className={s.tabIndicator} />}</button>))}</div>
			</div>

			<div className={s.detailsCard}>
				{activeTab === "overview" && (<>
					<div className={s.statRow}>
						<div className={s.statItem}><span className={s.statValue}>{data.totalUsers.toLocaleString()}</span><span className={s.statLabel}>Total Users</span></div>
						<div className={s.statItem}><span className={s.statValue}>{data.totalLoans.toLocaleString()}</span><span className={s.statLabel}>Total Loans</span></div>
						<div className={s.statItem}><span className={s.statValue}>{data.totalSavingsAccounts.toLocaleString()}</span><span className={s.statLabel}>Savings Accounts</span></div>
						<div className={s.statItem}><span className={s.statValue}>{data.activeProducts}</span><span className={s.statLabel}>Active Products</span></div>
					</div>
					<section className={s.section}><h3 className={s.sectionTitle}>Contact Information</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Email</span><span className={s.infoValue}>{data.email}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Phone</span><span className={s.infoValue}>{data.phone}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Website</span><span className={s.infoValue}>{data.website}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Slug</span><span className={s.infoValue}>{data.slug}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Created</span><span className={s.infoValue}>{fmtDate(data.createdAt)}</span></div>
						</div>
					</section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Business Registration</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Registration #</span><span className={s.infoValue}>{data.registrationNumber}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Tax ID</span><span className={s.infoValue}>{data.taxId}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Industry</span><span className={s.infoValue}>{data.industry}</span></div>
						</div>
					</section><div className={s.sectionDivider} />
					<section className={s.section}><h3 className={s.sectionTitle}>Address</h3>
						<div className={s.infoGrid}>
							<div className={s.infoItem}><span className={s.infoLabel}>Address</span><span className={s.infoValue}>{data.address}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>City</span><span className={s.infoValue}>{data.city}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>State</span><span className={s.infoValue}>{data.state}</span></div>
							<div className={s.infoItem}><span className={s.infoLabel}>Country</span><span className={s.infoValue}>{data.country}</span></div>
						</div>
					</section>
				</>)}

				{activeTab === "branches" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Branches ({data.branches.length})</h3>
						<table className={s.miniTable}>
							<thead><tr><th>Name</th><th>Code</th><th>City</th><th>State</th><th>Manager</th><th>Status</th></tr></thead>
							<tbody>{data.branches.map((b, i) => (<tr key={i}><td>{b.name}</td><td>{b.code}</td><td>{b.city}</td><td>{b.state}</td><td>{b.manager}</td><td><StatusPill status={b.isActive ? "Active" : "Inactive"} /></td></tr>))}</tbody>
						</table>
					</section>
				)}

				{activeTab === "staff" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Staff Members ({data.staff.length})</h3>
						<table className={s.miniTable}>
							<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Last Login</th><th>Status</th></tr></thead>
							<tbody>{data.staff.map((st, i) => (<tr key={i}><td>{st.name}</td><td>{st.email}</td><td><StatusPill status={st.role} /></td><td>{st.department}</td><td>{fmtDate(st.lastLogin)}</td><td><StatusPill status={st.isActive ? "Active" : "Inactive"} /></td></tr>))}</tbody>
						</table>
					</section>
				)}

				{activeTab === "products" && (
					<section className={s.section}><h3 className={s.sectionTitle}>Product Summary</h3>
						<div className={s.cardGrid}>
							<div className={s.infoCard}><h4 className={s.infoCardTitle}>Micro Loan</h4><p className={s.infoCardMeta}>₦10,000 – ₦500,000 • 15% Flat • 1–12 months</p></div>
							<div className={s.infoCard}><h4 className={s.infoCardTitle}>Salary Advance</h4><p className={s.infoCardMeta}>₦5,000 – ₦200,000 • 12% Flat • 1–3 months</p></div>
							<div className={s.infoCard}><h4 className={s.infoCardTitle}>SME Loan</h4><p className={s.infoCardMeta}>₦100,000 – ₦5,000,000 • 18% Reducing • 6–24 months</p></div>
							<div className={s.infoCard}><h4 className={s.infoCardTitle}>Flex Save</h4><p className={s.infoCardMeta}>Regular Savings • 4% Interest • No withdrawal limit</p></div>
							<div className={s.infoCard}><h4 className={s.infoCardTitle}>Fixed Deposit</h4><p className={s.infoCardMeta}>Fixed Deposit • 10% Interest • 90-day lock</p></div>
							<div className={s.infoCard}><h4 className={s.infoCardTitle}>Target Save</h4><p className={s.infoCardMeta}>Target Savings • 6% Interest • Custom target</p></div>
						</div>
					</section>
				)}
			</div>

			<ConfirmModal open={modal.open} title={modal.title} message={modal.message} variant={modal.variant} confirmLabel={modal.action === "suspend" ? "Suspend" : "Activate"} onConfirm={handleAction} onCancel={() => setModal(m => ({ ...m, open: false }))} />
			{toast.show && <div className={`${s.toast} ${s[toast.variant]}`}>{toast.message}</div>}
		</div>
	);
};
export default OrganizationDetail;
