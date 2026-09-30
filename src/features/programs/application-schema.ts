import { z } from "zod";

export const applicationSchema = z.object({
  programId: z.uuid(),
  displayName: z.string().trim().min(2).max(80),
  serviceConsentVersion: z.string().min(1).max(30),
  serviceConsent: z.literal(true),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
