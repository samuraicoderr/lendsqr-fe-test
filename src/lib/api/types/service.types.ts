import type { EntityId, ExtensibleStringUnion, ISODateString } from "./common.types";

export type ServiceAccountStatus = ExtensibleStringUnion<"Active" | "Inactive" | "Suspended">;

export interface ServiceAccountListRow {
  id: EntityId;
  service: string;
  user: string;
  external_account_id: string;
  provider: string;
  account_type: string;
  status: ServiceAccountStatus;
  last_synced: ISODateString;
  date: ISODateString;
}

export type ServiceStatus = ExtensibleStringUnion<"Active" | "Maintenance" | "Inactive">;

export interface ServicesListRow {
  id: EntityId;
  name: string;
  service_type: string;
  provider: string;
  base_url: string;
  status: ServiceStatus;
  last_health_check: ISODateString;
  uptime: string;
  date: ISODateString;
}

export interface ServiceHealthCheck {
  date: ISODateString;
  status: string;
  latency: string;
}

export interface ServiceDetailData {
  id: EntityId;
  name: string;
  serviceType: string;
  provider: string;
  organization: string;
  status: string;
  baseUrl: string;
  apiVersion: string;
  credentialsStatus: string;
  lastHealthCheckAt: ISODateString;
  lastHealthCheckStatus: string;
  uptimePercent: string;
  linkedAccounts: number;
  createdAt: ISODateString;
  healthHistory: ServiceHealthCheck[];
}
