export const USER_ROLES = [
  "participant",
  "instructor",
  "organization_manager",
  "admin",
] as const;

export const PROGRAM_STATUSES = [
  "draft",
  "published",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const ENROLLMENT_STATUSES = [
  "pending",
  "accepted",
  "active",
  "completed",
  "withdrawn",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

function parseValue<const T extends readonly string[]>(
  values: T,
  value: string,
  label: string,
): T[number] {
  if (!values.includes(value)) {
    throw new Error(`Unknown ${label}: ${value}`);
  }

  return value as T[number];
}

export function parseUserRole(value: string): UserRole {
  return parseValue(USER_ROLES, value, "user role");
}

export function parseProgramStatus(value: string): ProgramStatus {
  return parseValue(PROGRAM_STATUSES, value, "program status");
}

export function parseEnrollmentStatus(value: string): EnrollmentStatus {
  return parseValue(ENROLLMENT_STATUSES, value, "enrollment status");
}

export function canEditClassBoxVersion(status: ProgramStatus): boolean {
  return status === "draft" || status === "published";
}
