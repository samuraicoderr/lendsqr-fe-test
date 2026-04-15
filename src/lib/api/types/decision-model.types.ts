import type { EntityId, EntityStateStatus, ExtensibleStringUnion, ISODateString } from "./common.types";

export type DecisionModelType = ExtensibleStringUnion<"Scorecard" | "Rule Based" | "Machine Learning" | "Hybrid">;

export interface DecisionModelListRow {
  id: EntityId;
  name: string;
  version: string;
  model_type: DecisionModelType;
  organization: string;
  is_default: string;
  required_data_points: number;
  status: EntityStateStatus;
  created_by: string;
  date: ISODateString;
}

export interface DecisionModelFactor {
  name: string;
  weight: string;
  description: string;
}

export interface DecisionModelDetailData {
  id: EntityId;
  name: string;
  modelType: string;
  version: string;
  organization: string;
  status: string;
  description: string;
  minCreditScore: number;
  maxDebtRatio: number;
  minAccountAge: string;
  factors: DecisionModelFactor[];
  linkedProducts: string[];
  totalDecisions: number;
  approvalRate: string;
  avgProcessingTime: string;
  createdBy: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
