import type { EntityId, ExtensibleStringUnion, ISODateString } from "./common.types";

export type TransactionStatus = ExtensibleStringUnion<"Completed" | "Processing" | "Failed" | "Pending">;

export interface TransactionsListRow {
  id: EntityId;
  reference: string;
  user: string;
  transaction_type: string;
  amount: number;
  currency: string;
  channel: string;
  description: string;
  status: TransactionStatus;
  date: ISODateString;
}

export interface TransactionTimelineEvent {
  action: string;
  date: ISODateString;
  details: string;
}

export interface TransactionDetailData {
  id: EntityId;
  reference: string;
  type: string;
  user: string;
  userEmail: string;
  organization: string;
  amount: number;
  currency: string;
  status: string;
  sourceType: string;
  sourceAccount: string;
  destType: string;
  destAccount: string;
  processedAt: ISODateString;
  completedAt: ISODateString;
  failedAt: ISODateString;
  failureReason: string;
  ipAddress: string;
  userAgent: string;
  createdAt: ISODateString;
  timeline: TransactionTimelineEvent[];
}
