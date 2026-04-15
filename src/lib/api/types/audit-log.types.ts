import type { EntityId, ISODateString } from "./common.types";

export interface AuditLogListRow {
  id: EntityId;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  ip_address: string;
  user_agent: string;
  changes_summary: string;
  date: ISODateString;
}

export interface AuditLogDetailData {
  id: EntityId;
  actorType: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: Record<string, string>;
  newValues: Record<string, string>;
  ipAddress: string;
  userAgent: string;
  requestId: string;
  createdAt: ISODateString;
}
