import type { EntityId, ISODateString } from "./common.types";

export interface ReportsListRow {
  id: EntityId;
  name: string;
  report_type: string;
  schedule: string;
  format: string;
  generated_by: string;
  last_generated: ISODateString;
  file_size: string;
  status: string;
  date: ISODateString;
}

export interface ReportExecutionItem {
  id: EntityId;
  status: string;
  startedAt: ISODateString;
  completedAt: ISODateString;
  triggeredBy: string;
  resultUrl: string;
}

export interface ReportDetailData {
  id: EntityId;
  name: string;
  reportType: string;
  description: string;
  organization: string;
  status: string;
  parameters: string;
  schedule: string;
  nextRunAt: ISODateString;
  format: string;
  lastGeneratedAt: ISODateString;
  lastGeneratedUrl: string;
  createdBy: string;
  createdAt: ISODateString;
  executions: ReportExecutionItem[];
}
