import type { EntityId, EntityStateStatus, ExtensibleStringUnion, ISODateString } from "./common.types";

export interface LoanProductsListRow {
  id: EntityId;
  name: string;
  code: string;
  organization: string;
  interest_rate: string;
  min_amount: number;
  max_amount: number;
  tenure_range: string;
  requires_guarantor: string;
  status: EntityStateStatus;
  date: ISODateString;
}

export interface LoanProductDetailData {
  id: EntityId;
  name: string;
  code: string;
  description: string;
  organization: string;
  status: string;
  minAmount: number;
  maxAmount: number;
  interestRate: string;
  interestType: string;
  tenureMinMonths: number;
  tenureMaxMonths: number;
  processingFeeRate: string;
  insuranceFeeRate: string;
  lateFeeRate: string;
  lateFeeGraceDays: number;
  minKycLevel: string;
  minCreditScore: number;
  requiresCollateral: boolean;
  requiresGuarantor: boolean;
  decisionModel: string;
  createdAt: ISODateString;
  activeLoans: number;
  totalDisbursed: number;
  defaultRate: string;
  avgRepaymentDays: number;
}

export type LoanRequestDecisionStatus = ExtensibleStringUnion<"Pending" | "Approved" | "Under Review" | "Rejected" | "Converted" | "Cancelled">;

export interface LoanRequestListRow {
  id: EntityId;
  user: string;
  email: string;
  product: string;
  requested_amount: number;
  requested_tenure: string;
  purpose: string;
  decision_status: LoanRequestDecisionStatus;
  approved_amount: number;
  date: ISODateString;
}

export interface LoanRequestDecisionEvent {
  action: string;
  by: string;
  date: ISODateString;
  notes: string;
}

export interface LoanRequestFactor {
  label: string;
  value: string;
  impact: string;
}

export interface LoanRequestDetailData {
  id: EntityId;
  user: string;
  email: string;
  product: string;
  requestedAmount: number;
  requestedTenure: string;
  purpose: string;
  status: string;
  decisionStatus: string;
  decisionAt: ISODateString;
  decisionBy: string;
  decisionReason: string;
  approvedAmount: number;
  approvedTenure: string;
  creditScore: number;
  riskLevel: string;
  decisionModel: string;
  factors: LoanRequestFactor[];
  createdAt: ISODateString;
  timeline: LoanRequestDecisionEvent[];
}

export type LoanStatus = ExtensibleStringUnion<"Active" | "Completed" | "Defaulted" | "Pending" | "Disbursed" | "Rejected" | "Written Off">;

export interface LoansListRow {
  id: EntityId;
  loan_number: string;
  borrower: string;
  organization: string;
  principal: number;
  interest_rate: string;
  tenure: string;
  total_repaid: number;
  status: LoanStatus;
  next_due_date: ISODateString;
  date: ISODateString;
}

export interface LoanScheduleItem {
  installment: number;
  dueDate: ISODateString;
  principal: number;
  interest: number;
  total: number;
  paid: number;
  status: string;
}

export interface LoanPaymentItem {
  id: EntityId;
  amount: number;
  method: string;
  reference: string;
  principalPortion: number;
  interestPortion: number;
  paidAt: ISODateString;
}

export interface LoanGuarantorItem {
  id: EntityId;
  fullName: string;
  phone: string;
  email: string;
  relationship: string;
  guaranteedAmount: number;
  status: string;
}

export interface LoanDetailData {
  id: EntityId;
  loanNumber: string;
  borrower: string;
  borrowerEmail: string;
  organization: string;
  product: string;
  purpose: string;
  status: string;
  principalAmount: number;
  interestRate: string;
  interestType: string;
  tenureMonths: number;
  interestAmount: number;
  processingFee: number;
  insuranceFee: number;
  totalAmountDue: number;
  totalRepaid: number;
  totalOutstanding: number;
  nextDueDate: ISODateString;
  lastPaymentDate: ISODateString;
  disbursementStatus: string;
  disbursedAt: ISODateString;
  disbursedBy: string;
  disbursementAccount: string;
  disbursementBank: string;
  repaymentStatus: string;
  createdAt: ISODateString;
  schedule: LoanScheduleItem[];
  payments: LoanPaymentItem[];
  guarantors: LoanGuarantorItem[];
}
