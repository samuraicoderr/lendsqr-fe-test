import type { EntityId, EntityStateStatus, ExtensibleStringUnion, ISODateString } from "./common.types";

export type FeeCalculationMethod = ExtensibleStringUnion<"Flat" | "Percentage">;

export interface FeesChargesListRow {
  id: EntityId;
  name: string;
  fee_type: string;
  calculation_method: FeeCalculationMethod;
  amount: string;
  scope: string;
  applies_to: string;
  status: EntityStateStatus;
  effective_from: ISODateString;
}

export interface FeeChargeItem {
  date: ISODateString;
  entity: string;
  baseAmount: number;
  feeAmount: number;
  waived: boolean;
  waivedBy: string;
}

export interface FeeDetailData {
  id: EntityId;
  name: string;
  feeType: string;
  scope: string;
  organization: string;
  status: string;
  calcMethod: string;
  flatAmount: number;
  percentageRate: string;
  minAmount: number;
  maxAmount: number;
  minTxnAmount: number;
  maxTxnAmount: number;
  applicableProducts: string[];
  effectiveFrom: ISODateString;
  effectiveTo: ISODateString;
  createdAt: ISODateString;
  totalCharged: number;
  timesApplied: number;
  timesWaived: number;
  recentCharges: FeeChargeItem[];
}
