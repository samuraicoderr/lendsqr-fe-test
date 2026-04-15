import type { TransactionDetailData, TransactionsListRow } from "@/lib/api/types/transaction.types";

export const transactionsListData: TransactionsListRow[] = [
  { id: "1", reference: "TXN-20260410-001", user: "Adeyemi Okafor", transaction_type: "Loan Disbursement", amount: 250000, currency: "NGN", channel: "Bank Transfer", description: "Micro loan disbursement", status: "Completed", date: "2026-04-10T09:30:00" },
  { id: "2", reference: "TXN-20260410-002", user: "Tolani Bakare", transaction_type: "Loan Repayment", amount: 45000, currency: "NGN", channel: "Card Payment", description: "Monthly repayment", status: "Completed", date: "2026-04-10T10:15:00" },
  { id: "3", reference: "TXN-20260409-003", user: "Obinna Chukwu", transaction_type: "Savings Deposit", amount: 100000, currency: "NGN", channel: "Bank Transfer", description: "Fixed deposit", status: "Completed", date: "2026-04-09T14:20:00" },
  { id: "4", reference: "TXN-20260409-004", user: "Khadija Ibrahim", transaction_type: "Savings Withdrawal", amount: 50000, currency: "NGN", channel: "Bank Transfer", description: "Partial withdrawal", status: "Processing", date: "2026-04-09T16:45:00" },
  { id: "5", reference: "TXN-20260408-005", user: "David Nwankwo", transaction_type: "Loan Repayment", amount: 75000, currency: "NGN", channel: "USSD", description: "Overdue payment", status: "Failed", date: "2026-04-08T11:00:00" },
  { id: "6", reference: "TXN-20260408-006", user: "Favour Adichie", transaction_type: "Fee Payment", amount: 2500, currency: "NGN", channel: "Auto Debit", description: "Late payment fee", status: "Completed", date: "2026-04-08T12:30:00" },
  { id: "7", reference: "TXN-20260407-007", user: "Kingsley Obi", transaction_type: "Loan Disbursement", amount: 500000, currency: "NGN", channel: "Bank Transfer", description: "Business loan disbursement", status: "Completed", date: "2026-04-07T08:00:00" },
  { id: "8", reference: "TXN-20260407-008", user: "Gloria Osei", transaction_type: "Savings Deposit", amount: 25000, currency: "NGN", channel: "Card Payment", description: "Regular savings", status: "Completed", date: "2026-04-07T09:45:00" },
  { id: "9", reference: "TXN-20260406-009", user: "Samuel Ogundipe", transaction_type: "Loan Repayment", amount: 120000, currency: "NGN", channel: "Bank Transfer", description: "Quarterly repayment", status: "Completed", date: "2026-04-06T13:20:00" },
  { id: "10", reference: "TXN-20260406-010", user: "Josephine Nwosu", transaction_type: "Savings Withdrawal", amount: 200000, currency: "NGN", channel: "Bank Transfer", description: "Target savings payout", status: "Completed", date: "2026-04-06T15:10:00" },
  { id: "11", reference: "TXN-20260405-011", user: "Ibrahim Bello", transaction_type: "Fee Payment", amount: 1500, currency: "NGN", channel: "Auto Debit", description: "Processing fee", status: "Completed", date: "2026-04-05T10:45:00" },
  { id: "12", reference: "TXN-20260405-012", user: "Mary Johnson", transaction_type: "Loan Disbursement", amount: 150000, currency: "NGN", channel: "Bank Transfer", description: "Salary advance", status: "Pending", date: "2026-04-05T11:30:00" },
];

const baseDetail: Omit<TransactionDetailData, "id" | "reference" | "type" | "user" | "userEmail" | "organization" | "amount" | "currency" | "status" | "sourceAccount" | "destAccount" | "processedAt" | "completedAt" | "failedAt" | "failureReason" | "createdAt"> = {
  sourceType: "Bank Account",
  destType: "Loan Account",
  ipAddress: "102.89.23.45",
  userAgent: "Chrome/120 (iPhone)",
  timeline: [
    { action: "Transaction Created", date: "2026-04-12T04:29:55", details: "Payment initiated by Adeyemi Okafor via mobile app" },
    { action: "Processing", date: "2026-04-12T04:30:00", details: "Payment sent to GTBank for processing" },
    { action: "Completed", date: "2026-04-12T04:30:05", details: "Payment confirmed and credited to loan account LN-2023-001" },
  ],
};

export function getTransactionDetailById(id: string): TransactionDetailData | null {
  const row = transactionsListData.find((item) => item.id === id);
  if (!row) {
    return null;
  }

  return {
    ...baseDetail,
    id,
    reference: row.reference,
    type: row.transaction_type,
    user: row.user,
    userEmail: `${row.user.split(" ")[0].toLowerCase()}@lendsqr.com`,
    organization: row.user.includes("Khadija") ? "Lendsqr Labs" : row.user.includes("Tolani") ? "Lendsqr Finance" : "Lendsqr HQ",
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    sourceAccount: `${row.channel} •••• 6789`,
    destAccount: row.transaction_type.includes("Loan") ? "LN-2023-001" : row.transaction_type.includes("Savings") ? "SV-2023-001" : "FEE-2023-001",
    processedAt: row.date,
    completedAt: row.status === "Completed" ? row.date : "",
    failedAt: row.status === "Failed" ? row.date : "",
    failureReason: row.status === "Failed" ? "Insufficient balance" : "",
    createdAt: row.date,
  };
}
