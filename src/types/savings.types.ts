import type { EntityId, EntityStateStatus, ExtensibleStringUnion, ISODateString } from "./common.types";

export type SavingsStatus = ExtensibleStringUnion<"Active" | "Closed" | "Dormant" | "Frozen">;

export interface SavingsListRow {
  id: EntityId;
  account_number: string;
  account_name: string;
  product: string;
  organization: string;
  balance: number;
  target_amount: number;
  interest_earned: number;
  status: SavingsStatus;
  date: ISODateString;
}

export interface SavingsTransaction {
  id: EntityId;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  date: ISODateString;
}

export interface SavingsDetailData {
  id: EntityId;
  accountNumber: string;
  accountName: string;
  product: string;
  productType: string;
  organization: string;
  status: string;
  balance: number;
  availableBalance: number;
  lockedAmount: number;
  interestEarned: number;
  interestPaid: number;
  interestRate: string;
  interestCalcMethod: string;
  interestPayoutFreq: string;
  minBalance: number;
  withdrawalRestricted: boolean;
  withdrawalNoticeDays: number;
  targetAmount: number;
  targetDate: ISODateString;
  targetName: string;
  openedAt: ISODateString;
  transactions: SavingsTransaction[];
}

export interface SavingsProductsListRow {
  id: EntityId;
  name: string;
  code: string;
  product_type: string;
  organization: string;
  interest_rate: string;
  min_balance: number;
  withdrawal_limit: string;
  status: EntityStateStatus;
  date: ISODateString;
}

export interface SavingsProductDetailData {
  id: EntityId;
  name: string;
  code: string;
  description: string;
  productType: string;
  organization: string;
  status: string;
  interestRate: string;
  interestCalcMethod: string;
  interestPayoutFreq: string;
  minBalance: number;
  minDeposit: number;
  maxDeposit: number;
  maxBalance: number;
  withdrawalRestricted: boolean;
  withdrawalNoticeDays: number;
  earlyWithdrawalPenalty: string;
  allowsTarget: boolean;
  minTargetAmount: number;
  maxTargetDurationMonths: number;
  createdAt: ISODateString;
  activeAccounts: number;
  totalDeposits: number;
  totalInterestPaid: number;
}
