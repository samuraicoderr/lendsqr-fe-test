import type { EntityId, ExtensibleStringUnion, ISODateString } from "./common.types";

export type SettlementStatus = ExtensibleStringUnion<"Completed" | "Processing" | "Pending">;

export interface SettlementsListRow {
  id: EntityId;
  period_start: ISODateString;
  period_end: ISODateString;
  organization: string;
  total_transactions: number;
  total_amount: number;
  total_fees: number;
  net_amount: number;
  status: SettlementStatus;
  settled_at: ISODateString;
}

export interface SettlementTransactionItem {
  reference: string;
  type: string;
  amount: number;
  date: ISODateString;
}

export interface SettlementDetailData {
  id: EntityId;
  organization: string;
  periodStart: ISODateString;
  periodEnd: ISODateString;
  totalTransactions: number;
  totalAmount: number;
  totalFees: number;
  netAmount: number;
  status: string;
  settledAt: ISODateString;
  settlementReference: string;
  bankAccount: string;
  bankName: string;
  bankCode: string;
  createdAt: ISODateString;
  transactions: SettlementTransactionItem[];
}
