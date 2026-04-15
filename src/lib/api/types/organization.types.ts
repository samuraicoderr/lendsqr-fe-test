import type { EntityId, ExtensibleStringUnion, ISODateString } from "./common.types";

export type OrganizationStatus = ExtensibleStringUnion<"Active" | "Pending" | "Suspended" | "Inactive">;

export interface OrganizationListRow {
  id: EntityId;
  name: string;
  email: string;
  phone: string;
  industry: string;
  registration_number: string;
  state: string;
  status: OrganizationStatus;
  date: ISODateString;
}

export interface OrganizationBranchItem {
  name: string;
  code: string;
  city: string;
  state: string;
  manager: string;
  isActive: boolean;
}

export interface OrganizationStaffItem {
  name: string;
  email: string;
  role: string;
  department: string;
  lastLogin: ISODateString;
  isActive: boolean;
}

export interface OrganizationDetailData {
  id: EntityId;
  name: string;
  slug: string;
  email: string;
  phone: string;
  website: string;
  registrationNumber: string;
  taxId: string;
  industry: string;
  address: string;
  city: string;
  state: string;
  country: string;
  status: string;
  createdAt: ISODateString;
  totalUsers: number;
  totalLoans: number;
  totalSavingsAccounts: number;
  activeProducts: number;
  branches: OrganizationBranchItem[];
  staff: OrganizationStaffItem[];
}
