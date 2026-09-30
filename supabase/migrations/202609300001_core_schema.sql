create extension if not exists pgcrypto;

create type public.user_role as enum ('participant', 'instructor', 'organization_manager', 'admin');
create type public.program_status as enum ('draft', 'published', 'in_progress', 'completed', 'cancelled');
create type public.enrollment_status as enum ('pending', 'accepted', 'active', 'completed', 'withdrawn');
create type public.assessment_type as enum ('pre', 'periodic', 'post');
create type public.report_type as enum ('participant', 'organization');

create function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'participant',
  display_name text not null check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city text not null default 'Busan',
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.user_role not null check (role in ('instructor', 'organization_manager')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id, role)
);

create table public.class_boxes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  summary text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.class_box_versions (
  id uuid primary key default gen_random_uuid(),
  class_box_id uuid not null references public.class_boxes(id) on delete cascade,
  version text not null,
  status public.program_status not null default 'draft' check (status in ('draft', 'published')),
  curriculum jsonb not null default '[]'::jsonb check (jsonb_typeof(curriculum) = 'array'),
  measurement_definition jsonb not null default '{}'::jsonb,
  safety_rules jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_box_id, version)
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  class_box_version_id uuid not null references public.class_box_versions(id),
  title text not null,
  slug text not null unique,
  description text not null,
  location text not null,
  starts_on date not null,
  ends_on date not null check (ends_on >= starts_on),
  capacity integer not null check (capacity between 1 and 200),
  status public.program_status not null default 'draft',
  application_opens_at timestamptz,
  application_closes_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.program_instructors (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_id, instructor_id)
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  sequence integer not null check (sequence > 0),
  title text not null,
  lesson_reference text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_id, sequence)
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  participant_id uuid not null references public.profiles(id) on delete cascade,
  status public.enrollment_status not null default 'pending',
  operational_notes text,
  applied_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_id, participant_id)
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  consent_type text not null check (consent_type in ('service', 'outcome_analysis', 'testimonial')),
  document_version text not null,
  accepted boolean not null,
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enrollment_id, consent_type, document_version)
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  assessment_type public.assessment_type not null,
  responses jsonb not null default '{}'::jsonb,
  score numeric,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enrollment_id, assessment_type)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  attended boolean not null,
  checked_in_at timestamptz,
  recorded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, enrollment_id)
);

create table public.session_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  note text not null,
  needs_admin_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.practice_logs (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  practiced_on date not null,
  minutes integer not null check (minutes between 0 and 360),
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enrollment_id, practiced_on)
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  recommendation text not null,
  source_category text not null,
  policy_version text not null,
  model_identifier text,
  reviewer_state text not null default 'not_required' check (reviewer_state in ('not_required', 'pending', 'approved', 'rejected')),
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  enrollment_id uuid references public.enrollments(id) on delete cascade,
  report_type public.report_type not null,
  metrics jsonb not null default '{}'::jsonb,
  draft_text text,
  generation_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((report_type = 'participant' and enrollment_id is not null) or (report_type = 'organization' and enrollment_id is null))
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  organization_id uuid references public.organizations(id),
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger class_boxes_updated_at before update on public.class_boxes for each row execute function public.set_updated_at();
create trigger class_box_versions_updated_at before update on public.class_box_versions for each row execute function public.set_updated_at();
create trigger programs_updated_at before update on public.programs for each row execute function public.set_updated_at();
create trigger enrollments_updated_at before update on public.enrollments for each row execute function public.set_updated_at();

create function public.prevent_used_class_box_version_changes() returns trigger language plpgsql as $$
begin
  if exists (
    select 1 from public.programs
    where class_box_version_id = old.id and status in ('in_progress', 'completed')
  ) then
    raise exception 'A ClassBox version used by a started program is immutable';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger class_box_versions_immutable
before update or delete on public.class_box_versions
for each row execute function public.prevent_used_class_box_version_changes();
