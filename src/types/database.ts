import type { EnrollmentStatus, ProgramStatus, UserRole } from "@/lib/domain";

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type BaseRow = { id: string; created_at: string; updated_at: string };

export type Database = {
  public: {
    Tables: {
      profiles: Table<BaseRow & { display_name: string; role: UserRole }>;
      organizations: Table<BaseRow & { name: string; slug: string; city: string; address: string | null }>;
      organization_members: Table<BaseRow & { organization_id: string; profile_id: string; role: UserRole }>;
      class_boxes: Table<BaseRow & { name: string; slug: string; summary: string; created_by: string | null }>;
      class_box_versions: Table<BaseRow & { class_box_id: string; version: string; status: ProgramStatus; curriculum: Json; measurement_definition: Json; safety_rules: Json; published_at: string | null }>;
      programs: Table<BaseRow & { organization_id: string; class_box_version_id: string; title: string; slug: string; description: string; location: string; starts_on: string; ends_on: string; capacity: number; status: ProgramStatus; application_opens_at: string | null; application_closes_at: string | null }>;
      program_instructors: Table<BaseRow & { program_id: string; instructor_id: string }>;
      enrollments: Table<BaseRow & { program_id: string; participant_id: string; status: EnrollmentStatus; operational_notes: string | null; applied_at: string }>;
      sessions: Table<BaseRow & { program_id: string; sequence: number; title: string; lesson_reference: string; starts_at: string; ends_at: string }>;
      consents: Table<BaseRow & { enrollment_id: string; consent_type: string; document_version: string; accepted: boolean; accepted_at: string }>;
      assessments: Table<BaseRow & { enrollment_id: string; assessment_type: "pre" | "periodic" | "post"; responses: Json; score: number | null; submitted_at: string }>;
      attendance: Table<BaseRow & { session_id: string; enrollment_id: string; attended: boolean; checked_in_at: string | null; recorded_by: string }>;
      session_notes: Table<BaseRow & { session_id: string; author_id: string; note: string; needs_admin_review: boolean }>;
      practice_logs: Table<BaseRow & { enrollment_id: string; practiced_on: string; minutes: number; completed: boolean }>;
      recommendations: Table<BaseRow & { enrollment_id: string; recommendation: string; source_category: string; policy_version: string; model_identifier: string | null; reviewer_state: "not_required" | "pending" | "approved" | "rejected"; generated_at: string }>;
      reports: Table<BaseRow & { program_id: string; enrollment_id: string | null; report_type: "participant" | "organization"; metrics: Json; draft_text: string | null; generation_metadata: Json }>;
      audit_events: Table<{ id: string; actor_id: string | null; organization_id: string | null; event_type: string; entity_type: string; entity_id: string | null; metadata: Json; created_at: string }>;
    };
    Views: {
      public_programs: {
        Row: { id: string; title: string; slug: string; description: string; location: string; starts_on: string; ends_on: string; capacity: number; organization_name: string; class_box_name: string };
        Relationships: [];
      };
    };
    Functions: {
      apply_to_program: {
        Args: { target_program_id: string };
        Returns: { enrollment_id: string; enrollment_status: EnrollmentStatus }[];
      };
    };
    Enums: {
      user_role: UserRole;
      program_status: ProgramStatus;
      enrollment_status: EnrollmentStatus;
      assessment_type: "pre" | "periodic" | "post";
      report_type: "participant" | "organization";
    };
    CompositeTypes: Record<string, never>;
  };
};
