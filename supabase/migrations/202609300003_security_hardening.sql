create function public.protect_profile_role() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only administrators may change roles';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
before update on public.profiles
for each row execute function public.protect_profile_role();

create policy profiles_insert_self on public.profiles for insert
with check (id = auth.uid() and role = 'participant');

create function public.validate_attendance_program() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (
    select 1 from public.sessions s
    join public.enrollments e on e.program_id = s.program_id
    where s.id = new.session_id and e.id = new.enrollment_id
  ) then
    raise exception 'Session and enrollment must belong to the same program';
  end if;
  return new;
end;
$$;

create trigger attendance_same_program
before insert or update on public.attendance
for each row execute function public.validate_attendance_program();

create function public.apply_to_program(target_program_id uuid)
returns table (enrollment_id uuid, enrollment_status public.enrollment_status)
language plpgsql security definer set search_path = '' as $$
declare target public.programs;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  select * into target from public.programs
  where id = target_program_id for update;

  if target.id is null or target.status <> 'published' then
    raise exception 'Program is not open';
  end if;
  if target.application_opens_at is not null and now() < target.application_opens_at then
    raise exception 'Applications have not opened';
  end if;
  if target.application_closes_at is not null and now() > target.application_closes_at then
    raise exception 'Applications are closed';
  end if;
  if not exists (select 1 from public.enrollments where program_id = target_program_id and participant_id = auth.uid())
     and (select count(*) from public.enrollments where program_id = target_program_id and status <> 'withdrawn') >= target.capacity then
    raise exception 'Program is full';
  end if;

  insert into public.enrollments (program_id, participant_id)
  values (target_program_id, auth.uid())
  on conflict (program_id, participant_id) do nothing;

  return query select e.id, e.status from public.enrollments e
  where e.program_id = target_program_id and e.participant_id = auth.uid();
end;
$$;

revoke execute on function public.apply_to_program(uuid) from public, anon;
grant execute on function public.apply_to_program(uuid) to authenticated;

drop view public.public_programs;
create view public.public_programs as
select p.id, p.title, p.slug, p.description, p.location, p.starts_on, p.ends_on, p.capacity,
       o.name as organization_name, cb.name as class_box_name
from public.programs p
join public.organizations o on o.id = p.organization_id
join public.class_box_versions cbv on cbv.id = p.class_box_version_id
join public.class_boxes cb on cb.id = cbv.class_box_id
where p.status = 'published';

revoke select on public.programs, public.organizations, public.class_box_versions, public.class_boxes from anon;
grant select on public.public_programs to anon, authenticated;
grant select, insert, update on all tables in schema public to authenticated;

create unique index reports_one_organization_version
on public.reports (program_id, report_type)
where enrollment_id is null and report_type = 'organization';
