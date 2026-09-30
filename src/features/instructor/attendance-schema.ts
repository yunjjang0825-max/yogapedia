import { z } from "zod";
export const attendanceBatchSchema=z.object({sessionId:z.uuid(),rows:z.array(z.object({enrollmentId:z.uuid(),attended:z.boolean()})).max(200)}).superRefine((v,c)=>{if(new Set(v.rows.map(r=>r.enrollmentId)).size!==v.rows.length)c.addIssue({code:"custom",message:"Duplicate enrollment"});});
export const sessionNoteSchema=z.object({sessionId:z.uuid(),note:z.string().trim().min(1).max(1000),needsAdminReview:z.boolean().default(false)});
