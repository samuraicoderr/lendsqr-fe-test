import type { EntityId, ExtensibleStringUnion, ISODateString } from "./common.types";

export type GuarantorVerificationStatus = ExtensibleStringUnion<"Verified" | "Pending" | "Rejected" | "Expired">;

export interface GuarantorListRow {
  id: EntityId;
  full_name: string;
  email: string;
  phone_number: string;
  relationship: string;
  employer: string;
  verification_status: GuarantorVerificationStatus;
  active_guarantees: number;
  total_guaranteed: string;
  date: ISODateString;
}

export interface GuaranteeItem {
  loanNumber: string;
  borrower: string;
  amount: number;
  status: string;
  dueDate: ISODateString;
}

export interface VerificationEvent {
  action: string;
  by: string;
  date: ISODateString;
  notes: string;
}

export interface GuarantorDetailData {
  id: EntityId;
  fullName: string;
  email: string;
  phone: string;
  relationship: string;
  address: string;
  occupation: string;
  employer: string;
  bvn: string;
  verificationStatus: string;
  verifiedAt: ISODateString;
  maxGuaranteeAmount: number;
  activeGuaranteesCount: number;
  totalGuaranteedAmount: number;
  createdAt: ISODateString;
  guarantees: GuaranteeItem[];
  verificationHistory: VerificationEvent[];
}
