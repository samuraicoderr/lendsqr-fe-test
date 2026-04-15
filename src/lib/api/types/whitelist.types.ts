import type { EntityId, ISODateString } from "./common.types";

export interface WhitelistListRow {
  id: EntityId;
  entity_type: string;
  entity_value: string;
  reason: string;
  added_by: string;
  organization: string;
  expires_at: ISODateString;
  date: ISODateString;
}
