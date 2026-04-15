import type { LoanDetailData, LoansListRow } from "@/lib/api/types/loan.types";

export const loansListData: LoansListRow[] = [
  { id: "1", loan_number: "LN-2023-001", borrower: "Adeyemi Okafor", organization: "Lendsqr HQ", principal: 250000, interest_rate: "15%", tenure: "6 months", total_repaid: 125000, status: "Active", next_due_date: "2026-05-01", date: "2023-06-15" },
  { id: "2", loan_number: "LN-2023-002", borrower: "Tolani Bakare", organization: "Lendsqr Finance", principal: 500000, interest_rate: "12%", tenure: "12 months", total_repaid: 500000, status: "Completed", next_due_date: "", date: "2023-03-20" },
  { id: "3", loan_number: "LN-2023-003", borrower: "Obinna Chukwu", organization: "Lendsqr HQ", principal: 100000, interest_rate: "18%", tenure: "3 months", total_repaid: 0, status: "Defaulted", next_due_date: "2024-01-15", date: "2023-10-01" },
  { id: "4", loan_number: "LN-2023-004", borrower: "Khadija Ibrahim", organization: "Lendsqr Labs", principal: 750000, interest_rate: "10%", tenure: "24 months", total_repaid: 200000, status: "Active", next_due_date: "2026-04-20", date: "2024-01-10" },
  { id: "5", loan_number: "LN-2023-005", borrower: "David Nwankwo", organization: "Lendsqr HQ", principal: 300000, interest_rate: "15%", tenure: "6 months", total_repaid: 0, status: "Pending", next_due_date: "", date: "2024-02-05" },
  { id: "6", loan_number: "LN-2024-006", borrower: "Favour Adichie", organization: "Lendsqr Finance", principal: 1000000, interest_rate: "8%", tenure: "36 months", total_repaid: 450000, status: "Active", next_due_date: "2026-04-25", date: "2024-03-12" },
  { id: "7", loan_number: "LN-2024-007", borrower: "Kingsley Obi", organization: "Lendsqr HQ", principal: 150000, interest_rate: "20%", tenure: "3 months", total_repaid: 150000, status: "Completed", next_due_date: "", date: "2024-04-01" },
  { id: "8", loan_number: "LN-2024-008", borrower: "Gloria Osei", organization: "Lendsqr Labs", principal: 400000, interest_rate: "14%", tenure: "12 months", total_repaid: 100000, status: "Active", next_due_date: "2026-05-10", date: "2024-05-20" },
  { id: "9", loan_number: "LN-2024-009", borrower: "Samuel Ogundipe", organization: "Lendsqr Finance", principal: 200000, interest_rate: "16%", tenure: "6 months", total_repaid: 0, status: "Disbursed", next_due_date: "2026-04-30", date: "2024-06-08" },
  { id: "10", loan_number: "LN-2024-010", borrower: "Josephine Nwosu", organization: "Lendsqr HQ", principal: 80000, interest_rate: "22%", tenure: "3 months", total_repaid: 80000, status: "Completed", next_due_date: "", date: "2024-07-15" },
  { id: "11", loan_number: "LN-2024-011", borrower: "Ibrahim Bello", organization: "Lendsqr Labs", principal: 600000, interest_rate: "11%", tenure: "18 months", total_repaid: 150000, status: "Active", next_due_date: "2026-05-05", date: "2024-08-22" },
  { id: "12", loan_number: "LN-2024-012", borrower: "Mary Johnson", organization: "Lendsqr Finance", principal: 350000, interest_rate: "13%", tenure: "12 months", total_repaid: 0, status: "Rejected", next_due_date: "", date: "2024-09-10" },
  { id: "13", loan_number: "LN-2024-013", borrower: "Chidi Anekwe", organization: "Lendsqr HQ", principal: 450000, interest_rate: "15%", tenure: "12 months", total_repaid: 50000, status: "Active", next_due_date: "2026-04-18", date: "2024-10-05" },
  { id: "14", loan_number: "LN-2025-014", borrower: "Queen Adeleke", organization: "Lendsqr Labs", principal: 120000, interest_rate: "19%", tenure: "6 months", total_repaid: 0, status: "Written Off", next_due_date: "", date: "2025-01-20" },
];

const baseDetail: Omit<LoanDetailData, "id" | "loanNumber" | "borrower" | "organization" | "status" | "principalAmount" | "interestRate" | "totalRepaid" | "nextDueDate" | "createdAt" | "totalOutstanding"> = {
  borrowerEmail: "adeyemi@lendsqr.com",
  product: "Micro Loan",
  purpose: "Business expansion — purchase of additional inventory for retail shop.",
  interestType: "Flat",
  tenureMonths: 6,
  interestAmount: 37500,
  processingFee: 3750,
  insuranceFee: 1250,
  totalAmountDue: 292500,
  lastPaymentDate: "2026-04-01",
  disbursementStatus: "Disbursed",
  disbursedAt: "2023-06-15T10:30:00",
  disbursedBy: "Jane Okafor",
  disbursementAccount: "0123456789",
  disbursementBank: "GTBank",
  repaymentStatus: "On Track",
  schedule: [
    { installment: 1, dueDate: "2023-07-15", principal: 41667, interest: 6250, total: 47917, paid: 47917, status: "Paid" },
    { installment: 2, dueDate: "2023-08-15", principal: 41667, interest: 6250, total: 47917, paid: 47917, status: "Paid" },
    { installment: 3, dueDate: "2023-09-15", principal: 41667, interest: 6250, total: 47917, paid: 29166, status: "Late" },
    { installment: 4, dueDate: "2023-10-15", principal: 41667, interest: 6250, total: 47917, paid: 0, status: "Pending" },
    { installment: 5, dueDate: "2023-11-15", principal: 41667, interest: 6250, total: 47917, paid: 0, status: "Pending" },
    { installment: 6, dueDate: "2023-12-15", principal: 41665, interest: 6250, total: 47915, paid: 0, status: "Pending" },
  ],
  payments: [
    { id: "p1", amount: 47917, method: "Bank Transfer", reference: "PAY-001-2023", principalPortion: 41667, interestPortion: 6250, paidAt: "2023-07-14T09:00:00" },
    { id: "p2", amount: 47917, method: "Card Payment", reference: "PAY-002-2023", principalPortion: 41667, interestPortion: 6250, paidAt: "2023-08-15T11:30:00" },
    { id: "p3", amount: 29166, method: "Bank Transfer", reference: "PAY-003-2023", principalPortion: 22916, interestPortion: 6250, paidAt: "2023-09-20T14:00:00" },
  ],
  guarantors: [
    { id: "g1", fullName: "Debby Ogana", phone: "+234 803 100 0001", email: "debby@gmail.com", relationship: "Sister", guaranteedAmount: 125000, status: "Active" },
    { id: "g2", fullName: "Emeka Okafor", phone: "+234 803 100 0002", email: "emeka.o@yahoo.com", relationship: "Brother", guaranteedAmount: 125000, status: "Active" },
  ],
};

export function getLoanDetailById(id: string): LoanDetailData | null {
  const row = loansListData.find((item) => item.id === id);
  if (!row) {
    return null;
  }

  const totalOutstanding = Math.max(baseDetail.totalAmountDue - row.total_repaid, 0);

  return {
    ...baseDetail,
    id,
    loanNumber: row.loan_number,
    borrower: row.borrower,
    organization: row.organization,
    status: row.status,
    principalAmount: row.principal,
    interestRate: row.interest_rate,
    totalRepaid: row.total_repaid,
    nextDueDate: row.next_due_date,
    createdAt: row.date,
    totalOutstanding,
  };
}
