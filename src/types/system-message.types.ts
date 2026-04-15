import type { EntityId, ExtensibleStringUnion, ISODateString } from "./common.types";

export type SystemMessageStatus = ExtensibleStringUnion<"Sent" | "Scheduled" | "Draft">;

export interface SystemsMessagesListRow {
  id: EntityId;
  title: string;
  message_type: string;
  priority: string;
  target_audience: string;
  channels: string;
  status: SystemMessageStatus;
  scheduled_at: ISODateString;
  sent_at: ISODateString;
  date: ISODateString;
}

export interface SystemMessageDeliveryStat {
  channel: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export interface SystemMessageDetailData {
  id: EntityId;
  title: string;
  messageType: string;
  priority: string;
  content: string;
  targetAudience: string;
  channels: string[];
  scheduledAt: ISODateString;
  expiresAt: ISODateString;
  sentAt: ISODateString;
  sentCount: number;
  status: string;
  createdBy: string;
  createdAt: ISODateString;
  deliveryStats: SystemMessageDeliveryStat[];
}
