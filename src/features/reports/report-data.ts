export type AggregateReportData={programTitle:string;metrics:{enrollmentCount:number;completionRate:number;attendanceRate:number;pairedChange:number|null}};
export function buildAggregateReportData(programTitle:string,metrics:AggregateReportData["metrics"]):AggregateReportData{return{programTitle,metrics};}
