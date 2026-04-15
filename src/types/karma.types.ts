import type { EntityId, ExtensibleStringUnion, ISODateString } from "./common.types";

export type KarmaBlacklistStatus = ExtensibleStringUnion<"Clean" | "Blacklisted">;

export interface KarmaListRow {
  id: EntityId;
  user: string;
  email: string;
  karma_score: number;
  event_type: string;
  points_change: number;
  reference_type: string;
  blacklist_status: KarmaBlacklistStatus;
  date: ISODateString;
}
